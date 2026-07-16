// Package metrics expose les compteurs Prometheus partagés et un endpoint /metrics.
package metrics

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
	// Ingester
	TradesProduced = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "kryptovue_trades_produced_total",
		Help: "Trades publiés vers Kafka par l'ingester, par symbole.",
	}, []string{"symbol"})

	ProduceErrors = promauto.NewCounter(prometheus.CounterOpts{
		Name: "kryptovue_produce_errors_total",
		Help: "Erreurs de production Kafka dans l'ingester.",
	})

	// Aggregator
	TradesConsumed = promauto.NewCounter(prometheus.CounterOpts{
		Name: "kryptovue_trades_consumed_total",
		Help: "Trades consommés depuis Kafka par l'aggregator.",
	})

	CandlesPersisted = promauto.NewCounter(prometheus.CounterOpts{
		Name: "kryptovue_candles_persisted_total",
		Help: "Bougies 1m écrites dans TimescaleDB.",
	})

	DBErrors = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "kryptovue_db_errors_total",
		Help: "Erreurs d'écriture en base, par opération.",
	}, []string{"op"})

	// API
	SSEClients = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "kryptovue_sse_clients",
		Help: "Clients SSE actuellement connectés.",
	})

	HTTPRequests = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "kryptovue_http_requests_total",
		Help: "Requêtes HTTP servies par l'API, par route et statut.",
	}, []string{"method", "route", "status"})

	HTTPDuration = promauto.NewHistogramVec(prometheus.HistogramOpts{
		Name:    "kryptovue_http_request_duration_seconds",
		Help:    "Latence des requêtes API, par route.",
		Buckets: prometheus.DefBuckets,
	}, []string{"route"})
)

// Serve lance un endpoint HTTP /metrics. Bloque jusqu'à annulation du contexte.
func Serve(ctx context.Context, addr string) {
	mux := http.NewServeMux()
	mux.Handle("/metrics", promhttp.Handler())
	srv := &http.Server{Addr: addr, Handler: mux}

	go func() {
		<-ctx.Done()
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()
		_ = srv.Shutdown(shutdownCtx)
	}()

	slog.Info("endpoint metrics", "addr", addr)
	if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		slog.Error("serveur metrics", "err", err)
	}
}
