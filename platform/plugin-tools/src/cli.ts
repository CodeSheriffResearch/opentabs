#!/usr/bin/env bun

import { registerBuildCommand } from './commands/index.js';
import { Command } from 'commander';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const cliDir = dirname(fileURLToPath(import.meta.url));
const pkgJson = JSON.parse(await Bun.file(join(cliDir, '..', 'package.json')).text()) as { version: string };

const program = new Command('opentabs-plugin')
  .version(pkgJson.version, '-V, --version')
  .description('OpenTabs plugin tools — build and validate plugins')
  .action(() => {
    program.help();
  });

registerBuildCommand(program);

await program.parseAsync();
