import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Pake from "./pages/Pake.jsx";
import APropos from "./pages/APropos.jsx";
import MentionsLegales from "./pages/MentionsLegales.jsx";
import PolitiqueConfidentialite from "./pages/PolitiqueConfidentialite.jsx";
import Navbar from "./components/Navbar.jsx";
import Game from "./pages/MotEnCommun.jsx";

function Layout({ darkMode, setDarkMode }) {
  const location = useLocation();
  const hideNavbar = location.pathname === "/"; // cache la navbar sur la home

  return (
    <>
      {!hideNavbar && <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />}
      <Routes>
        <Route path="/" element={<Home darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/pake-de-cartes" element={<Pake darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/a-propos" element={<APropos darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/mentions-legales" element={<MentionsLegales darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/mot-en-commun" element={<Game darkMode={darkMode} setDarkMode={setDarkMode} />} />
      </Routes>
    </>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <div className={`min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300`}>
      <Layout darkMode={darkMode} setDarkMode={setDarkMode} />
    </div>
  );
}

export default App;
