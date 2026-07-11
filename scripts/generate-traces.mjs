import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

/**
 * Generates trace JSON files from fixture definitions.
 * Run: node scripts/generate-traces.mjs
 * Requires built shared package or uses dynamic import from web fixtures.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const tracesDir = join(root, "traces");

// Import will happen after pnpm build; for now write placeholder note
mkdirSync(tracesDir, { recursive: true });

const note = {
  _note: "Controlled demo traces. Regenerate with: pnpm --filter @one-prompt/web exec node ../../scripts/generate-traces.mjs",
  traces: [
    "duplicate-order-clean.json",
    "duplicate-order-detour.json",
    "duplicate-order-late-failure.json",
  ],
};

writeFileSync(join(tracesDir, "README.json"), JSON.stringify(note, null, 2));
console.log("Created traces/ directory. Trace data lives in apps/web/src/lib/traces/fixtures.ts");
