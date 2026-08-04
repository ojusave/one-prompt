import {
  cleanWorkflowGraph,
  lateFailureWorkflowGraph,
  type WorkflowVideoGraph,
} from "@one-prompt/shared";

export function getWorkflowForVideo(
  variant: "clean" | "late-failure"
): WorkflowVideoGraph {
  return variant === "clean" ? cleanWorkflowGraph : lateFailureWorkflowGraph;
}

export { cleanWorkflowGraph, lateFailureWorkflowGraph };
