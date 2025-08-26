import React, { useMemo, useRef } from "react";
import ReactFlow, { Background, Controls, Node, Edge, MarkerType, NodeProps } from "reactflow";
import "reactflow/dist/style.css";
import { useStore } from "../state/store";
import { circularPositions } from "../graph/layout";
import { statusColor } from "../graph/colors";
import { BeliefNode as BNode } from "../types";

const RadialEdge = ({ id, sourceX, sourceY, targetX, targetY, data }: any) => {
  const path = `M ${sourceX},${sourceY} C ${sourceX},${(sourceY+targetY)/2} ${targetX},${(sourceY+targetY)/2} ${targetX},${targetY}`;
  return <g><path id={id} d={path} fill="none" stroke={data?.color ?? "#999"} strokeWidth={data?.strokeWidth ?? 2} /></g>;
};

function Pill({ status }: { status: string }) {
  const bg = statusColor(status as any);
  return <span className="text-white text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: bg }}>{status}</span>;
}

function CoreNode({ data }: NodeProps<{ node: BNode }>) {
  return (
    <div className="bg-white shadow rounded-2xl border-2" style={{ borderColor: statusColor("protected"), width: 300 }}>
      <div className="px-3 py-2 text-xs uppercase tracking-wide text-zinc-600">Core Belief</div>
      <div className="px-4 pb-3 font-medium">{data.node.text}</div>
    </div>
  );
}

function BeliefNode({ data }: NodeProps<{ node: BNode }>) {
  const c = data.node;
  return (
    <div className="bg-white shadow rounded-2xl border-2" style={{ borderColor: statusColor(c.status), width: 300 }}>
      <div className="px-3 py-2 flex items-center justify-between">
        <Pill status={c.status} />
        <span className="text-xs text-zinc-500">Conf: {c.confidence}</span>
      </div>
      <div className="px-4 pb-3 font-medium">{c.text}</div>
      {c.tldr && <div className="px-4 pb-3 text-sm text-zinc-600">{c.tldr}</div>}
    </div>
  );
}

const edgeTypes = { radial: RadialEdge as any };
const nodeTypes = { coreNode: CoreNode as any, beliefNode: BeliefNode as any };

export default function GraphCanvas() {
  const ref = useRef<HTMLDivElement>(null);
  const state = useStore();
  const { nodes: N, edges: E, mode, coreId } = state;
  const selectActive = useStore(s => s.selectActive);

  const rf = useMemo(() => {
    const width = ref.current?.clientWidth ?? 1200;
    const height = ref.current?.clientHeight ?? 800;
    if (!coreId) return { nodes: [], edges: [] } as { nodes: Node[]; edges: Edge[] };

    const { pos } = circularPositions(state, width, height);

    const nodes: Node[] = Object.values(N).map(n => {
      const p = pos.get(n.id)!;
      return {
        id: n.id,
        type: n.isCore ? "coreNode" : "beliefNode",
        data: { node: n },
        position: { x: p.x, y: p.y },
        draggable: !n.isCore && mode === "PROFESSIONAL",
        style: { transform: "translate(-50%, -50%)" }
      };
    });

    const edges: Edge[] = Object.values(E).map(e => {
      const color = statusColor(e.kind);
      const strokeWidth = e.kind === "harmful" ? 2.5 : 2;
      return {
        id: e.id,
        source: e.sourceId,
        target: e.targetId,
        type: "radial",
        data: { color, strokeWidth },
        markerEnd: { type: MarkerType.ArrowClosed, color }
      };
    });

    return { nodes, edges };
  }, [N, E, mode, coreId, state]);

  const onNodeDragStop = (_: any, n: Node) => {
    selectActive(n.id);
  };

  return (
    <div ref={ref} className="absolute inset-0">
      {/* dev HUD */}
      <div className="absolute right-3 top-3 z-50 text-xs bg-white/80 rounded px-2 py-1 shadow">
        nodes: {rf.nodes.length} • edges: {rf.edges.length}
      </div>
      <ReactFlow
        nodes={rf.nodes}
        edges={rf.edges}
        onNodeClick={(_, n) => selectActive(n.id)}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={{ hideAttribution: true }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}