// initMap.js
import { getUserLocalisation } from "./geolocalisation.js";
import config from "./config.js";

let map;
let userMarkers = {}; // Stocke tous les marqueurs des utilisateurs

async function initMap() {
  try {
    const userCoord = await getUserLocalisation();
    
    map = new google.maps.Map(document.getElementById("map"), {
      center: userCoord,
      zoom: 12,
      mapId: "be31cd6f936aef12",
    });

    // Marqueur pour l'utilisateur local
    userMarkers['me'] = new google.maps.marker.AdvancedMarkerElement({
      position: userCoord,
      map,
      title: "Vous",
      zIndex: 999
    });

    // Vérification périodique des connexions
    setInterval(updateConnectedUsers, 3000);
    updateConnectedUsers();

  } catch (error) {
    console.error("Error initializing map:", error);
  }
}

async function updateConnectedUsers() {
  try {
    // Récupère la liste des utilisateurs connectés
    const response = await fetch('http://'+ config.SERVER_IP + ':8080/api/users');
    const users = await response.json();

    // Met à jour les marqueurs
    users.forEach(user => {
      const position = { lat: user.latitude, lng: user.longitude };
      
      if (!userMarkers[user.id]) {
        // Crée un nouveau marqueur
        userMarkers[user.id] = new google.maps.marker.AdvancedMarkerElement({
          position,
          map,
          title: user.username,
          zIndex: 100
        });
      } else {
        // Met à jour la position existante
        userMarkers[user.id].position = position;
      }
    });

    // Supprime les marqueurs déconnectés
    Object.keys(userMarkers).forEach(key => {
      if (key !== 'me' && !users.some(u => u.id == key)) {
        userMarkers[key].map = null;
        delete userMarkers[key];
      }
    });

  } catch (error) {
    console.error("Error updating users:", error);
  }
}

// Gestion des mises à jour en temps réel
window.handlePositionUpdate = (userId, lat, lng) => {
  if (userMarkers[userId]) {
    userMarkers[userId].position = { lat, lng };
  }
};

window.initMap = initMap;