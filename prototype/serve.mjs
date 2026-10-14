import { createServer } from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import { fileURLToPath, URL } from 'node:url';
import { join, sep } from 'node:path';
import process from 'node:process';
const directory = fileURLToPath(new URL('dist/', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.woff2': 'font/woff2' };
export function mockServer() {
 return createServer(async (request, response) => {
  response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'");
  response.setHeader('X-Content-Type-Options', 'nosniff'); response.setHeader('Cache-Control', 'no-store');
  const host = request.headers.host ?? '';
  if (!/^127\.0\.0\.1:\d+$/.test(host)) { response.writeHead(403); response.end('Invalid host'); return; }
  if (!['GET', 'HEAD'].includes(request.method ?? '')) { response.writeHead(405, { Allow: 'GET, HEAD' }); response.end(); return; }
  try {
   const path = decodeURIComponent((request.url ?? '/').split('?')[0]);
   if (path.includes('..') || path.includes('\\') || path.includes('\0') || !/^\/(?:index\.html|app\.(?:js|css)|assets\/[a-z0-9_.-]+)?$/.test(path)) { response.writeHead(404); response.end('Not found'); return; }
   const target = await realpath(join(directory, path === '/' ? 'index.html' : path)); const base = await realpath(directory);
   if (!target.startsWith(base + sep)) { response.writeHead(404); response.end('Not found'); return; }
   const extension = target.slice(target.lastIndexOf('.')); const type = types[extension];
   if (!type) { response.writeHead(404); response.end('Not found'); return; }
   const body = await readFile(target); response.writeHead(200, { 'Content-Type': type }); response.end(request.method === 'HEAD' ? undefined : body);
  } catch { response.writeHead(404); response.end('Not found'); }
 });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
 const port = Number(process.env.VADHYAR_MOCK_PORT ?? 4173);
 if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Choose a valid local prototype port (1024–65535).');
 const server = mockServer(); server.on('error', () => { process.stderr.write('Prototype server could not start. Check the port and build output.\n'); process.exitCode = 1; });
 server.listen(port, '127.0.0.1', () => process.stdout.write(`Vadhyar mock: http://127.0.0.1:${port}\n`));
}
