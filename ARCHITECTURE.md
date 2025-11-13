# Architecture du Projet T-DAT-901

## Vue d'ensemble

Le projet T-DAT-901 est une **plateforme d'analytics crypto en temps réel** composée de **DEUX applications distinctes** :

1. **Dashboard Streamlit** (Python) - Interface web pour visualisation avancée
2. **Application Flutter** (Dart) - Application mobile/desktop native

---

## Architecture Globale

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA SOURCES                              │
│   CoinGecko API │ RSS Feeds Crypto │ External APIs              │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────────┐
│                    DATA INGESTION LAYER                         │
│   kafka_crypto_producer.py                                      │
│   - Collecte données CoinGecko                                  │
│   - Scrape RSS feeds                                            │
│   - Envoi vers Kafka topics                                     │
└────────────┬───────────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────────┐
│                    MESSAGE BROKER (Kafka)                       │
│   Topics:                                                        │
│   - crypto-prices                                               │
│   - crypto-news                                                 │
│   - crypto-alerts                                               │
│   - processed-data                                              │
└────────┬───────────────────────────────────┬───────────────────┘
         │                                   │
         ▼                                   ▼
┌─────────────────────┐           ┌─────────────────────┐
│   API GATEWAY       │           │  ANALYTICS ENGINE   │
│   (Flask - port     │           │  (Spark/Python)     │
│    3000)            │           │  - Traitement       │
│                     │           │  - Indicateurs      │
│  Endpoints:         │           │  - Sentiment        │
│  /api/crypto/prices │           └─────────────────────┘
│  /api/crypto/news   │
│  /health            │
└──────┬──────────────┘
       │
       ├─────────────────┬─────────────────────┐
       │                 │                     │
       ▼                 ▼                     ▼
┌─────────────┐  ┌─────────────┐     ┌──────────────┐
│  FLUTTER    │  │  STREAMLIT  │     │  KAFKA UI    │
│  APP        │  │  DASHBOARD  │     │  (port 8090) │
│             │  │  (port 8501)│     │              │
│  - Mobile   │  │             │     │  - Monitoring│
│  - Desktop  │  │  - Charts   │     │  - Topics    │
│  - Web      │  │  - Metrics  │     │  - Messages  │
└─────────────┘  └─────────────┘     └──────────────┘
```

---

## Composants Détaillés

### 1. Application Flutter (Mobile/Desktop)

**Localisation** : `crypto_viz_app/`

#### Technologies
- **Framework** : Flutter 3.24+
- **Langage** : Dart
- **État** : Provider pattern
- **HTTP** : package `http`
- **Charts** : fl_chart

#### Structure
```
crypto_viz_app/
├── lib/
│   ├── main.dart                    # Point d'entrée
│   ├── models/                      # Modèles de données
│   │   ├── crypto_model.dart        # Modèle crypto
│   │   └── news_model.dart          # Modèle actualités
│   ├── providers/                   # Gestion d'état
│   │   └── crypto_provider.dart     # Provider principal
│   ├── screens/                     # Écrans de l'app
│   │   ├── dark_home_screen.dart    # Écran principal (actif)
│   │   ├── analytics_screen.dart    # Analytics avancés
│   │   └── ...                      # Autres thèmes d'écrans
│   ├── services/                    # Services API
│   │   ├── crypto_service.dart      # Service principal (connecte à API Gateway)
│   │   ├── coingecko_service.dart   # Service CoinGecko (fallback)
│   │   └── crypto_news_service.dart # Service actualités
│   ├── widgets/                     # Widgets réutilisables
│   │   ├── dark_crypto_card.dart    # Carte crypto
│   │   ├── dark_news_card.dart      # Carte actualité
│   │   ├── advanced_charts.dart     # Graphiques avancés
│   │   └── ...                      # Autres widgets
│   └── utils/                       # Utilitaires
│       └── formatters.dart          # Formatage nombres
└── pubspec.yaml                     # Dépendances Flutter
```

#### Fonctionnalités Flutter
- ✅ Affichage prix en temps réel
- ✅ Graphiques interactifs avec mini-charts
- ✅ Actualités crypto françaises
- ✅ Variations 24h avec couleurs
- ✅ Market cap et volumes
- ✅ Interface dark mode moderne
- ✅ Connexion à l'API Gateway (port 3000)
- ✅ Fallback CoinGecko si API down
- ✅ Badge LIVE quand données Kafka actives

#### Points d'entrée
- **Main screen** : `dark_home_screen.dart`
- **Service principal** : `crypto_service.dart` → connecte à `http://localhost:3000/api`

---

### 2. Dashboard Streamlit (Web Analytics)

**Localisation** : `dashboard/streamlit_dashboard.py`

#### Technologies
- **Framework** : Streamlit
- **Langage** : Python
- **Charts** : Plotly, Matplotlib
- **Data** : Pandas

#### Fonctionnalités Streamlit
- Graphiques avancés de prix
- Indicateurs techniques (RSI, MACD, SMA, EMA)
- Bollinger Bands
- Volume analysis
- Sentiment analysis des actualités
- Tableaux de corrélation
- Export de données

#### Lancement
```bash
streamlit run dashboard/streamlit_dashboard.py
```
Port par défaut : **8501**

---

### 3. Backend - API Gateway (Flask)

**Localisation** : `api-gateway/app.py`

#### Endpoints

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/health` | GET | Statut de l'API |
| `/api/crypto/prices` | GET | Prix cryptos depuis Kafka |
| `/api/crypto/news` | GET | Actualités depuis Kafka |
| `/api/crypto/trending` | GET | Cryptos tendance |
| `/api/indicators/{symbol}` | GET | Indicateurs techniques |

#### Configuration
- **Port** : 3000
- **CORS** : Activé (pour Flutter web)
- **Cache** : En mémoire
- **Source** : Kafka topics via consumer

---

### 4. Data Ingestion (Kafka Producer)

**Localisation** : `data-ingestion/kafka_crypto_producer.py`

#### Rôle
- Collecte données CoinGecko toutes les 30 secondes
- Scrape RSS feeds crypto français
- Envoi vers topics Kafka
- Logging des activités

#### Topics Kafka produits
- `crypto-prices` : Prix, volumes, market cap
- `crypto-news` : Actualités, sentiment
- `crypto-alerts` : Alertes générées

---

### 5. Message Broker (Kafka)

**Configuration** : `docker/docker-compose.kafka.yml`

#### Services Docker
- **Zookeeper** (port 2181) : Coordination Kafka
- **Kafka Broker** (port 9092) : Broker de messages
- **Kafka UI** (port 8090) : Interface web

#### Topics
```
crypto-prices      : Prix et métriques crypto
crypto-news        : Actualités et sentiment
crypto-alerts      : Alertes techniques
processed-data     : Données traitées par Spark
```

---

## Flux de Données

### Flux Principal (Flutter App)

```
1. Producteur Kafka collecte données CoinGecko
   └─> Envoie vers topic "crypto-prices"

2. API Gateway consomme le topic Kafka
   └─> Met en cache les dernières données
   └─> Expose via endpoint REST /api/crypto/prices

3. Flutter App appelle l'API Gateway
   └─> Affiche les données en temps réel
   └─> Badge LIVE si source = "kafka-stream"
   └─> Fallback CoinGecko si API down
```

### Flux Alternatif (Streamlit Dashboard)

```
1. Dashboard Streamlit lit directement depuis Kafka
   OU
2. Dashboard appelle l'API Gateway
   └─> Affiche graphiques avancés
   └─> Calcule indicateurs techniques
```

---

## Différences Clés : Flutter vs Streamlit

| Aspect | Flutter App | Streamlit Dashboard |
|--------|-------------|---------------------|
| **Type** | Application native (mobile/desktop) | Web app Python |
| **Technologie** | Dart + Flutter | Python + Streamlit |
| **Interface** | Mobile-first, moderne | Desktop-first, analytique |
| **Usage** | Consultation rapide, suivi portfolio | Analyse approfondie, recherche |
| **Graphiques** | Simples, interactifs (fl_chart) | Avancés, techniques (Plotly) |
| **Données** | Via API Gateway REST | Direct Kafka ou API Gateway |
| **Cible** | Utilisateurs finaux, traders | Analystes, data scientists |
| **Indicateurs** | Prix, variations, news | RSI, MACD, Bollinger, corrélations |

---

## Services et Ports

| Service | Port | URL | Accessible depuis |
|---------|------|-----|-------------------|
| API Gateway | 3000 | http://localhost:3000 | Flutter, Streamlit, Browser |
| Kafka Broker | 9092 | localhost:9092 | Interne (Producteur, Consommateurs) |
| Zookeeper | 2181 | localhost:2181 | Interne (Kafka) |
| Kafka UI | 8090 | http://localhost:8090 | Browser |
| Streamlit | 8501 | http://localhost:8501 | Browser |
| Flutter App | - | - | Application native |

---

## Lancement des Applications

### Lancer TOUT le Backend

```bash
bash start_system.sh
```

Cela démarre :
- Kafka + Zookeeper
- Producteur Kafka
- API Gateway Flask

### Lancer Flutter App

```bash
cd crypto_viz_app
flutter run -d linux
```

### Lancer Streamlit Dashboard

```bash
streamlit run dashboard/streamlit_dashboard.py
```

---

## Cas d'Usage

### Utiliser l'Application Flutter (Mobile/Desktop)

**Objectif** : Suivi rapide des cryptos, consultation des prix, lecture des actualités

**Étapes** :
1. Lancer le backend : `bash start_system.sh`
2. Attendre 1 minute
3. Lancer Flutter : `cd crypto_viz_app && flutter run -d linux`
4. L'app affiche les cryptos avec badge LIVE

**Avantages** :
- Interface moderne et rapide
- Consultation mobile
- Notifications (à venir)
- Mode hors ligne avec fallback CoinGecko

### Utiliser le Dashboard Streamlit (Analyse)

**Objectif** : Analyse technique approfondie, backtesting, recherche

**Étapes** :
1. Lancer le backend : `bash start_system.sh`
2. Lancer Streamlit : `streamlit run dashboard/streamlit_dashboard.py`
3. Ouvrir http://localhost:8501

**Avantages** :
- Graphiques techniques avancés
- Indicateurs multiples (RSI, MACD, Bollinger)
- Export des données
- Analyse de corrélation

---

## Dépendances

### Python (Backend)
```
kafka-python>=2.0.2
flask==2.3.3
flask-cors==4.0.0
requests
pyspark>=3.4.0
streamlit
plotly
pandas
```

### Dart (Flutter)
```yaml
dependencies:
  flutter:
    sdk: flutter
  provider: ^6.1.2
  http: ^1.2.2
  fl_chart: ^0.68.0
  intl: ^0.19.0
  shared_preferences: ^2.2.2
```

---

## Architecture Réseau

```
┌─────────────────────────────────────────────────────────────┐
│                     LOCALHOST                                │
│                                                              │
│  ┌──────────┐    ┌──────────┐    ┌───────────┐            │
│  │  Kafka   │◄───│ Producer │    │   API     │            │
│  │  :9092   │    │          │    │ Gateway   │            │
│  │          │    └──────────┘    │  :3000    │            │
│  └────┬─────┘                    └─────┬─────┘            │
│       │                                 │                   │
│       ├─────────────────────────────────┼──────────────┐   │
│       │                                 │              │   │
│  ┌────▼────┐                      ┌────▼────┐   ┌────▼───┐│
│  │ Kafka   │                      │ Flutter │   │Stream- ││
│  │  UI     │                      │  App    │   │ lit    ││
│  │ :8090   │                      │         │   │ :8501  ││
│  └─────────┘                      └─────────┘   └────────┘│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Évolution Future

### Phase 1 (Actuelle)
- ✅ Backend Kafka + API Flask
- ✅ Application Flutter fonctionnelle
- ✅ Dashboard Streamlit
- ✅ Collecte données CoinGecko
- ✅ Actualités RSS

### Phase 2 (À venir)
- [ ] Alertes personnalisées
- [ ] Gestion de portefeuille
- [ ] Notifications push
- [ ] Authentification utilisateurs
- [ ] WebSocket pour données temps réel
- [ ] Support multi-exchange (Binance, Coinbase)

### Phase 3 (Futur)
- [ ] Machine Learning (prédictions)
- [ ] Backtesting de stratégies
- [ ] Trading automatique
- [ ] API publique
- [ ] Application mobile native (iOS/Android build)

---

## FAQ

### Pourquoi deux applications (Flutter + Streamlit) ?

**Flutter** : Pour une expérience utilisateur moderne, mobile-first, avec interface rapide et intuitive.

**Streamlit** : Pour les analystes qui ont besoin d'outils avancés, de graphiques techniques, et de capacités de recherche/export.

### Laquelle utiliser ?

- **Vous voulez consulter rapidement les prix** → Flutter App
- **Vous voulez faire de l'analyse technique** → Streamlit Dashboard
- **Vous êtes trader mobile** → Flutter App
- **Vous êtes analyste/chercheur** → Streamlit Dashboard

### Peut-on utiliser les deux en même temps ?

**Oui !** Les deux applications partagent le même backend (Kafka + API Gateway).

---

**Date** : 13 Novembre 2025
**Version** : 1.0
**Auteur** : Équipe T-DAT-901
