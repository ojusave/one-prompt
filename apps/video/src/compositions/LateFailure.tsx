import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { lateFailureWorkflowGraph } from "@one-prompt/shared";
import type { OnePromptVideoProps } from "../types";
import { defaultVideoProps } from "../types";
import { BrandFonts, RenderSignature, VideoCanvas } from "../components/VideoCanvas";
import { PromptCard } from "../components/PromptCard";
import { WorkflowGraph } from "../components/WorkflowGraph";
import { CurrentAction } from "../components/CurrentAction";
import { FinalSummary } from "../components/FinalSummary";
import { SceneMessage } from "../components/CheckpointMarker";
import { lateFailureBeats, lateCameraKeyframes } from "../scenes/late-failure-scene";
import { deriveSceneState } from "../scenes/derive-scene";
import { renderBrand } from "../brand/render-brand";

export const LateFailure: React.FC<OnePromptVideoProps> = (props) => {
  const merged = { ...defaultVideoProps, ...props };
  const frame = useCurrentFrame();
  const state = deriveSceneState(
    frame,
    lateFailureBeats,
    lateFailureWorkflowGraph.nodes,
    lateCameraKeyframes,
    merged.timingScale
  );

  const showGraph = frame >= 30;

  return (
    <VideoCanvas props={merged}>
      <BrandFonts />
      <AbsoluteFill>
        <div
          style={{
            position: "absolute",
            top: renderBrand.safeMarginY,
            left: renderBrand.safeMarginX,
            right: renderBrand.safeMarginX,
            height: 52,
            display: "flex",
            alignItems: "center",
            zIndex: 40,
          }}
        >
          <RenderSignature visible={merged.showRenderLogo} compact={frame >= 30} />
        </div>

        <PromptCard prompt={merged.prompt} frame={frame} />

        {showGraph ? (
          <WorkflowGraph
            nodes={lateFailureWorkflowGraph.nodes}
            state={state}
            frame={frame}
            variant="late"
          />
        ) : null}

        <CurrentAction
          label={state.actionLabel}
          action={state.currentAction}
          frame={frame}
          visibleFromFrame={30}
        />

        <FinalSummary
          visible={state.showSummary}
          frame={frame}
          appearFrame={810}
          stats={[
            { value: "1", label: "Late failure" },
            { value: "1", label: "Step retried" },
            { value: "0", label: "Completed steps repeated" },
          ]}
        />

        <SceneMessage message={state.message} frame={frame} />
      </AbsoluteFill>
    </VideoCanvas>
  );
};
