import { EdgeKind, BeliefStatus } from "../types";

export function statusColor(kind: EdgeKind | BeliefStatus): string {
  switch (kind) {
    case "coherent": return "#059669";
    case "contradictory": return "#eab308";
    case "harmful": return "#dc2626";
    case "incoherent": return "#92400e";
    case "pending": return "#a1a1aa";
    case "protected": return "#1e40af";
    default: return "#9ca3af";
  }
}