import express from "express";
import http from "http";
import { Server } from "socket.io";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import "dotenv/config";

// === Express + Socket.IO ===
const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173"];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// === Ouverture de la base SQLite ===
const db = await open({
  filename: "./cartes.db",
  driver: sqlite3.Database,
});

// Fonction utilitaire pour tirer 2 cartes différentes
async function getTwoRandomCards(bans = []) {
  const cards = await db.all(
    `SELECT * FROM cartes 
     WHERE id NOT IN (${bans.length ? bans.join(",") : 0}) 
     ORDER BY RANDOM() LIMIT 2`
  );
  return cards;
}

// === Jeux en mémoire ===
const games = {};

io.on("connection", (socket) => {
  console.log("🟢 Nouveau client :", socket.id);

  // --- Création de partie ---
  socket.on("createGame", async () => {
    const room = Math.random().toString(36).substr(2, 6).toUpperCase();
    console.log("📥 createGame reçu :", room);

    const [c1, c2] = await getTwoRandomCards([]);

    const game = {
      room,
      bans: [],
      round: 1,
      score: 0,
      players: {}, // socket.id -> "A" ou "B"
      words: [],   // mots joués ce round
      currentRound: { cards: [c1, c2], attempts: 0 },
      history: [],
    };

    game.players[socket.id] = "A"; // créateur = joueur A

    games[room] = game;

    socket.join(room);
    socket.emit("gameCreated", room);
    socket.emit("gameJoined", { room, role: "A" });
    io.to(room).emit("stateUpdate", game);
  });

  // --- Rejoindre une partie ---
  socket.on("joinGame", (room) => {
    const game = games[room];
    if (!game) {
      socket.emit("errorMessage", "❌ Partie introuvable");
      return;
    }

    let role;
    if (!Object.values(game.players).includes("A")) {
      role = "A";
    } else if (!Object.values(game.players).includes("B")) {
      role = "B";
    } else {
      socket.emit("errorMessage", "❌ Partie déjà complète");
      return;
    }

    game.players[socket.id] = role;
    socket.join(room);
    socket.emit("gameJoined", { room, role });
    io.to(room).emit("stateUpdate", game);
  });

  // --- Jouer un mot ---
  socket.on("playWord", async ({ room, word }) => {
    const game = games[room];
    if (!game) return;

    const role = game.players[socket.id];
    if (!role) return;

    const cleanWord = word.toLowerCase().trim();

    // Ajoute le mot au round courant
    game.words.push({ role, word: cleanWord });

    if (game.words.length === 2) {
      const [w1, w2] = game.words.map((w) => w.word);

      if (w1 === w2) {
        // ✅ Réussi
        game.score += 1;
        io.to(room).emit("roundResult", { success: true, word: w1 });

        game.history.push({
          cards: [...game.currentRound.cards],
          word: w1,
          attempts: game.currentRound.attempts + 1,
        });

        // Nouveau round
        game.bans.push(...game.currentRound.cards.map((c) => c.id));
        const [c1, c2] = await getTwoRandomCards(game.bans);
        game.round += 1;
        game.words = [];
        game.currentRound = { cards: [c1, c2], attempts: 0 };
        io.to(room).emit("stateUpdate", game);
      } else {
        // ❌ Mots différents
        game.currentRound.attempts += 1;
        io.to(room).emit("roundResult", {
          success: false,
          message: "Mots différents !",
        });
        game.words = [];

        if (game.currentRound.attempts >= 3) {
          // Round perdu → on passe quand même au suivant
          game.history.push({
            cards: [...game.currentRound.cards],
            word: null,
            attempts: 3,
          });
          game.bans.push(...game.currentRound.cards.map((c) => c.id));
          const [c1, c2] = await getTwoRandomCards(game.bans);
          game.round += 1;
          game.words = [];
          game.currentRound = { cards: [c1, c2], attempts: 0 };
        }

        io.to(room).emit("stateUpdate", game);
      }
    } else {
      // 1 seul joueur a joué → broadcast état
      io.to(room).emit("stateUpdate", game);
    }
  });

  // --- Déconnexion ---
  socket.on("disconnect", () => {
    console.log("❌ Client déconnecté :", socket.id);
    for (const room in games) {
      const game = games[room];
      if (game.players[socket.id]) {
        delete game.players[socket.id];
        io.to(room).emit("stateUpdate", game);
      }
    }
  });
});

// --- Lancer le serveur ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur en ligne sur le port ${PORT}`);
  console.log("🌍 Origines autorisées :", allowedOrigins);
});
