import { useState } from "react";
import { useStore } from "../state/store";

export default function StartupModal() {
  const initCore = useStore(s => s.initCore);
  const coreId = useStore(s => s.coreId);
  const [mode, setMode] = useState<"SANDBOX" | "PROFESSIONAL">("SANDBOX");
  const [text, setText] = useState("");
  const [notes, setNotes] = useState("");
  const [conf, setConf] = useState(100);

  if (coreId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Start your belief map</h1>
        <div className="flex gap-3">
          <button onClick={() => setMode("SANDBOX")} className={`px-3 py-2 rounded border ${mode==="SANDBOX"?"bg-zinc-900 text-white":""}`}>Sandbox</button>
          <button onClick={() => setMode("PROFESSIONAL")} className={`px-3 py-2 rounded border ${mode==="PROFESSIONAL"?"bg-zinc-900 text-white":""}`}>Professional</button>
        </div>
        <label className="block text-sm font-medium">Core belief (required)</label>
        <input className="w-full border rounded p-2" value={text} onChange={e=>setText(e.target.value)} placeholder="e.g., Human well-being should be prioritized." />
        <label className="block text-sm font-medium">Notes (optional)</label>
        <textarea className="w-full border rounded p-2" value={notes} onChange={e=>setNotes(e.target.value)} rows={3} />
        <label className="block text-sm font-medium">Confidence: {conf}</label>
        <input type="range" min={0} max={100} value={conf} onChange={e=>setConf(parseInt(e.target.value))} className="w-full" />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => initCore(mode, text.trim(), notes.trim(), conf)}
            disabled={text.trim().length < 4}
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          >
            Create Map
          </button>
        </div>
        <p className="text-xs text-zinc-500">Core is protected, centered, and never analyzed.</p>
      </div>
    </div>
  );
}