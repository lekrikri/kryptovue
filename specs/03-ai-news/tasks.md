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

## Phase 3.5 — LLM local (Qwen) + résumé quotidien ✅

- [x] `ai-worker/llm.py` — client OpenAI-compatible (ollama/Qwen), parsing tolérant
- [x] `ai-worker/analyzer.py` — sélecteur de backend (`SENTIMENT_BACKEND=lexicon|llm`)
      avec repli automatique sur le lexique si le LLM est injoignable
- [x] `deploy/init-db/003_brief.sql` — table `market_brief`
- [x] Génération du résumé de marché FR par Qwen (`llm.generate_brief`), planifiée
      dans la boucle (`BRIEF_EVERY_HOURS`)
- [x] API Go `/api/v1/brief` + panneau front `MARKET_BRIEF :: DAILY_SYNTH`
- [x] Tests `test_llm.py` (parsing robuste, hermétique) — 13 tests verts au total

### Validation Qwen (2026-07-16, qwen2.5:3b via ollama)
- Sentiment LLM plus nuancé que le lexique : 25 négatifs / 13 positifs / 2 neutres.
- Brief généré (869 caractères), factuel, informationnel (« Le DOT affiche l'une des
  meilleures performances (+1,99 %)… l'ambiance des actualités est négative… »).
- LLM optionnel : défaut `lexicon` (hermétique) ; `llm` en pointant `LLM_BASE_URL`
  vers un ollama hôte (`host.docker.internal:11434` en prod).

## Reste (Phase 3.6, optionnel)
- [ ] Filtrer les articles non-crypto du fil général
- [ ] Fine-tune / few-shot pour réduire les hallucinations d'actifs dans le brief
