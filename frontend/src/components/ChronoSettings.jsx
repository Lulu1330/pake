import React from "react";

export default function ChronoSettings({
  useChrono,
  setUseChrono,
  chronoDuration,
  setChronoDuration,
  timeLeft,
  setTimeLeft,
  chronoRunning,
  setChronoRunning,
  chronoPaused,
  setChronoPaused,
}) {
  const handleToggle = () => {
    setUseChrono(!useChrono);
    setChronoRunning(false);
    setChronoPaused(false);
    setTimeLeft(chronoDuration);
  };

  const handleDurationChange = (e) => {
    const newVal = parseInt(e.target.value);
    setChronoDuration(newVal);
    setTimeLeft(newVal);
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <label>
        <input type="checkbox" checked={useChrono} onChange={handleToggle} />
        Activer le chronomètre
      </label>

      {useChrono && (
        <div style={{ marginTop: "0.5rem" }}>
          <label>Durée (en secondes): </label>
          <input
            type="number"
            value={chronoDuration}
            onChange={handleDurationChange}
            style={{ width: "80px", marginLeft: "0.5rem" }}
          />

          <h3 style={{ marginTop: "1rem" }}>⏱ Temps restant : {timeLeft} sec</h3>

          <button
            onClick={() => {
              setTimeLeft(chronoDuration);
              setChronoPaused(false);
              setChronoRunning(true);
            }}
          >
            ▶️ Démarrer
          </button>

          <button
            onClick={() => setChronoPaused(true)}
            style={{ marginLeft: "0.5rem" }}
          >
            ⏸ Pause
          </button>

          <button
            onClick={() => {
              setChronoRunning(false);
              setChronoPaused(false);
              setTimeLeft(chronoDuration);
            }}
            style={{ marginLeft: "0.5rem" }}
          >
            ⏹ Stop
          </button>
        </div>
      )}
    </div>
  );
}
