import { useState, useEffect } from "react";
import { socket } from "../socket"; // ⚠️ adapte selon ton chemin
import MotEnCommunUI from "./MotEnCommunUI";

export default function MotEnCommunLogic() {
  const [room, setRoom] = useState(null);
  const [role, setRole] = useState(null);
  const [state, setState] = useState(null);
  const [word, setWord] = useState("");
  const [roundResult, setRoundResult] = useState(null);

  useEffect(() => {
    socket.on("stateUpdate", (game) => setState(game));
    socket.on("gameCreated", (roomCode) => setRoom(roomCode));
    socket.on("gameJoined", ({ room, role }) => {
      setRoom(room);
      setRole(role);
    });
    socket.on("roundResult", (result) => {
    setRoundResult(result);
  });

    return () => {
      socket.off("stateUpdate");
      socket.off("gameCreated");
      socket.off("gameJoined");
      socket.off("roundResult");
    };
  }, []);
   useEffect(() => {
    if (state?.currentRound?.cards) {
      setRoundResult(null);
    }
  }, [state?.currentRound?.cards]);

  const createGame = () => socket.emit("createGame");
  const joinGame = (roomCode) => socket.emit("joinGame", roomCode);
  const playWord = () => {
    if (!word.trim()) return;
    socket.emit("playWord", { room, player: role, word });
    setWord("");
  };
  const hasPlayedThisRound = state?.visibleWords?.some(
    (w) => w.role === role && w.word !== null
  );
  return (
    <MotEnCommunUI
      state={state}
      room={room}
      role={role}
      word={word}
      roundResult = {roundResult}
      setWord={setWord}
      createGame={createGame}
      joinGame={joinGame}
      playWord={playWord}
      socket={socket}
      hasPlayedThisRound = {hasPlayedThisRound}
    />
  );
}
