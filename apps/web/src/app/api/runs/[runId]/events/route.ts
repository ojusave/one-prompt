import { NextResponse } from "next/server";
import { getTraceByRunId } from "@/lib/traces/fixtures";
import { getRunEvents } from "@/lib/db/runs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;
  const { searchParams } = new URL(request.url);
  const afterSequence = Number(searchParams.get("afterSequence") ?? 0);

  if (runId.startsWith("live-") && process.env.DATABASE_URL) {
    const dbEvents = await getRunEvents(runId, afterSequence);
    return NextResponse.json({
      data: dbEvents,
      meta: {
        completed: dbEvents.length === 0 && afterSequence > 0,
        lastSequence: dbEvents.at(-1)?.sequence ?? afterSequence,
      },
    });
  }

  const fixture = getTraceByRunId(runId);
  if (!fixture) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  const events = fixture.events.filter((e) => e.sequence > afterSequence);
  const completed = fixture.run.status === "completed";

  return NextResponse.json({
    data: events,
    meta: { completed, lastSequence: fixture.events.at(-1)?.sequence ?? 0 },
  });
}
