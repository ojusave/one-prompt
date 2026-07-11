import { create } from "zustand";
import type { ExecutionEvent, PlaybackState } from "@one-prompt/shared";
import { PLAYBACK_RATES } from "@one-prompt/shared";

interface PlaybackStore {
  state: PlaybackState;
  playheadMs: number;
  rate: number;
  selectedEventId: string | null;
  autoFollow: boolean;
  totalDurationMs: number;
  failurePauseUntil: number | null;

  setTotalDuration: (ms: number) => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
  seek: (ms: number) => void;
  stepForward: (events: ExecutionEvent[]) => void;
  stepBackward: (events: ExecutionEvent[]) => void;
  setRate: (rate: number) => void;
  cycleRate: () => void;
  selectEvent: (id: string | null) => void;
  setAutoFollow: (value: boolean) => void;
  tick: (deltaMs: number) => void;
  complete: () => void;
  setFailurePause: (until: number | null) => void;
}

export const usePlaybackStore = create<PlaybackStore>((set, get) => ({
  state: "idle",
  playheadMs: 0,
  rate: 1,
  selectedEventId: null,
  autoFollow: true,
  totalDurationMs: 0,
  failurePauseUntil: null,

  setTotalDuration: (ms) => set({ totalDurationMs: ms }),

  play: () => {
    const { state, playheadMs, totalDurationMs } = get();
    if (state === "completed" || playheadMs >= totalDurationMs) {
      set({ state: "playing", playheadMs: 0, selectedEventId: null });
    } else {
      set({ state: "playing" });
    }
  },

  pause: () => set({ state: "paused" }),

  reset: () =>
    set({
      state: "idle",
      playheadMs: 0,
      selectedEventId: null,
      failurePauseUntil: null,
    }),

  seek: (ms) => {
    const { totalDurationMs } = get();
    const clamped = Math.max(0, Math.min(ms, totalDurationMs));
    set({
      playheadMs: clamped,
      state: clamped >= totalDurationMs ? "completed" : "paused",
    });
  },

  stepForward: (events) => {
    const { playheadMs } = get();
    const next = events.find((e) => e.relativeStartMs > playheadMs);
    if (next) {
      set({ playheadMs: next.relativeStartMs, state: "paused" });
    }
  },

  stepBackward: (events) => {
    const { playheadMs } = get();
    const prev = [...events]
      .reverse()
      .find((e) => e.relativeStartMs < playheadMs - 1);
    if (prev) {
      set({ playheadMs: prev.relativeStartMs, state: "paused" });
    }
  },

  setRate: (rate) => set({ rate }),

  cycleRate: () => {
    const { rate } = get();
    const idx = PLAYBACK_RATES.indexOf(rate as (typeof PLAYBACK_RATES)[number]);
    const next = PLAYBACK_RATES[(idx + 1) % PLAYBACK_RATES.length];
    set({ rate: next });
  },

  selectEvent: (id) => set({ selectedEventId: id, autoFollow: id === null }),

  setAutoFollow: (value) => set({ autoFollow: value }),

  tick: (deltaMs) => {
    const { state, playheadMs, rate, totalDurationMs, failurePauseUntil } = get();
    if (state !== "playing") return;
    if (failurePauseUntil && Date.now() < failurePauseUntil) return;

    const next = playheadMs + deltaMs * rate;
    if (next >= totalDurationMs) {
      set({ playheadMs: totalDurationMs, state: "completed" });
    } else {
      set({ playheadMs: next });
    }
  },

  complete: () => set({ state: "completed", playheadMs: get().totalDurationMs }),

  setFailurePause: (until) => set({ failurePauseUntil: until }),
}));
