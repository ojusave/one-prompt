import type { ExecutionEvent } from "@one-prompt/shared";
import type { Node, Edge } from "@xyflow/react";
import { getEventStatusAtTime } from "@/lib/playback/selectors";

export interface GraphNodeData {
  event: ExecutionEvent;
  displayStatus: ExecutionEvent["status"];
  [key: string]: unknown;
}

const NODE_WIDTH = 220;
const NODE_HEIGHT = 72;
const H_GAP = 80;
const V_GAP = 48;

function getLaneIndex(lane: string | undefined, lanes: Map<string, number>): number {
  const key = lane ?? "main";
  if (!lanes.has(key)) lanes.set(key, lanes.size);
  return lanes.get(key)!;
}

export function computeLayout(events: ExecutionEvent[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const lanes = new Map<string, number>();
  const ranks = new Map<string, number>();

  for (const event of events) {
    let rank = 0;
    for (const depId of event.dependencyIds) {
      const depRank = ranks.get(depId) ?? 0;
      rank = Math.max(rank, depRank + 1);
    }
    ranks.set(event.id, rank);
  }

  const byRank = new Map<number, ExecutionEvent[]>();
  for (const event of events) {
    const rank = ranks.get(event.id) ?? 0;
    if (!byRank.has(rank)) byRank.set(rank, []);
    byRank.get(rank)!.push(event);
  }

  for (const [rank, rankEvents] of byRank) {
    rankEvents.sort((a, b) => getLaneIndex(a.lane, lanes) - getLaneIndex(b.lane, lanes));
    for (const event of rankEvents) {
      const laneIdx = getLaneIndex(event.lane, lanes);
      positions.set(event.id, {
        x: rank * (NODE_WIDTH + H_GAP),
        y: laneIdx * (NODE_HEIGHT + V_GAP),
      });
    }
  }

  return positions;
}

export function deriveGraph(
  events: ExecutionEvent[],
  playheadMs: number
): { nodes: Node<GraphNodeData>[]; edges: Edge[] } {
  const positions = computeLayout(events);
  const visible = events.filter((e) => e.relativeStartMs <= playheadMs);

  const nodes: Node<GraphNodeData>[] = visible.map((event) => {
    const pos = positions.get(event.id) ?? { x: 0, y: 0 };
    return {
      id: event.id,
      type: "execution",
      position: pos,
      data: {
        event,
        displayStatus: getEventStatusAtTime(event, playheadMs),
      },
      draggable: false,
      selectable: true,
    };
  });

  const visibleIds = new Set(visible.map((e) => e.id));
  const edges: Edge[] = [];

  for (const event of visible) {
    for (const depId of event.dependencyIds) {
      if (!visibleIds.has(depId)) continue;
      const isActive =
        getEventStatusAtTime(event, playheadMs) === "running" ||
        getEventStatusAtTime(event, playheadMs) === "waiting";
      const isWaiting = getEventStatusAtTime(event, playheadMs) === "waiting";
      const isRetry = event.kind === "retry" || event.attempt > 1;

      edges.push({
        id: `${depId}-${event.id}`,
        source: depId,
        target: event.id,
        type: "execution",
        animated: isActive,
        style: {
          stroke: isWaiting ? "var(--waiting)" : "var(--border-default)",
          strokeDasharray: isWaiting ? "6 4" : undefined,
        },
        data: { isRetry },
      });
    }
  }

  return { nodes, edges };
}

export function getFingerprint(events: ExecutionEvent[]): string {
  const kinds = events.map((e) => e.kind[0]).join("");
  const retries = events.filter((e) => e.attempt > 1 || e.kind === "retry").length;
  const sideEffects = events.filter((e) => e.sideEffect?.occurred).length;
  return `${kinds.slice(0, 8)}·${events.length}a·${retries}r·${sideEffects}s`;
}
