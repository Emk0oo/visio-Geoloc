import { getUserLocalisation } from "./geolocalisation.js";

// Fichier initMap.js
async function initMap() {
    const userCoord = await getUserLocalisation();
    console.log(userCoord);
  
    const map = new google.maps.Map(document.getElementById("map"), {
        center: userCoord, //centre sur l'utilisateurs
        zoom: 7,
        mapId: "be31cd6f936aef12", //Map ID google maps console
      });
  
    new google.maps.marker.AdvancedMarkerElement({
      position: userCoord, // ajoute marqueur sur l'utilisateur
      map: map,
      title: "Votre position actuelle",
    });
  }
  
  window.initMap = initMap;
  