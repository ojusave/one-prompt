import type { ExecutionEvent } from "@one-prompt/shared";

interface SideEffectDetailsProps {
  sideEffect: NonNullable<ExecutionEvent["sideEffect"]>;
}

export function SideEffectDetails({ sideEffect }: SideEffectDetailsProps) {
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between gap-4">
        <dt className="text-text-tertiary">Occurred</dt>
        <dd>{sideEffect.occurred ? "Yes" : "No"}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-text-tertiary">Type</dt>
        <dd className="uppercase">{sideEffect.type.replace("_", " ")}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-text-tertiary">Safe to retry</dt>
        <dd className={sideEffect.safeToRetry ? "text-success" : "text-warning"}>
          {sideEffect.safeToRetry ? "Yes" : "No"}
        </dd>
      </div>
      {sideEffect.strategy && (
        <div className="flex justify-between gap-4">
          <dt className="text-text-tertiary">Protection</dt>
          <dd>{sideEffect.strategy}</dd>
        </div>
      )}
      {sideEffect.idempotencyKey && (
        <div>
          <dt className="text-text-tertiary">Idempotency key</dt>
          <dd className="mt-1 font-mono text-xs">{sideEffect.idempotencyKey}</dd>
        </div>
      )}
      {sideEffect.compensation && (
        <div>
          <dt className="text-text-tertiary">Compensation</dt>
          <dd className="mt-1 text-text-secondary">{sideEffect.compensation}</dd>
        </div>
      )}
    </dl>
  );
}
