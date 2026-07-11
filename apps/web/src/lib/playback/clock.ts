"use client";

import { useEffect, useRef } from "react";
import { usePlaybackStore } from "./store";

export function usePlaybackClock() {
  const state = usePlaybackStore((s) => s.state);
  const tick = usePlaybackStore((s) => s.tick);
  const lastFrame = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    if (state !== "playing") {
      lastFrame.current = null;
      if (rafId.current) cancelAnimationFrame(rafId.current);
      return;
    }

    const loop = (now: number) => {
      if (lastFrame.current !== null) {
        const delta = now - lastFrame.current;
        if (delta > 0) tick(delta);
      }
      lastFrame.current = now;
      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [state, tick]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        usePlaybackStore.getState().pause();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);
}
