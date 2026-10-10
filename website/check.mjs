import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const folder = dirname(fileURLToPath(import.meta.url));
const html = await readFile(join(folder, 'index.html'), 'utf8');
const css = await readFile(join(folder, 'styles.css'), 'utf8');
assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
assert(html.includes('releases/download/v0.1.0/vadhyar-0.1.0.vsix'));
assert(html.includes('Illustrative walkthrough'));
assert(html.includes('VS Code 1.140.0'));
assert(css.includes('prefers-reduced-motion'));
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
 const url = match[1];
 if (!url.startsWith('http')) await access(join(folder, url));
 else assert(new URL(url).protocol === 'https:');
}
for (const match of html.matchAll(/href="#([^"]+)"/g)) assert(html.includes(`id="${match[1]}"`), `Missing anchor ${match[1]}`);
console.log('Website contract passed: download, honest example, prerequisites, local assets, anchors and reduced motion.');
