#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { checkbox, confirm } from "@inquirer/prompts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkg = JSON.parse(
  await fs.readFile(path.join(__dirname, "..", "package.json"), "utf-8")
);

const SOURCE_DIR = path.join(__dirname, "..", "templates", "orchestration");
const WORKFLOWS_DIR = path.join(SOURCE_DIR, "workflows");
const DEST_NAME = ".orchestration";

const ORCHESTRATION_INSTRUCTION = `

## Orchestration

For complex tasks, refer to .orchestration/orchestration.md for available workflows.
`;

const ROOT_WORKFLOWS = [
  {
    name: "todo.md",
    description: "Multi-step task management (uses 15-20% more tokens)",
    checked: false,
  },
];

async function getWorkflowFolders() {
  const entries = await fs.readdir(WORKFLOWS_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

async function getWorkflowFiles(folder) {
  const folderPath = path.join(WORKFLOWS_DIR, folder);
  const entries = await fs.readdir(folderPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name);
}

function formatFolderName(folder) {
  return folder.charAt(0).toUpperCase() + folder.slice(1);
}

function formatWorkflowName(filename) {
  const name = filename.replace(".md", "");
  return name.charAt(0).toUpperCase() + name.slice(1);
}

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

async function copyFile(src, dest) {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(src, dest);
  console.log(`  Created: ${path.relative(process.cwd(), dest)}`);
}

async function runInteractiveSetup() {
  console.log("Agent Orchestration Setup\n");

  const folders = await getWorkflowFolders();
  const selectedFiles = [];

  // Step 1: Select workflow folders
  const selectedFolders = await checkbox({
    message: "Select workflow categories:",
    choices: folders.map((folder) => ({
      name: formatFolderName(folder),
      value: folder,
      checked: true,
    })),
  });

  // Step 2: For each selected folder, select individual workflows
  for (const folder of selectedFolders) {
    const files = await getWorkflowFiles(folder);

    const selectedWorkflows = await checkbox({
      message: `Select ${formatFolderName(folder)} workflows:`,
      choices: files.map((file) => ({
        name: formatWorkflowName(file),
        value: file,
        checked: true,
      })),
    });

    for (const file of selectedWorkflows) {
      selectedFiles.push({ folder, file });
    }
  }

  // Step 3: Select root-level workflows (like todo.md)
  if (ROOT_WORKFLOWS.length > 0) {
    const selectedRootWorkflows = await checkbox({
      message: "Select additional workflows:",
      choices: ROOT_WORKFLOWS.map((w) => ({
        name: `${w.name} - ${w.description}`,
        value: w.name,
        checked: w.checked,
      })),
    });

    for (const file of selectedRootWorkflows) {
      selectedFiles.push({ folder: null, file });
    }
  }

  if (selectedFiles.length === 0) {
    const continueWithOrchestration = await confirm({
      message: "No workflows selected. Install only the orchestration guide?",
      default: true,
    });

    if (!continueWithOrchestration) {
      console.log("Setup cancelled.");
      process.exit(0);
    }
  }

  return selectedFiles;
}

async function getAllWorkflows() {
  const folders = await getWorkflowFolders();
  const allFiles = [];

  for (const folder of folders) {
    const files = await getWorkflowFiles(folder);
    for (const file of files) {
      allFiles.push({ folder, file });
    }
  }

  for (const w of ROOT_WORKFLOWS) {
    allFiles.push({ folder: null, file: w.name });
  }

  return allFiles;
}

async function copySelectedWorkflows(selectedFiles, targetDir) {
  const workflowsDir = path.join(targetDir, "workflows");

  for (const { folder, file } of selectedFiles) {
    if (folder) {
      const src = path.join(WORKFLOWS_DIR, folder, file);
      const dest = path.join(workflowsDir, folder, file);
      await copyFile(src, dest);
    } else {
      const src = path.join(WORKFLOWS_DIR, file);
      const dest = path.join(workflowsDir, file);
      await copyFile(src, dest);
    }
  }
}

async function main(options) {
  const targetDir = path.join(process.cwd(), DEST_NAME);

  try {
    let selectedFiles;

    if (options.all) {
      selectedFiles = await getAllWorkflows();
      console.log("Agent Orchestration Setup\n");
      console.log("Installing all workflows...\n");
    } else {
      selectedFiles = await runInteractiveSetup();
      console.log();
    }

    await fs.mkdir(targetDir, { recursive: true });

    const orchestrationSrc = path.join(SOURCE_DIR, "orchestration.md");
    const orchestrationDest = path.join(targetDir, "orchestration.md");
    await copyFile(orchestrationSrc, orchestrationDest);

    if (selectedFiles.length > 0) {
      await copySelectedWorkflows(selectedFiles, targetDir);
    }

    await updateOrchestraMd(process.cwd());
    console.log("\nDone! Orchestration files have been added to .orchestration/");
  } catch (error) {
    console.error("Error copying files:", error.message);
    process.exit(1);
  }
}

const program = new Command();

program
  .name("agentic-orchestration")
  .description("Scaffolds agent orchestration workflows into your project")
  .version(pkg.version)
  .option("-a, --all", "Install all workflows without prompting")
  .action((options) => main(options));

program.parse();
