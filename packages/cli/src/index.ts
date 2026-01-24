#!/usr/bin/env bun

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const VERSION = "0.1.0";

const HELP = `
finished-cli v${VERSION}

USAGE:
  finished-cli <command> [options]

COMMANDS:
  install     Install AGENTS hooks into target repository
  hook-run    Execute AGENTS hook (called by git hooks)

OPTIONS:
  --target <path>   Target repository path (defaults to cwd)
  --force           Overwrite existing hooks
  --help, -h        Show this help message
  --version, -v     Show version

EXAMPLES:
  finished-cli install
  finished-cli install --target /path/to/repo --force
  finished-cli hook-run
`;

function parseArgs(args: string[]): {
  command: string | null;
  target: string;
  force: boolean;
  help: boolean;
  version: boolean;
} {
  const result = {
    command: null as string | null,
    target: process.cwd(),
    force: false,
    help: false,
    version: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--help" || arg === "-h") {
      result.help = true;
    } else if (arg === "--version" || arg === "-v") {
      result.version = true;
    } else if (arg === "--force") {
      result.force = true;
    } else if (arg === "--target") {
      const next = args[++i];
      if (!next) {
        console.error("Error: --target requires a path argument");
        process.exit(1);
      }
      result.target = resolve(next);
    } else if (!arg.startsWith("-") && !result.command) {
      result.command = arg;
    }
  }

  return result;
}

function installHooks(target: string, force: boolean): void {
  const gitDir = join(target, ".git");
  const hooksDir = join(gitDir, "hooks");
  const postCommitHook = join(hooksDir, "post-commit");

  if (!existsSync(gitDir)) {
    console.error(
      `Error: ${target} is not a git repository (no .git directory)`,
    );
    process.exit(1);
  }

  if (!existsSync(hooksDir)) {
    mkdirSync(hooksDir, { recursive: true });
  }

  if (existsSync(postCommitHook) && !force) {
    console.error(
      `Error: ${postCommitHook} already exists. Use --force to overwrite.`,
    );
    process.exit(1);
  }

  const hookContent = `#!/bin/sh
# AGENTS hook - installed by finished-cli
# This hook runs after each commit to process AGENTS.md

exec finished-cli hook-run
`;

  writeFileSync(postCommitHook, hookContent, { mode: 0o755 });
  console.log(`Installed AGENTS hook: ${postCommitHook}`);
}

function hookRun(target: string): void {
  const agentsFile = join(target, "AGENTS.md");

  if (!existsSync(agentsFile)) {
    console.log("No AGENTS.md found in repository root. Skipping.");
    return;
  }

  const content = readFileSync(agentsFile, "utf-8");
  console.log(`[AGENTS] Found AGENTS.md (${content.length} bytes)`);
  console.log("[AGENTS] Hook executed successfully (placeholder behavior)");
}

function main(): void {
  const args = process.argv.slice(2);
  const parsed = parseArgs(args);

  if (parsed.help || (!parsed.command && !parsed.version)) {
    console.log(HELP);
    process.exit(0);
  }

  if (parsed.version) {
    console.log(`finished-cli v${VERSION}`);
    process.exit(0);
  }

  switch (parsed.command) {
    case "install":
      installHooks(parsed.target, parsed.force);
      break;
    case "hook-run":
      hookRun(parsed.target);
      break;
    default:
      console.error(`Unknown command: ${parsed.command}`);
      console.log(HELP);
      process.exit(1);
  }
}

main();
