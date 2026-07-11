import type { ExecutionEvent, TraceId } from "@one-prompt/shared";

export interface DivergencePoint {
  sequence: number;
  label: string;
  runIds: string[];
}

export function findFirstDivergence(
  fixtures: { runId: string; traceId: TraceId; events: ExecutionEvent[] }[]
): DivergencePoint | null {
  if (fixtures.length < 2) return null;

  const maxLen = Math.max(...fixtures.map((f) => f.events.length));

  for (let i = 0; i < maxLen; i++) {
    const titles = fixtures.map((f) => f.events[i]?.title ?? "—");
    const kinds = fixtures.map((f) => f.events[i]?.kind ?? "—");
    const unique = new Set(titles.map((t, idx) => `${kinds[idx]}:${t}`));
    if (unique.size > 1) {
      return {
        sequence: i + 1,
        label: titles[0] ?? "Divergence",
        runIds: fixtures.map((f) => f.runId),
      };
    }
  }
  return null;
}

export function getUniqueWork(
  events: ExecutionEvent[],
  otherEvents: ExecutionEvent[][]
): ExecutionEvent[] {
  const otherTitles = new Set(
    otherEvents.flat().map((e) => `${e.kind}:${e.title}`)
  );
  return events.filter((e) => !otherTitles.has(`${e.kind}:${e.title}`));
}
