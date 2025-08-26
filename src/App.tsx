import StartupModal from "./components/StartupModal";
import Toolbar from "./components/Toolbar";
import ModeWatermark from "./components/ModeWatermark";
import GraphCanvas from "./components/GraphCanvas";
import { useEffect } from "react";
import { useStore } from "./state/store";

export default function App() {
  const importState = useStore(s => s.importState);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const shouldReset = q.has("reset") || q.has("new");
    if (!shouldReset) {
      const saved = localStorage.getItem("belief-map");
      if (saved) {
        try { importState(saved); } catch {}
      }
    } else {
      try { localStorage.removeItem("belief-map"); } catch {}
    }
  }, [importState]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <StartupModal />
      <Toolbar />
      <GraphCanvas />
      <ModeWatermark />
    </div>
  );
}