import type { ExecutionEvent, RunMetrics } from "@one-prompt/shared";
import { getTraceEndMs } from "@/lib/playback/selectors";

export function deriveMetrics(
  events: ExecutionEvent[],
  playheadMs: number
): RunMetrics {
  const visible = events.filter((e) => e.relativeStartMs <= playheadMs);

  const activeAtPlayhead = events.filter((e) => {
    const start = e.relativeStartMs;
    const end = start + (e.durationMs ?? 0);
    return start <= playheadMs && playheadMs < end;
  });

  const retries = visible.filter(
    (e) => e.attempt > 1 || e.kind === "retry" || e.status === "failed"
  ).length;

  const sideEffects = visible.filter((e) => e.sideEffect?.occurred).length;
  const modelCalls = visible.filter((e) => e.kind === "model").length;
  const toolCalls = visible.filter(
    (e) => e.kind === "tool" || e.kind === "search"
  ).length;

  let maxConcurrency = 0;
  const checkpoints = [...new Set(events.map((e) => e.relativeStartMs))].sort(
    (a, b) => a - b
  );
  for (const t of checkpoints) {
    if (t > playheadMs) break;
    const concurrent = events.filter((e) => {
      const start = e.relativeStartMs;
      const end = start + (e.durationMs ?? 0);
      return start <= t && t < end;
    }).length;
    maxConcurrency = Math.max(maxConcurrency, concurrent);
  }

  const waitTimeMs = visible
    .filter((e) => e.kind === "wait")
    .reduce((sum, e) => sum + (e.durationMs ?? 0), 0);

  let inputTokens = 0;
  let outputTokens = 0;
  for (const e of visible) {
    if (e.model?.inputTokens) inputTokens += e.model.inputTokens;
    if (e.model?.outputTokens) outputTokens += e.model.outputTokens;
  }

  return {
    elapsedMs: playheadMs,
    totalActions: visible.length,
    activeTasks: activeAtPlayhead.length,
    maxConcurrency,
    retries,
    sideEffects,
    modelCalls,
    toolCalls,
    waitTimeMs,
    ...(inputTokens > 0 ? { inputTokens } : {}),
    ...(outputTokens > 0 ? { outputTokens } : {}),
  };
}

export function deriveCompletedMetrics(events: ExecutionEvent[]): RunMetrics {
  return deriveMetrics(events, getTraceEndMs(events));
}
