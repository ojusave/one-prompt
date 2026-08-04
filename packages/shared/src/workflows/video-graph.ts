/**
 * Pure workflow graph definitions for Remotion and integrity tests.
 * Structure mirrors demo-clean / demo-late-failure fixtures.
 * No React, Next.js, Zustand, or React Flow.
 */

export type WorkflowVideoLane =
  | "main"
  | "branch-top"
  | "branch-middle"
  | "branch-bottom"
  | "retry";

export type WorkflowVideoNodeType =
  | "prompt"
  | "plan"
  | "investigation"
  | "analysis"
  | "test"
  | "write"
  | "deployment"
  | "checkpoint"
  | "retry"
  | "result";

export type WorkflowVideoNode = {
  id: string;
  title: string;
  dependencies: string[];
  lane: WorkflowVideoLane;
  type: WorkflowVideoNodeType;
  attempt?: number;
  finalState: "succeeded" | "failed";
  /** Event id in the shared fixture, when 1:1 */
  fixtureEventId?: string;
};

export type WorkflowVideoGraph = {
  id: "clean" | "late-failure";
  nodes: WorkflowVideoNode[];
};

/** Approved presentation labels for video nodes. */
export const VIDEO_TASK_LABELS = {
  prompt: "Prompt received",
  plan: "Map investigation steps",
  inspectService: "Inspect checkout flow",
  searchRetry: "Check retry configuration",
  inspectOrder: "Trace order creation path",
  readTests: "Review checkout tests",
  hypothesis: "Form root-cause hypothesis",
  reproduce: "Reproduce duplicate order",
  proposeFix: "Design idempotency fix",
  applyPatch: "Apply checkout patch",
  runTests: "Run regression tests",
  deploy: "Deploy preview on Render",
  verify: "Verify one-order outcome",
  checkpoint: "Save completed work",
  retry: "Retry failed verification",
  result: "Investigation complete",
} as const;

const CLEAN_CORE: WorkflowVideoNode[] = [
  {
    id: "prompt",
    title: VIDEO_TASK_LABELS.prompt,
    dependencies: [],
    lane: "main",
    type: "prompt",
    finalState: "succeeded",
    fixtureEventId: "evt-prompt",
  },
  {
    id: "plan",
    title: VIDEO_TASK_LABELS.plan,
    dependencies: ["prompt"],
    lane: "main",
    type: "plan",
    finalState: "succeeded",
    fixtureEventId: "evt-plan",
  },
  {
    id: "inspectService",
    title: VIDEO_TASK_LABELS.inspectService,
    dependencies: ["plan"],
    lane: "main",
    type: "investigation",
    finalState: "succeeded",
    fixtureEventId: "evt-inspect-service",
  },
  {
    id: "searchRetry",
    title: VIDEO_TASK_LABELS.searchRetry,
    dependencies: ["inspectService"],
    lane: "branch-top",
    type: "investigation",
    finalState: "succeeded",
    fixtureEventId: "evt-search-retry",
  },
  {
    id: "inspectOrder",
    title: VIDEO_TASK_LABELS.inspectOrder,
    dependencies: ["inspectService"],
    lane: "branch-middle",
    type: "investigation",
    finalState: "succeeded",
    fixtureEventId: "evt-inspect-order",
  },
  {
    id: "readTests",
    title: VIDEO_TASK_LABELS.readTests,
    dependencies: ["inspectService"],
    lane: "branch-bottom",
    type: "investigation",
    finalState: "succeeded",
    fixtureEventId: "evt-inspect-tests",
  },
  {
    id: "hypothesis",
    title: VIDEO_TASK_LABELS.hypothesis,
    dependencies: ["searchRetry", "inspectOrder", "readTests"],
    lane: "main",
    type: "analysis",
    finalState: "succeeded",
    fixtureEventId: "evt-hypothesis",
  },
  {
    id: "reproduce",
    title: VIDEO_TASK_LABELS.reproduce,
    dependencies: ["hypothesis"],
    lane: "main",
    type: "test",
    finalState: "succeeded",
    fixtureEventId: "evt-reproduce",
  },
  {
    id: "proposeFix",
    title: VIDEO_TASK_LABELS.proposeFix,
    dependencies: ["reproduce"],
    lane: "main",
    type: "analysis",
    finalState: "succeeded",
    fixtureEventId: "evt-propose-fix",
  },
  {
    id: "applyPatch",
    title: VIDEO_TASK_LABELS.applyPatch,
    dependencies: ["proposeFix"],
    lane: "main",
    type: "write",
    finalState: "succeeded",
    fixtureEventId: "evt-apply-patch",
  },
  {
    id: "runTests",
    title: VIDEO_TASK_LABELS.runTests,
    dependencies: ["applyPatch"],
    lane: "main",
    type: "test",
    finalState: "succeeded",
    fixtureEventId: "evt-run-tests",
  },
  {
    id: "deploy",
    title: VIDEO_TASK_LABELS.deploy,
    dependencies: ["runTests"],
    lane: "main",
    type: "deployment",
    finalState: "succeeded",
    fixtureEventId: "evt-deploy",
  },
];

export const cleanWorkflowGraph: WorkflowVideoGraph = {
  id: "clean",
  nodes: [
    ...CLEAN_CORE,
    {
      id: "verify",
      title: VIDEO_TASK_LABELS.verify,
      dependencies: ["deploy"],
      lane: "main",
      type: "test",
      attempt: 1,
      finalState: "succeeded",
      fixtureEventId: "evt-verify",
    },
    {
      id: "result",
      title: VIDEO_TASK_LABELS.result,
      dependencies: ["verify"],
      lane: "main",
      type: "result",
      finalState: "succeeded",
      fixtureEventId: "evt-result",
    },
  ],
};

export const lateFailureWorkflowGraph: WorkflowVideoGraph = {
  id: "late-failure",
  nodes: [
    ...CLEAN_CORE,
    {
      id: "checkpoint",
      title: VIDEO_TASK_LABELS.checkpoint,
      dependencies: ["deploy"],
      lane: "main",
      type: "checkpoint",
      finalState: "succeeded",
      fixtureEventId: "evt-checkpoint",
    },
    {
      id: "verify1",
      title: VIDEO_TASK_LABELS.verify,
      dependencies: ["checkpoint"],
      lane: "main",
      type: "test",
      attempt: 1,
      finalState: "failed",
      fixtureEventId: "evt-verify-1",
    },
    {
      id: "retry",
      title: VIDEO_TASK_LABELS.retry,
      dependencies: ["verify1"],
      lane: "retry",
      type: "retry",
      finalState: "succeeded",
      fixtureEventId: "evt-retry-marker",
    },
    {
      id: "verify2",
      title: VIDEO_TASK_LABELS.verify,
      dependencies: ["retry"],
      lane: "retry",
      type: "test",
      attempt: 2,
      finalState: "succeeded",
      fixtureEventId: "evt-verify-2",
    },
    {
      id: "result",
      title: VIDEO_TASK_LABELS.result,
      dependencies: ["verify2"],
      lane: "retry",
      type: "result",
      finalState: "succeeded",
      fixtureEventId: "evt-result",
    },
  ],
};

export const PARALLEL_INVESTIGATION_IDS = [
  "searchRetry",
  "inspectOrder",
  "readTests",
] as const;

export const PRE_CHECKPOINT_NODE_IDS = CLEAN_CORE.map((n) => n.id);
