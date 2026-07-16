# Plan 01 — Core pipeline temps réel

## Architecture de la phase

```
Binance WS (combined @trade streams)
        │
   cmd/ingester ──produce──▶ Redpanda topic `crypto.trades` (key = symbol)
                                   │
                    ┌──────────────┴──────────────┐
             cmd/aggregator                  cmd/api (consumer sans groupe)
             (groupe `aggregator`)                 │
                    │                              ├─ GET /health
             candles 1m (OHLCV)                    ├─ GET /api/v1/prices
                    │                              ├─ GET /api/v1/candles/:symbol
             TimescaleDB ◀────── lectures ─────────┤
             (+ cont. aggregates 1h/1d)            └─ GET /api/v1/stream  (SSE)
```

## Décisions techniques (ADR)
- **Module Go unique** `github.com/lekrikri/kryptovue`, layout `cmd/` + `internal/`.
  Un binaire par service, logique partagée dans `internal/`.
- **franz-go** comme client Kafka (le plus performant/maintenu, pur Go).
- **gorilla/websocket** pour Binance (mature, simple). Reconnexion avec backoff
  exponentiel (Binance coupe les connexions à 24 h).
- **pgx/v5** (pgxpool) pour PostgreSQL — pas d'ORM, SQL explicite.
- **Gin** pour l'API (cohérent avec l'existant HomePedia).
- L'API consomme `crypto.trades` **sans consumer group** (broadcast SSE) ; l'aggregator
  utilise le groupe `aggregator` (reprise sur offsets committés).
- **Candles côté consumer** (pas de Kafka Streams) : bucket 1m par symbole ; candle
  émise à la rotation du bucket + flush périodique (5 s) de la candle en cours pour
  l'affichage live. Upsert idempotent (`ON CONFLICT DO UPDATE`).
- **Continuous aggregates** Timescale pour 1h/1d à partir de candles_1m ; rétention
  1m = 90 j, agrégats illimités.

## Infra dev
`deploy/docker-compose.dev.yml` : Redpanda (mode dev, 1 Go) + Redpanda Console +
TimescaleDB (port 5433 pour ne pas gêner les PostgreSQL locaux existants).
Les services Go tournent sur l'hôte en dev (`make run-*`), dockerisés en prod (Phase 5).

## Risques
- Format des messages Binance : validé par tests de parsing.
- Rate limits : les WS Binance sont sans limite pratique pour ~10-50 streams.
- Dérive d'horloge : on utilise le timestamp de trade Binance (`T`), pas l'heure locale.
