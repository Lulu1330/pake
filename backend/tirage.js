import express from "express";
import Database from "better-sqlite3";

const router = express.Router();

// ouverture de la base
const db = new Database("cartes.db", { verbose: console.log });

// Tirage de cartes depuis la base
function tirageAleatoire(themes, nb_cartes) {
  let cartes;

  if (themes && themes.length > 0) {
    // Tirage avec filtre sur les thèmes
    const placeholders = themes.map(() => "?").join(",");
    const stmt = db.prepare(`
      SELECT * FROM cartes
      WHERE theme IN (${placeholders})
      ORDER BY RANDOM()
      LIMIT ?
    `);
    cartes = stmt.all(...themes, nb_cartes);
  } else {
    // Tirage global (tous thèmes confondus)
    const stmt = db.prepare(`
      SELECT * FROM cartes
      ORDER BY RANDOM()
      LIMIT ?
    `);
    cartes = stmt.all(nb_cartes);
  }

  return cartes;
}

router.post("/tirage", (req, res) => {
  try {
    const { themes, nb_cartes } = req.body;

    if (!nb_cartes || nb_cartes <= 0) {
      return res.status(400).json({ error: "Nombre de cartes invalide" });
    }

    const cartes = tirageAleatoire(themes, nb_cartes);
    return res.json(cartes);
  } catch (err) {
    console.error("Erreur tirage:", err);
    return res.status(500).json({ error: "Erreur serveur lors du tirage" });
  }
});

export default router;
