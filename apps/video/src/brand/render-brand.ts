/**
 * Render brand tokens for Remotion compositions.
 * Values sourced from local render-website globals + presentation assets.
 * See apps/video/docs/brand-source.md.
 */
export const renderBrand = {
  background: "#050506",
  backgroundElevated: "#09090b",
  surface: "#0f1012",
  surfaceRaised: "#141519",
  primaryText: "#f7f7f8",
  secondaryText: "#b8bac0",
  tertiaryText: "#7f828a",
  borderSubtle: "rgba(255,255,255,0.11)",
  borderStrong: "rgba(255,255,255,0.24)",
  accent: "#8b5cf6",
  accentSoft: "rgba(139, 92, 246, 0.14)",
  accentGlow: "rgba(139, 92, 246, 0.26)",
  success: "#d0d4db",
  successSoft: "rgba(208, 212, 219, 0.1)",
  danger: "#e05a4a",
  dangerSoft: "rgba(224, 90, 74, 0.2)",
  warning: "#8b5cf6",
  warningSoft: "rgba(139, 92, 246, 0.16)",
  fontFamily: "Roobert, 'PP Neue Montreal', sans-serif",
  bodyFontFamily: "'PP Neue Montreal', Roobert, sans-serif",
  monoFontFamily: "'PP Neue Montreal Mono', ui-monospace, monospace",
  logoPath: "brand/render-logo-white.svg",
  symbolPath: "brand/render-symbol.svg",
  logomarkPath: "brand/render-logomark.svg",
  cornerRadiusSmall: 8,
  cornerRadiusMedium: 14,
  cornerRadiusLarge: 20,
  safeMarginX: 72,
  safeMarginY: 56,
} as const;

export type RenderBrand = typeof renderBrand;
