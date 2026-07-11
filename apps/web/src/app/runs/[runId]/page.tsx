import { Suspense } from "react";
import RunPageClient from "./RunPageClient";

export default function RunPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading run…</div>}>
      <RunPageClient params={params} />
    </Suspense>
  );
}
