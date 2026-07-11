export type RunSource = "replay" | "live" | "scripted-live";

export type RunStatus =
  | "created"
  | "queued"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export type EventStatus =
  | "queued"
  | "running"
  | "waiting"
  | "succeeded"
  | "failed"
  | "retrying"
  | "cancelled"
  | "skipped";

export type EventKind =
  | "prompt"
  | "plan"
  | "model"
  | "tool"
  | "search"
  | "task"
  | "test"
  | "wait"
  | "write"
  | "side_effect"
  | "deployment"
  | "checkpoint"
  | "retry"
  | "result";

export type SideEffectType =
  | "none"
  | "database"
  | "message"
  | "email"
  | "payment"
  | "deployment"
  | "repository"
  | "external_api";

export interface RunResult {
  status: "success" | "partial" | "failure";
  title: string;
  summary: string;
  cause?: string;
  fix?: string;
  verification?: string;
}

export interface ExecutionRun {
  id: string;
  label?: string;
  prompt: string;
  source: RunSource;
  status: RunStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  currentSequence: number;
  result?: RunResult;
  metadata?: Record<string, unknown>;
}

export interface ExecutionEvent {
  id: string;
  runId: string;
  sequence: number;
  parentId?: string;
  dependencyIds: string[];
  logicalTaskId: string;
  branchId?: string;
  lane?: string;
  phase?: string;
  kind: EventKind;
  status: EventStatus;
  title: string;
  description: string;
  relativeStartMs: number;
  durationMs?: number;
  attempt: number;
  maxAttempts?: number;
  input?: unknown;
  output?: unknown;
  error?: {
    name: string;
    message: string;
    retryable: boolean;
    stack?: string;
  };
  sideEffect?: {
    type: SideEffectType;
    occurred: boolean;
    safeToRetry: boolean;
    strategy?: string;
    idempotencyKey?: string;
    compensation?: string;
  };
  model?: {
    provider?: string;
    model?: string;
    inputTokens?: number;
    outputTokens?: number;
    estimatedCostUsd?: number;
  };
  tool?: {
    name: string;
    operation?: string;
  };
  deployment?: {
    provider: "render";
    service?: string;
    environment?: string;
    status?: string;
    url?: string;
  };
  layout?: {
    rank?: number;
    lane?: number;
    x?: number;
    y?: number;
  };
  metadata?: Record<string, unknown>;
}

export interface TraceFixture {
  run: ExecutionRun;
  events: ExecutionEvent[];
}

export interface RunMetrics {
  elapsedMs: number;
  totalActions: number;
  activeTasks: number;
  maxConcurrency: number;
  retries: number;
  sideEffects: number;
  modelCalls: number;
  toolCalls: number;
  waitTimeMs: number;
  inputTokens?: number;
  outputTokens?: number;
}

export interface RunSummary {
  run: ExecutionRun;
  metrics: RunMetrics;
}

export type PlaybackState = "idle" | "playing" | "paused" | "completed";

export type TraceId = "clean" | "detour" | "late-failure";

export const DEMO_TRACE_IDS: Record<TraceId, string> = {
  clean: "demo-clean",
  detour: "demo-detour",
  "late-failure": "demo-late-failure",
};

export const DEFAULT_PROMPT =
  "Investigate why retrying this checkout workflow sometimes creates duplicate orders. Find the cause, implement a safe fix, deploy a preview, and verify the behavior.";
