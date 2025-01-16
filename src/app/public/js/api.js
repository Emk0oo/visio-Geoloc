export function postUserLocalisation(username, coords){
    fetch("/api/geolocalisation", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, coords }),
    });
}