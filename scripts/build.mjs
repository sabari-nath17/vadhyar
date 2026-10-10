import { build } from 'esbuild';

await build({ entryPoints: ['src/extension/extension.ts'], outfile: 'dist/extension.cjs', bundle: true, platform: 'node', format: 'cjs', target: 'node22', external: ['vscode'], sourcemap: true });
await build({ entryPoints: ['scripts/host-test.ts'], outfile: 'dist/host-test.cjs', bundle: true, platform: 'node', format: 'cjs', target: 'node22', external: ['vscode'] });
