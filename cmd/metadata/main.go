// metadata : interroge CoinGecko (market cap, dominance) et écrit dans TimescaleDB.
package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/lekrikri/kryptovue/internal/coingecko"
	"github.com/lekrikri/kryptovue/internal/config"
	"github.com/lekrikri/kryptovue/internal/model"
	"github.com/lekrikri/kryptovue/internal/store"
)

func main() {
	cfg := config.Load()
	interval := 5 * time.Minute
	if v := os.Getenv("META_POLL_SECONDS"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			interval = time.Duration(n) * time.Second
		}
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	db, err := store.New(ctx, cfg.DatabaseURL)
	if err != nil {
		slog.Error("connexion TimescaleDB", "err", err)
		os.Exit(1)
	}
	defer db.Close()

	client := coingecko.New()
	slog.Info("metadata démarré", "interval", interval)

	tick := time.NewTicker(interval)
	defer tick.Stop()

	refresh(ctx, db, client, cfg.Symbols) // premier passage immédiat
	for {
		select {
		case <-ctx.Done():
			slog.Info("arrêt de metadata")
			return
		case <-tick.C:
			refresh(ctx, db, client, cfg.Symbols)
		}
	}
}

func refresh(ctx context.Context, db *store.Store, client *coingecko.Client, symbols []string) {
	if g, err := client.FetchGlobal(ctx); err != nil {
		slog.Error("fetch global", "err", err)
	} else if err := db.UpsertGlobalMeta(ctx, model.GlobalMeta{
		TotalMarketCap:  g.TotalMarketCap,
		BTCDominance:    g.BTCDominance,
		MarketCapChange: g.MarketCapChange,
	}); err != nil {
		slog.Error("upsert global", "err", err)
	}

	markets, err := client.FetchMarkets(ctx, symbols)
	if err != nil {
		slog.Error("fetch markets", "err", err)
		return
	}
	for _, m := range markets {
		if err := db.UpsertCoinMeta(ctx, model.CoinMeta{
			Symbol:    m.Symbol,
			MarketCap: m.MarketCap,
			Volume24h: m.Volume24h,
			Change24h: m.Change24h,
		}, m.PriceUSD); err != nil {
			slog.Error("upsert coin meta", "symbol", m.Symbol, "err", err)
		}
	}
	slog.Info("metadata rafraîchie", "coins", len(markets))
}
