export async function getUserLocalisation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
        resolve({ lat: latitude, lng: longitude });
      },
      (err) => {
        console.error(`ERROR(${err.code}): ${err.message}`);
        reject(err);
      },
      options
    );
  });
}

export async function initMap() {
  try {
    const userCoord = await getUserLocalisation();
    console.log(userCoord);

    const map = new google.maps.Map(document.getElementById("map"), {
      center: userCoord,
      zoom: 7,
    });

    new google.maps.marker.AdvancedMarkerElement({
      position: userCoord,
      map: map,
      title: "Votre position actuelle",
    });    
  } catch (err) {
    console.error("Erreur lors de la récupération de la localisation :", err);
  }
}

// Ajoutez initMap au contexte global
window.initMap = initMap;

const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};
