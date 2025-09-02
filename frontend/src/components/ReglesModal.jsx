import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ReglesModal({ showRegles, setShowRegles }) {
  return (
    <AnimatePresence>
      {showRegles && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-2xl w-full mx-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl font-bold mb-4 text-center">📖 Bienvenue sur Pake-de-cartes</h1>
            <p className="text-gray-700 dark:text-gray-200 mb-4 leading-relaxed">
              <b>Pake-de-cartes</b> est un outil pensé pour aider les personnes qui veulent jouer à tous jeux nécessitant un paquet de carte à thèmes.
              <br />
              Il n'est pas pensé en tant que jeu en lui-même, vous pouvez l'utiliser en fonction de vos envies et de vos règles.
            </p>

            <h2 className="text-lg font-semibold mb-2">✨ Vous avez à votre disposition :</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 mb-6">
              <li>🃏 Un paquet de cartes (aujourd’hui <b>700 cartes</b>)</li>
              <li>⚙️ Des options pour choisir le nombre de cartes, le nombre d’équipes et leur nom</li>
              <li>⏱️ Un chronomètre (avec durée personnalisable)</li>
              <li>🏆 Un scoreboard (où vous pouvez attribuer des cartes pour augmenter les points ou les ajouter manuellement)</li>
            </ul>

            <div className="flex justify-center">
              <button
                onClick={() => setShowRegles(false)}
                className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
              >
                🚀 Commencer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
