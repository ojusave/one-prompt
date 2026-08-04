import { interpolate, Easing } from "remotion";
import type { CameraPose } from "../types";

export type CameraKeyframe = {
  frame: number;
  pose: CameraPose;
};

/**
 * Interpolate camera pose across keyframes for the current frame.
 */
export function interpolateCamera(
  frame: number,
  keyframes: CameraKeyframe[]
): CameraPose {
  if (keyframes.length === 0) {
    return { translateX: 0, translateY: 0, scale: 1 };
  }
  if (frame <= keyframes[0].frame) {
    return keyframes[0].pose;
  }
  const last = keyframes[keyframes.length - 1];
  if (frame >= last.frame) {
    return last.pose;
  }

  let i = 0;
  while (i < keyframes.length - 1 && keyframes[i + 1].frame <= frame) {
    i += 1;
  }
  const a = keyframes[i];
  const b = keyframes[i + 1];
  const t = interpolate(frame, [a.frame, b.frame], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  return {
    translateX: a.pose.translateX + (b.pose.translateX - a.pose.translateX) * t,
    translateY: a.pose.translateY + (b.pose.translateY - a.pose.translateY) * t,
    scale: a.pose.scale + (b.pose.scale - a.pose.scale) * t,
  };
}
