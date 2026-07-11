import { NextResponse } from "next/server";
import { getTraceByRunId } from "@/lib/traces/fixtures";
import { deriveCompletedMetrics } from "@/lib/metrics/derive";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;
  const fixture = getTraceByRunId(runId);

  if (!fixture) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      run: fixture.run,
      metrics: deriveCompletedMetrics(fixture.events),
    },
  });
}
