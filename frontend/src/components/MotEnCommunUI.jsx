import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png"; 
import { useState } from "react";

function Carte({ contenu }) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  return (
    <motion.div
      className="relative w-32 h-48 rounded-2xl shadow-2xl cursor-pointer preserve-3d"
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{ duration: 0.55 }}
      onClick={() => setIsFlipped(!isFlipped)} // clic pour retourner
    >
      {/* Verso (dos de la carte) */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center rounded-2xl backface-hidden">
        <img
          src={logo}
          alt="Dos de la carte"
          className="max-w-[60%] max-h-[60%] object-contain"
        />
      </div>

      {/* Recto (contenu de la carte) */}
      <div className="absolute inset-0 bg-white text-black flex items-center justify-center rounded-2xl shadow-lg backface-hidden"
           style={{ transform: "rotateY(180deg)" }}>
        <span className="text-lg font-bold text-center px-2">
          {contenu}
        </span>
      </div>
    </motion.div>
  );
}

export default function MotEnCommunUI({
  state,
  room,
  role,
  word,
  roundResult,
  setWord,
  createGame,
  joinGame,
  playWord,
  socket,
  hasPlayedThisRound
}) {
  return (
  <div className="min-h-screen bg-gradient-to-br from-purple-700 via-indigo-800 to-black text-white flex flex-col items-center p-6">
    <div className="flex w-full max-w-7xl gap-6">
      
      {/* 📌 Historique (uniquement réussites) */}
      <div className="order-2 md:order-1 w-full md:w-1/4 bg-gray-800 p-3 rounded-xl overflow-y-auto max-h-60 md:max-h-screen">
        <h2 className="text-lg font-bold mb-2 text-indigo-400">Historique</h2>
        <ul className="space-y-2 text-sm md:text-base">
          {state?.history?.map((h, i) => (
            <li key={i} className="p-2 bg-gray-700 rounded-lg">
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">
                  {h.cards.map((c) => c.carte).join(" / ")}
                </span>
                <span className="text-green-400 font-bold">→ {h.word}</span>
                <span className="text-xs text-gray-400">
                  Essais : {h.attempts}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 🎮 Partie principale */}
      <div className="order-1 md:order-2 flex-1 bg-gray-900 p-4 md:p-6 rounded-xl shadow-lg flex flex-col items-center text-center">
        <h1 className="text-xl md:text-2xl font-bold mb-4 text-indigo-400">Mot en Commun</h1>

        {/* === Si pas encore de partie === */}
        {!room && (
          <div className="bg-gray-800 p-6 rounded-xl shadow-md w-full max-w-md mx-auto text-center">
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
                className="flex-1 p-2 rounded-lg bg-gray-700 border border-gray-600"
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

        {/* === Partie en cours === */}
        {room && (
          <>
            {/* Infos partie */}
            <p className="mb-2">
              Code : <span className="font-mono">{room}</span>
            </p>
            <p className="mb-2">
              Ton rôle : <span className="font-bold text-indigo-400">{role}</span>
            </p>
            <p className="mb-6">
              Score total :{" "}
              <span className="font-bold text-green-400">{state?.score || 0}</span>
            </p>

            {/* Cartes */}
            {state?.currentRound?.cards && (
              <div className="flex gap-6 justify-center mb-6">
                <AnimatePresence mode="popLayout">
                  {state.currentRound.cards.map((c) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ scale: 1.05 }}
                      className="w-32 h-48 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-lg font-bold text-black"
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
                disabled={!!state?.
                  words?.find((w) => w.role === role)} // 🔒 bloque si joueur a déjà joué
              />
              <button
                onClick={playWord}
                disabled={!!state?.words?.find((w) => w.role === role)}
                className="bg-indigo-600 hover:bg-indigo-700 px-6 rounded-lg disabled:opacity-50"
              >
                Jouer
              </button>
              <button
                onClick={() => socket.emit("skipRound", { room })}
                className="bg-red-600 hover:bg-red-700 px-6 rounded-lg"
              >
                Passer
              </button>
            </div>

            {/* Liste des essais*/}
            {state?.currentRound?.failedAttempts?.length > 0 && (
            <div className="mt-6 bg-gray-800 p-4 rounded-xl">
              <h3 className="text-lg font-bold mb-2">Essais ratés ce round</h3>
              <ul className="space-y-1">
                {state.currentRound.failedAttempts.map((attempt, i) => (
                  <li key={i} className="text-sm text-red-400">
                    {attempt.map(a => `${a.role} : ${a.word}`).join(" | ")}
                  </li>
                ))}
              </ul>
            </div>
            )}

            {/* Liste des mots joués ce round */}
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-2">Mots du round en cours</h3>
              <ul className="space-y-1">
                {["A", "B"].map((r) => {
                  const entry = state?.words?.find((w) => w.role === r);
                  return (
                    <li key={r} className="text-lg">
                      {r} :{" "}
                      {entry
                        ? (entry.word
                            ? entry.word // révélé si round fini
                            : "Mot joué ✅") // masqué si round pas fini
                        : <span className="italic text-blue-400">En attente...</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}
      </div>

      {/* 🚫 Mots bannis */}
      <div className="order-3 w-full md:w-1/4 bg-gray-800 p-3 rounded-xl shadow-lg overflow-y-auto max-h-40 md:max-h-screen">
        <h2 className="text-lg font-bold mb-3 text-red-400">Mots bannis</h2>
        <ul className="space-y-2">
          {state?.bannedWords?.length > 0 ? (
            state.bannedWords.map((word, i) => (
              <li key={i} className="p-2 bg-gray-700 rounded text-sm text-red-300">
                {word}
              </li>
            ))
          ) : (
            <li className="text-gray-400 italic">Aucun mot banni</li>
          )}
        </ul>
      </div>
    </div>
  </div>
)};
