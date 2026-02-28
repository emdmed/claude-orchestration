#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.join(__dirname, "..", "templates", "orchestration");
const DEST_NAME = ".orchestration";

const ORCHESTRATION_INSTRUCTION = `

## Orchestration

For complex tasks, refer to .orchestration/orchestration.md for available workflows.
`;

async function findOrchestraMdFiles(projectDir) {
  const entries = await fs.readdir(projectDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase() === "orchestration.md")
    .map((entry) => entry.name);
}

async function updateOrchestraMd(projectDir) {
  const mdFiles = await findOrchestraMdFiles(projectDir);

  if (mdFiles.length === 0) {
    const newFilePath = path.join(projectDir, "ORCHESTRATION.md");
    await fs.writeFile(newFilePath, `# ORCHESTRATION.md${ORCHESTRATION_INSTRUCTION}`);
    console.log("  Created: ORCHESTRATION.md");
    return;
  }

  for (const fileName of mdFiles) {
    const mdPath = path.join(projectDir, fileName);
    const content = await fs.readFile(mdPath, "utf-8");

    if (content.includes(".orchestration/orchestration.md")) {
      console.log(`  Skipped: ${fileName} already references orchestration.md`);
      continue;
    }

    await fs.appendFile(mdPath, ORCHESTRATION_INSTRUCTION);
    console.log(`  Updated: ${fileName}`);
  }
}

async function main() {
  const targetDir = path.join(process.cwd(), DEST_NAME);

  try {
    console.log("Agent Orchestration Setup\n");

    await fs.mkdir(targetDir, { recursive: true });

    const orchestrationSrc = path.join(SOURCE_DIR, "orchestration.md");
    const orchestrationDest = path.join(targetDir, "orchestration.md");
    await fs.mkdir(path.dirname(orchestrationDest), { recursive: true });
    await fs.copyFile(orchestrationSrc, orchestrationDest);
    console.log(`  Created: ${path.relative(process.cwd(), orchestrationDest)}`);

    await updateOrchestraMd(process.cwd());
    console.log("\nDone! Orchestration files have been added to .orchestration/");
    console.log("Workflows are fetched at runtime from the CDN — always up to date.");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();
