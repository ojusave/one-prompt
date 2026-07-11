import type { RunResult } from "@one-prompt/shared";
import Link from "next/link";
import { Button } from "@/components/primitives/Button";

interface RunCompletionSummaryProps {
  result: RunResult;
  runId: string;
}

export function RunCompletionSummary({ result, runId }: RunCompletionSummaryProps) {
  return (
    <div className="border-t border-border-subtle bg-surface-raised px-6 py-4">
      <p className="text-sm text-text-tertiary">
        The prompt was fixed. The execution path was not.
      </p>
      <h3 className="mt-2 text-lg font-medium">{result.title}</h3>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        {result.cause && (
          <div>
            <dt className="text-text-tertiary">Cause</dt>
            <dd className="text-text-secondary">{result.cause}</dd>
          </div>
        )}
        {result.fix && (
          <div>
            <dt className="text-text-tertiary">Fix</dt>
            <dd className="text-text-secondary">{result.fix}</dd>
          </div>
        )}
        {result.verification && (
          <div>
            <dt className="text-text-tertiary">Verification</dt>
            <dd className="text-text-secondary">{result.verification}</dd>
          </div>
        )}
      </dl>
      <div className="mt-4 flex gap-3">
        <Link href={`/runs/${runId}`}>
          <Button size="sm" variant="secondary">
            Replay execution
          </Button>
        </Link>
        <Link href="/compare?runs=demo-clean,demo-detour,demo-late-failure">
          <Button size="sm" variant="ghost">
            Compare runs
          </Button>
        </Link>
      </div>
    </div>
  );
}
