# 📦 Guide d'Installation et de Lancement - T-DAT-901 Crypto Platform

Guide complet pour installer et lancer l'application de visualisation crypto avec Kafka/Spark et Flutter.

---

## Table des Matières

1. [Prérequis](#prérequis)
2. [Installation](#installation)
3. [Lancement](#lancement)
4. [Vérification](#vérification)
5. [Utilisation](#utilisation)
6. [Arrêt](#arrêt)
7. [Dépannage](#dépannage)

---

# 📋 Prérequis

## Système d'exploitation

- **Linux** (Ubuntu 20.04+ recommandé)
- **Windows** avec WSL2 (Ubuntu)
- **macOS** (10.15+)

## Logiciels à installer

### 1. Docker & Docker Compose

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose

# Démarrer Docker
sudo systemctl start docker
sudo systemctl enable docker

# Ajouter votre utilisateur au groupe docker (éviter sudo)
sudo usermod -aG docker $USER
newgrp docker

# Vérifier l'installation
docker --version
docker-compose --version
```

**Version minimale** : Docker 20.10+ , Docker Compose 1.29+

### 2. Python 3.8+

```bash
# Vérifier la version installée
python3 --version

# Installer Python et pip si nécessaire
sudo apt install python3 python3-pip python3-venv

# Vérifier pip
pip3 --version
```

**Version minimale** : Python 3.8+

### 3. Flutter SDK

```bash
# Télécharger Flutter (version stable)
cd ~
wget https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.24.0-stable.tar.xz

# Extraire
tar xf flutter_linux_3.24.0-stable.tar.xz

# Ajouter Flutter au PATH
echo 'export PATH="$PATH:$HOME/flutter/bin"' >> ~/.bashrc
source ~/.bashrc

# Vérifier l'installation
flutter doctor

# Installer les dépendances système pour Linux Desktop
sudo apt install clang cmake ninja-build pkg-config libgtk-3-dev liblzma-dev libstdc++-12-dev

# Activer le support Linux
flutter config --enable-linux-desktop
```

**Version minimale** : Flutter 3.0+

### 4. Git

```bash
sudo apt install git
git --version
```

---

# 🔧 Installation

## Étape 1 : Cloner le Repository

```bash
# Créer le dossier Projects si nécessaire
mkdir -p ~/Projects
cd ~/Projects

# Cloner le projet
git clone https://github.com/EpitechMscProPromo2026/T-DAT-901-PAR_10.git

# Entrer dans le dossier
cd T-DAT-901-PAR_10
```

## Étape 2 : Configurer l'Environnement Python

```bash
# Créer un environnement virtuel Python
python3 -m venv venv

# Activer l'environnement virtuel
source venv/bin/activate

# Mettre à jour pip
pip install --upgrade pip

# Installer les dépendances Python
pip install kafka-python requests lxml flask flask-cors pyspark
```

Vous devriez voir `(venv)` au début de votre prompt.

## Étape 3 : Installer les Dépendances Flutter

```bash
# Aller dans le dossier de l'app Flutter
cd crypto_viz_app

# Télécharger les dépendances
flutter pub get

# Vérifier qu'il n'y a pas d'erreurs
flutter doctor

# Retourner à la racine
cd ..
```

## Étape 4 : Rendre le Script Exécutable

```bash
# Donner les permissions d'exécution
chmod +x start_system.sh

# Vérifier
ls -la start_system.sh
```

Vous devriez voir `-rwxr-xr-x` au début de la ligne.

---

# 🚀 Lancement

## Méthode 1 : Démarrage Automatique (RECOMMANDÉ)

Cette méthode démarre tous les services en une seule commande.

```bash
cd ~/Projects/T-DAT-901-PAR_10

# Lancer le script de démarrage
./start_system.sh
```

### Ce que fait le script :

1. ✅ Crée/active l'environnement virtuel Python
2. ✅ Démarre Kafka et Zookeeper via Docker
3. ✅ Attend 30 secondes que Kafka soit prêt
4. ✅ Lance le producteur de données crypto (background)
5. ✅ Démarre l'API Gateway Flask (background)

### Sortie attendue :

```
🚀 Démarrage du système Kafka/Spark pour l'app Flutter Crypto
✅ Environnement virtuel trouvé
🔧 Démarrage de Kafka...
⏳ Attente du démarrage de Kafka (30 secondes)...
🔍 Vérification des services Docker...
📡 Démarrage du producteur de données Kafka...
Producteur Kafka démarré avec PID: 12345
🌐 Démarrage de l'API Gateway...
API Gateway démarré avec PID: 12346

✅ Système démarré avec succès !

📊 Services disponibles:
- Kafka UI: http://localhost:8090
- API Gateway: http://localhost:3000/health

📝 Logs:
- Producteur Kafka: tail -f kafka_producer.log
- API Gateway: tail -f api_gateway.log

🛑 Pour arrêter le système:
kill 12345 12346 && docker-compose -f docker/docker-compose.kafka.yml down

🎯 Maintenant vous pouvez lancer l'app Flutter:
cd crypto_viz_app && flutter run -d linux
```

**IMPORTANT** : Notez les PIDs affichés, vous en aurez besoin pour arrêter les services.

### Lancer l'Application Flutter

Ouvrez un **NOUVEAU TERMINAL** et exécutez :

```bash
cd ~/Projects/T-DAT-901-PAR_10/crypto_viz_app

# Pour Linux Desktop
flutter run -d linux

# Ou pour Web
flutter run -d chrome

# Ou pour Windows (si sur Windows)
flutter run -d windows
```

L'application devrait se lancer en 30-60 secondes.

---

## Méthode 2 : Démarrage Manuel (Étape par étape)

Si vous préférez contrôler chaque étape manuellement.

### Terminal 1 : Kafka

```bash
cd ~/Projects/T-DAT-901-PAR_10

# Démarrer Kafka en mode détaché
docker-compose -f docker/docker-compose.kafka.yml up -d

# Attendre 30 secondes
sleep 30

# Vérifier que les services tournent
docker ps
```

Vous devriez voir 3 containers :
- `zookeeper` (port 2181)
- `kafka` (port 9092)
- `kafka-ui` (port 8090)

### Terminal 2 : Producteur Kafka

```bash
cd ~/Projects/T-DAT-901-PAR_10

# Activer l'environnement virtuel
source venv/bin/activate

# Lancer le producteur (laissez ce terminal ouvert)
python data-ingestion/kafka_crypto_producer.py
```

Vous devriez voir des messages comme :
```
Envoi de 50 prix crypto vers Kafka...
Envoi de 15 actualités vers Kafka...
```

### Terminal 3 : API Gateway

```bash
cd ~/Projects/T-DAT-901-PAR_10

# Activer l'environnement virtuel
source venv/bin/activate

# Lancer l'API Gateway (laissez ce terminal ouvert)
python api-gateway/app.py
```

Vous devriez voir :
```
 * Running on http://0.0.0.0:3000
 * Debug mode: off
```

### Terminal 4 : Flutter App

```bash
cd ~/Projects/T-DAT-901-PAR_10/crypto_viz_app

# Lancer l'application Flutter
flutter run -d linux
```

---

# ✅ Vérification

Assurez-vous que tous les services fonctionnent correctement.

## 1. Vérifier Kafka UI

Ouvrez votre navigateur : **http://localhost:8090**

Vous devriez voir :
- Dashboard Kafka UI
- Topics : `crypto-prices`, `crypto-news`, `crypto-alerts`, `processed-data`
- Messages en temps réel dans les topics

## 2. Vérifier l'API Gateway

### Test de santé :
```bash
curl http://localhost:3000/health
```

Réponse attendue :
```json
{
  "status": "healthy",
  "kafka": "connected",
  "timestamp": "2025-10-30T14:30:00"
}
```

### Test des prix :
```bash
curl http://localhost:3000/api/crypto/prices
```

Vous devriez recevoir un JSON avec les prix des cryptos.

### Test des actualités :
```bash
curl http://localhost:3000/api/crypto/news
```

## 3. Vérifier les Logs

```bash
# Logs du producteur Kafka
tail -f kafka_producer.log

# Logs de l'API Gateway
tail -f api_gateway.log

# Logs Docker Kafka
docker logs kafka

# Logs Docker Zookeeper
docker logs zookeeper
```

## 4. Vérifier Docker

```bash
docker ps
```

Sortie attendue :
```
CONTAINER ID   IMAGE                    STATUS         PORTS
abc123...      confluentinc/cp-kafka    Up 2 minutes   0.0.0.0:9092->9092/tcp
def456...      confluentinc/cp-zookeeper Up 2 minutes  0.0.0.0:2181->2181/tcp
ghi789...      provectuslabs/kafka-ui   Up 2 minutes   0.0.0.0:8090->8090/tcp
```

---

# 🎮 Utilisation de l'Application

## Interface Flutter

L'application Flutter affiche :

### 1. Dashboard Principal
- **Prix en temps réel** des top 50 cryptomonnaies
- **Graphiques** de tendances
- **Variations 24h** (positives en vert, négatives en rouge)
- **Market cap** et volume d'échange

### 2. Actualités Crypto
- **Fil d'actualités** en français
- Sources : Journal du Coin, Cryptoast, CoinTribune
- **Mise à jour automatique** toutes les 30 secondes
- Badge **🔴 LIVE** quand les données viennent de Kafka

### 3. Détails par Crypto
- Cliquez sur une crypto pour voir les détails
- **Historique** des prix
- **Informations** complètes (supply, market cap, volume)
- **Graphiques** de variations

### 4. Recherche
- Recherchez une crypto par nom ou symbole
- Filtrage en temps réel

## Raccourcis Clavier Flutter

- **R** : Hot reload (recharge l'interface)
- **Shift + R** : Hot restart (redémarre l'app)
- **Q** : Quitter l'application
- **H** : Aide

---

# 🛑 Arrêt des Services

## Arrêt Propre

Si vous avez utilisé `start_system.sh`, vous avez reçu des PIDs au démarrage.

```bash
# Arrêter les processus Python (remplacez par vos PIDs)
kill 12345 12346

# Arrêter Kafka et Docker
docker-compose -f docker/docker-compose.kafka.yml down
```

## Arrêt Complet avec Nettoyage

```bash
# Arrêter tous les processus Python
pkill -f kafka_crypto_producer
pkill -f "python.*app.py"

# Arrêter et supprimer les containers
docker-compose -f docker/docker-compose.kafka.yml down

# Nettoyer les volumes (ATTENTION: supprime toutes les données)
docker-compose -f docker/docker-compose.kafka.yml down -v

# Nettoyer Docker complètement
docker system prune -f
```

## Quitter Flutter

Dans le terminal où Flutter tourne, appuyez sur **Q** ou **Ctrl+C**.

---

# 🔧 Dépannage

## Problème : "Connection refused" dans Flutter

**Symptôme** : L'app Flutter affiche "Erreur service news: Connection refused"

**Cause** : L'API Gateway n'est pas démarrée ou n'écoute pas sur le bon port

**Solution** :
```bash
# Vérifier que l'API tourne
curl http://localhost:3000/health

# Si erreur 404 ou timeout, redémarrer l'API
cd ~/Projects/T-DAT-901-PAR_10
source venv/bin/activate
python api-gateway/app.py
```

## Problème : Kafka ne démarre pas

**Symptôme** : `docker ps` ne montre pas les containers Kafka

**Solution** :
```bash
# Voir les logs d'erreur
docker-compose -f docker/docker-compose.kafka.yml logs

# Arrêter proprement
docker-compose -f docker/docker-compose.kafka.yml down

# Nettoyer les volumes corrompus
docker volume prune -f
docker system prune -f

# Redémarrer
docker-compose -f docker/docker-compose.kafka.yml up -d
```

## Problème : "Permission denied" sur start_system.sh

**Solution** :
```bash
chmod +x start_system.sh
```

Ou lancez avec `bash` :
```bash
bash start_system.sh
```

## Problème : Flutter SDK introuvable

**Symptôme** : `flutter: command not found`

**Solution** :
```bash
# Vérifier le PATH
echo $PATH | grep flutter

# Si vide, ajouter Flutter au PATH
echo 'export PATH="$PATH:$HOME/flutter/bin"' >> ~/.bashrc
source ~/.bashrc

# Vérifier à nouveau
flutter --version
```

## Problème : Pas de données dans l'app

**Cause possible** : Le producteur Kafka ne tourne pas ou Kafka n'a pas de données

**Solution** :

1. Vérifier Kafka UI : http://localhost:8090
   - Les topics doivent exister
   - Des messages doivent être présents

2. Vérifier le producteur :
```bash
tail -f kafka_producer.log
```
Vous devez voir des messages toutes les 30 secondes.

3. Redémarrer le producteur :
```bash
source venv/bin/activate
python data-ingestion/kafka_crypto_producer.py
```

## Problème : Port déjà utilisé

**Symptôme** : `Error: Port 3000 already in use`

**Solution** :
```bash
# Trouver le processus utilisant le port 3000
sudo lsof -i :3000

# Ou pour le port 9092 (Kafka)
sudo lsof -i :9092

# Tuer le processus (remplacer PID)
kill -9 <PID>
```

## Problème : Docker permission denied

**Symptôme** : `permission denied while trying to connect to Docker daemon`

**Solution** :
```bash
# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER

# Réactiver le groupe
newgrp docker

# Ou redémarrer la session
```

## Problème : Python module not found

**Symptôme** : `ModuleNotFoundError: No module named 'kafka'`

**Solution** :
```bash
# Activer l'environnement virtuel
source venv/bin/activate

# Réinstaller les dépendances
pip install kafka-python requests lxml flask flask-cors
```

## Problème : Flutter build errors

**Solution** :
```bash
cd crypto_viz_app

# Nettoyer le cache Flutter
flutter clean

# Récupérer les dépendances
flutter pub get

# Vérifier les problèmes
flutter doctor

# Rebuild
flutter run -d linux
```

---

# 📊 Services et Ports

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| API Gateway | 3000 | http://localhost:3000 | API REST principale |
| Kafka Broker | 9092 | localhost:9092 | Broker Kafka |
| Zookeeper | 2181 | localhost:2181 | Coordination Kafka |
| Kafka UI | 8090 | http://localhost:8090 | Interface web Kafka |
| Flutter App | - | - | Application desktop |

---

# 📝 Commandes Utiles

```bash
# Vérifier les services Docker
docker ps

# Voir les logs Kafka
docker logs kafka -f

# Voir les logs du producteur
tail -f kafka_producer.log

# Voir les logs de l'API
tail -f api_gateway.log

# Tester l'API
curl http://localhost:3000/health
curl http://localhost:3000/api/crypto/prices | jq

# Redémarrer Kafka
docker-compose -f docker/docker-compose.kafka.yml restart

# Flutter hot reload (dans l'app en cours)
# Appuyez sur 'r' dans le terminal
```

---

# 🎯 Checklist de Démarrage Rapide

- [ ] Docker installé et démarré
- [ ] Python 3.8+ installé
- [ ] Flutter SDK installé et dans le PATH
- [ ] Repository cloné
- [ ] Environnement virtuel Python créé
- [ ] Dépendances Python installées
- [ ] Dépendances Flutter installées (`flutter pub get`)
- [ ] Script `start_system.sh` exécutable
- [ ] Lancer `./start_system.sh`
- [ ] Attendre 1 minute
- [ ] Vérifier Kafka UI : http://localhost:8090
- [ ] Vérifier API : `curl http://localhost:3000/health`
- [ ] Lancer Flutter : `flutter run -d linux`
- [ ] Profiter de l'application ! 🎉

---

# 📞 Support

Pour toute question ou problème :

1. Vérifiez d'abord cette documentation
2. Consultez les logs : `kafka_producer.log`, `api_gateway.log`
3. Vérifiez les issues GitHub du projet
4. Contactez l'équipe de développement

---

**Dernière mise à jour** : 30 Octobre 2025
**Version du guide** : 1.0.0
**Testé sur** : Ubuntu 22.04 LTS, WSL2 Ubuntu
