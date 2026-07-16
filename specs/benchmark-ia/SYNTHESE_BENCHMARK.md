# Synthèse du benchmark IA — architecture KryptoVue (2026-07-16)

Trois IA (ChatGPT, Gemini, Grok) ont reçu le même prompt de consulting (contexte complet,
contraintes solo-dev / 20 €/mois / 10-12 semaines, option Go+Redpanda+TimescaleDB à challenger).
Ce document consolide les réponses et fige les décisions d'architecture.

## Consensus unanime (3/3) → décisions actées ✅

| Sujet | Décision |
|---|---|
| Spark | Supprimé — "aberration architecturale" pour ce volume |
| Base de données | PostgreSQL + TimescaleDB (continuous aggregates, compression, rétention) |
| Ingestion & API | Go (goroutines pour WebSocket Binance, faible RAM) |
| Temps réel front | SSE plutôt que WebSocket (flux unidirectionnel, reconnexion native) |
| Worker IA | Python (écosystème), découplé via le broker |
| Front | Next.js web-first pour le SEO ; **Flutter repoussé** en phase tardive |
| Positionnement | Veille crypto **francophone** augmentée par l'IA — pas un CoinMarketCap de plus |
| Acquisition | SEO programmatique = arme n°1 (pages /crypto/x, /news/x, glossaire, guides) |
| Revenus 12 mois | 350-570 €/mois si le SEO prend (hypothèses convergentes entre les 3) |

## Divergence principale : le broker

- **ChatGPT** : garder Redpanda — surdimensionné techniquement mais "raconte une histoire
  Data Engineering" (mot-clé Kafka pour les recruteurs).
- **Grok** : Redpanda ou NATS JetStream, au choix selon le volume.
- **Gemini** : NATS JetStream ferme — Redpanda trop gourmand en RAM pour un petit VPS,
  NATS = binaire Go 15 Mo avec pub/sub + persistance + KV store.

**Arbitrage retenu : Redpanda**, avec deux garde-fous :
1. VPS **Hetzner CX32 (8 Go RAM, ~7-8 €/mois)** au lieu du CX22 4 Go — le débat RAM disparaît.
2. Redpanda en mode dev (`--smp 1 --memory 1G`) ; volume si faible que la bascule NATS
   reste triviale si besoin.
Justification : l'API Kafka (client franz-go) est le mot-clé CV le plus fort ; c'est
l'objectif n°1 du projet.

## Meilleures idées à intégrer, par source

### Gemini (réponse la plus tranchée, la plus actionnable)
- **Une seule base pour tout** : PostgreSQL = relationnel (users) + time-series (Timescale)
  + vectoriel (**pgvector** pour le RAG news). Un seul backup, une seule empreinte RAM. ✅ adopté
- **Alerte "Conformité & Scams"** : croiser les listes noires publiques de l'AMF et signaler
  les plateformes/tokens à risque. Différenciateur FR massif, effort 2/5. ✅ backlog Phase 3
- **Zéro inscription pour consulter** — compte requis uniquement pour les alertes. ✅ adopté
- **Répartition IA honnête** : Qwen 0.5B local = classification/sentiment uniquement (tâche
  restreinte) ; génération de texte lisible (résumés) → **Gemini Flash free tier** (15 req/min). ✅ adopté
- Radar des narratifs FR (volume médias FR vs volume trading), indice "Bruit vs Signal".
- Affiliation via plateformes **PSAN** (Meria, Coinhouse) — plus propre juridiquement.
- Acheter un template UI Tailwind (~30 €) plutôt que perdre 2 semaines en CSS.

### ChatGPT (réponse la plus complète et chiffrée)
- **Politique de rétention précise** : ticks bruts 7 j → candles 1m 90 j → 5m 2 ans →
  1h illimité, compression après 7 j. ✅ adopté tel quel
- **Détection d'anomalies via Isolation Forest** (pas un LLM) — effort 3/5, impact 5/5. ✅ backlog
- Catégorisation des news avec **DistilCamemBERT** (français natif, léger).
- **"Historique des réactions"** : pour chaque grosse news, prix avant/après + volatilité
  + sentiment. Très différenciant (effort 4/5). ✅ backlog Phase 3+
- Mode débutant : masquer RSI/MACD/ATR, afficher hausse/baisse/volatilité en langage humain.

### Grok (réponse la plus prudente)
- **Monitoring Prometheus + Grafana** dès la Phase 1 (absent des autres réponses,
  et c'est un plus CV). ✅ adopté
- Backup quotidien vers object storage (~1-2 €/mois). ✅ adopté
- Chatbot explicatif RAG limité au glossaire/vulgarisation (pas de chatbot généraliste).

## Rejets unanimes (à ne PAS faire)
- ❌ Chatbot crypto généraliste — aucune valeur
- ❌ IA qui "prédit le marché" — impossible et dangereux juridiquement
- ❌ Kubernetes / microservices avant plusieurs dizaines de milliers d'utilisateurs
- ❌ Conseil d'investissement (AMF/MiCA) — rester strictement informationnel, disclaimers,
  bannir "acheter/vendre/opportunité"

## Architecture finale consolidée

```
Binance WS ──┐
CoinGecko ───┼─▶ ingester (Go) ─▶ Redpanda ─┬─▶ candle-aggregator (Go) ─▶ ┐
RSS FR ──────┘                              ├─▶ ai-worker (Py: Qwen local │
                                            │   sentiment + Gemini Flash  ├─▶ PostgreSQL
                                            │   résumés + IsolationForest)│   (Timescale
                                            └─▶ alerter (Go)              │   + pgvector)
                                                                          ┘
        PostgreSQL ─▶ api (Go, REST + SSE, cache in-memory) ─▶ Next.js PWA (─▶ Flutter plus tard)
        Infra : Hetzner CX32 8 Go (~7 €/mois) · Docker Compose · Prometheus/Grafana · backups S3
```

Budget RAM estimé : Redpanda ~1 Go, PostgreSQL ~800 Mo, services Go ~200 Mo, ai-worker ~1-1,5 Go
en pointe, Next.js ~250 Mo → ~4 Go utilisés sur 8 Go. Confortable.
