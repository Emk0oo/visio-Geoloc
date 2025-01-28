import { getUserLocalisation } from "./geolocalisation.js";
import { VideoCallManager, setupVideoUI } from "./webrtc.js"; // Correction du nom d'import
import config from "./config.js"; // Correction ici

const chatbox = document.getElementById("chatbox");
const messageInput = document.getElementById("message");
const loginContainer = document.getElementById("loginContainer");
const socket = new WebSocket("ws://"+config.SERVER_IP + ":8080");
let username;

// Après la connexion WebSocket
let userId;
const apiUrl ="http://" + config.SERVER_IP + ":8080";
console.log("API URL:", apiUrl);

async function joinChat() {
  username = document.getElementById("username").value.trim();
  if (username) {
    try {
      const response = await fetch(`${apiUrl}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) throw new Error("Erreur réseau");

      const userData = await response.json();
      userId = userData.id;

      // Après avoir obtenu userData
      socket.send(
        JSON.stringify({
          type: "user_connected",
          userId: userId,
          username: username,
        })
      );

      // Ajouter ces lignes
      loginContainer.style.display = "none";
      chatbox.style.display = "block";
      document.querySelector(".input-container").style.display = "flex";

      // Activer la géolocalisation
      navigator.geolocation.watchPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          socket.send(
            JSON.stringify({
              type: "position",
              userId,
              latitude,
              longitude,
            })
          );

          await fetch(`${apiUrl}/api/users/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude, longitude }),
          });
        },
        console.error,
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
      const videoUI = setupVideoUI();
      window.videoCallManager = new VideoCallManager(socket, userId, apiUrl);

      // Ajouter la gestion du bouton d'arrêt
      videoUI.startButton.onclick = () => videoCallManager.startVideoCall();
      videoUI.stopButton.onclick = () => videoCallManager.stopVideoCall();
    } catch (error) {
      console.error("Erreur connexion:", error);
      alert("Échec de la connexion");
    }
  }
}

window.joinChat = joinChat;

socket.onopen = () => {
  console.log("Connecté au serveur WebSocket");
  addSystemMessage("✓ Connecté au chat");
  updateConnectedUsers();
};
const dejaTraite = new Set();

socket.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);

    if (!["offer", "answer", "ice_candidate"].includes(data.type)) {
      const time = new Date(data.timestamp).toLocaleTimeString();
      addMessage(`[${time}] ${data.username}: ${data.content}`);
    } else if (data.type === "position_update") {
      // Logique de mise à jour de la carte...
    } else if (data.type === "user_connected") {
      addSystemMessage(`${data.username} a rejoint le chat`);
    } else if (data.type === "user_disconnected") {
      if (!dejaTraite.has(data.userId)) {
        dejaTraite.add(data.userId);
        const username = data.username || `Utilisateur ${data.userId}`;
        addSystemMessage(`${username} a quitté le chat`);

        // Réinitialiser après 1 minute
        setTimeout(() => dejaTraite.delete(data.userId), 60000);
      }
    }
  } catch (error) {
    console.error("Erreur traitement message:", error);
  }
};

socket.onclose = () => {
  addSystemMessage("× Déconnecté du chat");
};

function addSystemMessage(text) {
  const message = document.createElement("div");
  message.textContent = text;
  message.classList.add("system-message");
  chatbox.appendChild(message);
  chatbox.scrollTop = chatbox.scrollHeight;
}

function addMessage(text) {
  const message = document.createElement("div");
  message.textContent = text;
  chatbox.appendChild(message);
  chatbox.scrollTop = chatbox.scrollHeight;
}

// Remplacer la fonction sendMessage par cette version améliorée
function sendMessage() {
  const message = messageInput.value.trim();
  if (message && username && userId) {
    const payload = JSON.stringify({
      type: "message",
      userId: userId,
      username: username,
      content: message,
      timestamp: new Date().toISOString(), // Assure un format cohérent
    });

    // Ajouter une gestion d'erreur
    try {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(payload);
        messageInput.value = "";
      } else {
        console.error("WebSocket non connecté");
        alert("Connexion perdue, veuillez rafraîchir la page");
      }
    } catch (error) {
      console.error("Erreur envoi message:", error);
    }
  }
}

window.sendMessage = sendMessage;

// Ajouter en haut du fichier
function formatTimestamp(isoString) {
  const date = new Date(isoString);
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

// Puis modifier le handler de message :
// Modifiez le gestionnaire de message WebSocket
socket.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);

    if (data.type === "message") {
      const time = formatTimestamp(data.timestamp);
      addMessage(`[${time}] ${data.username}: ${data.content}`);
    } else if (data.type === "position_update") {
      // Appel à la fonction de mise à jour de la carte
      if (window.handlePositionUpdate) {
        window.handlePositionUpdate(data.userId, data.latitude, data.longitude);
      }
    } else if (data.type === "user_connected") {
      addSystemMessage(`${data.username} a rejoint le chat`);
      updateConnectedUsers(); // Actualiser la liste des marqueurs
    } else if (data.type === "user_disconnected") {
      const username = data.username || `Utilisateur ${data.userId}`;
      addSystemMessage(`${username} a quitté le chat`);

      // Supprimer le marqueur immédiatement
      if (window.userMarkers && data.userId) {
        delete window.userMarkers[data.userId];
      }
    }
  } catch (error) {
    console.error("Erreur traitement message:", error);
  }
};

// Ajoutez cette fonction pour mettre à jour la liste des utilisateurs
async function updateConnectedUsers() {
  try {
    const response = await fetch(`${apiUrl}/api/users`);
    if (!response.ok) throw new Error("Erreur réseau");

    const users = await response.json();
    const usersList = document.getElementById("usersList");

    // Vider la liste actuelle
    usersList.innerHTML = "";

    // Créer les éléments de liste
    users.forEach((user) => {
      const userElement = document.createElement("div");
      userElement.className = "user-item";
      userElement.innerHTML = `
        <span class="user-status"></span>
        <span class="username">${user.username}</span>
        <span class="user-location">${user.latitude.toFixed(
          4
        )}, ${user.longitude.toFixed(4)}</span>
      `;
      usersList.appendChild(userElement);
    });
  } catch (error) {
    console.error("Erreur mise à jour utilisateurs:", error);
  }
}

// Appeler la fonction régulièrement (toutes les 5 secondes)
setInterval(updateConnectedUsers, 5000);

messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

document.getElementById("username").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    joinChat();
  }
});

// Gestion des erreurs WebSocket
socket.onerror = (error) => {
  console.error("Erreur WebSocket:", error.message, error.stack);
};

// Vérifier l'état de la connexion
console.log("État WebSocket:", socket.readyState); // Doit retourner 1 (OPEN)
