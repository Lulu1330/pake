import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://pake-ke5g.onrender.com", {
  transports: ["websocket"], // 🔑 important
  withCredentials: false
});
// 🔑 remplace par ton URL Render

export default function Game() {
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [mySymbol, setMySymbol] = useState(null);
  const [turn, setTurn] = useState("X");
  const [error, setError] = useState("");

  useEffect(() => {
  socket.on("connect", () => {
    console.log("✅ Connecté au serveur :", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Erreur de connexion :", err.message);
  });

  return () => {
    socket.off("connect");
    socket.off("connect_error");
  };
}, []);

  // Quand je reçois le coup de l'adversaire
  useEffect(() => {
    socket.on("opponentMove", (index) => {
      setBoard((prev) => {
        const newBoard = [...prev];
        newBoard[index] = mySymbol === "X" ? "O" : "X";
        return newBoard;
      });
      setTurn(mySymbol);
    });

    return () => {
      socket.off("opponentMove");
    };
  }, [mySymbol]);

  const createRoom = () => {
    socket.emit("createRoom", (newRoom) => {
      if (!newRoom) {
        console.error("Échec de la création de la room");
        return;
      }
      console.log("Room créée :", newRoom);
      setRoom(newRoom);
      setJoined(true);
      setMySymbol("X");
    });
  };

  const joinRoom = () => {
    socket.emit("joinRoom", room, (response) => {
      if (response.success) {
        setJoined(true);
        setMySymbol("O"); // rejoigneur = O
      } else {
        setError(response.message);
      }
    });
  };

  const playMove = (index) => {
    if (board[index] || turn !== mySymbol) return;

    const newBoard = [...board];
    newBoard[index] = mySymbol;
    setBoard(newBoard);
    setTurn(mySymbol === "X" ? "O" : "X");

    socket.emit("playMove", { room, index });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {!joined ? (
        <div className="p-6 bg-white shadow-xl rounded-2xl">
          <h1 className="text-2xl font-bold mb-4">Morpion en ligne</h1>
          <div className="flex flex-col gap-2">
            <button
              onClick={createRoom}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Créer une partie
            </button>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Code de la room"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="border p-2 rounded w-full mb-2"
              />
              <button
                onClick={joinRoom}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
              >
                Rejoindre une partie
              </button>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-2">
            Tu es <span className="font-bold">{mySymbol}</span>
          </h2>
          <p className="mb-2">Room : <span className="font-mono">{room}</span></p>
          <h3 className="mb-4">Au tour de : {turn}</h3>
          <div className="grid grid-cols-3 gap-2">
            {board.map((cell, i) => (
              <button
                key={i}
                onClick={() => playMove(i)}
                className="w-20 h-20 bg-white border text-2xl font-bold rounded-lg shadow"
              >
                {cell}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}