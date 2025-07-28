import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.post("/api/analyse", (req, res) => {
  const input = req.body.input;

  // logique de traitement...
  const summary = `Résumé simulé de : ${input}`;

  res.json({ summary });
});

// 🔥 Indispensable pour Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
