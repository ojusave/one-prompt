import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { renderBrand } from "../brand/render-brand";
import type { OnePromptVideoProps } from "../types";

type Props = {
  props: OnePromptVideoProps;
  children: React.ReactNode;
};

/**
 * Full-frame deck-style canvas: flat black with subtle grid.
 */
export const VideoCanvas: React.FC<Props> = ({ props, children }) => {
  const gridSize = 24;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: renderBrand.background,
        backgroundImage:
          props.backgroundVariant === "flat"
            ? undefined
            : `
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        fontFamily: renderBrand.bodyFontFamily,
        color: renderBrand.primaryText,
        overflow: "hidden",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const BrandFonts: React.FC = () => (
  <style>{`
    @font-face {
      font-family: 'Roobert';
      src: url('${staticFile("brand/fonts/Roobert-Regular.woff2")}') format('woff2');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'Roobert';
      src: url('${staticFile("brand/fonts/Roobert-SemiBold.woff2")}') format('woff2');
      font-weight: 600;
      font-style: normal;
    }
    @font-face {
      font-family: 'Roobert';
      src: url('${staticFile("brand/fonts/Roobert-Light.woff2")}') format('woff2');
      font-weight: 300;
      font-style: normal;
    }
    @font-face {
      font-family: 'PP Neue Montreal';
      src: url('${staticFile("brand/fonts/PPNeueMontreal-Regular.woff2")}') format('woff2');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'PP Neue Montreal';
      src: url('${staticFile("brand/fonts/PPNeueMontreal-Medium.woff2")}') format('woff2');
      font-weight: 500;
      font-style: normal;
    }
    @font-face {
      font-family: 'PP Neue Montreal';
      src: url('${staticFile("brand/fonts/PPNeueMontreal-SemiBold.woff2")}') format('woff2');
      font-weight: 600;
      font-style: normal;
    }
    @font-face {
      font-family: 'PP Neue Montreal Mono';
      src: url('${staticFile("brand/fonts/PPNeueMontrealMono-Regular.woff2")}') format('woff2');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'PP Neue Montreal Mono';
      src: url('${staticFile("brand/fonts/PPNeueMontrealMono-Medium.woff2")}') format('woff2');
      font-weight: 500;
      font-style: normal;
    }
  `}</style>
);

export const RenderSignature: React.FC<{ visible: boolean; compact?: boolean }> = ({
  visible,
  compact = false,
}) => {
  if (!visible) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <Img
        src={staticFile(renderBrand.logoPath)}
        style={{
          height: compact ? 42 : 48,
          width: "auto",
          objectFit: "contain",
          opacity: 1,
        }}
      />
    </div>
  );
};
