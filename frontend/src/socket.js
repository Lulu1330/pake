// src/socket.js
import { io } from "socket.io-client";

// URL choisie automatiquement en fonction de ton fichier .env
const URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

console.log("👉 Connexion au serveur :", URL);

export const socket = io(URL, {
  withCredentials: true,
});
