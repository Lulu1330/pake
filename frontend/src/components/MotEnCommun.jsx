import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

// ⚠️ Mets ici l’URL de ton backend Socket.IO
const socket = io("https://mon-backend.com");

export default function MotEnCommunPage() {
  const [room, setRoom] = useState("");
  const [messages, setMessages] = useState([]);

  // Réception des événements
  useEffect(() => {
    socket.on("gameCreated", (id) => {
      setRoom(id);
      console.log("🎮 Partie créée :", id);
    });

    socket.on("playerJoined", (data) => {
      console.log("👥 Joueurs dans la partie :", data.players);
    });

    socket.on("wordPlayed", (data) => {
      setMessages((prev) => [...prev, `${data.player} : ${data.word}`]);
    });

    return () => {
      socket.off("gameCreated");
      socket.off("playerJoined");
      socket.off("wordPlayed");
    };
  }, []);

  const createGame = () => {
    socket.emit("createGame");
  };

  const joinGame = () => {
    socket.emit("joinGame", room);
  };

  const playWord = () => {
    socket.emit("playWord", { room, player: socket.id, word: "Exemple" });
  };

  return (
    <div className="p-4 text-white">
      <button onClick={createGame} className="bg-indigo-600 p-2 rounded mr-2">
        Créer une partie
      </button>
      <input
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        placeholder="Code partie"
        className="p-2 bg-gray-800 rounded"
      />
      <button onClick={joinGame} className="bg-green-600 p-2 rounded ml-2">
        Rejoindre
      </button>

      <div className="mt-4">
        <button onClick={playWord} className="bg-blue-600 p-2 rounded">
          Envoyer mot
        </button>
      </div>

      <div className="mt-4">
        <h3>Historique :</h3>
        <ul>
          {messages.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const demoCards = [
  "Chat","Montagne","Neige","Tigre","Plage","Lune","Robot","Livre",
  "Magicien","Forêt","Feu","Eau","Musique","Avion","Pirate","Chocolat",
  "Étoile","Cinéma","Foudre","Fantôme","Cheval","Bateau","Viking","Balai"
];

function drawFromDemo() {
  const i = Math.floor(Math.random() * demoCards.length);
  const j = Math.floor(Math.random() * demoCards.length);
  return [demoCards[i], demoCards[j]];
}

function getTwoCards() {
  try {
    if (window.PaquetDeCartes && typeof window.PaquetDeCartes.draw === "function") {
      const a = window.PaquetDeCartes.draw();
      const b = window.PaquetDeCartes.draw();
      return [a.label ?? String(a), b.label ?? String(b)];
    }
    if (Array.isArray(window.CARDS) && window.CARDS.length >= 2) {
      const i = Math.floor(Math.random() * window.CARDS.length);
      const j = Math.floor(Math.random() * window.CARDS.length);
      return [String(window.CARDS[i]), String(window.CARDS[j])];
    }
  } catch (e) {
    console.warn("Adaptateur cartes :", e);
  }
  return drawFromDemo();
}

export default function MotEnCommun() {
  const [cards, setCards] = useState(["", ""]);
  const [score, setScore] = useState(0);
  const [tries, setTries] = useState(3);
  const [bans, setBans] = useState(new Set());
  const [pending, setPending] = useState({ A: null, B: null });
  const [round, setRound] = useState(1);
  const [log, setLog] = useState([]);
  const [end, setEnd] = useState(false);

  useEffect(() => {
    newRound();
  }, []);

  function normalise(w) {
    return (w || "")
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}+/gu, "");
  }

  function newRound() {
    const [a, b] = getTwoCards();
    setCards([a, b]);
    setTries(3);
    setPending({ A: null, B: null });
    addLog(`— Nouvelle manche #${round} : ${a} ✦ ${b}`);
  }

  function addLog(entry) {
    setLog((prev) => [entry, ...prev]);
  }

  function lock(player, word) {
    if (!word || !word.trim()) return;
    setPending((prev) => {
      const updated = { ...prev, [player]: word };
      addLog(`Joueur ${player} a proposé “${word}”.`);
      setTimeout(() => checkResolution(updated), 0);
      return updated;
    });
  }

  function checkResolution(p) {
    if (p.A == null || p.B == null) return;
    const a = normalise(p.A);
    const b = normalise(p.B);

    if (a === b && a.length) {
      if (bans.has(a)) {
        addLog(`✖ Mot identique mais banni : “${p.A}”.`);
        nextTry();
        return;
      }
      const newBans = new Set(bans);
      newBans.add(a);
      setBans(newBans);
      setScore(score + 1);
      addLog(`✔ Réussi ! Mot en commun “${p.A}”. Il est maintenant banni.`);
      setRound(round + 1);
      newRound();
      return;
    }
    addLog(`✖ Pas le même mot (${p.A} / ${p.B}).`);
    nextTry();
  }

  function nextTry() {
    setTries((t) => {
      if (t - 1 <= 0) {
        endGame();
        return 0;
      }
      return t - 1;
    });
    setPending({ A: null, B: null });
  }

  function endGame() {
    setEnd(true);
  }

  function restart() {
    setScore(0);
    setBans(new Set());
    setRound(1);
    setEnd(false);
    newRound();
  }

  return (
    <div className="p-4 max-w-2xl mx-auto text-white">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">🃏 Le Mot en Commun</h1>
        <div className="flex gap-2 flex-wrap">
          <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">
            Score : {score}
          </span>
          <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">
            Essais restants : {tries}
          </span>
          <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">
            Mots bannis : {bans.size}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-4 items-center mb-4">
        <div className="bg-gray-800 p-6 rounded-xl text-center font-bold text-lg">
          {cards[0]}
        </div>
        <div className="text-center text-gray-400">✦</div>
        <div className="bg-gray-800 p-6 rounded-xl text-center font-bold text-lg">
          {cards[1]}
        </div>
      </div>

      {!end && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm text-gray-400">Joueur A</h3>
            <input
              type="text"
              placeholder="Mot de liaison"
              className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white"
              onKeyDown={(e) => e.key === "Enter" && lock("A", e.target.value)}
            />
            <button
              className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 p-2 rounded"
              onClick={() => lock("A", document.querySelector("input[placeholder='Mot de liaison']").value)}
            >
              Valider
            </button>
          </div>

          <div>
            <h3 className="text-sm text-gray-400">Joueur B</h3>
            <input
              type="text"
              placeholder="Mot de liaison"
              className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white"
              onKeyDown={(e) => e.key === "Enter" && lock("B", e.target.value)}
            />
            <button
              className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 p-2 rounded"
              onClick={() => lock("B", document.querySelectorAll("input[placeholder='Mot de liaison']")[1].value)}
            >
              Valider
            </button>
          </div>
        </div>
      )}

      {end && (
        <div className="mt-4 bg-gray-900 border border-gray-700 p-4 rounded">
          <div className="font-bold text-lg">Partie terminée</div>
          <div className="text-gray-400">Score final : {score}</div>
          <div className="mt-2 flex gap-2">
            <button className="bg-indigo-600 p-2 rounded" onClick={restart}>
              Rejouer
            </button>
            <button
              className="bg-gray-700 p-2 rounded"
              onClick={() => alert("Mots bannis :\n" + Array.from(bans).join(", "))}
            >
              Voir mots bannis
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-300">
        But : trouvez le même mot en 3 essais max. Un mot qui a déjà relié deux
        cartes est banni pour le reste de la partie.
      </div>

      <div className="mt-4 max-h-48 overflow-y-auto text-sm space-y-1">
        {log.map((entry, idx) => (
          <div key={idx}>{entry}</div>
        ))}
      </div>
    </div>
  );
}
