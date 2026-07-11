import { NextResponse } from "next/server";
import { ensureSchema } from "@/lib/db/migrate";

export async function GET() {
  const dbConfigured = Boolean(process.env.DATABASE_URL);
  const liveConfigured = Boolean(
    process.env.LIVE_MODE_ENABLED === "true" && process.env.PRESENTER_TOKEN
  );

  if (dbConfigured) {
    try {
      await ensureSchema();
    } catch (err) {
      console.error("Schema ensure failed", err);
    }
  }

  return NextResponse.json({
    status: "ok",
    databaseConfigured: dbConfigured,
    liveModeConfigured: liveConfigured,
    commit: process.env.RENDER_GIT_COMMIT ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
}
