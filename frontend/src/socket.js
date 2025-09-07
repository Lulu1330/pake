import { io } from "socket.io-client";

// 🔑 On choisit l'URL en fonction de l'environnement
const URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000" // backend local
    : "https://pake-ke5g.onrender.com"; // backend Render (ton URL)

export const socket = io(URL, {
  withCredentials: true, // important pour CORS
});
