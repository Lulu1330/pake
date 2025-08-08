import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './pages/Home.jsx';
import APropos from './pages/APropos.jsx';
import MentionsLegales from './pages/MentionsLegales.jsx';
import PoliqueConfidentialite from './pages/PolitiqueConfidentialite.jsx';
import TimeUpAlternativePage from './pages/JeuDeCarteADeviner.jsx';
import Navbar from './components/Navbar.jsx';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div className={`min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300`}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <Routes>
        <Route path="/" element={<Home darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/a-propos" element={<APropos darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/mentions-legales" element={<MentionsLegales darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/politique-confidentialite" element={<PoliqueConfidentialite darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/jeu-de-carte-a-deviner" element={<TimeUpAlternativePage darkMode={darkMode} setDarkMode={setDarkMode} />} />
      </Routes>
    </div>
  );
}
export default App;
