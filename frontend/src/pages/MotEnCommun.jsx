import React from "react";
import MotEnCommun from "../components/MotEnCommun.jsx"; // si ton composant est dans /components

export default function MotEnCommunPage({ darkMode, setDarkMode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      <MotEnCommun />
    </div>
  );
}