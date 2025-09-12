import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-br from-purple-700 via-indigo-800 to-black text-white p-8">
      {/* Logo du site */}
      <header className="text-center mt-8">
        <h1 className="text-4xl font-extrabold tracking-wide">🎴 Pake de Cartes</h1>
        <p className="text-gray-300 mt-2">Un site de jeux en ligne à deux</p>
      </header>

      {/* Boutons principaux */}
      <main className="flex flex-col gap-6 items-center mt-16">
        <Link
          to="/mot-en-commun"
          className="w-64 text-center py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg text-xl font-bold transition-transform transform hover:scale-105"
        >
          Mot en Commun
        </Link>
        <Link
          to="/pake"
          className="w-64 text-center py-4 bg-green-600 hover:bg-green-700 rounded-2xl shadow-lg text-xl font-bold transition-transform transform hover:scale-105"
        >
          Pake
        </Link>
      </main>

      {/* Footer avec petits boutons */}
      <footer className="flex gap-6 text-sm text-gray-400 mb-6">
        <Link to="/a-propos" className="hover:text-white">
          À propos
        </Link>
        <Link to="/politique-confidentialite" className="hover:text-white">
          Politique de Confidentialité
        </Link>
        <Link to="/mentions-legales" className="hover:text-white">
          Mentions légales
        </Link>
      </footer>
    </div>
  );
}
