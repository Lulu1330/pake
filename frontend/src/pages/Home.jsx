import React, { useState, useEffect } from "react";
import CardDisplay from "../components/CardDisplay";
import ThemeSelector from "../components/ThemeSelector";
import { allThemes, equipeColors } from "../components/Constants";
import "../index.css";

export default function Home({ darkMode, setDarkMode }) {
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

  const allSelected = config.selectedThemes.length === allThemes.length;
  const totalPoints = Object.keys(points).length;
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
      document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    useEffect(() => {
    setEquipes((prev) => {
      const nouvellesEquipes = [...prev];

      // Ajouter des équipes si besoin
      while (nouvellesEquipes.length < config.nbEquipes) {
        nouvellesEquipes.push(`Équipe ${nouvellesEquipes.length + 1}`);
      }

      // Supprimer les équipes en trop
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
    <div className="w-full h-full flex flex-col p-4 sm:p-6 overflow-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">🎴 Jeu de Cartes</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-1 bg-slate-200 dark:bg-gray-700 text-[#222] dark:text-white rounded shadow hover:scale-105 transition"
          >
            {darkMode ? "☀️ Mode clair" : "🌙 Mode sombre"}
          </button>
        </div>

        {/* CONFIGURATION */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Configuration</h2>

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

          <p className={`mt-2 text-xl font-mono text-center ${timeLeft === 0 ? "text-red-600 dark:text-red-400 animate-pulse font-extrabold" : ""}`}>
            {timeLeft === 0 ? "⏰ Temps écoulé !" : `${timeLeft} sec restantes`}
          </p>
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
        {isLoading && (
          <p className="text-center text-blue-600 dark:text-blue-300 font-semibold my-4 animate-pulse">
            ⏳ Chargement des cartes en cours...
          </p>
        )}
        {/* SCORES */}
        <div className="bg-purple-100 dark:bg-purple-900 rounded p-4 shadow">
          <h3 className="text-lg font-semibold mb-2 text-purple-700 dark:text-purple-200">🏆 Scores par équipe</h3>
          <div className="grid grid-cols-2 gap-4">
            {equipes.map((eq, i) => (
              <div
                key={i}
                className={`p-3 rounded text-center font-semibold ${equipeColors[i % equipeColors.length]}`}
              >
                {eq} : {scoreEquipes[i] || 0} point{(scoreEquipes[i] || 0) > 1 ? "s" : ""}
              </div>
            ))}
          </div>
        </div>

        {/* CARTES */}
        {cartes.length > 0 && (
          <div className="mt-8">
            {current === null ? (
              <div className="card-flip-container" onClick={() => {
                setFlipped(true);
                setTimeout(() => {
                  setCurrent(0);
                  setFlipped(false);
                }, 700);
              }}>
                <div className={`card-flip-inner ${flipped ? "flipped" : ""}`}>
                  <div className="card-front">Clique pour retourner</div>
                </div>
              </div>
            ) : (
              <CardDisplay
                carte={cartes[current]}
                index={current}
                total={cartes.length}
                isValidated={points[current] != null}
                onNext={() => setCurrent((prev) => (prev + 1 < cartes.length ? prev + 1 : 0))}
                onPrev={() => setCurrent((prev) => (prev - 1 >= 0 ? prev - 1 : cartes.length - 1))}
                equipes={equipes}
                onAttribuer={handleAttribution}
                onAnnuler={annulerAttribution}
              />
            )}
          </div>
        )}

        {erreur && <p className="text-red-600 dark:text-red-400 mt-4 text-center">{erreur}</p>}
      </div>
    </div>
  );
}
