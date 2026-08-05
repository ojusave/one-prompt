import { describe, expect, it } from "vitest";
import {
  cleanPathBeats,
  cleanCameraKeyframes,
  assertCleanBeatsInRange,
} from "../scenes/clean-path-scene";
import {
  lateFailureBeats,
  lateCameraKeyframes,
  assertLateBeatsInRange,
} from "../scenes/late-failure-scene";
import { deriveSceneState } from "../scenes/derive-scene";
import { cleanWorkflowGraph, lateFailureWorkflowGraph } from "@one-prompt/shared";
import { CLEAN_DURATION, LATE_DURATION } from "../types";

describe("clean scene timing", () => {
  it("keeps all beats within composition duration", () => {
    expect(() => assertCleanBeatsInRange()).not.toThrow();
  });

  it("holds final summary for at least 90 frames", () => {
    const summary = cleanPathBeats.find((b) => b.action === "show-summary");
    expect(summary).toBeDefined();
    expect(CLEAN_DURATION - (summary?.startFrame ?? 0)).toBeGreaterThanOrEqual(90);
  });

  it("shows clean summary only at the end", () => {
    const stateMid = deriveSceneState(
      400,
      cleanPathBeats,
      cleanWorkflowGraph.nodes,
      cleanCameraKeyframes
    );
    const stateEnd = deriveSceneState(
      779,
      cleanPathBeats,
      cleanWorkflowGraph.nodes,
      cleanCameraKeyframes
    );
    expect(stateMid.showSummary).toBe(false);
    expect(stateEnd.showSummary).toBe(true);
  });

  it("keeps the parallel investigation branch active around frame 210", () => {
    const state = deriveSceneState(
      210,
      cleanPathBeats,
      cleanWorkflowGraph.nodes,
      cleanCameraKeyframes
    );
    expect(state.nodeStates.inspectOrder).toBe("running");
    expect(state.nodeStates.searchRetry).toBe("running");
    expect(state.nodeStates.readTests).toBe("running");
  });
});

describe("late-failure scene timing", () => {
  it("keeps all beats within composition duration", () => {
    expect(() => assertLateBeatsInRange()).not.toThrow();
  });

  it("holds final summary for at least 90 frames", () => {
    const summary = lateFailureBeats.find((b) => b.action === "show-summary");
    expect(summary).toBeDefined();
    expect(LATE_DURATION - (summary?.startFrame ?? 0)).toBeGreaterThanOrEqual(90);
  });

  it("runs attempt one before it fails", () => {
    const running = deriveSceneState(
      520,
      lateFailureBeats,
      lateFailureWorkflowGraph.nodes,
      lateCameraKeyframes
    );
    const failed = deriveSceneState(
      600,
      lateFailureBeats,
      lateFailureWorkflowGraph.nodes,
      lateCameraKeyframes
    );
    expect(running.nodeStates.verify1).toBe("running");
    expect(failed.nodeStates.verify1).toBe("failed");
  });

  it("hides attempt two until after retry", () => {
    const beforeRetry = deriveSceneState(
      620,
      lateFailureBeats,
      lateFailureWorkflowGraph.nodes,
      lateCameraKeyframes
    );
    const afterRetry = deriveSceneState(
      705,
      lateFailureBeats,
      lateFailureWorkflowGraph.nodes,
      lateCameraKeyframes
    );
    expect(beforeRetry.nodeStates.verify2).toBe("hidden");
    expect(afterRetry.nodeStates.verify2).not.toBe("hidden");
  });

  it("restores completed work before the final frame", () => {
    const dimmed = deriveSceneState(
      650,
      lateFailureBeats,
      lateFailureWorkflowGraph.nodes,
      lateCameraKeyframes
    );
    const restored = deriveSceneState(
      760,
      lateFailureBeats,
      lateFailureWorkflowGraph.nodes,
      lateCameraKeyframes
    );
    expect(dimmed.dimCompleted).toBe(true);
    expect(restored.dimCompleted).toBe(false);
  });

  it("shows late summary only at the end", () => {
    const mid = deriveSceneState(
      500,
      lateFailureBeats,
      lateFailureWorkflowGraph.nodes,
      lateCameraKeyframes
    );
    const end = deriveSceneState(
      899,
      lateFailureBeats,
      lateFailureWorkflowGraph.nodes,
      lateCameraKeyframes
    );
    expect(mid.showSummary).toBe(false);
    expect(end.showSummary).toBe(true);
  });
});
