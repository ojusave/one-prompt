import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { cleanWorkflowGraph } from "@one-prompt/shared";
import type { OnePromptVideoProps } from "../types";
import { defaultVideoProps } from "../types";
import { BrandFonts, RenderSignature, VideoCanvas } from "../components/VideoCanvas";
import { PromptCard } from "../components/PromptCard";
import { WorkflowGraph } from "../components/WorkflowGraph";
import { CurrentAction } from "../components/CurrentAction";
import { FinalSummary } from "../components/FinalSummary";
import { SceneMessage } from "../components/CheckpointMarker";
import { cleanPathBeats, cleanCameraKeyframes } from "../scenes/clean-path-scene";
import { deriveSceneState } from "../scenes/derive-scene";
import { renderBrand } from "../brand/render-brand";

export const CleanPath: React.FC<OnePromptVideoProps> = (props) => {
  const merged = { ...defaultVideoProps, ...props };
  const frame = useCurrentFrame();
  const state = deriveSceneState(
    frame,
    cleanPathBeats,
    cleanWorkflowGraph.nodes,
    cleanCameraKeyframes,
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
            nodes={cleanWorkflowGraph.nodes}
            state={state}
            frame={frame}
            variant="clean"
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
          appearFrame={690}
          stats={[
            { value: "1", label: "Prompt" },
            { value: "14", label: "Actions" },
            { value: "3", label: "Parallel investigations" },
          ]}
        />

        <SceneMessage message={state.message} frame={frame} />
      </AbsoluteFill>
    </VideoCanvas>
  );
};
