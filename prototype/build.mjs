import { build } from 'esbuild';
import { cp, mkdir } from 'node:fs/promises';
import { URL, fileURLToPath } from 'node:url';
const root = new URL('./', import.meta.url);
await mkdir(new URL('dist/', root), { recursive: true });
await build({ entryPoints: [fileURLToPath(new URL('src/main.tsx', root))], outdir: fileURLToPath(new URL('dist/', root)), bundle: true, format: 'esm', target: 'es2022', minify: true, logLevel: 'info', entryNames: 'app', external: ['/assets/*'] });
await cp(new URL('index.html', root), new URL('dist/index.html', root));
await cp(new URL('assets/', root), new URL('dist/assets/', root), { recursive: true });
