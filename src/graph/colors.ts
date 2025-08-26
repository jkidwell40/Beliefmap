import { EdgeKind, BeliefStatus } from "../types";

export function statusColor(kind: EdgeKind | BeliefStatus): string {
  switch (kind) {
    case "coherent": return "#059669";       // emerald-600
    case "contradictory": return "#eab308";  // yellow-500
    case "harmful": return "#dc2626";        // red-600
    case "incoherent": return "#92400e";     // amber-800
    case "pending": return "#a1a1aa";        // zinc-400
    case "protected": return "#1e40af";      // blue-800
    default: return "#9ca3af";
  }
}
