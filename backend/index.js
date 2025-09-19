import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import Database from "better-sqlite3";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "https://pake-de-cartes.fr",   // ton backend si tu y accèdes direct
      "https://pake-three.vercel.app" // ton frontend React déployé
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// --- DB ---
const db = new Database("./cartes.db");

// tirer 2 cartes aléatoires différentes
function pickTwoRandomCards() {
  const card1 = db.prepare("SELECT * FROM cartes ORDER BY RANDOM() LIMIT 1").get();
  let card2;
  do {
    card2 = db.prepare("SELECT * FROM cartes ORDER BY RANDOM() LIMIT 1").get();
    if (!card1 || !card2) return null;
  } while (card2.id === card1.id);

  return { card1, card2 };
}

// générer un code de room
function genRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// --- Config jeu ---
const MAX_ATTEMPTS = 5;

// --- ROOMS ---
const rooms = new Map();

io.on("connection", (socket) => {
  console.log(`✅ ${socket.id} connecté`);

  /** Créer une room */
  socket.on("createRoom", (callback) => {
    const cards = pickTwoRandomCards();
    if (!cards) return callback({ success: false, message: "Pas assez de cartes" });

    const room = genRoomCode();
    const state = {
      id: room,
      currentCards: cards,
      round: 1,
      players: { [socket.id]: { guess: null, attempts: 0 } },
      history: [],
    };

    rooms.set(room, state);
    socket.join(room);

    callback({ success: true, room, cards });
    console.log(`🎲 Room ${room} créée`);
  });

  /** Rejoindre une room */
  socket.on("joinRoom", ({ room }, callback) => {
    const state = rooms.get(room);
    if (!state) return callback({ success: false, message: "Room introuvable" });

    if (Object.keys(state.players).length >= 2) {
      return callback({ success: false, message: "Room pleine" });
    }

    state.players[socket.id] = { guess: null, attempts: 0 };
    socket.join(room);

    callback({ success: true, room, cards: state.currentCards });
    console.log(`👥 ${socket.id} a rejoint ${room}`);

    io.to(room).emit("playerJoined", { players: Object.keys(state.players).length });

    // démarrer si 2 joueurs
    if (Object.keys(state.players).length >= 2) {
      io.to(room).emit("startGame", {
        room,
        cards: state.currentCards,
        round: state.round,
        history: state.history,
      });
    }
  });

  /** Soumettre un mot */
  socket.on("submitGuess", ({ room, guess }) => {
    const state = rooms.get(room);
    if (!state || !state.players[socket.id]) return;

    const normalized = String(guess || "").trim().toLowerCase();
    state.players[socket.id].guess = normalized;
    state.players[socket.id].attempts++;

    // notifier essai
    io.to(room).emit("guessUpdate", {
      by: socket.id,
      guess: normalized,
      round: state.round,
    });

    // Vérifier si tous les joueurs ont joué
    const allPlayed = Object.values(state.players).every((p) => p.guess !== null);
    if (!allPlayed) return;

    const guessList = Object.values(state.players).map((p) => p.guess);
    const first = guessList[0];
    const allEqual = guessList.every((g) => g === first);

    if (allEqual) {
      // victoire
      state.history.push({
        round: state.round,
        cards: state.currentCards,
        word: first,
        success: true,
        timestamp: Date.now(),
      });

      io.to(room).emit("roundWin", {
        success: true,
        solution: first,
        cards: state.currentCards,
        round: state.round,
        history: state.history,
      });

      // nouveau round
      state.round++;
      state.currentCards = pickTwoRandomCards();
      for (const id of Object.keys(state.players)) {
        state.players[id].guess = null;
        state.players[id].attempts = 0;
      }

      io.to(room).emit("newRound", {
        round: state.round,
        cards: state.currentCards,
        history: state.history,
      });
    } else {
      // pas le même mot
      const allMaxed = Object.values(state.players).every((p) => p.attempts >= MAX_ATTEMPTS);

      if (allMaxed) {
        // round perdu
        state.history.push({
          round: state.round,
          cards: state.currentCards,
          word: null,
          success: false,
          timestamp: Date.now(),
        });

        io.to(room).emit("roundFail", {
          success: false,
          message: "❌ Essais épuisés. Round perdu.",
          round: state.round,
          cards: state.currentCards,
          history: state.history,
        });

        // nouveau round
        state.round++;
        state.currentCards = pickTwoRandomCards();
        for (const id of Object.keys(state.players)) {
          state.players[id].guess = null;
          state.players[id].attempts = 0;
        }

        io.to(room).emit("newRound", {
          round: state.round,
          cards: state.currentCards,
          history: state.history,
        });
      } else {
        // juste pas le même mot → reset guesses
        for (const id of Object.keys(state.players)) state.players[id].guess = null;

        io.to(room).emit("roundMismatch", {
          success: false,
          message: "⚠️ Pas le même mot, réessayez !",
          round: state.round,
        });
      }
    }
  });

  /** Recommencer la partie */
  socket.on("restartGame", ({ room }, callback) => {
    const state = rooms.get(room);
    if (!state) return callback({ success: false, message: "Room introuvable" });

    // reset complet
    state.round = 1;
    state.history = [];
    state.currentCards = pickTwoRandomCards();
    for (const id of Object.keys(state.players)) {
      state.players[id].guess = null;
      state.players[id].attempts = 0;
    }

    io.to(room).emit("startGame", {
      room,
      cards: state.currentCards,
      round: state.round,
      history: state.history,
    });

    callback({ success: true, cards: state.currentCards });
  });

  /** Déconnexion */
  socket.on("disconnect", () => {
    console.log(`❌ ${socket.id} déconnecté`);
    for (const [room, state] of rooms.entries()) {
      if (state.players[socket.id]) {
        delete state.players[socket.id];
        io.to(room).emit("playerLeft", { players: Object.keys(state.players).length });
        if (Object.keys(state.players).length === 0) {
          rooms.delete(room);
          console.log(`🗑️ Room ${room} supprimée`);
        }
      }
    }
  });
});

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Backend lancé sur http://localhost:${PORT}`));
