# Plan 03 — Actus FR & sentiment IA

## Composant : `ai-worker/` (Python)
```
ai-worker/
  main.py         # boucle : fetch → analyse → upsert, toutes les N minutes
  feeds.py        # sources RSS FR
  coins.py        # rattachement texte → symboles (nom/ticker/alias)
  sentiment.py    # analyseur pluggable (lexique FR v1)
  store.py        # psycopg : upsert news
  requirements.txt
  Dockerfile
```
Python pour l'IA (constitution). Découplé des services Go, écrit directement en base.

## Analyse de sentiment (v1 = lexique, pluggable)
Interface : `analyze(text) -> (score in [-1,1], label)`. V1 : lexique pondéré FR
(termes haussiers/baissiers crypto) + gestion basique de la négation. Conçu pour être
remplacé par Qwen local / DistilCamemBERT sans toucher au reste (le worker n'appelle que
`analyze`). Choix assumé : v1 transparent, testable, hors-ligne ; l'upgrade LLM est un
simple swap d'implémentation.

## Rattachement aux cryptos
Match insensible à la casse sur le nom (`bitcoin`), le ticker (`btc`) et des alias
(`ethereum`→eth). Une news peut mentionner plusieurs cryptos.

## Persistance (schéma `002_news.sql`)
Table `news` (id=hash URL, source, title, url, summary, published_at, coins[], score, label).
Sentiment agrégé par crypto = calculé à la volée dans l'API (moyenne 48 h).

## API Go (nouvelles routes)
- `GET /api/v1/news?limit=N`
- `GET /api/v1/news/:symbol`
- `GET /api/v1/sentiment` → score moyen + label par symbole (48 h glissantes)

## Front
- Accueil : section « Actus & sentiment » (dernières news + badges).
- Page crypto : news liées + sentiment agrégé.

## Tests
Worker : tests unitaires du lexique (`sentiment`) et du matching (`coins`).
