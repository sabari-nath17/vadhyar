import { spawnSync } from 'node:child_process';
import { fileURLToPath, URL } from 'node:url';
import process from 'node:process';

const root = fileURLToPath(new URL('../', import.meta.url));
const checks = [
 ['Typecheck', ['node_modules/typescript/bin/tsc', '-p', 'prototype/tsconfig.json']],
 ['Lint', ['node_modules/eslint/bin/eslint.js', 'prototype/src', 'prototype/*.ts', 'prototype/*.mjs', '--max-warnings=0']],
 ['Learning tests', ['node_modules/vitest/vitest.mjs', 'run', '--config', 'prototype/vitest.config.ts']],
 ['Build', ['prototype/build.mjs']],
 ['Local service tests', ['--test', 'prototype/project-service.test.mjs', 'prototype/teaching-service.test.mjs', 'prototype/server.test.mjs', 'prototype/walkthrough-service.test.mjs', 'prototype/knowledge-service.test.mjs']]
];
for (const [name, args] of checks) {
 process.stdout.write(`\n${name}\n`);
 const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit' });
 if (result.error || result.status !== 0) {
  process.stderr.write(`${name} did not pass.\n`);
  process.exit(result.status || 1);
 }
}
process.stdout.write('\nLocal prototype checks passed. Live provider and browser acceptance are separate.\n');
