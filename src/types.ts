export type BeliefStatus = "coherent" | "contradictory" | "harmful" | "incoherent" | "pending" | "protected";
export type EdgeKind = "coherent" | "contradictory" | "harmful" | "incoherent" | "pending";

export interface BeliefNode {
  id: string;
  text: string;
  notes?: string;
  confidence: number;
  status: BeliefStatus;
  tldr?: string;
  explanation?: string;
  upstreamIds: string[];
  depth: number;
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
  blockedByNodeId: string | null;
  history: string[];
  schemaVersion: "v1";
}