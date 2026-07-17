# Tasks 04 — Algorithmes d'analyse

- [x] T1. `internal/analytics` : SMA, EMA, RSI, MACD, volatilité, z-score + 9 tests
- [x] T2. `analytics.Compute` (indicateurs + anomalie) + `BuzzIndex` (bruit/signal)
- [x] T3. API `/api/v1/indicators/:symbol` (repli 1m si historique horaire court)
- [x] T4. Front : panneau INDICATORS :: TECH_SCAN + badge ANOMALY_DETECTED
- [x] T5. API `/api/v1/noise-signal` + panneau NOISE_SIGNAL :: FOMO_RADAR (accueil)
- [x] T6. API `/api/v1/news-impact/:symbol` + badge RÉACTION_PRIX_1H sur la page crypto
- [x] T7. Garde-fou : 100 % descriptif, disclaimers, jamais de langage prescriptif

## Résultat de validation (2026-07-17)

- **Indicateurs** (BTC, 213 bougies) : RSI 31,1, MACD histogramme +5,9 (momentum),
  SMA20/EMA50, volatilité 0,10 %, VOL_Z 0,6σ — pas d'anomalie (marché calme).
- **Anomalie** : détectée à ≥ 3σ sur volume ou rendement ("mouvement anormal (baisse) : 5,2σ").
- **Bruit vs Signal** : BTC = 13 actus / volatilité faible → buzz 100, move 16 → **BRUIT**
  (hype médiatique sans mouvement). Autres → CALME.
- **Réactions news** : endpoint OK ; l'impact prix ne s'affiche que pour les news publiées
  pendant que le pipeline tournait (fenêtre de bougies). S'enrichit dans le temps
  (rétention candles_1m = 90 j).

## Note
Tous les algos sont en **Go** sur les bougies existantes, purement **descriptifs**
(aucune prédiction). Le seul rejet unanime du benchmark (« IA qui prédit le marché »)
est respecté.
