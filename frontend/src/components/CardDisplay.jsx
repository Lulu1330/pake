import React from "react";

const cardStyle = (themeColor) => ({
  backgroundColor: themeColor || "#fff",
  borderRadius: "1rem",
  padding: "2rem",
  minHeight: "250px",
  width: "300px",
  margin: "auto",
  boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: "1.5rem",
  position: "relative",
});

const pointBadgeStyle = {
  position: "absolute",
  top: 10,
  right: 10,
  backgroundColor: "green",
  color: "white",
  padding: "4px 8px",
  borderRadius: "6px",
  fontSize: "0.9rem",
};

const buttonContainerStyle = {
  display: "flex",
  gap: "1rem",
  marginTop: "1.5rem",
};

const footerStyle = {
  fontSize: "0.8rem",
  marginTop: "0.5rem",
};

export default function CardDisplay({
  carte,
  themeColor,
  index,
  total,
  onNext,
  onPrev,
  onAnnuler,
  isValidated,
  equipes = [],
  onAttribuer = () => {},
}) {
  if (!carte) return null;

  return (
  <div style={{
      border: "1px solid #ccc",
      borderRadius: "12px",
      padding: "1.5rem",
      textAlign: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      backgroundColor: "#fff",
      maxWidth: "400px",
      margin: "0 auto",
      minHeight: "300px",    
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }}>
    <div>
      <strong>{carte.carte}</strong>
      <br />
      <small>{carte.theme}</small>
    </div>

    {isValidated && (
      <button
        onClick={onAnnuler}
        style={{
          marginTop: "12px",
          backgroundColor: "#e11d48",
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "6px 12px",
          cursor: "pointer",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}
      >
        ❌ Annuler l’attribution
      </button>
    )}

    <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center", gap: "1rem" }}>
      <button onClick={onPrev} aria-label="Carte précédente">
        ⬅️
      </button>
      <button onClick={onNext} aria-label="Carte suivante">
        ➡️
      </button>
    </div>

    {equipes?.length > 0 && (
      <div style={{ marginTop: "1.5rem" }}>
        <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
          Attribuer à une équipe :
        </p>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          justifyContent: "center"
        }}>
          {equipes.map((eq, i) => (
            <button
              key={i}
              onClick={() => {onAttribuer(i);
              }}
              style={{
                backgroundColor: "#7c3aed",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "6px 12px",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              {eq}
            </button>
          ))}
        </div>
      </div>
    )}

    <div style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#555" }}>
      Carte {index + 1} sur {total}
    </div>
  </div>
);
}
