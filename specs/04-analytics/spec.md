# Spec 04 — Algorithmes d'analyse (descriptifs)

## Pourquoi
Le benchmark IA recommande des algorithmes **non-LLM** à forte valeur : indicateurs
techniques, détection d'anomalies, indice « Bruit vs Signal », historique des réactions
aux news. Rejet unanime : **aucune prédiction de prix / conseil** (AMF/MiCA). Tout reste
strictement **descriptif** et pédagogique. Calculé en Go sur les bougies existantes → fort
signal quant/data pour le CV, testable unitairement.

## User stories
- **US-1** : sur une page crypto, je vois RSI, MACD, moyennes et volatilité, avec un
  libellé compréhensible (surachat/survente, momentum +/−).
- **US-2** : si un volume ou un mouvement de prix est anormal (z-score ≥ 3σ), je vois un
  signalement descriptif (« volume anormal : 4σ au-dessus de la normale »).
- **US-3** : je vois un indice « Bruit vs Signal » (activité médiatique FR vs volatilité prix).
- **US-4** : pour chaque grosse actu, je vois l'évolution du prix avant/après.

## Critères d'acceptation
- [x] Package `internal/analytics` pur (RSI, MACD, SMA, EMA, volatilité, z-score) + tests
- [x] `/api/v1/indicators/:symbol` (indicateurs + anomalie), repli 1m si historique court
- [x] Panneau front INDICATORS + badge anomalie, disclaimer éducatif
- [ ] Indice Bruit vs Signal (`/api/v1/noise-signal`)
- [ ] Historique des réactions aux news (`/api/v1/news-impact/:symbol`)
- [x] Jamais de langage prescriptif (acheter/vendre/prédire)

## Garde-fou
Toutes les sorties sont factuelles et passées. Aucune projection future.
