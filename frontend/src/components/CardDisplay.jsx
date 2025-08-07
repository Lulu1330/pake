import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { equipeColors } from "./Constants";

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

  return (
    <motion.div
      key={carte.carte + index}
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -50, scale: 0.9 }}
      transition={{ duration: 0.4 }}
      className="max-w-md w-full mx-auto p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800 flex flex-col justify-between min-h-[320px] overflow-hidden"
    >
      {/* Carte principale */}
      <div className="text-center">
        <strong className="text-xl md:text-2xl text-indigo-600 dark:text-indigo-400">
          {carte.carte}
        </strong>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{carte.theme}</p>
      </div>

      {/* Bouton annuler attribution */}
      <AnimatePresence>
        {isValidated && (
          <motion.button
            onClick={onAnnuler}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded shadow-md focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            ❌ Annuler l’attribution
          </motion.button>
        )}
      </AnimatePresence>

      {/* Navigation cartes */}
      <div className="flex justify-center gap-8 mt-6 text-2xl select-none">
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={onPrev}
          aria-label="Carte précédente"
          className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition"
        >
          ⬅️
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={onNext}
          aria-label="Carte suivante"
          className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition"
        >
          ➡️
        </motion.button>
      </div>

      {/* Attribution équipes */}
      {equipes.length > 0 && (
        <div className="mt-6 text-center">
          <p className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Attribuer à une équipe :
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {equipes.map((eq, i) => (
              <motion.button
                key={i}
                onClick={() => onAttribuer(i)}
                whileTap={{ scale: 0.9 }}
                className={`py-2 px-4 rounded font-medium shadow-sm text-white transition ${
                  equipeColors[i % equipeColors.length]
                }`}
              >
                {eq}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Indicateur carte courante */}
      <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400 select-none">
        Carte {index + 1} sur {total}
      </div>
    </motion.div>
  );
}
