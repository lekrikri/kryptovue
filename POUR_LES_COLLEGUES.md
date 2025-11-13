# 📢 Message Important pour les Collègues

## ⚠️ PROBLÈME RÉSOLU

Les fichiers de l'application Flutter n'étaient **PAS trackés dans Git**. C'est pour ça que vous aviez un dossier `crypto_viz_app` vide sans fichiers `.dart`.

**Le problème est maintenant CORRIGÉ !**

---

## 🔄 Comment Récupérer les Fichiers

### 1. Pull les derniers changements

```bash
cd ~/Projects/T-DAT-901-PAR_10
git pull origin chris
```

Vous devriez voir :
```
Updating 0b589d3..cd9add7
Fast-forward
 35 files changed, 8042 insertions(+)
 create mode 100644 crypto_viz_app/lib/main.dart
 create mode 100644 crypto_viz_app/lib/models/...
 ...
```

### 2. Vérifier que vous avez les fichiers Flutter

```bash
ls -la crypto_viz_app/lib/
```

Vous devriez maintenant voir :
- `main.dart`
- `models/`
- `providers/`
- `screens/`
- `services/`
- `widgets/`
- `utils/`

---

## 📚 Documentation Disponible

Après le `git pull`, vous aurez accès à **3 nouveaux documents** :

### 1. [README_COMPLET.md](README_COMPLET.md)
**Guide d'installation complet et détaillé**
- Prérequis (Docker, Python, Flutter)
- Installation étape par étape
- Lancement des services
- Dépannage complet

### 2. [GUIDE_RAPIDE_INSTALLATION.md](GUIDE_RAPIDE_INSTALLATION.md)
**Quick start simplifié**
- Installation rapide
- Checklist de démarrage
- Solutions aux problèmes courants

### 3. [ARCHITECTURE.md](ARCHITECTURE.md) ⭐ **IMPORTANT À LIRE**
**Comprendre l'architecture du projet**
- Explique que le projet contient **2 applications distinctes** :
  - ✅ **Flutter App** (mobile/desktop) - celle qui fonctionne
  - ✅ **Streamlit Dashboard** (web) - pour analytics avancés
- Flux de données détaillé
- Différences entre les deux apps
- Cas d'usage

---

## 🎯 Quick Start pour Lancer l'App

### Étape 1 : Pull les changements

```bash
git pull origin chris
```

### Étape 2 : Installer Flutter (si pas déjà fait)

```bash
# Télécharger Flutter
cd ~
wget https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.24.0-stable.tar.xz
tar xf flutter_linux_3.24.0-stable.tar.xz

# Ajouter au PATH
echo 'export PATH="$PATH:$HOME/flutter/bin"' >> ~/.bashrc
source ~/.bashrc

# Installer dépendances Linux
sudo apt install clang cmake ninja-build pkg-config libgtk-3-dev liblzma-dev libstdc++-12-dev

# Activer Linux desktop
flutter config --enable-linux-desktop

# Vérifier
flutter doctor
```

### Étape 3 : Installer les dépendances Flutter

```bash
cd ~/Projects/T-DAT-901-PAR_10/crypto_viz_app
flutter pub get
cd ..
```

### Étape 4 : Lancer le Backend

```bash
cd ~/Projects/T-DAT-901-PAR_10

# S'assurer que Docker est lancé
docker ps

# Lancer le backend (Kafka + API)
bash start_system.sh
```

Attendez **1 minute** que les services démarrent.

### Étape 5 : Lancer l'Application Flutter

**Terminal 2** (nouveau terminal) :

```bash
cd ~/Projects/T-DAT-901-PAR_10/crypto_viz_app
flutter run -d linux
```

L'application devrait se lancer en 30-60 secondes et afficher les cryptos en temps réel ! 🎉

---

## 🏗️ Architecture Clarifiée

### Le projet contient 2 applications :

#### 1. Application Flutter (Mobile/Desktop)
**Localisation** : `crypto_viz_app/`
- **Technologie** : Dart + Flutter
- **Usage** : Consultation rapide des prix, actualités
- **Interface** : Moderne, dark mode, mobile-first
- **Graphiques** : Simples, interactifs
- **Cible** : Utilisateurs finaux, traders

#### 2. Dashboard Streamlit (Web Analytics)
**Localisation** : `dashboard/streamlit_dashboard.py`
- **Technologie** : Python + Streamlit
- **Usage** : Analyse technique approfondie
- **Interface** : Desktop, analytique
- **Graphiques** : Avancés (RSI, MACD, Bollinger)
- **Cible** : Analystes, data scientists

### Pourquoi deux apps ?

- **Flutter** = Expérience utilisateur moderne et rapide
- **Streamlit** = Outils d'analyse technique avancés

**Les deux partagent le même backend** (Kafka + API Gateway).

---

## 📋 Checklist de Vérification

Après avoir pull, vérifiez que vous avez :

- [ ] Tous les fichiers Dart dans `crypto_viz_app/lib/`
- [ ] 28 fichiers `.dart` au total
- [ ] `README_COMPLET.md`
- [ ] `GUIDE_RAPIDE_INSTALLATION.md`
- [ ] `ARCHITECTURE.md`
- [ ] `stop_system.sh` (nouveau script d'arrêt)
- [ ] `start_system.sh` (mis à jour)
- [ ] `requirements.txt` (corrigé, sans doublons)

---

## 🆘 Dépannage

### "Je n'ai toujours pas les fichiers Dart"

```bash
# Vérifier la branche
git branch

# Si pas sur "chris", changer
git checkout chris

# Pull à nouveau
git pull origin chris

# Vérifier
ls -la crypto_viz_app/lib/
```

### "flutter: command not found"

```bash
# Vérifier le PATH
echo $PATH | grep flutter

# Si absent, ajouter
echo 'export PATH="$PATH:$HOME/flutter/bin"' >> ~/.bashrc
source ~/.bashrc
```

### "Error loading data" dans l'app Flutter

1. **Vérifier que le backend tourne** :
   ```bash
   docker ps
   # Doit montrer : kafka, zookeeper, kafka-ui

   curl http://localhost:3000/health
   # Doit répondre : {"status":"healthy",...}
   ```

2. **Si le backend ne répond pas** :
   ```bash
   bash start_system.sh
   # Attendre 1 minute
   ```

3. **Dans Flutter, appuyer sur "Retry"**

---

## 📊 Services et Ports

| Service | Port | URL |
|---------|------|-----|
| API Gateway | 3000 | http://localhost:3000/health |
| Kafka UI | 8090 | http://localhost:8090 |
| Kafka Broker | 9092 | localhost:9092 |
| Streamlit (optionnel) | 8501 | http://localhost:8501 |

---

## 🎓 Pour Aller Plus Loin

1. **Lire [ARCHITECTURE.md](ARCHITECTURE.md)** pour comprendre le projet
2. **Suivre [README_COMPLET.md](README_COMPLET.md)** pour l'installation complète
3. **Consulter [GUIDE_RAPIDE_INSTALLATION.md](GUIDE_RAPIDE_INSTALLATION.md)** pour le quick start

---

## 🚀 Commandes Essentielles

```bash
# Lancer le backend
bash start_system.sh

# Arrêter le backend
bash stop_system.sh

# Lancer Flutter
cd crypto_viz_app && flutter run -d linux

# Voir les logs
tail -f kafka_producer.log
tail -f api_gateway.log

# Tester l'API
curl http://localhost:3000/health
curl http://localhost:3000/api/crypto/prices | jq
```

---

## ✅ Ce Qui a Été Corrigé

1. ✅ **28 fichiers Flutter ajoutés** (étaient ignorés par Git)
2. ✅ **Documentation complète** (3 nouveaux fichiers MD)
3. ✅ **Script d'arrêt** (`stop_system.sh`)
4. ✅ **Script start amélioré** (installe pyspark automatiquement)
5. ✅ **requirements.txt corrigé** (sans doublons)
6. ✅ **.gitignore amélioré** (ignore .log et .db)

---

## 🤝 Support

Si vous avez des questions :

1. Consultez la documentation (README_COMPLET.md, ARCHITECTURE.md)
2. Vérifiez les logs (kafka_producer.log, api_gateway.log)
3. Contactez l'équipe

---

**Date** : 13 Novembre 2025
**Commit** : cd9add7
**Branche** : chris

🎉 **Bon dev !**
