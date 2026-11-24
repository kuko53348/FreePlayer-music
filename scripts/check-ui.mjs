// scripts/check-ui.mjs
// Clean-UI gate for musicUI: tokens, the 8-based scale, tap targets, field
// labels and measured WCAG contrast, checked by the installed flet-box.
//
//   npm run ui              scan src/ and fail on a real finding
//   npm run ui -- --tokens  print the measured contrast of every token
//   npm run ui -- --strict  contrast warnings fail the run too
//   npm run ui -- --json    machine-readable findings

import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);

function resolvePackage() {
  const candidates = [path.resolve(process.cwd(), 'node_modules/flet-box')];
  try {
    candidates.push(path.dirname(require.resolve('flet-box/package.json')));
  } catch {
    /* not installed yet */
  }
  const fs = require('fs');
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'bin/commands/checkUi.js'))) return dir;
  }
  console.error('flet-box package not found. Run: npm install');
  process.exit(1);
}

const checker = path.join(resolvePackage(), 'bin', 'commands', 'checkUi.js');
const { checkUi } = await import(pathToFileURL(checker).href);

const { exitCode } = await checkUi(process.argv.slice(2));
process.exit(exitCode);
