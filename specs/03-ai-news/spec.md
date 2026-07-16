# Spec 03 — Actus FR & sentiment IA

## Pourquoi
C'est LE différenciateur (consensus du benchmark) : agréger les news crypto **francophones**
(Journal du Coin, Cryptoast, Cointribune) et calculer un **sentiment** par article et par
crypto. Angle mort du marché : les gros acteurs sont EN-first.

## User stories
- **US-1** : en tant que visiteur, je vois un fil des dernières actus crypto FR avec, pour
  chacune, un badge de sentiment (positif / neutre / négatif) et la source.
- **US-2** : sur la page d'une crypto, je vois les actus qui la mentionnent et son sentiment
  agrégé récent.
- **US-3** : en tant qu'opérateur, les news sont collectées et analysées en continu et
  persistées (pas de recalcul à chaque affichage).

## Critères d'acceptation
- [ ] Worker Python : RSS FR → parsing → rattachement aux cryptos → sentiment → TimescaleDB
- [ ] Analyse de sentiment **pluggable** (lexique FR en v1, LLM local ensuite) — interface stable
- [ ] Idempotent (une news = une ligne, clé = hash de l'URL)
- [ ] API Go : `/api/v1/news`, `/api/v1/news/:symbol`, `/api/v1/sentiment`
- [ ] Front : section actus (accueil) + actus/sentiment sur la page crypto
- [ ] Strictement informationnel, sources citées (constitution)

## Hors scope
Résumé quotidien IA génératif, alertes, auth (phases suivantes).
