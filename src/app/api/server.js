// Dans votre serveur principal (server.js)
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const database = require("./config/database");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const cors = require("cors");

app.use(
  cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:*"],
    methods: ["GET", "POST", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Gestion des erreurs CORS
app.use((err, req, res, next) => {
  console.error("CORS Error:", err);
  res.status(500).json({ error: "CORS configuration error" });
});

// Ajouter ces headers manuellement pour les requêtes OPTIONS
app.options("*", cors());

// Middleware pour parser le JSON
app.use(express.json());

// Routes
const userRouter = require("./router/user.router");
app.use("/api/users", userRouter);

wss.on("connection", (ws) => {
  console.log("Nouveau client connecté");

  // Dans la section wss.on('connection', (ws) => { ... })
  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);

      // Début de la modification
      if (data.type === "message") {
        // Ajouter le timestamp si absent
        data.timestamp = data.timestamp || new Date().toISOString();

        // Diffuser à tous les clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
        return; // Sortir de la fonction après traitement
      }
      // Fin de la modification

      if (data.type === "position") {
        await database.execute(
          "UPDATE users SET latitude = ?, longitude = ? WHERE id = ?",
          [data.latitude, data.longitude, data.userId]
        );

        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "position_update",
                userId: data.userId,
                latitude: data.latitude,
                longitude: data.longitude,
              })
            );
          }
        });
      }

      // Ajouter cette partie pour lier l'userId à la connexion WebSocket
      if (data.type === "user_connected") {
        ws.userId = data.userId;
      }
    } catch (error) {
      console.error("Erreur traitement message:", error);
    }
  });

  // 1. Modification du gestionnaire de déconnexion WebSocket
ws.on('close', async () => {
  try {
    if (!ws.userId) return;

    // Mettre à jour le statut IMMÉDIATEMENT
    await database.execute(
      "UPDATE users SET isConnected = 0, last_activity = NOW() WHERE id = ?", 
      [ws.userId]
    );

    // Récupérer le username après la mise à jour
    const [user] = await database.execute(
      "SELECT username FROM users WHERE id = ?", 
      [ws.userId]
    );

    // Diffuser UNE SEULE notification
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN && client !== ws) {
        client.send(JSON.stringify({
          type: "user_disconnected",
          userId: ws.userId,
          username: user[0]?.username || `Utilisateur ${ws.userId}`
        }));
      }
    });

  } catch (error) {
    console.error("Erreur déconnexion:", error);
  }
});


});

// 2. Intervalle de vérification modifié
setInterval(async () => {
  try {
    // Ne traite que les utilisateurs encore connectés
    const [users] = await database.execute(
      `SELECT id, username 
       FROM users 
       WHERE last_activity < NOW() - INTERVAL 15 SECOND 
       AND isConnected = 1`
    );

    // Mettre à jour et notifier en une transaction
    await database.execute(
      "UPDATE users SET isConnected = 0 WHERE id IN (?)", 
      [users.map(u => u.id)]
    );

    users.forEach(user => {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "user_disconnected",
            userId: user.id,
            username: user.username
          }));
        }
      });
    });

  } catch (error) {
    console.error("Erreur vérification connexions:", error);
  }
}, 15000); // Augmenté à 15 secondes

server.listen(8080, () => {
  console.log("Serveur en écoute sur port 8080");
});
