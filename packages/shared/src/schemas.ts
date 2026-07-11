import { z } from "zod";

export const runSourceSchema = z.enum(["replay", "live", "scripted-live"]);

export const runStatusSchema = z.enum([
  "created",
  "queued",
  "running",
  "paused",
  "completed",
  "failed",
  "cancelled",
]);

export const eventStatusSchema = z.enum([
  "queued",
  "running",
  "waiting",
  "succeeded",
  "failed",
  "retrying",
  "cancelled",
  "skipped",
]);

export const eventKindSchema = z.enum([
  "prompt",
  "plan",
  "model",
  "tool",
  "search",
  "task",
  "test",
  "wait",
  "write",
  "side_effect",
  "deployment",
  "checkpoint",
  "retry",
  "result",
]);

export const sideEffectTypeSchema = z.enum([
  "none",
  "database",
  "message",
  "email",
  "payment",
  "deployment",
  "repository",
  "external_api",
]);

export const runResultSchema = z.object({
  status: z.enum(["success", "partial", "failure"]),
  title: z.string(),
  summary: z.string(),
  cause: z.string().optional(),
  fix: z.string().optional(),
  verification: z.string().optional(),
});

export const executionRunSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  prompt: z.string(),
  source: runSourceSchema,
  status: runStatusSchema,
  createdAt: z.string(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  currentSequence: z.number().int().nonnegative(),
  result: runResultSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const executionEventSchema = z.object({
  id: z.string(),
  runId: z.string(),
  sequence: z.number().int().positive(),
  parentId: z.string().optional(),
  dependencyIds: z.array(z.string()),
  logicalTaskId: z.string(),
  branchId: z.string().optional(),
  lane: z.string().optional(),
  phase: z.string().optional(),
  kind: eventKindSchema,
  status: eventStatusSchema,
  title: z.string(),
  description: z.string(),
  relativeStartMs: z.number().nonnegative(),
  durationMs: z.number().nonnegative().optional(),
  attempt: z.number().int().positive(),
  maxAttempts: z.number().int().positive().optional(),
  input: z.unknown().optional(),
  output: z.unknown().optional(),
  error: z
    .object({
      name: z.string(),
      message: z.string(),
      retryable: z.boolean(),
      stack: z.string().optional(),
    })
    .optional(),
  sideEffect: z
    .object({
      type: sideEffectTypeSchema,
      occurred: z.boolean(),
      safeToRetry: z.boolean(),
      strategy: z.string().optional(),
      idempotencyKey: z.string().optional(),
      compensation: z.string().optional(),
    })
    .optional(),
  model: z
    .object({
      provider: z.string().optional(),
      model: z.string().optional(),
      inputTokens: z.number().optional(),
      outputTokens: z.number().optional(),
      estimatedCostUsd: z.number().optional(),
    })
    .optional(),
  tool: z
    .object({
      name: z.string(),
      operation: z.string().optional(),
    })
    .optional(),
  deployment: z
    .object({
      provider: z.literal("render"),
      service: z.string().optional(),
      environment: z.string().optional(),
      status: z.string().optional(),
      url: z.string().optional(),
    })
    .optional(),
  layout: z
    .object({
      rank: z.number().optional(),
      lane: z.number().optional(),
      x: z.number().optional(),
      y: z.number().optional(),
    })
    .optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const traceFixtureSchema = z.object({
  run: executionRunSchema,
  events: z.array(executionEventSchema).min(1),
});

export type TraceFixtureInput = z.infer<typeof traceFixtureSchema>;

export function validateTraceFixture(data: unknown): TraceFixtureInput {
  return traceFixtureSchema.parse(data);
}

export function validateTraceOrdering(events: TraceFixtureInput["events"]): void {
  const sequences = events.map((e) => e.sequence);
  const unique = new Set(sequences);
  if (unique.size !== sequences.length) {
    throw new Error("Duplicate event sequences detected");
  }

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    for (const depId of event.dependencyIds) {
      const dep = events.find((e) => e.id === depId);
      if (!dep) {
        throw new Error(`Event ${event.id} depends on missing event ${depId}`);
      }
      if (dep.sequence >= event.sequence) {
        throw new Error(
          `Event ${event.id} depends on ${depId} which has equal or later sequence`
        );
      }
    }
    if (event.parentId) {
      const parent = events.find((e) => e.id === event.parentId);
      if (!parent) {
        throw new Error(`Event ${event.id} has missing parent ${event.parentId}`);
      }
    }
  }
}
