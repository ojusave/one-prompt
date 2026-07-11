import { describe, it, expect } from "vitest";
import { validateTraceFixture, validateTraceOrdering } from "@one-prompt/shared";

// Minimal inline fixture for unit tests
const validFixture = {
  run: {
    id: "test-run",
    prompt: "test",
    source: "replay" as const,
    status: "completed" as const,
    createdAt: "2026-01-01T00:00:00Z",
    currentSequence: 2,
  },
  events: [
    {
      id: "e1",
      runId: "test-run",
      sequence: 1,
      logicalTaskId: "a",
      dependencyIds: [],
      kind: "prompt" as const,
      status: "succeeded" as const,
      title: "Prompt",
      description: "Received",
      relativeStartMs: 0,
      durationMs: 100,
      attempt: 1,
    },
    {
      id: "e2",
      runId: "test-run",
      sequence: 2,
      logicalTaskId: "b",
      dependencyIds: ["e1"],
      kind: "plan" as const,
      status: "succeeded" as const,
      title: "Plan",
      description: "Built",
      relativeStartMs: 200,
      durationMs: 500,
      attempt: 1,
    },
  ],
};

describe("trace validation", () => {
  it("validates a correct fixture", () => {
    const result = validateTraceFixture(validFixture);
    expect(result.events).toHaveLength(2);
  });

  it("rejects invalid ordering", () => {
    const bad = {
      ...validFixture,
      events: [
        { ...validFixture.events[0], dependencyIds: ["e2"] },
        validFixture.events[1],
      ],
    };
    expect(() => validateTraceOrdering(bad.events)).toThrow();
  });
});
