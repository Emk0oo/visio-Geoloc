export async function getUserLocalisation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
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

const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};
