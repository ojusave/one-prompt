import type { ExecutionEvent, EventStatus } from "@one-prompt/shared";

export function getVisibleEvents(
  events: ExecutionEvent[],
  playheadMs: number
): ExecutionEvent[] {
  return events.filter((event) => {
    const endMs = event.relativeStartMs + (event.durationMs ?? 0);
    return event.relativeStartMs <= playheadMs || endMs <= playheadMs;
  });
}

export function getEventStatusAtTime(
  event: ExecutionEvent,
  playheadMs: number
): EventStatus {
  if (event.status === "cancelled" || event.status === "skipped") {
    return event.status;
  }

  const start = event.relativeStartMs;
  const end = start + (event.durationMs ?? 0);

  if (playheadMs < start) return "queued";
  if (playheadMs >= end) {
    if (event.status === "failed") return "failed";
    if (event.status === "retrying") return "retrying";
    return "succeeded";
  }

  if (event.status === "waiting") return "waiting";
  if (event.status === "failed" && playheadMs >= start) return "failed";
  if (event.status === "retrying") return "retrying";
  return "running";
}

export function getActiveEvents(
  events: ExecutionEvent[],
  playheadMs: number
): ExecutionEvent[] {
  return events.filter((event) => {
    const status = getEventStatusAtTime(event, playheadMs);
    return status === "running" || status === "waiting" || status === "retrying";
  });
}

export function getCurrentEvent(
  events: ExecutionEvent[],
  playheadMs: number
): ExecutionEvent | null {
  const active = getActiveEvents(events, playheadMs);
  if (active.length > 0) {
    return active.sort((a, b) => b.sequence - a.sequence)[0];
  }

  const completed = events
    .filter((e) => e.relativeStartMs + (e.durationMs ?? 0) <= playheadMs)
    .sort((a, b) => b.sequence - a.sequence);

  return completed[0] ?? null;
}

export function getActivityFeed(
  events: ExecutionEvent[],
  playheadMs: number,
  limit = 12
): ExecutionEvent[] {
  return events
    .filter((e) => e.relativeStartMs <= playheadMs)
    .sort((a, b) => b.sequence - a.sequence)
    .slice(0, limit);
}

export function findFailureEvent(events: ExecutionEvent[]): ExecutionEvent | undefined {
  return events.find((e) => e.status === "failed");
}

export function findRetryEvent(events: ExecutionEvent[]): ExecutionEvent | undefined {
  return events.find((e) => e.kind === "retry" || e.status === "retrying");
}

export function getTraceEndMs(events: ExecutionEvent[]): number {
  return Math.max(
    ...events.map((e) => e.relativeStartMs + (e.durationMs ?? 0)),
    0
  );
}
