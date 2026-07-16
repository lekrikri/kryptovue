# KryptoVue 🇫🇷

> Real-time crypto market radar for the French-speaking market — live prices, aggregated
> French crypto news, AI-powered sentiment & alerts.

**Status : 🚧 modernization in progress** — this repo started as an Epitech group project
(T-DAT-901 "CryptoViz") and is being rebuilt into a production-grade platform. The full
audit and rebuild plan live in [`docs/AUDIT_CRYPTOVIZ_2026.md`](docs/AUDIT_CRYPTOVIZ_2026.md).

---

> The original Python/Spark/Flask stack was audited, found structurally flawed
> (no persistence, fake streaming, decorative Spark) and replaced by the Go pipeline
> below. It remains browsable at the git tag [`legacy-python-stack`](../../tree/legacy-python-stack).

## Architecture

```
Binance WebSocket (real-time ticks) ─┐
CoinGecko REST (metadata, EUR, mcap) ┼─▶ ingester (Go) ─▶ Redpanda ─┬─▶ consumer (Go) ─▶ TimescaleDB + pgvector
French crypto RSS feeds ─────────────┘                              ├─▶ ai-worker (Python: sentiment, daily brief)
                                                                    └─▶ alerter (Go → Telegram/email)
                             TimescaleDB ─▶ api (Go: REST + SSE) ─▶ Next.js web (PWA) · Flutter mobile (later)
```

## Repository layout

| Path | Description |
|---|---|
| `cmd/ingester` | Binance WebSocket → Redpanda (`crypto.trades`) |
| `cmd/aggregator` | Trades → 1m OHLCV candles → TimescaleDB |
| `cmd/api` | REST (prices, candles) + SSE real-time stream |
| `internal/` | Shared Go packages (binance, candle, store, config, model) |
| `deploy/` | Docker Compose dev stack (Redpanda, Console, TimescaleDB) + DB schema |
| `specs/` | Spec-driven development artifacts (constitution, specs, AI benchmark) |
| `docs/` | Audit, technical-indicator & charts guides |
| `crypto_viz_app/` | Flutter app (future mobile client) |

## Quick start

```bash
make infra-up          # Redpanda + Console (:8090) + TimescaleDB (:5433)
make run-ingester      # Binance WS → Redpanda
make run-aggregator    # candles 1m → TimescaleDB
make run-api           # http://localhost:8080

curl localhost:8080/api/v1/prices
curl localhost:8080/api/v1/candles/btcusdt?interval=1m
curl -N localhost:8080/api/v1/stream        # SSE live trades
```

Run `make ci` (vet + test + build) before pushing.

## Roadmap

- [x] Phase 0 — repo migration, dead-code purge, audit, AI architecture benchmark
- [ ] Phase 1 — Go ingestion pipeline (Binance WS → Redpanda → TimescaleDB) + REST/SSE API
- [ ] Phase 2 — Next.js web front (SEO pages, candlesticks, market heatmap)
- [ ] Phase 3 — AI features (French news sentiment, daily market brief)
- [ ] Phase 4 — accounts, smart alerts (Telegram/email), premium tier
- [ ] Phase 5 — public launch & live demo

## License

Private — all rights reserved (for now).
