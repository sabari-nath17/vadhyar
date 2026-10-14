import { build } from 'esbuild';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { URL, fileURLToPath } from 'node:url';
const root = new URL('./', import.meta.url);
await mkdir(new URL('dist/', root), { recursive: true });
const result = await build({ entryPoints: [fileURLToPath(new URL('src/main.tsx', root))], outdir: fileURLToPath(new URL('dist/', root)), bundle: true, format: 'esm', target: 'es2022', minify: true, metafile: true, logLevel: 'info', entryNames: 'app', external: ['/assets/*'] });
await cp(new URL('index.html', root), new URL('dist/index.html', root));
await cp(new URL('assets/', root), new URL('dist/assets/', root), { recursive: true });
let notices = 'Vadhyar browser source and dependency notices\n';
for (const name of ['learn-claude-code', 'pocketflow']) notices += `\nAdapted ${name} source; modifications and mapping: docs/browser-reuse.md\n${await readFile(new URL(`../docs/third-party/${name}-LICENSE.txt`, root), 'utf8')}\n`;
const packages = new Set(Object.keys(result.metafile.inputs).map(path => /(.*node_modules\/(?:@[^/]+\/)?[^/]+)/.exec(path)?.[1]).filter(Boolean));
for (const directory of [...packages].sort()) {
 const metadata = JSON.parse(await readFile(`${directory}/package.json`, 'utf8'));
 let license;
 for (const name of ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'LICENCE']) { try { license = await readFile(`${directory}/${name}`, 'utf8'); break; } catch (error) { if (error.code !== 'ENOENT') throw error; } }
 if (!license) throw new Error(`Missing bundled license text for ${metadata.name}.`);
 notices += `\n${metadata.name} ${metadata.version}\n${license}\n`;
}
await writeFile(new URL('dist/THIRD_PARTY_NOTICES.txt', root), notices);
