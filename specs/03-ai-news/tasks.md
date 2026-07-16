# Tasks 03 — Actus FR & sentiment IA

- [ ] T1. `deploy/init-db/002_news.sql` — table news + index
- [ ] T2. `ai-worker/sentiment.py` — lexique FR pluggable + tests
- [ ] T3. `ai-worker/coins.py` — matching texte → symboles + tests
- [ ] T4. `ai-worker/feeds.py` — sources RSS FR
- [ ] T5. `ai-worker/store.py` — upsert psycopg
- [ ] T6. `ai-worker/main.py` — boucle fetch/analyse/store
- [ ] T7. `ai-worker/requirements.txt` + `Dockerfile` (+ service prod compose)
- [ ] T8. API Go : /api/v1/news, /api/v1/news/:symbol, /api/v1/sentiment
- [ ] T9. Front : section actus accueil + actus/sentiment page crypto
- [ ] T10. Validation e2e (vraies news FR → sentiment → affichage) + CI worker
