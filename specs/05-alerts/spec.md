# Spec 05 — Alertes (Telegram)

## Pourquoi
Première brique de monétisation. Réutilise les signaux déjà produits (prix, variation
CoinGecko, **détection d'anomalies**). Telegram = LE canal crypto.

## User stories
- **US-1** : je crée une alerte (prix >, prix <, variation 24h ≥, mouvement anormal) et je
  reçois une notification Telegram quand la condition est remplie.
- **US-2** : je vois/supprime mes alertes (identifiées par mon chat_id, sans compte lourd).
- **US-3** : pas de spam : une alerte ne se redéclenche pas avant un délai (cooldown 1 h).

## Réalisé
- [x] `internal/alert` : règles + `Evaluate` + `ShouldNotify` (cooldown) + 6 tests
- [x] `internal/notify` : Telegram (repli journalisation si pas de token)
- [x] `cmd/alerter` : boucle d'évaluation (prix, variation, anomalie) → notification
- [x] API : POST/GET/DELETE `/api/v1/alerts`
- [x] Front `/alertes` : création + liste + suppression (thème terminal)
- [x] CI/CD + prod compose (service alerter, `TELEGRAM_BOT_TOKEN`)

## Validation (2026-07-17)
Alerte `price_below 999999` sur BTC → déclenchée : « BTC est repassé sous 999999.00 $
(prix 62774.00 $) » (mode log sans token). Avec `TELEGRAM_BOT_TOKEN`, envoi Telegram réel.

## Note
MVP sans compte : l'alerte est liée au chat_id Telegram. Une vraie auth (Phase suivante)
permettra alertes par email, quotas, et premium (alertes illimitées).
