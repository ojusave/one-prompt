import React from "react";
import type { WorkflowVideoNode } from "@one-prompt/shared";
import type { DerivedSceneState } from "../scenes/derive-scene";
import { renderBrand } from "../brand/render-brand";

type Props = {
  nodes: WorkflowVideoNode[];
  state: DerivedSceneState;
  frame: number;
  timingScale: number;
  variant: "clean" | "late";
};

const LAYOUT = {
  cardWidth: 640,
  cardHeight: 122,
  topY: 150,
  gapY: 126,
  progressTop: 286,
  progressHeight: 620,
  focusY: 190,
} as const;

const PARALLEL_IDS = ["searchRetry", "inspectOrder", "readTests"] as const;

function shortLabel(title: string): string {
  if (title.length <= 24) return title;
  return `${title.slice(0, 23)}…`;
}

function statusText(state: "hidden" | "entering" | "running" | "succeeded" | "failed"): string {
  if (state === "running" || state === "entering") return "RUNNING";
  if (state === "failed") return "FAILED";
  if (state === "succeeded") return "COMPLETE";
  return "PENDING";
}

function cardTone(state: "hidden" | "entering" | "running" | "succeeded" | "failed") {
  if (state === "failed") {
    return {
      border: renderBrand.danger,
      bg: renderBrand.dangerSoft,
      text: renderBrand.primaryText,
      status: renderBrand.danger,
    };
  }
  if (state === "running" || state === "entering") {
    return {
      border: renderBrand.primaryText,
      bg: renderBrand.surfaceRaised,
      text: renderBrand.primaryText,
      status: renderBrand.primaryText,
    };
  }
  return {
    border: renderBrand.borderSubtle,
    bg: renderBrand.surface,
    text: renderBrand.secondaryText,
    status: renderBrand.tertiaryText,
  };
}

type BigCardProps = {
  node: WorkflowVideoNode;
  state: "hidden" | "entering" | "running" | "succeeded" | "failed";
  x: number;
  y: number;
  width?: number;
  height?: number;
  align?: "left" | "center";
  titleSize?: number;
  statusSize?: number;
  opacity?: number;
  translateY?: number;
};

type FlowCardProps = {
  node: WorkflowVideoNode;
  state: "hidden" | "entering" | "running" | "succeeded" | "failed";
  x: number;
  y: number;
  w?: number;
  h?: number;
  titleSize?: number;
};

const BigCard: React.FC<BigCardProps> = ({
  node,
  state,
  x,
  y,
  width = 390,
  height = 130,
  align = "center",
  titleSize = 30,
  statusSize = 16,
  opacity = 1,
  translateY = 0,
}) => {
  const tone = cardTone(state);
  const centered = align === "center";
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + translateY,
        width,
        height,
        borderRadius: 8,
        border: `2px solid ${tone.border}`,
        background: tone.bg,
        padding: "14px 16px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        style={{
          fontFamily: renderBrand.bodyFontFamily,
          fontSize: titleSize,
          lineHeight: 1.1,
          color: tone.text,
          fontWeight: 500,
          textAlign: centered ? "center" : "left",
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
          marginTop: 10,
          fontFamily: renderBrand.monoFontFamily,
          fontSize: statusSize,
          letterSpacing: "0.08em",
          color: tone.status,
          textAlign: centered ? "center" : "left",
        }}
      >
        {statusText(state)}
      </div>
    </div>
  );
};

const FlowCard: React.FC<FlowCardProps> = ({ node, state, x, y, w = 260, h = 46, titleSize = 20 }) => {
  const tone = cardTone(state);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 8,
        border: `1px solid ${tone.border}`,
        background: tone.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 10px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontFamily: renderBrand.bodyFontFamily,
          fontSize: titleSize,
          lineHeight: 1,
          color: tone.text,
          fontWeight: 500,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          width: "100%",
          textAlign: "center",
        }}
      >
        {node.title}
      </div>
    </div>
  );
};

/**
 * Presentation-first workflow storyboard:
 * large active cards + compact completed history rail.
 */
export const WorkflowGraph: React.FC<Props> = ({
  nodes,
  state,
  frame,
  timingScale,
  variant,
}) => {
  const timelineFrame = frame / timingScale;
  const stageWidth = 1920 - renderBrand.safeMarginX * 2;
  const centerX = stageWidth / 2;
  const motionProgress = (startFrame: number, durationFrames = 9, delayFrames = 0) => {
    const raw = (timelineFrame - startFrame - delayFrames) / durationFrames;
    if (raw <= 0) return 0;
    if (raw >= 1) return 1;
    return raw;
  };
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const visible = nodes.filter((n) => (state.nodeStates[n.id] ?? "hidden") !== "hidden");
  const orderedVisible = [...visible].sort(
    (a, b) => (state.nodeAppearFrame[a.id] ?? 0) - (state.nodeAppearFrame[b.id] ?? 0)
  );
  const completed = orderedVisible.filter((n) => {
    const s = state.nodeStates[n.id];
    return s === "succeeded" || s === "failed";
  });
  const discoveredSteps = orderedVisible.slice(0, 14);
  const running = orderedVisible.filter((n) => {
    const s = state.nodeStates[n.id];
    return s === "running" || s === "entering";
  });
  const failedCount = completed.filter((n) => state.nodeStates[n.id] === "failed").length;
  const succeededCount = completed.length - failedCount;

  const parallelActive = PARALLEL_IDS.filter((id) => {
    const s = state.nodeStates[id];
    return s === "running" || s === "entering";
  });
  const showParallel = parallelActive.length > 0;
  const parallelStart = parallelActive.length
    ? Math.min(...parallelActive.map((id) => state.nodeAppearFrame[id] ?? 0))
    : Number.POSITIVE_INFINITY;
  const parallelItems = parallelActive.map((id, index) => {
    const appear = state.nodeAppearFrame[id] ?? parallelStart;
    const t = motionProgress(appear, 10);
    const translateY = (1 - t) * 12;
    return {
      id,
      index,
      appear,
      t,
      translateY,
      y: LAYOUT.topY + index * LAYOUT.gapY,
      centerY: LAYOUT.topY + index * LAYOUT.gapY + LAYOUT.cardHeight / 2,
      animatedCenterY: LAYOUT.topY + index * LAYOUT.gapY + LAYOUT.cardHeight / 2 + translateY,
    };
  });

  const verify1 = byId.get("verify1");
  const retry = byId.get("retry");
  const verify2 = byId.get("verify2");
  const verify1State = verify1 ? state.nodeStates[verify1.id] : "hidden";
  const retryState = retry ? state.nodeStates[retry.id] : "hidden";
  const verify2State = verify2 ? state.nodeStates[verify2.id] : "hidden";
  const showRetryStory =
    variant === "late" &&
    (verify1State !== "hidden" || retryState !== "hidden" || verify2State !== "hidden");
  const showFlowOverview = state.showSummary;

  const focusNode = running[running.length - 1] ?? completed[completed.length - 1] ?? null;

  return (
    <div
      style={{
        position: "absolute",
        left: renderBrand.safeMarginX,
        top: LAYOUT.progressTop,
        width: 1920 - renderBrand.safeMarginX * 2,
        height: LAYOUT.progressHeight,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          right: 0,
          height: 88,
          opacity: 0.98,
          padding: "12px 16px",
          borderRadius: 8,
          background: "rgba(0,0,0,0.56)",
          border: `1px solid ${renderBrand.borderSubtle}`,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <div
            style={{
              fontFamily: renderBrand.monoFontFamily,
              fontSize: 12,
              letterSpacing: "0.08em",
              color: renderBrand.tertiaryText,
              textTransform: "uppercase",
            }}
          >
            Workflow progress
          </div>
          <div
            style={{
              fontFamily: renderBrand.bodyFontFamily,
              fontSize: 22,
              color: renderBrand.primaryText,
              fontWeight: 500,
              lineHeight: 1,
            }}
          >
            Step {discoveredSteps.length} of 14
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              border: `1px solid ${renderBrand.borderSubtle}`,
              background: "rgba(255,255,255,0.03)",
              fontFamily: renderBrand.monoFontFamily,
              fontSize: 12,
              letterSpacing: "0.04em",
              color: renderBrand.secondaryText,
              whiteSpace: "nowrap",
            }}
          >
            Completed {succeededCount}
          </div>
          <div
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              border: `1px solid ${running.length > 0 ? renderBrand.primaryText : renderBrand.borderSubtle}`,
              background: running.length > 0 ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
              fontFamily: renderBrand.monoFontFamily,
              fontSize: 12,
              letterSpacing: "0.04em",
              color: running.length > 0 ? renderBrand.primaryText : renderBrand.secondaryText,
              whiteSpace: "nowrap",
            }}
          >
            Running {running.length}
          </div>
          <div
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              border: `1px solid ${failedCount > 0 ? renderBrand.danger : renderBrand.borderSubtle}`,
              background: failedCount > 0 ? renderBrand.dangerSoft : "rgba(255,255,255,0.03)",
              fontFamily: renderBrand.monoFontFamily,
              fontSize: 12,
              letterSpacing: "0.04em",
              color: failedCount > 0 ? renderBrand.danger : renderBrand.secondaryText,
              whiteSpace: "nowrap",
            }}
          >
            Failed {failedCount}
          </div>
        </div>
      </div>

      {showFlowOverview ? (
        <div style={{ position: "absolute", inset: 0 }}>
          {(() => {
            const cardW = 150;
            const cardH = 56;
            const normalGap = 18;
            const branchZoneGap = 260;
            const mainY = 388;
            const branchW = cardW;
            const branchH = cardH;
            const branchGap = 24;
            const branchToMainGap = 20;
            const branchBottomY = mainY - branchH - branchToMainGap;
            const branchMidY = branchBottomY - branchH - branchGap;
            const branchTopY = branchMidY - branchH - branchGap;
            const nodeState = (id: string) => state.nodeStates[id] ?? "hidden";

            const steps =
              variant === "clean"
                ? [
                    { key: "intake", label: "Prompt + plan", stateId: "plan" },
                    { key: "inspectService", label: "Inspect service", stateId: "inspectService" },
                    { key: "hypothesis", label: "Synthesize cause", stateId: "hypothesis" },
                    { key: "applyPatch", label: "Implement fix", stateId: "applyPatch" },
                    { key: "runTests", label: "Run tests", stateId: "runTests" },
                    { key: "deploy", label: "Deploy", stateId: "deploy" },
                    { key: "verify", label: "Verify", stateId: "verify" },
                    { key: "result", label: "Complete", stateId: "result" },
                  ]
                : [
                    { key: "intake", label: "Prompt + plan", stateId: "plan" },
                    { key: "inspectService", label: "Inspect service", stateId: "inspectService" },
                    { key: "hypothesis", label: "Synthesize cause", stateId: "hypothesis" },
                    { key: "applyPatch", label: "Implement fix", stateId: "applyPatch" },
                    { key: "runTests", label: "Run tests", stateId: "runTests" },
                    { key: "deploy", label: "Deploy", stateId: "deploy" },
                    { key: "verify1", label: "Verify 1", stateId: "verify1" },
                    { key: "retry", label: "Retry failed verify", stateId: "retry" },
                    { key: "verify2", label: "Verify 2", stateId: "verify2" },
                    { key: "result", label: "Complete", stateId: "result" },
                  ];

            const inspectIndex = steps.findIndex((s) => s.key === "inspectService");
            const totalMainWidth = steps.reduce((acc, _step, idx) => {
              if (idx === 0) return cardW;
              const prevIdx = idx - 1;
              const gap = prevIdx === inspectIndex ? branchZoneGap : normalGap;
              return acc + gap + cardW;
            }, 0);
            const startX = Math.round((stageWidth - totalMainWidth) / 2);
            const xFor = (idx: number) => {
              let x = startX;
              for (let i = 1; i <= idx; i += 1) {
                const prev = i - 1;
                const gap = prev === inspectIndex ? branchZoneGap : normalGap;
                x += cardW + gap;
              }
              return x;
            };
            const centerXFor = (x: number, width = cardW) => x + width / 2;

            const card = (
              stateId: string,
              label: string,
              x: number,
              y: number,
              width = cardW,
              height = cardH,
              fontSize = 15
            ) => {
              const tone = cardTone(nodeState(stateId));
              return (
                <div
                  style={{
                    position: "absolute",
                    left: x,
                    top: y,
                    width,
                    height,
                    borderRadius: 8,
                    border: `1px solid ${tone.border}`,
                    background: tone.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 8px",
                    boxSizing: "border-box",
                    zIndex: 3,
                  }}
                >
                  <div
                    style={{
                      fontFamily: renderBrand.bodyFontFamily,
                      fontSize,
                      fontWeight: 500,
                      color: tone.text,
                      lineHeight: 1.05,
                      textAlign: "center",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      width: "100%",
                    }}
                  >
                    {label}
                  </div>
                </div>
              );
            };

            const hArrow = (x1: number, x2: number, y: number, color: string = renderBrand.borderStrong) => (
              <>
                <div
                  style={{
                    position: "absolute",
                    left: Math.min(x1, x2),
                    top: y - 1,
                    width: Math.abs(x2 - x1) - 8,
                    height: 2,
                    background: color,
                    opacity: 0.95,
                    zIndex: 1,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: x2 - 8,
                    top: y - 5,
                    width: 0,
                    height: 0,
                    borderTop: "5px solid transparent",
                    borderBottom: "5px solid transparent",
                    borderLeft: `8px solid ${color}`,
                    zIndex: 1,
                  }}
                />
              </>
            );

            const vLine = (
              x: number,
              y1: number,
              y2: number,
              color: string = renderBrand.borderStrong,
              dashed = false
            ) => (
              <div
                style={{
                  position: "absolute",
                  left: x,
                  top: Math.min(y1, y2),
                  width: 2,
                  height: Math.abs(y2 - y1),
                  background: dashed ? "transparent" : color,
                  borderLeft: dashed ? `2px dashed ${color}` : undefined,
                  opacity: 0.95,
                  zIndex: 1,
                }}
              />
            );

            const hypothesisIndex = steps.findIndex((s) => s.key === "hypothesis");
            const inspectX = xFor(inspectIndex);
            const hypothesisX = xFor(hypothesisIndex);
            const splitX = inspectX + cardW + 24;
            const mergeX = hypothesisX - 24;
            const branchX = Math.round((splitX + mergeX - branchW) / 2);
            const branchYs = [branchTopY, branchMidY, branchBottomY];
            const branchIds = ["searchRetry", "inspectOrder", "readTests"] as const;

            return (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 10,
                  width: stageWidth,
                  height: 650,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: centerX - 180,
                    top: 16,
                    fontFamily: renderBrand.monoFontFamily,
                    fontSize: 18,
                    letterSpacing: "0.08em",
                    color: renderBrand.accent,
                    textTransform: "uppercase",
                  }}
                >
                  Complete workflow map
                </div>

                {steps.map((step, idx) =>
                  card(step.stateId, step.label, xFor(idx), mainY, cardW, cardH, step.key === "retry" ? 14 : 15)
                )}

                {steps.map((step, idx) => {
                  if (idx >= steps.length - 1) return null;
                  const fromX = xFor(idx) + cardW;
                  const toX = xFor(idx + 1);
                  if (step.key === "inspectService") return null;
                  if (steps[idx + 1].key === "hypothesis") return null;
                  const color =
                    step.key === "verify1" ? renderBrand.warning : renderBrand.borderStrong;
                  return (
                    <React.Fragment key={`main-arrow-${step.key}`}>
                      {hArrow(fromX, toX, mainY + cardH / 2, color)}
                    </React.Fragment>
                  );
                })}

                {branchIds.map((id, i) =>
                  card(
                    id,
                    id === "searchRetry" ? "Retry config" : id === "inspectOrder" ? "Order creation" : "Relevant tests",
                    branchX,
                    branchYs[i],
                    branchW,
                    branchH,
                    15
                  )
                )}

                {hArrow(inspectX + cardW, splitX, mainY + cardH / 2)}
                <div
                  style={{
                    position: "absolute",
                    left: splitX - 4,
                    top: mainY + cardH / 2 - 4,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: renderBrand.borderStrong,
                    zIndex: 2,
                  }}
                />

                {branchYs.map((y, i) => (
                  <React.Fragment key={`to-branch-${branchIds[i]}`}>
                    {i === 1 ? null : vLine(splitX, mainY + cardH / 2, y + branchH / 2)}
                    {hArrow(splitX, branchX, y + branchH / 2)}
                  </React.Fragment>
                ))}

                {branchYs.map((y, i) => (
                  <React.Fragment key={`from-branch-${branchIds[i]}`}>
                    {hArrow(branchX + branchW, mergeX, y + branchH / 2)}
                    {i === 1 ? null : vLine(mergeX, y + branchH / 2, mainY + cardH / 2)}
                  </React.Fragment>
                ))}

                <div
                  style={{
                    position: "absolute",
                    left: mergeX - 4,
                    top: mainY + cardH / 2 - 4,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: renderBrand.borderStrong,
                    zIndex: 2,
                  }}
                />
                {hArrow(mergeX, hypothesisX, mainY + cardH / 2)}

                {variant === "late" ? (
                  <>
                    {card(
                      "checkpoint",
                      "Checkpoint",
                      xFor(steps.findIndex((s) => s.key === "deploy")),
                      mainY + cardH + 34,
                      cardW,
                      cardH,
                      14
                    )}
                    {vLine(
                      centerXFor(xFor(steps.findIndex((s) => s.key === "deploy"))),
                      mainY + cardH,
                      mainY + cardH + 34,
                      renderBrand.borderStrong,
                      true
                    )}
                  </>
                ) : null}
              </div>
            );
          })()}
        </div>
      ) : null}

      {!showFlowOverview && showParallel ? (
        <div style={{ position: "absolute", inset: 0 }}>
          {(() => {
            const cardX = centerX - LAYOUT.cardWidth / 2;
            const spineX = cardX - 34;
            const sourceX = cardX - 86;
            const centers = parallelItems.map((p) => p.animatedCenterY);
            const spineTop = centers[0] ?? 0;
            const spineHeight = centers.length > 1 ? (centers[centers.length - 1] - centers[0]) : 0;
            const baseT = Math.max(...parallelItems.map((p) => p.t), 0);
            return (
              <>
                <div
                  style={{
                    position: "absolute",
                    left: sourceX,
                    top: (centers[1] ?? centers[0] ?? 0) - 1,
                    width: spineX - sourceX,
                    height: 2,
                    background: renderBrand.borderStrong,
                    opacity: baseT,
                    transformOrigin: "left center",
                    transform: `scaleX(${baseT})`,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: spineX,
                    top: spineTop,
                    width: 2,
                    height: spineHeight,
                    background: renderBrand.borderStrong,
                    opacity: baseT,
                    transformOrigin: "center top",
                    transform: `scaleY(${baseT})`,
                  }}
                />
                {parallelItems.map((item) => {
                  const lineT = item.t;
                  return (
                    <React.Fragment key={`branch-connector-${item.id}`}>
                    <div
                      style={{
                        position: "absolute",
                        left: spineX,
                        top: item.animatedCenterY,
                        width: 34,
                        height: 2,
                        background: renderBrand.borderStrong,
                        opacity: lineT,
                        transformOrigin: "left center",
                        transform: `scaleX(${lineT})`,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: spineX - 3,
                        top: item.animatedCenterY - 3,
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: renderBrand.primaryText,
                        opacity: lineT,
                      }}
                    />
                  </React.Fragment>
                  );
                })}
              </>
            );
          })()}
          {parallelItems.map(({ id, index, t, y }) => {
            const node = byId.get(id);
            if (!node) return null;
            return (
              <BigCard
                key={id}
                node={node}
                state={state.nodeStates[id]}
                x={centerX - LAYOUT.cardWidth / 2}
                y={y}
                width={LAYOUT.cardWidth}
                height={LAYOUT.cardHeight}
                align="center"
                opacity={t}
                translateY={parallelItems[index]?.translateY ?? 0}
              />
            );
          })}
          <div
            style={{
              position: "absolute",
              left: centerX - 320,
              top: 118,
              fontFamily: renderBrand.monoFontFamily,
              fontSize: 18,
              letterSpacing: "0.08em",
              color: renderBrand.accent,
              textTransform: "uppercase",
            }}
          >
            Investigation splits into three branches
          </div>
        </div>
      ) : null}

      {!showFlowOverview && showRetryStory && verify1 && retry && verify2 ? (
        <div style={{ position: "absolute", inset: 0 }}>
          <BigCard
            node={verify1}
            state={verify1State}
            x={centerX - LAYOUT.cardWidth / 2}
            y={LAYOUT.topY + 50}
            width={LAYOUT.cardWidth}
            height={LAYOUT.cardHeight}
            align="center"
            opacity={motionProgress(state.nodeAppearFrame.verify1 ?? 0, 10)}
            translateY={(1 - motionProgress(state.nodeAppearFrame.verify1 ?? 0, 10)) * 12}
          />
          <div
            style={{
              position: "absolute",
              left: centerX,
              top: LAYOUT.topY + 50 + LAYOUT.cardHeight + 4,
              width: 2,
              height: 70,
              borderLeft: `3px dashed ${renderBrand.warning}`,
              opacity: motionProgress(state.nodeAppearFrame.retry ?? state.nodeAppearFrame.verify2 ?? 0, 8),
              transformOrigin: "center top",
              transform: `scaleY(${motionProgress(state.nodeAppearFrame.retry ?? state.nodeAppearFrame.verify2 ?? 0, 8)})`,
            }}
          />
          {(() => {
            const childWidth = 300;
            const childGap = 40;
            const groupWidth = childWidth * 2 + childGap;
            const groupLeft = centerX - groupWidth / 2;
            const childY = LAYOUT.topY + 50 + LAYOUT.cardHeight + 74;
            return (
              <>
                <BigCard
                  node={retry}
                  state={retryState}
                  x={groupLeft}
                  y={childY}
                  width={childWidth}
                  height={112}
                  align="center"
                  titleSize={18}
                  statusSize={14}
                  opacity={motionProgress(state.nodeAppearFrame.retry ?? 0, 10)}
                  translateY={(1 - motionProgress(state.nodeAppearFrame.retry ?? 0, 10)) * 12}
                />
                <BigCard
                  node={verify2}
                  state={verify2State}
                  x={groupLeft + childWidth + childGap}
                  y={childY}
                  width={childWidth}
                  height={112}
                  align="center"
                  titleSize={18}
                  statusSize={14}
                  opacity={motionProgress(state.nodeAppearFrame.verify2 ?? 0, 10, 2)}
                  translateY={(1 - motionProgress(state.nodeAppearFrame.verify2 ?? 0, 10, 2)) * 12}
                />
                <div
                  style={{
                    position: "absolute",
                    left: groupLeft + childWidth,
                    top: childY + 56,
                    width: childGap,
                    borderTop: `2px solid ${renderBrand.warning}`,
                    opacity: motionProgress(state.nodeAppearFrame.verify2 ?? 0, 8, 2),
                    transformOrigin: "left center",
                    transform: `scaleX(${motionProgress(state.nodeAppearFrame.verify2 ?? 0, 8, 2)})`,
                  }}
                />
              </>
            );
          })()}
        </div>
      ) : null}

      {!showFlowOverview && !showParallel && !showRetryStory && focusNode ? (
        (() => {
          const focusAppear = state.nodeAppearFrame[focusNode.id] ?? 0;
          const focusT = motionProgress(focusAppear, 10);
          return (
        <BigCard
          node={focusNode}
          state={state.nodeStates[focusNode.id]}
          x={centerX - LAYOUT.cardWidth / 2}
          y={LAYOUT.focusY}
          width={LAYOUT.cardWidth}
          height={170}
          align="center"
          opacity={focusT}
          translateY={(1 - focusT) * 12}
        />
          );
        })()
      ) : null}
    </div>
  );
};
