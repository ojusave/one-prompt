import type { SceneBeat } from "../types";
import type { CameraKeyframe } from "../layout/camera-keyframes";
import { LATE_CAMERA } from "../layout/graph-layout";
import { LATE_DURATION } from "../types";

/**
 * Late failure scene beats (900 frames / 30s @ 30fps).
 */
export const lateFailureBeats: SceneBeat[] = [
  // Opening 0–29
  { id: "open-hold", startFrame: 0, endFrame: 29, action: "set-current-action", value: "" },

  // Prompt, plan, inspect 30–119 (faster)
  { id: "show-prompt", startFrame: 30, action: "show-node", target: "prompt" },
  { id: "run-prompt", startFrame: 31, action: "activate-node", target: "prompt" },
  {
    id: "action-receive",
    startFrame: 30,
    action: "set-current-action",
    value: "Receiving incident prompt: duplicate checkout orders on retries",
  },
  { id: "done-prompt", startFrame: 42, action: "complete-node", target: "prompt" },

  { id: "show-plan", startFrame: 45, action: "show-node", target: "plan" },
  { id: "run-plan", startFrame: 46, action: "activate-node", target: "plan" },
  {
    id: "action-plan",
    startFrame: 45,
    action: "set-current-action",
    value: "Building execution graph with retry-safe checkpoints",
  },
  { id: "done-plan", startFrame: 75, action: "complete-node", target: "plan" },

  { id: "show-inspect", startFrame: 78, action: "show-node", target: "inspectService" },
  { id: "run-inspect", startFrame: 79, action: "activate-node", target: "inspectService" },
  {
    id: "action-inspect",
    startFrame: 78,
    action: "set-current-action",
    value: "Tracing checkout entrypoint and order creation call chain",
  },
  { id: "done-inspect", startFrame: 110, action: "complete-node", target: "inspectService" },

  // Parallel 120–179
  { id: "show-search", startFrame: 120, action: "show-node", target: "searchRetry" },
  { id: "run-search", startFrame: 122, action: "activate-node", target: "searchRetry" },
  { id: "show-order", startFrame: 126, action: "show-node", target: "inspectOrder" },
  { id: "run-order", startFrame: 128, action: "activate-node", target: "inspectOrder" },
  { id: "show-tests", startFrame: 132, action: "show-node", target: "readTests" },
  { id: "run-tests-branch", startFrame: 134, action: "activate-node", target: "readTests" },
  {
    id: "action-parallel",
    startFrame: 120,
    action: "set-current-action",
    value: "Running 3 branches in parallel: retry policy, order writes, tests",
  },
  { id: "done-search", startFrame: 160, action: "complete-node", target: "searchRetry" },
  { id: "done-order", startFrame: 168, action: "complete-node", target: "inspectOrder" },
  { id: "done-tests-branch", startFrame: 175, action: "complete-node", target: "readTests" },

  // Hypothesis + reproduce 180–254
  { id: "show-hyp", startFrame: 180, action: "show-node", target: "hypothesis" },
  { id: "run-hyp", startFrame: 182, action: "activate-node", target: "hypothesis" },
  {
    id: "action-hyp",
    startFrame: 180,
    action: "set-current-action",
    value: "Connecting branch evidence: retries can replay a non-idempotent write",
  },
  { id: "done-hyp", startFrame: 205, action: "complete-node", target: "hypothesis" },

  { id: "show-repro", startFrame: 210, action: "show-node", target: "reproduce" },
  { id: "run-repro", startFrame: 212, action: "activate-node", target: "reproduce" },
  {
    id: "action-repro",
    startFrame: 210,
    action: "set-current-action",
    value: "Replaying same event ID twice to reproduce duplicate orders",
  },
  { id: "done-repro", startFrame: 245, action: "complete-node", target: "reproduce" },

  // Fix and tests 255–344
  { id: "show-propose", startFrame: 255, action: "show-node", target: "proposeFix" },
  { id: "run-propose", startFrame: 257, action: "activate-node", target: "proposeFix" },
  {
    id: "action-propose",
    startFrame: 255,
    action: "set-current-action",
    value: "Designing fix: idempotency key check before persisting order",
  },
  { id: "done-propose", startFrame: 280, action: "complete-node", target: "proposeFix" },

  { id: "show-patch", startFrame: 285, action: "show-node", target: "applyPatch" },
  { id: "run-patch", startFrame: 287, action: "activate-node", target: "applyPatch" },
  {
    id: "action-patch",
    startFrame: 285,
    action: "set-current-action",
    value: "Applying patch in checkout write path with guarded insert",
  },
  { id: "done-patch", startFrame: 310, action: "complete-node", target: "applyPatch" },

  { id: "show-runtests", startFrame: 315, action: "show-node", target: "runTests" },
  { id: "run-runtests", startFrame: 317, action: "activate-node", target: "runTests" },
  {
    id: "action-runtests",
    startFrame: 315,
    action: "set-current-action",
    value: "Running checkout + retry regression tests",
  },
  { id: "done-runtests", startFrame: 340, action: "complete-node", target: "runTests" },

  // Deploy 345–449
  { id: "show-deploy", startFrame: 345, action: "show-node", target: "deploy" },
  { id: "run-deploy", startFrame: 347, action: "activate-node", target: "deploy" },
  {
    id: "action-deploy",
    startFrame: 345,
    action: "set-current-action",
    value: "Deploying preview on Render and waiting for healthy startup",
  },
  { id: "done-deploy", startFrame: 430, action: "complete-node", target: "deploy" },

  // Checkpoint 450–479
  { id: "show-checkpoint", startFrame: 450, action: "show-node", target: "checkpoint" },
  { id: "run-checkpoint", startFrame: 452, action: "activate-node", target: "checkpoint" },
  {
    id: "action-checkpoint",
    startFrame: 450,
    action: "set-current-action",
    value: "Checkpointing completed work so retries start from verification only",
  },
  { id: "done-checkpoint", startFrame: 470, action: "complete-node", target: "checkpoint" },

  // Verify attempt 1 running 480–569
  { id: "show-verify1", startFrame: 480, action: "show-node", target: "verify1" },
  { id: "run-verify1", startFrame: 482, action: "activate-node", target: "verify1" },
  {
    id: "action-verify1",
    startFrame: 480,
    action: "set-current-action",
    value: "Attempt 1 verification: replaying request sequence against preview",
  },

  // Failure 570–629
  { id: "fail-verify1", startFrame: 570, action: "fail-node", target: "verify1" },
  {
    id: "action-fail",
    startFrame: 570,
    action: "set-current-action",
    value: "Verification failed: downstream notification dependency timed out",
  },
  {
    id: "msg-prior",
    startFrame: 580,
    endFrame: 629,
    action: "show-message",
    value: "Checkpoint holds prior work: no re-run of inspect, patch, or deploy",
  },

  // Retry only 630–674
  { id: "dim", startFrame: 630, action: "dim-completed" },
  { id: "show-retry", startFrame: 635, action: "show-node", target: "retry" },
  { id: "run-retry", startFrame: 637, action: "activate-node", target: "retry" },
  {
    id: "action-retry",
    startFrame: 630,
    action: "set-current-action",
    value: "Retrying only verification path from checkpoint state",
  },
  { id: "done-retry", startFrame: 665, action: "complete-node", target: "retry" },

  // Attempt 2 675–749
  { id: "show-verify2", startFrame: 675, action: "show-node", target: "verify2" },
  { id: "run-verify2", startFrame: 677, action: "activate-node", target: "verify2" },
  {
    id: "action-verify2",
    startFrame: 675,
    action: "set-current-action",
    value: "Attempt 2 verification: same inputs, stable one-order result",
  },
  { id: "done-verify2", startFrame: 735, action: "complete-node", target: "verify2" },

  // Restore 750–779
  { id: "restore", startFrame: 750, action: "restore-completed" },
  {
    id: "msg-no-repeat",
    startFrame: 750,
    endFrame: 809,
    action: "show-message",
    value: "Result: retry scope stays local, earlier completed work is untouched",
  },
  {
    id: "action-verified",
    startFrame: 750,
    action: "set-current-action",
    value: "Verification succeeded after scoped retry",
  },

  // Complete 780–809
  { id: "show-result", startFrame: 780, action: "show-node", target: "result" },
  { id: "run-result", startFrame: 782, action: "activate-node", target: "result" },
  {
    id: "action-complete",
    startFrame: 780,
    action: "set-current-action",
    target: "complete",
    value: "Investigation complete: late failure recovered without replaying side effects",
  },
  { id: "done-result", startFrame: 800, action: "complete-node", target: "result" },

  // Final 810–899
  { id: "summary", startFrame: 810, action: "show-summary" },
  {
    id: "final-action",
    startFrame: 810,
    action: "set-current-action",
    target: "complete",
    value: "One prompt, dynamic graph: only failed step retried, prior work preserved",
  },
];

export const lateCameraKeyframes: CameraKeyframe[] = [
  { frame: 0, pose: LATE_CAMERA.opening },
  { frame: 30, pose: LATE_CAMERA.start },
  { frame: 110, pose: LATE_CAMERA.start },
  { frame: 125, pose: LATE_CAMERA.parallel },
  { frame: 175, pose: LATE_CAMERA.parallel },
  { frame: 195, pose: LATE_CAMERA.analysis },
  { frame: 245, pose: LATE_CAMERA.analysis },
  { frame: 270, pose: LATE_CAMERA.fix },
  { frame: 340, pose: LATE_CAMERA.fix },
  { frame: 360, pose: LATE_CAMERA.deploy },
  { frame: 440, pose: LATE_CAMERA.deploy },
  { frame: 455, pose: LATE_CAMERA.checkpoint },
  { frame: 475, pose: LATE_CAMERA.checkpoint },
  { frame: 500, pose: LATE_CAMERA.failure },
  { frame: 620, pose: LATE_CAMERA.failure },
  { frame: 640, pose: LATE_CAMERA.retry },
  { frame: 760, pose: LATE_CAMERA.retry },
  { frame: 810, pose: LATE_CAMERA.overview },
  { frame: LATE_DURATION - 1, pose: LATE_CAMERA.overview },
];

export function assertLateBeatsInRange(beats: SceneBeat[] = lateFailureBeats): void {
  for (const b of beats) {
    if (b.startFrame < 0 || b.startFrame >= LATE_DURATION) {
      throw new Error(`Beat ${b.id} startFrame out of range: ${b.startFrame}`);
    }
    if (b.endFrame !== undefined && b.endFrame >= LATE_DURATION) {
      throw new Error(`Beat ${b.id} endFrame out of range: ${b.endFrame}`);
    }
  }
}
