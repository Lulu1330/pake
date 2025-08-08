import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CardDisplay from "../components/CardDisplay";
import ThemeSelector from "../components/ThemeSelector";
import { allThemes, equipeColors } from "../components/Constants";
import ParametresPartie from "../components/ParametresPartie.jsx";
import "../index.css";

export default function Home({ darkMode, setDarkMode }) {
  // États principaux
  const [cartes, setCartes] = useState([]);
  const [current, setCurrent] = useState(null);
  const [points, setPoints] = useState({});
  const [erreur, setErreur] = useState("");
  const [flipped, setFlipped] = useState(false);

  const [config, setConfig] = useState({
    nbCartes: 5,
    nbEquipes: 2,
    selectedThemes: [],
    chrono: 60,
  });

  const [equipes, setEquipes] = useState(["Équipe 1", "Équipe 2"]);
  const [scoreEquipes, setScoreEquipes] = useState({});
  const [timeLeft, setTimeLeft] = useState(config.chrono);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const allSelected = config.selectedThemes.length === allThemes.length;

  const [direction, setDirection] = useState(1);

  // ⏱️ Gestion du timer
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

  // 🎨 Mode sombre
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // 👥 Gestion des équipes dynamiques
  useEffect(() => {
    setEquipes((prev) => {
      const nouvellesEquipes = [...prev];
      while (nouvellesEquipes.length < config.nbEquipes) {
        nouvellesEquipes.push(`Équipe ${nouvellesEquipes.length + 1}`);
      }
      return nouvellesEquipes.slice(0, config.nbEquipes);
    });
  }, [config.nbEquipes]);

  // 🧠 Handlers
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
      setCurrent(null);
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
    setCurrent(null);
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
    <div className="w-full h-screen overflow-x-hidden bg-[#fdfdfd] dark:bg-gray-900 text-[#222] dark:text-gray-100 transition-colors duration-300">
      <div className="w-full h-full flex flex-col p-4 sm:p-6 overflow-auto space-y-6">

        {/* CONFIG */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold">Configuration</h2>

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
            <button onClick={() => setIsRunning(true)} className="btn btn-green">▶️ Démarrer</button>
            <button onClick={() => setIsRunning(false)} className="btn btn-yellow">⏸️ Pause</button>
            <button onClick={() => { setIsRunning(false); setTimeLeft(config.chrono); }} className="btn btn-rose">🔄 Reset</button>
          </div>

          <p className={`mt-2 text-xl font-mono text-center transition duration-300 ${timeLeft === 0 ? "text-red-600 dark:text-red-400 animate-pulse font-extrabold" : ""}`}>
            {timeLeft === 0 ? "⏰ Temps écoulé !" : `${timeLeft} sec restantes`}
          </p>
        </div>
        
        {/* SÉPARATEUR */}
          <div className="relative my-6">
            <hr className="border-t border-gray-400 dark:border-gray-600" />
            <span className="absolute left-1/2 transform -translate-x-1/2 -top-3 bg-[#fdfdfd] dark:bg-gray-900 px-3 text-gray-500 dark:text-gray-400 text-sm font-medium">
            </span>
          </div>

        {/* ACTIONS */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button onClick={fetchCartes} className="btn btn-blue">🎲 Tirer les cartes</button>
          {cartes.length > 0 && (
            <>
              <button onClick={reshuffleCartes} className="btn btn-lime">🔁 Relancer</button>
              <button onClick={resetGame} className="btn btn-gray">♻️ Réinitialiser</button>
            </>
          )}
        </div>

        {/* LOADING */}
        {isLoading && (
          <p className="text-center text-blue-600 dark:text-blue-300 font-semibold my-4 animate-pulse">
            ⏳ Chargement des cartes...
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
            {cartes.length > 0 && current === null && (
              <motion.div
                className="card-flip-container cursor-pointer"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                onClick={() => {
                  setFlipped(true);
                  setTimeout(() => {
                    setCurrent(0);
                    setFlipped(false);
                  }, 700);
                }}
              >
                <div className={`card-flip-inner ${flipped ? "flipped" : ""}`}>
                  <div className="card-front">Clique pour retourner</div>
                </div>
              </motion.div>
            )}

            {current !== null && (
              <motion.div
                key={current}
                initial={{ x: direction*100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction*-100, opacity: 0 }}
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
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {erreur && <p className="text-red-600 dark:text-red-400 mt-4 text-center">{erreur}</p>}
      </div>
    </div>
  );
}
