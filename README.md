# KryptoVue 🇫🇷

> Real-time crypto market radar for the French-speaking market — live prices, aggregated
> French crypto news, AI-powered sentiment & alerts.

**Status : 🚧 modernization in progress** — this repo started as an Epitech group project
(T-DAT-901 "CryptoViz") and is being rebuilt into a production-grade platform. The full
audit and rebuild plan live in [`docs/AUDIT_CRYPTOVIZ_2026.md`](docs/AUDIT_CRYPTOVIZ_2026.md).

---

## Current architecture (legacy, being replaced)

```
Binance REST (30s polling) ─┐
French crypto RSS feeds ────┼──▶ Kafka (+ Zookeeper) ──▶ Flask API Gateway (in-memory cache)
                            │                                    │
                            │                          ┌─────────┴─────────┐
                            │                          ▼                   ▼
                            └──▶ Spark (batch)   Flutter app        Streamlit dashboard
```

Known limitations (see audit): no persistence, polling instead of streaming,
oversized Spark for the actual volume, no auth, no tests, no CI.

## Target architecture

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
| `data-ingestion/` | Legacy Python Kafka producer (Binance polling + French RSS) |
| `api-gateway/` | Legacy Flask REST gateway |
| `spark/`, `analytics/` | Legacy Spark processors (to be removed after migration) |
| `dashboard/` | Legacy Streamlit dashboard |
| `crypto_viz_app/` | Flutter app (mobile/desktop client) |
| `docker/` | Docker Compose stacks (Kafka, Spark, full) |
| `docs/` | Architecture, audit, technical-indicator & charts guides |
| `specs/` | Spec-driven development artifacts (briefs, plans, AI benchmark) |

## Quick start (legacy stack)

```bash
docker compose -f docker/docker-compose.full.yml up -d   # Kafka + collector + gateway + UI
cd crypto_viz_app && flutter run                          # Flutter client
```

## Roadmap

- [x] Phase 0 — repo migration, dead-code purge, audit, AI architecture benchmark
- [ ] Phase 1 — Go ingestion pipeline (Binance WS → Redpanda → TimescaleDB) + REST/SSE API
- [ ] Phase 2 — Next.js web front (SEO pages, candlesticks, market heatmap)
- [ ] Phase 3 — AI features (French news sentiment, daily market brief)
- [ ] Phase 4 — accounts, smart alerts (Telegram/email), premium tier
- [ ] Phase 5 — public launch & live demo

## License

Private — all rights reserved (for now).
