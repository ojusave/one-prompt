import { create } from "zustand";

export type ExecutionMode = "replay" | "live";

interface AppState {
  mode: ExecutionMode;
  presenterToken: string | null;
  reducedMotion: boolean;
  setMode: (mode: ExecutionMode) => void;
  setPresenterToken: (token: string | null) => void;
  setReducedMotion: (value: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  mode: "replay",
  presenterToken: null,
  reducedMotion: false,
  setMode: (mode) => set({ mode }),
  setPresenterToken: (token) => set({ presenterToken: token }),
  setReducedMotion: (value) => set({ reducedMotion: value }),
}));
