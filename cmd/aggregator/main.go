// aggregator : consomme crypto.trades, agrège en candles 1m et écrit dans TimescaleDB.
package main

import (
	"context"
	"encoding/json"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/twmb/franz-go/pkg/kgo"

	"github.com/lekrikri/kryptovue/internal/candle"
	"github.com/lekrikri/kryptovue/internal/config"
	"github.com/lekrikri/kryptovue/internal/metrics"
	"github.com/lekrikri/kryptovue/internal/model"
	"github.com/lekrikri/kryptovue/internal/store"
)

const (
	flushInterval      = 5 * time.Second // flush des bougies en cours (affichage live)
	priceFlushInterval = time.Second     // flush des derniers prix
)

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

	client, err := kgo.NewClient(
		kgo.SeedBrokers(cfg.KafkaBrokers...),
		kgo.ConsumeTopics(cfg.TradesTopic),
		kgo.ConsumerGroup("aggregator"),
	)
	if err != nil {
		slog.Error("client Kafka", "err", err)
		os.Exit(1)
	}
	defer client.Close()

	go metrics.Serve(ctx, cfg.MetricsAddr)

	agg := candle.New(time.Minute)
	latest := make(map[string]model.Trade) // dernier trade par symbole, flush périodique

	flushTicker := time.NewTicker(flushInterval)
	defer flushTicker.Stop()
	priceTicker := time.NewTicker(priceFlushInterval)
	defer priceTicker.Stop()

	slog.Info("aggregator démarré", "topic", cfg.TradesTopic)

	for {
		select {
		case <-ctx.Done():
			flushCandles(context.Background(), db, agg) // dernier flush avant sortie
			slog.Info("arrêt de l'aggregator")
			return

		case <-flushTicker.C:
			flushCandles(ctx, db, agg)

		case <-priceTicker.C:
			for sym, t := range latest {
				if err := db.UpsertLatestPrice(ctx, sym, t.Price, t.Time()); err != nil {
					slog.Error("upsert latest_price", "symbol", sym, "err", err)
					metrics.DBErrors.WithLabelValues("price").Inc()
				}
				delete(latest, sym)
			}

		default:
			pollCtx, cancel := context.WithTimeout(ctx, time.Second)
			fetches := client.PollFetches(pollCtx)
			cancel()
			if fetches.IsClientClosed() {
				return
			}
			fetches.EachError(func(topic string, p int32, err error) {
				if ctx.Err() == nil && err != context.DeadlineExceeded {
					slog.Error("fetch", "topic", topic, "partition", p, "err", err)
				}
			})
			fetches.EachRecord(func(r *kgo.Record) {
				var t model.Trade
				if err := json.Unmarshal(r.Value, &t); err != nil {
					slog.Warn("trade illisible", "err", err)
					return
				}
				latest[t.Symbol] = t
				metrics.TradesConsumed.Inc()
				if done := agg.Add(t); done != nil {
					if err := db.UpsertCandle(ctx, *done); err != nil {
						slog.Error("upsert candle", "symbol", done.Symbol, "err", err)
						metrics.DBErrors.WithLabelValues("candle").Inc()
					} else {
						metrics.CandlesPersisted.Inc()
					}
				}
			})
		}
	}
}

// flushCandles persiste l'état courant des bougies en cours (upsert idempotent).
func flushCandles(ctx context.Context, db *store.Store, agg *candle.Aggregator) {
	for _, c := range agg.Snapshot() {
		if err := db.UpsertCandle(ctx, c); err != nil {
			slog.Error("flush candle", "symbol", c.Symbol, "err", err)
		}
	}
}
