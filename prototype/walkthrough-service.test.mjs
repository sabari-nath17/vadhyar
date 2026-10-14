import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, request } from 'node:http';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createProjectService } from './project-service.mjs';
import { createWalkthroughHandler } from './walkthrough-service.mjs';
import { walkthroughSchema } from './src/walkthrough-types.ts';

test('real local service enforces sessions, source identities, root boundaries and inert GET-only walkthroughs', async () => {
 const directory = await mkdtemp(join(tmpdir(), 'vadhyar-reuse-integration-')), root = join(directory, 'project');
 await mkdir(root); const code = 'type User = {id:string};\nfunction owns(u:User) {return u.id === "owner";}\nexport function approve(u:User) {return owns(u);}';
 await writeFile(join(root, 'rule.ts'), code); await writeFile(join(root, 'credentials.ts'), 'export function privateFile() {}');
 await writeFile(join(directory, 'outside.ts'), 'export function outside() {}'); await symlink(join(directory, 'outside.ts'), join(root,'escape.ts'));
 let service, cookie = '';
 const server = createServer(async (req, res) => { if (!await service.handle(req, res)) { res.writeHead(404); res.end('{}'); } });
 await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); const origin = `http://127.0.0.1:${server.address().port}`;
 const handler = createWalkthroughHandler({ readSource: (...args) => service.readSource(...args) });
 service = await createProjectService({ root, origin, storageRoot: join(directory,'records'), handleExtraApi: handler }); await service.ready;
 const call = (path, { method = 'GET', authenticated = true, headers = {} } = {}) => new Promise((resolve, reject) => {
  const req = request(origin + path, { method, headers: { Origin: origin, 'Sec-Fetch-Site': 'same-origin', ...(authenticated ? { Cookie: cookie } : {}), 'Content-Type':'application/json', ...headers } }, res => {
   let raw = ''; res.setEncoding('utf8'); res.on('data', chunk => { raw += chunk; }); res.on('end', () => resolve({code:res.statusCode,headers:res.headers,data:JSON.parse(raw)}));
  }); req.on('error', reject); req.end(method === 'POST' ? '{}' : undefined);
 });
 try {
  const login = await call('/api/session', {method:'POST',authenticated:false}); cookie = login.headers['set-cookie'][0].split(';')[0];
  const project = (await call('/api/projects/current')).data;
  const files = (await call(`/api/projects/${project.id}/files`)).data.files;
  assert.deepEqual(files.map(file => file.path),['rule.ts']);
  const file = files[0], source = (await call(`/api/projects/${project.id}/source?fileId=${file.id}`)).data;
  const route = `/api/projects/${project.id}/walkthrough?fileId=${file.id}&sourceHash=${source.sourceHash}&start=1`;
  const result = await call(route); assert.equal(result.code,200); walkthroughSchema.parse(result.data);
  assert.equal(result.data.concepts.length,3); assert.equal(result.data.relationships.length,3); assert.equal(result.data.sourceHash,source.sourceHash);
  assert.equal((await call(route,{authenticated:false})).code,401);
  assert.equal((await call(route,{headers:{Origin:'https://attacker.example'}})).code,403);
  assert.equal((await call(route,{headers:{Host:'attacker.example'}})).code,403);
  assert.equal((await call(route,{method:'POST'})).code,405);
  assert.equal((await call(route+'&start=2')).code,400);
  assert.equal((await call(route+'&command=run')).code,400);
  assert.equal((await call(route.replace(project.id,'f'.repeat(64)))).code,404);
  assert.equal((await call(route.replace(file.id,'f'.repeat(64)))).code,422);
  await writeFile(join(root,'rule.ts'),code+'\n// revised');
  assert.equal((await call(route)).code,409);
  const refreshed = (await call(`/api/projects/${project.id}/source?fileId=${file.id}`)).data;
  assert.equal((await call(route.replace(source.sourceHash,refreshed.sourceHash))).code,200);
  await rm(join(root,'rule.ts')); await symlink(join(directory,'outside.ts'),join(root,'rule.ts'));
  assert.equal((await call(route.replace(source.sourceHash,refreshed.sourceHash))).code,422);
 } finally { await service.close(); await new Promise(resolve => server.close(resolve)); await rm(directory,{recursive:true,force:true}); }
});
