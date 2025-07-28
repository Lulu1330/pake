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

  const handleCheckboxChange = (theme) => {
    setConfig((prev) => {
      const selected = prev.selectedThemes;
      const isSelected = selected.includes(theme);

      return {
        ...prev,
        selectedThemes: isSelected
          ? selected.filter((t) => t !== theme) // ✅ retire le thème
          : [...selected, theme],              // ✅ ajoute le thème
      };
    });
  };

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
    setShowFirstCard(false);
  };

  const resetGame = () => {
    setCartes([]);
    setCurrent(0);
    setPoints({});
    setErreur("");
    setIsRunning(false);
    setTimeLeft(config.chrono);
    setConfig((prev) => ({ ...prev, selectedThemes: [] }));
    setShowFirstCard(false);
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

  const totalPoints = Object.values(points).filter((v) => v !== undefined).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-6 text-indigo-600 text-center">🎴 Jeu de Cartes</h1>

        <ThemeSelector
          allThemes={allThemes}
          selectedThemes={config.selectedThemes}
          setSelectedThemes={(themes) => handleConfigChange("selectedThemes", themes)}
          toggleSelectAll={toggleSelectAll}
          handleCheckboxChange={handleCheckboxChange}
          allSelected={allSelected}
        />

        <div className="my-6 grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="font-medium">Nombre de cartes</span>
            <input
              type="number"
              value={config.nbCartes}
              onChange={(e) => handleConfigChange("nbCartes", parseInt(e.target.value))}
              className="mt-1 border rounded px-3 py-1 w-full"
            />
          </label>

          <label className="block">
            <span className="font-medium">Nombre d'équipes</span>
            <input
              type="number"
              min={1}
              value={config.nbEquipes}
              onChange={(e) => handleConfigChange("nbEquipes", parseInt(e.target.value))}
              className="mt-1 border rounded px-3 py-1 w-full"
            />
          </label>

          <label className="block">
            <span className="font-medium">⏱️ Chrono (sec)</span>
            <input
              type="number"
              value={config.chrono}
              onChange={(e) => handleConfigChange("chrono", parseInt(e.target.value))}
              className="mt-1 border rounded px-3 py-1 w-full"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 my-4">
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

        <div className="flex flex-wrap gap-4 justify-center mt-4">
          <button onClick={() => setIsRunning(true)} className="btn bg-green-500">▶️ Démarrer</button>
          <button onClick={() => setIsRunning(false)} className="btn bg-yellow-500">⏸️ Pause</button>
          <button onClick={() => { setIsRunning(false); setTimeLeft(config.chrono); }} className="btn bg-red-500">🔄 Reset</button>
        </div>

        <p className={`mt-4 text-center text-2xl ${timeLeft === 0 ? "text-red-600 animate-pulse font-extrabold" : "text-gray-700"}`}>
          {timeLeft === 0 ? "⏰ Temps écoulé !" : `${timeLeft} sec restantes`}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <button onClick={fetchCartes} className="btn bg-blue-600">🎲 Tirer les cartes</button>
          {cartes.length > 0 && (
            <>
              <button onClick={reshuffleCards} className="btn bg-green-600">🔁 Relancer</button>
              <button onClick={resetGame} className="btn bg-gray-600">♻️ Réinitialiser</button>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <h2 className="text-xl font-bold text-purple-700">🏆 Scores par équipe</h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
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
                className="btn bg-indigo-600 text-xl"
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

        {erreur && <p className="text-red-600 mt-4 text-center">{erreur}</p>}
      </div>
    </div>
  );
}
