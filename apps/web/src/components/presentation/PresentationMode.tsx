"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { usePlaybackStore } from "@/lib/playback/store";
import { useAppStore } from "@/lib/app/store";
import { DEMO_TRACE_IDS } from "@one-prompt/shared";
import { getTraceByRunId } from "@/lib/traces/fixtures";

export function PresentationMode() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showHelp, setShowHelp] = useState(false);
  const play = usePlaybackStore((s) => s.play);
  const pause = usePlaybackStore((s) => s.pause);
  const reset = usePlaybackStore((s) => s.reset);
  const stepForward = usePlaybackStore((s) => s.stepForward);
  const stepBackward = usePlaybackStore((s) => s.stepBackward);
  const state = usePlaybackStore((s) => s.state);
  const setMode = useAppStore((s) => s.setMode);

  const getRunEvents = useCallback(() => {
    const match = pathname.match(/\/runs\/([^/]+)/);
    if (!match) return [];
    const fixture = getTraceByRunId(match[1]);
    return fixture?.events ?? [];
  }, [pathname]);

  const navigateTrace = useCallback(
    (trace: "clean" | "detour" | "late-failure") => {
      const id = DEMO_TRACE_IDS[trace];
      const params = new URLSearchParams(searchParams.toString());
      params.set("present", "1");
      params.set("autoplay", "1");
      router.push(`/runs/${id}?${params.toString()}`);
    },
    [router, searchParams]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const events = getRunEvents();

      switch (e.key) {
        case " ":
          e.preventDefault();
          if (state === "playing") pause();
          else play();
          break;
        case "r":
        case "R":
          if (e.shiftKey) {
            setMode("replay");
            navigateTrace("late-failure");
          } else {
            reset();
            play();
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (events.length) stepBackward(events);
          break;
        case "ArrowRight":
          e.preventDefault();
          if (events.length) stepForward(events);
          break;
        case "0":
          document.dispatchEvent(new CustomEvent("one-prompt:fit-graph"));
          break;
        case "1":
          navigateTrace("clean");
          break;
        case "2":
          navigateTrace("detour");
          break;
        case "3":
          navigateTrace("late-failure");
          break;
        case "c":
        case "C":
          router.push("/compare?runs=demo-clean,demo-detour,demo-late-failure&present=1");
          break;
        case "l":
        case "L":
          setMode("live");
          break;
        case "f":
        case "F":
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
          break;
        case "?":
          setShowHelp((v) => !v);
          break;
        case "Escape":
          setShowHelp(false);
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    state,
    play,
    pause,
    reset,
    navigateTrace,
    router,
    setMode,
    stepForward,
    stepBackward,
    getRunEvents,
  ]);

  if (!showHelp) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-8">
      <div className="max-w-md rounded border border-border-default bg-surface p-6">
        <h2 className="text-lg font-medium">Keyboard shortcuts</h2>
        <dl className="mt-4 space-y-2 text-sm">
          {[
            ["Space", "Play / pause"],
            ["R", "Restart replay"],
            ["Shift+R", "Fallback to recorded run"],
            ["← / →", "Step events"],
            ["0", "Fit graph"],
            ["1 / 2 / 3", "Load demo traces"],
            ["C", "Compare demos"],
            ["F", "Fullscreen"],
            ["L", "Live mode"],
            ["?", "Toggle this help"],
            ["Esc", "Close"],
          ].map(([key, desc]) => (
            <div key={key} className="flex justify-between gap-4">
              <dt className="font-mono text-text-tertiary">{key}</dt>
              <dd className="text-text-secondary">{desc}</dd>
            </div>
          ))}
        </dl>
        <button
          type="button"
          onClick={() => setShowHelp(false)}
          className="mt-4 text-sm text-accent"
        >
          Close
        </button>
      </div>
    </div>
  );
}
