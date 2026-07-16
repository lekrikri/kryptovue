// ingester : Binance WebSocket → Redpanda topic crypto.trades.
package main

import (
	"context"
	"encoding/json"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"github.com/twmb/franz-go/pkg/kgo"

	"github.com/lekrikri/kryptovue/internal/binance"
	"github.com/lekrikri/kryptovue/internal/config"
	"github.com/lekrikri/kryptovue/internal/model"
)

func main() {
	cfg := config.Load()

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	client, err := kgo.NewClient(
		kgo.SeedBrokers(cfg.KafkaBrokers...),
		kgo.DefaultProduceTopic(cfg.TradesTopic),
		kgo.AllowAutoTopicCreation(),
	)
	if err != nil {
		slog.Error("client Kafka", "err", err)
		os.Exit(1)
	}
	defer client.Close()

	trades := make(chan model.Trade, 1024)
	go binance.Stream(ctx, cfg.Symbols, trades)

	slog.Info("ingester démarré", "brokers", cfg.KafkaBrokers,
		"topic", cfg.TradesTopic, "symbols", len(cfg.Symbols))

	var produced uint64
	for {
		select {
		case <-ctx.Done():
			slog.Info("arrêt de l'ingester", "trades_produits", produced)
			return
		case t := <-trades:
			payload, err := json.Marshal(t)
			if err != nil {
				slog.Error("marshal trade", "err", err)
				continue
			}
			record := &kgo.Record{Key: []byte(t.Symbol), Value: payload}
			client.Produce(ctx, record, func(_ *kgo.Record, err error) {
				if err != nil {
					slog.Error("produce", "err", err)
				}
			})
			produced++
			if produced%1000 == 0 {
				slog.Info("progression", "trades_produits", produced)
			}
		}
	}
}
