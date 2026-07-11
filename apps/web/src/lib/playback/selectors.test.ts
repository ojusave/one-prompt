import { describe, it, expect } from "vitest";
import { getEventStatusAtTime, getTraceEndMs } from "@/lib/playback/selectors";

const events = [
  {
    id: "e1",
    runId: "r1",
    sequence: 1,
    logicalTaskId: "a",
    dependencyIds: [],
    kind: "prompt" as const,
    status: "succeeded" as const,
    title: "A",
    description: "",
    relativeStartMs: 0,
    durationMs: 1000,
    attempt: 1,
  },
  {
    id: "e2",
    runId: "r1",
    sequence: 2,
    logicalTaskId: "b",
    dependencyIds: ["e1"],
    kind: "test" as const,
    status: "failed" as const,
    title: "B",
    description: "",
    relativeStartMs: 1500,
    durationMs: 500,
    attempt: 1,
  },
];

describe("playback selectors", () => {
  it("returns queued before start", () => {
    expect(getEventStatusAtTime(events[1], 1000)).toBe("queued");
  });

  it("returns running during execution", () => {
    expect(getEventStatusAtTime(events[0], 500)).toBe("running");
  });

  it("returns failed after failure completes", () => {
    expect(getEventStatusAtTime(events[1], 2500)).toBe("failed");
  });

  it("computes trace end", () => {
    expect(getTraceEndMs(events)).toBe(2000);
  });
});
