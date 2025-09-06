import React from 'react';
import { Link } from "react-router-dom";
import logo from "../assets/nom.png"; // chemin à adapter selon l'endroit où tu mets l'image


export default function Navbar({ darkMode, setDarkMode }) {
  return (
    <nav className="bg-white text-black dark:bg-gray-900 dark:text-white shadow-md transition-colors duration-300">
      <div className="flex flex-wrap justify-between items-center gap-4">
      {/* Contenu gauche */}
      <Link to="/" className="flex items-center">
        <div
          className="overflow-hidden flex items-center justify-center"
          style={{
            height: "68px",
            width: "auto",
          }}
        >
          <img
            src={logo}
            alt="Pake"
            className="object-contain h-full w-auto -translate-x-25" // décalage gauche
          />
        </div>
      </Link>

        {/* Liens + Thème */}
         <div className="flex flex-wrap items-center gap-4">
          <Link to="/a-propos" className="hover:text-indigo-500 dark:hover:text-indigo-300 transition">
            À propos
          </Link>
          <Link to="/mentions-legales" className="hover:text-indigo-500 dark:hover:text-indigo-300 transition">
            Mentions légales
          </Link>
          <Link to="/politique-confidentialite" className="hover:text-indigo-500 dark:hover:text-indigo-300 transition">
            Confidentialité
          </Link>
         { /*<Link to="/mot-en-commun" className="hover:text-indigo-500 dark:hover:text-indigo-300 transition">/*
          #  Mot en Commun
          #</Link>/*}
          
          {/* Thème */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-2 text-sm bg-slate-200 dark:bg-gray-700 rounded hover:scale-105 transition"
          >
            {darkMode ? '☀️ Clair' : '🌙 Sombre'}
          </button>
        </div>
      </div>
    </nav>
  );
}
