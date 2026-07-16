# Tasks 01 — Core pipeline

- [ ] T1. `go.mod` + layout `cmd/` `internal/` `deploy/`
- [ ] T2. `deploy/docker-compose.dev.yml` — Redpanda + Console + TimescaleDB
- [ ] T3. `deploy/init-db/001_schema.sql` — hypertable candles_1m, latest_prices,
      continuous aggregates 1h/1d, rétention/compression
- [ ] T4. `internal/model` — types Trade, Candle
- [ ] T5. `internal/config` — config par env (brokers, DB URL, symbols, port)
- [ ] T6. `internal/binance` — client WS combined streams + reconnexion backoff
- [ ] T7. `internal/candle` — agrégateur OHLCV 1m + **tests unitaires**
- [ ] T8. `internal/store` — couche pgx (upserts, requêtes candles/prices)
- [ ] T9. `cmd/ingester` — Binance WS → Redpanda `crypto.trades`
- [ ] T10. `cmd/aggregator` — consume → candles → TimescaleDB + latest_prices
- [ ] T11. `cmd/api` — Gin : /health, /api/v1/prices, /api/v1/candles/:symbol, /api/v1/stream (SSE)
- [ ] T12. `Makefile` — infra-up/down, run-*, test, build
- [ ] T13. `.github/workflows/ci.yml` — vet + test + build
- [ ] T14. Validation end-to-end locale (ticks live → SSE + candles en base)
