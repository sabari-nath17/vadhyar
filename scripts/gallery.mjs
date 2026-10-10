import { URL } from 'node:url';
import { build } from 'esbuild';
import { createServer } from 'node:http';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const output = resolve('dist/gallery');
await mkdir(output, { recursive: true });
await build({ entryPoints: ['src/panel/v2/gallery.tsx'], bundle: true, outfile: `${output}/gallery.js`, platform: 'browser', format: 'iife', target: 'es2022', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' } });
await build({ entryPoints: ['src/panel/v2/style.css'], bundle: true, outfile: `${output}/gallery.css`, loader: { '.woff2': 'file' } });
await cp('media', `${output}/media`, { recursive: true });
const html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="/gallery/"><title>Vadhyar V2 component gallery</title><link rel="stylesheet" href="gallery.css"></head><body><div id="root"></div><script src="gallery.js"></script></body></html>';
await writeFile(`${output}/index.html`, html);
if (process.argv.includes('--serve')) {
  const portIndex = process.argv.indexOf('--port');
  const port = portIndex < 0 ? 4174 : Number(process.argv[portIndex + 1]);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Choose a valid local port.');
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png' };
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://127.0.0.1');
      if (url.pathname === '/' || url.pathname === '/gallery') { response.writeHead(302, { Location: '/gallery/' + url.search }).end(); return; }
      if (!url.pathname.startsWith('/gallery/')) { response.writeHead(404).end(); return; }
      const file = resolve(output, decodeURIComponent(url.pathname.slice('/gallery/'.length) || 'index.html'));
      if (!file.startsWith(output + sep)) { response.writeHead(403).end(); return; }
      const content = await readFile(file);
      response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' }).end(content);
    } catch { response.writeHead(404).end(); }
  });
  server.listen(port, '127.0.0.1', () => { process.stdout.write(`Gallery: http://127.0.0.1:${port}/gallery/\n`); });
}
