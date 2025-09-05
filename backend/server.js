import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // ⚠️ en prod, mets ton domaine Vercel
    methods: ["GET", "POST"]
  }
});

// Base temporaire (à remplacer par ta DB cartes.db)
const cards = ["Chat", "Montagne", "Avion", "Lune", "Mer", "Pizza", "Chien"];

let games = {}; // { roomCode: { cards, bans, round, attempts, players, score } }

function getTwoCards(bans) {
  let c1, c2;
  do {
    c1 = cards[Math.floor(Math.random() * cards.length)];
    c2 = cards[Math.floor(Math.random() * cards.length)];
  } while (c1 === c2 || bans.includes(c1) || bans.includes(c2));
  return [c1, c2];
}

io.on("connection", (socket) => {
  console.log("✅ Nouveau joueur :", socket.id);

  // Créer une partie
  socket.on("createGame", () => {
    const room = Math.random().toString(36).substr(2, 6).toUpperCase();
    const [c1, c2] = getTwoCards([]);
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
  socket.on("playWord", ({ room, player, word }) => {
    const game = games[room];
    if (!game) return;

    // stocker la proposition
    game.players[player] = word;

    // quand 2 joueurs ont joué
    if (Object.keys(game.players).length === 2) {
      const words = Object.values(game.players);
      game.attempts++;

      if (words[0].toLowerCase() === words[1].toLowerCase()) {
        // ✅ succès
        game.score++;
        game.bans.push(words[0]);
        const [c1, c2] = getTwoCards(game.bans);
        game.cards = [c1, c2];
        game.round++;
        game.attempts = 0;
        game.players = {};
        io.to(room).emit("roundResult", { success: true, word: words[0] });
      } else if (game.attempts >= 3) {
        // ❌ échec
        const used = Object.values(game.players);
        game.bans.push(...used);
        game.attempts = 0;
        game.players = {};
        const [c1, c2] = getTwoCards(game.bans);
        game.cards = [c1, c2];
        game.round++;
        io.to(room).emit("roundResult", { success: false, words: used });
      } else {
        io.to(room).emit("roundResult", { success: false, try: game.attempts });
        game.players = {}; // reset pour le prochain essai
      }
    }

    io.to(room).emit("stateUpdate", game);
  });

  socket.on("disconnect", () => {
    console.log("❌ Joueur déconnecté :", socket.id);
  });
});

server.listen(3001, () => {
  console.log("🔥 Serveur Socket.IO prêt sur http://localhost:3001");
});
