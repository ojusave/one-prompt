import { NextResponse } from "next/server";
import { getAllTraceFixtures } from "@/lib/traces/fixtures";
import { deriveCompletedMetrics } from "@/lib/metrics/derive";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const source = searchParams.get("source");

  let fixtures = getAllTraceFixtures();

  if (status) {
    fixtures = fixtures.filter((f) => f.run.status === status);
  }
  if (source) {
    fixtures = fixtures.filter((f) => f.run.source === source);
  }

  const runs = fixtures.map((f) => ({
    ...f.run,
    metrics: deriveCompletedMetrics(f.events),
  }));

  return NextResponse.json({ data: runs, meta: { total: runs.length } });
}
