import type { ExecutionEvent } from "@one-prompt/shared";

export interface PreservedWorkSummary {
  completed: number;
  failed: number;
  sideEffectsToRepeat: number;
}

export function getPreservedWorkSummary(
  events: ExecutionEvent[],
  playheadMs: number,
  failedEventId?: string
): PreservedWorkSummary {
  const visible = events.filter((e) => {
    const end = e.relativeStartMs + (e.durationMs ?? 0);
    return end <= playheadMs && e.id !== failedEventId;
  });

  const completed = visible.filter(
    (e) => e.status === "succeeded" || e.status === "skipped"
  ).length;

  const failed = failedEventId ? 1 : 0;

  const sideEffectsToRepeat = visible.filter(
    (e) => e.sideEffect?.occurred && !e.sideEffect.safeToRetry
  ).length;

  return { completed, failed, sideEffectsToRepeat };
}

export function countCompletedSteps(events: ExecutionEvent[], beforeMs: number): number {
  return events.filter((e) => {
    const end = e.relativeStartMs + (e.durationMs ?? 0);
    return end <= beforeMs && e.status !== "failed";
  }).length;
}
