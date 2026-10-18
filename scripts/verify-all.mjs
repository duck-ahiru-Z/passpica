import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const scriptsDirectory = path.join(root, 'scripts');
const currentScript = path.resolve(fileURLToPath(import.meta.url));
const verificationScripts = fs.readdirSync(scriptsDirectory)
  .filter(name => name.startsWith('verify-') && name.endsWith('.mjs'))
  .map(name => path.join(scriptsDirectory, name))
  .filter(script => path.resolve(script) !== currentScript)
  .sort((left, right) => left.localeCompare(right));

if (verificationScripts.length === 0) {
  throw new Error('No verification scripts were found.');
}

const failedScripts = [];
for (const script of verificationScripts) {
  console.log(`\n=== ${path.basename(script)} ===`);
  const result = spawnSync(process.execPath, ['--experimental-strip-types', script], {
    cwd: root,
    stdio: 'inherit',
  });

  if (result.error) {
    console.error(result.error);
    failedScripts.push(path.basename(script));
  } else if (result.status !== 0) {
    failedScripts.push(path.basename(script));
  }
}

if (failedScripts.length > 0) {
  console.error(`\n${failedScripts.length}/${verificationScripts.length} verification scripts failed: ${failedScripts.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log(`\nAll ${verificationScripts.length} verification scripts passed.`);
}
