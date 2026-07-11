"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  useReactFlow,
  ReactFlowProvider,
  type NodeTypes,
  type EdgeTypes,
  BaseEdge,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { ExecutionEvent } from "@one-prompt/shared";
import { deriveGraph } from "@/lib/graph/derive";
import { ExecutionNode } from "./ExecutionNode";

const nodeTypes: NodeTypes = { execution: ExecutionNode };

function ExecutionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  animated: _animated,
}: EdgeProps) {
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <BaseEdge
      id={id}
      path={path}
      style={{ strokeWidth: 1.5, ...style }}
      interactionWidth={20}
      markerEnd="url(#arrow)"
    />
  );
}

const edgeTypes: EdgeTypes = { execution: ExecutionEdge };

interface ExecutionGraphProps {
  events: ExecutionEvent[];
  playheadMs: number;
  selectedEventId: string | null;
  onSelectEvent: (id: string | null) => void;
}

function GraphInner({
  events,
  playheadMs,
  selectedEventId,
  onSelectEvent,
}: ExecutionGraphProps) {
  const { fitView } = useReactFlow();
  const { nodes, edges } = useMemo(
    () => deriveGraph(events, playheadMs),
    [events, playheadMs]
  );

  const nodesWithSelection = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        selected: n.id === selectedEventId,
      })),
    [nodes, selectedEventId]
  );

  const onFit = useCallback(() => {
    fitView({ padding: 0.2, duration: 300 });
  }, [fitView]);

  useEffect(() => {
    const onFit = () => fitView({ padding: 0.2, duration: 300 });
    document.addEventListener("one-prompt:fit-graph", onFit);
    return () => document.removeEventListener("one-prompt:fit-graph", onFit);
  }, [fitView]);

  useEffect(() => {
    if (nodes.length > 0) {
      const t = setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 100);
      return () => clearTimeout(t);
    }
  }, [nodes.length, fitView]);

  return (
    <div className="relative h-full w-full bg-background-subtle">
      <svg className="absolute h-0 w-0">
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--border-default)" />
          </marker>
        </defs>
      </svg>
      <ReactFlow
        nodes={nodesWithSelection}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={(_, node) => onSelectEvent(node.id)}
        onPaneClick={() => onSelectEvent(null)}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        proOptions={{ hideAttribution: true }}
        minZoom={0.3}
        maxZoom={1.5}
        fitView
      >
        <Background color="var(--border-subtle)" gap={24} size={1} />
      </ReactFlow>
      <button
        type="button"
        onClick={onFit}
        className="absolute bottom-3 right-3 rounded border border-border-default bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-hover"
      >
        Fit execution
      </button>
    </div>
  );
}

export function ExecutionGraph(props: ExecutionGraphProps) {
  return (
    <ReactFlowProvider>
      <GraphInner {...props} />
    </ReactFlowProvider>
  );
}
