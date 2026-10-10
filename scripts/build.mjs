import { build } from 'esbuild';

await build({ entryPoints: ['src/extension/extension.ts'], outfile: 'dist/extension.cjs', bundle: true, platform: 'node', format: 'cjs', target: 'node22', external: ['vscode'], sourcemap: true });
await build({ entryPoints: ['scripts/host-test.ts'], outfile: 'dist/host-test.cjs', bundle: true, platform: 'node', format: 'cjs', target: 'node22', external: ['vscode'] });
await build({ entryPoints: ['src/panel/app.tsx'], outfile: 'dist/panel.js', bundle: true, platform: 'browser', format: 'iife', target: 'es2022', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' } });
await build({ entryPoints: ['src/panel/style.css'], outfile: 'dist/panel.css' });
