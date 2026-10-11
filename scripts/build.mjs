import { cp, mkdir } from 'node:fs/promises';
import { build } from 'esbuild';

await build({ entryPoints: ['src/extension/extension.ts'], outfile: 'dist/extension.cjs', bundle: true, platform: 'node', format: 'cjs', target: 'node22', external: ['vscode'], sourcemap: true });
await build({ entryPoints: ['scripts/host-test.ts'], outfile: 'dist/host-test.cjs', bundle: true, platform: 'node', format: 'cjs', target: 'node22', external: ['vscode'] });
await build({ entryPoints: ['src/panel/app.tsx'], outfile: 'dist/panel.js', bundle: true, platform: 'browser', format: 'iife', target: 'es2022', jsx: 'automatic', loader: { '.png': 'file' }, define: { 'process.env.NODE_ENV': '"production"' } });
await build({ entryPoints: ['src/panel/style.css'], bundle: true, outfile: 'dist/panel.css', loader: { '.woff2': 'file' } });

await mkdir('dist/media', { recursive: true });
for (const folder of ['brand','guide','path','stickers','gates']) await cp(`media/${folder}`, `dist/media/${folder}`, { recursive: true });
