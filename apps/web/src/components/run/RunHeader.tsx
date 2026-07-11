"use client";

import Link from "next/link";
import type { ExecutionRun, RunMetrics } from "@one-prompt/shared";
import { usePlaybackStore } from "@/lib/playback/store";
import { ModeIndicator } from "@/components/app/ModeIndicator";
import { formatElapsed } from "@/components/primitives/StatusBadge";
import { RunMetrics as RunMetricsStrip } from "./RunMetrics";
import { PromptSurface } from "@/components/prompt/PromptSurface";

interface RunHeaderProps {
  run: ExecutionRun;
  metrics: RunMetrics;
  compact?: boolean;
  showMorph?: boolean;
}

export function RunHeader({
  run,
  metrics,
  compact = false,
  showMorph = false,
}: RunHeaderProps) {
  const state = usePlaybackStore((s) => s.state);
  const playheadMs = usePlaybackStore((s) => s.playheadMs);

  return (
    <header
      className={`border-b border-border-subtle bg-background ${
        compact ? "px-4 py-3" : "px-6 py-4"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {showMorph ? (
            <PromptSurface prompt={run.prompt} compact />
          ) : (
            <p
              className={`leading-snug text-text-primary ${
                compact ? "text-lg" : "text-xl"
              }`}
            >
              {run.prompt}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
            <span className="capitalize">{state === "completed" ? "completed" : state}</span>
            <ModeIndicator compact />
            <span className="font-mono tabular-nums">
              {formatElapsed(state === "idle" ? 0 : playheadMs)}
            </span>
            {metrics.activeTasks > 0 && (
              <span>{metrics.activeTasks} active</span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/compare?runs=demo-clean,demo-detour,demo-late-failure`}
            className="text-sm text-text-tertiary hover:text-text-primary"
          >
            Compare
          </Link>
        </div>
      </div>
      <RunMetricsStrip metrics={metrics} />
    </header>
  );
}
