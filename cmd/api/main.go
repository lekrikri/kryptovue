// api : REST (prix, candles) + SSE temps réel alimenté par crypto.trades.
package main

import (
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"sync"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/twmb/franz-go/pkg/kgo"

	"github.com/lekrikri/kryptovue/internal/analytics"
	"github.com/lekrikri/kryptovue/internal/config"
	"github.com/lekrikri/kryptovue/internal/metrics"
	"github.com/lekrikri/kryptovue/internal/model"
	"github.com/lekrikri/kryptovue/internal/store"
)

// hub diffuse chaque message Kafka à tous les abonnés SSE connectés.
type hub struct {
	mu   sync.Mutex
	subs map[chan []byte]struct{}
}

func newHub() *hub { return &hub{subs: make(map[chan []byte]struct{})} }

func (h *hub) subscribe() chan []byte {
	ch := make(chan []byte, 64)
	h.mu.Lock()
	h.subs[ch] = struct{}{}
	h.mu.Unlock()
	return ch
}

func (h *hub) unsubscribe(ch chan []byte) {
	h.mu.Lock()
	delete(h.subs, ch)
	h.mu.Unlock()
}

func (h *hub) broadcast(msg []byte) {
	h.mu.Lock()
	defer h.mu.Unlock()
	for ch := range h.subs {
		select {
		case ch <- msg:
		default: // abonné trop lent : on saute le message plutôt que bloquer
		}
	}
}

func main() {
	cfg := config.Load()

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	db, err := store.New(ctx, cfg.DatabaseURL)
	if err != nil {
		slog.Error("connexion TimescaleDB", "err", err)
		os.Exit(1)
	}
	defer db.Close()

	h := newHub()
	go consumeTrades(ctx, cfg, h)
	go metrics.Serve(ctx, cfg.MetricsAddr)

	router := gin.New()
	router.Use(gin.Recovery(), metricsMiddleware())

	router.GET("/health", func(c *gin.Context) {
		status := "healthy"
		code := http.StatusOK
		if err := db.Ping(c.Request.Context()); err != nil {
			status, code = "database unreachable", http.StatusServiceUnavailable
		}
		c.JSON(code, gin.H{"status": status, "time": time.Now().UTC()})
	})

	router.GET("/api/v1/prices", func(c *gin.Context) {
		prices, err := db.LatestPrices(c.Request.Context())
		if err != nil {
			slog.Error("latest prices", "err", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": prices, "count": len(prices)})
	})

	router.GET("/api/v1/candles/:symbol", func(c *gin.Context) {
		interval := c.DefaultQuery("interval", "1m")
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "500"))
		candles, err := db.Candles(c.Request.Context(), c.Param("symbol"), interval, limit)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid parameters"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": candles, "count": len(candles)})
	})

	router.GET("/api/v1/news", func(c *gin.Context) {
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "30"))
		news, err := db.RecentNews(c.Request.Context(), limit)
		if err != nil {
			slog.Error("recent news", "err", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": news, "count": len(news)})
	})

	router.GET("/api/v1/news/:symbol", func(c *gin.Context) {
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
		news, err := db.NewsBySymbol(c.Request.Context(), c.Param("symbol"), limit)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": news, "count": len(news)})
	})

	router.GET("/api/v1/indicators/:symbol", func(c *gin.Context) {
		symbol := c.Param("symbol")
		// Indicateurs sur bougies 1h (fenêtre pertinente pour RSI/MACD).
		candles, err := db.Candles(c.Request.Context(), symbol, "1h", 200)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid parameters"})
			return
		}
		if len(candles) < 50 {
			// Historique horaire trop court (RSI/MACD/anomalie peu fiables) :
			// repli sur les bougies 1m, plus nombreuses.
			if m, err := db.Candles(c.Request.Context(), symbol, "1m", 500); err == nil && len(m) > len(candles) {
				candles = m
			}
		}
		c.JSON(http.StatusOK, gin.H{"data": analytics.Compute(symbol, candles)})
	})

	router.GET("/api/v1/news-impact/:symbol", func(c *gin.Context) {
		ctx := c.Request.Context()
		symbol := c.Param("symbol")
		news, err := db.NewsBySymbol(ctx, symbol, 8)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
			return
		}
		out := make([]model.NewsImpact, 0, len(news))
		for _, n := range news {
			imp := model.NewsImpact{News: n}
			// Prix ± 5 min autour de la publication, et ~1 h après.
			at, okA, _ := db.CloseNear(ctx, symbol, n.PublishedAt, 5)
			next, okB, _ := db.CloseNear(ctx, symbol, n.PublishedAt.Add(time.Hour), 5)
			if okA && okB && at != 0 {
				pct := (next - at) / at * 100
				imp.HasImpact = true
				imp.PriceAt = &at
				imp.PriceNext = &next
				imp.ImpactPct = &pct
			}
			out = append(out, imp)
		}
		c.JSON(http.StatusOK, gin.H{"data": out, "count": len(out)})
	})

	router.GET("/api/v1/noise-signal", func(c *gin.Context) {
		ctx := c.Request.Context()
		counts, err := db.NewsCountByCoin(ctx, 24)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
			return
		}
		out := make([]model.NoiseSignal, 0, len(cfg.Symbols))
		for _, sym := range cfg.Symbols {
			candles, _ := db.Candles(ctx, sym, "1m", 60)
			closes := make([]float64, len(candles))
			for i, cd := range candles {
				closes[i] = cd.Close
			}
			vol := analytics.Volatility(closes)
			buzz, move, label := analytics.BuzzIndex(counts[sym], vol)
			out = append(out, model.NoiseSignal{
				Symbol:     sym,
				NewsCount:  counts[sym],
				Volatility: vol,
				Buzz:       buzz,
				Move:       move,
				Label:      label,
			})
		}
		c.JSON(http.StatusOK, gin.H{"data": out, "count": len(out)})
	})

	router.GET("/api/v1/brief", func(c *gin.Context) {
		brief, ok, err := db.LatestBrief(c.Request.Context())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
			return
		}
		if !ok {
			c.JSON(http.StatusOK, gin.H{"data": nil})
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": brief})
	})

	router.GET("/api/v1/sentiment", func(c *gin.Context) {
		sent, err := db.SentimentBySymbol(c.Request.Context())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": sent, "count": len(sent)})
	})

	router.GET("/api/v1/stream", func(c *gin.Context) {
		ch := h.subscribe()
		metrics.SSEClients.Inc()
		defer func() {
			h.unsubscribe(ch)
			metrics.SSEClients.Dec()
		}()

		c.Header("Content-Type", "text/event-stream")
		c.Header("Cache-Control", "no-cache")
		c.Header("Connection", "keep-alive")

		c.Stream(func(w io.Writer) bool {
			select {
			case msg, ok := <-ch:
				if !ok {
					return false
				}
				c.SSEvent("trade", string(msg))
				return true
			case <-c.Request.Context().Done():
				return false
			case <-ctx.Done():
				return false
			}
		})
	})

	server := &http.Server{Addr: ":" + cfg.APIPort, Handler: router}
	go func() {
		<-ctx.Done()
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = server.Shutdown(shutdownCtx)
	}()

	slog.Info("API démarrée", "port", cfg.APIPort)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		slog.Error("serveur HTTP", "err", err)
		os.Exit(1)
	}
}

// metricsMiddleware enregistre le nombre et la latence des requêtes HTTP.
// La route est prise depuis c.FullPath() (motif, ex "/api/v1/candles/:symbol")
// pour éviter une explosion de cardinalité sur les valeurs de paramètres.
func metricsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()

		route := c.FullPath()
		if route == "" {
			route = "unknown"
		}
		metrics.HTTPDuration.WithLabelValues(route).Observe(time.Since(start).Seconds())
		metrics.HTTPRequests.WithLabelValues(
			c.Request.Method, route, strconv.Itoa(c.Writer.Status()),
		).Inc()
	}
}

// consumeTrades lit crypto.trades (sans consumer group : broadcast pur,
// chaque instance de l'API voit tous les messages) et alimente le hub SSE.
func consumeTrades(ctx context.Context, cfg config.Config, h *hub) {
	client, err := kgo.NewClient(
		kgo.SeedBrokers(cfg.KafkaBrokers...),
		kgo.ConsumeTopics(cfg.TradesTopic),
		kgo.ConsumeResetOffset(kgo.NewOffset().AtEnd()),
	)
	if err != nil {
		slog.Error("client Kafka SSE", "err", err)
		return
	}
	defer client.Close()

	for ctx.Err() == nil {
		fetches := client.PollFetches(ctx)
		if fetches.IsClientClosed() {
			return
		}
		fetches.EachRecord(func(r *kgo.Record) {
			// Validation minimale avant broadcast.
			if json.Valid(r.Value) {
				h.broadcast(r.Value)
			}
		})
	}
}
