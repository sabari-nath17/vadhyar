import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, it } from 'vitest';
import { captureProject, changesBetween, newIntent, loadProject, saveProject, emptyProject, suggestSources } from '../src/project/model.js';

const roots: string[] = [];
async function root() { const path = await mkdtemp(join(tmpdir(), 'vadhyar-project-')); roots.push(path); return path; }
afterEach(async () => { await Promise.all(roots.splice(0).map(path => rm(path, { recursive: true, force: true }))); });
it('captures multiple files, additions and deletions without dependencies, secrets or symlinks', async () => {
 const path = await root(); await mkdir(join(path, 'src')); await mkdir(join(path, 'node_modules')); await writeFile(join(path, 'src/a.ts'), 'export const a = 1;\n'); await writeFile(join(path, 'src/b.ts'), 'export const b = 2;\n'); await writeFile(join(path, '.env'), 'SECRET=private'); await writeFile(join(path, 'node_modules/c.ts'), 'dependency'); await symlink(join(path, 'src/a.ts'), join(path, 'src/link.ts'));
 const before = await captureProject(path); expect(before.files.map(file => file.path)).toEqual(['src/a.ts', 'src/b.ts']);
 await rm(join(path, 'src/b.ts')); await writeFile(join(path, 'src/a.ts'), 'export const a = 3;\n'); await writeFile(join(path, 'src/c.py'), 'print(4)\n');
 const after = await captureProject(path); expect(changesBetween(before, after).map(change => [change.path, change.kind])).toEqual([['src/a.ts', 'modified'], ['src/b.ts', 'deleted'], ['src/c.py', 'added']]); expect(after.id).not.toBe(before.id);
});
it('preserves confirmed intent revisions and previous valid storage after a rejected write', async () => {
 const path = await root(); const record = emptyProject(); const first = newIntent({ title: 'Reminders', request: 'Add reminders', expected: 'Send 24 hours before due', origin: 'manual' }); first.confirmedAt = new Date().toISOString(); record.intents.push(first); await saveProject(path, record); const before = await readFile(join(path, 'project.json'), 'utf8');
 const revised = newIntent({ title: 'Reminders', request: 'Change reminders', expected: 'Send 48 hours before due', origin: 'manual' }); record.intents.push(revised); await saveProject(path, record); expect((await loadProject(path)).intents).toHaveLength(2); expect(revised.confirmedAt).toBeUndefined();
 const valid = await readFile(join(path, 'project.json'), 'utf8'); record.intents[0].revision = '0'.repeat(64); await expect(saveProject(path, record)).rejects.toThrow(); expect(await readFile(join(path, 'project.json'), 'utf8')).toBe(valid); expect(before).not.toBe(valid);
});

it('detects Git-tracked deletions', async () => {
 const path = await root(); await promisify(execFile)('git', ['init', '-q'], {cwd:path}); await mkdir(join(path,'src')); await writeFile(join(path,'src/a.ts'),'one'); await writeFile(join(path,'src/b.ts'),'two'); await promisify(execFile)('git',['add','src'],{cwd:path}); const before=await captureProject(path); await rm(join(path,'src/a.ts')); const after=await captureProject(path); expect(changesBetween(before,after).map(item=>item.kind)).toEqual(['deleted']);
});
it('excludes private-looking and oversized content without exposing it', async () => {
 const path = await root(); await writeFile(join(path,'private.ts'),'const api_key = "sk-proj-' + 'x'.repeat(30) + '";'); await writeFile(join(path,'large.ts'),'x'.repeat(100001)); const snapshot=await captureProject(path); expect(snapshot.files).toEqual([]); expect(snapshot.omitted).toEqual(['large.ts','private.ts']);
});

it('deduplicates source history and preserves memory when a source blob is lost', async () => {
 const path=await root(); const project=await root(); await writeFile(join(project,'a.ts'),'export const a = 1;'); const snapshot=await captureProject(project); const record=emptyProject(); record.baseline=snapshot; record.current=snapshot; const intent=newIntent({title:'Count',request:'Show count',expected:'Show one',origin:'manual'}); record.intents=[intent]; record.intentSnapshots=[{intentId:intent.id,revision:intent.revision,snapshot}]; await saveProject(path,record); expect((await loadProject(path)).intentSnapshots[0].snapshot.files[0].content).toBe('export const a = 1;'); const stored=await readFile(join(path,'project.json'),'utf8'); expect(stored).not.toContain('export const'); await rm(join(path,'project-sources',snapshot.files[0].hash)); await expect(loadProject(path)).rejects.toThrow(/preserved/); expect(await readFile(join(path,'project.json'),'utf8')).toBe(stored);
});
it('rejects private-looking intent titles', () => {
 expect(()=>newIntent({title:'sk-proj-'+ 'x'.repeat(30),request:'Show count',expected:'One',origin:'manual'})).toThrow(/secret/);
});

it('proposes source matches without modifying or confirming the intention', async()=>{
 const path=await root(); await writeFile(join(path,'reminders.ts'),'export function sendReminder() {}'); await writeFile(join(path,'other.ts'),'export const value = 1;'); const snapshot=await captureProject(path); const intent=newIntent({title:'Reminders',request:'Add reminders',expected:'Send once',origin:'manual'}); expect(suggestSources(snapshot,intent)).toEqual(['reminders.ts']); expect(intent.confirmedAt).toBeUndefined();
});

it('enforces the snapshot byte limit for non-ASCII source', async()=>{
 const path=await root(); for(let i=0;i<23;i++) await writeFile(join(path,`file${i}.ts`),'漢'.repeat(30000)); const snapshot=await captureProject(path); expect(snapshot.files.reduce((sum,file)=>sum+Buffer.byteLength(file.content,'utf8'),0)).toBeLessThanOrEqual(2000000); expect(snapshot.omitted).toHaveLength(1);
});
