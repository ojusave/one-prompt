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
    return node.id.startsWith("verify") ? "VERIFICATION FAILED" : "FAILED";
  }
  if (state === "running") {
    if (node.type === "deployment") return "DEPLOYING";
    if (node.id.startsWith("verify") || node.type === "test" && node.title === "Verify behavior") {
      const attempt = node.attempt ?? 1;
      return `ATTEMPT ${attempt} · VERIFYING`;
    }
    return "RUNNING";
  }
  if (state === "succeeded") {
    if (node.type === "deployment") return "LIVE";
    if (node.id === "runTests") return "TESTS PASSED";
    if (node.id === "verify" || node.id === "verify2") {
      return node.id === "verify" ? "1 ORDER CREATED" : "VERIFIED";
    }
    if (node.id === "verify1") return "VERIFICATION FAILED";
    return "COMPLETE";
  }
  return "PENDING";
}

function detailLabel(node: WorkflowVideoNode, state: NodeVisualState): string | null {
  switch (node.id) {
    case "plan":
      return "Step map with clear dependencies";
    case "inspectService":
      return "Where requests enter checkout";
    case "searchRetry":
      return "Retry rules and timeout settings";
    case "inspectOrder":
      return "Where an order is persisted";
    case "readTests":
      return "Existing expected behavior";
    case "hypothesis":
      return "Retries can replay side effects";
    case "reproduce":
      return "Confirm the duplicate-order path";
    case "proposeFix":
      return "Add an idempotency guard";
    case "applyPatch":
      return "Patch write path before persist";
    case "runTests":
      return "Regression checks pass";
    case "deploy":
      return "Preview environment is live";
    case "checkpoint":
      return "Reuse completed work after failure";
    case "verify1":
      return state === "failed" ? "Timeout in downstream dependency" : "Validation attempt 1";
    case "retry":
      return "Resume only the failed step";
    case "verify2":
      return "Validation attempt 2";
    case "verify":
      return "Validate one request -> one order";
    case "result":
      return "Cause fixed and verified";
    default:
      return null;
  }
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
    [1.14, 1.04, 1],
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

  const opacity = dimmed && !isFocus ? 0.6 : entrance;
  const detail = detailLabel(node, state);

  return (
    <div
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y + yOffset,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        opacity,
        transform: `scale(${popScale})`,
        transformOrigin: "left top",
        background,
        border: `1.5px solid ${borderColor}`,
        borderRadius: 4,
        boxShadow: glow,
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{ paddingTop: 4 }}>
          <TypeMark node={node} state={state} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: renderBrand.bodyFontFamily,
              fontSize: 21,
              fontWeight: 500,
              lineHeight: 1.2,
              color: renderBrand.primaryText,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {node.title}
          </div>
          <div
            style={{
              marginTop: 6,
              fontFamily: renderBrand.monoFontFamily,
              fontSize: 15,
              letterSpacing: "0.04em",
              color:
                state === "failed"
                  ? renderBrand.danger
                  : state === "running"
                    ? renderBrand.primaryText
                    : renderBrand.secondaryText,
            }}
          >
            {stateLabel(node, state)}
          </div>
          {detail ? (
            <div
              style={{
                marginTop: 4,
                fontFamily: renderBrand.bodyFontFamily,
                fontSize: 13,
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
