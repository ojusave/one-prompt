import type { RunMetrics } from "@one-prompt/shared";

export function RunMetrics({ metrics }: { metrics: RunMetrics }) {
  const items = [
    { label: "Actions", value: metrics.totalActions },
    { label: "Concurrency", value: metrics.maxConcurrency },
    { label: "Retries", value: metrics.retries },
    { label: "Side effects", value: metrics.sideEffects },
    { label: "Model calls", value: metrics.modelCalls },
    { label: "Tool calls", value: metrics.toolCalls },
  ];

  return (
    <div className="mt-3 flex flex-wrap gap-4 border-t border-border-subtle pt-3">
      {items.map((item) => (
        <div key={item.label} className="text-sm">
          <span className="text-text-tertiary">{item.label}</span>
          <span className="ml-2 font-mono text-base tabular-nums text-text-primary">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
