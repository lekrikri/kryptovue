# 🔍 AUDIT COMPLET — CRYPTOVIZ (T-DAT-901) → KRYPTOVUE

> Audit réalisé le 2026-07-16 — Objectif : transformer un projet scolaire Epitech en
> **produit générateur de revenus** + **projet vitrine CV data engineering**.
> Méthode : audit technique complet → BMAD (business/marketing) → Spec Kit ITP (dev).

---

## 1. Executive Summary

| Domaine | Note | Verdict |
|---|---|---|
| Architecture data | 4/10 | Concept correct (Kafka), exécution incomplète (pas de persistance, Spark factice) |
| Backend/API | 3/10 | Flask dev-server, cache RAM volatile, 0 auth, 0 résilience |
| Frontend Flutter | 5/10 | Fonctionnel, joli, mais 6 écrans dupliqués + god-provider + URLs hardcodées |
| Qualité / DevOps | 1/10 | 0 test, 0 CI/CD, logs et venv commités, main quasi vide |
| Sécurité | 2/10 | CORS *, erreurs exposées, pas d'auth, images non pinnées |
| Hygiène Git | 2/10 | 1 seul commit sur main, vrai code sur branche `chris` jamais mergée |
| **Potentiel produit** | **7/10** | Niche FR + IA réelle et sous-exploitée, ton stack IA (EVE/HomePedia) est le différenciateur |
| **Potentiel CV** | **9/10** | Streaming temps réel + Go + time-series DB + IA = exactement ce que cherchent les recruteurs data |

**Verdict global : le projet actuel n'est pas récupérable en l'état comme produit, mais c'est
une excellente fondation conceptuelle.** On garde : l'idée du pipeline streaming, les sources
(Binance + RSS crypto FR), l'app Flutter comme client mobile futur. On reconstruit : tout le
backend (en **Go**), la persistance, l'infra, la qualité.

---

## 2. État des lieux (inventaire)

### 2.1 Structure Git — 🔴 critique
- `main` : 1 commit ("first commit"), contient uniquement l'app Flutter + scripts de présentation + **logs commités** (`kafka_producer.log` 194 KB, `api_gateway.log` 59 KB) + **venv/ commité**.
- Le vrai projet est sur la branche **`chris`** (jamais mergée) : pipeline complet Kafka/Spark/Flask/Streamlit.
- Branches mortes : `Setayesh`, `gaspard`, `feat/heatmap` (quasi identiques à `chris`).
- Remote : org Epitech (`EpitechMscProPromo2026`) → **à migrer vers repo privé perso** (voir Phase 0).

### 2.2 Composants (branche `chris`)

| Composant | Fichier | LOC | Rôle |
|---|---|---|---|
| Producer | `data-ingestion/kafka_crypto_producer.py` | 225 | Polling REST Binance (30 s, 5 cryptos) + RSS FR (5 min) → Kafka |
| API Gateway | `api-gateway/app.py` | 269 | Flask + consumers Kafka en threads → cache RAM → REST |
| Spark processor | `spark/crypto_spark_processor.py` | 126 | Lit des **CSV** (pas de streaming réel !) |
| Analytics | `analytics/spark_analytics_builder.py` | 559 | Indicateurs techniques batch |
| Dashboard | `dashboard/streamlit_dashboard.py` | 458 | Viz web Streamlit |
| App Flutter | `crypto_viz_app/` | ~6 000 | Mobile/desktop, Provider, fl_chart, fallback CoinGecko |
| Infra | `docker/docker-compose.full.yml` | — | Zookeeper + Kafka + Spark master/worker + collector + gateway + Kafka UI |

---

## 3. Audit technique détaillé

### 3.1 Pipeline de données — 🔴 le cœur du problème

1. **Aucune persistance.** Le gateway garde tout en RAM (`self.cache`). Un restart = toutes
   les données perdues. Impossible d'afficher un historique de prix réel, un chart 7j/30j,
   des indicateurs techniques calculés sur du vrai historique. **C'est LE défaut bloquant.**
2. **Polling REST au lieu de streaming.** Binance expose des **WebSockets gratuits et
   illimités** (`wss://stream.binance.com`) avec ticks temps réel — le projet fait du
   `requests.get` toutes les 30 s. Le "temps réel" affiché est en fait du 30-secondes.
3. **Spark est décoratif.** `crypto_spark_processor.py` lit des CSV en batch ; le vrai
   consumer Spark-Kafka n'existe que sur la branche `gaspard`. Pour 5 symboles × 1 msg/30 s,
   Spark est un marteau-pilon : ~2 800 messages/jour, ça tient dans une boucle `for`.
4. **Zookeeper est obsolète** (Kafka 4.0 l'a retiré, KRaft depuis 3.3). L'image cp-kafka 7.4
   date de 2023.
5. **Données fausses** : `price_eur = price_usd * 0.92` hardcodé ; `market_cap_usd: 0`.
6. **5 cryptos hardcodées** dans le code. Pas de config, pas d'extension possible sans redéploiement.

### 3.2 API Gateway — 🔴
- `app.run()` Flask dev server en prod, mono-process.
- Threads consumers non supervisés : si un thread meurt (exception Kafka), **plus aucune
  donnée fraîche, silencieusement**, le `/health` répond toujours "healthy".
- `CORS(app)` ouvert à tous, aucune auth, aucun rate-limit.
- Erreurs internes renvoyées au client (`'error': str(e)`).
- Pas de push (WebSocket/SSE) : le front doit poller → latence + charge.

### 3.3 Frontend Flutter — 🟠
- **6 variantes d'écran d'accueil** (`dark_`, `clean_`, `colorful_`, `modern_`, `home_`,
  `analytics_`) + autant de variantes de cards = ~70 % de code mort. Une seule est active.
- `CryptoProvider` god-object : prix + news + trending + recherche + stats dans une classe.
- `http://localhost:3000/api` **hardcodé** dans `crypto_service.dart` → ne peut fonctionner
  que sur la machine de dev. Aucun flavor/env.
- `web_socket_channel` est dans le pubspec mais jamais utilisé (le backend n'a pas de WS).
- 1 seul test : le `widget_test.dart` généré par défaut.
- Bon point : architecture services/models/providers propre, fallback CoinGecko intelligent,
  UI dark soignée (réutilisable en storytelling produit).

### 3.4 Qualité / DevOps — 🔴
- **0 test** backend, **0 CI/CD**, 0 linting Python configuré.
- 10+ fichiers markdown de doc redondants (`README_COMPLET`, `DOCUMENTATION_COMPLETE`,
  `GUIDE_RAPIDE_INSTALLATION`, `INSTALLATION_GUIDE`…) — signal "projet de groupe rendu à
  l'arrache", très mauvais pour un recruteur qui ouvre le repo.
- Aucun monitoring (pas de Prometheus/Grafana malgré Kafka).

### 3.5 Sécurité — 🔴
- Pas d'auth du tout (acceptable pour un dashboard public read-only, bloquant pour monétiser).
- `kafka-ui:latest` non pinné, exposé sans auth sur :8090.
- Dépendances Python sans lockfile ni scan (requirements.txt libre).

---

## 4. Verdict migration : Go ✅ OUI (recommandé)

Tu as déjà du Go en prod (backend Gin de HomePedia T-DAT-902) — la marche est faible.

| Critère | Python actuel | **Go cible** |
|---|---|---|
| WebSockets Binance (100+ streams concurrents) | asyncio pénible | goroutines, trivial |
| Perf/empreinte | ~200 MB+ par service | binaire 10-20 MB, VPS à 5 €/mois suffit |
| Déploiement | venv + deps | 1 binaire statique, Dockerfile 10 lignes |
| Signal CV data engineering 2026 | banal | **fort** (Go + Kafka + time-series = combo recherché) |
| Écosystème | kafka-python (lent) | franz-go / segmentio-kafka-go (excellents) |

**Ce qu'on garde en Python** : uniquement le service IA (sentiment/résumés de news) si tu
utilises tes modèles locaux (Qwen) — c'est ton savoir-faire EVE/HomePedia, ne le réécris pas.

### Architecture cible

```
Binance WS (ticks temps réel) ──┐
CoinGecko REST (metadata/mcap) ─┤   ┌──────────────┐
RSS FR (Journal du Coin,        ├──▶│ ingester (Go) │──▶ Redpanda (Kafka-compatible,
Cryptoast, Cointribune)  ───────┘   └──────────────┘      1 conteneur, sans Zookeeper)
                                                             │
                              ┌──────────────────────────────┼───────────────────┐
                              ▼                              ▼                   ▼
                      ┌──────────────┐              ┌────────────────┐   ┌──────────────┐
                      │ consumer (Go) │              │ ai-worker (Py) │   │ alerter (Go) │
                      │ candles OHLCV │              │ sentiment +    │   │ règles users │
                      │ indicateurs   │              │ résumés news   │   │ → Telegram/  │
                      └──────┬───────┘              └───────┬────────┘   │   email/push │
                             ▼                              ▼            └──────────────┘
                      ┌─────────────────────────────────────────┐
                      │   TimescaleDB (PostgreSQL + hypertables) │
                      │   continuous aggregates 1m→1h→1d         │
                      └───────────────────┬─────────────────────┘
                                          ▼
                              ┌───────────────────────┐
                              │  api (Go, Gin/Echo)    │  REST + SSE/WebSocket + auth JWT
                              └──────┬───────┬────────┘
                                     ▼       ▼
                              Web Next.js   Flutter mobile
                              (SEO, acquisition)  (rétention, existant modernisé)
```

**Choix assumés :**
- **Redpanda** plutôt que Kafka+Zookeeper : API Kafka identique (le CV dit "Kafka" sans mentir),
  1 seul conteneur, 10× moins de RAM. Alternative encore plus simple : NATS JetStream — mais
  Redpanda garde le mot-clé "Kafka" pour les recruteurs.
- **TimescaleDB** plutôt que ClickHouse : c'est du PostgreSQL (tu maîtrises via Prisma/Supabase),
  continuous aggregates = candles multi-résolutions gratuites. ClickHouse serait plus "impressionnant"
  mais overkill solo.
- **Spark supprimé.** Honnête : à ce volume c'est du mensonge architectural. Le storytelling CV
  "j'ai remplacé Spark par des consumers Go 100× plus légers après analyse du volume réel" est
  BIEN MEILLEUR qu'un Spark décoratif — ça montre du jugement d'ingénieur.
- **Web Next.js en front principal** : le SEO est le seul canal d'acquisition gratuit viable
  (pages `/prix/bitcoin` indexées). Flutter reste pour le mobile (rétention + différenciateur CV).

---

## 5. BMAD — Business & Marketing (phases Analyst → PM)

### 5.1 Analyst : le marché

**Concurrents** : CoinMarketCap, CoinGecko, CoinStats, Delta, TradingView, Dexscreener.
Tous excellents, tous gratuits pour l'usage de base. **Affronter frontalement = mort assurée.**

**La niche exploitable** (croisement de tes forces) :
1. **Marché francophone mal servi** : les gros sont EN-first, les news FR (Journal du Coin,
   Cryptoast, Cointribune) ne sont agrégées nulle part avec analyse. Ton pipeline RSS FR
   existe déjà — c'est le seul vrai actif différenciant du projet actuel.
2. **IA appliquée** : résumé quotidien du marché généré par IA, sentiment par crypto calculé
   sur les news FR, alertes en langage naturel ("préviens-moi si BTC casse 100k avec un volume
   anormal"). Tu as déjà toute la stack (RAG EVE, chatbot HomePedia, Qwen local = coût ~0 €).
3. **Alertes intelligentes multi-canal** : Telegram est LE canal crypto ; alertes gratuites
   limitées, illimitées en premium.

**Positionnement** : *« KryptoVue — le radar crypto francophone. Prix temps réel, actus FR
agrégées, résumés et alertes IA. »*

### 5.2 Personas
- **Hugo, 28 ans, investisseur particulier FR** : DCA sur 5-10 cryptos, lit Cryptoast, veut
  un résumé du matin et des alertes sans ouvrir 6 apps. → cœur de cible freemium.
- **Sarah, 35 ans, curieuse** : veut comprendre sans jargon EN. → SEO + newsletter.
- **Le recruteur** 😉 : persona non payant mais ROI maximal — il veut voir le README, le
  diagramme d'archi, la CI verte et la démo live en 90 secondes.

### 5.3 Modèle économique (réaliste, ordre de priorité)
1. **Affiliation exchanges** (Bitpanda, Binance, Coinhouse — programmes FR) : le plus rapide
   à encaisser, 0 friction utilisateur. Boutons "Acheter sur X" contextuels.
2. **Freemium** : gratuit = prix + news + 3 alertes + résumé quotidien ; **Premium 4,99 €/mois** =
   alertes illimitées, sentiment détaillé, alertes langage naturel, portfolio, newsletter perso.
   Stripe (tu l'as déjà fait sur ITP).
3. **Newsletter IA quotidienne** (gratuite → sponsorisable à partir de ~1 000 abonnés).
4. Plus tard : API sentiment FR payante (B2B médias/traders).

**Réalisme assumé** : année 1, objectif 100-500 €/mois (affiliation + quelques dizaines de
premium) — c'est déjà un succès pour un side-project solo. La valeur certaine est le CV ;
la valeur espérée est le revenu. Ne pas inverser.

### 5.4 Canaux d'acquisition (coût 0 €)
1. **SEO programmatique** : une page par crypto (`/prix/bitcoin`) avec prix live + sentiment
   + news — Next.js SSR/ISR, c'est exactement ce que CoinGecko fait en EN.
2. **Twitter/X crypto FR** : compte auto-alimenté par ton pipeline (résumé quotidien IA,
   alertes de mouvements anormaux). Bot = démo produit permanente.
3. **Newsletter** (Brevo gratuit < 300 mails/jour).
4. **Product Hunt / r/CryptoFrance / forums FR** au lancement.

### 5.5 KPI de pilotage
Activation (inscription → 1ʳᵉ alerte créée), rétention J7, abonnés newsletter, clics
affiliation, MRR. Plausible via un simple Umami/Plausible self-hosted (RGPD-friendly, argument FR).

---

## 6. Roadmap Spec Kit (pipeline ITP : Validate → Brief → Architecture → Stories → Code)

Chaque phase = un dossier `specs/NN-nom/` avec `spec.md` (le quoi/pourquoi), `plan.md`
(le comment technique), `tasks.md` (découpage exécutable). La constitution du projet
(principes non négociables) vit dans `specs/constitution.md`.

### Phase 0 — Migration & assainissement (2-3 jours)
- [ ] Créer repo privé `lekrikri/kryptovue`, pousser `main` = contenu de la branche `chris` nettoyée
- [ ] Purger : logs, venv, 6 écrans Flutter morts, 10 markdown redondants, branches mortes
- [ ] `.gitignore` racine complet, README pro unique (EN, avec diagramme)
- [ ] `specs/constitution.md` : Go pour les services, tests obligatoires, conventional commits, CI verte ou pas de merge

### Phase 1 — Core pipeline Go (2-3 semaines) 🎯 le MVP CV
- **Spec** : "en tant qu'utilisateur je vois les prix de 50+ cryptos en temps réel (<1 s) avec historique"
- [ ] `ingester` Go : WebSocket Binance (combined streams) → Redpanda
- [ ] `consumer` Go : agrégation ticks → candles OHLCV 1m → TimescaleDB + continuous aggregates (5m/1h/1d)
- [ ] `api` Go (Gin) : REST (`/api/v1/prices`, `/api/v1/candles/:symbol`) + SSE temps réel
- [ ] Docker Compose complet + healthchecks, GitHub Actions (lint, test, build)
- [ ] Tests unitaires Go (agrégation candles = cas d'école testable)

### Phase 2 — Front web & viz (2-3 semaines)
- [ ] Next.js : accueil (top cryptos live via SSE), page `/prix/[coin]` SSR (SEO), candlestick charts (lightweight-charts de TradingView, gratuit), heatmap marché (reprendre l'idée `feat/heatmap` !)
- [ ] Reprendre le pipeline RSS FR en Go, page actus

### Phase 3 — IA & différenciation (2 semaines) 🧠 ta force
- [ ] `ai-worker` Python : sentiment par article (positif/neutre/négatif + score), résumé quotidien du marché — Qwen local ou API selon coût
- [ ] Badge sentiment par crypto, page "Le brief du matin"
- [ ] Bot Twitter/X auto-publiant le brief

### Phase 4 — Users, alertes, monétisation (3 semaines)
- [ ] Auth (JWT maison comme Virida, ou Clerk comme ITP)
- [ ] `alerter` Go : règles prix/variation/volume → Telegram + email ; quota 3 gratuites
- [ ] Stripe premium 4,99 €/mois, liens affiliation exchanges, newsletter

### Phase 5 — Packaging CV & lancement (1 semaine)
- [ ] README EN irréprochable : GIF démo, diagramme, "Architecture Decisions" (dont "pourquoi j'ai retiré Spark" 😎), badges CI
- [ ] Démo live sur Hetzner (mutualiser avec le VPS Virida), repo passé en public
- [ ] Article de blog/LinkedIn "From a school project to a real-time crypto pipeline in Go"
- [ ] Moderniser l'app Flutter (1 écran, SSE, flavors) — optionnel, après le web

**Total : ~10-12 semaines à temps partiel.** Chaque phase se termine par un livrable
démontrable — si tu t'arrêtes après la Phase 2, tu as déjà un projet CV solide.

---

## 7. Checklist "regard recruteur" (à cocher avant de passer le repo en public)

- [ ] README EN avec démo visuelle dans les 5 premières secondes de scroll
- [ ] Historique git propre (conventional commits, pas de "fix2 final FINAL")
- [ ] CI verte visible (badge), tests avec couverture sur la logique métier
- [ ] Diagramme d'architecture + section "Design Decisions" argumentée
- [ ] Démo live accessible (même minimale) — un lien vaut 1000 lignes de code
- [ ] Aucun secret, log, venv, fichier mort dans le repo
