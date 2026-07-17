# 🚀 KryptoVue — Améliorations futures

> Document de travail — pistes d'évolution, priorisées selon les deux objectifs du projet :
> **(A) vitrine CV** (data engineering / IA / quant) et **(B) source de revenus** (produit FR).
> Mis à jour le 2026-07-17. Toute proposition respecte la contrainte : **strictement
> informationnel, aucun conseil d'investissement** (AMF/MiCA).

---

## 0. Où on en est (rappel — mis à jour 2026-07-17)

**Déjà livré, testé, CI/CD verte :**
- Pipeline Go temps réel : Binance WS → Redpanda → aggregator (candles OHLCV) → TimescaleDB → API REST + SSE
- **Backfill historique** (`cmd/backfill`, Binance klines) → graphiques longs + réactions news
- Front Next.js « Terminal Vision » (thème dark/mono issu de Stitch) : prix live, bougies, heatmap, pages SEO
- IA : sentiment news FR (lexique + **Qwen local**), **résumé quotidien** Qwen, **alertes en langage naturel** (Qwen)
- Algos quant (Go) : RSI/MACD/moyennes/volatilité, **anomalies** (z-score), **Bruit vs Signal** (FOMO), **réactions prix aux news**, **matrice de corrélation** (Pearson)
- Données CoinGecko : market cap, dominance BTC, cap totale
- **Alertes Telegram** (règles prix/variation/anomalie + langage naturel)
- **SEO** : pages /prix, /actus (par crypto), glossaire, guides, sitemap, robots, PWA, mode débutant
- Devise EUR/USD, observabilité Prometheus/Grafana, Docker + GHCR

**Services :** 6 binaires Go (`ingester`, `aggregator`, `api`, `metadata`, `alerter`, `backfill`) + 1 worker Python (`ai-worker`).

**Reste à faire des axes déjà identifiés :** comptes/auth, Stripe, déploiement Hetzner,
newsletter, bot Twitter, alerte Scams AMF, chatbot RAG, catégorisation news, plus de cryptos,
backtesting, analytics produit, app Flutter, Redis/rate-limit, migrations versionnées, tests d'intégration.

---

## 1. 🥇 Priorité haute — finir la boucle produit & revenus

### 1.1 Comptes utilisateurs + auth
- **Quoi** : JWT (comme Virida) ou Clerk (comme ITP). Zéro inscription pour consulter,
  compte requis pour alertes/watchlist/portfolio.
- **Pourquoi** : débloque quotas, premium, alertes par email, watchlist persistée serveur.
- **Effort** : moyen · **Impact** : 🔓 prérequis de la monétisation.

### 1.2 Déploiement Hetzner (démo live publique)
- **Quoi** : provisionner le VPS CX32, `docker compose -f deploy/docker-compose.prod.yml up -d`,
  activer le CD (`DEPLOY_ENABLED=true` + secrets SSH), domaine + HTTPS (Caddy).
- **Pourquoi** : **un lien live vaut 1000 lignes de code** pour un recruteur. Active aussi le
  bot Twitter, la newsletter, l'indexation SEO réelle.
- **Effort** : faible-moyen · **Impact** : 🔥 CV + acquisition.

### 1.3 Stripe premium + affiliation
- **Quoi** : offre gratuite (3 alertes, brief) vs **Premium 4,99 €/mois** (alertes illimitées,
  historique étendu, brief perso). Liens d'affiliation exchanges PSAN (Meria, Coinhouse).
- **Pourquoi** : les premiers euros. L'affiliation rapporte dès J1, sans friction.
- **Effort** : moyen · **Impact** : 💶 revenus directs.

### 1.4 Newsletter quotidienne automatique
- **Quoi** : le brief Qwen existant → email quotidien (Brevo/Mailerlite free < 300/j).
- **Pourquoi** : **canal d'acquisition n°1** du benchmark, quasi gratuit, réutilise l'IA en place.
- **Effort** : faible · **Impact** : 🚀 croissance + rétention.

---

## 2. 🧠 IA & différenciation (étendre l'avantage FR)

### 2.1 Alertes en langage naturel
- « préviens-moi si le Bitcoin casse 60k avec un volume anormal » → Qwen parse la phrase →
  règle structurée (on a déjà Qwen + le moteur d'alertes + la détection d'anomalies).
- **Effort** : moyen · **Impact** : 5/5 — démonstration d'IA très forte en entretien.

### 2.2 Alerte « Conformité & Scams » (AMF)
- Croiser la **liste noire publique de l'AMF** → bouclier rouge sur les plateformes/tokens à risque.
- **Pourquoi** : différenciateur de **confiance** massif côté FR (personne d'international ne le fait).
- **Effort** : 2/5 · **Impact** : 4/5.

### 2.3 Chatbot explicatif / glossaire RAG (pgvector)
- Vulgarisation en langage naturel adossée au glossaire, via embeddings + Qwen (ta spécialité EVE/HomePedia).
- **Effort** : 3/5 · **Impact** : 4/5 (mode débutant).

### 2.4 Catégorisation thématique des news
- DistilCamemBERT ou Qwen : tag DeFi / régulation / NFT / macro ; filtrer les articles non-crypto du fil.
- **Effort** : 2/5 · **Impact** : 3/5 (qualité du fil).

### 2.5 Résumé hebdomadaire + « narratifs FR »
- Radar des tokens les plus mentionnés dans les médias FR sur 7 jours (on a déjà le comptage news).
- **Effort** : 2/5 · **Impact** : 4/5.

---

## 3. 📈 Données & analytics (renforcer le socle quant)

### 3.1 Plus de cryptos + recherche fonctionnelle
- Passer de 10 à 30-50 actifs ; rendre la barre de recherche du header réelle.
- **Effort** : faible · **Impact** : SEO (plus de pages) + UX.

### 3.2 Backfill historique (CoinGecko / Binance klines)
- Charger l'historique au démarrage → graphiques 30j/1an, et les **réactions news** deviennent
  exploitables immédiatement (aujourd'hui limitées à la fenêtre de bougies accumulée).
- **Effort** : moyen · **Impact** : 4/5 (débloque plusieurs features).

### 3.3 Corrélations & funding rates
- Matrice de corrélation entre actifs ; funding rates / open interest (Binance) pour un vrai « terminal ».
- **Effort** : moyen · **Impact** : 3/5 (signal quant CV).

### 3.4 Backtesting descriptif
- Rejouer une règle d'alerte sur l'historique (« combien de fois ce signal s'est produit »),
  **sans** promesse de performance future.
- **Effort** : moyen-élevé · **Impact** : 4/5 (fort CV, respecte la contrainte).

---

## 4. 🌱 SEO & croissance (le moteur d'acquisition)

### 4.1 Bot Twitter/X automatisé
- Le pipeline poste le brief quotidien + les mouvements anormaux détectés → démo produit
  permanente + backlinks. Réutilise anomalies + brief.
- **Effort** : faible-moyen · **Impact** : 🚀 acquisition.

### 4.2 SEO programmatique élargi
- Pages `/actus/[crypto]`, comparateurs, pages « pourquoi X monte/baisse » alimentées par l'IA.
- **Effort** : moyen · **Impact** : 4/5 (trafic organique long terme).

### 4.3 Analytics produit (Plausible/PostHog self-hosted)
- Mesurer activation, rétention J7, conversion — RGPD-friendly (argument FR).
- **Effort** : faible · **Impact** : pilotage.

---

## 5. 🛠️ Technique & CV (crédibilité ingénieur)

### 5.1 Tests d'intégration + couverture
- Tests d'intégration API contre une base éphémère (Postgres service dans la CI), badge de couverture.
- **Effort** : moyen · **Impact** : signal qualité fort.

### 5.2 Dashboards Grafana « produit »
- Panneaux métier versionnés (trades/s, lag consumer, alertes déclenchées, MRR simulé).
- **Effort** : faible · **Impact** : démo observabilité.

### 5.3 Rate limiting + cache Redis
- Protéger l'API publique, cacher les endpoints chauds (prix, brief). Utile dès qu'il y a du trafic.
- **Effort** : faible-moyen · **Impact** : robustesse.

### 5.4 Migrations de schéma versionnées
- Remplacer les `init-db/*.sql` (exécutés à la création seule) par un outil de migration
  (goose/atlas) pour appliquer les changements sur une base existante.
- **Effort** : faible · **Impact** : hygiène / prod.

### 5.5 App Flutter mobile (rétention)
- Reprendre l'app existante (1 écran, SSE, notifications push d'alertes) une fois le web stabilisé.
- **Effort** : élevé · **Impact** : rétention + différenciateur CV (fullstack + mobile).

---

## 5bis. 🆕 Nouveaux axes (émergés en cours de route)

### Produit
- **Watchlist fonctionnelle** : l'étoile ★ du tableau est décorative — la rendre active
  (favoris persistés). Effort faible, forte rétention.
- **Portfolio en lecture seule** : saisir ses avoirs, suivre la valeur et la P/L (sans custody).
- **Notifications push web (PWA)** : étendre les alertes au navigateur (le manifest existe déjà).
- **Comparateur de cryptos** (`/comparer/btc-vs-eth`) : pages SEO à fort potentiel.

### IA (combinaisons des briques existantes)
- **« Pourquoi ça bouge ? »** : quand une **anomalie** est détectée, Qwen génère une explication
  courte à partir des **news récentes** du token. Combine anomalie + news + LLM — très démonstratif.
- **Alerte langage naturel → création directe** : aujourd'hui le parsing pré-remplit le
  formulaire ; on peut créer l'alerte directement + confirmation.

### Données / technique
- **Rafraîchir les agrégats continus** : après un backfill, `candles_1h`/`candles_1d` ne
  couvrent pas l'historique (fenêtre de refresh limitée). Ajouter un `refresh_continuous_aggregate`
  pour des graphiques 1h/1d complets. *(dette technique identifiée)*
- **Order book / funding rates** (Binance) : profondeur de marché, vrai « terminal ».
- **API publique documentée (OpenAPI/Swagger)** : signal CV + ouverture B2B.

### Stabilité / DevOps (émergé du terrain)
- **`docker-compose.dev-full.yml`** : lancer TOUTE la stack en conteneurs en local
  (`restart: unless-stopped`) au lieu de `go run`/`next start` fragiles. Répétition idéale
  avant Hetzner. *(recommandé en premier — évite les « le front est retombé »)*
- **Audit Lighthouse / perf & accessibilité** du front : polish CV.

---

## 6. ⚠️ À ne PAS faire (rejets du benchmark)
- ❌ **Prédiction de prix / signaux d'achat** — impossible, et risque juridique (AMF/MiCA).
- ❌ Chatbot crypto généraliste sans valeur ajoutée.
- ❌ Kubernetes / microservices distribués avant plusieurs dizaines de milliers d'utilisateurs.
- ❌ Vocabulaire prescriptif (« acheter », « vendre », « opportunité »).

---

## 7. 🎯 Séquence recommandée

**Sprint 1 — rendre le projet « vivant »**
1. Déploiement Hetzner + domaine + HTTPS (1.2)
2. Newsletter quotidienne (1.4) + bot Twitter (4.1) → acquisition qui tourne toute seule

**Sprint 2 — monétiser**
3. Comptes/auth (1.1) → watchlist serveur
4. Stripe + affiliation (1.3)
5. Alertes en langage naturel (2.1)

**Sprint 3 — approfondir (CV)**
6. Backfill historique (3.2) → débloque réactions news + charts longs
7. Backtesting descriptif (3.4) + alerte Scams AMF (2.2)
8. Tests d'intégration + couverture (5.1)

> **Le plus rentable maintenant** : Hetzner (démo live) + newsletter. Peu d'effort, gros impact
> sur les deux objectifs. La monétisation vient juste après, une fois qu'il y a du trafic à convertir.
