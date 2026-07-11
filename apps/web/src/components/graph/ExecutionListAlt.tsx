"use client";

import type { ExecutionEvent } from "@one-prompt/shared";
import { getKindLabel, formatDuration } from "@/components/primitives/StatusBadge";
import { getEventStatusAtTime } from "@/lib/playback/selectors";

interface ExecutionListAltProps {
  events: ExecutionEvent[];
  playheadMs: number;
  selectedEventId: string | null;
  onSelectEvent: (id: string | null) => void;
}

export function ExecutionListAlt({
  events,
  playheadMs,
  selectedEventId,
  onSelectEvent,
}: ExecutionListAltProps) {
  const visible = events.filter((e) => e.relativeStartMs <= playheadMs);

  return (
    <div className="h-full overflow-y-auto p-4" role="list" aria-label="Execution steps">
      <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-text-tertiary">
        Accessible execution list
      </h3>
      <ol className="space-y-2">
        {visible.map((event) => {
          const status = getEventStatusAtTime(event, playheadMs);
          return (
            <li key={event.id} role="listitem">
              <button
                type="button"
                onClick={() => onSelectEvent(event.id)}
                aria-pressed={selectedEventId === event.id}
                className={`w-full rounded border px-3 py-2 text-left text-sm transition-colors ${
                  selectedEventId === event.id
                    ? "border-accent bg-accent-soft"
                    : "border-border-subtle hover:bg-surface-hover"
                }`}
              >
                <span className="font-medium">{event.title}</span>
                <span className="mt-1 block font-mono text-xs text-text-tertiary">
                  {getKindLabel(event.kind)} · {status}
                  {event.attempt > 1 ? ` · attempt ${event.attempt}` : ""}
                  {event.durationMs ? ` · ${formatDuration(event.durationMs)}` : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
