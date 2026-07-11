import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const secret = process.env.INTERNAL_EVENTS_SECRET;
  if (!secret || request.headers.get("x-internal-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const event = await request.json();
    const { insertEvent, updateRunStatus } = await import("@/lib/db/runs");
    const { ensureSchema } = await import("@/lib/db/migrate");
    await ensureSchema();
    await insertEvent(event);
    if (event.runId && event.sequence) {
      await updateRunStatus(event.runId, "running", event.sequence);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Event ingest failed", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
