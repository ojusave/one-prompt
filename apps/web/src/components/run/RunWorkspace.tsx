"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import type { TraceFixture } from "@one-prompt/shared";
import { usePlaybackStore } from "@/lib/playback/store";
import { usePlaybackClock } from "@/lib/playback/clock";
import {
  getTraceEndMs,
  findFailureEvent,
} from "@/lib/playback/selectors";
import { getPreservedWorkSummary } from "@/lib/playback/failure";
import { deriveMetrics } from "@/lib/metrics/derive";
import { RunHeader } from "./RunHeader";
import { ExecutionGraph } from "@/components/graph/ExecutionGraph";
import { ExecutionListAlt } from "@/components/graph/ExecutionListAlt";
import { ExecutionTimeline } from "@/components/timeline/ExecutionTimeline";
import { ActivityPanel } from "@/components/inspector/ActivityPanel";
import { RunCompletionSummary } from "./RunCompletionSummary";
import { FailureBanner } from "./FailureBanner";

interface RunWorkspaceProps {
  fixture: TraceFixture;
  autoplay?: boolean;
}

export function RunWorkspace({ fixture, autoplay }: RunWorkspaceProps) {
  const { run, events } = fixture;
  const playheadMs = usePlaybackStore((s) => s.playheadMs);
  const state = usePlaybackStore((s) => s.state);
  const selectedEventId = usePlaybackStore((s) => s.selectedEventId);
  const setTotalDuration = usePlaybackStore((s) => s.setTotalDuration);
  const play = usePlaybackStore((s) => s.play);
  const selectEvent = usePlaybackStore((s) => s.selectEvent);
  const setFailurePause = usePlaybackStore((s) => s.setFailurePause);
  const pause = usePlaybackStore((s) => s.pause);
  const [showFailureBanner, setShowFailureBanner] = useState(false);
  const [showListView, setShowListView] = useState(false);
  const failureHandled = useRef(false);

  usePlaybackClock();

  const metrics = deriveMetrics(events, playheadMs);
  const totalMs = getTraceEndMs(events);
  const isComplete = state === "completed";
  const failureEvent = findFailureEvent(events);

  useEffect(() => {
    setTotalDuration(totalMs);
    failureHandled.current = false;
    setShowFailureBanner(false);
    if (autoplay) {
      const t = setTimeout(() => play(), 800);
      return () => clearTimeout(t);
    }
  }, [totalMs, setTotalDuration, autoplay, play, run.id]);

  useEffect(() => {
    if (!failureEvent || failureHandled.current) return;

    const failureEnd = failureEvent.relativeStartMs + (failureEvent.durationMs ?? 0);
    if (playheadMs >= failureEnd - 30 && playheadMs <= failureEnd + 100) {
      failureHandled.current = true;
      if (state === "playing") pause();
      selectEvent(failureEvent.id);
      setShowFailureBanner(true);
      setFailurePause(Date.now() + 3000);
      const t = setTimeout(() => {
        setFailurePause(null);
        setShowFailureBanner(false);
        play();
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [playheadMs, failureEvent, state, pause, play, selectEvent, setFailurePause]);

  const handleSelect = useCallback(
    (id: string | null) => selectEvent(id),
    [selectEvent]
  );

  const preservedSummary = failureEvent
    ? getPreservedWorkSummary(events, playheadMs, failureEvent.id)
    : null;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <RunHeader run={run} metrics={metrics} compact showMorph />
      {showFailureBanner && failureEvent && preservedSummary && (
        <FailureBanner
          summary={preservedSummary}
          failedTitle={failureEvent.title}
          hasUnsafeSideEffect={
            Boolean(failureEvent.sideEffect?.occurred && !failureEvent.sideEffect.safeToRetry)
          }
        />
      )}
      <div className="flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-[7] border-r border-border-subtle">
          {showListView ? (
            <ExecutionListAlt
              events={events}
              playheadMs={playheadMs}
              selectedEventId={selectedEventId}
              onSelectEvent={handleSelect}
            />
          ) : (
            <ExecutionGraph
              events={events}
              playheadMs={playheadMs}
              selectedEventId={selectedEventId}
              onSelectEvent={handleSelect}
            />
          )}
          <button
            type="button"
            onClick={() => setShowListView((v) => !v)}
            className="absolute left-3 top-3 rounded border border-border-default bg-surface px-2 py-1 text-xs text-text-secondary hover:bg-surface-hover"
          >
            {showListView ? "Graph view" : "List view"}
          </button>
        </div>
        <div className="min-w-0 flex-[3] bg-surface">
          <ActivityPanel
            events={events}
            playheadMs={playheadMs}
            selectedEventId={selectedEventId}
            onSelectEvent={handleSelect}
          />
        </div>
      </div>
      <ExecutionTimeline events={events} playheadMs={playheadMs} />
      {isComplete && run.result && (
        <RunCompletionSummary result={run.result} runId={run.id} />
      )}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {showFailureBanner && "Step failed. Prior work remains."}
        {state === "completed" && "Run completed."}
      </div>
    </div>
  );
}
