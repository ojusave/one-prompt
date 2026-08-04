import React from "react";
import { Composition } from "remotion";
import { CleanPath } from "./compositions/CleanPath";
import { LateFailure } from "./compositions/LateFailure";
import {
  CLEAN_DURATION,
  LATE_DURATION,
  FPS,
  WIDTH,
  HEIGHT,
  defaultVideoProps,
} from "./types";

export const RemotionRoot: React.FC = () => {
  const cinematicPrompt =
    "Find why checkout retries can create duplicate orders, apply a safe fix, deploy a preview, and verify one request creates one order.";

  return (
    <>
      <Composition
        id="OnePromptCleanPath"
        component={CleanPath}
        width={WIDTH}
        height={HEIGHT}
        fps={FPS}
        durationInFrames={CLEAN_DURATION}
        defaultProps={{
          ...defaultVideoProps,
          prompt: cinematicPrompt,
        }}
      />
      <Composition
        id="OnePromptLateFailure"
        component={LateFailure}
        width={WIDTH}
        height={HEIGHT}
        fps={FPS}
        durationInFrames={LATE_DURATION}
        defaultProps={{
          ...defaultVideoProps,
          prompt: cinematicPrompt,
        }}
      />
    </>
  );
};
