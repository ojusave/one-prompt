import type { CameraPose } from "../types";
import { NODE_HEIGHT, NODE_WIDTH } from "../types";

export const graphPositions: Record<string, { x: number; y: number }> = {
  prompt: { x: 80, y: 400 },
  plan: { x: 370, y: 400 },
  inspectService: { x: 660, y: 400 },

  searchRetry: { x: 960, y: 170 },
  inspectOrder: { x: 960, y: 400 },
  readTests: { x: 960, y: 630 },

  hypothesis: { x: 1260, y: 400 },
  reproduce: { x: 1550, y: 400 },
  proposeFix: { x: 1840, y: 400 },
  applyPatch: { x: 2130, y: 400 },
  runTests: { x: 2420, y: 400 },
  deploy: { x: 2710, y: 400 },

  verify: { x: 3000, y: 400 },
  result: { x: 3290, y: 400 },

  checkpoint: { x: 3000, y: 400 },
  verify1: { x: 3290, y: 280 },
  retry: { x: 3580, y: 480 },
  verify2: { x: 3870, y: 480 },
  resultLate: { x: 4160, y: 480 },
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
  start: cam(400, 1.0, -30),
  parallel: cam(960, 0.92, -10),
  analysis: cam(1400, 0.88, -10),
  fix: cam(2000, 0.85, -10),
  deploy: cam(2710, 0.88, -10),
  verify: cam(3100, 0.88, -10),
  // Full clean graph ~80..3540
  overview: { translateX: 80, translateY: 60, scale: 0.48 },
};

export const LATE_CAMERA: Record<string, CameraPose> = {
  opening: { translateX: 0, translateY: 0, scale: 1 },
  start: cam(400, 1.0, -30),
  parallel: cam(960, 0.92, -10),
  analysis: cam(1400, 0.88, -10),
  fix: cam(2000, 0.85, -10),
  deploy: cam(2710, 0.88, -10),
  checkpoint: cam(3000, 0.86, -10),
  failure: cam(3290, 0.88, 20),
  retry: cam(3720, 0.82, 40),
  // Late graph extends to ~4410
  overview: { translateX: 40, translateY: 50, scale: 0.4 },
};
