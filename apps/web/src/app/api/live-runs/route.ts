import { NextResponse } from "next/server";
import { ALLOWED_LIVE_SCENARIOS, DEFAULT_PROMPT } from "@one-prompt/shared";
import { ensureSchema } from "@/lib/db/migrate";
import { createRun } from "@/lib/db/runs";

export async function POST(request: Request) {
  if (process.env.LIVE_MODE_ENABLED !== "true") {
    return NextResponse.json({ error: "Live mode disabled" }, { status: 403 });
  }

  const token = request.headers.get("x-presenter-token");
  if (!token || token !== process.env.PRESENTER_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { scenarioId?: string; prompt?: string; mode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    !body.scenarioId ||
    !ALLOWED_LIVE_SCENARIOS.includes(
      body.scenarioId as (typeof ALLOWED_LIVE_SCENARIOS)[number]
    )
  ) {
    return NextResponse.json({ error: "Scenario not allowed" }, { status: 400 });
  }

  const runId = `live-${Date.now()}`;
  const prompt = body.prompt?.slice(0, 2000) ?? DEFAULT_PROMPT;

  try {
    await ensureSchema();
    await createRun({
      id: runId,
      label: "Live demo",
      prompt,
      source: body.mode === "scripted-live" ? "scripted-live" : "live",
      status: "queued",
      createdAt: new Date().toISOString(),
      currentSequence: 0,
      metadata: { scenarioId: body.scenarioId },
    });
  } catch (err) {
    console.error("Live run create failed", err);
    return NextResponse.json(
      { error: "Database unavailable. Continue with recorded run." },
      { status: 503 }
    );
  }

  return NextResponse.json({
    data: {
      runId,
      status: "queued",
      fallbackRunId: "demo-late-failure",
      message:
        "Live run queued. Workflow tasks emit events to Postgres when configured.",
    },
  });
}
