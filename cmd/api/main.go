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

	"github.com/lekrikri/kryptovue/internal/config"
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

	router := gin.New()
	router.Use(gin.Recovery())

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

	router.GET("/api/v1/stream", func(c *gin.Context) {
		ch := h.subscribe()
		defer h.unsubscribe(ch)

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
