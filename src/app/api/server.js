const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const database = require("./config/database");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Configuration CORS améliorée
app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500", // Développement local
      "http://localhost:8080", // Port explicite
      "https://emir.javor.caen.mds-project.fr", // Domaine de production
    ],
    methods: ["GET", "POST", "PUT", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Gestion des connexions actives
const activeConnections = new Map();

// Routes
const userRouter = require("./router/user.router");
app.use("/api/users", userRouter);

// Gestion WebSocket
wss.on("connection", (ws) => {
  console.log("Nouvelle connexion WebSocket");

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);

      // Mise à jour de l'activité utilisateur
      if (data.userId) {
        activeConnections.set(data.userId, ws);
        ws.userId = data.userId;

        await database.execute(
          "UPDATE users SET isConnected = 1, last_activity = NOW() WHERE id = ?",
          [data.userId]
        );
      }

      // Traitement des différents types de messages
      switch (data.type) {
        case "message":
          handleChatMessage(data);
          break;

        case "position":
          handlePositionUpdate(data);
          break;

        case "offer":
        case "answer":
        case "ice_candidate":
          forwardWebRtcSignal(data);
          break;

        case "user_connected":
          broadcastUserStatus(data, true);
          break;
      }
    } catch (error) {
      console.error("Erreur traitement message:", error);
    }
  });

  ws.on("close", async () => {
    try {
      if (!ws.userId) return;

      await database.execute("UPDATE users SET isConnected = 0 WHERE id = ?", [
        ws.userId,
      ]);

      broadcastUserStatus({ userId: ws.userId }, false);
      activeConnections.delete(ws.userId);
    } catch (error) {
      console.error("Erreur déconnexion:", error);
    }
  });
});

// Fonctions utilitaires
async function handleChatMessage(data) {
  data.timestamp = new Date().toISOString();
  broadcastToAll(data);
}

async function handlePositionUpdate(data) {
  await database.execute(
    "UPDATE users SET latitude = ?, longitude = ? WHERE id = ?",
    [data.latitude, data.longitude, data.userId]
  );

  broadcastToAll(
    {
      type: "position_update",
      ...data,
    },
    [data.userId]
  );
}

function forwardWebRtcSignal(data) {
  const target = activeConnections.get(data.target);
  if (target && target.readyState === WebSocket.OPEN) {
    target.send(JSON.stringify(data));
  }
}

async function broadcastUserStatus(data, isConnected) {
  const [user] = await database.execute(
    "SELECT username FROM users WHERE id = ?",
    [data.userId]
  );

  broadcastToAll(
    {
      type: isConnected ? "user_connected" : "user_disconnected",
      userId: data.userId,
      username: user[0]?.username || `Utilisateur ${data.userId}`,
    },
    [data.userId]
  );
}

function broadcastToAll(data, excludeIds = []) {
  wss.clients.forEach((client) => {
    if (
      client.readyState === WebSocket.OPEN &&
      !excludeIds.includes(client.userId)
    ) {
      client.send(JSON.stringify(data));
    }
  });
}

// Vérification des connexions inactives
setInterval(async () => {
  try {
    const [inactiveUsers] = await database.execute(
      `SELECT id FROM users 
       WHERE last_activity < NOW() - INTERVAL 30 SECOND 
       AND isConnected = 1`
    );

    inactiveUsers.forEach(async (user) => {
      const ws = activeConnections.get(user.id);
      if (ws) ws.close();
    });
  } catch (error) {
    console.error("Erreur vérification inactifs:", error);
  }
}, 15000);

server.listen(8080, () => {
  console.log("Serveur prêt sur port 8080");
});
