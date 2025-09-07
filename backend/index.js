import express from "express";
import http from "http";
import { Server } from "socket.io";
import "dotenv/config";

const app = express();
const server = http.createServer(app);

// === CORS dynamique avec variable d'environnement ===
// Exemple : ALLOWED_ORIGINS="http://localhost:5173,https://www.pake-de-cartes.fr"
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173"]; // valeur par défaut en dev

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("✅ Un utilisateur est connecté :", socket.id);

  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`🔗 User ${socket.id} a rejoint la room ${room}`);
  });

  socket.on("playWord", ({ room, player, word }) => {
    io.to(room).emit("newWord", { player, word });
  });

  socket.on("disconnect", () => {
    console.log("❌ Un utilisateur s'est déconnecté :", socket.id);
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur en ligne sur le port ${PORT}`);
  console.log("🌍 Origines autorisées :", allowedOrigins);
});
