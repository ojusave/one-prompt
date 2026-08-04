import React from "react";
import { renderBrand } from "../brand/render-brand";
import { nodeAnchor } from "../layout/graph-layout";
import type { EdgeVisual } from "../scenes/derive-scene";

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

  const from = nodeAnchor(edge.from, "right", variant);
  const to = nodeAnchor(edge.to, "left", variant);

  const midX = (from.x + to.x) / 2;
  const d = `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;

  // Approximate path length for stroke dash animation
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy) * 1.15;
  const drawn = len * edge.visibleProgress;

  const isDashed = edge.dashed;
  const color = isDashed ? renderBrand.warning : renderBrand.borderStrong;
  const opacity = dimmed && !isDashed ? 0.3 : 0.8;

  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={isDashed ? 2.5 : 2}
      strokeDasharray={isDashed ? "8 7" : `${drawn} ${len}`}
      strokeLinecap="round"
      opacity={opacity}
    />
  );
};
