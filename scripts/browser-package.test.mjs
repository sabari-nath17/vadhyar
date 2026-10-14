import { strict as assert } from 'node:assert';
import { createHash } from 'node:crypto';
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { homedir, tmpdir } from 'node:os';
import { delimiter, dirname, join } from 'node:path';
import process from 'node:process';
import { after, before, test } from 'node:test';
import { fileURLToPath, URL } from 'node:url';
import { clearTimeout, setTimeout } from 'node:timers';
import { setTimeout as delay } from 'node:timers/promises';
import { packageBrowser } from './browser-package.mjs';
import { installBrowser } from './browser-install.mjs';

let work, bundle, release;
before(async () => {
 work = await mkdtemp(join(tmpdir(), 'vadhyar-browser-install-test-'));
 const served = fileURLToPath(new URL('../prototype/dist/app.js', import.meta.url));
 const previous = await readFile(served).catch(error => { if (error.code === 'ENOENT') return null; throw error; });
 release = await packageBrowser(join(work, 'releases'));
 assert.deepEqual(await readFile(served).catch(error => { if (error.code === 'ENOENT') return null; throw error; }), previous, 'Packaging must not change the source-checkout browser served by an existing host.');
 execFileSync('tar', ['-xzf', release.archive, '-C', work]);
 bundle = join(work, 'vadhyar-browser-0.1.0');
});
after(async () => { if (work) await rm(work, { recursive: true, force: true }); });

test('portable release has locked bundled runtime, MIT and complete notices, without source/private/development files', async () => {
 const bytes = await readFile(release.archive);
 assert.equal(createHash('sha256').update(bytes).digest('hex'), release.sha256);
 assert.match(await readFile(release.archive + '.sha256', 'utf8'), new RegExp('^' + release.sha256));
 const paths = release.files.map(file => file.path);
 const members = execFileSync('tar', ['-tzf', release.archive], { encoding: 'utf8' }).trim().split('\n');
 assert.ok(!members.some(path => path.split('/').some(part => part.startsWith('._'))), 'The archive must not include macOS extended metadata.');
 assert.deepEqual(members.filter(path => !path.endsWith('/')).map(path => path.replace(/^vadhyar-browser-0\.1\.0\//, '')).sort(), [...paths, 'MANIFEST.json'].sort(), 'Every regular archive member must be declared.');
 assert.ok(paths.includes('LICENSE')); assert.ok(paths.includes('runtime/serve.mjs'));
 assert.ok(!paths.some(path => /node_modules|\.env|sqlite|project\.json|graft|fixture|\.ts$|\.map$/.test(path)));
 const manifest = JSON.parse(await readFile(join(bundle, 'package.json'), 'utf8'));
 assert.equal(manifest.license, 'MIT'); assert.equal(manifest.dependencies, undefined);
 const info = JSON.parse(await readFile(join(bundle, 'BUILD_INFO.json'), 'utf8'));
 assert.ok(info.runtimeDependencies.some(item => item.name === 'typescript'));
 assert.ok(info.runtimeDependencies.some(item => item.name === 'openai'));
 assert.ok(info.runtimeDependencies.some(item => item.name === 'zod'));
 assert.ok(!info.runtimeDependencies.some(item => /promptfoo|vitest|esbuild/.test(item.name)));
  assert.ok(info.clientDependencies.some(item => item.name === 'react'));
  assert.ok(info.clientDependencies.some(item => item.name === '@xyflow/react'));
  assert.ok(![...info.clientDependencies, ...info.runtimeDependencies].some(item => /node-forge|promptfoo|basic-ftp/.test(item.name)));
 const notices = await readFile(join(bundle, 'THIRD_PARTY_NOTICES.txt'), 'utf8');
 for (const value of ['Apache License', 'learn-claude-code', 'pocketflow', 'Bundled local runtime: typescript', 'Bundled local runtime: openai']) assert.ok(notices.includes(value), value);
});

test('installer refuses altered releases and an existing destination without changing its contents', async () => {
 const destination = join(work, 'existing'); await mkdir(destination); await writeFile(join(destination, 'keep.txt'), 'existing files');
 await assert.rejects(installBrowser(bundle, destination), /already exists/);
 assert.equal(await readFile(join(destination, 'keep.txt'), 'utf8'), 'existing files');
 const changed = join(work, 'changed'); await cp(bundle, changed, { recursive: true }); await writeFile(join(changed, 'start.mjs'), 'modified');
 await assert.rejects(installBrowser(changed, join(work, 'rejected')), /unsafe or changed|checksum/);
 const manifest = JSON.parse(await readFile(join(changed, 'MANIFEST.json'), 'utf8')); manifest.files[0].path = '../outside';
 await writeFile(join(changed, 'MANIFEST.json'), JSON.stringify(manifest));
 await assert.rejects(installBrowser(changed, join(work, 'escape')), /unsupported|incomplete/);
});

test('fresh installed host serves assets, rejects unauthenticated access, reads real source/knowledge and executes only a consented fixture check', { timeout: 30_000 }, async () => {
 const installed = join(work, 'installed app with spaces');
 assert.match(execFileSync(process.execPath, [join(bundle, 'install.mjs'), '--to', installed], { cwd: work, encoding: 'utf8' }), /installed in/);
 const missingProject = join(work, 'private-missing-project'), refused = spawnSync(process.execPath, [join(installed, 'start.mjs'), '--project', missingProject], { cwd: work, encoding: 'utf8' });
 assert.equal(refused.status, 1); assert.match(refused.stderr, /could not start/); assert.ok(!refused.stderr.includes(missingProject));
 const projectRoot = join(work, 'trusted fixture with spaces'); await mkdir(projectRoot);
 await writeFile(join(projectRoot, 'answer.ts'), 'export const canReserve = count => count > 0;\n');
 const fixtureCommand = 'node -e "const fs=require(\'node:fs\'); const p=\'.check-count\'; fs.writeFileSync(p,String(Number(fs.existsSync(p)?fs.readFileSync(p):0)+1)); console.log(\'fixture check passed\')"';
 await writeFile(join(projectRoot, 'package.json'), JSON.stringify({ scripts: { pretest: 'node -e "require(\'node:fs\').writeFileSync(\'.pre-hook\',\'ran\')"', test: fixtureCommand } }));
 const socket = createServer(); await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve)); const port = socket.address().port; await new Promise(resolve => socket.close(resolve));
 const origin = `http://127.0.0.1:${port}`, child = spawn(process.execPath, [join(installed, 'start.mjs'), '--project', projectRoot, '--port', String(port)], { cwd: work, env: { ...process.env, PATH: dirname(process.execPath) + delimiter + process.env.PATH }, stdio: ['ignore', 'pipe', 'pipe'] });
 let diagnostics = ''; child.stdout.on('data', value => { diagnostics += value; }); child.stderr.on('data', value => { diagnostics += value; });
 const closed = once(child, 'close'); let recorder;
 try {
  let ready = false;
  for (let i = 0; i < 150; i++) { if (child.exitCode !== null) assert.fail(diagnostics); if (diagnostics.includes(`Vadhyar companion: ${origin}`)) { ready = true; break; } await delay(40); }
  assert.ok(ready, diagnostics);
  const index = await globalThis.fetch(origin); assert.equal(index.status, 200); assert.match(await index.text(), /app\.js/);
  assert.equal((await globalThis.fetch(origin + '/app.js')).status, 200); assert.equal((await globalThis.fetch(origin + '/app.css')).status, 200);
  const assets = release.files.filter(file => file.path.startsWith('runtime/dist/assets/') && /\.(?:png|woff2)$/.test(file.path));
  for (const asset of assets) assert.equal((await globalThis.fetch(origin + '/' + asset.path.slice('runtime/dist/'.length))).status, 200, asset.path);
  assert.equal((await globalThis.fetch(origin + '/api/projects/current', { headers: { Origin: origin } })).status, 401);
  const login = await globalThis.fetch(origin + '/api/session', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: '{}' }); assert.equal(login.status, 200);
  const cookie = login.headers.get('set-cookie').split(';')[0];
  const request = async (path, body) => { const response = await globalThis.fetch(origin + path, { method: body === undefined ? 'GET' : 'POST', headers: { Origin: origin, Cookie: cookie, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) }); return { status: response.status, value: await response.json() }; };
  let project;
  for (let i = 0; i < 100; i++) { project = (await request('/api/projects/current')).value; if (project.status !== 'indexing') break; await delay(20); }
  assert.equal(project.status, 'ready');
  const data = process.platform === 'darwin' ? join(homedir(), 'Library', 'Application Support', 'Vadhyar', 'prototype') : process.platform === 'win32' ? join(process.env.LOCALAPPDATA ?? homedir(), 'Vadhyar', 'prototype') : join(homedir(), '.local', 'share', 'Vadhyar', 'prototype'); recorder = join(data, project.id);
  assert.equal((await globalThis.fetch(origin + '/api/projects/current', { headers: { Origin: 'http://attacker.example', Cookie: cookie } })).status, 403);
  const base = `/api/projects/${project.id}`, files = (await request(base + '/files')).value.files, file = files.find(value => value.path === 'answer.ts'); assert.ok(file);
  const source = (await request(base + '/source?fileId=' + file.id)).value; assert.match(source.text, /canReserve/);
  const knowledge = await request(base + '/knowledge?selection=' + encodeURIComponent(JSON.stringify([{ fileId: file.id, sourceHash: source.sourceHash, startLine: 1 }]))); assert.equal(knowledge.status, 200); assert.equal(knowledge.value.files[0].fileId, file.id);
  assert.equal((await request('/api/teaching')).value.connected, false);
  await assert.rejects(readFile(join(projectRoot, '.check-count')), { code: 'ENOENT' });
  const script = (await request(base + '/scripts')).value.scripts[0], consent = { scriptId: script.id, fileId: file.id, sourceHash: source.sourceHash, manifestHash: script.manifestHash, approved: true };
  assert.equal((await request(base + '/runs', { ...consent, approved: false })).status, 400);
  const started = await request(base + '/runs', consent); assert.equal(started.status, 202);
  let run;
  for (let i = 0; i < 150; i++) { run = (await request(base + '/runs/' + started.value.id)).value; if (run.status !== 'running') break; await delay(40); }
  assert.equal(run.status, 'passed', JSON.stringify(run)); assert.equal(run.freshness, 'current'); assert.match(run.output, /fixture check passed/);
  assert.equal(await readFile(join(projectRoot, '.check-count'), 'utf8'), '1');
  await assert.rejects(readFile(join(projectRoot, '.pre-hook')), { code: 'ENOENT' });
  assert.equal((await globalThis.fetch(origin + '/package.json')).status, 404);
  process.stdout.write(`Fresh-install smoke passed with Node ${process.versions.node}; protected host, ${assets.length} assets, source/knowledge and one fixture check.\n`);
 } finally { child.kill('SIGTERM'); const timer = setTimeout(() => child.kill('SIGKILL'), 5000); try { await closed; } finally { clearTimeout(timer); } if (recorder) await rm(recorder, { recursive: true, force: true }); }
});
