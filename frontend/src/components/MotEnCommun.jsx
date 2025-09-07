import React, { useState, useEffect } from "react";
import { socket } from "../socket"; // <-- import

export default function MotEnCommun() {
  const [room, setRoom] = useState("");
  const [inGame, setInGame] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connecté au serveur :", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Déconnecté du serveur");
    });

    socket.on("newWord", ({ player, word }) => {
      addLog(`👤 ${player} a joué : ${word}`);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("newWord");
    };
  }, []);

  const joinRoom = () => {
    if (room.trim()) {
      socket.emit("joinRoom", room);
      addLog(`🔑 Rejoint la partie ${room}`);
      setInGame(true);
    }
  };

  const playWord = (player, word) => {
    if (!word.trim()) return;
    socket.emit("playWord", { room, player, word });
    addLog(`👉 ${player} propose : ${word}`);
  };

  const addLog = (msg) => {
    setMessages((prev) => [msg, ...prev]);
  };

  return (
    <div className="p-4 text-white">
      {!inGame ? (
        <div>
          <h1 className="text-xl font-bold mb-4">🃏 Mot en Commun</h1>
          <input
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Code partie"
            className="p-2 bg-gray-800 rounded mr-2"
          />
          <button
            onClick={joinRoom}
            className="bg-green-600 px-3 py-1 rounded"
          >
            Rejoindre
          </button>
        </div>
      ) : (
        <div>
          <h2 className="mb-2">Salle : {room}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                id="inputA"
                placeholder="Mot Joueur A"
                className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white"
              />
              <button
                className="mt-2 w-full bg-indigo-600 p-2 rounded"
                onClick={() =>
                  playWord("A", document.getElementById("inputA").value)
                }
              >
                Jouer
              </button>
            </div>
            <div>
              <input
                type="text"
                id="inputB"
                placeholder="Mot Joueur B"
                className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white"
              />
              <button
                className="mt-2 w-full bg-indigo-600 p-2 rounded"
                onClick={() =>
                  playWord("B", document.getElementById("inputB").value)
                }
              >
                Jouer
              </button>
            </div>
          </div>

          <div className="mt-6 bg-gray-900 p-3 rounded max-h-48 overflow-y-auto text-sm">
            {messages.map((m, i) => (
              <div key={i}>{m}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
