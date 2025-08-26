import { useStore } from "../state/store";
import { analyze, suggest } from "../lib/api";
import { useState } from "react";

export default function Toolbar() {
  const { mode, coreId, blockedByNodeId, nodes, activeUpstreamId } = useStore();
  const addBeliefPending = useStore(s => s.addBeliefPending);
  const setNodeResult = useStore(s => s.setNodeResult);
  const setBlockedBy = useStore(s => s.setBlockedBy);
  const updateNodeNotesConfidence = useStore(s => s.updateNodeNotesConfidence);
  const undo = useStore(s => s.undo);

  const [showEntry, setShowEntry] = useState(false);
  const [text, setText] = useState("");
  const [notes, setNotes] = useState("");
  const [conf, setConf] = useState(60);
  const [busy, setBusy] = useState(false);

  if (!coreId) return null;

  const addBelief = async () => {
    if (!text.trim()) return;
    setBusy(true);
    const newId = addBeliefPending(text.trim(), notes.trim(), conf, activeUpstreamId ?? coreId);
    try {
      const core = nodes[coreId!];
      const up = activeUpstreamId ? [nodes[activeUpstreamId]] : [core];
      const result = await analyze({
        mode,
        coreBelief: { text: core.text, notes: core.notes, confidence: core.confidence },
        upstreamBeliefs: up.map(n => ({ text: n.text, notes: n.notes, confidence: n.confidence, status: n.status })),
        newBelief: { text, notes, confidence: conf }
      });
      setNodeResult(newId, result.status as any, result.summary, result.fullExplanation);
      if (mode === "PROFESSIONAL") {
        if (["harmful","contradictory","incoherent"].includes(result.status)) setBlockedBy(newId);
      }
    } catch (e) {
      setNodeResult(newId, "pending", "Analyzer error.", String(e));
    } finally {
      setBusy(false);
      setShowEntry(false);
      setText(""); setNotes(""); setConf(60);
    }
  };

  const blockedNode = blockedByNodeId ? nodes[blockedByNodeId] : null;
  const canAdd = mode === "SANDBOX" || !blockedNode;

  const reanalyzeBlocked = async () => {
    if (!blockedNode) return;
    const core = nodes[coreId!];
    const parentId = blockedNode.upstreamIds[0] ?? coreId!;
    const up = [nodes[parentId]];
    setBusy(true);
    try {
      const result = await analyze({
        mode,
        coreBelief: { text: core.text, notes: core.notes, confidence: core.confidence },
        upstreamBeliefs: up.map(n => ({ text: n.text, notes: n.notes, confidence: n.confidence, status: n.status })),
        newBelief: { text: blockedNode.text, notes: blockedNode.notes ?? "", confidence: blockedNode.confidence }
      });
      setNodeResult(blockedNode.id, result.status as any, result.summary, result.fullExplanation);
      if (!["harmful","contradictory","incoherent"].includes(result.status)) setBlockedBy(null);
    } catch (e) {
      // keep pending
    } finally {
      setBusy(false);
    }
  };

  const doSuggest = async () => {
    const core = nodes[coreId!];
    const recent = Object.values(nodes).filter(n => !n.isCore && n.status === "coherent").slice(-3).map(n => n.text);
    const s = await suggest({ coreText: core.text, recent });
    setShowEntry(true);
    setText(s.suggestedBelief);
    setNotes(s.notesHint);
    setConf(s.confidence);
  };

  return (
    <div className="absolute left-4 top-4 z-40 flex flex-wrap gap-2">
      <button className="px-3 py-2 rounded bg-zinc-900 text-white disabled:opacity-50" disabled={!canAdd} onClick={()=>setShowEntry(true)}>Add Belief</button>
      {mode === "SANDBOX" && (
        <>
          <button className="px-3 py-2 rounded border" onClick={doSuggest}>Suggest Belief (AI)</button>
          <button className="px-3 py-2 rounded border" onClick={undo}>Undo</button>
        </>
      )}
      {blockedNode && (
        <div className="px-3 py-2 rounded bg-red-50 border border-red-200 text-sm">
          Blocked by <span className="font-semibold">{blockedNode.text.slice(0,48)}{blockedNode.text.length>48?"…":""}</span> ({blockedNode.status}).
          <button className="ml-2 underline" disabled={busy} onClick={reanalyzeBlocked}>Re-analyze</button>
        </div>
      )}

      {/* Entry modal */}
      {!showEntry ? null : (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow p-6 w-full max-w-xl space-y-3">
            <h2 className="text-lg font-semibold">Add belief</h2>
            <input className="w-full border rounded p-2" placeholder="Belief text" value={text} onChange={e=>setText(e.target.value)} />
            <textarea className="w-full border rounded p-2" rows={3} placeholder="Notes / justification" value={notes} onChange={e=>setNotes(e.target.value)} />
            <label className="text-sm font-medium">Confidence: {conf}</label>
            <input type="range" min={0} max={100} value={conf} onChange={e=>setConf(parseInt(e.target.value))} className="w-full" />
            <div className="flex justify-end gap-2">
              <button className="px-3 py-2 rounded border" onClick={()=>setShowEntry(false)}>Cancel</button>
              <button className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50" disabled={busy || text.trim().length<4} onClick={addBelief}>
                {busy ? "Analyzing…" : "Add & Analyze"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
