import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import MotEnCommunUI from "./MotEnCommunUI";

const socket = io("https://pake-de-cartes.fr", {
  withCredentials: true,
});

export default function MotEnCommunLogic() {
  const [room, setRoom] = useState(null);
  const [role, setRole] = useState(null);
  const [state, setState] = useState(null);
  const [word, setWord] = useState("");
  const [joinCode, setJoinCode] = useState("");

  // --- Écouteurs socket ---
  useEffect(() => {
    socket.on("gameCreated", (room) => {
      console.log("Partie créée :", room);
    });

    socket.on("gameJoined", ({ room, role }) => {
      setRoom(room);
      setRole(role);
    });

    socket.on("stateUpdate", (game) => {
      setState(game);
    });

    socket.on("roundResult", (result) => {
      console.log("Résultat du round :", result);
    });

    return () => {
      socket.off("gameCreated");
      socket.off("gameJoined");
      socket.off("stateUpdate");
      socket.off("roundResult");
    };
  }, []);

  // --- Fonctions ---
  const createGame = () => {
    socket.emit("createGame");
  };

  const joinGame = (code) => {
    if (!code) return;
    socket.emit("joinGame", code); // envoie juste le code
  };

  const playWord = () => {
    if (!word.trim()) return;
    socket.emit("playWord", { room, word });
    setWord("");
  };

  const skipRound = () => {
    socket.emit("skipRound", { room });
  };

  return (
    <MotEnCommunUI
      room={room}
      role={role}
      state={state}
      word={word}
      setWord={setWord}
      createGame={createGame}
      joinGame={joinGame}
      playWord={playWord}
      skipRound={skipRound}
      joinCode={joinCode}
      setJoinCode={setJoinCode}
    />
  );
}
