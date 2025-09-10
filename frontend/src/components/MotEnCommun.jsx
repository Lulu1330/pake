import { useEffect, useState } from "react";
import { socket } from "../socket";
import { motion, AnimatePresence } from "framer-motion";

export default function MotEnCommun() {
  const [room, setRoom] = useState(null);
  const [role, setRole] = useState(null);
  const [state, setState] = useState(null);
  const [word, setWord] = useState("");

  useEffect(() => {
    socket.on("gameCreated", (roomCode) => {
      setRoom(roomCode);
    });

    socket.on("gameJoined", ({ room, role }) => {
      setRoom(room);
      setRole(role);
    });

    socket.on("stateUpdate", (gameState) => {
      setState(gameState);
    });

    socket.on("roundResult", (result) => {
      if (result.success) {
        alert(`✅ Bravo ! Vous avez trouvé : ${result.word}`);
      } else {
        alert(`❌ ${result.message}`);
      }
    });

    socket.on("errorMessage", (msg) => alert(msg));

    return () => {
      socket.off("gameCreated");
      socket.off("gameJoined");
      socket.off("stateUpdate");
      socket.off("roundResult");
      socket.off("errorMessage");
    };
  }, []);

  const createGame = () => socket.emit("createGame");
  const joinGame = (roomCode) => socket.emit("joinGame", roomCode);

  const playWord = () => {
    if (room && word.trim()) {
      socket.emit("playWord", { room, word });
      setWord("");
    }
  };

  const isWordUsed = (w) =>
   state?.history?.some((h) => h.word.toLowerCase() === w.toLowerCase());

return (
  <div className="min-h-screen bg-gradient-to-br from-purple-700 via-indigo-800 to-black text-white flex flex-col items-center p-6">
    {/* Historique à gauche */}
    <div className="w-1/4 bg-gray-800 p-2 rounded overflow-y-auto max-h-screen">
      <h2 className="text-lg font-bold mb-2">Historique</h2>
      <ul className="space-y-2">
        {state?.history?.map((h, i) => (
          <li key={i} className="p-2 bg-gray-700 rounded">
            <div className="flex justify-between">
              <span>
                {(h.cards || []).map((c) => c.carte).join(" / ")} → {h.word}
              </span>
              <span className="text-red-500 font-bold">{h.attempts}</span>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4">Essais totaux : {state?.attempts ?? 0}</p>
    </div>

    {/* Partie principale */}
    <div className="flex-1">
      <h1 className="text-2xl font-bold mb-4 text-center">Mot en Commun</h1>

      {/* Création ou rejoindre une partie */}
      {!room && (
        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg w-full max-w-md mx-auto text-center">
          <button
            onClick={createGame}
            className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl font-bold text-lg mb-4"
          >
            Créer une partie
          </button>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Code partie"
              className="flex-1 p-2 rounded-lg bg-gray-800 border border-gray-700"
              onKeyDown={(e) => {
                if (e.key === "Enter") joinGame(e.target.value);
              }}
            />
            <button
              onClick={() =>
                joinGame(document.querySelector("input").value)
              }
              className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg"
            >
              Rejoindre
            </button>
          </div>
        </div>
      )}

      {/* Partie en cours */}
      {room && (
        <div className="bg-gray-900 p-6 rounded-2xl shadow-xl text-center">
          <p className="mb-2">
            Code : <span className="font-mono">{room}</span>
          </p>
          <p className="mb-6">
            Ton rôle : <span className="font-bold">{role}</span>
          </p>

          {/* Cartes du round */}
          {state?.currentRound?.cards?.length > 0 && (
            <div className="flex gap-6 justify-center mb-6">
              <AnimatePresence mode="popLayout">
                {state.currentRound.cards.map((c) => (
                  <motion.div
                    key={c.id || c.carte} // clé unique pour Framer Motion
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.4 }}
                    className="w-32 h-48 bg-white rounded-2xl shadow-lg flex items-center justify-center text-2xl font-bold text-black"
                  >
                    {c.carte}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Saisie du mot */}
          <div className="flex gap-2 mb-6 justify-center">
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder={`Ton mot (${role})`}
              className="flex-1 p-3 rounded-lg bg-gray-800 border border-gray-700 max-w-xs"
            />
            <button
              onClick={playWord}
              className="bg-indigo-600 hover:bg-indigo-700 px-6 rounded-lg"
            >
              Jouer
            </button>
          </div>

          {/* Mots révélés seulement si les deux joueurs ont joué */}
          {state?.words?.length === 2 && (
            <div className="mt-4">
              <h3>Mots joués :</h3>
              <ul>
                {state.words.map((entry, i) => (
                  <li key={i}>
                    {entry.role} : {entry.word}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-2 text-sm text-gray-400">
            Essais ce round : {state?.currentRound?.attempts ?? 0}
          </p>
        </div>
      )}
    </div>
  </div>
)};
