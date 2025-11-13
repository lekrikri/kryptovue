# Guide Rapide - Installation et Lancement de l'Application Flutter Crypto

Ce guide simplifié vous aidera à installer et lancer l'application en quelques étapes.

---

## Problèmes Identifiés et Solutions

### 1. Flutter n'est pas installé sur votre système

**Symptôme** : La commande `flutter` n'est pas reconnue

**Solution WSL2 (Ubuntu)** :

```bash
# Aller dans votre répertoire home
cd ~

# Télécharger Flutter
wget https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.24.0-stable.tar.xz

# Extraire
tar xf flutter_linux_3.24.0-stable.tar.xz

# Ajouter Flutter au PATH
echo 'export PATH="$PATH:$HOME/flutter/bin"' >> ~/.bashrc
source ~/.bashrc

# Installer les dépendances Linux Desktop
sudo apt update
sudo apt install clang cmake ninja-build pkg-config libgtk-3-dev liblzma-dev libstdc++-12-dev

# Activer le support Linux Desktop
flutter config --enable-linux-desktop

# Vérifier l'installation
flutter doctor
```

### 2. Docker n'est pas démarré

**Symptôme** : Erreur "cannot connect to Docker daemon"

**Solution Windows avec WSL2** :

1. Lancez **Docker Desktop** sur Windows
2. Attendez que Docker soit complètement démarré (icône dans la barre des tâches)
3. Dans WSL2, vérifiez avec : `docker ps`

**Solution Linux natif** :

```bash
# Démarrer Docker
sudo systemctl start docker

# Vérifier
docker ps
```

---

## Installation Complète (Première fois)

### Étape 1 : Installer les Prérequis

```bash
# Entrer dans WSL2 Ubuntu (si vous êtes sur Windows)
wsl

# Installer Python et pip
sudo apt update
sudo apt install python3 python3-pip python3-venv

# Vérifier Docker
docker --version
```

### Étape 2 : Cloner/Accéder au Projet

```bash
# Aller dans le répertoire du projet
cd /home/lekrikri/Projects/T-DAT-901-PAR_10
```

### Étape 3 : Installer les Dépendances Python

```bash
# Créer l'environnement virtuel (si pas déjà fait)
python3 -m venv venv

# Activer l'environnement virtuel
source venv/bin/activate

# Installer les dépendances
pip install kafka-python requests lxml flask flask-cors pyspark
```

### Étape 4 : Installer les Dépendances Flutter

```bash
# Aller dans le dossier Flutter
cd crypto_viz_app

# Télécharger les dépendances
flutter pub get

# Retourner à la racine
cd ..
```

---

## Lancement de l'Application (À chaque fois)

### Option A : Lancement Automatique (RECOMMANDÉ)

**Terminal 1** - Dans WSL2 Ubuntu :

```bash
cd /home/lekrikri/Projects/T-DAT-901-PAR_10

# S'assurer que Docker Desktop est lancé (sur Windows)
docker ps

# Lancer le script de démarrage
bash start_system.sh
```

Attendez 1 minute que tous les services démarrent.

**Terminal 2** - Nouveau terminal WSL2 Ubuntu :

```bash
cd /home/lekrikri/Projects/T-DAT-901-PAR_10/crypto_viz_app

# Lancer l'application Flutter
flutter run -d linux
```

### Option B : Lancement Manuel (Étape par étape)

**Terminal 1 - Kafka** :

```bash
cd /home/lekrikri/Projects/T-DAT-901-PAR_10

# Démarrer Kafka
docker-compose -f docker/docker-compose.kafka.yml up -d

# Attendre 30 secondes
sleep 30

# Vérifier
docker ps
```

**Terminal 2 - Producteur Kafka** :

```bash
cd /home/lekrikri/Projects/T-DAT-901-PAR_10
source venv/bin/activate

# Lancer le producteur (laisser tourner)
python data-ingestion/kafka_crypto_producer.py
```

**Terminal 3 - API Gateway** :

```bash
cd /home/lekrikri/Projects/T-DAT-901-PAR_10
source venv/bin/activate

# Lancer l'API (laisser tourner)
python api-gateway/app.py
```

**Terminal 4 - Application Flutter** :

```bash
cd /home/lekrikri/Projects/T-DAT-901-PAR_10/crypto_viz_app

# Lancer l'application
flutter run -d linux
```

---

## Vérification que Tout Fonctionne

### 1. Vérifier Kafka UI

Ouvrez votre navigateur : **http://localhost:8090**

Vous devriez voir :
- Les topics Kafka : `crypto-prices`, `crypto-news`, etc.
- Des messages qui arrivent en temps réel

### 2. Vérifier l'API Gateway

Dans un terminal :

```bash
# Test de santé
curl http://localhost:3000/health

# Test des prix
curl http://localhost:3000/api/crypto/prices
```

### 3. Vérifier l'Application Flutter

L'application devrait afficher :
- Une liste de cryptomonnaies avec leurs prix
- Des graphiques
- Un indicateur "LIVE" si connecté à Kafka

---

## Arrêt Propre de l'Application

### Arrêter Flutter

Dans le terminal Flutter, appuyez sur **Q** ou **Ctrl+C**

### Arrêter les Services Backend

```bash
# Arrêter les processus Python (si lancés avec start_system.sh)
pkill -f kafka_crypto_producer
pkill -f "python.*app.py"

# Arrêter Kafka
cd /home/lekrikri/Projects/T-DAT-901-PAR_10
docker-compose -f docker/docker-compose.kafka.yml down
```

---

## Résolution des Problèmes Courants

### Problème : "flutter: command not found"

**Solution** :

```bash
# Vérifier que Flutter est bien installé
ls -la ~/flutter/bin/flutter

# Si oui, ajouter au PATH
echo 'export PATH="$PATH:$HOME/flutter/bin"' >> ~/.bashrc
source ~/.bashrc

# Vérifier à nouveau
flutter --version
```

### Problème : "Cannot connect to Docker daemon"

**Solution Windows** :
1. Lancez Docker Desktop sur Windows
2. Attendez qu'il soit complètement démarré
3. Dans WSL2 : `docker ps`

**Solution Linux** :
```bash
sudo systemctl start docker
sudo usermod -aG docker $USER
newgrp docker
```

### Problème : "Connection refused" port 3000

**Cause** : L'API Gateway n'est pas lancée

**Solution** :

```bash
cd /home/lekrikri/Projects/T-DAT-901-PAR_10
source venv/bin/activate
python api-gateway/app.py
```

### Problème : L'application Flutter ne montre aucune donnée

**Vérifications** :

1. **Vérifier Kafka UI** : http://localhost:8090
   - Les topics doivent exister
   - Des messages doivent arriver

2. **Vérifier les logs** :
   ```bash
   tail -f kafka_producer.log
   tail -f api_gateway.log
   ```

3. **Redémarrer le producteur** :
   ```bash
   source venv/bin/activate
   python data-ingestion/kafka_crypto_producer.py
   ```

### Problème : "Port already in use"

**Solution** :

```bash
# Trouver le processus utilisant le port
sudo lsof -i :3000    # Pour l'API
sudo lsof -i :9092    # Pour Kafka

# Tuer le processus (remplacer PID)
kill -9 <PID>
```

### Problème : Flutter build errors

**Solution** :

```bash
cd crypto_viz_app

# Nettoyer
flutter clean

# Récupérer les dépendances
flutter pub get

# Rebuild
flutter run -d linux
```

---

## Checklist de Démarrage Rapide

Utilisez cette checklist pour vous assurer que tout est prêt :

- [ ] Docker Desktop est lancé (Windows) ou Docker daemon est actif (Linux)
- [ ] Flutter est installé et dans le PATH (`flutter --version` fonctionne)
- [ ] Python 3.8+ est installé
- [ ] Vous êtes dans le bon répertoire : `/home/lekrikri/Projects/T-DAT-901-PAR_10`
- [ ] L'environnement virtuel Python est créé (`venv` existe)
- [ ] Les dépendances Python sont installées
- [ ] Les dépendances Flutter sont installées (`flutter pub get` dans crypto_viz_app)
- [ ] Lancez `bash start_system.sh`
- [ ] Attendez 1 minute
- [ ] Vérifiez Kafka UI : http://localhost:8090
- [ ] Vérifiez l'API : `curl http://localhost:3000/health`
- [ ] Lancez Flutter : `cd crypto_viz_app && flutter run -d linux`
- [ ] Profitez de l'application !

---

## Services et Ports

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| API Gateway | 3000 | http://localhost:3000 | API REST principale |
| Kafka Broker | 9092 | localhost:9092 | Broker de messages |
| Zookeeper | 2181 | localhost:2181 | Coordination Kafka |
| Kafka UI | 8090 | http://localhost:8090 | Interface Kafka |

---

## Commandes Utiles

```bash
# Vérifier les services Docker
docker ps

# Voir les logs en temps réel
tail -f kafka_producer.log
tail -f api_gateway.log
docker logs kafka -f

# Tester l'API
curl http://localhost:3000/health
curl http://localhost:3000/api/crypto/prices | jq

# Flutter hot reload (dans l'app en cours d'exécution)
# Appuyez sur 'r' dans le terminal

# Redémarrer Kafka
docker-compose -f docker/docker-compose.kafka.yml restart

# Tout nettoyer et recommencer
pkill -f kafka_crypto_producer
pkill -f "python.*app.py"
docker-compose -f docker/docker-compose.kafka.yml down
```

---

## Support

Si vous rencontrez des problèmes :

1. Vérifiez cette documentation
2. Consultez `INSTALLATION_GUIDE.md` pour plus de détails
3. Vérifiez les logs : `kafka_producer.log`, `api_gateway.log`
4. Vérifiez que tous les services sont actifs avec `docker ps` et `curl http://localhost:3000/health`

---

**Date** : 2025-11-13
**Version** : 1.0
**Testé sur** : WSL2 Ubuntu 22.04 avec Windows 11
