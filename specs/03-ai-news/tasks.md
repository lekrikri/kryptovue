# Tasks 03 — Actus FR & sentiment IA

- [x] T1. `deploy/init-db/002_news.sql` — table news + index
- [x] T2. `ai-worker/sentiment.py` — lexique FR pluggable + tests
- [x] T3. `ai-worker/coins.py` — matching texte → symboles + tests
- [x] T4. `ai-worker/feeds.py` — sources RSS FR
- [x] T5. `ai-worker/store.py` — upsert psycopg
- [x] T6. `ai-worker/main.py` — boucle fetch/analyse/store
- [x] T7. `ai-worker/requirements.txt` + `Dockerfile` + service prod compose
- [x] T8. API Go : /api/v1/news, /api/v1/news/:symbol, /api/v1/sentiment
- [x] T9. Front : NEWS_FEED accueil + NEWS_SCAN page crypto (badges sentiment)
- [x] T10. Validation e2e + CI worker (pytest) + CD image ai-worker

## Résultat de validation (2026-07-16)

Chaîne complète validée en local :
- Worker : 40 articles réels collectés (Journal du Coin, Cryptoast, Cointribune),
  7 positifs / 6 négatifs, 15 rattachés à une crypto. Sentiment cohérent
  (« répit de l'inflation propulse le Bitcoin » → positif ; « baleines XRP réduisent
  leur activité » → négatif).
- API : `/api/v1/sentiment` → BTC neutre (13), ETH positif (0.25), XRP négatif (-0.27).
- Front : section NEWS_FEED avec badges POSITIF/NEUTRE/NÉGATIF, source, ancienneté, tags.
- 8 tests unitaires verts (lexique + matching, dont négation et frontières de mots).

## Reste à faire (Phase 3.5)
- [ ] Upgrade sentiment : Qwen local ou DistilCamemBERT (swap de `analyze`)
- [ ] Résumé quotidien du marché généré par IA (Gemini Flash free tier)
- [ ] Filtrer les articles non-crypto (sans coin ET score faible) du fil général
