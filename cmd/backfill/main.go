// backfill : charge l'historique 1m depuis Binance vers TimescaleDB (job one-shot).
// Débloque les graphiques longs et les réactions prix aux actualités passées.
package main

import (
	"context"
	"log/slog"
	"os"
	"strconv"
	"time"

	"github.com/lekrikri/kryptovue/internal/binance"
	"github.com/lekrikri/kryptovue/internal/config"
	"github.com/lekrikri/kryptovue/internal/store"
)

func main() {
	cfg := config.Load()
	days := 7
	if v := os.Getenv("BACKFILL_DAYS"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			days = n
		}
	}

	ctx := context.Background()
	db, err := store.New(ctx, cfg.DatabaseURL)
	if err != nil {
		slog.Error("connexion TimescaleDB", "err", err)
		os.Exit(1)
	}
	defer db.Close()

	end := time.Now().UTC()
	start := end.Add(-time.Duration(days) * 24 * time.Hour)
	slog.Info("backfill démarré", "days", days, "symbols", len(cfg.Symbols))

	total := 0
	for _, sym := range cfg.Symbols {
		n := backfillSymbol(ctx, db, sym, start, end)
		slog.Info("backfill symbole terminé", "symbol", sym, "candles", n)
		total += n
	}
	slog.Info("backfill terminé", "total_candles", total)
}

func backfillSymbol(ctx context.Context, db *store.Store, symbol string, start, end time.Time) int {
	inserted := 0
	cur := start
	for cur.Before(end) {
		batchEnd := cur.Add(1000 * time.Minute) // 1000 bougies 1m
		if batchEnd.After(end) {
			batchEnd = end
		}
		candles, err := binance.FetchKlines(ctx, symbol, cur, batchEnd, 1000)
		if err != nil {
			slog.Warn("fetch klines", "symbol", symbol, "err", err)
			time.Sleep(2 * time.Second)
			cur = batchEnd
			continue
		}
		for _, c := range candles {
			if err := db.UpsertCandle(ctx, c); err == nil {
				inserted++
			}
		}
		if len(candles) == 0 {
			cur = batchEnd
		} else {
			// Repartir juste après la dernière bougie reçue.
			cur = candles[len(candles)-1].Start.Add(time.Minute)
		}
		time.Sleep(300 * time.Millisecond) // ménage les limites Binance
	}
	return inserted
}
