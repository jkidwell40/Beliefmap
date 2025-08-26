import { create } from "zustand";
import { GraphState, BeliefNode, BeliefEdge } from "../types";

function now() { return new Date().toISOString(); }
function uid(prefix = "n") { return `${prefix}_${Math.random().toString(36).slice(2, 10)}`; }

type Actions = {
  initCore: (mode: "SANDBOX" | "PROFESSIONAL", coreText: string, notes?: string, confidence?: number) => void;
  addBeliefPending: (text: string, notes: string, confidence: number, upstreamId?: string) => string;
  setNodeResult: (id: string, status: BeliefNode["status"], tldr?: string, explanation?: string) => void;
  selectActive: (id: string | null) => void;
  setBlockedBy: (id: string | null) => void;
  updateNodeNotesConfidence: (id: string, notes: string, confidence: number) => void;
  pushHistory: () => void;
  undo: () => void;
  importState: (json: string) => void;
};

const initial: GraphState = {
  mode: "SANDBOX",
  nodes: {},
  edges: {},
  coreId: null,
  activeUpstreamId: null,
  blockedByNodeId: null,
  history: [],
  schemaVersion: "v1"
};

export const useStore = create<GraphState & Actions>((set, get) => ({
  ...initial,

  initCore: (mode, coreText, notes = "", confidence = 100) => {
    const id = uid("core");
    const core: BeliefNode = {
      id, text: coreText, notes, confidence,
      status: "protected", upstreamIds: [],
      depth: 0, isCore: true, createdAt: now(), updatedAt: now()
    };
    set({
      mode, nodes: { [id]: core }, edges: {},
      coreId: id, activeUpstreamId: id, blockedByNodeId: null
    });
    document.body.setAttribute("data-mode", mode);
    localStorage.setItem("belief-map", JSON.stringify(get()));
  },

  addBeliefPending: (text, notes, confidence, upstreamId) => {
    const state = get();
    const parent = upstreamId ?? state.activeUpstreamId ?? state.coreId!;
    const id = uid("node");
    const node: BeliefNode = {
      id, text, notes, confidence,
      status: "pending", upstreamIds: [parent!],
      depth: 0, isCore: false, createdAt: now(), updatedAt: now()
    };
    const edge: BeliefEdge = { id: uid("edge"), sourceId: parent!, targetId: id, kind: "pending" };
    set({ nodes: { ...state.nodes, [id]: node }, edges: { ...state.edges, [edge.id]: edge } });
    if (state.mode === "SANDBOX") get().pushHistory();
    localStorage.setItem("belief-map", JSON.stringify(get()));
    return id;
  },

  setNodeResult: (id, status, tldr, explanation) => {
    const st = get();
    const node = st.nodes[id];
    if (!node) return;
    const updated: BeliefNode = { ...node, status, tldr, explanation, updatedAt: now() };

    // update edge kind for its primary upstream edge
    let edges = { ...st.edges };
    for (const e of Object.values(edges)) {
      if (e.targetId === id && e.sourceId === node.upstreamIds[0]) {
        e.kind = status === "protected" ? "coherent" : (status as any);
      }
    }

    const next: Partial<GraphState> = { nodes: { ...st.nodes, [id]: updated }, edges };

    // Professional blocking logic
    if (st.mode === "PROFESSIONAL") {
      if (status === "contradictory" || status === "harmful" || status === "incoherent") {
        next.blockedByNodeId = id;
      } else {
        if (st.blockedByNodeId === id) next.blockedByNodeId = null;
      }
    }

    set(next as any);
    localStorage.setItem("belief-map", JSON.stringify(get()));
  },

  selectActive: (id) => set({ activeUpstreamId: id }),

  setBlockedBy: (id) => set({ blockedByNodeId: id }),

  updateNodeNotesConfidence: (id, notes, confidence) => {
    const st = get();
    const node = st.nodes[id];
    if (!node) return;
    st.nodes[id] = { ...node, notes, confidence, updatedAt: now() };
    set({ nodes: { ...st.nodes } });
    localStorage.setItem("belief-map", JSON.stringify(get()));
  },

  pushHistory: () => {
    const st = get();
    if (st.mode !== "SANDBOX") return;
    const snap = JSON.stringify({ ...st, history: [] });
    const history = [...st.history, snap].slice(-50);
    set({ history });
  },

  undo: () => {
    const st = get();
    if (st.mode !== "SANDBOX" || st.history.length === 0) return;
    const last = st.history[st.history.length - 1];
    const parsed = JSON.parse(last) as GraphState;
    set({ ...parsed, history: st.history.slice(0, -1) });
    localStorage.setItem("belief-map", JSON.stringify(get()));
  },

  importState: (json) => {
    const parsed = JSON.parse(json) as GraphState;
    if (parsed.schemaVersion !== "v1" || !parsed.coreId) throw new Error("Invalid import");
    set(parsed);
    document.body.setAttribute("data-mode", parsed.mode);
    localStorage.setItem("belief-map", JSON.stringify(get()));
  }
}));
