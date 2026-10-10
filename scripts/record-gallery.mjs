import { build } from 'esbuild';
await build({ entryPoints: ['scripts/gallery-evidence.ts'], bundle: true, outfile: 'dist/gallery-evidence.mjs', platform: 'node', format: 'esm', target: 'node22' });
await import('../dist/gallery-evidence.mjs');
