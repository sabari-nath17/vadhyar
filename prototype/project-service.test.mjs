import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, request } from 'node:http';
import { mkdtemp, mkdir, writeFile, rm, symlink, readFile, chmod, rename } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { Buffer } from 'node:buffer';
import process from 'node:process';
import { setTimeout } from 'node:timers';
import { promisify } from 'node:util';
import { DatabaseSync } from 'node:sqlite';
import { createProjectService } from './project-service.mjs';
import { projectInfoSchema, filesPageSchema, sourceSnapshotSchema, scriptsSchema, projectRunSchema, projectChangesSchema, projectVersionsSchema } from './src/project-types.ts';

const hash = text => createHash('sha256').update(text).digest('hex');
async function fixture(files = { 'src/answer.py': 'print(42)\n' }, prepare = async () => {}, extra = {}) {
 const root = await mkdtemp(join(tmpdir(), 'vadhyar-project-test-'));
 const storageRoot = await mkdtemp(join(tmpdir(), 'vadhyar-history-test-'));
 for (const [path, text] of Object.entries(files)) { await mkdir(join(root, path, '..'), { recursive: true }); await writeFile(join(root, path), text); }
 await prepare(root);
 const server = createServer(async (req, res) => { if (!await service.handle(req, res)) { res.writeHead(404); res.end('{}'); } });
 await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
 const origin = `http://127.0.0.1:${server.address().port}`;
 let service;
 try { service = await createProjectService({ root, origin, storageRoot, ...extra }); await service.ready; }
 catch (error) { await new Promise(resolve => server.close(resolve)); await rm(root, { recursive: true, force: true }); await rm(storageRoot, { recursive: true, force: true }); throw error; }
 let cookie = '';
 const call = (path, { method = 'GET', body, headers = {}, authenticated = true } = {}) => new Promise((resolve, reject) => {
  const req = request(origin + path, { method, headers: Object.fromEntries(Object.entries({ Origin: origin, 'Sec-Fetch-Site': 'same-origin', ...(authenticated && cookie ? { Cookie: cookie } : {}), ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers }).filter(([, value]) => value !== undefined)) }, res => {
   let raw = ''; res.setEncoding('utf8'); res.on('data', chunk => { raw += chunk; }); res.on('end', () => { let data; try { data = JSON.parse(raw); } catch { data = raw; } resolve({ code: res.statusCode, headers: res.headers, data }); });
  }); req.on('error', reject); req.end(body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body));
 });
 const login = async () => { const result = await call('/api/session', { method: 'POST', body: {}, authenticated: false }); cookie = result.headers['set-cookie']?.[0].split(';')[0] ?? ''; return result; };
 const restart = async () => { await service.close(); service = await createProjectService({ root, origin, storageRoot, ...extra }); await service.ready; await login(); };
 const close = async () => { await service.close(); await new Promise(resolve => server.close(resolve)); await rm(root, { recursive: true, force: true }); await rm(storageRoot, { recursive: true, force: true }); };
 return { root, storageRoot, origin, service, call, login, restart, close };
}

test('API requires a same-origin browser session and rejects unknown methods, hosts and oversized bodies', async () => {
 const f = await fixture();
 try {
  assert.equal((await f.call('/api/projects/current', { authenticated: false })).code, 401);
  assert.equal((await f.call('/api/session', { method: 'POST', body: {}, headers: { Origin: 'https://attacker.example' } })).code, 403);
  assert.equal((await f.call('/api/session', { method: 'POST', body: {}, headers: { 'Sec-Fetch-Site': 'cross-site' } })).code, 403);
  assert.equal((await f.call('/api/session', { method: 'POST', body: {}, headers: { Host: 'attacker.example' } })).code, 403);
  const login = await f.login(); assert.equal(login.code, 200); assert.match(login.headers['set-cookie'][0], /HttpOnly/); assert.match(login.headers['set-cookie'][0], /SameSite=Strict/); assert.match(login.headers['set-cookie'][0], /Path=\/api/);
  assert.equal((await f.call('/api/projects/current')).code, 200);
  assert.equal((await f.call('/api/projects/current', { headers: { Origin: 'https://attacker.example' } })).code, 403);
  const cookiePair = login.headers['set-cookie'][0].split(';')[0], cookieName = cookiePair.slice(0, cookiePair.indexOf('='));
  assert.equal((await f.call('/api/projects/current', { headers: { Cookie: `${cookieName}=wrong` } })).code, 401);
  assert.equal((await f.call('/api/projects/current', { headers: { Cookie: `${cookieName}=${'é'.repeat(64)}` } })).code, 401);
  assert.equal((await f.call('/api/projects/current', { method: 'POST', body: {} })).code, 405);
  assert.equal((await f.call('/api/session', { method: 'POST', body: 'x'.repeat(17000) })).code, 413);
  assert.equal((await f.call('/api/session', { method: 'POST', body: { root: '/tmp' } })).code, 400);
  assert.equal((await f.call('/anything')).code, 404);
 } finally { await f.close(); }
});

test('separate local project hosts retain sessions in one browser cookie jar', async () => {
 const first = await fixture({ 'booking.py': 'print("booking")\n' }); let second;
 try {
  second = await fixture({ 'other.py': 'print("other")\n' });
  const firstLogin = await first.login(), secondLogin = await second.login(), jar = new Map();
  for (const result of [firstLogin, secondLogin]) {
   const pair = result.headers['set-cookie'][0].split(';')[0], separator = pair.indexOf('=');
   jar.set(pair.slice(0, separator), pair.slice(separator + 1));
  }
  assert.equal(jar.size, 2, 'each local origin must use its own cookie name');
  const sharedCookieHeader = [...jar].map(([name, value]) => `${name}=${value}`).join('; ');
  const firstProject = (await first.call('/api/projects/current', { headers: { Cookie: sharedCookieHeader } })).data;
  const secondProject = (await second.call('/api/projects/current', { headers: { Cookie: sharedCookieHeader } })).data;
  assert.notEqual(firstProject.id, secondProject.id);
  assert.equal((await first.call('/api/projects/current', { headers: { Cookie: sharedCookieHeader } })).code, 200);
  assert.equal((await second.call('/api/projects/current', { headers: { Cookie: sharedCookieHeader } })).code, 200);
  assert.equal((await first.call('/api/projects/current', { headers: { Cookie: `${[...jar.keys()][1]}=${[...jar.values()][1]}` } })).code, 401);
  assert.equal((await second.call('/api/projects/current', { headers: { Cookie: `${[...jar.keys()][0]}=${[...jar.values()][0]}` } })).code, 401);
  assert.equal((await second.call(`/api/projects/${firstProject.id}/files`, { headers: { Cookie: sharedCookieHeader } })).code, 404);
 } finally {
  await first.close(); if (second) await second.close();
 }
});

test('delegated API handlers receive only authenticated same-origin operations and internal source reads remain bounded', async () => {
 let delegated = 0;
 const f = await fixture(undefined, undefined, { handleExtraApi: async (req, res) => { if (!req.url.startsWith('/api/teaching/')) return false; delegated++; res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{"ok":true}'); return true; } });
 try {
  const path = '/api/teaching/connect';
  assert.equal((await f.call(path, { method: 'POST', body: {}, authenticated: false })).code, 401); assert.equal(delegated, 0);
  await f.login(); assert.equal((await f.call(path, { method: 'POST', body: {}, headers: { Origin: undefined } })).code, 403); assert.equal(delegated, 0);
  assert.equal((await f.call(path, { method: 'POST', body: {} })).code, 200); assert.equal(delegated, 1);
  const project = (await f.call('/api/projects/current')).data; const file = (await f.call(`/api/projects/${project.id}/files`)).data.files[0]; sourceSnapshotSchema.parse(await f.service.readSource(file.id));
  await assert.rejects(f.service.readSource('../value')); await assert.rejects(f.service.readSource(file.id, 1, 201));
 } finally { await f.close(); }
});

test('delegated project handlers cannot read source for a different project route', async () => {
 let delegatedReads = 0, selectedFileId;
 const f = await fixture(undefined, undefined, { handleExtraApi: async (req, res) => {
  if (!/^\/api\/projects\/[^/]+\/knowledge$/.test(req.url)) return false;
  delegatedReads++; await f.service.readSource(selectedFileId); res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{"ok":true}'); return true;
 } });
 try {
  await f.login(); const project = (await f.call('/api/projects/current')).data; selectedFileId = (await f.call(`/api/projects/${project.id}/files`)).data.files[0].id;
  for (const wrongId of ['0'.repeat(64), 'not-the-approved-project']) { const rejected = await f.call(`/api/projects/${wrongId}/knowledge`); assert.equal(rejected.code, 404); assert.equal(rejected.data.error.code, 'unknown_project'); assert.equal(delegatedReads, 0); }
  assert.equal((await f.call(`/api/projects/${project.id}/knowledge`)).code, 200); assert.equal(delegatedReads, 1);
  assert.equal((await f.call('/api/projects/current')).data.id, project.id); assert.equal(delegatedReads, 1);
 } finally { await f.close(); }
});

test('project metadata is independent, paginated and excludes hidden, generated, private, binary and linked paths', async () => {
 const f = await fixture({ 'alpha.py': 'print(1)', 'beta.rs': 'fn main() {}', 'nested/gamma.xyz': 'readable\n', '.env': 'password="private"', 'node_modules/lib.js': 'ignored', 'dist/out.js': 'ignored', 'credentials.json': '{}', 'photo.png': Buffer.from([1, 2, 0]) });
 const g = await fixture({ 'different.go': 'package main\n' });
 try {
  await symlink(join(g.root, 'different.go'), join(f.root, 'escape.go'));
  await f.login(); await g.login();
  const project = (await f.call('/api/projects/current')).data; const other = (await g.call('/api/projects/current')).data;
  projectInfoSchema.parse(project); projectInfoSchema.parse(other); assert.notEqual(project.id, other.id); assert.notEqual(project.name, other.name); assert.equal(project.status, 'ready'); assert.equal(project.indexedFiles, 3); assert.ok(project.skippedFiles >= 5);
  const first = (await f.call(`/api/projects/${project.id}/files?limit=2`)).data;
  filesPageSchema.parse(first); assert.deepEqual(first.files.map(file => file.path), ['alpha.py', 'beta.rs']); assert.equal(first.files[0].language, 'Python'); assert.ok(first.nextCursor);
  const second = (await f.call(`/api/projects/${project.id}/files?limit=2&cursor=${encodeURIComponent(first.nextCursor)}`)).data;
  assert.deepEqual(second.files.map(file => file.path), ['nested/gamma.xyz']); assert.equal(second.nextCursor, null);
  const search = (await f.call(`/api/projects/${project.id}/files?q=GAMMA`)).data; assert.equal(search.files.length, 1);
  assert.equal((await f.call(`/api/projects/${other.id}/files`)).code, 404);
  assert.equal((await f.call(`/api/projects/${project.id}/files?limit=101`)).code, 400);
  assert.equal((await f.call(`/api/projects/${project.id}/files?limit=1&limit=2`)).code, 400);
 } finally { await f.close(); await g.close(); }
});

test('source reads only known safe files, retain a full-file identity, bound excerpts and detect changed or private content', async () => {
 const content = Array.from({ length: 500 }, (_, i) => `line ${i + 1}`).join('\n') + '\n';
 const f = await fixture({ 'long.unknown': content, 'binary.unknown': Buffer.from([65, 0, 66]), 'private.py': 'api_key = "not-for-browser"\n' });
 try {
  await f.login(); const current = await f.call('/api/projects/current'); assert.equal(current.code, 200); const project = current.data; const page = await f.call(`/api/projects/${project.id}/files`); assert.equal(page.code, 200); const files = page.data.files; const file = files.find(file => file.path === 'long.unknown');
  const base = `/api/projects/${project.id}/source?fileId=${file.id}`;
  const result = await f.call(base + '&start=2&lines=2'); assert.equal(result.code, 200); sourceSnapshotSchema.parse(result.data); assert.equal(result.data.text, 'line 2\nline 3'); assert.equal(result.data.sourceHash, hash(content)); assert.equal(result.data.endLine, 3); assert.equal(result.data.truncated, true);
  const maximum = await f.call(base + '&start=1&lines=200'); assert.equal(maximum.code, 200); assert.equal(maximum.data.endLine, 200); assert.equal(maximum.data.text.split('\n').length, 200);
  assert.equal((await f.call(base + '&lines=201')).code, 400); assert.equal((await f.call(base + '&start=-1')).code, 400);
  const beyond = await f.call(base + '&start=9999'); assert.equal(beyond.code, 416); assert.ok(!JSON.stringify(beyond.data).includes(f.root));
  assert.equal((await f.call(`/api/projects/${project.id}/source?fileId=../../etc/passwd`)).code, 400);
  for (const path of ['binary.unknown', 'private.py']) { const file = files.find(file => file.path === path); assert.equal((await f.call(`/api/projects/${project.id}/source?fileId=${file.id}`)).code, 422); }
  await writeFile(join(f.root, 'long.unknown'), 'changed\n'); const changed = (await f.call(base)).data; assert.equal(changed.sourceHash, hash('changed\n')); assert.equal(changed.text, 'changed');
  await rm(join(f.root, 'long.unknown')); await symlink('/etc/hosts', join(f.root, 'long.unknown')); const blocked = await f.call(base); assert.equal(blocked.code, 422); assert.ok(!JSON.stringify(blocked.data).includes(f.root));
 } finally { await f.close(); }
});

test('checks require fresh explicit consent, skip npm hooks, retain bounded output and record stale source instead of passing', async () => {
 const f = await fixture({ 'src/value.ts': 'export const value = 1;\n', 'package.json': JSON.stringify({ scripts: { pretest: 'node hook.mjs', test: 'node check.mjs', posttest: 'node hook.mjs', changecheck: 'node change.mjs', envcheck: 'node env.mjs', failcheck: 'node -e "process.exit(7)"', start: 'node check.mjs' } }), 'hook.mjs': "import {writeFileSync} from 'node:fs'; writeFileSync('HOOK_RAN','bad');", 'check.mjs': "console.log('x'.repeat(50000));", 'change.mjs': "import {writeFileSync} from 'node:fs'; writeFileSync('src/value.ts','export const value = 2;\\n');", 'env.mjs': "console.log('env-secret:' + (process.env.VADHYAR_TEST_SECRET ?? 'absent'));" });
 process.env.VADHYAR_TEST_SECRET = 'must-not-reach-project';
 try {
  await f.login(); const current = await f.call('/api/projects/current'); assert.equal(current.code, 200); const project = current.data; const file = (await f.call(`/api/projects/${project.id}/files?q=value`)).data.files[0]; const source = (await f.call(`/api/projects/${project.id}/source?fileId=${file.id}`)).data; const scripts = (await f.call(`/api/projects/${project.id}/scripts`)).data.scripts;
  assert.ok(!scripts.some(script => script.id === 'start' || script.id === 'pretest' || script.id === 'posttest'));
  const consent = { scriptId: 'test', fileId: file.id, sourceHash: source.sourceHash, manifestHash: scripts.find(script => script.id === 'test').manifestHash, approved: true };
  const runs = `/api/projects/${project.id}/runs`;
  assert.equal((await f.call(runs, { method: 'POST', body: { ...consent, approved: false } })).code, 400);
  assert.equal((await f.call(runs, { method: 'POST', body: { ...consent, command: 'rm -rf' } })).code, 400);
  assert.equal((await f.call(runs, { method: 'POST', body: { ...consent, sourceHash: '0'.repeat(64) } })).code, 409);
  assert.equal((await f.call(runs, { method: 'POST', body: { ...consent, manifestHash: '0'.repeat(64) } })).code, 409);
  scriptsSchema.parse({ scripts }); const started = await f.call(runs, { method: 'POST', body: consent }); assert.equal(started.code, 202); projectRunSchema.parse(started.data); assert.equal(started.data.fileId, file.id); assert.equal(started.data.status, 'running');
  assert.equal((await f.call(runs, { method: 'POST', body: consent })).code, 409);
  const wait = async id => { for (let i = 0; i < 100; i++) { const run = (await f.call(`${runs}/${id}`)).data; if (run.status !== 'running') return run; await new Promise(resolve => setTimeout(resolve, 30)); } assert.fail('check did not finish'); };
  const done = await wait(started.data.id); projectRunSchema.parse(done); assert.equal(done.status, 'passed'); assert.equal(done.exitCode, 0); assert.ok(done.output.length <= 24000); await assert.rejects(readFile(join(f.root, 'HOOK_RAN')), { code: 'ENOENT' });
  const env = await f.call(runs, { method: 'POST', body: { ...consent, scriptId: 'envcheck' } }); assert.match((await wait(env.data.id)).output, /env-secret:absent/);
  const fail = await f.call(runs, { method: 'POST', body: { ...consent, scriptId: 'failcheck' } }); const failed = await wait(fail.data.id); assert.equal(failed.status, 'failed'); assert.equal(failed.exitCode, 7);
  const change = await f.call(runs, { method: 'POST', body: { ...consent, scriptId: 'changecheck' } }); assert.equal((await wait(change.data.id)).status, 'stale');
  const stale = await f.call(runs, { method: 'POST', body: consent }); assert.equal(stale.code, 409);
 } finally { delete process.env.VADHYAR_TEST_SECRET; await f.close(); }
});

test('source excerpts bound UTF-16 text while hashing the full UTF-8 file and disclose excluded scan errors', async () => {
 const content = '🪷'.repeat(30000) + '\nsecond line\n';
 const f = await fixture({ 'large.txt': content, 'empty.txt': '', 'blank.txt': '\n', 'blocked/value.txt': 'unreadable' }, root => chmod(join(root, 'blocked'), 0o000));
 try {
  await f.login(); const project = (await f.call('/api/projects/current')).data; assert.equal(project.status, 'partial'); assert.equal(project.scanErrors, 1);
  const files = (await f.call(`/api/projects/${project.id}/files`)).data.files;
  const get = async name => (await f.call(`/api/projects/${project.id}/source?fileId=${files.find(file => file.path === name).id}`)).data;
  const large = await get('large.txt'); sourceSnapshotSchema.parse(large); assert.equal(large.text.length, 40000); assert.equal(large.text, '🪷'.repeat(20000)); assert.equal(large.sourceHash, hash(content)); assert.equal(large.truncated, true); assert.equal(large.endLine, 1);
  assert.equal((await get('empty.txt')).endLine, 0); assert.equal((await get('blank.txt')).endLine, 1);
  assert.equal((await f.call(`/api/projects/${project.id}/scripts`)).data.scripts.length, 0);
 } finally { await chmod(join(f.root, 'blocked'), 0o700); await f.close(); }
});

test('a project command is stale if its manifest changes during execution and its local paths are redacted', async () => {
 const f = await fixture({ 'value.go': 'package main\n', 'package.json': JSON.stringify({ scripts: { test: 'node mutate.mjs' } }), 'mutate.mjs': "import { writeFileSync } from 'node:fs'; console.log(process.cwd()); writeFileSync('package.json',JSON.stringify({scripts:{test:'node -e \\\"process.exit(1)\\\"'}}));" });
 try {
  await f.login(); const project = (await f.call('/api/projects/current')).data; const file = (await f.call(`/api/projects/${project.id}/files?q=value`)).data.files[0]; const source = (await f.call(`/api/projects/${project.id}/source?fileId=${file.id}`)).data; const script = (await f.call(`/api/projects/${project.id}/scripts`)).data.scripts[0];
  const started = await f.call(`/api/projects/${project.id}/runs`, { method: 'POST', body: { scriptId: script.id, fileId: file.id, sourceHash: source.sourceHash, manifestHash: script.manifestHash, approved: true } }); assert.equal(started.code, 202);
  let run;
  for (let i = 0; i < 100; i++) { run = (await f.call(`/api/projects/${project.id}/runs/${started.data.id}`)).data; if (run.status !== 'running') break; await new Promise(resolve => setTimeout(resolve, 30)); }
  assert.equal(run.status, 'stale'); assert.equal(run.exitCode, 0); assert.ok(!run.output.includes(f.root)); assert.match(run.output, /\[local path\]/);
 } finally { await f.close(); }
});

test('a nonterminating approved project check is killed after the execution budget', { timeout: 40000 }, async () => {
 const f = await fixture({ 'value.c': 'int main() {}\n', 'package.json': JSON.stringify({ scripts: { test: 'node -e "setInterval(()=>{},1000)"' } }) });
 try {
  await f.login(); const project = (await f.call('/api/projects/current')).data; const file = (await f.call(`/api/projects/${project.id}/files?q=value`)).data.files[0]; const source = (await f.call(`/api/projects/${project.id}/source?fileId=${file.id}`)).data; const script = (await f.call(`/api/projects/${project.id}/scripts`)).data.scripts[0];
  const started = await f.call(`/api/projects/${project.id}/runs`, { method: 'POST', body: { scriptId: script.id, fileId: file.id, sourceHash: source.sourceHash, manifestHash: script.manifestHash, approved: true } }); assert.equal(started.code, 202);
  let run;
  for (let i = 0; i < 350; i++) { run = (await f.call(`/api/projects/${project.id}/runs/${started.data.id}`)).data; if (run.status !== 'running') break; await new Promise(resolve => setTimeout(resolve, 100)); }
  projectRunSchema.parse(run); assert.equal(run.status, 'timeout'); assert.equal(run.exitCode, null); assert.ok(run.finishedAt);
 } finally { await f.close(); }
});

test('possible credential output remains withheld even when a large chunk would remove its prefix from the output tail', async () => {
 const f = await fixture({ 'value.py': 'print(1)\n', 'package.json': JSON.stringify({ scripts: { test: 'node output.mjs' } }), 'output.mjs': "console.log('api_key = \\\"' + 'a'.repeat(80000) + '\\\"'); console.log('finished');" });
 try {
  await f.login(); const project = (await f.call('/api/projects/current')).data; const file = (await f.call(`/api/projects/${project.id}/files?q=value`)).data.files[0]; const source = (await f.call(`/api/projects/${project.id}/source?fileId=${file.id}`)).data; const script = (await f.call(`/api/projects/${project.id}/scripts`)).data.scripts[0];
  const started = await f.call(`/api/projects/${project.id}/runs`, { method: 'POST', body: { scriptId: script.id, fileId: file.id, sourceHash: source.sourceHash, manifestHash: script.manifestHash, approved: true } });
  assert.equal(started.code, 202);
  let run;
  for (let i = 0; i < 100; i++) { run = (await f.call(`/api/projects/${project.id}/runs/${started.data.id}`)).data; if (run.status !== 'running') break; await new Promise(resolve => setTimeout(resolve, 30)); }
  assert.equal(run.status, 'passed'); assert.match(run.output, /withheld/); assert.ok(!run.output.includes('a'.repeat(20)));
 } finally { await f.close(); }
});

test('saved external changes update metadata and tracked source versions automatically, with durable history after restart', async () => {
 const f = await fixture({ 'value.py': 'print(1)\n' });
 try {
  await f.login(); const project = (await f.call('/api/projects/current')).data; assert.equal(project.watching, true); assert.equal(project.watchError, null);
  assert.deepEqual((await f.call(`/api/projects/${project.id}/changes`)).data.changes, []);
  const filesPath = `/api/projects/${project.id}/files`; const file = (await f.call(filesPath)).data.files[0];
  await f.call(`/api/projects/${project.id}/source?fileId=${file.id}`);
  await promisify(execFile)(process.execPath, ['--input-type=module', '-e', "import {writeFileSync} from 'node:fs'; writeFileSync('value.py','print(2)\\n'); writeFileSync('new.rs','fn main() {}\\n');"], { cwd: f.root });
  const changesPath = `/api/projects/${project.id}/changes`; let changes;
  for (let i = 0; i < 100; i++) { changes = (await f.call(changesPath)).data; if (changes.changes?.some(change => change.fileId === file.id && change.kind === 'modified' && change.sourceHash === hash('print(2)\n'))) break; await new Promise(resolve => setTimeout(resolve, 40)); }
  projectChangesSchema.parse(changes); assert.ok(changes.changes.some(change => change.fileId === file.id && change.kind === 'modified' && change.tracked && change.sourceHash === hash('print(2)\n')), JSON.stringify(changes));
  assert.equal((await f.call(filesPath)).data.files.length, 2); assert.ok(changes.revision > project.revision);
  const versionsPath = `/api/projects/${project.id}/versions?fileId=${file.id}`; const captures = (await f.call(versionsPath)).data; projectVersionsSchema.parse(captures); const versions = captures.versions;
  assert.equal(versions.length, 2); assert.equal(versions[0].text, 'print(2)'); assert.equal(versions[1].text, 'print(1)');
  await f.restart(); assert.deepEqual((await f.call(versionsPath)).data.versions, versions);
  await rm(join(f.root, 'value.py'));
  for (let i = 0; i < 100; i++) { changes = (await f.call(changesPath)).data; if (changes.changes.some(change => change.fileId === file.id && change.kind === 'deleted')) break; await new Promise(resolve => setTimeout(resolve, 40)); }
  assert.ok(changes.changes.some(change => change.fileId === file.id && change.kind === 'deleted' && change.tracked && change.sourceHash === null));
  assert.equal((await f.call(filesPath)).data.files.length, 1); assert.deepEqual((await f.call(versionsPath)).data.versions, versions);
  const first = (await f.call(changesPath + '?limit=1')).data; assert.equal(first.changes.length, 1); assert.ok(first.nextCursor); assert.equal((await f.call(changesPath + '&limit=1')).code, 404);
  const second = (await f.call(changesPath + `?limit=1&cursor=${first.nextCursor}`)).data; assert.notEqual(second.changes[0].id, first.changes[0].id);
 } finally { await f.close(); }
});

test('selected source history retains its latest twenty captured contexts and reconciles changes made while stopped', async () => {
 const f = await fixture({ 'value.py': 'print(0)\n' });
 try {
  await f.login(); const project = (await f.call('/api/projects/current')).data; const file = (await f.call(`/api/projects/${project.id}/files`)).data.files[0]; const sourcePath = `/api/projects/${project.id}/source?fileId=${file.id}`; const versionsPath = `/api/projects/${project.id}/versions?fileId=${file.id}`;
  for (let i = 0; i <= 25; i++) { if (i) await writeFile(join(f.root, 'value.py'), `print(${i})\n`); assert.equal((await f.call(sourcePath)).code, 200); }
  const versions = (await f.call(versionsPath)).data.versions; assert.equal(versions.length, 20); assert.equal(versions[0].text, 'print(25)'); assert.equal(versions[19].text, 'print(6)');
  await f.service.close(); await writeFile(join(f.root, 'value.py'), 'print(26)\n'); await f.restart();
  const after = (await f.call(versionsPath)).data.versions; assert.equal(after.length, 20); assert.equal(after[0].text, 'print(26)'); assert.equal(after[19].text, 'print(7)');
 } finally { await f.close(); }
});

test('same-hash excerpts retain their distinct ranges and automatic captures follow the latest selected range through project checks', async () => {
 const initial = Array.from({ length: 400 }, (_, i) => `line ${i + 1}`).join('\n') + '\n';
 const f = await fixture({ 'value.py': initial, 'package.json': JSON.stringify({ scripts: { test: 'node -e "process.exit(0)"' } }) });
 try {
  await f.login(); const project = (await f.call('/api/projects/current')).data; const file = (await f.call(`/api/projects/${project.id}/files?q=value.py`)).data.files[0]; const sourcePath = `/api/projects/${project.id}/source?fileId=${file.id}`; const versionsPath = `/api/projects/${project.id}/versions?fileId=${file.id}`;
  const first = (await f.call(sourcePath + '&start=1&lines=2')).data; const second = (await f.call(sourcePath + '&start=300&lines=2')).data; assert.equal(first.sourceHash, second.sourceHash);
  const before = (await f.call(versionsPath)).data.versions; assert.equal(before.length, 2); assert.equal(before[0].startLine, 300); assert.equal(before[1].startLine, 1);
  await f.call(sourcePath + '&start=1&lines=2'); const repeated = (await f.call(versionsPath)).data.versions; assert.equal(repeated.length, 2); assert.equal(repeated[0].startLine, 1);
  await f.call(sourcePath + '&start=300&lines=2'); const latest = (await f.call(versionsPath)).data.versions; assert.equal(latest.length, 2); assert.equal(latest[0].startLine, 300);
  const script = (await f.call(`/api/projects/${project.id}/scripts`)).data.scripts[0]; const started = await f.call(`/api/projects/${project.id}/runs`, { method: 'POST', body: { scriptId: script.id, fileId: file.id, sourceHash: second.sourceHash, manifestHash: script.manifestHash, approved: true } }); assert.equal(started.code, 202);
  let run;
  for (let i = 0; i < 100; i++) { run = (await f.call(`/api/projects/${project.id}/runs/${started.data.id}`)).data; if (run.status !== 'running') break; await new Promise(resolve => setTimeout(resolve, 30)); }
  assert.equal(run.status, 'passed'); assert.deepEqual((await f.call(versionsPath)).data.versions, latest);
  await promisify(execFile)(process.execPath, ['--input-type=module', '-e', "import {readFileSync,writeFileSync} from 'node:fs'; writeFileSync('value.py',readFileSync('value.py','utf8').replace('line 301\\n','saved line 301\\n'));"], { cwd: f.root });
  let after;
  for (let i = 0; i < 100; i++) { after = (await f.call(versionsPath)).data.versions; if (after.length > before.length) break; await new Promise(resolve => setTimeout(resolve, 40)); }
  assert.equal(after.length, 3); assert.equal(after[0].startLine, 300); assert.equal(after[0].endLine, 301); assert.equal(after[0].text, 'line 300\nsaved line 301');
 } finally { await f.close(); }
});

test('a successful command is stale when eligible dependency, config or check code changes during its execution', async t => {
 for (const target of ['dep.mjs', 'settings.json', 'check.mjs']) await t.test(target, async () => {
  const replacement = target === 'dep.mjs' ? 'export const allow = false;\n' : target === 'settings.json' ? '{"enabled":false}\n' : 'console.log("replacement check");\n';
  const f = await fixture({ 'answer.mjs': "export { allow } from './dep.mjs';\n", 'dep.mjs': 'export const allow = true;\n', 'settings.json': '{"enabled":true}\n', 'package.json': JSON.stringify({ scripts: { test: 'node check.mjs' } }), 'check.mjs': `import { allow } from './answer.mjs'; import { writeFileSync } from 'node:fs'; console.log('evaluated:' + allow); writeFileSync(${JSON.stringify(target)},${JSON.stringify(replacement)}); await new Promise(resolve=>setTimeout(resolve,180));` });
  try {
   await f.login(); const project = (await f.call('/api/projects/current')).data; const file = (await f.call(`/api/projects/${project.id}/files?q=answer.mjs`)).data.files[0]; const source = (await f.call(`/api/projects/${project.id}/source?fileId=${file.id}`)).data; const script = (await f.call(`/api/projects/${project.id}/scripts`)).data.scripts[0];
   const started = await f.call(`/api/projects/${project.id}/runs`, { method: 'POST', body: { scriptId: script.id, fileId: file.id, sourceHash: source.sourceHash, manifestHash: script.manifestHash, approved: true } }); assert.equal(started.code, 202);
   let run;
   for (let i = 0; i < 100; i++) { run = (await f.call(`/api/projects/${project.id}/runs/${started.data.id}`)).data; if (run.status !== 'running') break; await new Promise(resolve => setTimeout(resolve, 30)); }
   assert.equal(run.status, 'stale'); assert.equal(run.exitCode, 0); assert.match(run.output, /evaluated:true/); assert.equal((await f.call(`/api/projects/${project.id}/source?fileId=${file.id}`)).data.sourceHash, source.sourceHash);
  } finally { await f.close(); }
 });
});

test('queued recorded changes are flushed before checking freshness and prior changes settle before the start epoch', async () => {
 const f = await fixture({ 'answer.mjs': 'export const answer = 42;\n', 'dep.mjs': 'export const value = 1;\n', 'package.json': JSON.stringify({ scripts: { test: 'node check.mjs' } }), 'check.mjs': "import { readFileSync,writeFileSync } from 'node:fs'; console.log('completed check'); if(readFileSync('dep.mjs','utf8')!=='export const value = 2;\\n')writeFileSync('dep.mjs','export const value = 2;\\n');" });
 try {
  await f.login(); const project = (await f.call('/api/projects/current')).data; const file = (await f.call(`/api/projects/${project.id}/files?q=answer.mjs`)).data.files[0]; const source = (await f.call(`/api/projects/${project.id}/source?fileId=${file.id}`)).data; const script = (await f.call(`/api/projects/${project.id}/scripts`)).data.scripts[0];
  const consent = { scriptId: script.id, fileId: file.id, sourceHash: source.sourceHash, manifestHash: script.manifestHash, approved: true }; const runs = `/api/projects/${project.id}/runs`;
  const started = await f.call(runs, { method: 'POST', body: consent }); assert.equal(started.code, 202);
  const wait = async id => { for (let i = 0; i < 100; i++) { const run = (await f.call(`${runs}/${id}`)).data; if (run.status !== 'running') return run; await new Promise(resolve => setTimeout(resolve, 30)); } assert.fail('check did not finish'); };
  const changed = await wait(started.data.id); assert.equal(changed.status, 'stale'); assert.equal(changed.exitCode, 0); assert.match(changed.output, /completed check/);
  await writeFile(join(f.root, 'dep.mjs'), 'export const value = 2;\n');
  const second = await f.call(runs, { method: 'POST', body: consent }); assert.equal(second.code, 202);
  const stable = await wait(second.data.id); assert.equal(stable.status, 'passed'); assert.equal(stable.exitCode, 0);
 } finally { await f.close(); }
});

test('a manifest replaced during preflight is rejected before execution and fresh consent permits the stable replacement', async () => {
 let received; const enteringPreflight = new Promise(resolve => { received = resolve; });
 const f = await fixture({ 'answer.py': 'print(42)\n', 'package.json': JSON.stringify({ scripts: { test: 'node original.mjs' } }), 'original.mjs': "console.log('original check');", 'replacement.mjs': "import {writeFileSync} from 'node:fs'; writeFileSync('dist/marker.txt','executed'); console.log('fresh check');", 'dist/.keep': '' }, undefined, { handleExtraApi: async request => { if (request.method === 'POST' && request.url.endsWith('/runs')) received(); return false; } });
 try {
  await f.login(); const project = (await f.call('/api/projects/current')).data; const file = (await f.call(`/api/projects/${project.id}/files?q=answer.py`)).data.files[0]; const source = (await f.call(`/api/projects/${project.id}/source?fileId=${file.id}`)).data; const original = (await f.call(`/api/projects/${project.id}/scripts`)).data.scripts[0]; const runs = `/api/projects/${project.id}/runs`;
  const consent = { scriptId: original.id, fileId: file.id, sourceHash: source.sourceHash, manifestHash: original.manifestHash, approved: true };
  const pending = f.call(runs, { method: 'POST', body: consent }); await enteringPreflight; await new Promise(resolve => setTimeout(resolve, 50));
  await writeFile(join(f.root, 'package.json'), JSON.stringify({ scripts: { test: 'node replacement.mjs' } }));
  const rejected = await pending; assert.equal(rejected.code, 409); assert.equal(rejected.data.error.code, 'stale_consent'); assert.equal(rejected.data.id, undefined); await assert.rejects(readFile(join(f.root, 'dist/marker.txt')), { code: 'ENOENT' });
  const current = (await f.call(`/api/projects/${project.id}/scripts`)).data.scripts[0]; assert.notEqual(current.manifestHash, original.manifestHash);
  const started = await f.call(runs, { method: 'POST', body: { ...consent, manifestHash: current.manifestHash } }); assert.equal(started.code, 202);
  let run;
  for (let i = 0; i < 100; i++) { run = (await f.call(`${runs}/${started.data.id}`)).data; if (run.status !== 'running') break; await new Promise(resolve => setTimeout(resolve, 30)); }
  assert.equal(run.status, 'passed'); assert.equal(run.exitCode, 0); assert.match(run.output, /fresh check/); assert.equal(await readFile(join(f.root, 'dist/marker.txt'), 'utf8'), 'executed');
 } finally { await f.close(); }
});

test('a successful command cannot claim fresh project context while eligible scan coverage is partial', async () => {
 const f = await fixture({ 'answer.py': 'print(42)\n', 'package.json': JSON.stringify({ scripts: { test: 'node -e "process.exit(0)"' } }), 'blocked/value.py': 'print(1)\n' }, root => chmod(join(root, 'blocked'), 0o000));
 try {
  await f.login(); const project = (await f.call('/api/projects/current')).data; assert.equal(project.status, 'partial'); const file = (await f.call(`/api/projects/${project.id}/files?q=answer.py`)).data.files[0]; const source = (await f.call(`/api/projects/${project.id}/source?fileId=${file.id}`)).data; const script = (await f.call(`/api/projects/${project.id}/scripts`)).data.scripts[0];
  const started = await f.call(`/api/projects/${project.id}/runs`, { method: 'POST', body: { scriptId: script.id, fileId: file.id, sourceHash: source.sourceHash, manifestHash: script.manifestHash, approved: true } }); assert.equal(started.code, 202);
  let run;
  for (let i = 0; i < 100; i++) { run = (await f.call(`/api/projects/${project.id}/runs/${started.data.id}`)).data; if (run.status !== 'running') break; await new Promise(resolve => setTimeout(resolve, 30)); }
  assert.equal(run.status, 'stale'); assert.equal(run.exitCode, 0);
 } finally { await chmod(join(f.root, 'blocked'), 0o700); await f.close(); }
});

test('watcher coverage fails visibly if the approved root is moved rather than continuing to claim recording', async () => {
 const f = await fixture({ 'answer.py': 'print(42)\n', 'package.json': JSON.stringify({ scripts: { test: 'node -e "process.exit(0)"' } }) }); const moved = f.root + '-moved';
 try {
  await f.login(); assert.equal((await f.call('/api/projects/current')).data.watching, true); await rename(f.root, moved);
  let project;
  for (let i = 0; i < 150; i++) { project = (await f.call('/api/projects/current')).data; if (!project.watching) break; await new Promise(resolve => setTimeout(resolve, 40)); }
  assert.equal(project.watching, false); assert.equal(project.watchError, 'watch_failed'); assert.equal(project.status, 'partial');
  await rename(moved, f.root); const file = (await f.call(`/api/projects/${project.id}/files?q=answer.py`)).data.files[0]; const source = (await f.call(`/api/projects/${project.id}/source?fileId=${file.id}`)).data; const script = (await f.call(`/api/projects/${project.id}/scripts`)).data.scripts[0];
  const started = await f.call(`/api/projects/${project.id}/runs`, { method: 'POST', body: { scriptId: script.id, fileId: file.id, sourceHash: source.sourceHash, manifestHash: script.manifestHash, approved: true } }); assert.equal(started.code, 202);
  let run;
  for (let i = 0; i < 100; i++) { run = (await f.call(`/api/projects/${project.id}/runs/${started.data.id}`)).data; if (run.status !== 'running') break; await new Promise(resolve => setTimeout(resolve, 30)); }
  assert.equal(run.status, 'stale'); assert.equal(run.exitCode, 0);
 } finally { await rename(moved, f.root).catch(() => {}); await f.close(); }
});

test('twenty retained contexts count distinct hash and range keys rather than repeated selections', async () => {
 const f = await fixture({ 'answer.py': Array.from({ length: 30 }, (_, i) => `print(${i})`).join('\n') + '\n' });
 try {
  await f.login(); const project = (await f.call('/api/projects/current')).data; const file = (await f.call(`/api/projects/${project.id}/files`)).data.files[0]; const sourcePath = `/api/projects/${project.id}/source?fileId=${file.id}`; const versionsPath = `/api/projects/${project.id}/versions?fileId=${file.id}`;
  for (let start = 1; start <= 21; start++) assert.equal((await f.call(sourcePath + `&start=${start}&lines=1`)).code, 200);
  const versions = (await f.call(versionsPath)).data.versions; assert.equal(versions.length, 20); assert.equal(versions[0].startLine, 21); assert.equal(versions[19].startLine, 2); assert.equal(new Set(versions.map(item => `${item.sourceHash}:${item.startLine}:${item.endLine}`)).size, 20);
  await f.call(sourcePath + '&start=2&lines=1'); const recent = (await f.call(versionsPath)).data.versions; assert.equal(recent.length, 20); assert.equal(recent[0].startLine, 2);
 } finally { await f.close(); }
});

test('failed context replacement preserves the retained captures, recorder revision and tracked-file registration atomically', async () => {
 const content = Array.from({ length: 30 }, (_, i) => `print(${i})`).join('\n') + '\n'; const f = await fixture({ 'answer.py': content, 'other.py': content }); let database;
 try {
  await f.login(); const project = (await f.call('/api/projects/current')).data; const files = (await f.call(`/api/projects/${project.id}/files`)).data.files; const file = files.find(file => file.path === 'answer.py'); const other = files.find(file => file.path === 'other.py'); const sourcePath = `/api/projects/${project.id}/source?fileId=${file.id}`; const versionsPath = `/api/projects/${project.id}/versions?fileId=${file.id}`;
  for (let start = 1; start <= 21; start++) assert.equal((await f.call(sourcePath + `&start=${start}&lines=1`)).code, 200);
  const before = (await f.call(versionsPath)).data.versions; const revision = (await f.call('/api/projects/current')).data.revision; assert.equal(before.length, 20);
  database = new DatabaseSync(join(f.storageRoot, project.id, 'files.sqlite')); database.exec("CREATE TRIGGER reject_context BEFORE INSERT ON versions WHEN json_extract(NEW.snapshot,'$.startLine')=6 BEGIN SELECT RAISE(ABORT,'fixture insert failure'); END");
  assert.equal((await f.call(sourcePath + '&start=6&lines=1')).code, 422);
  assert.deepEqual((await f.call(versionsPath)).data.versions, before); assert.equal((await f.call('/api/projects/current')).data.revision, revision);
  assert.equal((await f.call(`/api/projects/${project.id}/source?fileId=${other.id}&start=6&lines=1`)).code, 422); assert.equal(database.prepare('SELECT COUNT(*) AS count FROM tracked').get().count, 1); assert.equal((await f.call('/api/projects/current')).data.revision, revision);
 } finally { database?.exec('DROP TRIGGER IF EXISTS reject_context'); database?.close(); await f.close(); }
});

test('source-state authenticates known file IDs and reads a full identity without changing selected history or range', async () => {
 const content = 'line 1\nline 2\nline 3\nline 4\n'; const f = await fixture({ 'answer.py': content });
 try {
  await f.login(); const project = (await f.call('/api/projects/current')).data; const file = (await f.call(`/api/projects/${project.id}/files`)).data.files[0]; const state = `/api/projects/${project.id}/source-state?fileId=${file.id}`;
  await f.call(`/api/projects/${project.id}/source?fileId=${file.id}&start=3&lines=2`); const versionsPath = `/api/projects/${project.id}/versions?fileId=${file.id}`; const before = (await f.call(versionsPath)).data; const revision = (await f.call('/api/projects/current')).data.revision;
  const result = await f.call(state); assert.equal(result.code, 200); assert.deepEqual(result.data, { fileId: file.id, sourceHash: hash(content), status: 'available' });
  assert.deepEqual((await f.call(versionsPath)).data, before); assert.equal((await f.call('/api/projects/current')).data.revision, revision);
  assert.equal((await f.call(state, { authenticated: false })).code, 401); assert.equal((await f.call(state, { headers: { Origin: 'https://attacker.example' } })).code, 403);
  assert.equal((await f.call(state, { method: 'POST', body: {} })).code, 405); assert.equal((await f.call(state + '&path=/etc/passwd')).code, 400); assert.equal((await f.call(state + `&fileId=${file.id}`)).code, 400);
  assert.equal((await f.call(`/api/projects/${project.id}/source-state?fileId=${'0'.repeat(64)}`)).code, 404); assert.equal((await f.call(`/api/projects/${project.id}/source-state?fileId=../answer.py`)).code, 400);
 } finally { await f.close(); }
});

test('source-state reads through partial and failed history capture independently of a clipped activity feed', async () => {
 const initial = 'print(0)\nprint(1)\nprint(2)\nprint(3)\n'; const changed = initial.replace('print(0)', 'print(9)'); const f = await fixture({ 'answer.py': initial, 'blocked/value.py': 'print(1)\n' }, root => chmod(join(root, 'blocked'), 0o000)); let database;
 try {
  await f.login(); const project = (await f.call('/api/projects/current')).data; const file = (await f.call(`/api/projects/${project.id}/files?q=answer.py`)).data.files[0]; const versionsPath = `/api/projects/${project.id}/versions?fileId=${file.id}`; const state = `/api/projects/${project.id}/source-state?fileId=${file.id}`;
  await f.call(`/api/projects/${project.id}/source?fileId=${file.id}&start=3&lines=2`); const before = (await f.call(versionsPath)).data;
  database = new DatabaseSync(join(f.storageRoot, project.id, 'files.sqlite')); database.exec("CREATE TRIGGER reject_capture BEFORE INSERT ON versions BEGIN SELECT RAISE(ABORT,'fixture capture failure'); END");
  await writeFile(join(f.root, 'answer.py'), changed);
  let changes;
  for (let i = 0; i < 100; i++) { changes = (await f.call(`/api/projects/${project.id}/changes`)).data.changes; if (changes.some(change => change.fileId === file.id && change.kind === 'modified')) break; await new Promise(resolve => setTimeout(resolve, 40)); }
  assert.ok(changes.some(change => change.fileId === file.id && change.kind === 'modified'));
  await Promise.all(Array.from({ length: 26 }, (_, i) => writeFile(join(f.root, `unrelated-${i}.txt`), 'unrelated\n')));
  for (let i = 0; i < 100; i++) { changes = (await f.call(`/api/projects/${project.id}/changes?limit=20`)).data.changes; if (changes.length === 20 && !changes.some(change => change.fileId === file.id) && (await f.call('/api/projects/current')).data.indexedFiles === 27) break; await new Promise(resolve => setTimeout(resolve, 40)); }
  assert.equal(changes.length, 20); assert.ok(!changes.some(change => change.fileId === file.id));
  assert.equal((await f.call(`/api/projects/${project.id}/files?q=answer.py`)).data.files[0].size, file.size); assert.equal((await f.call('/api/projects/current')).data.status, 'partial');
  const revision = (await f.call('/api/projects/current')).data.revision; const result = await f.call(state); assert.equal(result.code, 200); assert.deepEqual(result.data, { fileId: file.id, sourceHash: hash(changed), status: 'available' }); assert.notEqual(result.data.sourceHash, before.versions[0].sourceHash);
  assert.deepEqual((await f.call(versionsPath)).data, before); assert.equal((await f.call('/api/projects/current')).data.revision, revision);
 } finally { database?.exec('DROP TRIGGER IF EXISTS reject_capture'); database?.close(); await chmod(join(f.root, 'blocked'), 0o700); await f.close(); }
});

test('source-state withholds private, binary and unreadable identities and recognizes a tracked deleted source', async () => {
 const f = await fixture({ 'answer.py': 'print(42)\n', 'candidate.py': 'api_key="fixture-only"\n', 'binary.txt': Buffer.from([65, 0, 66]), 'unreadable.py': 'print(1)\n' });
 try {
  await f.login(); const project = (await f.call('/api/projects/current')).data; const files = (await f.call(`/api/projects/${project.id}/files`)).data.files; const file = files.find(file => file.path === 'answer.py'); await f.call(`/api/projects/${project.id}/source?fileId=${file.id}`);
  await chmod(join(f.root, 'unreadable.py'), 0o000);
  for (const path of ['candidate.py', 'binary.txt', 'unreadable.py']) { const current = files.find(file => file.path === path); const result = await f.call(`/api/projects/${project.id}/source-state?fileId=${current.id}`); assert.equal(result.code, 200); assert.deepEqual(result.data, { fileId: current.id, sourceHash: null, status: 'unavailable' }); }
  await rm(join(f.root, 'answer.py')); await new Promise(resolve => setTimeout(resolve, 250)); const deleted = await f.call(`/api/projects/${project.id}/source-state?fileId=${file.id}`); assert.equal(deleted.code, 200); assert.deepEqual(deleted.data, { fileId: file.id, sourceHash: null, status: 'unavailable' });
 } finally { await chmod(join(f.root, 'unreadable.py'), 0o600); await f.close(); }
});

test('source-state permits one concurrent status read and returns an honest unknown error for busy reads', async () => {
 const content = 'x'.repeat(12000000); const f = await fixture({ 'answer.txt': content });
 try {
  await f.login(); const project = (await f.call('/api/projects/current')).data; const file = (await f.call(`/api/projects/${project.id}/files`)).data.files[0]; const state = `/api/projects/${project.id}/source-state?fileId=${file.id}`;
  const results = await Promise.all([f.call(state), f.call(state)]); assert.deepEqual(results.map(result => result.code).sort(), [200, 503]); assert.deepEqual(results.find(result => result.code === 200).data, { fileId: file.id, sourceHash: hash(content), status: 'available' });
  assert.equal((await f.call(`/api/projects/${project.id}/versions?fileId=${file.id}`)).data.versions.length, 0);
 } finally { await f.close(); }
});

test('completed run freshness is revalidated without rewriting its execution fact after dependency, config or manifest drift', async t => {
 for (const target of ['dep.mjs', 'settings.json', 'package.json']) await t.test(target, async () => {
  const f = await fixture({ 'answer.mjs': "export {allow} from './dep.mjs';\n", 'dep.mjs': 'export const allow = true;\n', 'settings.json': '{"enabled":true}\n', 'package.json': JSON.stringify({ scripts: { test: 'node check.mjs' } }), 'check.mjs': "console.log('checked current source');" });
  try {
   await f.login(); const project = (await f.call('/api/projects/current')).data; const file = (await f.call(`/api/projects/${project.id}/files?q=answer.mjs`)).data.files[0]; const source = (await f.call(`/api/projects/${project.id}/source?fileId=${file.id}`)).data; const script = (await f.call(`/api/projects/${project.id}/scripts`)).data.scripts[0]; const runs = `/api/projects/${project.id}/runs`;
   const started = await f.call(runs, { method: 'POST', body: { scriptId: script.id, fileId: file.id, sourceHash: source.sourceHash, manifestHash: script.manifestHash, approved: true } }); assert.equal(started.code, 202); assert.equal(started.data.freshness, 'unknown');
   let completed;
   for (let i = 0; i < 100; i++) { completed = (await f.call(`${runs}/${started.data.id}`)).data; if (completed.status !== 'running') break; await new Promise(resolve => setTimeout(resolve, 30)); }
   assert.equal(completed.status, 'passed'); assert.equal(completed.freshness, 'current');
   const revision = (await f.call('/api/projects/current')).data.revision; await f.call(`/api/projects/${project.id}/source-state?fileId=${file.id}`); assert.equal((await f.call('/api/projects/current')).data.revision, revision); assert.equal((await f.call(`${runs}/${started.data.id}`)).data.freshness, 'current');
   await writeFile(join(f.root, target), target === 'package.json' ? JSON.stringify({ scripts: { test: 'node -e "console.log(1)"' } }) : target === 'dep.mjs' ? 'export const allow = false;\n' : '{"enabled":false}\n');
   const after = (await f.call(`${runs}/${started.data.id}`)).data; assert.equal(after.status, 'passed'); assert.equal(after.exitCode, 0); assert.equal(after.freshness, 'stale'); assert.equal(after.output, completed.output); assert.equal(after.startedAt, completed.startedAt); assert.equal(after.finishedAt, completed.finishedAt); assert.equal(after.sourceHash, completed.sourceHash);
  } finally { await f.close(); }
 });
});

test('reading a new selected file during and after a check preserves current freshness and its execution record', async () => {
 const f = await fixture({ 'answer.mjs': 'export const answer = 42;\n', 'helper.mjs': 'export const enabled = true;\nexport const label = "ready";\n', 'package.json': JSON.stringify({ scripts: { test: 'node check.mjs' } }), 'check.mjs': "await new Promise(resolve => setTimeout(resolve, 1000)); console.log('checked');" });
 try {
  await f.login(); const project = (await f.call('/api/projects/current')).data; const files = (await f.call(`/api/projects/${project.id}/files`)).data.files; const answer = files.find(file => file.path === 'answer.mjs'), helper = files.find(file => file.path === 'helper.mjs');
  const source = (await f.call(`/api/projects/${project.id}/source?fileId=${answer.id}`)).data; const revisionBeforeRun = (await f.call('/api/projects/current')).data.revision; const script = (await f.call(`/api/projects/${project.id}/scripts`)).data.scripts[0]; const runs = `/api/projects/${project.id}/runs`;
  const started = await f.call(runs, { method: 'POST', body: { scriptId: script.id, fileId: answer.id, sourceHash: source.sourceHash, manifestHash: script.manifestHash, approved: true } }); assert.equal(started.code, 202);
  const during = await f.call(`/api/projects/${project.id}/source?fileId=${helper.id}&start=1&lines=1`); assert.equal(during.code, 200);
  const duringRevision = (await f.call('/api/projects/current')).data.revision; assert.ok(duringRevision > revisionBeforeRun);
  let completed;
  for (let i = 0; i < 100; i++) { completed = (await f.call(`${runs}/${started.data.id}`)).data; if (completed.status !== 'running') break; await new Promise(resolve => setTimeout(resolve, 30)); }
  assert.equal(completed.status, 'passed'); assert.equal(completed.freshness, 'current');
  await f.call(`/api/projects/${project.id}/source?fileId=${helper.id}&start=2&lines=1`);
  const after = (await f.call(`${runs}/${started.data.id}`)).data; assert.equal(after.status, 'passed'); assert.equal(after.exitCode, 0); assert.equal(after.output, completed.output); assert.equal(after.freshness, 'current');
 } finally { await f.close(); }
});

test('a completed passed receipt becomes unknown when watcher coverage is lost without rewriting its execution fact', async () => {
 const f = await fixture({ 'answer.py': 'print(42)\n', 'package.json': JSON.stringify({ scripts: { test: 'node -e "console.log(42)"' } }) }); const moved = f.root + '-moved';
 try {
  await f.login(); const project = (await f.call('/api/projects/current')).data; const file = (await f.call(`/api/projects/${project.id}/files?q=answer.py`)).data.files[0]; const source = (await f.call(`/api/projects/${project.id}/source?fileId=${file.id}`)).data; const script = (await f.call(`/api/projects/${project.id}/scripts`)).data.scripts[0]; const runs = `/api/projects/${project.id}/runs`;
  const started = await f.call(runs, { method: 'POST', body: { scriptId: script.id, fileId: file.id, sourceHash: source.sourceHash, manifestHash: script.manifestHash, approved: true } }); assert.equal(started.code, 202);
  let completed;
  for (let i = 0; i < 100; i++) { completed = (await f.call(`${runs}/${started.data.id}`)).data; if (completed.status !== 'running') break; await new Promise(resolve => setTimeout(resolve, 30)); }
  assert.equal(completed.status, 'passed'); assert.equal(completed.freshness, 'current'); const revision = (await f.call('/api/projects/current')).data.revision;
  await rename(f.root, moved); let coverage;
  for (let i = 0; i < 150; i++) { coverage = (await f.call('/api/projects/current')).data; if (!coverage.watching) break; await new Promise(resolve => setTimeout(resolve, 40)); }
  assert.equal(coverage.watching, false); assert.equal(coverage.watchError, 'watch_failed'); await rename(moved, f.root);
  assert.equal((await f.call('/api/projects/current')).data.revision, revision);
  const after = (await f.call(`${runs}/${started.data.id}`)).data; assert.deepEqual(after, { ...completed, freshness: 'unknown' });
  assert.equal((await f.call(`/api/projects/${project.id}/source-state?fileId=${file.id}`)).data.sourceHash, source.sourceHash);
 } finally { await rename(moved, f.root).catch(() => {}); await f.close(); }
});


test('manifest replacement during recorder settling is rejected before execution', async () => {
 const manifest = JSON.stringify({ scripts: { test: 'node check.mjs' } });
 const f = await fixture({ 'answer.mjs': 'export const answer = 42;\n', 'check.mjs': 'console.log("approved check");\n', 'changed.mjs': 'import { writeFileSync } from "node:fs"; writeFileSync("unapproved.marker", "ran");\n', 'package.json': manifest });
 try {
  await f.login();
  const project = (await f.call('/api/projects/current')).data;
  const file = (await f.call(`/api/projects/${project.id}/files?q=answer`)).data.files[0];
  const source = (await f.call(`/api/projects/${project.id}/source?fileId=${file.id}`)).data;
  const script = (await f.call(`/api/projects/${project.id}/scripts`)).data.scripts[0];
  const runs = `/api/projects/${project.id}/runs`;
  const consent = { scriptId: script.id, fileId: file.id, sourceHash: source.sourceHash, manifestHash: script.manifestHash, approved: true };
  const pending = f.call(runs, { method: 'POST', body: consent });
  await new Promise(resolve => setTimeout(resolve, 60));
  await writeFile(join(f.root, 'package.json'), JSON.stringify({ scripts: { test: 'node changed.mjs' } }));
  const rejected = await pending;
  assert.equal(rejected.code, 409); assert.equal(rejected.data.error.code, 'stale_consent'); assert.equal(rejected.data.id, undefined);
  await new Promise(resolve => setTimeout(resolve, 350));
  await assert.rejects(readFile(join(f.root, 'unapproved.marker')), { code: 'ENOENT' });
  await writeFile(join(f.root, 'package.json'), manifest);
  const current = (await f.call(`/api/projects/${project.id}/scripts`)).data.scripts[0];
  const started = await f.call(runs, { method: 'POST', body: { ...consent, manifestHash: current.manifestHash } });
  assert.equal(started.code, 202);
  let result;
  for (let i = 0; i < 100; i++) { result = (await f.call(`${runs}/${started.data.id}`)).data; if (result.status !== 'running') break; await new Promise(resolve => setTimeout(resolve, 30)); }
  assert.equal(result.status, 'passed'); assert.match(result.output, /approved check/);
  await assert.rejects(readFile(join(f.root, 'unapproved.marker')), { code: 'ENOENT' });
 } finally { await f.close(); }
});
