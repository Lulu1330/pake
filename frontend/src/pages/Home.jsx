import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSettings,
  FiChevronDown,
  FiChevronUp,
  FiPauseCircle,
  FiPlayCircle,
  FiRefreshCcw,
  FiClock,
  FiPlusCircle,
  FiMinusCircle,
} from "react-icons/fi";
import { VscJersey } from "react-icons/vsc";

import CardDisplay from "../components/CardDisplay";
import ReglesModal from "../components/ReglesModal";
import ThemeSelector from "../components/ThemeSelector";
import ParametresPartie from "../components/ParametresPartie.jsx";
import { allThemes, equipeColors } from "../components/Constants";

import "../index.css";

export default function Home({ darkMode, setDarkMode }) {
  /* --------------------------------------------------
   * ÉTATS
   * -------------------------------------------------- */
  const [showRegles, setShowRegles] = useState(true);
  const [cartes, setCartes] = useState([]);
  const [current, setCurrent] = useState(null);
  const [points, setPoints] = useState({});
  const [erreur, setErreur] = useState("");
  const [flipped, setFlipped] = useState(false);

  const [savedTirages, setSavedTirages] = useState([]);
  const [cartesParEquipe, setCartesParEquipe] = useState({});

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

  const [showConfig, setShowConfig] = useState(true);
  const [showSaved, setShowSaved] = useState(false);
  const [showCartesAttrib, setShowCartesAttrib] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const [direction, setDirection] = useState(1);

  const allSelected = config.selectedThemes.length === allThemes.length;
  const audioRef = useRef(null);

  /* --------------------------------------------------
   * USE EFFECTS
   * -------------------------------------------------- */
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

  // Jouer son quand le chrono atteint 0
  useEffect(() => {
    if (timeLeft === 0 && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) =>
        console.log("Erreur audio:", err)
      );
    }
  }, [timeLeft]);

  // Mode sombre
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  // Gestion dynamique du nombre d’équipes
  useEffect(() => {
    setEquipes((prev) => {
      const nouvellesEquipes = [...prev];
      while (nouvellesEquipes.length < config.nbEquipes) {
        nouvellesEquipes.push(`Équipe ${nouvellesEquipes.length + 1}`);
      }
      return nouvellesEquipes.slice(0, config.nbEquipes);
    });
  }, [config.nbEquipes]);

  /* --------------------------------------------------
   * FONCTIONS UTILITAIRES
   * -------------------------------------------------- */
  const supprimerTirage = (index) => {
    setSavedTirages((prev) => prev.filter((_, i) => i !== index));
  };

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
      setSavedTirages((prev) => [...prev, data]);
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
    setCartesParEquipe([]);
    setSavedTirages([]);
  };

  const reshuffleCartes = (tirage = null) => {
    if (tirage) {
      setCartes([...tirage].sort(() => Math.random() - 0.5));
    } else {
      setCartes((prev) => [...prev].sort(() => Math.random() - 0.5));
    }
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

    setCartesParEquipe((prev) => {
      const copy = { ...prev };
      if (!copy[equipeIndex]) copy[equipeIndex] = [];
      copy[equipeIndex] = [...copy[equipeIndex], cartes[current]];
      return copy;
    });

    if (current + 1 < cartes.length) setCurrent(current + 1);
  };

  const ajouterPoint = (equipeIndex) => {
    setScoreEquipes((prev) => ({
      ...prev,
      [equipeIndex]: (prev[equipeIndex] || 0) + 1,
    }));
  };

  const retirerPoint = (equipeIndex) => {
    setScoreEquipes((prev) => ({
      ...prev,
      [equipeIndex]: Math.max(0, (prev[equipeIndex] || 0) - 1),
    }));
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

    setCartesParEquipe((prev) => {
      const copy = { ...prev };
      if (copy[equipeIndex]) {
        copy[equipeIndex] = copy[equipeIndex].filter(
          (c) => c !== cartes[current]
        );
      }
      return copy;
    });
  };


  /* --------------------------------------------------
   * RENDU JSX
   * -------------------------------------------------- */

return (
  <div className="w-full min-h-screen overflow-x-hidden bg-gray-100 dark:bg-gray-800 text-[#222] dark:text-gray-100 transition-colors duration-300">
    <div className="w-full h-full flex flex-col p-4 sm:p-6 space-y-6">

      {/* Bouton pour cacher/afficher la configuration */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Configuration</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition"
          >
            {showConfig ? (
              <>
                <FiChevronUp size={20} /> Masquer
              </>
            ) : (
              <>
                <FiChevronDown size={20} /> Afficher
              </>
            )}
          </button>
          <button
            onClick={() => setShowHelp(true)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            title="Aide"
          >
            <FiSettings size={24} />
          </button>
        </div>
      </div>

      {/* CONFIG */}
      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 space-y-8 border border-gray-200 dark:border-gray-700">
              {/* Sélecteur de thèmes */}
              <div>
                <ThemeSelector
                  allThemes={allThemes}
                  selectedThemes={config.selectedThemes}
                  handleCheckboxChange={handleCheckboxChange}
                  toggleSelectAll={toggleSelectAll}
                  allSelected={allSelected}
                />
              </div>

              {/* Paramètres numériques */}
              <div>
                <label className="font-bold text-lg text-gray-800 dark:text-gray-200">
                  ⚙️ Choisissez les paramètres de jeu :
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { label: "Nombre de cartes", field: "nbCartes" },
                    { label: "Nombre d'équipes", field: "nbEquipes" },
                    { label: "Chrono (sec)", field: "chrono" },
                  ].map(({ label, field }) => (
                    <div
                      key={field}
                      className="p-4 rounded-xl border border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-800 shadow-sm"
                    >
                      <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {label}
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={config[field]}
                        onChange={(e) =>
                          handleInputChange(field, parseInt(e.target.value))
                        }
                        className="w-full mt-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Noms des équipes */}
              <div>
                <h2 className="flex items-center gap-2 text-lg !font-bold text-gray-800 dark:text-gray-200 mb-3">
                  <VscJersey size={24} /> Équipes
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {equipes.map((nom, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-pink-300 dark:border-pink-600 bg-pink-50 dark:bg-pink-800 shadow-sm"
                    >
                      <label className="block text-xs font-bold text-pink-700 dark:text-pink-200 mb-1">
                        Équipe {i + 1}
                      </label>
                      <input
                        value={nom}
                        onChange={(e) => {
                          const copy = [...equipes];
                          copy[i] = e.target.value;
                          setEquipes(copy);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-pink-500 outline-none font-semibold"
                        placeholder={`Nom de l’équipe`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chronomètre toujours visible */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 space-y-6 border border-gray-200 dark:border-gray-700 flex flex-col items-center">
        <h2 className="flex items-center gap-2 text-xl !font-bold !text-gray-800 dark:!text-gray-200 mb-4">
          <FiClock size={26} /> Chronomètre
        </h2>

        {/* Cadran circulaire */}
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90">
            {/* Cercle gris (fond) */}
            <circle
              className="text-gray-300 dark:text-gray-700"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              r="70"
              cx="80"
              cy="80"
            />
            {/* Cercle coloré (progression) */}
            <circle
              className="transition-all duration-1000 ease-linear text-indigo-500"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              r="70"
              cx="80"
              cy="80"
              strokeDasharray={2 * Math.PI * 70}
              strokeDashoffset={2 * Math.PI * 70 * (timeLeft / config.chrono)}
              strokeLinecap="round"
            />
          </svg>

          {/* Temps au centre */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold ${timeLeft === 0 ? "text-red-600 animate-pulse" : ""}`}>
              {timeLeft > 0 ? `${timeLeft}s` : "💥"}
            </span>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex flex-wrap gap-4 justify-center mt-6">
          <button
            onClick={() => setIsRunning(true)}
          >
          <h2 className="flex items-center gap-2 text-lg !font-bold text-green-600 dark:text-green-400 mb-3">
                  <FiPlayCircle size={30} />
          </h2>
          </button>
          <button
            onClick={() => setIsRunning(false)}
          >
          <h2 className="flex items-center gap-2 text-lg !font-bold text-yellow-600 dark:text-yellow-400 mb-3">
                  <FiPauseCircle size={30} />
          </h2>
          </button>
          <button
            onClick={() => {
              setIsRunning(false);
              setTimeLeft(config.chrono);
            }}
          >
          <h2 className="flex items-center gap-2 text-lg !font-bold text-red-600 dark:text-red-400 mb-3">
                  <FiRefreshCcw size={30} />
          </h2>
          </button>
        </div>

        <audio ref={audioRef} src="/assets/explosion.wav" preload="auto" />
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

      {/* TIRAGE SAUVE */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded p-4 shadow">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-[#222] dark:text-gray-100">
            📦 Tirages réalisés
          </h3>
          <button
            onClick={() => setShowSaved(!showSaved)}
            className="p-1 rounded hover:bg-yellow-200 dark:hover:bg-yellow-800"
          >
            {showSaved ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>

        {showSaved && (
          <>
            {savedTirages.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Aucun tirage.
              </p>
            ) : (
              savedTirages.map((tirage, i) => (
                <div
                  key={i}
                  className="mb-2 p-2 rounded bg-white dark:bg-gray-700 shadow flex justify-between items-center"
                >
                  <p className="font-semibold">
                    Tirage {i + 1} ({tirage.length} cartes)
                  </p>
                  <button
                    onClick={() => reshuffleCartes(tirage)}
                    className="px-2 py-1 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Relancer
                  </button>
                  <button
                    onClick={() => supprimerTirage(i)}
                    className="px-2 py-1 text-sm rounded bg-red-500 text-white hover:bg-red-600"
                  >
                    Supprimer
                  </button>
                </div>
              ))
            )}
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
        <h3 className="text-lg font-semibold mb-2 text-purple-700 dark:text-purple-200">
          🏆 Scores
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {equipes.map((eq, i) => (
            <div
              key={i}
              className={`p-3 rounded font-semibold flex items-center justify-between ${equipeColors[i % equipeColors.length]}`}
            >
              {/* Bouton - */}
              <button
                onClick={() => retirerPoint(i)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                title="Retirer un point"
              >
                <FiMinusCircle size={28} />
              </button>

              {/* Nom + Score */}
              <p className="text-center flex-1">
                {eq} : {scoreEquipes[i] || 0}{" "}
                point{(scoreEquipes[i] || 0) > 1 ? "s" : ""}
              </p>

              {/* Bouton + */}
              <button
                onClick={() => ajouterPoint(i)}
                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                title="Ajouter un point"
              >
                <FiPlusCircle size={28} />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* CARTES PAR EQUIPES */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded p-4 shadow mt-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-[#222] dark:text-gray-100">
            🃏 Cartes attribuées
          </h3>
          <button
            onClick={() => setShowCartesAttrib(!showCartesAttrib)}
            className="p-1 rounded hover:bg-green-200 dark:hover:bg-green-800"
          >
            {showCartesAttrib ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>

        {showCartesAttrib && (
          <>
            {equipes.map((eq, i) => (
              <div key={i} className="mb-3">
                <p className="font-bold">{eq} :</p>
                {(!cartesParEquipe[i] || cartesParEquipe[i].length === 0) ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Aucune carte</p>
                ) : (
                  <ul className="list-disc list-inside text-sm">
                    {cartesParEquipe[i].map((c, idx) => (
                      <li key={idx}>
                        <span className="font-semibold">{c.carte}</span>
                        <span className="ml-2 text-gray-500"></span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </>
        )}
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
                equipeColors={equipeColors}
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
            animate={{ scale: 1, opacity: 1}}
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
              <li>📦 <b>Tirages réalisés</b> : Afficher = garde les tirages réalisés pour pouvoir les relancer.</li>
              <li>🃏 <b>Cartes attribuées</b> : Afficher = les cartes attribuées à chaque équipe.</li>
            </ul>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setShowHelp(false)} className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">
                Fermer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    <ReglesModal showRegles={showRegles} setShowRegles={setShowRegles} />
  </div>
)
};
