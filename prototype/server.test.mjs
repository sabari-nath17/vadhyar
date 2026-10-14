import { test } from 'node:test';
import assert from 'node:assert/strict';
import { request } from 'node:http';
import { symlink, unlink } from 'node:fs/promises';
import { URL } from 'node:url';
import { mockServer } from './serve.mjs';
test('mock server serves compiled assets and rejects repository/API access, invalid hosts, writes and escaping links', async () => {
 const server = mockServer(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); const port = server.address().port;
 const get = (path, method = 'GET', host = `127.0.0.1:${port}`) => new Promise((resolve, reject) => { const r = request({ hostname: '127.0.0.1', port, path, method, headers: { Host: host } }, response => { let body = ''; response.setEncoding('utf8'); response.on('data', data => { body += data; }); response.on('end', () => resolve({ code: response.statusCode, headers: response.headers, body })); }); r.on('error', reject); r.end(); });
 const escaping = new URL('dist/assets/test-escape.png', import.meta.url);
 try {
  const index = await get('/'); assert.equal(index.code, 200); assert.match(index.body, /app\.js/); assert.match(index.headers['content-security-policy'], /connect-src 'none'/);
  assert.equal((await get('/app.css')).code, 200); assert.equal((await get('/app.js', 'HEAD')).body, '');
  const notices = await get('/THIRD_PARTY_NOTICES.txt'); assert.equal(notices.code,200); assert.match(notices.body,/Copyright \(c\) 2024 shareAI Lab/); assert.match(notices.body,/@xyflow\/react 12\.12\.0/);
  for (const path of ['/api/project', '/README.md', '/assets/%2e%2e/README.md', '/assets/%5cREADME.md', '/assets/%00logo.png', '/assets/inter-OFL.txt']) assert.equal((await get(path)).code, 404, path);
  assert.equal((await get('/', 'POST')).code, 405); assert.equal((await get('/', 'GET', 'attacker.example')).code, 403);
  await symlink(new URL('../README.md', import.meta.url), escaping); assert.equal((await get('/assets/test-escape.png')).code, 404);
 } finally { await unlink(escaping).catch(() => {}); await new Promise(resolve => server.close(resolve)); }
});
