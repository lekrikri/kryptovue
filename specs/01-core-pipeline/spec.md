# Spec 01 — Core pipeline temps réel

## Pourquoi
Le défaut bloquant du legacy est l'absence de persistance et de vrai temps réel
(polling 30 s, cache RAM). Cette phase pose la fondation : ticks Binance en streaming,
candles OHLCV historisées, API de lecture temps réel. C'est aussi le cœur de la valeur
CV du projet (Go + Kafka API + time-series).

## User stories
- **US-1** : en tant que visiteur, je vois le prix de 10+ cryptos se mettre à jour en
  moins d'1 s sans rafraîchir la page (SSE).
- **US-2** : en tant que visiteur, je consulte l'historique OHLCV d'une crypto
  (candles 1m / 1h / 1d) pour tracer un graphique.
- **US-3** : en tant qu'opérateur, je relance n'importe quel service sans perdre de
  données (persistance TimescaleDB, offsets Kafka).
- **US-4** : en tant que dev, je lance toute l'infra en une commande (`make infra-up`)
  et la CI valide chaque push.

## Critères d'acceptation
- [ ] Latence tick Binance → événement SSE < 500 ms en local
- [ ] Candles 1m exactes (open = premier trade du bucket, high/low/close/volume corrects) — prouvé par tests unitaires
- [ ] Redémarrage de l'aggregator sans trou dans les candles (reprise sur offsets)
- [ ] `GET /api/v1/candles/btcusdt?interval=1h&limit=168` répond < 100 ms
- [ ] CI GitHub Actions : vet + tests + build verts

## Hors scope (phases suivantes)
News RSS, IA/sentiment, front Next.js, auth, alertes.
