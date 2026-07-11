import type { ExecutionEvent } from "@one-prompt/shared";

export async function emitExecutionEvent(
  baseUrl: string,
  secret: string,
  event: ExecutionEvent
): Promise<void> {
  const res = await fetch(`${baseUrl}/api/internal/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": secret,
    },
    body: JSON.stringify(event),
  });
  if (!res.ok) {
    throw new Error(`Failed to emit event ${event.id}: ${res.status}`);
  }
}
