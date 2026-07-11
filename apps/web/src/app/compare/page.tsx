import { Suspense } from "react";
import ComparePageClient from "./ComparePageClient";

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-6">Loading comparison…</div>}>
      <ComparePageClient />
    </Suspense>
  );
}
