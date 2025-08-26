import React, { useMemo, useRef } from "react";
import ReactFlow, { Background, Controls, Node, Edge, MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import { useStore } from "../state/store";
import { circularPositions } from "../graph/layout";
import { statusColor } from "../graph/colors";

const RadialEdge = ({ id, sourceX, sourceY, targetX, targetY, data }: any) => {
  const path = `M ${sourceX},${sourceY} C ${sourceX},${(sourceY+targetY)/2} ${targetX},${(sourceY+targetY)/2} ${targetX},${targetY}`;
  return <g><path id={id} d={path} fill="none" stroke={data?.color ?? "#999"} strokeWidth={data?.strokeWidth ?? 2} /></g>;
};

const edgeTypes = { radial: RadialEdge as any };

export default function GraphCanvas() {
  const ref = useRef<HTMLDivElement>(null);
  const { nodes: N, edges: E, mode, coreId } = useStore();
  const selectActive = useStore(s => s.selectActive);

  const rf = useMemo(() => {
    const width = ref.current?.clientWidth ?? 1200;
    const height = ref.current?.clientHeight ?? 800;
    if (!coreId) return { nodes: [], edges: [] } as { nodes: Node[]; edges: Edge[] };

    const { pos } = circularPositions(useStore.getState(), width, height);

    const nodes: Node[] = Object.values(N).map(n => {
      const p = pos.get(n.id)!;
      return {
        id: n.id,
        data: { label: n.text, status: n.status, node: n },
        position: { x: p.x, y: p.y },
        draggable: !n.isCore && mode === "PROFESSIONAL",
        style: {
          padding: 6,
          borderRadius: 12,
          border: `2px solid ${n.isCore ? statusColor("protected") : statusColor(n.status)}`,
          background: "#fff",
          width: 260,
          transform: "translate(-50%, -50%)"
        }
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
  }, [N, E, mode, coreId]);

  const onNodeDragStop = (_: any, n: Node) => {
    selectActive(n.id);
  };

  return (
    <div ref={ref} className="absolute inset-0">
      <ReactFlow
        nodes={rf.nodes}
        edges={rf.edges}
        onNodeClick={(_, n) => selectActive(n.id)}
        onNodeDragStop={onNodeDragStop}
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
