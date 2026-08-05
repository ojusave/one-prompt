import React from "react";
import { interpolate, Img, staticFile } from "remotion";
import type { WorkflowVideoNode } from "@one-prompt/shared";
import { renderBrand } from "../brand/render-brand";
import type { NodeVisualState } from "../types";
import { NODE_HEIGHT, NODE_WIDTH } from "../types";
import { positionFor } from "../layout/graph-layout";

type Props = {
  node: WorkflowVideoNode;
  state: NodeVisualState;
  appearFrame: number;
  frame: number;
  variant: "clean" | "late";
  dimmed: boolean;
};

function stateLabel(node: WorkflowVideoNode, state: NodeVisualState): string {
  if (state === "failed") {
    return "FAILED";
  }
  if (state === "running") {
    if (node.type === "deployment") return "DEPLOYING";
    if (node.id.startsWith("verify") || (node.type === "test" && node.title === "Verify behavior")) {
      const attempt = node.attempt ?? 1;
      return `ATTEMPT ${attempt} · RUNNING`;
    }
    return "RUNNING";
  }
  if (state === "succeeded") {
    if (node.type === "deployment") return "LIVE";
    if (node.id === "verify" || node.id === "verify2") return "VERIFIED";
    return "";
  }
  return "PENDING";
}

function TypeMark({ node, state }: { node: WorkflowVideoNode; state: NodeVisualState }) {
  if (node.type === "checkpoint") {
    return (
      <span style={{ color: renderBrand.warning, fontSize: 22, lineHeight: 1 }}>◇</span>
    );
  }
  if (state === "succeeded") {
    return (
      <span style={{ color: renderBrand.success, fontSize: 20, fontWeight: 700 }}>✓</span>
    );
  }
  if (state === "failed") {
    return (
      <span style={{ color: renderBrand.danger, fontSize: 20, fontWeight: 700 }}>!</span>
    );
  }
  if (node.type === "deployment") {
    return (
      <Img
        src={staticFile(renderBrand.symbolPath)}
        style={{ width: 22, height: 22, borderRadius: 4 }}
      />
    );
  }
  return (
    <span
      style={{
        width: 12,
        height: 12,
        borderRadius: "50%",
        background: state === "running" ? renderBrand.primaryText : renderBrand.tertiaryText,
        boxShadow: state === "running" ? `0 0 8px rgba(255,255,255,0.25)` : undefined,
        display: "inline-block",
      }}
    />
  );
}

/**
 * Single workflow graph node with frame-driven entrance and state.
 */
export const WorkflowNode: React.FC<Props> = ({
  node,
  state,
  appearFrame,
  frame,
  variant,
  dimmed,
}) => {
  if (state === "hidden") return null;

  const pos = positionFor(node.id, variant);
  const entrance = interpolate(frame, [appearFrame, appearFrame + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const popScale = interpolate(
    frame,
    [appearFrame, appearFrame + 8, appearFrame + 18],
    [1.08, 1.03, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const yOffset = interpolate(entrance, [0, 1], [16, 0]);

  const isCheckpoint = node.type === "checkpoint";
  const borderColor =
    state === "running"
      ? renderBrand.primaryText
      : state === "failed"
        ? renderBrand.danger
        : state === "succeeded"
          ? renderBrand.borderSubtle
          : renderBrand.borderSubtle;

  const background =
    state === "failed"
      ? renderBrand.dangerSoft
      : isCheckpoint
        ? renderBrand.warningSoft
        : renderBrand.surface;

  const glow =
    state === "running"
      ? `0 0 0 1px ${renderBrand.primaryText}`
      : state === "failed"
        ? `0 0 0 1px ${renderBrand.danger}`
        : "none";

  const isFocus =
    isCheckpoint ||
    state === "failed" ||
    node.id === "retry" ||
    node.id === "verify1" ||
    node.id === "verify2";
  const isCompact = state === "succeeded" && !isFocus;
  const width = isCompact ? 176 : NODE_WIDTH;
  const height = isCompact ? 56 : NODE_HEIGHT;
  const pad = isCompact ? "10px 12px" : "14px 16px";

  const opacity = dimmed && !isFocus ? 0.82 : entrance;
  const detail = state === "failed" && node.id === "verify1"
    ? "Timed out dependency"
    : null;
  const metaLabel = stateLabel(node, state);

  return (
    <div
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y + yOffset,
        width,
        height,
        opacity,
        transform: `scale(${popScale})`,
        transformOrigin: "left top",
        background,
        border: `1.5px solid ${borderColor}`,
        borderRadius: 4,
        boxShadow: glow,
        padding: pad,
        display: "flex",
        flexDirection: "column",
        gap: isCompact ? 2 : 8,
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{ paddingTop: isCompact ? 2 : 4 }}>
          <TypeMark node={node} state={state} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: renderBrand.bodyFontFamily,
              fontSize: isCompact ? 14 : 18,
              fontWeight: 500,
              lineHeight: 1.2,
              color: renderBrand.primaryText,
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {node.title}
          </div>
          {metaLabel && !isCompact ? (
            <div
              style={{
                marginTop: 6,
                fontFamily: renderBrand.monoFontFamily,
                fontSize: 11,
                letterSpacing: "0.04em",
                color:
                  state === "failed"
                    ? renderBrand.danger
                    : state === "running"
                      ? renderBrand.primaryText
                      : renderBrand.secondaryText,
              }}
            >
              {metaLabel}
            </div>
          ) : null}
          {detail ? (
            <div
              style={{
                marginTop: 4,
                fontFamily: renderBrand.bodyFontFamily,
                fontSize: 11,
                color: renderBrand.tertiaryText,
                lineHeight: 1.3,
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {detail}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
