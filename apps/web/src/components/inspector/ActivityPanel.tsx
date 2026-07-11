"use client";

import type { ExecutionEvent } from "@one-prompt/shared";
import {
  getActivityFeed,
  getCurrentEvent,
} from "@/lib/playback/selectors";
import { getKindLabel, formatDuration } from "@/components/primitives/StatusBadge";
import { TaskInspector } from "./TaskInspector";

interface ActivityPanelProps {
  events: ExecutionEvent[];
  playheadMs: number;
  selectedEventId: string | null;
  onSelectEvent: (id: string | null) => void;
}

export function ActivityPanel({
  events,
  playheadMs,
  selectedEventId,
  onSelectEvent,
}: ActivityPanelProps) {
  const selected = selectedEventId
    ? events.find((e) => e.id === selectedEventId)
    : null;

  if (selected) {
    return (
      <TaskInspector
        event={selected}
        events={events}
        onClose={() => onSelectEvent(null)}
      />
    );
  }

  const current = getCurrentEvent(events, playheadMs);
  const feed = getActivityFeed(events, playheadMs);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border-subtle p-4">
        {current ? (
          <>
            <h2 className="activity-title text-xl font-medium text-text-primary">
              {current.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {current.description}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-text-tertiary">Type</dt>
                <dd className="font-mono">{getKindLabel(current.kind)}</dd>
              </div>
              <div>
                <dt className="text-text-tertiary">Attempt</dt>
                <dd className="tabular-nums">{current.attempt}</dd>
              </div>
              <div>
                <dt className="text-text-tertiary">Started</dt>
                <dd className="font-mono tabular-nums">
                  {formatDuration(current.relativeStartMs)}
                </dd>
              </div>
              {current.sideEffect && (
                <div>
                  <dt className="text-text-tertiary">Side effect</dt>
                  <dd>{current.sideEffect.type}</dd>
                </div>
              )}
            </dl>
          </>
        ) : (
          <p className="text-text-secondary">Waiting for execution to begin.</p>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-text-tertiary">
          Recent activity
        </h3>
        <ul className="space-y-2">
          {feed.map((event) => (
            <li key={event.id}>
              <button
                type="button"
                onClick={() => onSelectEvent(event.id)}
                className="w-full rounded px-2 py-1.5 text-left text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
              >
                {event.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
