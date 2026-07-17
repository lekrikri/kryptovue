// alerter : évalue les règles d'alerte contre l'état du marché et notifie.
package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	"strings"

	"github.com/lekrikri/kryptovue/internal/alert"
	"github.com/lekrikri/kryptovue/internal/analytics"
	"github.com/lekrikri/kryptovue/internal/config"
	"github.com/lekrikri/kryptovue/internal/notify"
	"github.com/lekrikri/kryptovue/internal/store"
)

const (
	evalInterval = 30 * time.Second
	cooldown     = time.Hour // anti-spam par règle
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

	notifier := notify.New()
	slog.Info("alerter démarré", "interval", evalInterval)

	tick := time.NewTicker(evalInterval)
	defer tick.Stop()
	for {
		select {
		case <-ctx.Done():
			slog.Info("arrêt de l'alerter")
			return
		case <-tick.C:
			evaluate(ctx, db, notifier)
		}
	}
}

// ticker : "btcusdt" → "BTC".
func ticker(symbol string) string {
	return strings.ToUpper(strings.TrimSuffix(symbol, "usdt"))
}

func evaluate(ctx context.Context, db *store.Store, notifier notify.Notifier) {
	rules, err := db.ActiveAlerts(ctx)
	if err != nil {
		slog.Error("chargement des règles", "err", err)
		return
	}
	if len(rules) == 0 {
		return
	}

	// Snapshots par symbole (prix, variation 24h, anomalie), calculés à la demande.
	snaps := make(map[string]alert.Snapshot)
	get := func(sym string) alert.Snapshot {
		if s, ok := snaps[sym]; ok {
			return s
		}
		s := buildSnapshot(ctx, db, sym)
		snaps[sym] = s
		return s
	}

	now := time.Now()
	for _, r := range rules {
		if !alert.ShouldNotify(r.LastTriggered, now, cooldown) {
			continue
		}
		triggered, msg := alert.Evaluate(r, get(r.Symbol), ticker(r.Symbol))
		if !triggered {
			continue
		}
		if err := notifier.Send(ctx, r.TargetType, r.TargetAddr, msg); err != nil {
			slog.Error("notification échouée", "rule", r.ID, "err", err)
			continue
		}
		if err := db.MarkAlertTriggered(ctx, r.ID, now); err != nil {
			slog.Error("mark triggered", "rule", r.ID, "err", err)
		}
		slog.Info("alerte déclenchée", "rule", r.ID, "symbol", r.Symbol, "type", r.RuleType)
	}
}

func buildSnapshot(ctx context.Context, db *store.Store, symbol string) alert.Snapshot {
	var s alert.Snapshot
	if prices, err := db.LatestPrices(ctx); err == nil {
		for _, p := range prices {
			if p.Symbol == symbol {
				s.Price = p.Price
				break
			}
		}
	}
	if meta, err := db.CoinMetaAll(ctx); err == nil {
		if m, ok := meta[symbol]; ok {
			s.Change24h = m.Change24h
		}
	}
	// Anomalie : réutilise le calcul analytics sur les bougies 1m.
	if candles, err := db.Candles(ctx, symbol, "1m", 500); err == nil {
		ind := analytics.Compute(symbol, candles)
		s.Anomaly = ind.Anomaly
		s.AnomalyNote = ind.AnomalyNote
	}
	return s
}
