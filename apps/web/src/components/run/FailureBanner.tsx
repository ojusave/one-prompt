"use client";

import { motion } from "framer-motion";
import { EASE_OUT } from "@one-prompt/shared";
import type { PreservedWorkSummary } from "@/lib/playback/failure";

interface FailureBannerProps {
  summary: PreservedWorkSummary;
  failedTitle: string;
  hasUnsafeSideEffect?: boolean;
}

export function FailureBanner({
  summary,
  failedTitle,
  hasUnsafeSideEffect,
}: FailureBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE_OUT }}
      className="border-b border-danger/30 bg-danger/10 px-6 py-3"
      role="alert"
    >
      <p className="text-sm font-medium text-text-primary">
        Step failed. Prior work remains.
      </p>
      <p className="mt-1 text-sm text-text-secondary">
        {failedTitle}
      </p>
      <div className="mt-2 flex flex-wrap gap-4 font-mono text-xs tabular-nums text-text-secondary">
        <span>{summary.completed} steps completed</span>
        <span>{summary.failed} step failed</span>
        <span>{summary.sideEffectsToRepeat} side effects will be repeated</span>
      </div>
      {hasUnsafeSideEffect && (
        <p className="mt-2 text-sm text-warning">
          This step may have changed external state. Automatic retry is disabled until
          the operation can be safely deduplicated.
        </p>
      )}
    </motion.div>
  );
}
