import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.get("/", (req, res) => {
  res.send("✅ Serveur Socket.IO en ligne !");
});

io.on("connection", (socket) => {
  console.log("Un joueur connecté :", socket.id);

  socket.on("createRoom", (callback) => {
    const room = Math.random().toString(36).substring(2, 8).toUpperCase();
    socket.join(room);
    callback(room);
    console.log("Room créée :", room);
  });

  socket.on("joinRoom", (room, callback) => {
    const exists = io.sockets.adapter.rooms.has(room);
    if (exists) {
      socket.join(room);
      callback({ success: true });
      console.log("Joueur rejoint room :", room);
    } else {
      callback({ success: false, message: "Room inexistante" });
    }
  });

  socket.on("playMove", ({ room, index }) => {
    socket.to(room).emit("opponentMove", index);
  });

  socket.on("disconnect", () => {
    console.log("Un joueur s'est déconnecté :", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Serveur Socket.IO prêt sur port ${PORT}`);
});
