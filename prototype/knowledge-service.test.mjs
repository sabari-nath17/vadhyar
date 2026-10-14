import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { createServer, request } from 'node:http';
import { access, mkdtemp, mkdir, readFile, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createProjectService } from './project-service.mjs';
import { createKnowledgeHandler } from './knowledge-service.mjs';
import { codebaseKnowledgeSchema } from './src/knowledge-types.ts';

const entry = 'import { allows } from "./rule";\nexport function approve(id: string) { return allows(id); }\n';
const rule = 'export function allows(id: string) { return id === "owner"; }\n';
const sha = value => createHash('sha256').update(value).digest('hex');

async function harness(t, options = {}) {
 const directory = await mkdtemp(join(tmpdir(), 'vadhyar-knowledge-integration-')), root = join(directory, 'project');
 await mkdir(root);
 const files = { 'entry.ts': entry, 'rule.ts': rule, 'empty.ts': '', 'invalid.ts': 'export const = ;', 'helper.py': 'def allows():\n    return True', 'config.ts': 'export const password = "fake-local-fixture-value";', 'credentials.ts': rule, 'package.json': JSON.stringify({ scripts: { test: 'node check.mjs' } }), 'check.mjs': 'import { writeFileSync } from "node:fs"; writeFileSync("executed.txt", "unexpected");', ...options.files };
 for (const [path, text] of Object.entries(files)) await writeFile(join(root, path), text);
 await mkdir(join(root, 'node_modules')); await writeFile(join(root, 'node_modules', 'vendor.ts'), rule);
 await mkdir(join(root, '.hidden')); await writeFile(join(root, '.hidden', 'hidden.ts'), rule);
 await writeFile(join(directory, 'outside.ts'), rule); await symlink(join(directory, 'outside.ts'), join(root, 'escape.ts'));
 let service, cookie = '';
 const operations = [], reads = [];
 const server = createServer(async (req, res) => {
  if (req.url.includes('/knowledge')) res.once('close', () => { if (!res.writableFinished) options.onCancelled?.(); });
  const pending = service.handle(req, res);
  if (req.url.includes('/knowledge')) operations.push(pending);
  if (!await pending) { res.writeHead(404); res.end('{}'); }
 });
 await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
 const origin = `http://127.0.0.1:${server.address().port}`;
 const handler = createKnowledgeHandler({ readSource: async (...args) => {
  reads.push(args);
  return options.readSource ? options.readSource(service, args, reads.length, root) : service.readSource(...args);
 } });
 service = await createProjectService({ root, origin, storageRoot: join(directory, 'records'), handleExtraApi: handler });
 t.after(async () => { server.closeAllConnections(); await service.close(); await new Promise(resolve => server.close(resolve)); await rm(directory, { recursive: true, force: true }); });
 await service.ready;
 const call = (path, { method = 'GET', authenticated = true, headers = {}, body, signal } = {}) => new Promise((resolve, reject) => {
  const req = request(origin + path, { method, signal, headers: { Origin: origin, 'Sec-Fetch-Site': 'same-origin', 'Content-Type': 'application/json', ...(authenticated ? { Cookie: cookie } : {}), ...(body !== undefined ? { 'Content-Length': Buffer.byteLength(body) } : {}), ...headers } }, res => {
   let raw = ''; res.setEncoding('utf8'); res.on('data', chunk => { raw += chunk; }); res.on('error', reject);
   res.on('end', () => { try { resolve({ status: res.statusCode, headers: res.headers, value: JSON.parse(raw) }); } catch (error) { reject(error); } });
  });
  req.on('error', reject); req.end(body);
 });
 const login = await call('/api/session', { method: 'POST', authenticated: false, body: '{}' });
 assert.equal(login.status, 200); cookie = login.headers['set-cookie'][0].split(';')[0];
 const project = (await call('/api/projects/current')).value;
 const indexed = (await call(`/api/projects/${project.id}/files?limit=100`)).value.files;
 const source = async (path, startLine = 1, lines = 160) => {
  const file = indexed.find(file => file.path === path); assert.ok(file, `${path} is indexed`);
  const result = await call(`/api/projects/${project.id}/source?fileId=${file.id}&start=${startLine}&lines=${lines}`);
  assert.equal(result.status, 200); return result.value;
 };
 const selection = async (...paths) => {
  const selected = [];
  for (const path of paths) { const value = await source(path); selected.push({ fileId: value.fileId, sourceHash: value.sourceHash, startLine: value.startLine }); }
  return selected;
 };
 const route = value => `/api/projects/${project.id}/knowledge?selection=${encodeURIComponent(JSON.stringify(value))}`;
 return { call, source, selection, route, project, indexed, reads, operations, root, directory };
}

test('real protected knowledge service returns bounded static source evidence without executing project scripts', async t => {
 const h = await harness(t), selection = await h.selection('entry.ts', 'rule.ts');
 const result = await h.call(h.route(selection));
 assert.equal(result.status, 200); assert.equal(result.headers['cache-control'], 'no-store');
 const knowledge = codebaseKnowledgeSchema.parse(result.value);
 assert.equal(knowledge.projectId, h.project.id); assert.equal(knowledge.analysisVersion, 2); assert.match(knowledge.knowledgeId, /^[a-f0-9]{64}$/);
 assert.deepEqual(knowledge.files.map(file => file.path), ['entry.ts', 'rule.ts']);
 assert.deepEqual(knowledge.order, knowledge.files.map(file => file.contextId));
 assert.deepEqual(knowledge.relationships, [{ from: knowledge.files[0].contextId, to: knowledge.files[1].contextId, kind: 'imports', line: 1 }]);
 assert.deepEqual(h.reads, [...selection, ...selection].map(file => [file.fileId, 1, 160]));
 for (const [index, file] of knowledge.files.entries()) {
  assert.equal(file.sourceHash, selection[index].sourceHash); assert.equal(file.truncated, false);
  assert.ok(file.concepts.length <= 5); assert.ok(file.capturedAt); assert.ok(file.fileBytes > 0);
  assert.match(file.contextId, /^[a-f0-9]{64}$/); assert.equal(file.catalog.length, 1); assert.equal(file.catalog[0].complete, true); assert.equal(file.omittedDeclarations, 0);
 }
 assert.ok(knowledge.limits.length); assert.equal(knowledge.relationships.some(edge => edge.kind === 'calls'), false);
 assert.ok(!h.indexed.some(file => /credentials|escape|node_modules|\.hidden/.test(file.path)));
 assert.equal(await readFile(join(h.root, 'entry.ts'), 'utf8'), entry);
 const repeated = await h.call(h.route(selection)); assert.equal(repeated.status, 200); assert.equal(repeated.value.knowledgeId, knowledge.knowledgeId);
 assert.equal((await h.call(h.route(await h.selection('check.mjs')))).status, 200);
 await assert.rejects(access(join(h.root, 'executed.txt')), { code: 'ENOENT' });
});

test('knowledge API validates sessions, Origin, Host, exact queries and strict bounded source selections before reads', async t => {
 const h = await harness(t), selection = await h.selection('entry.ts', 'rule.ts'), route = h.route(selection);
 for (const [options, status] of [[{ authenticated: false }, 401], [{ headers: { Origin: 'https://attacker.example' } }, 403], [{ headers: { Host: 'attacker.example' } }, 403], [{ headers: { 'Sec-Fetch-Site': 'cross-site' } }, 403], [{ method: 'POST', body: '{}' }, 405], [{ method: 'DELETE' }, 405], [{ body: '{}' }, 400]]) assert.equal((await h.call(route, options)).status, status);
 const invalid = [[], Array(6).fill(selection[0]), [selection[0], selection[0]], [{ ...selection[0], extra: true }], [{ ...selection[0], fileId: '../../outside.ts' }], [{ ...selection[0], sourceHash: 'bad' }], [{ ...selection[0], startLine: 0 }], [{ ...selection[0], startLine: 1.5 }], [{ ...selection[0], startLine: 1_000_000_000 }], [{ ...selection[0], startLine: '1' }]];
 invalid.push(...[0, 201, 1.5, '160'].map(lines => [{ ...selection[0], lines }]), [{ ...selection[0], focus: 'run-shell' }], [selection[0], { ...selection[0], lines: 160 }], [selection[0], { ...selection[0], startLine: 2, sourceHash: 'a'.repeat(64) }]);
 for (const value of invalid) assert.equal((await h.call(h.route(value))).status, 400, JSON.stringify(value));
 for (const path of [route + '&extra=true', route + '&selection=%5B%5D', `/api/projects/${h.project.id}/knowledge`, `/api/projects/${h.project.id}/knowledge?selection=not-json`, `/api/projects/${h.project.id}/knowledge?selection=${'x'.repeat(4097)}`]) assert.equal((await h.call(path)).status, 400);
 assert.equal(h.reads.length, 0);
 assert.equal((await h.call(route.replace(h.project.id, 'f'.repeat(64)))).status, 404);
 assert.equal(h.reads.length, 0, 'Foreign projects must be rejected before reading selected source.');
 assert.equal((await h.call(h.route([{ ...selection[0], fileId: 'f'.repeat(64) }]))).status, 404);
 assert.equal((await h.call(h.route([{ ...selection[0], startLine: 999_999_999 }]))).status, 416);
});

test('freshness requires each selected current full-file hash and recovers only with freshly captured selections', async t => {
 const h = await harness(t), selection = await h.selection('entry.ts', 'rule.ts');
 await writeFile(join(h.root, 'rule.ts'), rule + '// changed after capture\n');
 const stale = await h.call(h.route(selection)); assert.equal(stale.status, 409); assert.equal(stale.value.files, undefined);
 const fresh = await h.selection('entry.ts', 'rule.ts'); assert.notEqual(fresh[1].sourceHash, selection[1].sourceHash);
 assert.equal((await h.call(h.route(fresh))).status, 200);
 await rm(join(h.root, 'rule.ts')); await symlink(join(h.directory, 'outside.ts'), join(h.root, 'rule.ts'));
 const unavailable = await h.call(h.route(fresh)); assert.equal(unavailable.status, 422); assert.equal(unavailable.value.files, undefined);
 assert.ok(!JSON.stringify(unavailable.value).includes(h.directory));
});

test('private contents and excluded or unknown source IDs cannot be captured into knowledge', async t => {
 const h = await harness(t), selection = await h.selection('entry.ts');
 const privateFile = h.indexed.find(file => file.path === 'config.ts'); assert.ok(privateFile);
 const hiddenIds = ['credentials.ts', 'escape.ts', 'node_modules/vendor.ts', '.hidden/hidden.ts'].map(path => sha(h.project.id + '\0' + path));
 for (const fileId of [privateFile.id, ...hiddenIds]) {
  const result = await h.call(h.route([{ ...selection[0], fileId }]));
  assert.equal(result.status, fileId === privateFile.id ? 422 : 404); assert.equal(result.value.files, undefined);
  assert.ok(!JSON.stringify(result.value).includes('fake-local-fixture-value'));
 }
});

test('empty, malformed, unsupported and partial excerpts retain explicit coverage instead of invented concepts', async t => {
 const long = Array(160).fill('// captured header').join('\n') + '\nexport function outsideExcerpt() { return true; }\n';
 const h = await harness(t, { files: { 'long.ts': long } }), selection = await h.selection('empty.ts', 'invalid.ts', 'helper.py', 'long.ts');
 const result = await h.call(h.route(selection)); assert.equal(result.status, 200);
 const knowledge = codebaseKnowledgeSchema.parse(result.value);
 assert.deepEqual(knowledge.files.map(file => file.status), ['empty', 'invalid', 'unsupported', 'empty']);
 assert.ok(knowledge.files.every(file => file.concepts.length === 0 && file.relationships.length === 0 && file.order.length === 0));
 assert.equal(knowledge.files[0].startLine, 1); assert.equal(knowledge.files[0].endLine, 0);
 assert.equal(knowledge.files[3].truncated, true); assert.equal(knowledge.files[3].endLine, 160);
 assert.deepEqual(knowledge.relationships, []); assert.deepEqual(knowledge.order, knowledge.files.map(file => file.contextId));
});

test('distinct default-160 and explicit-200 captures of the real lesson keep separate context identities and declaration coverage', async t => {
 const code = await readFile(new globalThis.URL('./src/ProjectLesson.tsx', import.meta.url), 'utf8');
 const h = await harness(t, { files: { 'ProjectLesson.tsx': code } });
 const source = await h.source('ProjectLesson.tsx'), pin = { fileId: source.fileId, sourceHash: source.sourceHash, startLine: 1 };
 const result = await h.call(h.route([pin, { ...pin, lines: 200 }])); assert.equal(result.status, 200);
 const knowledge = codebaseKnowledgeSchema.parse(result.value), [partial, complete] = knowledge.files;
 assert.equal(knowledge.analysisVersion, 2); assert.equal(partial.fileId, complete.fileId); assert.equal(partial.sourceHash, complete.sourceHash);
 assert.notEqual(partial.contextId, complete.contextId); assert.deepEqual(knowledge.order, [partial.contextId, complete.contextId]);
 assert.equal(partial.endLine, 160); assert.equal(partial.truncated, true); assert.equal(partial.status, 'partial');
 assert.ok(partial.catalog.some(declaration => declaration.name === 'ProjectLesson' && !declaration.complete)); assert.deepEqual(partial.relationships, []);
 assert.equal(complete.endLine, code.trimEnd().split('\n').length); assert.equal(complete.truncated, false); assert.equal(complete.status, 'ready');
 assert.ok(complete.catalog.some(declaration => declaration.name === 'ProjectLesson' && declaration.complete));
 assert.ok(complete.catalog.some(declaration => declaration.name === 'retryReceipt' && declaration.complete && declaration.scope.includes('ProjectLesson')));
 assert.ok(complete.catalog.length > 5); assert.equal(complete.fileBytes, Buffer.byteLength(code));
 assert.deepEqual(h.reads, [[pin.fileId, 1, 160], [pin.fileId, 1, 200], [pin.fileId, 1, 160], [pin.fileId, 1, 200]]);
 const expanded = await h.call(h.route([{ ...pin, lines: 200 }])); assert.equal(expanded.status, 200); assert.equal(expanded.value.files[0].contextId, complete.contextId);
});

test('a partial capture of the real host factory preserves provenance and declaration metadata without a local call graph', async t => {
 const code = await readFile(new globalThis.URL('./project-service.mjs', import.meta.url), 'utf8');
 const h = await harness(t, { files: { 'host.mjs': code } }), selection = await h.selection('host.mjs');
 const result = await h.call(h.route(selection)); assert.equal(result.status, 200);
 const file = codebaseKnowledgeSchema.parse(result.value).files[0];
 assert.equal(file.status, 'partial'); assert.equal(file.path, 'host.mjs'); assert.equal(file.startLine, 1); assert.equal(file.endLine, 160);
 assert.equal(file.sourceHash, sha(code)); assert.equal(file.fileBytes, Buffer.byteLength(code)); assert.equal(file.truncated, true);
 assert.ok(file.catalog.some(declaration => declaration.name === 'createProjectService' && !declaration.complete));
 assert.deepEqual(file.relationships, []); assert.ok(file.message.length > 0);
});

test('explicit nested focus selects a complete catalogue declaration beyond the initial five-concept graph without changing capture identity', async t => {
 const code = [...Array.from({ length: 7 }, (_, index) => `export function first${index}() { return ${index}; }`), 'export function host() { function nested() { return true; } return nested(); }'].join('\n');
 const h = await harness(t, { files: { 'nested.ts': code } }), selection = await h.selection('nested.ts');
 const result = await h.call(h.route(selection)); assert.equal(result.status, 200);
 const initial = codebaseKnowledgeSchema.parse(result.value).files[0], nested = initial.catalog.find(declaration => declaration.name === 'nested'); assert.ok(nested);
 assert.equal(nested.complete, true); assert.ok(nested.scope.includes('host')); assert.ok(!initial.concepts.some(concept => concept.id === nested.id));
 const focused = await h.call(h.route([{ ...selection[0], focus: nested.id }])); assert.equal(focused.status, 200);
 const selected = codebaseKnowledgeSchema.parse(focused.value).files[0];
 assert.equal(selected.contextId, initial.contextId); assert.equal(selected.order[0], nested.id); assert.ok(selected.concepts.some(concept => concept.id === nested.id));
 assert.deepEqual(selected.catalog, initial.catalog);
 const missing = await h.call(h.route([{ ...selection[0], focus: 'concept-9999' }])); assert.equal(missing.status, 422); assert.equal(missing.value.files, undefined);
});

test('different requested lengths that collapse to one actual short-file context are rejected rather than assigned fabricated identities', async t => {
 const h = await harness(t), [pin] = await h.selection('entry.ts');
 const result = await h.call(h.route([pin, { ...pin, lines: 200 }]));
 assert.equal(result.status, 422); assert.equal(result.value.files, undefined);
 assert.deepEqual(h.reads, [[pin.fileId, 1, 160], [pin.fileId, 1, 200]]);
 assert.equal((await h.call(h.route([pin]))).status, 200);
});

test('final capture pass rejects changes while another selected source is being read', async t => {
 const h = await harness(t, { readSource: async (service, args, count, root) => {
  if (count === 2) await writeFile(join(root, 'entry.ts'), entry + '// changed during batch\n');
  return service.readSource(...args);
 } });
 const selection = await h.selection('entry.ts', 'rule.ts'), result = await h.call(h.route(selection));
 assert.equal(result.status, 409); assert.equal(result.value.files, undefined); assert.equal(h.reads.length, 3);
});

test('unchanged claimed hashes cannot disguise a different re-read source range or text', async t => {
 for (const mutate of [source => ({ ...source, text: source.text.replace('allows', 'hides') }), source => ({ ...source, endLine: source.endLine + 1 }), source => ({ ...source, startLine: 2 })]) {
  const h = await harness(t, { readSource: async (service, args, count) => { const source = await service.readSource(...args); return count === 2 ? mutate(source) : source; } });
  const result = await h.call(h.route(await h.selection('rule.ts')));
  assert.equal(result.status, 409); assert.equal(result.value.files, undefined);
 }
});

test('read failures are redacted and release the in-flight slot for a later valid request', async t => {
 let fail = true;
 const h = await harness(t, { readSource: async (service, args) => { if (fail) throw new Error('private backend fixture diagnostics'); return service.readSource(...args); } });
 const route = h.route(await h.selection('entry.ts'));
 const error = await h.call(route); assert.equal(error.status, 422); assert.equal(error.value.files, undefined); assert.ok(!JSON.stringify(error.value).includes('private backend fixture diagnostics'));
 fail = false; assert.equal((await h.call(route)).status, 200);
});

test('one in-flight knowledge batch rejects concurrent work and a disconnected client discards its late read', async t => {
 let release, enteredResolve, cancelledResolve;
 const entered = new Promise(resolve => { enteredResolve = resolve; }), cancelled = new Promise(resolve => { cancelledResolve = resolve; });
 const h = await harness(t, { onCancelled: () => cancelledResolve(), readSource: async (service, args, count) => {
  if (count === 1) { enteredResolve(); await new Promise(resolve => { release = resolve; }); }
  return service.readSource(...args);
 } });
 const route = h.route(await h.selection('entry.ts', 'rule.ts')), controller = new globalThis.AbortController();
 const pending = h.call(route, { signal: controller.signal }); await entered;
 assert.equal((await h.call(route)).status, 429); assert.equal(h.reads.length, 1);
 controller.abort(); await assert.rejects(pending, { name: 'AbortError' }); await cancelled;
 release(); await h.operations[0]; assert.equal(h.reads.length, 1);
 const recovered = await h.call(route); assert.equal(recovered.status, 200); assert.equal(h.reads.length, 5);
});

test('fixed batch deadline returns a bounded timeout, stops queued reads and holds busy until the active read settles', { timeout: 20_000 }, async t => {
 let release;
 const h = await harness(t, { readSource: async (service, args, count) => {
  if (count === 1) await new Promise(resolve => { release = resolve; });
  return service.readSource(...args);
 } });
 t.after(() => release?.());
 const route = h.route(await h.selection('entry.ts', 'rule.ts')), started = globalThis.performance.now();
 const result = await h.call(route), elapsed = globalThis.performance.now() - started;
 assert.equal(result.status, 408); assert.equal(result.value.error.code, 'knowledge_timeout'); assert.equal(result.value.files, undefined);
 assert.ok(elapsed >= 11_000 && elapsed < 15_000, `actual deadline response took ${Math.round(elapsed)}ms`);
 assert.equal(h.reads.length, 1); assert.equal((await h.call(route)).status, 429);
 release(); await h.operations[0]; assert.equal(h.reads.length, 1);
 const recovered = await h.call(route); assert.equal(recovered.status, 200); assert.equal(h.reads.length, 5);
 t.diagnostic(`Actual timeout returned after ${Math.round(elapsed)}ms; recovery returned current knowledge.`);
});
