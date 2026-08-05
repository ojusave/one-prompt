import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { DEMO_TRACE_IDS } from "@one-prompt/shared";

export const runtime = "nodejs";

function fileNameForRun(runId: string): string | null {
  if (runId === DEMO_TRACE_IDS.clean || runId === DEMO_TRACE_IDS.detour) {
    return "one-prompt-clean-path.mp4";
  }
  if (runId === DEMO_TRACE_IDS["late-failure"]) {
    return "one-prompt-late-failure.mp4";
  }
  return null;
}

async function readRecording(fileName: string): Promise<Buffer | null> {
  const candidates = [
    path.resolve(process.cwd(), "out", fileName),
    path.resolve(process.cwd(), "..", "..", "out", fileName),
  ];

  for (const filePath of candidates) {
    try {
      return await readFile(filePath);
    } catch {
      // Try next candidate path.
    }
  }

  return null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;
  const fileName = fileNameForRun(runId);
  if (!fileName) {
    return NextResponse.json({ error: "Recording unavailable for this run" }, { status: 404 });
  }

  const file = await readRecording(fileName);
  if (!file) {
    return NextResponse.json(
      { error: "Recording file not found. Render the flow videos first." },
      { status: 404 }
    );
  }

  return new NextResponse(new Uint8Array(file), {
    status: 200,
    headers: {
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment; filename="${runId}-flow-recording.mp4"`,
      "Cache-Control": "no-store",
    },
  });
}
