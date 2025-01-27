// webrtc.js
export class VideoCallManager {
  constructor(socket, userId, apiUrl) {
    this.socket = socket;
    this.userId = userId;
    this.apiUrl = apiUrl;
    this.localStream = null;
    this.peers = {};
    this.remoteMediaElements = new Map();
    this.configuration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        // Ajouter des serveurs TURN en production
      ],
    };

    this.initializeEventListeners();
  }

  // Initialisation des gestionnaires d'événements
  initializeEventListeners() {
    this.socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      this.handleSignalingData(data);
    });
  }

  // Démarrer l'appel vidéo
  async startVideoCall() {
    try {
      console.log("Tentative d'accès aux médias...");
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });
      console.log("Accès aux médias réussi, tracks:", this.localStream.getTracks());
      
      this.setupLocalVideo();
      this.broadcastVideoSignal();
      
    } catch (error) {
      console.error("Échec de l'accès aux médias:", error);
      this.handleMediaError(error);
    }
  }

  // Configurer la vidéo locale
// Dans la méthode setupLocalVideo()
setupLocalVideo() {
    const localVideo = document.getElementById('localVideo');
    if (localVideo) {
      localVideo.srcObject = this.localStream;
      localVideo.muted = true;
      localVideo.play().catch(error => console.error("Erreur de lecture vidéo:", error));
    }
  }
  
  // Modifiez handleRemoteTrack()
  handleRemoteTrack(event, userId) {
    const remoteContainer = document.getElementById('remoteVideos');
    if (!remoteContainer) return;
  
    const [remoteStream] = event.streams;
    let videoElement = this.remoteMediaElements.get(userId);
  
    if (!videoElement) {
      videoElement = document.createElement('video');
      videoElement.id = `remoteVideo-${userId}`;
      videoElement.autoplay = true;
      videoElement.playsInline = true;
      videoElement.className = 'remote-video';
      remoteContainer.appendChild(videoElement);
      this.remoteMediaElements.set(userId, videoElement);
    }
  
    // Mise à jour du flux seulement si nécessaire
    if (videoElement.srcObject !== remoteStream) {
      videoElement.srcObject = remoteStream;
      videoElement.play().catch(error => console.error("Erreur lecture vidéo distante:", error));
    }
  }

  // Créer une connexion peer-to-peer
  createPeerConnection(targetUserId) {
    const pc = new RTCPeerConnection(this.configuration);

    // Ajouter le flux local
    this.localStream.getTracks().forEach((track) => {
      pc.addTrack(track, this.localStream);
    });

    // Gestion des candidats ICE
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        this.sendSignal({
          type: "ice_candidate",
          target: targetUserId,
          candidate,
        });
      }
    };

    // Gestion des flux entrants
    pc.ontrack = (event) => {
      this.handleRemoteTrack(event, targetUserId);
    };

    // Gestion de la déconnexion
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected") {
        this.cleanupPeer(targetUserId);
      }
    };

    this.peers[targetUserId] = pc;
    return pc;
  }

  // Diffuser le signal à tous les utilisateurs connectés
  async broadcastVideoSignal() {
    try {
      const response = await fetch(`${this.apiUrl}/api/users`);
      const users = await response.json();

      users.forEach((user) => {
        if (user.id !== this.userId && !this.peers[user.id]) {
          this.initiateCall(user.id);
        }
      });
    } catch (error) {
      console.error("Erreur de récupération des utilisateurs:", error);
    }
  }

  // Initier un appel avec un utilisateur spécifique
  async initiateCall(targetUserId) {
    const pc = this.createPeerConnection(targetUserId);

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      this.sendSignal({
        type: "offer",
        target: targetUserId,
        offer: pc.localDescription,
      });
    } catch (error) {
      console.error("Erreur de création d'offre:", error);
      this.cleanupPeer(targetUserId);
    }
  }

  // Gérer les données de signalisation
  async handleSignalingData(data) {
    try {
      switch (data.type) {
        case "offer":
          await this.handleOffer(data);
          break;
        case "answer":
          await this.handleAnswer(data);
          break;
        case "ice_candidate":
          await this.handleIceCandidate(data);
          break;
        case "user_disconnected":
          this.handleUserDisconnection(data.userId);
          break;
      }
    } catch (error) {
      console.error("Erreur de traitement du signal:", error);
    }
  }

  // Gérer une offre entrante
  async handleOffer(data) {
    const pc = this.createPeerConnection(data.target);

    try {
      await pc.setRemoteDescription(data.offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      this.sendSignal({
        type: "answer",
        target: data.target,
        answer: pc.localDescription,
      });
    } catch (error) {
      console.error("Erreur de traitement de l'offre:", error);
      this.cleanupPeer(data.target);
    }
  }

  // Gérer une réponse entrante
  async handleAnswer(data) {
    const pc = this.peers[data.target];
    if (pc) {
      await pc.setRemoteDescription(data.answer);
    }
  }

  // Gérer les candidats ICE entrants
  async handleIceCandidate(data) {
    const pc = this.peers[data.target];
    if (pc && data.candidate) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (error) {
        console.error("Erreur d'ajout de candidat ICE:", error);
      }
    }
  }

  // Gérer la déconnexion d'un utilisateur
  handleUserDisconnection(userId) {
    this.cleanupPeer(userId);
  }

  // Nettoyer les ressources d'un peer
  cleanupPeer(userId) {
    if (this.peers[userId]) {
      this.peers[userId].close();
      delete this.peers[userId];
    }
    this.removeRemoteVideo(userId);
  }

  // Gérer les pistes multimédias distantes
  handleRemoteTrack(event, userId) {
    const remoteContainer = document.getElementById("remoteVideos");
    const [remoteStream] = event.streams;

    // Créer ou mettre à jour l'élément vidéo
    let videoElement = this.remoteMediaElements.get(userId);
    if (!videoElement) {
      videoElement = document.createElement("video");
      videoElement.autoplay = true;
      videoElement.playsInline = true;
      videoElement.className = "remote-video";
      remoteContainer.appendChild(videoElement);
      this.remoteMediaElements.set(userId, videoElement);
    }

    videoElement.srcObject = remoteStream;
  }

  // Supprimer la vidéo distante
  removeRemoteVideo(userId) {
    const videoElement = this.remoteMediaElements.get(userId);
    if (videoElement) {
      videoElement.srcObject = null;
      videoElement.remove();
      this.remoteMediaElements.delete(userId);
    }
  }

  // Gérer les erreurs média
  handleMediaError(error) {
    let errorMessage = "Erreur inconnue";
    switch (error.name) {
      case "NotFoundError":
        errorMessage = "Aucun périphérique média trouvé";
        break;
      case "NotAllowedError":
        errorMessage = "Permissions non accordées";
        break;
      case "NotReadableError":
        errorMessage = "Périphérique déjà utilisé";
        break;
    }
    alert(`Erreur média: ${errorMessage}`);
  }

  // Envoyer des données via WebSocket
  sendSignal(data) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  // Arrêter complètement l'appel
  stopVideoCall() {
    Object.keys(this.peers).forEach((userId) => this.cleanupPeer(userId));

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      document.getElementById("localVideo").srcObject = null;
    }
  }
}

// Initialisation des éléments UI
export function setupVideoUI() {
  return {
    startButton: document.getElementById("startVideoCall"),
    stopButton: document.getElementById("stopVideoCall"),
    localVideo: document.getElementById("localVideo"),
    remoteContainer: document.getElementById("remoteVideos"),
  };
}
