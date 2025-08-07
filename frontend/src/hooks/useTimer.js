import { useState, useEffect } from "react";

export default function useTimer(initialTime, onFinish) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (timeLeft === 0) {
      setIsRunning(false);
      onFinish?.();
    }
  }, [isRunning, timeLeft]);

  return { timeLeft, isRunning, setIsRunning, setTimeLeft };
}
