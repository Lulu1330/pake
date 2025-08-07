import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ThemeSelector({
  allThemes,
  selectedThemes,
  handleCheckboxChange,
  toggleSelectAll,
  allSelected,
}) {
  const [showThemes, setShowThemes] = useState(false);

  const toggleDisplay = () => setShowThemes((prev) => !prev);

  return (
    <div className="mt-6">
      <label className="font-bold text-lg text-gray-800 dark:text-gray-200">
        🎨 Choisissez les thèmes :
      </label>

      {/* Toggle button */}
      <button
        onClick={toggleDisplay}
        className="flex items-center gap-2 mt-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition"
      >
        {showThemes ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        <span>
          {showThemes
            ? "Fermer les thèmes"
            : `${selectedThemes.length} thème${selectedThemes.length > 1 ? "s" : ""} sélectionné${selectedThemes.length > 1 ? "s" : ""}`}
        </span>
      </button>

      {/* Animated theme list */}
      <AnimatePresence initial={false}>
        {showThemes && (
          <motion.div
            className="mt-4"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Select all */}
            <div className="mb-3">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="accent-indigo-600"
                />
                <span><strong>Tout sélectionner</strong></span>
              </label>
            </div>

            {/* List of themes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {allThemes.map((theme) => {
                const isChecked = selectedThemes.includes(theme);
                return (
                  <motion.label
                    key={theme}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center gap-2 px-3 py-2 rounded border cursor-pointer transition ${
                      isChecked
                        ? "bg-indigo-100 dark:bg-indigo-800 border-indigo-300 dark:border-indigo-600"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCheckboxChange(theme)}
                      className="accent-indigo-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {theme}
                    </span>
                  </motion.label>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
