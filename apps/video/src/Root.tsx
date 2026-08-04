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
    "Incident #8472: duplicate $149 checkout orders appear when webhook retries hit the API. Find the exact write path causing the replay, implement an idempotency fix, ship a Render preview, and prove repeated requests create exactly one order.";

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
