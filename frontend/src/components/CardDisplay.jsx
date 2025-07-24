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
  onValidate,
  isValidated,
}) {
  if (!carte) return null;

  return (
    <div style={cardStyle(themeColor)}>
      <div>
        <strong>{carte.carte}</strong>
        <br />
        <small>{carte.theme}</small>
      </div>

      {isValidated && <div style={pointBadgeStyle}>+1 Point</div>}

      <div style={buttonContainerStyle}>
        <button onClick={onPrev} aria-label="Carte précédente">
          ⬅️
        </button>
        <button onClick={() => onValidate(index)}>
          {isValidated ? "Annuler" : "Valider"}
        </button>
        <button onClick={onNext} aria-label="Carte suivante">
          ➡️
        </button>
      </div>

      <div style={footerStyle}>
        Carte {index + 1} sur {total}
      </div>
    </div>
  );
}
