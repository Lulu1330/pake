import { motion } from "framer-motion";
import { useState } from "react";
import logo from "../assets/logo.png";

export default function Carte({ contenu }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      className="relative w-32 h-48 rounded-2xl shadow-2xl cursor-pointer preserve-3d"
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{ duration: 0.55 }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      {/* Verso */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center rounded-2xl backface-hidden">
        <img
          src={logo}
          alt="Dos de la carte"
          className="max-w-[60%] max-h-[60%] object-contain"
        />
      </div>

      {/* Recto */}
      <div className="absolute inset-0 bg-white text-black flex items-center justify-center rounded-2xl shadow-lg backface-hidden"
           style={{ transform: "rotateY(180deg)" }}>
        <span className="text-lg font-bold text-center px-2">{contenu}</span>
      </div>
    </motion.div>
  );
}
