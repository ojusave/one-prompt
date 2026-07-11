"use client";

import { useAppStore } from "@/lib/app/store";

interface ModeIndicatorProps {
  compact?: boolean;
}

export function ModeIndicator({ compact }: ModeIndicatorProps) {
  const mode = useAppStore((s) => s.mode);
  const isLive = mode === "live";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded border px-2.5 py-1 font-mono text-xs tabular-nums ${
        isLive
          ? "border-warning/40 bg-warning/10 text-warning"
          : "border-border-default bg-surface text-text-secondary"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isLive ? "bg-warning" : "bg-text-tertiary"}`}
      />
      {isLive ? "LIVE DEMO" : compact ? "REPLAY" : "RECORDED RUN"}
    </span>
  );
}
