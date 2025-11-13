# T-DAT-901 - Application Crypto Analytics en Temps Réel

Application complète de visualisation et d'analytics des cryptomonnaies avec streaming de données en temps réel via Kafka/Spark et interface mobile Flutter.

---

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Prérequis](#prérequis)
4. [Installation Rapide](#installation-rapide)
5. [Lancement de l'Application](#lancement-de-lapplication)
6. [Utilisation](#utilisation)
7. [Dépannage](#dépannage)
8. [Structure du Projet](#structure-du-projet)

---

## Vue d'ensemble

Ce projet implémente une architecture de streaming de données en temps réel pour l'analyse des cryptomonnaies, combinant :

- **Backend** : Apache Kafka + API Gateway Flask
- **Frontend** : Application mobile Flutter (Linux/Windows/MacOS)
- **Data Sources** : CoinGecko API + RSS feeds crypto français
- **Visualisation** : Graphiques temps réel, indicateurs techniques, actualités

### Fonctionnalités

- Prix en temps réel des top 50 cryptomonnaies
- Graphiques de tendances avec mini-charts
- Actualités crypto en français
- Indicateurs de variation 24h
- Interface dark mode moderne
- Stream Kafka pour les données en temps réel

---

## Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│  CoinGecko API  │───▶│    Kafka     │───▶│  API Gateway    │
│   RSS Feeds     │    │   Broker     │    │    (Flask)      │
└─────────────────┘    └──────────────┘    └─────────────────┘
                              │                       │
                              ▼                       ▼
                       ┌──────────────┐    ┌─────────────────┐
                       │  Kafka UI    │    │  Flutter App    │
                       │  (port 8090) │    │  (Mobile/Desktop)│
                       └──────────────┘    └─────────────────┘
```

### Services et Ports

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| API Gateway | 3000 | http://localhost:3000 | API REST principale |
| Kafka Broker | 9092 | localhost:9092 | Broker de messages |
| Zookeeper | 2181 | localhost:2181 | Coordination Kafka |
| Kafka UI | 8090 | http://localhost:8090 | Interface web Kafka |

---

## Prérequis

### Système d'exploitation

- **Linux** (Ubuntu 20.04+ recommandé)
- **Windows** avec WSL2 (Ubuntu)
- **macOS** (10.15+)

### Logiciels requis

#### 1. Docker & Docker Compose

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose

# Démarrer Docker
sudo systemctl start docker
sudo systemctl enable docker

# Ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER
newgrp docker

# Vérifier
docker --version
docker-compose --version
```

**Version minimale** : Docker 20.10+, Docker Compose 1.29+

#### 2. Python 3.8+

```bash
# Vérifier
python3 --version

# Installer si nécessaire
sudo apt install python3 python3-pip python3-venv

# Vérifier pip
pip3 --version
```

#### 3. Flutter SDK

```bash
# Télécharger Flutter
cd ~
wget https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.24.0-stable.tar.xz

# Extraire
tar xf flutter_linux_3.24.0-stable.tar.xz

# Ajouter au PATH
echo 'export PATH="$PATH:$HOME/flutter/bin"' >> ~/.bashrc
source ~/.bashrc

# Installer dépendances Linux Desktop
sudo apt install clang cmake ninja-build pkg-config libgtk-3-dev liblzma-dev libstdc++-12-dev

# Activer support Linux
flutter config --enable-linux-desktop

# Vérifier
flutter doctor
```

**Version minimale** : Flutter 3.0+

---

## Installation Rapide

### Étape 1 : Cloner le Projet

```bash
# Si pas déjà fait
cd ~/Projects
git clone https://github.com/EpitechMscProPromo2026/T-DAT-901-PAR_10.git
cd T-DAT-901-PAR_10
```

### Étape 2 : Installer les Dépendances Python

```bash
# Créer l'environnement virtuel
python3 -m venv venv

# Activer l'environnement
source venv/bin/activate

# Installer les dépendances
pip install --upgrade pip
pip install -r requirements.txt
```

### Étape 3 : Installer les Dépendances Flutter

```bash
# Aller dans le dossier Flutter
cd crypto_viz_app

# Télécharger les dépendances
flutter pub get

# Retourner à la racine
cd ..
```

### Étape 4 : Vérifier Docker

```bash
# S'assurer que Docker est lancé
docker ps

# Si erreur, lancer Docker Desktop (Windows) ou démarrer le service (Linux)
sudo systemctl start docker  # Linux uniquement
```

---

## Lancement de l'Application

### Méthode Recommandée : Script Automatique

**Terminal 1 - Backend (Kafka + API)** :

```bash
cd ~/Projects/T-DAT-901-PAR_10

# S'assurer que Docker est lancé
docker ps

# Lancer le script de démarrage
bash start_system.sh
```

Le script va :
1. Créer/activer l'environnement virtuel Python
2. Démarrer Kafka et Zookeeper
3. Lancer le producteur de données Kafka
4. Démarrer l'API Gateway Flask

**Sortie attendue** :
```
🚀 Démarrage du système Kafka/Spark pour l'app Flutter Crypto
✅ Environnement virtuel trouvé
🔧 Démarrage de Kafka...
⏳ Attente du démarrage de Kafka (30 secondes)...
📡 Démarrage du producteur de données Kafka...
Producteur Kafka démarré avec PID: 12345
🌐 Démarrage de l'API Gateway...
API Gateway démarré avec PID: 12346

✅ Système démarré avec succès !

📊 Services disponibles:
- Kafka UI: http://localhost:8090
- API Gateway: http://localhost:3000/health
```

**Terminal 2 - Application Flutter** (nouveau terminal) :

```bash
cd ~/Projects/T-DAT-901-PAR_10/crypto_viz_app

# Lancer l'application
flutter run -d linux

# Ou pour Web
flutter run -d chrome

# Ou pour Windows (si sur Windows)
flutter run -d windows
```

L'application devrait se lancer en 30-60 secondes.

---

## Vérification

### 1. Vérifier Kafka UI

Ouvrir dans le navigateur : **http://localhost:8090**

Vous devriez voir :
- Dashboard Kafka UI
- Topics : `crypto-prices`, `crypto-news`, `crypto-alerts`, `processed-data`
- Messages en temps réel

### 2. Vérifier l'API Gateway

```bash
# Test de santé
curl http://localhost:3000/health

# Réponse attendue :
{
  "status": "healthy",
  "cached_prices": 5,
  "cached_news": 0,
  "timestamp": "2025-11-13T14:52:48"
}

# Test des prix
curl http://localhost:3000/api/crypto/prices
```

### 3. Vérifier les Services Docker

```bash
docker ps
```

Vous devriez voir 3 containers :
- `kafka` (port 9092)
- `zookeeper` (port 2181)
- `kafka-ui` (port 8090)

### 4. Vérifier les Logs

```bash
# Logs du producteur Kafka
tail -f kafka_producer.log

# Logs de l'API Gateway
tail -f api_gateway.log

# Logs Docker
docker logs kafka
docker logs zookeeper
```

---

## Utilisation

### Interface Flutter

L'application Flutter affiche :

#### Dashboard Principal
- **Prix en temps réel** des cryptomonnaies
- **Graphiques** de tendances (mini-charts)
- **Variations 24h** (en vert si positif, en rouge si négatif)
- **Market cap** et volume d'échange
- **Icônes** des cryptos

#### Sections
- **Home** : Portfolio et assets
- **News** : Actualités crypto en français
- **Alerts** : Alertes de prix (à venir)
- **More** : Paramètres et options

#### Badge LIVE
Quand le badge "🔴 LIVE" est affiché, cela signifie que les données proviennent directement du stream Kafka en temps réel.

### Raccourcis Flutter

Dans le terminal Flutter :
- **R** : Hot reload (recharge l'interface)
- **Shift + R** : Hot restart (redémarre l'app)
- **Q** : Quitter l'application
- **H** : Aide

---

## Arrêt des Services

### Arrêt Propre

```bash
# Arrêter les processus Python
pkill -f kafka_crypto_producer
pkill -f "python.*app.py"

# Arrêter Kafka
docker-compose -f docker/docker-compose.kafka.yml down

# Quitter Flutter (dans son terminal)
# Appuyez sur Q ou Ctrl+C
```

### Arrêt avec Nettoyage Complet

```bash
# Arrêter tout
pkill -f kafka_crypto_producer
pkill -f "python.*app.py"

# Arrêter et supprimer containers + volumes
docker-compose -f docker/docker-compose.kafka.yml down -v

# Nettoyer Docker (ATTENTION: supprime tout)
docker system prune -f
```

---

## Dépannage

### Problème : "flutter: command not found"

**Solution** :
```bash
# Vérifier le PATH
echo $PATH | grep flutter

# Si absent, ajouter Flutter au PATH
echo 'export PATH="$PATH:$HOME/flutter/bin"' >> ~/.bashrc
source ~/.bashrc

# Vérifier
flutter --version
```

### Problème : "Connection refused" port 3000

**Cause** : L'API Gateway n'est pas lancée

**Solution** :
```bash
cd ~/Projects/T-DAT-901-PAR_10
source venv/bin/activate
python api-gateway/app.py
```

### Problème : "Cannot connect to Docker daemon"

**Windows avec WSL2** :
1. Lancez Docker Desktop sur Windows
2. Attendez qu'il soit complètement démarré
3. Dans WSL2 : `docker ps`

**Linux** :
```bash
sudo systemctl start docker
sudo usermod -aG docker $USER
newgrp docker
```

### Problème : Application Flutter affiche "Error loading data"

**Vérifications** :

1. **Kafka est-il lancé ?**
   ```bash
   docker ps
   # Doit montrer kafka, zookeeper, kafka-ui
   ```

2. **API Gateway répond-elle ?**
   ```bash
   curl http://localhost:3000/health
   ```

3. **Le producteur Kafka tourne-t-il ?**
   ```bash
   tail -f kafka_producer.log
   # Doit montrer des messages de collecte
   ```

4. **Redémarrer les services** :
   ```bash
   bash start_system.sh
   ```

5. **Dans Flutter, appuyez sur "Retry"**

### Problème : "Port already in use"

**Solution** :
```bash
# Trouver le processus utilisant le port
sudo lsof -i :3000   # Pour l'API
sudo lsof -i :9092   # Pour Kafka

# Tuer le processus (remplacer PID)
kill -9 <PID>
```

### Problème : Module Python manquant

**Solution** :
```bash
# Activer l'environnement virtuel
source venv/bin/activate

# Réinstaller les dépendances
pip install -r requirements.txt
```

---

## Structure du Projet

```
T-DAT-901-PAR_10/
├── analytics/                  # Processeurs analytics Spark
├── api-gateway/               # API Gateway Flask
│   ├── app.py                # Point d'entrée API
│   └── requirements.txt      # Dépendances API
├── crypto_viz_app/           # Application Flutter
│   ├── lib/                  # Code source Flutter
│   │   ├── main.dart        # Point d'entrée Flutter
│   │   ├── models/          # Modèles de données
│   │   ├── providers/       # Gestion d'état (Provider)
│   │   ├── screens/         # Écrans de l'app
│   │   ├── services/        # Services API
│   │   └── widgets/         # Widgets réutilisables
│   └── pubspec.yaml         # Dépendances Flutter
├── dashboard/                # Dashboard Streamlit (optionnel)
├── data-ingestion/           # Producteurs Kafka
│   ├── kafka_crypto_producer.py  # Producteur principal
│   └── crypto_data_collector.py  # Collecteur de données
├── docker/                   # Configurations Docker
│   ├── docker-compose.kafka.yml  # Config Kafka
│   └── docker-compose.full.yml   # Config complète
├── docs/                     # Documentation
├── spark/                    # Processeurs Spark
├── storage/                  # Gestion DuckDB
├── venv/                     # Environnement virtuel Python (ignoré par Git)
├── .gitignore               # Fichiers à ignorer
├── requirements.txt         # Dépendances Python globales
├── start_system.sh          # Script de démarrage automatique
├── README.md                # Ce fichier
├── GUIDE_RAPIDE_INSTALLATION.md  # Guide rapide
└── INSTALLATION_GUIDE.md    # Guide détaillé

Fichiers générés (ignorés par Git) :
├── kafka_producer.log       # Logs producteur
├── api_gateway.log          # Logs API
└── crypto_analytics.db      # Base de données DuckDB
```

---

## Technologies Utilisées

### Backend
- **Apache Kafka** 2.6 : Streaming de données
- **Python** 3.8+ : Logique métier
- **Flask** 2.3.3 : API REST
- **Docker** : Containerisation

### Frontend
- **Flutter** 3.24+ : Framework mobile/desktop
- **Dart** : Langage de programmation
- **Provider** : Gestion d'état
- **fl_chart** : Graphiques
- **http** : Requêtes API

### Data Sources
- **CoinGecko API** : Prix et données crypto
- **RSS Feeds** : Actualités crypto françaises

---

## Commandes Utiles

```bash
# Vérifier les services
docker ps
docker-compose -f docker/docker-compose.kafka.yml ps

# Voir les logs
tail -f kafka_producer.log
tail -f api_gateway.log
docker logs kafka -f
docker logs zookeeper -f

# Tester l'API
curl http://localhost:3000/health
curl http://localhost:3000/api/crypto/prices | jq
curl http://localhost:3000/api/crypto/news | jq

# Redémarrer Kafka
docker-compose -f docker/docker-compose.kafka.yml restart

# Flutter
flutter clean                    # Nettoyer cache
flutter pub get                  # Récupérer dépendances
flutter run -d linux            # Lancer sur Linux
flutter run -d chrome           # Lancer sur Web
flutter doctor                  # Diagnostic Flutter
```

---

## Checklist de Démarrage

- [ ] Docker est installé et lancé
- [ ] Python 3.8+ est installé
- [ ] Flutter SDK est installé et dans le PATH
- [ ] Repository cloné localement
- [ ] Environnement virtuel Python créé (`venv`)
- [ ] Dépendances Python installées (`pip install -r requirements.txt`)
- [ ] Dépendances Flutter installées (`flutter pub get`)
- [ ] Script `start_system.sh` est exécutable
- [ ] Lancer `bash start_system.sh`
- [ ] Attendre 1 minute que les services démarrent
- [ ] Vérifier Kafka UI : http://localhost:8090
- [ ] Vérifier API : `curl http://localhost:3000/health`
- [ ] Lancer Flutter : `cd crypto_viz_app && flutter run -d linux`
- [ ] Profiter de l'application !

---

## Support et Contribution

Pour toute question ou problème :

1. Vérifiez cette documentation
2. Consultez les logs : `kafka_producer.log`, `api_gateway.log`
3. Vérifiez les issues GitHub du projet
4. Contactez l'équipe de développement

---

## Licence

Projet académique - Epitech MSc Pro 2026

---

**Dernière mise à jour** : 13 Novembre 2025
**Version** : 1.0.0
**Testé sur** : Ubuntu 22.04 LTS, WSL2 Ubuntu, Windows 11
