import React, { useEffect, useState } from "react";

// Page SEO safe pour "jeu type Time's Up" avec support mode sombre (Tailwind CSS)
// Props:
// - siteName: nom affiché du site (ex: "Pake de Cartes")
// - createUrl: URL où créer une partie (ex: "/create")

export default function TimeUpAlternativePage({ siteName = "Pake de Cartes", createUrl = "/create" }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // initialise le thème en lisant la préférence système ou le localStorage
    const saved = localStorage.getItem("theme");
    if (saved) {
      setIsDark(saved === "dark");
      document.documentElement.classList.toggle("dark", saved === "dark");
    } else {
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark);
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <header className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{siteName}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">Alternative en ligne à un jeu de devinettes type Time's Up®</p>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 py-8">
        <article className="prose dark:prose-invert prose-lg">
          <h2>Jouer à un jeu type <em>Time's Up®</em> en ligne</h2>
          <p>
            Vous voulez organiser une partie de devinettes avec chrono, équipes et scores, mais vous n’avez pas la boîte originale ?
            Cette page présente une alternative en ligne gratuite et sans matériel, complètement personnalisable.
          </p>

          <h3>Comment ça marche ?</h3>
          <ol>
            <li>Choisissez vos thèmes, le nombre et le nom d'équipe</li>
            <li>Tirer un paquet cartes aléatoire.</li>
            <li>Lancez le chrono (ou pas) et amusez-vous !</li>
          </ol>

          <h3>Avantages</h3>
          <ul>
            <li>Tirage aléatoire de cartes</li>
            <li>Chronomètre intégré</li>
            <li>Scores et gestion d’équipes</li>
            <li>Compatible mobile et ordinateur</li>
            <li>Thèmes personnalisable</li>
          </ul>

          <h3>Pour qui ?</h3>
          <p>
            Idéal pour soirées entre amis, team building à distance, animations en classe ou familles en vacances.
          </p>

          <h3>FAQ rapide</h3>
          <p>
            <strong>Est-ce le jeu officiel ?</strong> Non. <em>Time's Up®</em> est une marque déposée d'Asmodee. Ce site est une
            alternative non affiliée et propose une expérience inspirée du principe général.
          </p>
        </article>
      </section>

      <footer className="max-w-5xl mx-auto px-6 py-8 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex flex-col md:flex-row md:justify-between gap-4">
          <div>
            <p className="font-medium">{siteName}</p>
            <p>© {new Date().getFullYear()} — Non affilié à Asmodee. Time's Up® est une marque déposée.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
