// src/components/CardDisplay.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Couleurs fixées en dur (Tailwind classes + hex fallback)
 * Si Tailwind purge les classes dynamiques, l'inline hex assure l'affichage.
 */
const equipeColors = [
  { tw: "bg-red-500 hover:bg-red-600", hex: "#ef4444" },
  { tw: "bg-blue-500 hover:bg-blue-600", hex: "#3b82f6" },
  { tw: "bg-green-500 hover:bg-green-600", hex: "#10b981" },
  { tw: "bg-yellow-500 hover:bg-yellow-600", hex: "#f59e0b" },
  { tw: "bg-purple-500 hover:bg-purple-600", hex: "#8b5cf6" },
  { tw: "bg-pink-500 hover:bg-pink-600", hex: "#ec4899" },
];

export default function CardDisplay({
  carte,
  index,
  total,
  onNext,
  onPrev,
  onAnnuler,
  isValidated,
  equipes = [],
  onAttribuer = () => {},
}) {
  if (!carte) return null;

  const isFirstCard = index === 0;
  // par défaut : toutes les cartes autres que la 1ère sont "déjà visibles"
  const [isFlipped, setIsFlipped] = useState(!isFirstCard);

  // Réinitialiser l'état du flip quand on change de carte (important!)
  useEffect(() => {
    setIsFlipped(!isFirstCard);
  }, [index, isFirstCard]);

  return (
    <motion.div
      key={`${carte.carte}-${index}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.28 }}
      className="max-w-md w-full mx-auto p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800 flex flex-col justify-between min-h-[360px] overflow-hidden"
    >
      {/* Carte principale (flip seulement pour la 1ère) */}
      <div className="flex-1 flex items-center justify-center">
        <div
          className="w-60 h-80 perspective"
          // seul clic sur la 1ère carte permet de la retourner
          onClick={() => {
            if (isFirstCard) setIsFlipped(true);
          }}
        >
          <motion.div
            className="relative w-full h-full rounded-xl shadow-lg cursor-pointer preserve-3d"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.55 }}
          >
            {/* Face cachée */}
            {!isFlipped && (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xl font-bold rounded-xl backface-hidden">
                🃏 Retournez la carte
              </div>
            )}

            {/* Face visible */}
            {/* on affiche la face même si isFlipped = true OU si ce n'est pas la 1ère carte */}
            <div className="absolute inset-0 bg-white dark:bg-gray-900 text-center p-6 rounded-xl backface-hidden rotate-y-180 flex flex-col justify-center">
              <strong className="text-xl md:text-2xl text-indigo-600 dark:text-indigo-400">
                {carte.carte}
              </strong>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{carte.theme}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Annuler attribution */}
      <AnimatePresence>
        {isValidated && (
          <motion.button
            onClick={onAnnuler}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.22 }}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded shadow-md focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            ❌ Annuler l’attribution
          </motion.button>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-center gap-8 mt-6 text-2xl select-none">
        <motion.button whileTap={{ scale: 0.85 }} onClick={onPrev} className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition">⬅️</motion.button>
        <motion.button whileTap={{ scale: 0.85 }} onClick={onNext} className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition">➡️</motion.button>
      </div>

      {/* Boutons d'attribution — n'apparaissent que si la carte est visible */}
      {equipes.length > 0 && isFlipped && (
        <div className="mt-6 text-center">
          <p className="font-semibold mb-2 text-gray-700 dark:text-gray-300">Attribuer à une équipe :</p>
          <div className="flex flex-wrap justify-center gap-3">
            {equipes.map((eq, i) => {
              const color = equipeColors[i % equipeColors.length] || {};
              // style inline pour fallback hex → garantie d'affichage
              const inlineStyle = color.hex ? { backgroundColor: color.hex } : {};
              return (
                <motion.button
                  key={i}
                  onClick={() => onAttribuer(i)}
                  whileTap={{ scale: 0.92 }}
                  style={inlineStyle}
                  // className garde la classe tailwind pour hover si elle existe
                  className={`py-2 px-4 rounded font-medium shadow-sm text-white transition ${color.tw || ""}`}
                >
                  {eq}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Indicateur carte courante */}
      {isFlipped && (
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400 select-none">
          Carte {index + 1} sur {total}
        </div>
      )}
    </motion.div>
  );
}
