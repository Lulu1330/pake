import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ThemeSelector({
  allThemes,
  selectedThemes,
  handleCheckboxChange,
  toggleSelectAll,
  allSelected,
}) {
  const [showThemes, setShowThemes] = useState(false);

  return (
    <div style={{ marginTop: "2rem", textAlign: "left" }}>
      <label><strong>🎨 Choisissez les thèmes :</strong></label>

      <button
        onClick={() => setShowThemes((prev) => !prev)}
        style={{
          display: "flex",
          alignItems: "center",
          marginTop: "0.5rem",
          backgroundColor: "#f0f0f0",
          border: "1px solid #ccc",
          padding: "0.5rem 1rem",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "1rem",
          transition: "background-color 0.2s ease",
        }}
      >
        {showThemes ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        <span style={{ marginLeft: "0.5rem" }}>
          {showThemes
            ? "Fermer les thèmes"
            : `${selectedThemes.length} thème${selectedThemes.length > 1 ? "s" : ""} sélectionné${selectedThemes.length > 1 ? "s" : ""}`}
        </span>
      </button>

      {showThemes && (
        <div style={{ marginTop: "1rem", transition: "max-height 0.3s ease" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
              />
              <strong> Tout sélectionner</strong>
            </label>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "0.5rem",
            }}
          >
            {allThemes.map((theme) => (
              <label
                key={theme}
                style={{
                  background: selectedThemes.includes(theme) ? "#def" : "#f9f9f9",
                  padding: "0.5rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #ccc",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedThemes.includes(theme)}
                  onChange={() => handleCheckboxChange(theme)}
                  style={{ marginRight: "0.5rem" }}
                />
                {theme}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
