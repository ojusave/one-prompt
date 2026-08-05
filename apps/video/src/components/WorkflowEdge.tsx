import React from "react";
import { renderBrand } from "../brand/render-brand";
import { nodeAnchor, positionFor } from "../layout/graph-layout";
import type { EdgeVisual } from "../scenes/derive-scene";
import { NODE_HEIGHT, NODE_WIDTH } from "../types";

type Props = {
  edge: EdgeVisual;
  variant: "clean" | "late";
  dimmed: boolean;
};

/**
 * SVG connector between dependency and dependent nodes.
 */
export const WorkflowEdge: React.FC<Props> = ({ edge, variant, dimmed }) => {
  if (edge.visibleProgress <= 0) return null;

  let from = nodeAnchor(edge.from, "right", variant);
  let to = nodeAnchor(edge.to, "left", variant);

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const isDropEdge = edge.from === "verify1" && edge.to === "retry";
  const isRetryForwardEdge = edge.from === "retry" && edge.to === "verify2";

  if (isDropEdge) {
    const fromPos = positionFor(edge.from, variant);
    const toPos = positionFor(edge.to, variant);
    from = {
      x: fromPos.x + NODE_WIDTH / 2,
      y: fromPos.y + NODE_HEIGHT,
    };
    to = {
      x: toPos.x + NODE_WIDTH / 2,
      y: toPos.y,
    };
  }

  let d = "";
  if (isDropEdge) {
    d = `M ${from.x} ${from.y} L ${from.x} ${to.y}`;
  } else {
    const elbowX = from.x + Math.max(30, Math.min(62, Math.abs(dx) * 0.32));
    d = `M ${from.x} ${from.y} L ${elbowX} ${from.y} L ${elbowX} ${to.y} L ${to.x} ${to.y}`;
  }

  // Approximate path length for stroke dash animation
  const len = Math.sqrt(dx * dx + dy * dy) * 1.55;
  const drawn = len * edge.visibleProgress;

  const isDashed = edge.dashed;
  const color = isDashed ? renderBrand.warning : "rgba(255,255,255,0.44)";
  const isRetryPath = isDropEdge || isRetryForwardEdge;
  const opacity = dimmed && !isDashed ? 0.72 : 0.96;

  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={isRetryPath ? 3.6 : isDashed ? 3 : 2.8}
      strokeDasharray={isDashed ? "8 7" : `${drawn} ${len}`}
      strokeLinecap="round"
      opacity={opacity}
    />
  );
};
