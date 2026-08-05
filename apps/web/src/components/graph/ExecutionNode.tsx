"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { GraphNodeData } from "@/lib/graph/derive";
import { StatusBadge, formatDuration, getKindLabel } from "@/components/primitives/StatusBadge";

function ExecutionNodeComponent({ data, selected }: NodeProps) {
  const { event, displayStatus } = data as GraphNodeData;
  const isRunning = displayStatus === "running";
  const isFailed = displayStatus === "failed";
  const isRetrying = displayStatus === "retrying" || event.attempt > 1;
  const isSideEffect =
    event.kind === "side_effect" ||
    event.kind === "deployment" ||
    event.kind === "write" ||
    Boolean(event.sideEffect?.occurred);
  const secondaryMeta = isSideEffect && event.sideEffect
    ? `Safe to retry: ${event.sideEffect.safeToRetry ? "Yes" : "No"}`
    : event.durationMs && (displayStatus === "succeeded" || displayStatus === "failed")
      ? formatDuration(event.durationMs)
      : "\u00A0";

  return (
    <div
      className={`graph-node-label flex h-[116px] w-[220px] flex-col rounded border bg-surface-raised px-3 py-2.5 transition-all duration-300 ${
        selected ? "border-accent ring-1 ring-accent/30" : ""
      } ${isRunning ? "border-accent shadow-[0_0_0_1px_var(--accent-soft)]" : ""} ${
        isFailed ? "border-danger" : "border-border-default"
      } ${isSideEffect ? "border-l-[3px] border-l-warning pl-2.5" : ""} ${
        isRetrying && !isFailed ? "border-dashed" : ""
      }`}
    >
      <Handle type="target" position={Position.Left} className="!h-1 !w-1 !opacity-0" />
      <div className="mb-1 min-h-[40px] text-[15px] font-medium leading-snug text-text-primary [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
        {event.title}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-text-tertiary">
          {isSideEffect ? "SIDE EFFECT" : getKindLabel(event.kind)}
        </span>
        <StatusBadge status={displayStatus}>
          {displayStatus === "running"
            ? "RUNNING"
            : displayStatus === "waiting"
              ? "WAITING"
              : event.attempt > 1
                ? `ATTEMPT ${event.attempt}`
                : displayStatus.toUpperCase()}
        </StatusBadge>
      </div>
      <div className="mt-1 min-h-[16px] font-mono text-xs tabular-nums text-text-tertiary">
        {secondaryMeta}
      </div>
      <Handle type="source" position={Position.Right} className="!h-1 !w-1 !opacity-0" />
    </div>
  );
}

export const ExecutionNode = memo(ExecutionNodeComponent);
