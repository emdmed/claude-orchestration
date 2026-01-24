#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
Usage: npx claude-orchestration

Scaffolds Claude orchestration workflows into your project.

Creates a .claude/ directory with workflow templates for:
  - feature.md   Building new functionality
  - bugfix.md    Diagnosing and fixing bugs
  - refactor.md  Improving code structure
  - pr.md        Creating pull requests
  - docs.md      Writing documentation

Options:
  -h, --help     Show this help message
  -v, --version  Show version number
`);
  process.exit(0);
}

if (process.argv.includes("--version") || process.argv.includes("-v")) {
  const pkg = JSON.parse(
    await fs.readFile(path.join(__dirname, "..", "package.json"), "utf-8")
  );
  console.log(pkg.version);
  process.exit(0);
}

const SOURCE_DIR = path.join(__dirname, "..", "templates", "claude");
const DEST_NAME = ".claude";
const CLAUDE_MD = "CLAUDE.md";

const ORCHESTRATION_INSTRUCTION = `

## Orchestration

For complex tasks, refer to .claude/orchestration.md for available workflows.
`;

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function updateClaudeMd(projectDir) {
  const claudeMdPath = path.join(projectDir, CLAUDE_MD);

  if (await fileExists(claudeMdPath)) {
    const content = await fs.readFile(claudeMdPath, "utf-8");

    if (content.includes(".claude/orchestration.md")) {
      console.log(`  Skipped: ${CLAUDE_MD} already references orchestration.md`);
      return;
    }

    await fs.appendFile(claudeMdPath, ORCHESTRATION_INSTRUCTION);
    console.log(`  Updated: ${CLAUDE_MD}`);
  }
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
      console.log(`  Created: ${path.relative(process.cwd(), destPath)}`);
    }
  }
}

async function main() {
  const targetDir = path.join(process.cwd(), DEST_NAME);

  console.log("Claude Orchestration Setup\n");

  try {
    await copyDir(SOURCE_DIR, targetDir);
    await updateClaudeMd(process.cwd());
    console.log("\nDone! Orchestration files have been added to .claude/");
  } catch (error) {
    console.error("Error copying files:", error.message);
    process.exit(1);
  }
}

main();
