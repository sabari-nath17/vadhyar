import { createServer } from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import { fileURLToPath, URL } from 'node:url';
import { join, sep, resolve } from 'node:path';
import process from 'node:process';
const directory = fileURLToPath(new URL('dist/', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.woff2': 'font/woff2' };
export function mockServer({ service } = {}) {
 return createServer(async (request, response) => {
  response.setHeader('Content-Security-Policy', `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src ${service ? "'self'" : "'none'"}; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'`);
  response.setHeader('X-Content-Type-Options', 'nosniff'); response.setHeader('Cache-Control', 'no-store');
  const host = request.headers.host ?? '';
  if (host !== `127.0.0.1:${request.socket.localPort}`) { response.writeHead(403); response.end('Invalid host'); return; }
  if (service && await service.handle(request, response)) return;
  if (!['GET', 'HEAD'].includes(request.method ?? '')) { response.writeHead(405, { Allow: 'GET, HEAD' }); response.end(); return; }
  try {
   const path = decodeURIComponent((request.url ?? '/').split('?')[0]);
   if (path.includes('..') || path.includes('\\') || path.includes('\0') || !/^\/(?:index\.html|THIRD_PARTY_NOTICES\.txt|app\.(?:js|css)|assets\/[a-z0-9_.-]+)?$/.test(path)) { response.writeHead(404); response.end('Not found'); return; }
   const target = await realpath(join(directory, path === '/' ? 'index.html' : path)); const base = await realpath(directory);
   if (!target.startsWith(base + sep)) { response.writeHead(404); response.end('Not found'); return; }
   const extension = target.slice(target.lastIndexOf('.')); const type = path === '/THIRD_PARTY_NOTICES.txt' ? 'text/plain; charset=utf-8' : types[extension];
   if (!type) { response.writeHead(404); response.end('Not found'); return; }
   const body = await readFile(target); response.writeHead(200, { 'Content-Type': type }); response.end(request.method === 'HEAD' ? undefined : body);
  } catch { response.writeHead(404); response.end('Not found'); }
 });
}
export async function launchProject() {
 const port = Number(process.env.VADHYAR_MOCK_PORT ?? 4173);
 if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Choose a valid local prototype port (1024–65535).');
 const args = process.argv.slice(2);
 if (args.length && (args.length !== 2 || args[0] !== '--project')) throw new Error('Use --project followed by one trusted local folder.');
 const root = resolve(args[1] ?? process.cwd());
 const { createProjectService } = await import('./project-service.mjs');
 const { createTeachingService } = await import('./teaching-service.mjs');
 const { createWalkthroughHandler } = await import('./walkthrough-service.mjs');
 let service;
 const teaching = createTeachingService({ readSource: (...values) => service.readSource(...values) });
 const walkthrough = createWalkthroughHandler({ readSource: (...values) => service.readSource(...values) });
 service = await createProjectService({ root, origin: `http://127.0.0.1:${port}`, handleExtraApi: async (request, response) => await walkthrough(request, response) || teaching.handle(request, response) });
 const server = mockServer({ service });
 const stop = async () => { teaching.close(); await service.close(); server.close(); };
 process.once('SIGINT', () => { void stop(); }); process.once('SIGTERM', () => { void stop(); });
 server.on('error', () => { process.stderr.write('Project companion could not start. Check the port, project folder and build output.\n'); process.exitCode = 1; void stop(); });
 server.listen(port, '127.0.0.1', () => process.stdout.write(`Vadhyar companion: http://127.0.0.1:${port}\n`));
 return { server, service, teaching, stop };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
 try { await launchProject(); } catch { process.stderr.write('Project companion setup failed. Use --project with an existing trusted folder and supported Node.js.\n'); process.exitCode = 1; }
}
