"use client";

import type { ExecutionEvent } from "@one-prompt/shared";
import { usePlaybackStore } from "@/lib/playback/store";
import { getTraceEndMs } from "@/lib/playback/selectors";
import { Button } from "@/components/primitives/Button";
import { formatElapsed } from "@/components/primitives/StatusBadge";

interface ExecutionTimelineProps {
  events: ExecutionEvent[];
  playheadMs: number;
}

export function ExecutionTimeline({ events, playheadMs }: ExecutionTimelineProps) {
  const totalMs = getTraceEndMs(events);
  const lanes = [...new Set(events.map((e) => e.lane ?? "main"))];
  const play = usePlaybackStore((s) => s.play);
  const pause = usePlaybackStore((s) => s.pause);
  const reset = usePlaybackStore((s) => s.reset);
  const seek = usePlaybackStore((s) => s.seek);
  const stepForward = usePlaybackStore((s) => s.stepForward);
  const stepBackward = usePlaybackStore((s) => s.stepBackward);
  const cycleRate = usePlaybackStore((s) => s.cycleRate);
  const state = usePlaybackStore((s) => s.state);
  const rate = usePlaybackStore((s) => s.rate);

  const pct = totalMs > 0 ? (playheadMs / totalMs) * 100 : 0;

  return (
    <div className="flex h-[180px] flex-col border-t border-border-subtle bg-surface">
      <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => (state === "playing" ? pause() : play())}
          aria-label={state === "playing" ? "Pause" : "Play"}
        >
          {state === "playing" ? "Pause" : "Play"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => reset()} aria-label="Replay">
          Replay
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => stepBackward(events)}
          aria-label="Previous event"
        >
          ←
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => stepForward(events)}
          aria-label="Next event"
        >
          →
        </Button>
        <Button size="sm" variant="ghost" onClick={cycleRate} aria-label="Playback speed">
          {rate}×
        </Button>
        <span className="ml-auto font-mono text-sm tabular-nums text-text-secondary">
          {formatElapsed(playheadMs)} / {formatElapsed(totalMs)}
        </span>
      </div>

      <div className="relative flex-1 overflow-hidden px-4 py-3">
        <div
          className="absolute top-0 bottom-0 z-10 w-px bg-accent"
          style={{ left: `calc(${pct}% + 16px)` }}
        />
        <input
          type="range"
          min={0}
          max={totalMs}
          value={playheadMs}
          onChange={(e) => seek(Number(e.target.value))}
          className="absolute inset-x-4 bottom-2 z-20 h-1 w-[calc(100%-32px)] cursor-pointer appearance-none bg-border-default accent-accent"
          aria-label="Scrub timeline"
        />
        <div className="flex h-full flex-col gap-1">
          {lanes.map((lane) => (
            <div key={lane} className="relative flex-1">
              <span className="absolute -left-0 font-mono text-xs text-text-tertiary">
                {lane}
              </span>
              {events
                .filter((e) => (e.lane ?? "main") === lane)
                .map((event) => {
                  const left = (event.relativeStartMs / totalMs) * 100;
                  const width = ((event.durationMs ?? 500) / totalMs) * 100;
                  const isActive =
                    playheadMs >= event.relativeStartMs &&
                    playheadMs < event.relativeStartMs + (event.durationMs ?? 0);
                  const isFailed = event.status === "failed";
                  return (
                    <div
                      key={event.id}
                      className={`absolute top-1 h-5 rounded-sm ${
                        isFailed
                          ? "bg-danger/40"
                          : isActive
                            ? "bg-accent/50"
                            : "bg-surface-raised"
                      } border border-border-subtle`}
                      style={{
                        left: `${left}%`,
                        width: `${Math.max(width, 0.5)}%`,
                      }}
                      title={event.title}
                    />
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
