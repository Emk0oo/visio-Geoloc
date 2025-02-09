# 📌 Visio-Geoloc

## 📖 Description

**Visio-Geoloc** est une application web permettant aux utilisateurs de :  
- Partager leur **position en temps réel** à l'aide du GPS de leur navigateur
- Afficher toutes les positions sur une **carte interactive (Google Maps)**
- Participer à une **visioconférence** grâce à **WebRTC**
- Envoyer et recevoir des **données d'accéléromètre** si compatibles avec le navigateur

## 🚀 Fonctionnalités principales

✅ **Géolocalisation en temps réel**  
✅ **Affichage des utilisateurs sur une carte Google Maps**  
✅ **Visioconférence avec WebRTC**  
✅ **Communication WebSocket pour synchronisation des positions**  
✅ **Affichage des données d'accéléromètre **  

## 🏗️ Architecture du projet

```text
visio-Geoloc
├── .env                # Variables d'environnement
├── README.md          # Documentation
└── src
    ├── app
    │   ├── api
    │   │   ├── config
    │   │   │   └── database.js           # Configuration de la base de données
    │   │   ├── controller
    │   │   │   └── user.controller.js    # Contrôleurs API
    │   │   ├── model
    │   │   │   └── User.js               # Modèle utilisateur
    │   │   ├── router
    │   │   │   └── user.router.js        # Routes API
    │   ├── server.js                     # Serveur WebSocket et Express
    ├── public
    │   ├── index.html                    # Interface utilisateur
    │   ├── js
    │   │   ├── chat.js                   # Gestion des messages WebSocket
    │   │   ├── geolocalisation.js        # Gestion de la géolocalisation
    │   │   ├── initMap.js                # Initialisation de Google Maps
    │   │   ├── webrtc.js                 # Gestion de la visioconférence WebRTC
    │   └── style
    │       └── index.css                 # Styles CSS
```

## ⚙️ Installation et Configuration

### 🛠️ Prérequis
- **Node.js** (v16+ recommandé)  
- **npm**
- **Clé API Google Maps** (obligatoire pour l'affichage des cartes)  

### 📥 Installation

```bash
# Cloner le projet
git clone [https://github.com/votre-repo/visio-geoloc.git]
cd visio-geoloc

# Installer les dépendances
npm install
```

### 🔧 Configuration

1. **Créer le fichier `.env`** :
   ```bash
   cp .envExample .env
    ```
2. **Configurer les variables d'environnement **:
 ```
PORT=8080
GOOGLE_MAPS_API_KEY=VOTRE_CLE_API
 ```

3. **Ajouter le fichier SQL à votre machine pour créer la BDD ** !!!

🏃‍♂️ Démarrer l'application
🌐 Lancer le serveur
 ```bash
cd src/app/api
node server.js
 ```
Le serveur sera accessible sur http://localhost:8080.

📌 Accéder à l'application
Ouvrez http://localhost:8080 dans votre navigateur.
