# KryptoVue 🇫🇷

[![CI](https://github.com/lekrikri/kryptovue/actions/workflows/ci.yml/badge.svg)](https://github.com/lekrikri/kryptovue/actions/workflows/ci.yml)
[![CD](https://github.com/lekrikri/kryptovue/actions/workflows/cd.yml/badge.svg)](https://github.com/lekrikri/kryptovue/actions/workflows/cd.yml)

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
| `cmd/api` | REST (prices, candles, news, sentiment) + SSE real-time stream |
| `internal/` | Shared Go packages (binance, candle, store, config, model, metrics) |
| `ai-worker/` | Python worker: French crypto RSS → sentiment analysis → TimescaleDB |
| `web/` | Next.js 15 front (SEO pages, live prices via SSE, candlestick charts, heatmap) |
| `deploy/` | Docker Compose stacks + DB schema + Prometheus/Grafana provisioning |
| `specs/` | Spec-driven development artifacts (constitution, specs, AI benchmark) |
| `docs/` | Audit, technical-indicator & charts guides |
| `crypto_viz_app/` | Flutter app (future native mobile client) |

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

### Web front (Next.js)

```bash
cd web
cp .env.example .env.local     # points at the Go API (default http://localhost:8081)
pnpm install
pnpm dev                       # http://localhost:3000
```

Pages: `/` (live top prices), `/prix/[coin]` (SSR + SEO + candlestick chart),
`/heatmap`. Responsive (desktop + mobile browsers); the Flutter app remains the
future native mobile client.

## CI/CD

Two GitHub Actions pipelines:

- **CI** (`ci.yml`) — on every push and PR: `gofmt` check, `go vet`, `staticcheck`,
  race-enabled tests, `go build`, and a Docker build of all three services (validation,
  no push). Merges to `main` are gated on green CI.
- **CD** (`cd.yml`) — on push to `main` (and `v*` tags): builds and pushes the three
  service images to **GitHub Container Registry** (`ghcr.io/lekrikri/kryptovue-*`),
  tagged with the commit sha, `latest`, and the semver on tags. A final `deploy` job
  SSHes into the VPS and runs `docker compose pull && up -d` — it stays dormant until
  the repo variable `DEPLOY_ENABLED=true` and the SSH secrets are set.

### Deploy to a VPS

```bash
# On the server, once:
git clone git@github.com:lekrikri/kryptovue.git && cd kryptovue
export POSTGRES_PASSWORD=<strong-password>
IMAGE_TAG=latest docker compose -f deploy/docker-compose.prod.yml up -d
```

To enable automated deploys, set repo variable `DEPLOY_ENABLED=true` and secrets
`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_APP_DIR`.

Images are built from a single multi-stage [`Dockerfile`](Dockerfile) (distroless,
non-root, ~35 MB) selected via `--build-arg SERVICE=ingester|aggregator|api`.

## Observability

Each service exposes Prometheus metrics on `/metrics` (`:9100` in prod, `:9101-9103` in dev):

| Metric | Service | Meaning |
|---|---|---|
| `kryptovue_trades_produced_total{symbol}` | ingester | trades published to Kafka |
| `kryptovue_trades_consumed_total` | aggregator | trades read from Kafka |
| `kryptovue_candles_persisted_total` | aggregator | 1m candles written to TimescaleDB |
| `kryptovue_db_errors_total{op}` | aggregator | DB write failures |
| `kryptovue_sse_clients` | api | connected SSE clients |
| `kryptovue_http_requests_total{method,route,status}` | api | HTTP traffic |
| `kryptovue_http_request_duration_seconds{route}` | api | request latency histogram |

The prod stack (`docker-compose.prod.yml`) ships **Prometheus** (scrapes all three
services) and **Grafana** (`:3001`, Prometheus datasource pre-provisioned).

## Roadmap

- [x] Phase 0 — repo migration, dead-code purge, audit, AI architecture benchmark
- [x] Phase 1 — Go ingestion pipeline (Binance WS → Redpanda → TimescaleDB) + REST/SSE API
- [x] Phase 2 — Next.js web front (terminal UI, SEO pages, candlesticks, market heatmap)
- [x] Phase 3 — AI: French crypto news aggregation + sentiment analysis
- [ ] Phase 4 — accounts, smart alerts (Telegram/email), premium tier
- [ ] Phase 5 — public launch & live demo (Hetzner VPS)

CI/CD, Prometheus + Grafana observability, and full Docker packaging are in place.

## License

Private — all rights reserved (for now).
