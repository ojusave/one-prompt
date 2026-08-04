#!/usr/bin/env node
/**
 * Render QA still frames for Clean Path and Late Failure compositions.
 */
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const videoRoot = join(__dirname, "..");
const outStills = join(videoRoot, "../../out/stills");

mkdirSync(outStills, { recursive: true });

const frames = [
  { composition: "OnePromptCleanPath", frame: 15, file: "clean-opening.png" },
  { composition: "OnePromptCleanPath", frame: 210, file: "clean-parallel.png" },
  { composition: "OnePromptCleanPath", frame: 555, file: "clean-deploy.png" },
  { composition: "OnePromptCleanPath", frame: 779, file: "clean-final.png" },
  { composition: "OnePromptLateFailure", frame: 15, file: "late-opening.png" },
  { composition: "OnePromptLateFailure", frame: 465, file: "late-checkpoint.png" },
  { composition: "OnePromptLateFailure", frame: 600, file: "late-failure.png" },
  { composition: "OnePromptLateFailure", frame: 705, file: "late-retry.png" },
  { composition: "OnePromptLateFailure", frame: 899, file: "late-final.png" },
];

for (const item of frames) {
  const out = join(outStills, item.file);
  console.log(`Rendering ${item.file} (frame ${item.frame})...`);
  execSync(
    `pnpm exec remotion still src/index.ts ${item.composition} ${out} --frame=${item.frame}`,
    { cwd: videoRoot, stdio: "inherit" }
  );
}

console.log(`QA stills written to ${outStills}`);
