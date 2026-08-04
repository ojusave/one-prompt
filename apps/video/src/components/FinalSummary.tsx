import React from "react";
import { interpolate } from "remotion";
import { renderBrand } from "../brand/render-brand";

type Stat = { value: string; label: string };

type Props = {
  stats: Stat[];
  visible: boolean;
  frame: number;
  appearFrame: number;
};

/**
 * Block D: final numeric summary (bottom-right).
 */
export const FinalSummary: React.FC<Props> = ({
  stats,
  visible,
  frame,
  appearFrame,
}) => {
  if (!visible) return null;

  const opacity = interpolate(frame, [appearFrame, appearFrame + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        right: renderBrand.safeMarginX,
        bottom: renderBrand.safeMarginY,
        width: 560,
        minHeight: 120,
        opacity,
        display: "flex",
        gap: 28,
        justifyContent: "flex-end",
        alignItems: "flex-end",
        zIndex: 30,
      }}
    >
      {stats.map((s) => (
        <div key={s.label} style={{ textAlign: "right" }}>
          <div
            style={{
              fontFamily: renderBrand.fontFamily,
              fontSize: 44,
              fontWeight: 600,
              color: renderBrand.primaryText,
              lineHeight: 1,
            }}
          >
            {s.value}
          </div>
          <div
            style={{
              marginTop: 8,
              fontFamily: renderBrand.monoFontFamily,
              fontSize: 12,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: renderBrand.secondaryText,
              maxWidth: 160,
            }}
          >
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
};
