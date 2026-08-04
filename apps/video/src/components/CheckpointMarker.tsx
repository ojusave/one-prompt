import React from "react";
import { interpolate } from "remotion";
import { renderBrand } from "../brand/render-brand";

type Props = {
  message: string | null;
  frame: number;
};

/**
 * Restrained on-graph message (prior work / no repeat).
 */
export const SceneMessage: React.FC<Props> = ({ message, frame }) => {
  if (!message) return null;
  const opacity = interpolate(frame % 30, [0, 8], [0.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        right: renderBrand.safeMarginX,
        top: 210,
        opacity,
        zIndex: 25,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: renderBrand.monoFontFamily,
          fontSize: 14,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: renderBrand.warning,
          background: "rgba(0,0,0,0.78)",
          border: `1px solid ${renderBrand.warning}`,
          borderRadius: 4,
          padding: "9px 14px",
        }}
      >
        {message}
      </div>
    </div>
  );
};

/** Alias for checkpoint-style messaging used in docs. */
export const CheckpointMarker = SceneMessage;
