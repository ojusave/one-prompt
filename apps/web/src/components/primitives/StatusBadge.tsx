import type { ExecutionEvent, EventStatus } from "@one-prompt/shared";

const KIND_LABELS: Record<string, string> = {
  prompt: "PROMPT",
  plan: "PLAN",
  model: "MODEL",
  tool: "TOOL",
  search: "SEARCH",
  task: "TASK",
  test: "TEST",
  wait: "WAIT",
  write: "WRITE",
  side_effect: "SIDE EFFECT",
  deployment: "DEPLOYMENT",
  checkpoint: "CHECKPOINT",
  retry: "RETRY",
  result: "RESULT",
};

const STATUS_COLORS: Record<EventStatus, string> = {
  queued: "border-border-subtle text-text-tertiary",
  running: "border-accent text-text-primary",
  waiting: "border-waiting text-text-secondary",
  succeeded: "border-border-default text-text-secondary",
  failed: "border-danger text-text-primary",
  retrying: "border-warning text-text-primary",
  cancelled: "border-border-subtle text-text-tertiary",
  skipped: "border-border-subtle text-text-tertiary",
};

export function StatusBadge({
  status,
  children,
}: {
  status: EventStatus;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-xs uppercase ${STATUS_COLORS[status]}`}
    >
      {children}
    </span>
  );
}

export function formatDuration(ms: number | undefined): string {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
}

export function getKindLabel(kind: ExecutionEvent["kind"]): string {
  return KIND_LABELS[kind] ?? kind.toUpperCase();
}
