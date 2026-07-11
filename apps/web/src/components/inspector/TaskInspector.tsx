"use client";

import type { ExecutionEvent } from "@one-prompt/shared";
import { getKindLabel, formatDuration, StatusBadge } from "@/components/primitives/StatusBadge";
import { getEventStatusAtTime } from "@/lib/playback/selectors";
import { SideEffectDetails } from "./SideEffectDetails";

interface TaskInspectorProps {
  event: ExecutionEvent;
  events: ExecutionEvent[];
  onClose: () => void;
}

function JsonBlock({ label, data }: { label: string; data: unknown }) {
  if (data == null) return null;
  const text = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  const large = text.length > 400;

  return (
    <section className="border-b border-border-subtle p-4">
      <h3 className="mb-2 text-xs uppercase text-text-tertiary">{label}</h3>
      {large ? (
        <details className="text-sm">
          <summary className="cursor-pointer text-text-secondary">Show {label.toLowerCase()}</summary>
          <pre className="mt-2 overflow-x-auto rounded bg-background p-3 font-mono text-xs text-text-secondary">
            {text}
          </pre>
        </details>
      ) : (
        <pre className="overflow-x-auto rounded bg-background p-3 font-mono text-xs text-text-secondary">
          {text}
        </pre>
      )}
    </section>
  );
}

export function TaskInspector({ event, events, onClose }: TaskInspectorProps) {
  const deps = event.dependencyIds
    .map((id) => events.find((e) => e.id === id))
    .filter(Boolean) as ExecutionEvent[];

  const priorAttempts = events.filter(
    (e) => e.logicalTaskId === event.logicalTaskId && e.attempt < event.attempt
  );

  const displayStatus = getEventStatusAtTime(event, Infinity);
  const isSideEffect =
    event.kind === "side_effect" ||
    event.kind === "deployment" ||
    event.kind === "write" ||
    Boolean(event.sideEffect?.occurred);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex items-start justify-between border-b border-border-subtle p-4">
        <div>
          <h2 className="text-lg font-medium">{event.title}</h2>
          <p className="mt-1 text-sm text-text-secondary">{event.description}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-text-tertiary hover:text-text-primary"
        >
          Close
        </button>
      </div>

      <section className="border-b border-border-subtle p-4">
        <h3 className="mb-2 text-xs uppercase text-text-tertiary">Overview</h3>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-text-tertiary">Kind</dt>
            <dd className="font-mono">{getKindLabel(event.kind)}</dd>
          </div>
          <div>
            <dt className="text-text-tertiary">Status</dt>
            <dd>
              <StatusBadge status={displayStatus}>{displayStatus}</StatusBadge>
            </dd>
          </div>
          <div>
            <dt className="text-text-tertiary">Started</dt>
            <dd className="font-mono tabular-nums">{formatDuration(event.relativeStartMs)}</dd>
          </div>
          <div>
            <dt className="text-text-tertiary">Duration</dt>
            <dd className="font-mono tabular-nums">{formatDuration(event.durationMs)}</dd>
          </div>
          <div>
            <dt className="text-text-tertiary">Attempt</dt>
            <dd className="tabular-nums">
              {event.attempt}
              {event.maxAttempts ? ` / ${event.maxAttempts}` : ""}
            </dd>
          </div>
          {event.phase && (
            <div>
              <dt className="text-text-tertiary">Phase</dt>
              <dd>{event.phase}</dd>
            </div>
          )}
        </dl>
        {deps.length > 0 && (
          <div className="mt-3">
            <dt className="text-xs text-text-tertiary">Dependencies</dt>
            <dd className="mt-1 text-sm text-text-secondary">
              {deps.map((d) => d.title).join(", ")}
            </dd>
          </div>
        )}
      </section>

      <JsonBlock label="Input" data={event.input} />
      <JsonBlock label="Output" data={event.output} />

      {event.error && (
        <section className="border-b border-border-subtle p-4">
          <h3 className="mb-2 text-xs uppercase text-danger">Failure</h3>
          <p className="text-sm font-medium">{event.error.name}</p>
          <p className="mt-1 text-sm text-text-secondary">{event.error.message}</p>
          <p className="mt-2 text-xs text-text-tertiary">
            {event.error.retryable ? "Retryable" : "Not retryable"}
          </p>
          {event.error.stack && (
            <details className="mt-2 text-sm">
              <summary className="cursor-pointer text-text-tertiary">Stack trace</summary>
              <pre className="mt-2 overflow-x-auto font-mono text-xs text-text-tertiary">
                {event.error.stack}
              </pre>
            </details>
          )}
        </section>
      )}

      {(event.attempt > 1 || event.maxAttempts || priorAttempts.length > 0) && (
        <section className="border-b border-border-subtle p-4">
          <h3 className="mb-2 text-xs uppercase text-text-tertiary">Retry</h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-tertiary">Retryable</dt>
              <dd>{event.error?.retryable ?? "Yes"}</dd>
            </div>
            {event.maxAttempts && (
              <div className="flex justify-between">
                <dt className="text-text-tertiary">Policy</dt>
                <dd>Up to {event.maxAttempts} attempts</dd>
              </div>
            )}
            {priorAttempts.length > 0 && (
              <div>
                <dt className="text-text-tertiary">Prior attempts</dt>
                <dd className="mt-1 text-text-secondary">
                  {priorAttempts.map((a) => `${a.title} (${a.status})`).join("; ")}
                </dd>
              </div>
            )}
          </dl>
          {event.kind === "retry" && (
            <p className="mt-2 text-sm text-text-secondary">
              Retrying this step without restarting the investigation.
            </p>
          )}
        </section>
      )}

      {isSideEffect && event.sideEffect && (
        <section className="border-b border-border-subtle p-4">
          <h3 className="mb-2 text-xs uppercase text-warning">Side effects</h3>
          <p className="mb-3 text-sm text-text-secondary">
            This action has already changed external state.
          </p>
          <SideEffectDetails sideEffect={event.sideEffect} />
        </section>
      )}

      {event.model && (
        <section className="border-b border-border-subtle p-4">
          <h3 className="mb-2 text-xs uppercase text-text-tertiary">Model</h3>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            {event.model.model && (
              <div>
                <dt className="text-text-tertiary">Model</dt>
                <dd>{event.model.model}</dd>
              </div>
            )}
            {event.model.inputTokens != null && (
              <div>
                <dt className="text-text-tertiary">Input tokens</dt>
                <dd className="tabular-nums">{event.model.inputTokens}</dd>
              </div>
            )}
            {event.model.outputTokens != null && (
              <div>
                <dt className="text-text-tertiary">Output tokens</dt>
                <dd className="tabular-nums">{event.model.outputTokens}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {event.deployment && (
        <section className="border-b border-border-subtle p-4">
          <h3 className="mb-2 text-xs uppercase text-text-tertiary">Deployment</h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-tertiary">Provider</dt>
              <dd>{event.deployment.provider}</dd>
            </div>
            {event.deployment.service && (
              <div className="flex justify-between">
                <dt className="text-text-tertiary">Service</dt>
                <dd>{event.deployment.service}</dd>
              </div>
            )}
            {event.deployment.url && (
              <div>
                <dt className="text-text-tertiary">URL</dt>
                <dd className="font-mono text-xs">{event.deployment.url}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      <section className="p-4">
        <details className="text-sm">
          <summary className="cursor-pointer text-text-tertiary">View raw event</summary>
          <pre className="mt-2 overflow-x-auto rounded bg-background p-3 font-mono text-xs text-text-secondary">
            {JSON.stringify(event, null, 2)}
          </pre>
        </details>
        <p className="mt-2 font-mono text-xs text-text-tertiary">ID: {event.id}</p>
      </section>
    </div>
  );
}
