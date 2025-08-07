import React from "react";

export default function ParametresPartie({
  nombreCartes,
  setNombreCartes,
  nombreEquipes,
  setNombreEquipes,
  chrono,
  setChrono,
  nomsEquipes,
  handleNomEquipeChange,
}) {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        ⚙️ Paramètres de la partie
      </h2>

      {/* Champs principaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Nombre de cartes */}
        <div className="form-group">
          <label className="label">🃏 Nombre de cartes</label>
          <input
            type="number"
            className="input"
            value={nombreCartes}
            onChange={(e) => setNombreCartes(Number(e.target.value))}
            min={1}
            max={100}
          />
        </div>

        {/* Nombre d'équipes */}
        <div className="form-group">
          <label className="label">👥 Nombre d’équipes</label>
          <input
            type="number"
            className="input"
            value={nombreEquipes}
            onChange={(e) => setNombreEquipes(Number(e.target.value))}
            min={1}
            max={10}
          />
        </div>

        {/* Chrono */}
        <div className="form-group">
          <label className="label">⏱️ Durée du chrono (secondes)</label>
          <input
            type="number"
            className="input"
            value={chrono}
            onChange={(e) => setChrono(Number(e.target.value))}
            min={10}
            max={300}
          />
        </div>
      </div>

      {/* Noms des équipes */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          🏁 Noms des équipes :
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {nomsEquipes.map((nom, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                className="input w-full"
                value={nom}
                onChange={(e) => handleNomEquipeChange(i, e.target.value)}
                placeholder={`Équipe ${i + 1}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
