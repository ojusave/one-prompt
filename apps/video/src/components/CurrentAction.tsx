import React from "react";
import { interpolate } from "remotion";
import { renderBrand } from "../brand/render-brand";

type Props = {
  label: string;
  action: string | null;
  frame: number;
  visibleFromFrame: number;
};

/**
 * Block C: current action caption (bottom-left).
 */
export const CurrentAction: React.FC<Props> = ({
  label,
  action,
  frame,
  visibleFromFrame,
}) => {
  if (!action || frame < visibleFromFrame) return null;

  const opacity = interpolate(frame, [visibleFromFrame, visibleFromFrame + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: renderBrand.safeMarginX,
        bottom: renderBrand.safeMarginY,
        width: 920,
        height: 120,
        opacity,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        zIndex: 30,
      }}
    >
      <div
        style={{
          fontFamily: renderBrand.monoFontFamily,
          fontSize: 12,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: renderBrand.tertiaryText,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: renderBrand.bodyFontFamily,
          fontSize: 24,
          fontWeight: 400,
          color: renderBrand.primaryText,
          lineHeight: 1.25,
        }}
      >
        {action}
      </div>
    </div>
  );
};
