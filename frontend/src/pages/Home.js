import React, { useState, useEffect } from "react";
import CardDisplay from "../components/CardDisplay";
import ThemeSelector from "../components/ThemeSelector";
import { allThemes } from "../components/Constants";

export default function Home() {
  const [showFirstCard, setShowFirstCard] = useState(false);
  const [cartes, setCartes] = useState([]);
  const [current, setCurrent] = useState(0);
  const [points, setPoints] = useState({});
  const [erreur, setErreur] = useState("");

  const [config, setConfig] = useState({
    nbCartes: 5,
    nbEquipes: 2,
    selectedThemes: ["Animaux", "Objets"],
    chrono: 60,
  });

  const [equipes, setEquipes] = useState(["Équipe 1", "Équipe 2"]);
  const [scoreEquipes, setScoreEquipes] = useState({});
  const [timeLeft, setTimeLeft] = useState(config.chrono);
  const [isRunning, setIsRunning] = useState(false);

  const allSelected = config.selectedThemes.length === allThemes.length;

  useEffect(() => {
    setEquipes((prev) =>
      Array.from({ length: config.nbEquipes }, (_, i) => prev[i] || `Équipe ${i + 1}`)
    );
  }, [config.nbEquipes]);

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

  const handleConfigChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    if (field === "chrono") setTimeLeft(value);
  };

  const toggleSelectAll = () => {
    setConfig((prev) => ({
      ...prev,
      selectedThemes: allSelected ? [] : [...allThemes],
    }));
  };

  const fetchCartes = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/tirage", {
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
      setScoreEquipes({});
      setErreur("");
      setShowFirstCard(false);
    } catch {
      setErreur("Erreur lors du tirage. Vérifie le backend.");
    }
  };

  const reshuffleCards = () => {
    const shuffled = [...cartes].sort(() => Math.random() - 0.5);
    setCartes(shuffled);
    setCurrent(0);
    setPoints({});
    setShowFirstCard(false);
  };

  const resetGame = () => {
    setCartes([]);
    setCurrent(0);
    setPoints({});
    setScoreEquipes({});
    setErreur("");
    setIsRunning(false);
    setTimeLeft(config.chrono);
    setConfig((prev) => ({ ...prev, selectedThemes: [] }));
  };

  const handleAttribution = (equipeIndex) => {
    if (!cartes[current]) return;
    setScoreEquipes((prev) => ({
      ...prev,
      [equipeIndex]: (prev[equipeIndex] || 0) + 1,
    }));
    setPoints((prev) => ({ ...prev, [current]: equipeIndex }));
  };

  const handleAnnulation = () => {
    const equipeIndex = points[current];
    if (equipeIndex === undefined) return;

    setScoreEquipes((prev) => ({
      ...prev,
      [equipeIndex]: Math.max((prev[equipeIndex] || 0) - 1, 0),
    }));

    setPoints((prev) => {
      const copy = { ...prev };
      delete copy[current];
      return copy;
    });
  };

  const totalPoints = Object.values(points).filter(Boolean).length;

  return (
    <div className="max-w-4xl mx-auto p-6 text-center font-sans">
      <h1 className="text-4xl font-extrabold mb-6 text-indigo-600">🎴 Jeu de Cartes</h1>

      <ThemeSelector
        allThemes={allThemes}
        selectedThemes={config.selectedThemes}
        setSelectedThemes={(themes) => handleConfigChange("selectedThemes", themes)}
        toggleSelectAll={toggleSelectAll}
        allSelected={allSelected}
      />

      <div className="my-4 space-y-4">
        <label>
          Nombre de cartes :
          <input
            type="number"
            value={config.nbCartes}
            onChange={(e) => handleConfigChange("nbCartes", parseInt(e.target.value))}
            className="border rounded px-3 py-1 ml-2 w-20 text-center"
          />
        </label>

        <label>
          Nombre d'équipes :
          <input
            type="number"
            min={1}
            value={config.nbEquipes}
            onChange={(e) => handleConfigChange("nbEquipes", parseInt(e.target.value))}
            className="border rounded px-3 py-1 ml-2 w-20 text-center"
          />
        </label>

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
              className="border rounded px-2 py-1"
              placeholder={`Équipe ${i + 1}`}
            />
          ))}
        </div>

        <label>
          ⏱️ Chrono (sec) :
          <input
            type="number"
            value={config.chrono}
            onChange={(e) => handleConfigChange("chrono", parseInt(e.target.value))}
            className="border rounded px-2 py-1 ml-2 w-24 text-center"
          />
        </label>

        <div className="flex gap-4 justify-center mt-2">
          <button onClick={() => setIsRunning(true)} className="bg-green-500 text-white px-3 py-1 rounded shadow">▶️ Démarrer</button>
          <button onClick={() => setIsRunning(false)} className="bg-yellow-500 text-white px-3 py-1 rounded shadow">⏸️ Pause</button>
          <button onClick={() => { setIsRunning(false); setTimeLeft(config.chrono); }} className="bg-red-500 text-white px-3 py-1 rounded shadow">🔄 Reset</button>
        </div>

        <p className={`mt-2 text-xl font-mono ${timeLeft === 0 ? "text-red-600 animate-pulse font-extrabold" : ""}`}>
          {timeLeft === 0 ? "⏰ Temps écoulé !" : `${timeLeft} sec restantes`}
        </p>
      </div>

      <div className="my-6 flex gap-4 justify-center flex-wrap">
        <button onClick={fetchCartes} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow">🎲 Tirer les cartes</button>
        {cartes.length > 0 && (
          <>
            <button onClick={reshuffleCards} className="bg-green-600 text-white px-4 py-2 rounded shadow">🔁 Relancer</button>
            <button onClick={resetGame} className="bg-gray-600 text-white px-4 py-2 rounded shadow">♻️ Réinitialiser</button>
          </>
        )}
      </div>

      <h2 className="text-xl font-semibold mb-2 text-gray-700">
        Score total : {totalPoints} point{totalPoints !== 1 ? "s" : ""}
      </h2>

      <div className="my-4">
        <h3 className="font-semibold text-lg mb-2 text-purple-600">🏆 Scores par équipe :</h3>
        <ul className="grid grid-cols-2 gap-2">
          {equipes.map((eq, i) => (
            <li key={i} className="bg-purple-100 rounded px-3 py-2">
              {eq} : {scoreEquipes[i] || 0} point{(scoreEquipes[i] || 0) > 1 ? "s" : ""}
            </li>
          ))}
        </ul>
      </div>
      {cartes.length > 0 && (
        <div className="mt-8">
          {!showFirstCard ? (
            <button
              onClick={() => setShowFirstCard(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded shadow text-lg"
            >
              ▶️ Commencer
            </button>
          ) : (
            <CardDisplay
              carte={cartes[current]}
              index={current}
              total={cartes.length}
              isValidated={points[current] !== undefined}
              onNext={() => setCurrent((prev) => (prev + 1) % cartes.length)}
              onPrev={() => setCurrent((prev) => (prev - 1 + cartes.length) % cartes.length)}
              equipes={equipes}
              onAttribuer={(index) => {
                handleAttribution(index);
                setCurrent((prev) => (prev + 1) % cartes.length);
              }}
              onAnnuler={handleAnnulation}
            />
          )}
        </div>
      )}
      {erreur && <p className="text-red-600 mt-4">{erreur}</p>}
    </div>
  );
}
