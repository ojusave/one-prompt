import { NextResponse } from "next/server";
import { getTraceByRunId } from "@/lib/traces/fixtures";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;
  const fixture = getTraceByRunId(runId);

  if (!fixture) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  const encoder = new TextEncoder();
  const events = fixture.events;

  const stream = new ReadableStream({
    start(controller) {
      let index = 0;

      const sendHeartbeat = () => {
        controller.enqueue(encoder.encode(": heartbeat\n\n"));
      };

      const interval = setInterval(() => {
        if (index >= events.length) {
          controller.enqueue(
            encoder.encode(`event: complete\ndata: ${JSON.stringify({ done: true })}\n\n`)
          );
          clearInterval(interval);
          controller.close();
          return;
        }

        const event = events[index];
        controller.enqueue(
          encoder.encode(
            `id: ${event.sequence}\nevent: execution\ndata: ${JSON.stringify(event)}\n\n`
          )
        );
        index++;
      }, 800);

      const heartbeat = setInterval(sendHeartbeat, 15000);

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        clearInterval(heartbeat);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
