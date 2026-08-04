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
  return (
    <>
      <Composition
        id="OnePromptCleanPath"
        component={CleanPath}
        width={WIDTH}
        height={HEIGHT}
        fps={FPS}
        durationInFrames={CLEAN_DURATION}
        defaultProps={defaultVideoProps}
      />
      <Composition
        id="OnePromptLateFailure"
        component={LateFailure}
        width={WIDTH}
        height={HEIGHT}
        fps={FPS}
        durationInFrames={LATE_DURATION}
        defaultProps={defaultVideoProps}
      />
    </>
  );
};
