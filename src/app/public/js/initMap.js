import { getUserLocalisation } from "./geolocalisation.js";

// Fichier initMap.js
async function initMap() {
    const userCoord = await getUserLocalisation();
    console.log(userCoord);
  
    const map = new google.maps.Map(document.getElementById("map"), {
        center: userCoord, // 
        zoom: 9,
        mapId: "be31cd6f936aef12", // Remplacez par votre Map ID
      });
  
    new google.maps.marker.AdvancedMarkerElement({
      position: userCoord,
      map: map,
      title: "Votre position actuelle",
    });
  }
  
  window.initMap = initMap;
  