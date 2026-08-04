import type { SceneBeat } from "../types";
import type { NodeVisualState, CameraPose } from "../types";
import type { WorkflowVideoNode } from "@one-prompt/shared";
import { interpolateCamera, type CameraKeyframe } from "../layout/camera-keyframes";

export type EdgeVisual = {
  id: string;
  from: string;
  to: string;
  visibleProgress: number;
  dashed?: boolean;
  appearFrame: number;
};

export type DerivedSceneState = {
  nodeStates: Record<string, NodeVisualState>;
  nodeAppearFrame: Record<string, number>;
  nodeActivateFrame: Record<string, number>;
  nodeCompleteFrame: Record<string, number>;
  currentAction: string | null;
  actionLabel: string;
  message: string | null;
  showSummary: boolean;
  dimCompleted: boolean;
  camera: CameraPose;
  edges: EdgeVisual[];
};

function buildEdges(
  nodes: WorkflowVideoNode[],
  nodeAppearFrame: Record<string, number>
): EdgeVisual[] {
  const edges: EdgeVisual[] = [];
  for (const node of nodes) {
    for (const dep of node.dependencies) {
      const appear = nodeAppearFrame[node.id] ?? Number.POSITIVE_INFINITY;
      edges.push({
        id: `${dep}->${node.id}`,
        from: dep,
        to: node.id,
        visibleProgress: 0,
        dashed: node.type === "retry" || (node.attempt === 2 && dep === "retry") || node.id === "retry",
        appearFrame: Math.max(0, appear - 10),
      });
    }
  }
  return edges;
}

/**
 * Derive deterministic visual state from scene beats at a given frame.
 */
export function deriveSceneState(
  frame: number,
  beats: SceneBeat[],
  nodes: WorkflowVideoNode[],
  cameraKeyframes: CameraKeyframe[],
  timingScale = 1
): DerivedSceneState {
  const scaledFrame = frame / timingScale;

  const nodeStates: Record<string, NodeVisualState> = {};
  const nodeAppearFrame: Record<string, number> = {};
  const nodeActivateFrame: Record<string, number> = {};
  const nodeCompleteFrame: Record<string, number> = {};

  for (const n of nodes) {
    nodeStates[n.id] = "hidden";
  }

  let currentAction: string | null = null;
  let actionLabel = "CURRENT ACTION";
  let message: string | null = null;
  let showSummary = false;
  let dimCompleted = false;

  const ordered = [...beats].sort((a, b) => a.startFrame - b.startFrame);

  for (const beat of ordered) {
    if (beat.startFrame > scaledFrame) break;
    const active =
      beat.endFrame === undefined || scaledFrame <= beat.endFrame;

    switch (beat.action) {
      case "show-node":
        if (beat.target) {
          nodeAppearFrame[beat.target] = beat.startFrame;
          if (nodeStates[beat.target] === "hidden") {
            nodeStates[beat.target] = "entering";
          }
        }
        break;
      case "activate-node":
        if (beat.target) {
          nodeActivateFrame[beat.target] = beat.startFrame;
          nodeStates[beat.target] = "running";
          if (nodeAppearFrame[beat.target] === undefined) {
            nodeAppearFrame[beat.target] = beat.startFrame;
          }
        }
        break;
      case "complete-node":
        if (beat.target) {
          nodeCompleteFrame[beat.target] = beat.startFrame;
          nodeStates[beat.target] = "succeeded";
        }
        break;
      case "fail-node":
        if (beat.target) {
          nodeCompleteFrame[beat.target] = beat.startFrame;
          nodeStates[beat.target] = "failed";
        }
        break;
      case "set-current-action":
        if (active || beat.endFrame === undefined) {
          currentAction = beat.value ?? null;
          if (beat.target === "complete") {
            actionLabel = "WORKFLOW COMPLETE";
          } else {
            actionLabel = "CURRENT ACTION";
          }
        }
        break;
      case "dim-completed":
        dimCompleted = true;
        break;
      case "restore-completed":
        dimCompleted = false;
        break;
      case "show-message":
        if (active || beat.endFrame === undefined) {
          message = beat.value ?? null;
        }
        break;
      case "show-summary":
        showSummary = true;
        break;
      case "hide-summary":
        showSummary = false;
        break;
      default:
        break;
    }
  }

  // Entering → running/succeeded once past entrance window
  for (const n of nodes) {
    const appear = nodeAppearFrame[n.id];
    if (appear === undefined) continue;
    if (nodeStates[n.id] === "entering" && scaledFrame >= appear + 12) {
      if (nodeActivateFrame[n.id] !== undefined && scaledFrame >= nodeActivateFrame[n.id]) {
        nodeStates[n.id] = "running";
      } else if (nodeCompleteFrame[n.id] !== undefined) {
        nodeStates[n.id] = nodeStates[n.id];
      } else if (nodeActivateFrame[n.id] === undefined && nodeCompleteFrame[n.id] === undefined) {
        // shown but not yet activated: treat as entering until activate
        nodeStates[n.id] = "entering";
      }
    }
  }

  const edges = buildEdges(nodes, nodeAppearFrame).map((edge) => {
    const start = edge.appearFrame;
    const progress =
      scaledFrame < start
        ? 0
        : Math.min(1, (scaledFrame - start) / 10);
    return { ...edge, visibleProgress: progress };
  });

  return {
    nodeStates,
    nodeAppearFrame,
    nodeActivateFrame,
    nodeCompleteFrame,
    currentAction,
    actionLabel,
    message,
    showSummary,
    dimCompleted,
    camera: interpolateCamera(scaledFrame, cameraKeyframes),
    edges,
  };
}
