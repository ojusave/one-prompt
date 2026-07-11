"use client";

import { use, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { LayoutGroup } from "framer-motion";
import { getTraceByRunId } from "@/lib/traces/fixtures";
import { usePlaybackStore } from "@/lib/playback/store";
import { RunWorkspace } from "@/components/run/RunWorkspace";
import { notFound } from "next/navigation";

export default function RunPageClient({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = use(params);
  const searchParams = useSearchParams();
  const autoplay = searchParams.get("autoplay") === "1";
  const reset = usePlaybackStore((s) => s.reset);

  const fixture = getTraceByRunId(runId);

  useEffect(() => {
    reset();
  }, [runId, reset]);

  if (!fixture) {
    notFound();
  }

  return (
    <LayoutGroup id="prompt-morph">
      <RunWorkspace fixture={fixture} autoplay={autoplay} />
    </LayoutGroup>
  );
}
