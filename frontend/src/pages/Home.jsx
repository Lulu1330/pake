import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSettings } from "react-icons/fi";
import CardDisplay from "../components/CardDisplay";
import ThemeSelector from "../components/ThemeSelector";
import { allThemes, equipeColors } from "../components/Constants";
import ParametresPartie from "../components/ParametresPartie.jsx";
import "../index.css";

export default function Home({ darkMode, setDarkMode }) {
  const [cartes, setCartes] = useState([]);
  const [current, setCurrent] = useState(null);
  const [points, setPoints] = useState({});
  const [erreur, setErreur] = useState("");
  const [flipped, setFlipped] = useState(false);

  const [config, setConfig] = useState({
    nbCartes: 20,
    nbEquipes: 2,
    selectedThemes: allThemes,
    chrono: 90,
  });

  const [equipes, setEquipes] = useState(["Équipe 1", "Équipe 2"]);
  const [scoreEquipes, setScoreEquipes] = useState({});
  const [timeLeft, setTimeLeft] = useState(config.chrono);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const allSelected = config.selectedThemes.length === allThemes.length;

  const [direction, setDirection] = useState(1);
  const [showHelp, setShowHelp] = useState(false);

  // Timer
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (timeLeft === 0) {
      setIsRunning(false);
      new Audio("/alarm.mp3").play().catch(console.log);
    }
  }, [isRunning, timeLeft]);

  // Dark mode
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Equipes dynamiques
  useEffect(() => {
    setEquipes((prev) => {
      const nouvellesEquipes = [...prev];
      while (nouvellesEquipes.length < config.nbEquipes) {
        nouvellesEquipes.push(`Équipe ${nouvellesEquipes.length + 1}`);
      }
      return nouvellesEquipes.slice(0, config.nbEquipes);
    });
  }, [config.nbEquipes]);

  const handleInputChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    if (field === "chrono") setTimeLeft(value);
  };

  const toggleSelectAll = () => {
    setConfig((prev) => ({
      ...prev,
      selectedThemes: allSelected ? [] : [...allThemes],
    }));
  };

  const handleCheckboxChange = (theme) => {
    setConfig((prev) => {
      const { selectedThemes } = prev;
      const newThemes = selectedThemes.includes(theme)
        ? selectedThemes.filter((t) => t !== theme)
        : [...selectedThemes, theme];
      return { ...prev, selectedThemes: newThemes };
    });
  };

  const fetchCartes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("https://pake-ke5g.onrender.com/tirage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themes: config.selectedThemes,
          nb_cartes: config.nbCartes,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCartes(data);
      setCurrent(0);
      setPoints({});
      setErreur("");
    } catch {
      setErreur("Erreur lors du tirage. Vérifie le backend.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetGame = () => {
    setCartes([]);
    setCurrent(null);
    setPoints({});
    setErreur("");
    setIsRunning(false);
    setTimeLeft(config.chrono);
    setScoreEquipes({});
  };

  const reshuffleCartes = () => {
    setCartes((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrent(0);
    setPoints({});
  };

  const handleAttribution = (equipeIndex) => {
    if (!cartes[current] || points[current] != null) return;
    setScoreEquipes((prev) => ({
      ...prev,
      [equipeIndex]: (prev[equipeIndex] || 0) + 1,
    }));
    setPoints((prev) => ({ ...prev, [current]: equipeIndex }));
    if (current + 1 < cartes.length) setCurrent(current + 1);
  };

  const annulerAttribution = () => {
    if (current == null || points[current] == null) return;
    const equipeIndex = points[current];
    setScoreEquipes((prev) => ({
      ...prev,
      [equipeIndex]: Math.max(0, (prev[equipeIndex] || 0) - 1),
    }));
    setPoints((prev) => {
      const copy = { ...prev };
      delete copy[current];
      return copy;
    });
  };

  return (
    <div className="w-full h-screen overflow-x-hidden bg-gray-100 dark:bg-gray-800 text-[#222] dark:text-gray-100 transition-colors duration-300">
      <div className="w-full h-full flex flex-col p-4 sm:p-6 overflow-auto space-y-6">

        {/* Config + Bouton Rouage */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Configuration</h2>
            <button
              onClick={() => setShowHelp(true)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              title="Aide"
            >
              <FiSettings size={24} />
            </button>
          </div>

        {/* CONFIG */}
        <div className="bg-gray-300 dark:bg-gray-700 rounded-lg shadow-md p-6 space-y-4">

          <ThemeSelector
            allThemes={allThemes}
            selectedThemes={config.selectedThemes}
            handleCheckboxChange={handleCheckboxChange}
            toggleSelectAll={toggleSelectAll}
            allSelected={allSelected}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Nombre de cartes", field: "nbCartes" },
              { label: "Nombre d'équipes", field: "nbEquipes" },
              { label: "⏱️ Chrono (sec)", field: "chrono" },
            ].map(({ label, field }) => (
              <label key={field} className="block">
                <span className="block text-sm">{label}</span>
                <input
                  type="number"
                  min={1}
                  value={config[field]}
                  onChange={(e) => handleInputChange(field, parseInt(e.target.value))}
                  className="w-full mt-1 px-3 py-1 rounded border dark:border-gray-600 bg-white dark:bg-gray-700"
                />
              </label>
            ))}
          </div>

          {/* ÉQUIPES */}
          <div className="grid grid-cols-2 gap-2">
            {equipes.map((nom, i) => (
              <input
                key={i}
                value={nom}
                onChange={(e) => {
                  const copy = [...equipes];
                  copy[i] = e.target.value;
                  setEquipes(copy);
                }}
                className="px-3 py-1 rounded border bg-white dark:bg-gray-700"
              />
            ))}
          </div>

          {/* CONTRÔLES */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={() => setIsRunning(true)} className="btn-chrono-green">▶️ Démarrer</button>
            <button onClick={() => setIsRunning(false)} className="btn-chrono-yellow">⏸️ Pause</button>
            <button onClick={() => { setIsRunning(false); setTimeLeft(config.chrono); }} className="btn-chrono-rose">🔄 Reset</button>
          </div>

          <p className={`mt-2 text-xl font-mono text-center transition duration-300 ${timeLeft === 0 ? "text-red-600 dark:text-red-400 animate-pulse font-extrabold" : ""}`}>
            {timeLeft === 0 ? "⏰ Temps écoulé !" : `${timeLeft} sec restantes`}
          </p>
        </div>

        {/* Séparateur */}
        <div className="relative my-6">
          <hr className="border-t border-gray-400 dark:border-gray-600" />
        </div>

        {/* ACTIONS */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button onClick={fetchCartes} className="btn-tirage-blue">🎲 Tirer les cartes</button>
          {cartes.length > 0 && (
            <>
              <button onClick={reshuffleCartes} className="btn-tirage-lime">🔁 Relancer</button>
              <button onClick={resetGame} className="btn-tirage-gray">♻️ Réinitialiser</button>
            </>
          )}
        </div>

        {/* LOADING */}
        {isLoading && (
          <p className="text-center text-blue-600 dark:text-blue-300 font-semibold my-4 animate-pulse">
            ⏳ Chargement des cartes...(1er Tirage un peu long, environ 20s)
          </p>
        )}

        {/* SCORES */}
        <div className="bg-purple-100 dark:bg-purple-900 rounded p-4 shadow">
          <h3 className="text-lg font-semibold mb-2 text-purple-700 dark:text-purple-200">🏆 Scores</h3>
          <div className="grid grid-cols-2 gap-4">
            {equipes.map((eq, i) => (
              <div key={i} className={`p-3 rounded text-center font-semibold ${equipeColors[i % equipeColors.length]}`}>
                {eq} : {scoreEquipes[i] || 0} point{(scoreEquipes[i] || 0) > 1 ? "s" : ""}
              </div>
            ))}
          </div>
        </div>

        {/* CARTES */}
        <div className="mt-6">
          <AnimatePresence>

            {current !== null && (
              <motion.div
                key={current}
                initial={{ x: direction * 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction * -100, opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <CardDisplay
                  carte={cartes[current]}
                  index={current}
                  total={cartes.length}
                  isValidated={points[current] != null}
                  onNext={() => {
                    setDirection(1);
                    setCurrent((prev) => (prev + 1 < cartes.length ? prev + 1 : 0));
                  }}
                  onPrev={() => {
                    setDirection(-1);
                    setCurrent((prev) => (prev - 1 >= 0 ? prev - 1 : cartes.length - 1));
                  }}
                  equipes={equipes}
                  onAttribuer={handleAttribution}
                  onAnnuler={annulerAttribution}
                  equipeColors={equipeColors} // pour colorer les boutons
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {erreur && <p className="text-red-600 dark:text-red-400 mt-4 text-center">{erreur}</p>}
      </div>

      {/* Modale d'Aide */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold mb-4">📖 Aide & Explications</h2>
              <ul className="space-y-2 text-sm">
                <li>🎲 <b>Tirer les cartes</b> : récupère un nouveau paquet depuis le serveur.</li>
                <li>🔁 <b>Relancer</b> : mélange à nouveau les cartes actuelles.</li>
                <li>♻️ <b>Réinitialiser</b> : remet le jeu à zéro.</li>
                <li>▶️ <b>Démarrer</b> : lance le chrono.</li>
                <li>⏸️ <b>Pause</b> : met le chrono en pause.</li>
                <li>🔄 <b>Reset</b> : remet le chrono au temps initial.</li>
              </ul>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowHelp(false)}
                  className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
