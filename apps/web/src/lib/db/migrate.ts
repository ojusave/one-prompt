import { sql } from "drizzle-orm";
import { getDb } from "./client";

export async function ensureSchema(): Promise<void> {
  const db = getDb();
  if (!db) return;

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS runs (
      id TEXT PRIMARY KEY,
      label TEXT,
      prompt TEXT NOT NULL,
      source TEXT NOT NULL,
      status TEXT NOT NULL,
      current_sequence INTEGER NOT NULL DEFAULT 0,
      workflow_run_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      started_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      result_json JSONB,
      metadata_json JSONB
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL REFERENCES runs(id),
      sequence INTEGER NOT NULL,
      logical_task_id TEXT NOT NULL,
      parent_id TEXT,
      dependency_ids_json JSONB NOT NULL DEFAULT '[]',
      branch_id TEXT,
      lane TEXT,
      phase TEXT,
      kind TEXT NOT NULL,
      status TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      relative_start_ms INTEGER NOT NULL,
      duration_ms INTEGER,
      attempt INTEGER NOT NULL DEFAULT 1,
      max_attempts INTEGER,
      input_json JSONB,
      output_json JSONB,
      error_json JSONB,
      side_effect_json JSONB,
      model_json JSONB,
      tool_json JSONB,
      deployment_json JSONB,
      metadata_json JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (run_id, sequence)
    );
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS events_run_id_sequence_idx ON events (run_id, sequence);
  `);
}
