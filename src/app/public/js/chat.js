import { getUserLocalisation } from './geolocalisation.js';

const chatbox = document.getElementById("chatbox");
const messageInput = document.getElementById("message");
const loginContainer = document.getElementById("loginContainer");
const socket = new WebSocket("ws://localhost:8080");
let username;

function joinChat() {
  // navigator.geolocation.getCurrentPosition(success, error, options);
  getUserLocalisation();
  username = document.getElementById("username").value.trim();
  if (username) {
    loginContainer.style.display = "none";
    chatbox.style.display = "block";
    document.querySelector(".input-container").style.display = "flex";
    socket.send(
      JSON.stringify({
        type: "connection",
        username: username,
      })
    );
  }
}

window.joinChat = joinChat;


socket.onopen = () => {
  console.log("Connecté au serveur WebSocket");
  addSystemMessage("✓ Connecté au chat");
};

// Remplacez la partie du socket.onmessage par celle-ci :
socket.onmessage = (event) => {
  const now = new Date();
  const timestamp = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

  let messageData = event.data;
  let isOwnMessage = false;

  try {
    // Essayer de parser le message comme JSON
    const data = JSON.parse(messageData);
    if (data.type === "connection") {
      addSystemMessage(`${data.username} a rejoint le chat`);
    } else if (data.type === "disconnection") {
      addSystemMessage(`${data.username} a quitté le chat`);
    }
  } catch {
    // Si ce n'est pas du JSON, c'est un message normal
    isOwnMessage = messageData.startsWith(`${username}:`);
    addMessage(`[${timestamp}] ${messageData}`);
  }
};

// Et ajoutez cette ligne au début du script pour s'assurer que le son est chargé :
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

function sendMessage() {
  const message = messageInput.value.trim();
  if (message && username) {
    socket.send(`${username}: ${message}`);
    messageInput.value = "";
  }
}

window.sendMessage = sendMessage;

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
