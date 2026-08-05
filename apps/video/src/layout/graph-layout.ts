import type { CameraPose } from "../types";
import { NODE_HEIGHT, NODE_WIDTH } from "../types";

export const graphPositions: Record<string, { x: number; y: number }> = {
  prompt: { x: 40, y: 320 },
  plan: { x: 270, y: 320 },
  inspectService: { x: 500, y: 320 },

  searchRetry: { x: 730, y: 220 },
  inspectOrder: { x: 730, y: 340 },
  readTests: { x: 730, y: 460 },

  hypothesis: { x: 1000, y: 340 },
  reproduce: { x: 1180, y: 640 },
  proposeFix: { x: 1360, y: 640 },
  applyPatch: { x: 1540, y: 640 },
  runTests: { x: 1720, y: 640 },
  deploy: { x: 1900, y: 640 },

  verify: { x: 2080, y: 640 },
  result: { x: 2260, y: 640 },

  checkpoint: { x: 2080, y: 640 },
  verify1: { x: 2260, y: 460 },
  retry: { x: 2260, y: 810 },
  verify2: { x: 2440, y: 810 },
  resultLate: { x: 2620, y: 810 },
};

/** Center a focus x-coordinate in the 1920 graph viewport. */
function cam(focusX: number, scale: number, translateY = -20): CameraPose {
  const targetX = 960 - NODE_WIDTH / 2;
  return {
    translateX: targetX - focusX * scale,
    translateY,
    scale,
  };
}

export function positionFor(nodeId: string, variant: "clean" | "late"): { x: number; y: number } {
  if (variant === "late" && nodeId === "result") {
    return graphPositions.resultLate;
  }
  const pos = graphPositions[nodeId];
  if (!pos) {
    throw new Error(`Missing graph position for ${nodeId}`);
  }
  return pos;
}

export function nodeCenter(nodeId: string, variant: "clean" | "late"): { x: number; y: number } {
  const p = positionFor(nodeId, variant);
  return { x: p.x + NODE_WIDTH / 2, y: p.y + NODE_HEIGHT / 2 };
}

export function nodeAnchor(
  nodeId: string,
  side: "left" | "right",
  variant: "clean" | "late"
): { x: number; y: number } {
  const p = positionFor(nodeId, variant);
  return {
    x: side === "left" ? p.x : p.x + NODE_WIDTH,
    y: p.y + NODE_HEIGHT / 2,
  };
}

export const CLEAN_CAMERA: Record<string, CameraPose> = {
  opening: { translateX: 0, translateY: 0, scale: 1 },
  start: cam(240, 1.02, -80),
  parallel: cam(640, 1.0, -64),
  analysis: cam(900, 0.95, -58),
  fix: cam(1500, 0.92, -58),
  deploy: cam(1900, 0.9, -58),
  verify: cam(2100, 0.9, -58),
  overview: { translateX: 8, translateY: 4, scale: 0.76 },
};

export const LATE_CAMERA: Record<string, CameraPose> = {
  opening: { translateX: 0, translateY: 0, scale: 1 },
  start: cam(240, 1.02, -80),
  parallel: cam(640, 1.0, -64),
  analysis: cam(900, 0.95, -58),
  fix: cam(1500, 0.92, -58),
  deploy: cam(1900, 0.9, -58),
  checkpoint: cam(2100, 0.9, -58),
  failure: cam(2300, 0.88, -40),
  retry: cam(2500, 0.86, -30),
  overview: { translateX: -12, translateY: -6, scale: 0.67 },
};
