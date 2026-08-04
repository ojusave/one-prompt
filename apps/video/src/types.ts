import { DEFAULT_PROMPT } from "@one-prompt/shared";

export type OnePromptVideoProps = {
  prompt: string;
  showRenderLogo: boolean;
  backgroundVariant: "default" | "flat";
  finalHoldFrames: number;
  timingScale: number;
};

export const defaultVideoProps: OnePromptVideoProps = {
  prompt: DEFAULT_PROMPT,
  showRenderLogo: true,
  backgroundVariant: "default",
  finalHoldFrames: 90,
  timingScale: 1,
};

export type SceneBeatAction =
  | "show-node"
  | "activate-node"
  | "complete-node"
  | "fail-node"
  | "show-edge"
  | "set-current-action"
  | "set-camera"
  | "dim-completed"
  | "restore-completed"
  | "show-message"
  | "show-summary"
  | "hide-summary";

export type SceneBeat = {
  id: string;
  startFrame: number;
  endFrame?: number;
  action: SceneBeatAction;
  target?: string;
  value?: string;
};

export type NodeVisualState =
  | "hidden"
  | "entering"
  | "running"
  | "succeeded"
  | "failed";

export type CameraPose = {
  translateX: number;
  translateY: number;
  scale: number;
};

export const CLEAN_DURATION = 780;
export const LATE_DURATION = 900;
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const NODE_WIDTH = 250;
export const NODE_HEIGHT = 88;
