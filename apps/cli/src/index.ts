#!/usr/bin/env node
import path from 'node:path';
import { scanWorkspace } from '@apisentry/analyzer';
import { renderConsoleReport } from './reporters/consoleReporter.js';
import { renderJsonReport } from './reporters/jsonReporter.js';
import { startPreviewServer } from './preview/previewServer.js';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'scan';

  if (command === '--help' || command === '-h') {
    console.log(`
APISentry CLI - Static API Contract Scanner

Usage:
  apisentry scan [options]      Scan workspace contracts via terminal
  apisentry preview [options]   Launch instant web UI preview dashboard

Options:
  --format <console|json>  Output format for scan command (default: console)
  --ci                     Exit with code 1 if any error severity contract issue is found
  --port <number>          Port for preview web server (default: 4200)
  --path <dir>             Workspace root path (default: current working directory)
  --help, -h               Show help message
`);
    process.exit(0);
  }

  const pathIndex = args.indexOf('--path');
  const targetDir = pathIndex !== -1 ? path.resolve(args[pathIndex + 1]) : process.cwd();

  if (command === 'preview') {
    const portIndex = args.indexOf('--port');
    const port = portIndex !== -1 ? parseInt(args[portIndex + 1], 10) : 4200;
    startPreviewServer(targetDir, port);
    return;
  }

  const formatIndex = args.indexOf('--format');
  const format = formatIndex !== -1 ? args[formatIndex + 1] : 'console';
  const isCi = args.includes('--ci');

  try {
    const result = await scanWorkspace(targetDir);

    if (format === 'json') {
      console.log(renderJsonReport(result));
    } else {
      renderConsoleReport(result);
    }

    if (isCi) {
      const hasErrors = result.issues.some(i => i.severity === 'error');
      if (hasErrors) {
        process.exit(1);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Fatal APISentry error:', err);
    process.exit(2);
  }
}

main();
