import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { motion } from "framer-motion";

const socket = io("https://api.pake-de-cartes.fr", {
  transports: ["websocket"],
});

// Limite de tentatives par round
const MAX_ATTEMPTS = 5;

export default function MotEnCommun() {
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [cards, setCards] = useState(null);
  const [round, setRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(10);
  const [guess, setGuess] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [pastRounds, setPastRounds] = useState([]);
  const [bannedWords, setBannedWords] = useState([]);
  const [score, setScore] = useState({ wins: 0, losses: 0 });
  const [infoMessage, setInfoMessage] = useState("");

  useEffect(() => {
    socket.on("startGame", ({ room, cards, round, maxRounds }) => {
      setRoom(room);
      setCards(cards);
      setRound(round);
      setMaxRounds(maxRounds);
      setJoined(true);
      setWaiting(false);
      setAttempts([]);
      setPastRounds([]);
      setBannedWords([]);
      setScore({ wins: 0, losses: 0 });
    });

    socket.on("guessUpdate", ({ by, guess, round }) => {
      setAttempts((prev) => [...prev, { by, guess, round }]);
    });

    socket.on("roundWin", (data) => {
      setPastRounds((prev) => [
        ...prev,
        {
          cards: data.cards,
          solution: data.solution,
          round: data.round,
          success: true,
        },
      ]);
      setScore((s) => ({ ...s, wins: s.wins + 1 }));
      setCards(data.cards);
      setRound(data.round);
      setGuess("");
      setWaiting(false);
      setInfoMessage("");

      if (data.solution) {
        setBannedWords((prev) => [...prev, data.solution.toLowerCase()]);
      }
    });

    socket.on("newRound", (data) => {
      setCards(data.cards);
      setRound(data.round);
      setAttempts([]);
      setGuess("");
      setWaiting(false);
      setInfoMessage("");
    });

    socket.on("roundFail", (data) => {
      setPastRounds((prev) => [
        ...prev,
        { cards: data.cards, solution: null, round: data.round, success: false },
      ]);
      setScore((s) => ({ ...s, losses: s.losses + 1 }));
      setGuess("");
      setWaiting(true); // attendre le "newRound" que le serveur envoie après
      setInfoMessage("");
    });

    socket.on("roundMismatch", (data) => {
      setInfoMessage(data.message || "❌ Pas le même mot, réessayez !");
      setWaiting(false);
    });

    socket.on("gameEnd", () => {
      setWaiting(true);
    });

      return () => {
        socket.removeAllListeners();
      };
    }, []);

  const handleCreate = () => {
    socket.emit("createRoom", (res) => {
      if (res.success) {
        setRoom(res.room);
        setCards(res.cards);
        setRound(1);
        setJoined(true);
        setWaiting(false);
        setAttempts([]);
        setScore({ wins: 0, losses: 0 });
      } else {
        alert(res.message || "Erreur création");
      }
    });
  };

  const handleJoin = () => {
    socket.emit("joinRoom", { room }, (res) => {
      if (res.success) {
        setCards(res.cards);
        setJoined(true);
        setRound(1);
        setAttempts([]);
        setBannedWords([]);
        setScore({ wins: 0, losses: 0 });
      } else {
        alert(res.message);
      }
    });
  };
  
  const handleRestart = () => {
   socket.emit("restartGame", { room }, (res) => {
      if (res.success) {
        setCards(res.cards);
        setRound(1);
        setAttempts([]);
        setPastRounds([]);
        setBannedWords([]);
        setScore({ wins: 0, losses: 0 });
        setWaiting(false);
      }
    });
  };

  const submitGuess = () => {
    if (!guess.trim()) return;
    const myGuess = guess.trim().toLowerCase();

    if (bannedWords.includes(myGuess)) {
      alert("❌ Ce mot est banni !");
      return;
    }

    const myAttempts = attempts.filter(
      (a) => a.by === socket.id && a.round === round
    ).length;

    if (myAttempts >= MAX_ATTEMPTS) {
      alert(`⚠️ Tu as atteint la limite de ${MAX_ATTEMPTS} essais.`);
      return;
    }

    // Bloquer après l’envoi jusqu’à ce que l’autre joue
    setWaiting(true);
    socket.emit("submitGuess", { room, guess: myGuess });
    setGuess("");
  };

  // Récupère mes essais et ceux de l’autre joueur
  const myAttempts = attempts.filter(
    (a) => a.by === socket.id && a.round === round
  );
  const otherAttempts = attempts.filter(
    (a) => a.by !== socket.id && a.round === round
  );

  // Débloque quand l’autre a joué autant de fois que moi
  useEffect(() => {
    if (waiting && myAttempts.length === otherAttempts.length) {
      setWaiting(false);
    }
  }, [attempts]);

  return (
    <div className="min-h-screen p-6 flex flex-col items-center bg-slate-50">
      <h1 className="text-2xl font-bold mb-4">Mot en commun (tour par tour)</h1>

      {!joined ? (
        <div className="p-4 bg-white rounded shadow w-full max-w-md">
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleCreate}
              className="px-3 py-2 text-white rounded bg-green-600"
            >
              Créer une partie
            </button>
            <input
              value={room}
              onChange={(e) => setRoom(e.target.value.toUpperCase())}
              placeholder="Code room"
              className="border px-2 py-1 rounded flex-1"
            />
            <button
              onClick={handleJoin}
              className="px-3 py-2 text-white rounded bg-blue-600"
            >
              Rejoindre
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-6xl">
          {/* Score */}
          <div className="bg-white rounded-xl shadow p-4 col-span-1 order-1 md:order-none">
            <h3 className="font-semibold mb-2">🏆 Score</h3>
            <p className="text-green-600">Victoires : {score.wins}</p>
            <p className="text-red-600">Défaites : {score.losses}</p>
            <button
              onClick={handleRestart}
              className="mt-4 px-3 py-2 rounded bg-indigo-600 text-white w-full"
            >
              🔄 Recommencer
            </button>
          </div>

          {/* Historique */}
          <div className="bg-white rounded-xl shadow p-4 col-span-1 order-2 md:order-none">
            <h3 className="font-semibold mb-2">📜 Tours précédents</h3>
            {pastRounds.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun pour l’instant</p>
            ) : (
              pastRounds.map((r, idx) => (
                <div key={idx} className="border-b pb-2 mb-2">
                  {r.cards?.card1 && r.cards?.card2 ? (
                    <div className="font-semibold text-indigo-600">
                      {r.cards.card1.carte} + {r.cards.card2.carte}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">Cartes indisponibles</div>
                  )}

                  {r.success ? (
                    <div className="text-green-600">
                      ✅ Mot gagnant : {r.solution}
                    </div>
                  ) : (
                    <div className="text-red-600">
                      ❌ Round perdu (aucun mot trouvé)
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Jeu */}
          <div className="col-span-1 md:col-span-2 flex flex-col gap-4 order-4 md:order-non">
            <div className="flex justify-between mb-4">
              <p>
                Room: <span className="font-mono">{room}</span>
              </p>
              <p>
                Tour: {round}/{maxRounds}
              </p>
            </div>

            {/* Cartes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {["card1", "card2"].map(
                (c) =>
                  cards?.[c] && (
                    <motion.div
                      key={c}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-60 h-80 p-6 rounded-xl shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col justify-center items-center text-center text-white"
                    >
                      <strong className="text-xl">{cards[c].carte}</strong>
                      <p className="text-sm opacity-90 mt-2">{cards[c].theme}</p>
                    </motion.div>
                  )
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white rounded shadow mb-4">
              <label className="block mb-2">Ton mot :</label>
              <div className="flex gap-2">
                <input
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder="Entre ton mot"
                  className="border px-2 py-1 rounded flex-1"
                  disabled={waiting}
                />
                <button
                  onClick={submitGuess}
                  className="px-4 py-2 rounded text-white bg-indigo-600 disabled:bg-gray-400"
                  disabled={waiting}
                >
                  Envoyer
                </button>
              </div>
              {waiting && (
                <p className="mt-2 text-sm text-gray-600">
                  ⏳ En attente de l’autre joueur...
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Essais restants : {MAX_ATTEMPTS - myAttempts.length}
              </p>
              {infoMessage && (
              <p className="mt-2 text-sm text-orange-600">
                {infoMessage}
              </p>
              )}
            </div>

            {/* ❤️ Tentatives */}
            <div className="mt-4">
              <p className="font-semibold">Tentatives restantes :</p>
              <div className="flex space-x-1 text-2xl">
                {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                  <span key={i}>{i < MAX_ATTEMPTS - myAttempts.length ? "❤️" : "🤍"}</span>
                ))}
              </div>
            </div>

            {/* Essais */}
            <h2 className="mt-6 font-bold">📝 Essais (tour en cours)</h2>
            {myAttempts.length === 0 && otherAttempts.length === 0 ? (
              <p className="text-gray-500">Aucun essai pour l’instant</p>
            ) : (
              (() => {
                // nombre de tours synchro
                const pairs = Math.min(myAttempts.length, otherAttempts.length);
                if (pairs === 0) {
                  return (
                    <p className="italic text-gray-400">
                      En attente de l’autre joueur…
                    </p>
                  );
                }
                return (
                  <div className="space-y-2 mt-2">
                    {Array.from({ length: pairs }).map((_, idx) => {
                      const me = myAttempts[idx];
                      const other = otherAttempts[idx];
                      return (
                        <div key={idx} className="flex gap-2">
                          <div className="flex-1 p-2 border rounded bg-blue-100">
                            <span className="font-semibold">Vous</span> →{" "}
                            <span className="italic">{me.guess}</span>
                          </div>
                          <div className="flex-1 p-2 border rounded bg-red-100">
                            <span className="font-semibold">Adversaire</span> →{" "}
                            <span className="italic">{other.guess}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()
            )}
          </div>

          {/* Mots bannis */}
          <div className="bg-white rounded-xl shadow p-4 col-span-1 order-3 md:order-none">
            <h3 className="font-semibold mb-2">🚫 Mots bannis</h3>
            {bannedWords.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun</p>
            ) : (
              <ul className="space-y-1 text-sm text-red-600 font-semibold">
                {bannedWords.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
