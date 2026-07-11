"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DEMO_TRACE_IDS, TRACE_LABELS } from "@one-prompt/shared";
import type { TraceId } from "@one-prompt/shared";
import { getTraceFixture } from "@/lib/traces/fixtures";
import { deriveCompletedMetrics } from "@/lib/metrics/derive";
import { getFingerprint } from "@/lib/graph/derive";
import { formatDuration } from "@/components/primitives/StatusBadge";

const DEMO_IDS: TraceId[] = ["late-failure", "clean", "detour"];

type Filter = "all" | "completed" | "replay";
type SortKey = "newest" | "longest" | "retries" | "actions";

export default function RunsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    let data = DEMO_IDS.map((id) => {
      const fixture = getTraceFixture(id);
      const metrics = deriveCompletedMetrics(fixture.events);
      const duration = Math.max(
        ...fixture.events.map((e) => e.relativeStartMs + (e.durationMs ?? 0))
      );
      return { id, fixture, metrics, duration };
    });

    if (filter === "completed") {
      data = data.filter((r) => r.fixture.run.status === "completed");
    }
    if (filter === "replay") {
      data = data.filter((r) => r.fixture.run.source === "replay");
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (r) =>
          TRACE_LABELS[r.id].title.toLowerCase().includes(q) ||
          r.fixture.run.prompt.toLowerCase().includes(q) ||
          (r.fixture.run.result?.title ?? "").toLowerCase().includes(q)
      );
    }

    data.sort((a, b) => {
      if (sort === "longest") return b.duration - a.duration;
      if (sort === "retries") return b.metrics.retries - a.metrics.retries;
      if (sort === "actions") return b.metrics.totalActions - a.metrics.totalActions;
      return DEMO_IDS.indexOf(a.id) - DEMO_IDS.indexOf(b.id);
    });

    return data;
  }, [filter, sort, search]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-medium">Run history</h1>
      <p className="mt-1 text-text-secondary">Controlled demo execution traces.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex gap-2 text-sm">
          {(["all", "completed", "replay"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded border px-3 py-1 capitalize transition-colors ${
                filter === f
                  ? "border-accent bg-accent-soft text-text-primary"
                  : "border-border-default text-text-secondary hover:bg-surface-hover"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded border border-border-default bg-surface px-3 py-1 text-sm"
          aria-label="Sort runs"
        >
          <option value="newest">Newest</option>
          <option value="longest">Longest</option>
          <option value="actions">Most actions</option>
          <option value="retries">Most retries</option>
        </select>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search prompt or result…"
          className="min-w-[200px] flex-1 rounded border border-border-default bg-surface px-3 py-1 text-sm"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded border border-border-default">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border-subtle bg-surface text-text-tertiary">
            <tr>
              <th className="px-4 py-3 font-medium">Run</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Actions</th>
              <th className="px-4 py-3 font-medium">Retries</th>
              <th className="px-4 py-3 font-medium">Fingerprint</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {rows.map(({ id, fixture, metrics, duration }) => (
              <tr key={id} className="hover:bg-surface-hover">
                <td className="px-4 py-3">
                  <Link
                    href={`/runs/${DEMO_TRACE_IDS[id]}`}
                    className="font-medium hover:text-accent"
                  >
                    {TRACE_LABELS[id].title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-text-secondary capitalize">
                  {fixture.run.status}
                </td>
                <td className="px-4 py-3 font-mono tabular-nums">
                  {formatDuration(duration)}
                </td>
                <td className="px-4 py-3 tabular-nums">{metrics.totalActions}</td>
                <td className="px-4 py-3 tabular-nums">{metrics.retries}</td>
                <td className="px-4 py-3 font-mono text-xs text-text-tertiary">
                  {getFingerprint(fixture.events)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
