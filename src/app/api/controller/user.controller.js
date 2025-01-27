const database = require("../config/database");

const userController = {
  async createUser(req, res) {
    try {
      const { username } = req.body;
      console.log("Tentative de création utilisateur:", username);

      const [result] = await database.execute(
        "INSERT INTO users (username, longitude, latitude, isConnected) VALUES (?, 0, 0, 1)",
        [username]
      );

      res.status(201).json({
        id: result.insertId,
        username,
        isConnected: 1,
      });
    } catch (error) {
      console.error("Erreur création utilisateur:", error);
      res.status(500).json({
        error: "Erreur serveur",
        details: error.message,
      });
    }
},

async cleanupUsers() {
  try {
    await database.execute(
      "UPDATE users SET isConnected = 0 WHERE last_activity < NOW() - INTERVAL 5 MINUTE"
    );
  } catch (error) {
    console.error("Nettoyage utilisateurs échoué:", error);
  }
},

// Exécuter le nettoyage toutes les 5 minutes
init() {
  setInterval(() => this.cleanupUsers(), 300000);
},

async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { latitude, longitude } = req.body;

      await database.execute(
        "UPDATE users SET latitude = ?, longitude = ? WHERE id = ?",
        [latitude, longitude, id]
      );

      res.status(200).json({
        id,
        latitude,
        longitude,
      });
    } catch (error) {
      console.error("Erreur mise à jour utilisateur:", error);
      res.status(500).send("Erreur serveur");
    }
  },

  async getAllUsers(req, res) {
    try {
      const [users] = await database.execute(
        "SELECT id, username, latitude, longitude FROM users WHERE isConnected = 1"
      );
      res.status(200).json(users);
    } catch (error) {
      console.error("Erreur récupération utilisateurs:", error);
      res.status(500).send("Erreur serveur");
    }
  },

  // Ajouter une méthode de déconnexion
  async disconnectUser(req, res) {
    try {
      const { id } = req.params;
      await database.execute("UPDATE users SET isConnected = 0 WHERE id = ?", [
        id,
      ]);
      res.status(200).json({ message: "Utilisateur déconnecté" });
    } catch (error) {
      console.error("Erreur déconnexion utilisateur:", error);
      res.status(500).send("Erreur serveur");
    }
  },

  
};

module.exports = userController;
