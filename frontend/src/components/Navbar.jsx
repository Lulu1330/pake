import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ darkMode, setDarkMode }) {
  return (
    <nav className="bg-white text-black dark:bg-gray-900 dark:text-white shadow-md transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">
        {/* Logo / Titre */}
        <Link to="/" className="text-2xl font-extrabold hover:opacity-80">
          🎴 Pake
        </Link>

        {/* Liens + Thème */}
        <div className="flex items-center gap-6 text-base font-medium">
          <Link to="/a-propos" className="hover:text-indigo-500 dark:hover:text-indigo-300 transition">
            À propos
          </Link>
          <Link to="/mentions-legales" className="hover:text-indigo-500 dark:hover:text-indigo-300 transition">
            Mentions légales
          </Link>
          <Link to="/politique-confidentialite" className="hover:text-indigo-500 dark:hover:text-indigo-300 transition">
            Confidentialité
          </Link>

          {/* Thème */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="ml-2 px-4 py-2 text-sm rounded bg-slate-200 dark:bg-gray-700 hover:scale-105 transition"
          >
            {darkMode ? '☀️ Clair' : '🌙 Sombre'}
          </button>
        </div>
      </div>
    </nav>
  );
}
