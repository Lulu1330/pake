import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ padding: "1rem", backgroundColor: "#eee" }}>
      <Link to="/" style={{ marginRight: "1rem" }}>Accueil</Link>
      <Link to="/mentions-legales" style={{ marginRight: "1rem" }}>Mentions légales</Link>
      <Link to="/politique-confidentialite" style={{ marginRight: "1rem" }}>Confidentialité</Link>
      <Link to="/a-propos">À propos</Link>
    </nav>
  );
}
