import React from "react";

export default function TeamScoreboard({
  teams,
  setTeams,
  currentTeamIndex,
  setCurrentTeamIndex,
  incrementScore,
}) {
  const handleTeamNameChange = (i, value) => {
    const newTeams = [...teams];
    newTeams[i].name = value;
    setTeams(newTeams);
  };

  const nextTeam = () => {
    setCurrentTeamIndex((currentTeamIndex + 1) % teams.length);
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>🏆 Scores des équipes</h2>
      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          maxWidth: "400px",
          margin: "0 auto",
        }}
      >
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Équipe</th>
            <th style={{ borderBottom: "1px solid #ccc" }}>Score</th>
            <th style={{ borderBottom: "1px solid #ccc" }}>+1</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, i) => (
            <tr
              key={i}
              style={{
                backgroundColor: i === currentTeamIndex ? "#f0f8ff" : "transparent",
              }}
            >
              <td>
                <input
                  type="text"
                  value={team.name}
                  onChange={(e) => handleTeamNameChange(i, e.target.value)}
                />
              </td>
              <td style={{ textAlign: "center" }}>{team.score}</td>
              <td style={{ textAlign: "center" }}>
                <button onClick={() => incrementScore(i)}>+1</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "1rem" }}>
        <button onClick={nextTeam}>
          ⏭ Tour suivant ({teams[(currentTeamIndex + 1) % teams.length].name})
        </button>
      </div>
    </div>
  );
}
