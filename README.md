# KryptoVue 🇫🇷

[![CI](https://github.com/lekrikri/kryptovue/actions/workflows/ci.yml/badge.svg)](https://github.com/lekrikri/kryptovue/actions/workflows/ci.yml)
[![CD](https://github.com/lekrikri/kryptovue/actions/workflows/cd.yml/badge.svg)](https://github.com/lekrikri/kryptovue/actions/workflows/cd.yml)

> Terminal d'analyse crypto **francophone** en temps réel : cours en direct, graphiques,
> heatmap, sentiment des actualités FR par IA, indicateurs quant et alertes Telegram.
> Sans inscription pour consulter. **Strictement informationnel — aucun conseil en investissement.**

> Ce dépôt est né d'un projet scolaire Epitech (T-DAT-901 « CryptoViz »), audité, jugé
> structurellement défaillant (aucune persistance, faux temps réel, Spark décoratif) puis
> reconstruit en pipeline Go de production. L'ancienne stack Python reste consultable au tag git
> [`legacy-python-stack`](../../tree/legacy-python-stack).

---

## Architecture

```
Binance WebSocket (ticks temps réel) ─┐
Binance REST (klines, backfill) ───────┤
CoinGecko (market cap, dominance) ─────┼─▶ ingester (Go) ─▶ Redpanda ─┬─▶ aggregator (Go, candles OHLCV) ─▶ ┐
Flux RSS crypto FR ────────────────────┘                             ├─▶ ai-worker (Python : sentiment    │
                                                                     │   + résumé quotidien via Qwen)     ├─▶ TimescaleDB
                                                                     ├─▶ metadata (Go : CoinGecko)        │
                                                                     └─▶ alerter (Go → Telegram)          ┘
                              TimescaleDB ─▶ api (Go, Gin : REST + SSE) ─▶ Next.js (front terminal)
```

**Choix assumés** (issus d'un audit + benchmark de 3 IA, voir
[`docs/AUDIT_CRYPTOVIZ_2026.md`](docs/AUDIT_CRYPTOVIZ_2026.md) et
[`specs/benchmark-ia/`](specs/benchmark-ia/)) : Go pour les services (goroutines, faible RAM),
Redpanda (API Kafka sans Zookeeper), TimescaleDB (séries temporelles + agrégats continus),
SSE plutôt que WebSocket côté client, Python réservé à l'IA. Spark a été **supprimé** : un
marteau-pilon pour ce volume.

## Fonctionnalités

- **Temps réel** : prix en direct via SSE, bougies OHLCV agrégées côté serveur.
- **IA (différenciateur FR)** : sentiment des actualités crypto francophones (lexique +
  **Qwen local via ollama**), **résumé quotidien du marché** généré par Qwen.
- **Algos quant** (100 % descriptifs) : RSI, MACD, moyennes, volatilité, **détection
  d'anomalies** (z-score), indice **Bruit vs Signal** (FOMO), **réaction du prix aux actualités**.
- **Données de marché** : market cap, dominance BTC, capitalisation totale (CoinGecko).
- **Alertes Telegram** : règles prix / variation / mouvement anormal, avec anti-spam.
- **SEO & croissance** : pages par crypto (SSR + JSON-LD), glossaire, guides, sitemap, PWA.
- **Confort** : thème « terminal », mode débutant, devise EUR/USD.

## Arborescence du dépôt

| Chemin | Description |
|---|---|
| `cmd/ingester` | WebSocket Binance → Redpanda (`crypto.trades`) |
| `cmd/aggregator` | Trades → bougies OHLCV 1m → TimescaleDB |
| `cmd/api` | REST (prix, bougies, indicateurs, news, sentiment, alertes) + flux SSE |
| `cmd/metadata` | Métadonnées CoinGecko (market cap, dominance) |
| `cmd/alerter` | Évaluation des règles d'alerte → notification Telegram |
| `cmd/backfill` | Chargement de l'historique 1m depuis Binance (job ponctuel) |
| `internal/` | Paquets Go partagés (binance, candle, analytics, alert, notify, coingecko, store, metrics…) |
| `ai-worker/` | Worker Python : RSS FR → sentiment → TimescaleDB + brief Qwen |
| `web/` | Front Next.js 15 (thème terminal, SSR/SEO, SSE, graphiques) |
| `deploy/` | Docker Compose (dev/prod) + schéma SQL + provisioning Prometheus/Grafana |
| `specs/` | Développement piloté par les specs (constitution, specs, benchmark IA) |
| `docs/` | Audit, roadmap, guides |

## Démarrage rapide (développement)

### Infrastructure + services Go
```bash
make infra-up          # Redpanda + Console (:8090) + TimescaleDB (:5434)
make run-ingester      # Binance WS → Redpanda
make run-aggregator    # bougies 1m → TimescaleDB
make run-metadata      # market cap / dominance (CoinGecko)
make run-api           # http://localhost:8080
make run-backfill      # (optionnel) charge l'historique — BACKFILL_DAYS=7 par défaut

curl localhost:8080/api/v1/prices
curl localhost:8080/api/v1/candles/btcusdt?interval=1m
curl -N localhost:8080/api/v1/stream        # trades en direct (SSE)
```

### Worker IA (sentiment + résumé)
```bash
cd ai-worker
python -m venv .venv && .venv/bin/pip install -r requirements.txt
# Sentiment par lexique (défaut) ou Qwen local :
SENTIMENT_BACKEND=llm LLM_BASE_URL=http://localhost:11434/v1 .venv/bin/python main.py
```

### Front web (Next.js)
```bash
cd web
cp .env.example .env.local     # pointe vers l'API Go (défaut http://localhost:8081)
pnpm install
pnpm dev                       # http://localhost:3000
```

Pages : `/` (marché live), `/prix/[coin]` (SSR + SEO + graphique + indicateurs),
`/heatmap`, `/alertes`, `/glossaire`, `/guides`. Responsive (desktop + mobile).

Lancer `make ci` (vet + tests + build) avant de pousser.

## Principaux endpoints de l'API

| Endpoint | Description |
|---|---|
| `GET /api/v1/prices` | Dernier prix par crypto |
| `GET /api/v1/candles/:symbol` | Bougies OHLCV (`interval` = 1m/1h/1d) |
| `GET /api/v1/stream` | Flux SSE des trades en direct |
| `GET /api/v1/global` · `/market-meta` | Cap totale, dominance BTC, market cap par actif |
| `GET /api/v1/indicators/:symbol` | RSI, MACD, moyennes, volatilité, anomalie |
| `GET /api/v1/noise-signal` | Indice Bruit vs Signal (FOMO) par actif |
| `GET /api/v1/news` · `/news/:symbol` | Actualités FR analysées (sentiment) |
| `GET /api/v1/news-impact/:symbol` | Réaction du prix autour de chaque actu |
| `GET /api/v1/sentiment` | Sentiment agrégé par crypto (48 h) |
| `GET /api/v1/brief` | Résumé quotidien du marché (généré par Qwen) |
| `POST/GET/DELETE /api/v1/alerts` | Gestion des règles d'alerte |

## CI/CD

Deux pipelines GitHub Actions :

- **CI** (`ci.yml`) — à chaque push/PR : `gofmt`, `go vet`, `staticcheck`, tests Go (avec
  détecteur de data race), tests Python du worker, build web (typecheck + build), et build
  Docker de tous les services (validation).
- **CD** (`cd.yml`) — sur `main` et tags `v*` : build et publication des images sur
  **GitHub Container Registry** (`ghcr.io/lekrikri/kryptovue-*`). Un job `deploy` optionnel
  se connecte en SSH au VPS et fait `docker compose pull && up -d` (dormant tant que la
  variable de dépôt `DEPLOY_ENABLED=true` et les secrets SSH ne sont pas définis).

Images construites à partir d'un unique [`Dockerfile`](Dockerfile) multi-stage (distroless,
non-root, ~35 Mo) sélectionné via `--build-arg SERVICE=…`.

### Déploiement sur un VPS

```bash
# Sur le serveur, une fois :
git clone git@github.com:lekrikri/kryptovue.git && cd kryptovue
export POSTGRES_PASSWORD=<mot-de-passe-fort>
export TELEGRAM_BOT_TOKEN=<token>        # optionnel (alertes)
export SENTIMENT_BACKEND=llm             # optionnel (Qwen via ollama hôte)
IMAGE_TAG=latest docker compose -f deploy/docker-compose.prod.yml up -d
```

Cible recommandée : **Hetzner CX32** (8 Go RAM, ~7 €/mois). Non retenu : GCP/Cloud Run —
services *stateful* et always-on, et Cloud SQL ne supporte pas l'extension TimescaleDB.

## Observabilité

Chaque service Go expose des métriques Prometheus sur `/metrics` (`:9100` en prod). La stack
de production embarque **Prometheus** et **Grafana** (`:3001`, dashboard KryptoVue et
datasource pré-provisionnés) : trades produits/consommés, bougies persistées, clients SSE,
latence HTTP, erreurs DB.

## Feuille de route

- [x] Phase 0 — migration du dépôt, purge, audit, benchmark IA
- [x] Phase 1 — pipeline Go temps réel (Binance WS → Redpanda → TimescaleDB) + API REST/SSE
- [x] Phase 2 — front Next.js (thème terminal, pages SEO, bougies, heatmap)
- [x] Phase 3 — IA : agrégation des actus FR + analyse de sentiment (Qwen local) + résumé quotidien
- [x] Phase 4 — algos quant, données CoinGecko, alertes Telegram, SEO (glossaire/guides/PWA)
- [ ] Phase 5 — comptes + Stripe (premium) + déploiement Hetzner (démo live)

Pistes détaillées : [`docs/AMELIORATIONS_FUTURES.md`](docs/AMELIORATIONS_FUTURES.md).

## Licence

Privé — tous droits réservés (pour l'instant).
