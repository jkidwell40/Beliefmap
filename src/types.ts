export type BeliefStatus = "coherent" | "contradictory" | "harmful" | "incoherent" | "pending" | "protected";
export type EdgeKind = "coherent" | "contradictory" | "harmful" | "incoherent" | "pending";

export interface BeliefNode {
  id: string;
  text: string;
  notes?: string;
  confidence: number;   // 0–100
  status: BeliefStatus; // core is "protected"
  tldr?: string;
  explanation?: string;
  upstreamIds: string[]; // primary parent is upstreamIds[0]
  depth: number;         // derived
  position?: { x: number; y: number };
  isCore: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BeliefEdge {
  id: string;
  sourceId: string;
  targetId: string;
  kind: EdgeKind;
}

export interface GraphState {
  mode: "SANDBOX" | "PROFESSIONAL";
  nodes: Record<string, BeliefNode>;
  edges: Record<string, BeliefEdge>;
  coreId: string | null;
  activeUpstreamId: string | null;
  blockedByNodeId: string | null; // Professional: the flagged node blocking growth
  history: string[];              // Sandbox only
  schemaVersion: "v1";
}
