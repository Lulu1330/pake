import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

// ⚠️ Mets ici l’URL de ton backend Render
const socket = io("https://pake-ke5g.onrender.com");

export default function MotEnCommun() {
  const [room, setRoom] = useState("");
  const [cards, setCards] = useState(["", ""]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [tries, setTries] = useState(0);
  const [messages, setMessages] = useState([]);
  const [bans, setBans] = useState([]);

  useEffect(() => {
    // Quand une partie est créée
    socket.on("gameCreated", (id) => {
      setRoom(id);
      addLog(`🎮 Partie créée : ${id}`);
    });

    // Quand l’état du jeu change
    socket.on("stateUpdate", (game) => {
      setCards(game.cards);
      setScore(game.score);
      setRound(game.round);
      setTries(game.attempts);
      setBans(game.bans);
    });

    // Quand une manche est résolue
    socket.on("roundResult", (data) => {
      if (data.success) {
        addLog(`✔ Mot trouvé : ${data.word}`);
      } else if (data.words) {
        addLog(`❌ Pas trouvé, mots joués : ${data.words.join(", ")}`);
      } else {
        addLog(`⏳ Pas encore trouvé (essai ${data.try})`);
      }
    });

    return () => {
      socket.off("gameCreated");
      socket.off("stateUpdate");
      socket.off("roundResult");
    };
  }, []);

  // === FONCTIONS ===
  const createGame = () => {
    socket.emit("createGame");
  };

  const joinGame = () => {
    if (room) {
      socket.emit("joinGame", room);
      addLog(`🔑 Tentative de rejoindre la partie ${room}`);
    }
  };

  const playWord = (player, word) => {
    if (!word.trim()) return;
    socket.emit("playWord", { room, player, word });
    addLog(`👤 Joueur ${player} a proposé : ${word}`);
  };

  const addLog = (msg) => {
    setMessages((prev) => [msg, ...prev]);
  };

  // === RENDU ===
  return (
    <div className="p-4 max-w-2xl mx-auto text-white">
      <h1 className="text-xl font-bold mb-4">🃏 Le Mot en Commun</h1>

      <div className="mb-4 flex gap-2">
        <button onClick={createGame} className="bg-indigo-600 p-2 rounded">
          Créer une partie
        </button>
        <input
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Code partie"
          className="p-2 bg-gray-800 rounded"
        />
        <button onClick={joinGame} className="bg-green-600 p-2 rounded">
          Rejoindre
        </button>
      </div>

      {/* Infos */}
      <div className="flex gap-4 mb-4">
        <span>Score : {score}</span>
        <span>Manche : {round}</span>
        <span>Essais : {tries}</span>
        <span>Mots bannis : {bans.length}</span>
      </div>

      {/* Cartes */}
      <div className="grid grid-cols-3 gap-4 items-center mb-6">
        <div className="bg-gray-800 p-6 rounded-xl text-center font-bold text-lg">
          {cards[0]}
        </div>
        <div className="text-center text-gray-400">✦</div>
        <div className="bg-gray-800 p-6 rounded-xl text-center font-bold text-lg">
          {cards[1]}
        </div>
      </div>

      {/* Joueurs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm text-gray-400">Joueur A</h3>
          <input
            type="text"
            id="inputA"
            placeholder="Mot"
            className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white"
          />
          <button
            className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 p-2 rounded"
            onClick={() => {
              const word = document.getElementById("inputA").value;
              playWord("A", word);
            }}
          >
            Valider
          </button>
        </div>

        <div>
          <h3 className="text-sm text-gray-400">Joueur B</h3>
          <input
            type="text"
            id="inputB"
            placeholder="Mot"
            className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white"
          />
          <button
            className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 p-2 rounded"
            onClick={() => {
              const word = document.getElementById("inputB").value;
              playWord("B", word);
            }}
          >
            Valider
          </button>
        </div>
      </div>

      {/* Historique */}
      <div className="mt-6 max-h-48 overflow-y-auto text-sm space-y-1 bg-gray-900 p-3 rounded">
        {messages.map((m, i) => (
          <div key={i}>{m}</div>
        ))}
      </div>
    </div>
  );
}
