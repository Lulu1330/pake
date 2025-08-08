import React, { useEffect, useState } from "react";

export default function APropos() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
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
    <main className="max-w-3xl mx-auto p-6 font-sans text-gray-800 dark:text-gray-300 transition-colors duration-200">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-indigo-600 dark:text-white">🃏 À propos de Pake de Cartes</h1>
        
      </header>

      <section className="mb-8 text-left">
        <p className="text-lg">
          Bienvenue sur <strong>Pake de Cartes</strong>, une application simple et ludique conçue pour animer vos soirées, cours ou moments libres avec un jeu de devinettes accessible à tous.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-indigo-600 mb-2 dark:text-white">🃏 Alternative en ligne au jeu type Time's Up®</h2>
        <p>
          Vous cherchez à jouer à un jeu de devinettes en ligne, sans avoir la boîte officielle ? Pake de Cartes vous propose une version gratuite, avec tirage aléatoire, chrono, scores et équipes.
        </p>
        <ol className="list-decimal list-inside my-3">
          <li>Choisissez vos thèmes, le nombre et le nom d'équipe</li>
          <li>Tirer un paquet cartes aléatoire.</li>
          <li>Lancez le chrono (ou pas) et amusez-vous !</li>
        </ol>
        <p className="italic text-sm text-gray-600 dark:text-gray-400 mt-2">
          *Time’s Up® est une marque déposée d’Asmodee. Cette application n’est ni affiliée ni approuvée par Asmodee.*
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-indigo-600 mb-2 dark:text-white">👥 Pour qui ?</h2>
        <p>
          Ce jeu s’adresse à tous : familles, amis ou animateurs, et toute personne aimant partager un moment convivial.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-indigo-600 mb-2 dark:text-white">💡 Pourquoi ce jeu ?</h2>
        <p>
          Rapide, sans préparation ni inscription, ce jeu numérique est pensé pour le plaisir simple de jouer ensemble.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-indigo-600 mb-2 dark:text-white">🛠️ Techniquement</h2>
        <p>
          L’interface est développée en <strong>React</strong> et le backend en <strong>Flask (Python)</strong>, garantissant un tirage de cartes aléatoire fiable et une expérience fluide.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-indigo-600 mb-2 dark:text-white">✉️ Suggestions ou bugs ?</h2>
        <p>
          Vos retours sont précieux ! Contactez-nous à&nbsp;
          <a href="mailto:support@pake-de-cartes.fr" className="text-indigo-600 hover:underline font-semibold dark:text-white">
            support@pake-de-cartes.fr
          </a>
        </p>
      </section>
    </main>
  );
}
