# Tasks 01 — Core pipeline

- [x] T1. `go.mod` + layout `cmd/` `internal/` `deploy/`
- [x] T2. `deploy/docker-compose.dev.yml` — Redpanda + Console + TimescaleDB
- [x] T3. `deploy/init-db/001_schema.sql` — hypertable candles_1m, latest_prices,
      continuous aggregates 1h/1d, rétention/compression
- [x] T4. `internal/model` — types Trade, Candle
- [x] T5. `internal/config` — config par env (brokers, DB URL, symbols, port)
- [x] T6. `internal/binance` — client WS combined streams + reconnexion backoff
- [x] T7. `internal/candle` — agrégateur OHLCV 1m + **tests unitaires**
- [x] T8. `internal/store` — couche pgx (upserts, requêtes candles/prices)
- [x] T9. `cmd/ingester` — Binance WS → Redpanda `crypto.trades`
- [x] T10. `cmd/aggregator` — consume → candles → TimescaleDB + latest_prices
- [x] T11. `cmd/api` — Gin : /health, /api/v1/prices, /api/v1/candles/:symbol, /api/v1/stream (SSE)
- [x] T12. `Makefile` — infra-up/down, run-*, test, build
- [x] T13. `.github/workflows/ci.yml` — vet + test + build
- [x] T14. Validation end-to-end locale (ticks live → SSE + candles en base)

## Résultat de validation (2026-07-16)

Pipeline validé de bout en bout en local :
- **Ingester** : ~4 000 trades/min produits vers Redpanda depuis 10 streams Binance.
- **Aggregator** : bougies 1m persistées, ex. BTCUSDT 17:03 → open 64524 / high 64528 /
  low 64466 / close 64476 / volume 12.49 / 6612 trades.
- **API** : `/api/v1/prices` = 10 symboles live ; `/api/v1/candles/btcusdt` = OHLCV correct ;
  `/api/v1/stream` = trades SSE en direct ; `/health` OK.
- **Bug corrigé en e2e** : les clés Binance `e`/`E` et `t`/`T` entraient en collision via le
  matching JSON insensible à la casse de Go → tous les champs du payload sont désormais
  déclarés (test de régression `ws_test.go` sur un payload réel capturé).

## Reste à faire (dette, Phase 1.5)
- [x] Dockeriser les 3 services Go (Dockerfile multi-stage distroless, ~35 Mo)
- [x] CI/CD complet (GitHub Actions) : lint/test/build + build & push images GHCR + deploy VPS
- [x] `docker-compose.prod.yml` (images GHCR, healthchecks, restart policies)
- [ ] Backfill historique CoinGecko au démarrage (bougies avant le premier tick live)
- [ ] Métriques Prometheus (trades/s, lag consumer) — décidé au benchmark IA
