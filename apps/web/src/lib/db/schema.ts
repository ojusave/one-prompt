import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const runs = pgTable(
  "runs",
  {
    id: text("id").primaryKey(),
    label: text("label"),
    prompt: text("prompt").notNull(),
    source: text("source").notNull(),
    status: text("status").notNull(),
    currentSequence: integer("current_sequence").notNull().default(0),
    workflowRunId: text("workflow_run_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    resultJson: jsonb("result_json"),
    metadataJson: jsonb("metadata_json"),
  },
  (table) => [
    index("runs_created_at_idx").on(table.createdAt),
    index("runs_status_idx").on(table.status),
    index("runs_workflow_run_id_idx").on(table.workflowRunId),
  ]
);

export const events = pgTable(
  "events",
  {
    id: text("id").primaryKey(),
    runId: text("run_id")
      .notNull()
      .references(() => runs.id),
    sequence: integer("sequence").notNull(),
    logicalTaskId: text("logical_task_id").notNull(),
    parentId: text("parent_id"),
    dependencyIdsJson: jsonb("dependency_ids_json").notNull().default([]),
    branchId: text("branch_id"),
    lane: text("lane"),
    phase: text("phase"),
    kind: text("kind").notNull(),
    status: text("status").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    relativeStartMs: integer("relative_start_ms").notNull(),
    durationMs: integer("duration_ms"),
    attempt: integer("attempt").notNull().default(1),
    maxAttempts: integer("max_attempts"),
    inputJson: jsonb("input_json"),
    outputJson: jsonb("output_json"),
    errorJson: jsonb("error_json"),
    sideEffectJson: jsonb("side_effect_json"),
    modelJson: jsonb("model_json"),
    toolJson: jsonb("tool_json"),
    deploymentJson: jsonb("deployment_json"),
    metadataJson: jsonb("metadata_json"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("events_run_sequence_idx").on(table.runId, table.sequence),
    index("events_run_id_sequence_idx").on(table.runId, table.sequence),
  ]
);
