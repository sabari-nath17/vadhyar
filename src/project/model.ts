import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { lstat, mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { z } from 'zod';
import { hash } from '../extension/source.js';
import { checkSchema, fileSchema, guideSchema, intentInput, intentSchema, pathSchema, snapshotSchema, type FileChange, type Intent, type Snapshot } from './shared.js';

export const privateText = /(\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}|-----BEGIN [A-Z ]*PRIVATE KEY|(?:api[_-]?key|secret|password|token)\s*[:=]\s*["'][^"']+["'])/i;
const extensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.py', '.go', '.rs', '.java', '.kt', '.swift', '.rb', '.php', '.cs', '.c', '.cpp', '.h', '.vue', '.svelte', '.html', '.css', '.scss', '.sql', '.md', '.json', '.yaml', '.yml', '.toml']);
const excluded = new Set(['node_modules', 'dist', 'build', 'coverage', 'vendor', 'venv', '__pycache__', 'target', 'graft', 'media', 'evals']);
export function supportedPath(path: string): boolean {
  return pathSchema.safeParse(path).success && !path.split('/').some(part => excluded.has(part)) && !/(?:^|\/)(?:secrets?|credentials?|private[-_]?keys?)(?:\.|\/|$)/i.test(path) && extensions.has(extname(path).toLowerCase());
}
export function snapshotIdentity(files: Snapshot['files']): string { return hash(JSON.stringify(files.map(file => [file.path, file.hash]))); }
async function pathsUnder(root: string): Promise<string[]> {
  try {
    const { stdout } = await promisify(execFile)('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: root, timeout: 5000, maxBuffer: 2_000_000 });
    return [...new Set(stdout.split('\0').filter(Boolean))].sort();
  } catch (error) {
    if ((error as { code?: number | string }).code !== 128 && (error as { code?: string }).code !== 'ENOENT') throw new Error('Project file discovery failed.', { cause: error });
    const paths: string[] = []; let visited = 0;
    async function walk(folder: string, prefix: string) {
      for (const entry of await readdir(folder, { withFileTypes: true })) {
        if (++visited > 10_000) throw new Error('Project exceeds the 10,000-entry discovery limit. Select a smaller workspace.');
        if (entry.name.startsWith('.') || excluded.has(entry.name) || entry.isSymbolicLink()) continue;
        const path = prefix + entry.name;
        if (entry.isDirectory()) await walk(join(folder, entry.name), path + '/');
        else if (entry.isFile()) paths.push(path);
      }
    }
    await walk(root, ''); return paths.sort();
  }
}
export async function readProjectFile(root: string, path: string) {
  if (!supportedPath(path)) throw new Error('Unsupported or private source path.');
  let absolute = resolve(root);
  for (const part of path.split('/')) {
    absolute = join(absolute, part);
    if ((await lstat(absolute)).isSymbolicLink()) throw new Error('Symbolic links are excluded from project context.');
  }
  const info = await lstat(absolute);
  if (!info.isFile() || info.size > 100_000) throw new Error('Source exceeds the 100KB per-file limit.');
  const content = await readFile(absolute, 'utf8');
  if (content.includes('\0') || privateText.test(content)) throw new Error('Binary or possible private content is excluded.');
  return fileSchema.parse({ path, content, hash: hash(content) });
}
export async function captureProject(root: string): Promise<Snapshot> {
  const files: Snapshot['files'] = [], omitted: string[] = []; let size = 0;
  for (const path of await pathsUnder(root)) {
    if (!supportedPath(path)) continue;
    if (files.length >= 300) { omitted.push(path); continue; }
    try {
      const file = await readProjectFile(root, path);
      if (size + Buffer.byteLength(file.content, 'utf8') > 2_000_000) { omitted.push(path); continue; }
      files.push(file); size += Buffer.byteLength(file.content, 'utf8');
    } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') omitted.push(path); }
    if (omitted.length > 1000) throw new Error('Too many excluded files. Select a smaller workspace.');
  }
  return { id: snapshotIdentity(files), capturedAt: new Date().toISOString(), files, omitted };
}
export function changesBetween(before: Snapshot, after: Snapshot): FileChange[] {
  const old = new Map(before.files.map(file => [file.path, file])), current = new Map(after.files.map(file => [file.path, file]));
  const changes: FileChange[] = [];
  for (const path of [...new Set([...old.keys(), ...current.keys()])].sort()) {
    const a = old.get(path), b = current.get(path);
    if (a?.hash === b?.hash || after.omitted.includes(path)) continue;
    const left = a?.content.split('\n') ?? [], right = b?.content.split('\n') ?? [];
    let start = 0, end = 0;
    while (start < left.length && start < right.length && left[start] === right[start]) start++;
    while (end < left.length - start && end < right.length - start && left[left.length - 1 - end] === right[right.length - 1 - end]) end++;
    changes.push({ path, kind: !a ? 'added' : !b ? 'deleted' : 'modified', beforeHash: a?.hash, afterHash: b?.hash, added: right.length - start - end, removed: left.length - start - end });
  }
  return changes;
}
export function newIntent(input: z.infer<typeof intentInput>): Intent {
  const data = intentInput.parse(input);
  if (privateText.test(data.title + data.request + data.expected)) throw new Error('Possible secret in intent; remove it before saving.');
  return { ...data, id: randomUUID(), revision: hash(JSON.stringify(data)), createdAt: new Date().toISOString() };
}
const checkResultSchema = z.object({ snapshot: z.string(), intentRevision: z.string().optional(), script: z.string(), packageHash: z.string(), exitCode: z.number().nullable(), kind: z.enum(['completed', 'timeout', 'error']), latencyMs: z.number(), output: z.string().max(12_000) }).strict();
const guideEvidenceSchema = z.object({ snapshot: z.string(), intentRevision: z.string(), operation: z.enum(['explain', 'plan']), result: guideSchema, responseId: z.string(), model: z.string(), latencyMs: z.number(), totalTokens: z.number().optional() }).strict();
export const projectRecordSchema = z.object({
  version: z.literal(1), intents: z.array(intentSchema).max(50), selectedIntent: z.uuid().optional(),
  baseline: snapshotSchema.optional(), current: snapshotSchema.optional(), selectedFiles: z.array(pathSchema).max(30),
  captureConnected: z.boolean(), capturedEventIds: z.array(z.uuid()).max(100), check: checkSchema.optional(), guide: guideEvidenceSchema.optional(), guides: z.array(guideEvidenceSchema).max(20).default([]), checkRuns: z.array(checkResultSchema).max(20).default([]), intentSnapshots: z.array(z.object({ intentId: z.uuid(), revision: z.string(), snapshot: snapshotSchema }).strict()).max(20).default([]),
}).strict().superRefine((record, ctx) => {
  if (record.intents.some(intent => hash(JSON.stringify({ title: intent.title, request: intent.request, expected: intent.expected, origin: intent.origin })) !== intent.revision)) ctx.addIssue({ code: 'custom', message: 'Invalid intent revision.' });
  for (const snap of [record.baseline, record.current, ...record.intentSnapshots.map(item => item.snapshot)]) if (snap && (snapshotIdentity(snap.files) !== snap.id || snap.files.some(file => hash(file.content) !== file.hash || !supportedPath(file.path)))) ctx.addIssue({ code: 'custom', message: 'Invalid snapshot identity.' });
  if (record.intentSnapshots.some(item => !record.intents.some(intent => intent.id === item.intentId && intent.revision === item.revision))) ctx.addIssue({ code: 'custom', message: 'Unknown checkpoint intention.' });
  if (new Set(record.intents.map(intent => intent.id)).size !== record.intents.length || (record.selectedIntent && !record.intents.some(intent => intent.id === record.selectedIntent))) ctx.addIssue({ code: 'custom', message: 'Invalid selected intent.' });
});
export type ProjectRecord = z.infer<typeof projectRecordSchema>;
export const emptyProject = (): ProjectRecord => ({ version: 1, intents: [], selectedFiles: [], captureConnected: false, capturedEventIds: [], guides: [], checkRuns: [], intentSnapshots: [] });
function snapshots(record: ProjectRecord) { return [record.baseline, record.current, ...record.intentSnapshots.map(item => item.snapshot)].filter((item): item is Snapshot => Boolean(item)); }
export async function loadProject(folder: string): Promise<ProjectRecord> {
 try {
   const info = await lstat(join(folder, 'project.json')); if (info.isSymbolicLink() || !info.isFile() || info.size > 5_000_000) throw new Error('Unsupported project memory file.');
   const text = await readFile(join(folder, 'project.json'), 'utf8'); if (Buffer.byteLength(text, 'utf8') > 5_000_000) throw new Error('Stored project exceeds limit.');
   const stored = JSON.parse(text);
   if (stored.storageVersion !== 1) return projectRecordSchema.parse(stored);
   const raw = z.object({ storageVersion: z.literal(1), record: z.record(z.string(), z.unknown()) }).strict().parse(stored).record;
   const list: unknown[] = [raw.baseline, raw.current];
   if (raw.intentSnapshots !== undefined) {
     const history = z.array(z.object({ snapshot: z.unknown() }).passthrough()).max(20).parse(raw.intentSnapshots); list.push(...history.map(item => item.snapshot));
   }
   const cache = new Map<string, string>(); let size = 0;
   for (const entry of list.filter(Boolean)) {
     const snap = z.object({ files: z.array(z.object({ path: pathSchema, hash: z.string().regex(/^[a-f0-9]{64}$/) }).strict()).max(300) }).passthrough().parse(entry);
     const hydrated = [];
     for (const file of snap.files) {
       let content = cache.get(file.hash);
       if (content === undefined) {
         const directory = join(folder, 'project-sources'); const path = join(directory, file.hash);
         if ((await lstat(directory)).isSymbolicLink()) throw new Error('Unsupported source storage.');
         const info = await lstat(path); if (info.isSymbolicLink() || !info.isFile() || info.size > 100_000) throw new Error('Unsupported source blob.');
         content = await readFile(path, 'utf8'); if (hash(content) !== file.hash) throw new Error('Corrupt source blob.');
         cache.set(file.hash, content); size += Buffer.byteLength(content, 'utf8'); if (size > 50_000_000) throw new Error('Source history exceeds 50MB.');
       }
       hydrated.push({ ...file, content });
     }
     (entry as { files: unknown[] }).files = hydrated;
   }
   return projectRecordSchema.parse(raw);
 } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
     // Only a missing record starts fresh; missing history must never erase memory.
     try { await lstat(join(folder, 'project.json')); } catch (missing) { if ((missing as NodeJS.ErrnoException).code === 'ENOENT') return emptyProject(); }
   }
   throw new Error('Project memory could not be loaded. Existing data was preserved.', { cause: error });
 }
}
export async function saveProject(folder: string, record: ProjectRecord): Promise<void> {
 const valid = projectRecordSchema.parse(record), stored = structuredClone(valid);
 for (const snap of snapshots(stored)) snap.files = snap.files.map(({ path, hash }) => ({ path, hash, content: '' }));
 const raw = JSON.parse(JSON.stringify(stored));
 for (const snap of [raw.baseline, raw.current, ...raw.intentSnapshots.map((item: { snapshot: unknown }) => item.snapshot)].filter(Boolean)) for (const file of snap.files) delete file.content;
 const text = JSON.stringify({ storageVersion: 1, record: raw });
 if (Buffer.byteLength(text, 'utf8') > 5_000_000) throw new Error('Project storage is full; previous valid memory was preserved.');
 const sources = join(folder, 'project-sources'); await mkdir(sources, { recursive: true, mode: 0o700 });
 if ((await lstat(sources)).isSymbolicLink()) throw new Error('Unsupported source storage.');
 const written = new Set<string>();
 for (const snap of snapshots(valid)) for (const file of snap.files) {
   if (written.has(file.hash)) continue; written.add(file.hash); const path = join(sources, file.hash);
   try { await writeFile(path, file.content, { flag: 'wx', mode: 0o600 }); }
   catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error; const info = await lstat(path); if (info.isSymbolicLink() || !info.isFile() || info.size > 100_000 || hash(await readFile(path, 'utf8')) !== file.hash) throw new Error('Existing source history is corrupt.', { cause: error }); }
 }
 const pending = join(folder, `project-${randomUUID()}.tmp`);
 try { await writeFile(pending, text, { flag: 'wx', mode: 0o600 }); await rename(pending, join(folder, 'project.json')); }
 finally { await rm(pending, { force: true }); }
}

export function suggestSources(snapshot: Snapshot, intent: Intent): string[] {
 const stop = new Set(['the', 'and', 'for', 'with', 'this', 'that', 'from', 'should', 'shall', 'must', 'add', 'when', 'then', 'code', 'feature', 'project', 'build', 'user', 'users']);
 const terms = [...new Set((intent.title + ' ' + intent.request + ' ' + intent.expected).toLowerCase().match(/[a-z][a-z0-9_]{2,}/g) ?? [])].filter(word => !stop.has(word));
 const ranked = snapshot.files.map(file => ({ path: file.path, score: terms.reduce((score, term) => score + (file.path.toLowerCase().includes(term) ? 4 : 0) + (file.content.toLowerCase().includes(term) ? 1 : 0), 0) })).filter(item => item.score > 0).sort((a, b) => b.score - a.score || a.path.localeCompare(b.path)).slice(0, 10);
 return ranked.map(item => item.path);
}
