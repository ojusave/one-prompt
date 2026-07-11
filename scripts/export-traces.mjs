import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const { getTraceFixture } = await import("../apps/web/src/lib/traces/fixtures.ts");

const __dirname = dirname(fileURLToPath(import.meta.url));
const tracesDir = join(__dirname, "..", "traces");
mkdirSync(tracesDir, { recursive: true });

const files = {
  "duplicate-order-clean.json": "clean",
  "duplicate-order-detour.json": "detour",
  "duplicate-order-late-failure.json": "late-failure",
};

for (const [filename, id] of Object.entries(files)) {
  const fixture = getTraceFixture(id);
  writeFileSync(join(tracesDir, filename), JSON.stringify(fixture, null, 2));
  console.log(`Wrote traces/${filename} (${fixture.events.length} events)`);
}
