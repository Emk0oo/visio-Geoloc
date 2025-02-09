README.md - Documentation du projet
md

Copier
# 📌 Visio-Geoloc

## 📖 Description

**Visio-Geoloc** est une application web permettant aux utilisateurs de :  
- Partager leur **position en temps réel** à l'aide du GPS de leur navigateur.
- Afficher toutes les positions sur une **carte interactive (Google Maps)**.
- Participer à une **visioconférence** grâce à **WebRTC**.
- Envoyer et recevoir des **données d'accéléromètre** si compatibles avec le navigateur.

## 🚀 Fonctionnalités principales

✅ **Géolocalisation en temps réel**  
✅ **Affichage des utilisateurs sur une carte Google Maps**  
✅ **Visioconférence avec WebRTC**  
✅ **Communication WebSocket pour synchronisation des positions**  
✅ **Affichage des données d'accéléromètre (optionnel)**  

---

## 🏗️ Architecture du projet

Voici la structure globale du projet :

visio-Geoloc
├── .env # Variables d'environnement
├── README.md # Documentation
└── src
├── app
│ ├── api
│ │ ├── config
│ │ │ └── database.js # Configuration de la base de données
│ │ ├── controller
│ │ │ └── user.controller.js # Contrôleurs API
│ │ ├── model
│ │ │ └── User.js # Modèle utilisateur
│ │ ├── router
│ │ │ └── user.router.js # Routes API
│ ├── server.js # Serveur WebSocket et Express
├── public
│ ├── index.html # Interface utilisateur
│ ├── js
│ │ ├── chat.js # Gestion des messages WebSocket
│ │ ├── geolocalisation.js # Gestion de la géolocalisation
│ │ ├── initMap.js # Initialisation de Google Maps
│ │ ├── webrtc.js # Gestion de la visioconférence WebRTC
│ └── style
│ └── index.css # Styles CSS

markdown

Copier

---

## ⚙️ Installation et Configuration

### 🛠️ **1. Prérequis**
- **Node.js** (v16+ recommandé)
- **npm** ou **yarn**
- **Clé API Google Maps** (obligatoire pour l'affichage des cartes)

### 📥 **2. Installation**
Clonez le projet et installez les dépendances :

```bash
git clone https://github.com/votre-repo/visio-geoloc.git
cd visio-geoloc
npm install
```
🔧 3. Configuration
Créez un fichier .env en copiant .envExample et configurez les valeurs :

```bash
cp .envExample .env
```
Modifiez les variables selon votre configuration :

```
PORT=8080
GOOGLE_MAPS_API_KEY=VOTRE_CLE_API
```
🏃‍♂️ Démarrer l'application
🌐 1. Lancer le serveur
```
node server.js
```
Le serveur sera accessible sur http://localhost:8080.

📌 2. Accéder à l'application
Ouvrez http://localhost:8080 dans votre navigateur.

📌 Explication des fonctionnalités
🌍 1. Partage de position en temps réel
Utilisation de l'API de géolocalisation du navigateur.
Affichage en temps réel des positions sur Google Maps.
Communication avec le serveur via WebSocket.
🎥 2. Visioconférence (WebRTC)
Création d'une connexion peer-to-peer entre utilisateurs.
Partage du flux vidéo et audio.
Gestion des offres, réponses, et candidats ICE.
📡 3. Communication en temps réel (WebSocket)
Serveur WebSocket utilisé pour :
Mettre à jour les positions GPS des utilisateurs.
Gérer les connexions et déconnexions en temps réel.
📱 4. Affichage des données d'accéléromètre
Récupération des valeurs via l'API des capteurs du navigateur (DeviceMotionEvent).
Envoi des données au serveur et affichage dans l'interface.
🚀 Déploiement sur un serveur VPS
📌 1. Configuration du VPS
Installez Node.js et npm :
bash

Copier
sudo apt update && sudo apt install nodejs npm -y
⚙️ 2. Installation et lancement
Sur le serveur, clonez le projet et installez les dépendances :

bash

Copier
git clone https://github.com/votre-repo/visio-geoloc.git
cd visio-geoloc
npm install
🔒 3. Utiliser un proxy Nginx (optionnel)
Ajoutez une configuration Nginx pour rediriger le trafic vers Node.js :

nginx
```
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Redémarrez Nginx :

```
sudo systemctl restart nginx
```
🛠️ Améliorations possibles
Ajout d'un système d'authentification (OAuth, JWT).
Stockage des sessions WebRTC pour la reprise des appels.
Optimisation des performances WebSocket pour la gestion de nombreux utilisateurs.
Compatibilité avec plus de navigateurs et mobiles.


🚀 Merci d'utiliser Visio-Geoloc ! 🎉

