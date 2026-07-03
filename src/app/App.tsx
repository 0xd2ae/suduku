import { useEffect } from "react";
import { CompleteModal } from "../components/Modals/CompleteModal";
import { HintModal } from "../components/Modals/HintModal";
import { PauseModal } from "../components/Modals/PauseModal";
import { SettingsModal } from "../components/Modals/SettingsModal";
import { GamePage } from "./GamePage";
import { HomePage } from "./HomePage";
import { useGameStore } from "../store/gameStore";
import { useSettingsStore } from "../store/settingsStore";

export function App() {
  const screen = useGameStore((state) => state.screen);
  const tick = useGameStore((state) => state.tick);
  const darkMode = useSettingsStore((state) => state.darkMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [tick]);

  return (
    <>
      {screen === "home" ? <HomePage /> : <GamePage />}
      <PauseModal />
      <CompleteModal />
      <HintModal />
      <SettingsModal />
    </>
  );
}

