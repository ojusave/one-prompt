import React from "react";
import type { WorkflowVideoNode } from "@one-prompt/shared";
import type { DerivedSceneState } from "../scenes/derive-scene";
import { WorkflowNode } from "./WorkflowNode";
import { WorkflowEdge } from "./WorkflowEdge";

type Props = {
  nodes: WorkflowVideoNode[];
  state: DerivedSceneState;
  frame: number;
  variant: "clean" | "late";
};

/**
 * Camera-transformed workflow graph (nodes + edges).
 */
export const WorkflowGraph: React.FC<Props> = ({
  nodes,
  state,
  frame,
  variant,
}) => {
  const { camera } = state;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 190,
        width: 1920,
        height: 760,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: 4800,
          height: 900,
          transform: `translate(${camera.translateX}px, ${camera.translateY}px) scale(${camera.scale})`,
          transformOrigin: "0 0",
          position: "relative",
        }}
      >
        <svg
          width={4800}
          height={900}
          style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
        >
          {state.edges.map((edge) => (
            <WorkflowEdge
              key={edge.id}
              edge={edge}
              variant={variant}
              dimmed={state.dimCompleted}
            />
          ))}
        </svg>
        {nodes.map((node) => (
          <WorkflowNode
            key={node.id}
            node={node}
            state={state.nodeStates[node.id] ?? "hidden"}
            appearFrame={state.nodeAppearFrame[node.id] ?? frame}
            frame={frame}
            variant={variant}
            dimmed={state.dimCompleted}
          />
        ))}
      </div>
    </div>
  );
};
