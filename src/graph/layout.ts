import { hierarchy, cluster } from "d3-hierarchy";
import { BeliefNode, GraphState } from "../types";

type HNode = { id: string; ref: BeliefNode; children: HNode[] };

export function toHierarchy(state: GraphState): HNode {
  if (!state.coreId) throw new Error("No core");
  const childrenMap: Record<string, string[]> = {};
  Object.values(state.nodes).forEach(n => { childrenMap[n.id] = []; });
  Object.values(state.nodes).forEach(n => {
    if (n.isCore) return;
    const p = n.upstreamIds[0] ?? state.coreId!;
    childrenMap[p].push(n.id);
  });
  const build = (id: string): HNode => ({
    id,
    ref: state.nodes[id],
    children: (childrenMap[id] || []).map(build)
  });
  return build(state.coreId);
}

export function circularPositions(state: GraphState, width: number, height: number) {
  const root = toHierarchy(state);
  const h = hierarchy(root, d => d.children);
  const maxDepth = Math.max(0, ...h.descendants().map(d => d.depth));
  const maxRadius = Math.min(width, height) * 0.46;
  const r0 = 40;
  const rStep = Math.max(60, (maxRadius - r0) / Math.max(1, maxDepth));

  h.each(d => { (d as any).radius = r0 + d.depth * rStep; });
  const cl = cluster<{radius:number}>().size([Math.PI*2, maxRadius]);
  cl(h as any);

  const map = new Map<string, { x: number; y: number; depth: number; radius: number; theta: number }>();
  h.each(d => {
    const theta = (d.x ?? 0); 
    const radius = (d as any).radius;
    const x = Math.cos(theta - Math.PI/2) * radius;
    const y = Math.sin(theta - Math.PI/2) * radius;
    map.set(d.data.id, { x, y, depth: d.depth, radius, theta });
  });
  return { pos: map, r0, rStep };
}
