import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-700 via-indigo-800 to-black text-white pt-0">
      
      {/* Contenu principal centré */}
      <div className="flex-grow flex flex-col items-center justify-center">
        
        {/* Logo plus gros */}
        <header className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
          <img
            src={logo}
            alt="Pake"
            className="w-48 sm:w-64 md:w-72 h-auto drop-shadow-xl"
          />
        </header>

        {/* Boutons principaux un peu plus bas */}
        <main className="flex flex-col gap-6 items-center mt-80">
          <Link
            to="/mot-en-commun"
            className="w-64 text-center py-4 bg-red-600 hover:bg-red-700 rounded-2xl shadow-lg text-xl font-bold transition-transform transform hover:scale-105"
          >
            Mot en Commun
          </Link>
          <Link
            to="/pake-de-cartes"
            className="w-64 text-center py-4 bg-green-600 hover:bg-green-700 rounded-2xl shadow-lg text-xl font-bold transition-transform transform hover:scale-105"
          >
            Pake
          </Link>
        </main>
      </div>

      {/* Footer collé en bas */}
      <footer className="flex gap-6 text-sm text-gray-400 justify-center mb-6">
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
