/**
 * Render Workflow tasks for scripted live demo.
 * Deploy separately via Render Dashboard (Workflows not yet in Blueprints).
 */
import { task } from "@renderinc/sdk/workflows";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const understandPrompt = task(
  { name: "understand_prompt", plan: "starter", timeoutSeconds: 60 },
  async function understandPrompt(prompt: string) {
    await delay(1200);
    return { phase: "planning", prompt };
  }
);

export const inspectRetryConfiguration = task(
  { name: "inspect_retry_configuration", plan: "starter", timeoutSeconds: 120 },
  async function inspectRetryConfiguration() {
    await delay(2000);
    return { finding: "Request-level retries enabled on checkout handler" };
  }
);

export const inspectOrderCreation = task(
  { name: "inspect_order_creation", plan: "starter", timeoutSeconds: 120 },
  async function inspectOrderCreation() {
    await delay(2400);
    return { finding: "Order write lacks idempotency key" };
  }
);

export const runVerification = task(
  {
    name: "run_verification",
    plan: "starter",
    timeoutSeconds: 120,
    retry: { maxRetries: 1, waitDurationMs: 2000, backoffScaling: 2 },
  },
  async function runVerification(attempt: number) {
    await delay(3000);
    if (attempt === 1) {
      throw new Error("VerificationTimeout: notification dependency timed out");
    }
    return { verified: true, orders: 1 };
  }
);

export const runDuplicateOrderInvestigation = task(
  { name: "run_duplicate_order_investigation", plan: "standard", timeoutSeconds: 600 },
  async function runDuplicateOrderInvestigation(prompt: string) {
    await understandPrompt(prompt);
    await Promise.all([
      inspectRetryConfiguration(),
      inspectOrderCreation(),
    ]);
    try {
      await runVerification(1);
    } catch {
      await runVerification(2);
    }
    return { status: "success", title: "Investigation complete" };
  }
);

// Register entry for Render Workflow service
export const tasks = [
  understandPrompt,
  inspectRetryConfiguration,
  inspectOrderCreation,
  runVerification,
  runDuplicateOrderInvestigation,
];
