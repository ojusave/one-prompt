import type { ExecutionEvent, ExecutionRun } from "@one-prompt/shared";
import { eq, and, gt } from "drizzle-orm";
import { getDb } from "./client";
import { runs, events } from "./schema";

export async function createRun(run: ExecutionRun): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.insert(runs).values({
    id: run.id,
    label: run.label ?? null,
    prompt: run.prompt,
    source: run.source,
    status: run.status,
    currentSequence: run.currentSequence,
    startedAt: run.startedAt ? new Date(run.startedAt) : null,
    completedAt: run.completedAt ? new Date(run.completedAt) : null,
    resultJson: run.result ?? null,
    metadataJson: run.metadata ?? null,
  });
}

export async function insertEvent(event: ExecutionEvent): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .insert(events)
    .values({
      id: event.id,
      runId: event.runId,
      sequence: event.sequence,
      logicalTaskId: event.logicalTaskId,
      parentId: event.parentId ?? null,
      dependencyIdsJson: event.dependencyIds,
      branchId: event.branchId ?? null,
      lane: event.lane ?? null,
      phase: event.phase ?? null,
      kind: event.kind,
      status: event.status,
      title: event.title,
      description: event.description,
      relativeStartMs: event.relativeStartMs,
      durationMs: event.durationMs ?? null,
      attempt: event.attempt,
      maxAttempts: event.maxAttempts ?? null,
      inputJson: event.input ?? null,
      outputJson: event.output ?? null,
      errorJson: event.error ?? null,
      sideEffectJson: event.sideEffect ?? null,
      modelJson: event.model ?? null,
      toolJson: event.tool ?? null,
      deploymentJson: event.deployment ?? null,
      metadataJson: event.metadata ?? null,
    })
    .onConflictDoNothing();
}

export async function getRunEvents(
  runId: string,
  afterSequence = 0
): Promise<ExecutionEvent[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(events)
    .where(and(eq(events.runId, runId), gt(events.sequence, afterSequence)))
    .orderBy(events.sequence);

  return rows.map((row) => ({
    id: row.id,
    runId: row.runId,
    sequence: row.sequence,
    logicalTaskId: row.logicalTaskId,
    parentId: row.parentId ?? undefined,
    dependencyIds: (row.dependencyIdsJson as string[]) ?? [],
    branchId: row.branchId ?? undefined,
    lane: row.lane ?? undefined,
    phase: row.phase ?? undefined,
    kind: row.kind as ExecutionEvent["kind"],
    status: row.status as ExecutionEvent["status"],
    title: row.title,
    description: row.description,
    relativeStartMs: row.relativeStartMs,
    durationMs: row.durationMs ?? undefined,
    attempt: row.attempt,
    maxAttempts: row.maxAttempts ?? undefined,
    input: row.inputJson ?? undefined,
    output: row.outputJson ?? undefined,
    error: row.errorJson as ExecutionEvent["error"],
    sideEffect: row.sideEffectJson as ExecutionEvent["sideEffect"],
    model: row.modelJson as ExecutionEvent["model"],
    tool: row.toolJson as ExecutionEvent["tool"],
    deployment: row.deploymentJson as ExecutionEvent["deployment"],
    metadata: row.metadataJson as Record<string, unknown>,
  }));
}

export async function updateRunStatus(
  runId: string,
  status: string,
  currentSequence: number
): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .update(runs)
    .set({ status, currentSequence })
    .where(eq(runs.id, runId));
}
