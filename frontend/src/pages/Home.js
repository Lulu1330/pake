import React, { useState, useEffect } from "react";
import CardDisplay from "../components/CardDisplay";
import ThemeSelector from "../components/ThemeSelector";
import { allThemes } from "../components/Constants";

const themeColors = {
  Animaux: "#FFD700",
  Objets: "#87CEEB",
  Personnalités: "#FF69B4",
  Monuments: "#90EE90",
};

export default function Home() {
  const [cartes, setCartes] = useState([]);
  const [current, setCurrent] = useState(0);
  const [points, setPoints] = useState({});
  const [nbCartes, setNbCartes] = useState(5);
  const [selectedThemes, setSelectedThemes] = useState(["Animaux", "Objets"]);
  const [erreur, setErreur] = useState("");

  const [nbEquipes, setNbEquipes] = useState(2);
  const [equipes, setEquipes] = useState(["Équipe 1", "Équipe 2"]);
  const [scoreEquipes, setScoreEquipes] = useState({});

  const [chrono, setChrono] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);

  const allSelected = selectedThemes.length === allThemes.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedThemes([]);
    } else {
      setSelectedThemes([...allThemes]);
    }
  };

  useEffect(() => {
    setEquipes((prev) =>
      Array.from({ length: nbEquipes }, (_, i) => prev[i] || `Équipe ${i + 1}`)
    );
  }, [nbEquipes]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      const audio = new Audio("/alarm.mp3");
      audio.play().catch((err) => console.log("Erreur audio:", err));
    }
  }, [isRunning, timeLeft]);

  const fetchCartes = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/tirage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themes: selectedThemes, nb_cartes: nbCartes }),
      });
      if (!res.ok) throw new Error("Erreur API");
      const data = await res.json();
      setCartes(data);
      setCurrent(0);
      setPoints({});
      setScoreEquipes({});
      setErreur("");
    } catch (err) {
      setErreur("Erreur lors du tirage. Vérifie le backend.");
    }
  };

  const reshuffleCards = () => {
    const shuffled = [...cartes].sort(() => Math.random() - 0.5);
    setCartes(shuffled);
    setCurrent(0);
    setPoints({});
    setScoreEquipes({});
  };

  const resetGame = () => {
    setCartes([]);
    setCurrent(0);
    setPoints({});
    setScoreEquipes({});
    setSelectedThemes([]);
    setErreur("");
    setIsRunning(false);
    setTimeLeft(chrono);
  };

  const handleAttribution = (equipeIndex) => {
    const currentCard = cartes[current];
    if (!currentCard) return;

    const newScore = { ...scoreEquipes };
    newScore[equipeIndex] = (newScore[equipeIndex] || 0) + 1;
    setScoreEquipes(newScore);

    setPoints((prev) => ({ ...prev, [current]: true }));
  };

  const totalPoints = Object.values(points).filter(Boolean).length;

  return (
    <div className="max-w-4xl mx-auto p-6 text-center font-sans">
      <h1 className="text-4xl font-extrabold mb-6 text-indigo-600">🎴 Jeu de Cartes</h1>

      <ThemeSelector
        allThemes={allThemes}
        selectedThemes={selectedThemes}
        setSelectedThemes={setSelectedThemes}
        toggleSelectAll={toggleSelectAll}
        allSelected={allSelected}
      />

      <div className="my-4">
        <label className="block font-semibold mb-2">Nombre de cartes :</label>
        <input
          type="number"
          value={nbCartes}
          onChange={(e) => setNbCartes(parseInt(e.target.value))}
          className="border rounded px-3 py-1 w-20 text-center"
        />
      </div>

      <div className="my-4">
        <label className="block font-semibold mb-2">Nombre d'équipes :</label>
        <input
          type="number"
          min={1}
          value={nbEquipes}
          onChange={(e) => setNbEquipes(parseInt(e.target.value))}
          className="border rounded px-3 py-1 w-20 text-center"
        />
        <div className="mt-2 grid grid-cols-2 gap-2">
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
      </div>

      <div className="my-4">
        <label className="font-semibold">⏱️ Chrono (en secondes) :</label>
        <input
          type="number"
          value={chrono}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            setChrono(val);
            setTimeLeft(val);
          }}
          className="border rounded px-2 py-1 mx-2 w-24 text-center"
        />
        <div className="mt-2 flex justify-center gap-4">
          <button
            onClick={() => setIsRunning(true)}
            className="bg-green-500 text-white px-3 py-1 rounded shadow"
          >▶️ Démarrer</button>
          <button
            onClick={() => setIsRunning(false)}
            className="bg-yellow-500 text-white px-3 py-1 rounded shadow"
          >⏸️ Pause</button>
          <button
            onClick={() => {
              setIsRunning(false);
              setTimeLeft(chrono);
            }}
            className="bg-red-500 text-white px-3 py-1 rounded shadow"
          >🔄 Reset</button>
        </div>
        <p
          className={`mt-2 text-xl font-mono transition-all duration-300 ${
            timeLeft === 0 ? "text-red-600 animate-pulse font-extrabold" : ""
          }`}
        >
          {timeLeft === 0 ? "⏰ Temps écoulé !" : `${timeLeft} sec restantes`}
        </p>
      </div>

      <div className="flex flex-wrap gap-4 justify-center my-6">
        <button
          onClick={fetchCartes}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow"
        >🎲 Tirer les cartes</button>

        {cartes.length > 0 && (
          <>
            <button
              onClick={reshuffleCards}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded shadow"
            >🔁 Relancer</button>
            <button
              onClick={resetGame}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded shadow"
            >♻️ Réinitialiser</button>
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
          <CardDisplay
            carte={cartes[current]}
            themeColor={themeColors[cartes[current].theme]}
            index={current}
            total={cartes.length}
            isValidated={points[current]}
            onNext={() => setCurrent((prev) => (prev + 1) % cartes.length)}
            onPrev={() => setCurrent((prev) => (prev - 1 + cartes.length) % cartes.length)}
            onValidate={() => {}}
          />

          <div className="mt-4">
            <p className="font-semibold mb-2 text-gray-700">Attribuer cette carte à une équipe :</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {equipes.map((eq, i) => (
                <button
                  key={i}
                  onClick={() => handleAttribution(i)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded shadow"
                >{eq}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {erreur && <p className="text-red-600 mt-4">{erreur}</p>}
    </div>
  );
}
