import type { SceneBeat } from "../types";
import type { CameraKeyframe } from "../layout/camera-keyframes";
import { CLEAN_CAMERA } from "../layout/graph-layout";
import { CLEAN_DURATION } from "../types";

/**
 * Clean path scene beats (base timeline: 780 frames / 26s @ 30fps).
 * Final composition runtime is extended through timingScale in video props.
 */
export const cleanPathBeats: SceneBeat[] = [
  // Opening 0–29
  { id: "open-hold", startFrame: 0, endFrame: 29, action: "set-current-action", value: "" },

  // Prompt enters execution 30–59
  { id: "show-prompt", startFrame: 30, action: "show-node", target: "prompt" },
  { id: "run-prompt", startFrame: 32, action: "activate-node", target: "prompt" },
  {
    id: "action-receive",
    startFrame: 30,
    action: "set-current-action",
    value: "Receiving incident prompt: duplicate checkout orders on retries",
  },
  { id: "done-prompt", startFrame: 50, action: "complete-node", target: "prompt" },

  // Planning 60–119
  { id: "show-plan", startFrame: 60, action: "show-node", target: "plan" },
  { id: "run-plan", startFrame: 62, action: "activate-node", target: "plan" },
  {
    id: "action-plan",
    startFrame: 60,
    action: "set-current-action",
    value: "Building execution graph: inspect, branch, reproduce, patch, deploy, verify",
  },
  { id: "done-plan", startFrame: 110, action: "complete-node", target: "plan" },

  // Inspect 120–164
  { id: "show-inspect", startFrame: 120, action: "show-node", target: "inspectService" },
  { id: "run-inspect", startFrame: 122, action: "activate-node", target: "inspectService" },
  {
    id: "action-inspect",
    startFrame: 120,
    action: "set-current-action",
    value: "Tracing checkout entrypoint and order creation call chain",
  },
  { id: "done-inspect", startFrame: 155, action: "complete-node", target: "inspectService" },

  // Parallel 165–254
  { id: "show-search", startFrame: 165, action: "show-node", target: "searchRetry" },
  { id: "run-search", startFrame: 167, action: "activate-node", target: "searchRetry" },
  { id: "show-order", startFrame: 171, action: "show-node", target: "inspectOrder" },
  { id: "run-order", startFrame: 173, action: "activate-node", target: "inspectOrder" },
  { id: "show-tests", startFrame: 177, action: "show-node", target: "readTests" },
  { id: "run-tests-branch", startFrame: 179, action: "activate-node", target: "readTests" },
  {
    id: "action-parallel",
    startFrame: 165,
    action: "set-current-action",
    value: "Running 3 branches in parallel: retry policy, order writes, tests",
  },
  { id: "done-search", startFrame: 230, action: "complete-node", target: "searchRetry" },
  { id: "done-order", startFrame: 240, action: "complete-node", target: "inspectOrder" },
  { id: "done-tests-branch", startFrame: 248, action: "complete-node", target: "readTests" },

  // Convergence 255–299
  { id: "show-hyp", startFrame: 255, action: "show-node", target: "hypothesis" },
  { id: "run-hyp", startFrame: 257, action: "activate-node", target: "hypothesis" },
  {
    id: "action-hyp",
    startFrame: 255,
    action: "set-current-action",
    value: "Connecting branch evidence: retries can replay a non-idempotent write",
  },
  { id: "done-hyp", startFrame: 290, action: "complete-node", target: "hypothesis" },

  // Reproduce 300–359
  { id: "show-repro", startFrame: 300, action: "show-node", target: "reproduce" },
  { id: "run-repro", startFrame: 302, action: "activate-node", target: "reproduce" },
  {
    id: "action-repro",
    startFrame: 300,
    action: "set-current-action",
    value: "Replaying same event ID twice to reproduce duplicate orders",
  },
  { id: "done-repro", startFrame: 350, action: "complete-node", target: "reproduce" },

  // Design fix 360–404
  { id: "show-propose", startFrame: 360, action: "show-node", target: "proposeFix" },
  { id: "run-propose", startFrame: 362, action: "activate-node", target: "proposeFix" },
  {
    id: "action-propose",
    startFrame: 360,
    action: "set-current-action",
    value: "Designing fix: idempotency key check before persisting order",
  },
  { id: "done-propose", startFrame: 395, action: "complete-node", target: "proposeFix" },

  // Apply 405–449
  { id: "show-patch", startFrame: 405, action: "show-node", target: "applyPatch" },
  { id: "run-patch", startFrame: 407, action: "activate-node", target: "applyPatch" },
  {
    id: "action-patch",
    startFrame: 405,
    action: "set-current-action",
    value: "Applying patch in checkout write path with guarded insert",
  },
  { id: "done-patch", startFrame: 440, action: "complete-node", target: "applyPatch" },

  // Tests 450–509
  { id: "show-runtests", startFrame: 450, action: "show-node", target: "runTests" },
  { id: "run-runtests", startFrame: 452, action: "activate-node", target: "runTests" },
  {
    id: "action-runtests",
    startFrame: 450,
    action: "set-current-action",
    value: "Running checkout + retry regression tests",
  },
  { id: "done-runtests", startFrame: 500, action: "complete-node", target: "runTests" },

  // Deploy 510–599
  { id: "show-deploy", startFrame: 510, action: "show-node", target: "deploy" },
  { id: "run-deploy", startFrame: 512, action: "activate-node", target: "deploy" },
  {
    id: "action-deploy",
    startFrame: 510,
    action: "set-current-action",
    value: "Deploying preview on Render and waiting for healthy startup",
  },
  { id: "done-deploy", startFrame: 585, action: "complete-node", target: "deploy" },

  // Verify 600–659
  { id: "show-verify", startFrame: 600, action: "show-node", target: "verify" },
  { id: "run-verify", startFrame: 602, action: "activate-node", target: "verify" },
  {
    id: "action-verify",
    startFrame: 600,
    action: "set-current-action",
    value: "Verifying repeated requests: expect one order, not two",
  },
  { id: "done-verify", startFrame: 645, action: "complete-node", target: "verify" },

  // Complete 660–689
  { id: "show-result", startFrame: 660, action: "show-node", target: "result" },
  { id: "run-result", startFrame: 662, action: "activate-node", target: "result" },
  {
    id: "action-complete",
    startFrame: 660,
    action: "set-current-action",
    target: "complete",
    value: "Investigation complete: cause fixed and verified in preview",
  },
  { id: "done-result", startFrame: 680, action: "complete-node", target: "result" },

  // Final 690–779
  { id: "summary", startFrame: 690, action: "show-summary" },
  {
    id: "final-action",
    startFrame: 690,
    action: "set-current-action",
    target: "complete",
    value: "Investigation complete: one prompt produced a 14-step execution graph",
  },
];

export const cleanCameraKeyframes: CameraKeyframe[] = [
  { frame: 0, pose: CLEAN_CAMERA.opening },
  { frame: 30, pose: CLEAN_CAMERA.start },
  { frame: 160, pose: CLEAN_CAMERA.start },
  { frame: 175, pose: CLEAN_CAMERA.parallel },
  { frame: 250, pose: CLEAN_CAMERA.parallel },
  { frame: 270, pose: CLEAN_CAMERA.analysis },
  { frame: 350, pose: CLEAN_CAMERA.analysis },
  { frame: 380, pose: CLEAN_CAMERA.fix },
  { frame: 500, pose: CLEAN_CAMERA.fix },
  { frame: 520, pose: CLEAN_CAMERA.deploy },
  { frame: 590, pose: CLEAN_CAMERA.deploy },
  { frame: 610, pose: CLEAN_CAMERA.verify },
  { frame: 655, pose: CLEAN_CAMERA.verify },
  { frame: 690, pose: CLEAN_CAMERA.overview },
  { frame: CLEAN_DURATION - 1, pose: CLEAN_CAMERA.overview },
];

export function assertCleanBeatsInRange(beats: SceneBeat[] = cleanPathBeats): void {
  for (const b of beats) {
    if (b.startFrame < 0 || b.startFrame >= CLEAN_DURATION) {
      throw new Error(`Beat ${b.id} startFrame out of range: ${b.startFrame}`);
    }
    if (b.endFrame !== undefined && b.endFrame >= CLEAN_DURATION) {
      throw new Error(`Beat ${b.id} endFrame out of range: ${b.endFrame}`);
    }
  }
}
