const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const port = 8080;

// Servir les fichiers statiques depuis le dossier public
app.use(express.static(__dirname + '/public'));

wss.on('connection', (ws) => {
    console.log('Nouveau client connecté');
    
    ws.on('message', (message) => {
        console.log('Message reçu:', message.toString());
        // Diffuser le message à tous les clients connectés
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });

    ws.on('close', () => {
        console.log('Client déconnecté');
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send('Un utilisateur s\'est déconnecté');
            }
        });
    });
});

server.listen(port, () => {
    console.log(`Serveur en écoute sur http://localhost:${port}`);
});