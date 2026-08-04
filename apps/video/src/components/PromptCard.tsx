import React from "react";
import { interpolate, Easing } from "remotion";
import { renderBrand } from "../brand/render-brand";

type Props = {
  prompt: string;
  frame: number;
  /** Frames 0–29 centered; after 30 compact in Block A */
  compactFromFrame?: number;
  timingScale?: number;
};

/**
 * Opening centered prompt that moves into the top Block A card.
 */
export const PromptCard: React.FC<Props> = ({
  prompt,
  frame,
  compactFromFrame = 95,
  timingScale = 1,
}) => {
  const timelineFrame = frame / timingScale;
  const t = interpolate(timelineFrame, [compactFromFrame - 10, compactFromFrame + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  const isOpening = timelineFrame < compactFromFrame;

  if (isOpening || t < 1) {
    const top = interpolate(t, [0, 1], [330, renderBrand.safeMarginY + 62]);
    const left = interpolate(t, [0, 1], [(1920 - 1320) / 2, renderBrand.safeMarginX + 280]);
    const width = interpolate(t, [0, 1], [1320, 1480]);
    const fontSize = interpolate(t, [0, 1], [40, 27]);
    const padding = interpolate(t, [0, 1], [32, 16]);
    const opacity = timelineFrame < 4 ? interpolate(timelineFrame, [0, 4], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) : 1;

    return (
      <div
        style={{
          position: "absolute",
          top,
          left,
          width,
          opacity,
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            background: "rgba(0, 0, 0, 0.72)",
            border: `1px solid ${renderBrand.borderSubtle}`,
            borderRadius: 4,
            padding: `${padding}px ${padding + 8}px`,
          }}
        >
          <div
            style={{
              fontFamily: renderBrand.bodyFontFamily,
              fontSize,
              fontWeight: 500,
              lineHeight: 1.28,
              color: renderBrand.primaryText,
            }}
          >
            {prompt}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        top: renderBrand.safeMarginY + 62,
        left: renderBrand.safeMarginX + 280,
        width: 1480,
        zIndex: 20,
      }}
    >
      <div
        style={{
          background: "rgba(0, 0, 0, 0.72)",
          border: `1px solid ${renderBrand.borderSubtle}`,
          borderRadius: 4,
          padding: "12px 18px",
        }}
      >
        <div
          style={{
            fontFamily: renderBrand.bodyFontFamily,
            fontSize: 26,
            fontWeight: 500,
            lineHeight: 1.25,
            color: renderBrand.primaryText,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {prompt}
        </div>
      </div>
    </div>
  );
};
