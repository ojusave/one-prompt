import { describe, expect, it } from "vitest";
import {
  cleanWorkflowGraph,
  lateFailureWorkflowGraph,
  PARALLEL_INVESTIGATION_IDS,
  PRE_CHECKPOINT_NODE_IDS,
  getTraceFixture,
} from "../index";

describe("clean workflow graph", () => {
  it("has exactly 14 workflow actions", () => {
    expect(cleanWorkflowGraph.nodes).toHaveLength(14);
  });

  it("has exactly three parallel investigation branches", () => {
    const parallel = cleanWorkflowGraph.nodes.filter((n) =>
      (PARALLEL_INVESTIGATION_IDS as readonly string[]).includes(n.id)
    );
    expect(parallel).toHaveLength(3);
    for (const n of parallel) {
      expect(n.dependencies).toEqual(["inspectService"]);
    }
  });

  it("has valid dependencies", () => {
    const ids = new Set(cleanWorkflowGraph.nodes.map((n) => n.id));
    for (const n of cleanWorkflowGraph.nodes) {
      for (const dep of n.dependencies) {
        expect(ids.has(dep)).toBe(true);
      }
    }
  });

  it("converges branches into hypothesis", () => {
    const hyp = cleanWorkflowGraph.nodes.find((n) => n.id === "hypothesis");
    expect(hyp?.dependencies.sort()).toEqual(
      ["inspectOrder", "readTests", "searchRetry"].sort()
    );
  });

  it("deploys before verification and verifies before completion", () => {
    const order = cleanWorkflowGraph.nodes.map((n) => n.id);
    expect(order.indexOf("deploy")).toBeLessThan(order.indexOf("verify"));
    expect(order.indexOf("verify")).toBeLessThan(order.indexOf("result"));
  });
});

describe("late-failure workflow graph", () => {
  const nodes = lateFailureWorkflowGraph.nodes;
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  it("has attempt one failed and attempt two succeeded", () => {
    expect(byId.verify1.attempt).toBe(1);
    expect(byId.verify1.finalState).toBe("failed");
    expect(byId.verify2.attempt).toBe(2);
    expect(byId.verify2.finalState).toBe("succeeded");
  });

  it("wires retry between attempts", () => {
    expect(byId.retry.dependencies).toEqual(["verify1"]);
    expect(byId.verify2.dependencies).toEqual(["retry"]);
  });

  it("checkpoints before attempt one", () => {
    expect(byId.verify1.dependencies).toEqual(["checkpoint"]);
    expect(byId.checkpoint.dependencies).toEqual(["deploy"]);
  });

  it("does not duplicate pre-checkpoint tasks after failure", () => {
    const afterCheckpoint = nodes.filter(
      (n) =>
        !PRE_CHECKPOINT_NODE_IDS.includes(n.id) &&
        n.id !== "checkpoint"
    );
    for (const id of PRE_CHECKPOINT_NODE_IDS) {
      expect(afterCheckpoint.find((n) => n.id === id)).toBeUndefined();
    }
    expect(afterCheckpoint.map((n) => n.id)).toEqual([
      "verify1",
      "retry",
      "verify2",
      "result",
    ]);
  });

  it("does not repeat deploy, tests, or patch", () => {
    const counts = (id: string) => nodes.filter((n) => n.id === id).length;
    expect(counts("deploy")).toBe(1);
    expect(counts("runTests")).toBe(1);
    expect(counts("applyPatch")).toBe(1);
  });
});

describe("fixtures align with video labels", () => {
  it("clean fixture has 14 events with approved titles", () => {
    const fixture = getTraceFixture("clean");
    expect(fixture.events).toHaveLength(14);
    expect(fixture.events.find((e) => e.logicalTaskId === "plan")?.title).toBe(
      "Build execution plan"
    );
    expect(
      fixture.events.find((e) => e.logicalTaskId === "inspect-order")?.title
    ).toBe("Inspect order creation");
  });

  it("late-failure fixture has corrected checkpoint and retry titles", () => {
    const fixture = getTraceFixture("late-failure");
    const checkpoint = fixture.events.find((e) => e.logicalTaskId === "checkpoint");
    expect(checkpoint?.title).toBe("Completed work preserved");
    expect(checkpoint?.description).not.toMatch(/Nine steps/i);
    expect(
      fixture.events.find((e) => e.logicalTaskId === "verify-retry")?.title
    ).toBe("Retry verification");
  });
});
