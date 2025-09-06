import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import bodyParser from "body-parser";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// === Connexion SQLite ===
const dbPromise = open({
  filename: "./cartes.db", // ⚠️ doit être dans le même dossier que index.js
  driver: sqlite3.Database
});

// === API REST classique ===
app.post("/api/analyse", (req, res) => {
  const input = req.body.input;
  const summary = `Résumé simulé de : ${input}`;
  res.json({ summary });
});

// === Serveur HTTP pour brancher Socket.IO ===
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://www.pake-de-cartes.fr", // 👉 ton domaine Vercel frontend
    methods: ["GET", "POST"]
  }
});

// === Gestion des parties ===
let games = {}; // { roomCode: { cards, bans, round, attempts, players, score } }

// Fonction utilitaire pour tirer 2 cartes depuis SQLite
async function getTwoCards(bans = []) {
  const db = await dbPromise;

  let query = "SELECT name FROM cards";
  let params = [];

  if (bans.length > 0) {
    query += ` WHERE name NOT IN (${bans.map(() => "?").join(",")})`;
    params = bans;
  }

  const allCards = await db.all(query, params);

  if (allCards.length < 2) {
    throw new Error("Pas assez de cartes disponibles !");
  }

  const i = Math.floor(Math.random() * allCards.length);
  let j;
  do {
    j = Math.floor(Math.random() * allCards.length);
  } while (j === i);

  return [allCards[i].name, allCards[j].name];
}

// === Socket.IO ===
io.on("connection", (socket) => {
  console.log("✅ Nouveau joueur :", socket.id);

  // Créer une partie
  socket.on("createGame", async () => {
    try {
      const [c1, c2] = await getTwoCards([]);
      const room = Math.random().toString(36).substr(2, 6).toUpperCase();

      games[room] = {
        cards: [c1, c2],
        bans: [],
        round: 1,
        attempts: 0,
        players: {},
        score: 0,
      };

      socket.join(room);
      socket.emit("gameCreated", room);
      io.to(room).emit("stateUpdate", games[room]);
    } catch (err) {
      console.error("Erreur création partie :", err);
      socket.emit("error", "Impossible de charger les cartes");
    }
  });

  // Rejoindre une partie
  socket.on("joinGame", (room) => {
    if (games[room]) {
      socket.join(room);
      io.to(room).emit("stateUpdate", games[room]);
    } else {
      socket.emit("error", "Partie introuvable");
    }
  });

  // Jouer un mot
  socket.on("playWord", async ({ room, player, word }) => {
    const game = games[room];
    if (!game) return;

    game.players[player] = word;

    // Quand 2 joueurs ont joué
    if (Object.keys(game.players).length === 2) {
      const words = Object.values(game.players);
      game.attempts++;

      if (words[0].toLowerCase() === words[1].toLowerCase()) {
        // ✅ Succès
        game.score++;
        game.bans.push(words[0]);

        const [c1, c2] = await getTwoCards(game.bans);
        game.cards = [c1, c2];
        game.round++;
        game.attempts = 0;
        game.players = {};

        io.to(room).emit("roundResult", { success: true, word: words[0] });
      } else if (game.attempts >= 3) {
        // ❌ Échec après 3 essais
        const used = Object.values(game.players);
        game.bans.push(...used);

        const [c1, c2] = await getTwoCards(game.bans);
        game.cards = [c1, c2];
        game.round++;
        game.attempts = 0;
        game.players = {};

        io.to(room).emit("roundResult", { success: false, words: used });
      } else {
        // ❌ Mauvais mot mais encore des essais
        io.to(room).emit("roundResult", { success: false, try: game.attempts });
        game.players = {}; // reset pour essai suivant
      }
    }

    io.to(room).emit("stateUpdate", game);
  });

  socket.on("disconnect", () => {
    console.log("❌ Joueur déconnecté :", socket.id);
  });
});

// === Lancement du serveur ===
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🔥 Backend + Socket.IO prêt sur http://localhost:${PORT}`);
});
