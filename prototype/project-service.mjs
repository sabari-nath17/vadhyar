import { spawn } from 'node:child_process';
import { Buffer } from 'node:buffer';
import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { constants, watch } from 'node:fs';
import { chmod, lstat, mkdir, open, opendir, realpath } from 'node:fs/promises';
import { homedir } from 'node:os';
import { basename, extname, join, resolve, sep } from 'node:path';
import process from 'node:process';
import { clearInterval, clearTimeout, setInterval, setTimeout } from 'node:timers';
import { setImmediate as yieldTurn } from 'node:timers/promises';
import { URL } from 'node:url';
import { TextDecoder } from 'node:util';
import { DatabaseSync } from 'node:sqlite';
import { z } from 'zod';
import { sourceSnapshotSchema } from './src/project-types.ts';

const identity = z.string().regex(/^[a-f0-9]{64}$/);
const consentSchema = z.object({ scriptId: z.string().regex(/^[A-Za-z0-9:_-]{1,80}$/), fileId: identity, sourceHash: identity, manifestHash: identity, approved: z.literal(true) }).strict();
const manifestSchema = z.object({ scripts: z.record(z.string(), z.string()) }).passthrough();
const excluded = new Set(['node_modules', 'dist', 'build', 'coverage', 'vendor', 'venv', '__pycache__', 'target', 'graft', 'evals', 'out', 'bin', 'obj']);
const binary = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.pdf', '.zip', '.gz', '.br', '.tar', '.7z', '.woff', '.woff2', '.ttf', '.otf', '.mp3', '.mp4', '.wav', '.ogg', '.mov', '.avi', '.db', '.sqlite', '.sqlite3', '.exe', '.dll', '.so', '.dylib', '.o', '.class', '.pyc', '.wasm']);
const languages = { '.ts': 'TypeScript', '.tsx': 'TypeScript', '.js': 'JavaScript', '.jsx': 'JavaScript', '.mjs': 'JavaScript', '.cjs': 'JavaScript', '.py': 'Python', '.go': 'Go', '.rs': 'Rust', '.java': 'Java', '.kt': 'Kotlin', '.swift': 'Swift', '.rb': 'Ruby', '.php': 'PHP', '.cs': 'C#', '.c': 'C', '.cpp': 'C++', '.h': 'C', '.vue': 'Vue', '.svelte': 'Svelte', '.html': 'HTML', '.css': 'CSS', '.scss': 'SCSS', '.sql': 'SQL', '.md': 'Markdown', '.json': 'JSON', '.yaml': 'YAML', '.yml': 'YAML', '.toml': 'TOML' };
// shortcut: common credential literals only; review source and output before sharing them.
const privateText = /(\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}|-----BEGIN [A-Z ]*PRIVATE KEY|(?:api[_-]?key|secret|password|token)(?:\\?["'])?\s*[:=]\s*\\?["'][^"'])/i;
const hash = value => createHash('sha256').update(value).digest('hex');
const sameStat = (a, b) => a.dev === b.dev && a.ino === b.ino && a.size === b.size && a.mtimeNs === b.mtimeNs && a.ctimeNs === b.ctimeNs;
const safeName = name => !name.startsWith('.') && !excluded.has(name.toLowerCase()) && !/(?:^|[-_])(?:secrets?|credentials?|private[-_]?keys?)(?:[._-]|$)/i.test(name) && !/\.(?:pem|key|p12|pfx|keystore)$/i.test(name);

class ApiError extends Error {
 constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}
const fail = (status, code, message) => { throw new ApiError(status, code, message); };
function send(response, status, value) {
 response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
 response.end(JSON.stringify(value));
}
function integer(value, fallback, max) {
 if (value === null) return fallback;
 if (!/^[1-9]\d{0,8}$/.test(value) || Number(value) > max) fail(400, 'invalid_query', 'Choose a valid page or source range.');
 return Number(value);
}
function query(url, allowed) {
 for (const name of url.searchParams.keys()) if (!allowed.includes(name) || url.searchParams.getAll(name).length !== 1) fail(400, 'invalid_query', 'The request contains an unknown or repeated option.');
}
async function body(request) {
 if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers['content-type'] ?? '')) fail(400, 'invalid_body', 'Send a JSON request.');
 if (Number(request.headers['content-length'] ?? 0) > 16_384) { request.resume(); fail(413, 'body_limit', 'The request is too large.'); }
 const raw = await new Promise((resolve, reject) => {
  let chunks = [], bytes = 0, settled = false;
  const finish = (error, value) => { if (settled) return; settled = true; clearTimeout(timer); if (error) reject(error); else resolve(value); };
  const timer = setTimeout(() => { request.resume(); finish(new ApiError(408, 'body_timeout', 'The request body took too long.')); }, 5_000);
  request.on('data', chunk => { if (settled) return; bytes += chunk.length; if (bytes > 16_384) { chunks = []; finish(new ApiError(413, 'body_limit', 'The request is too large.')); } else chunks.push(chunk); });
  request.once('end', () => finish(null, Buffer.concat(chunks).toString('utf8')));
  request.once('error', () => finish(new ApiError(400, 'invalid_body', 'The request could not be read.')));
  request.once('aborted', () => finish(new ApiError(400, 'invalid_body', 'The request was interrupted.')));
 });
 try { return JSON.parse(raw); } catch { fail(400, 'invalid_body', 'The request is not valid JSON.'); }
}

export async function createProjectService({ root, origin, storageRoot, handleExtraApi }) {
 const base = new URL(origin);
 if (base.origin !== origin || base.protocol !== 'http:' || base.hostname !== '127.0.0.1' || !base.port) throw new Error('A fixed local HTTP origin is required.');
 const approvedRoot = await realpath(root);
 const approvedRootStat = await lstat(approvedRoot, { bigint: true });
 if (!approvedRootStat.isDirectory()) throw new Error('Choose a local project folder.');
 const projectId = hash(approvedRoot);
 const requestedData = resolve(storageRoot ?? (process.platform === 'darwin' ? join(homedir(), 'Library', 'Application Support', 'Vadhyar', 'prototype') : process.platform === 'win32' ? join(process.env.LOCALAPPDATA ?? homedir(), 'Vadhyar', 'prototype') : join(homedir(), '.local', 'share', 'Vadhyar', 'prototype')));
 await mkdir(requestedData, { recursive: true, mode: 0o700 });
 if ((await lstat(requestedData)).isSymbolicLink()) throw new Error('The local recorder directory must not be a symbolic link.');
 const appData = await realpath(requestedData);
 const directory = join(appData, projectId); await mkdir(directory, { recursive: true, mode: 0o700 });
 if ((await lstat(directory)).isSymbolicLink()) throw new Error('The project recorder directory must not use symbolic links.');
 await chmod(directory, 0o700);
 try { const file = await lstat(join(directory, 'files.sqlite')); if (!file.isFile() || file.isSymbolicLink()) throw new Error('The existing recorder is not a regular database.'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
 const databasePath = join(directory, 'files.sqlite'); const db = new DatabaseSync(databasePath); await chmod(databasePath, 0o600);
 db.exec(`PRAGMA journal_mode=DELETE; PRAGMA synchronous=FULL; PRAGMA busy_timeout=2000;
  CREATE TABLE IF NOT EXISTS files (id TEXT PRIMARY KEY, path TEXT NOT NULL UNIQUE COLLATE BINARY, size REAL NOT NULL, language TEXT NOT NULL, fingerprint TEXT NOT NULL, seen TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS baseline (id TEXT PRIMARY KEY, path TEXT NOT NULL, size REAL NOT NULL, language TEXT NOT NULL, fingerprint TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS tracked (fileId TEXT PRIMARY KEY, path TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS changes (seq INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT NOT NULL UNIQUE, fileId TEXT NOT NULL, path TEXT NOT NULL, kind TEXT NOT NULL, capturedAt TEXT NOT NULL, sourceHash TEXT, tracked INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS versions (seq INTEGER PRIMARY KEY AUTOINCREMENT, fileId TEXT NOT NULL, sourceHash TEXT NOT NULL, snapshot TEXT NOT NULL);
  CREATE INDEX IF NOT EXISTS versions_file ON versions(fileId, seq);
 `);
 const insert = db.prepare('INSERT INTO files VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET size=excluded.size, language=excluded.language, fingerprint=excluded.fingerprint, seen=excluded.seen');
 const find = db.prepare('SELECT * FROM files WHERE id = ?');
 const page = db.prepare('SELECT id, path, size, language FROM files WHERE path > ? COLLATE BINARY AND instr(lower(path), lower(?)) > 0 ORDER BY path COLLATE BINARY LIMIT ?');
 const getMeta = db.prepare('SELECT value FROM meta WHERE key = ?'); const setMeta = db.prepare('INSERT INTO meta VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value');
 if (getMeta.get('eventLedgerVersion')?.value !== '2') {
  const baselineTime = getMeta.get('baselineCapturedAt')?.value;
  if (baselineTime) db.prepare("DELETE FROM changes WHERE kind='added' AND capturedAt<=? AND fileId IN (SELECT id FROM baseline)").run(baselineTime);
  setMeta.run('eventLedgerVersion', '2');
 }
 const knownTracked = db.prepare('SELECT path FROM tracked WHERE fileId = ?');
 const currentCounts = db.prepare('SELECT COUNT(*) AS count, COALESCE(SUM(size),0) AS bytes FROM files').get();
 const revision = Number(getMeta.get('revision')?.value ?? 0); if (!Number.isSafeInteger(revision) || revision < 0) throw new Error('The recorder revision is invalid; its data was preserved.');
 const project = { id: projectId, name: basename(approvedRoot).slice(0, 200) || 'Project', status: 'indexing', indexedFiles: currentCounts.count, skippedFiles: 0, scanErrors: 0, totalBytes: currentCounts.bytes, revision, watching: false, watchError: null };
 const session = randomBytes(32).toString('hex');
 // Browser cookies are not scoped to a port.
 const cookieName = `vadhyar_project_session_${base.port}`, runs = new Map(), runContexts = new Map(); let closed = false, active = false, stopRun, runFinished = Promise.resolve();
 let openSources = 0, sourceStateReading = false, watcher, watchTimer, watchHealth, watchFinished = Promise.resolve(), processingChanges = false;
 const pending = new Set(); let generation = randomUUID(); const firstScan = getMeta.get('baselineCapturedAt') === undefined; let buildingBaseline = firstScan, scannedEntries = 0, scanTransaction = false;
 const fingerprint = stat => `${stat.dev}:${stat.ino}:${stat.size}:${stat.mtimeNs}:${stat.ctimeNs}`;
 function advanceRevision() { project.revision++; setMeta.run('revision', String(project.revision)); }
 function recordChange(file, kind, sourceHash = null) {
  db.prepare('INSERT INTO changes(id,fileId,path,kind,capturedAt,sourceHash,tracked) VALUES (?,?,?,?,?,?,?)').run(randomUUID(), file.id, file.path, kind, new Date().toISOString(), sourceHash, knownTracked.get(file.id) ? 1 : 0);
  db.prepare('DELETE FROM changes WHERE seq <= (SELECT COALESCE(MAX(seq),0)-10000 FROM changes)').run(); advanceRevision();
 }
 function persistSnapshot(snapshot) {
  const priorRevision = project.revision; db.exec('SAVEPOINT capture_context');
  try {
   db.prepare('INSERT OR IGNORE INTO tracked VALUES (?, ?)').run(snapshot.fileId, snapshot.path);
   const repaired = db.prepare("DELETE FROM versions WHERE fileId=? AND seq NOT IN (SELECT MAX(seq) FROM versions WHERE fileId=? GROUP BY sourceHash,json_extract(snapshot,'$.startLine'),json_extract(snapshot,'$.endLine'))").run(snapshot.fileId, snapshot.fileId);
   if (repaired.changes) advanceRevision();
   const stored = db.prepare('SELECT snapshot FROM versions WHERE fileId=? ORDER BY seq DESC LIMIT 1').get(snapshot.fileId); const previous = stored ? sourceSnapshotSchema.parse(JSON.parse(stored.snapshot)) : undefined;
   if (previous?.sourceHash !== snapshot.sourceHash || previous.startLine !== snapshot.startLine || previous.endLine !== snapshot.endLine) {
    db.prepare("DELETE FROM versions WHERE fileId=? AND sourceHash=? AND json_extract(snapshot,'$.startLine')=? AND json_extract(snapshot,'$.endLine')=?").run(snapshot.fileId, snapshot.sourceHash, snapshot.startLine, snapshot.endLine);
    db.prepare('INSERT INTO versions(fileId,sourceHash,snapshot) VALUES (?,?,?)').run(snapshot.fileId, snapshot.sourceHash, JSON.stringify(sourceSnapshotSchema.parse(snapshot)));
    db.prepare('DELETE FROM versions WHERE fileId=? AND seq NOT IN (SELECT seq FROM versions WHERE fileId=? ORDER BY seq DESC LIMIT 20)').run(snapshot.fileId, snapshot.fileId); advanceRevision();
   }
   db.exec('RELEASE capture_context');
  } catch (error) { try { db.exec('ROLLBACK TO capture_context; RELEASE capture_context'); } finally { project.revision = priorRevision; } throw error; }
  if (scanTransaction) db.exec('COMMIT; BEGIN');
 }
 function removeFile(file) {
  db.prepare('DELETE FROM files WHERE id=?').run(file.id); project.indexedFiles--; project.totalBytes -= file.size; recordChange(file, 'deleted');
 }
 function removeMissing(where, ...args) {
  const rows = db.prepare(`SELECT * FROM files WHERE ${where} LIMIT 100`);
  for (;;) { const batch = rows.all(...args); if (!batch.length) break; for (const file of batch) removeFile(file); }
 }
 async function indexFile(path, stat) {
  const file = { id: hash(project.id + '\0' + path), path, size: Number(stat.size), language: languages[extname(path).toLowerCase()] ?? 'Text' }; const previous = find.get(file.id); const current = fingerprint(stat);
  insert.run(file.id, path, file.size, file.language, current, generation);
  if (buildingBaseline) db.prepare('INSERT OR IGNORE INTO baseline VALUES (?,?,?,?,?)').run(file.id, path, file.size, file.language, current);
  if (previous?.fingerprint === current) return;
  if (!previous) project.indexedFiles++; project.totalBytes += file.size - (previous?.size ?? 0);
  let sourceHash = null;
  if (knownTracked.get(file.id)) {
   try { const latest = db.prepare('SELECT snapshot FROM versions WHERE fileId=? ORDER BY seq DESC LIMIT 1').get(file.id); const range = latest ? sourceSnapshotSchema.parse(JSON.parse(latest.snapshot)) : undefined; sourceHash = (await source(file, range?.startLine ?? 1, range ? Math.min(200, Math.max(1, range.endLine - range.startLine + 1)) : 160)).sourceHash; }
   catch { project.scanErrors++; if (project.status !== 'indexing') project.status = 'partial'; }
  }
  if (!buildingBaseline) recordChange(file, previous ? 'modified' : 'added', sourceHash);
 }
 function watchFailed(code) {
  project.watching = false; project.watchError = code; if (project.status !== 'indexing') project.status = 'partial'; watcher?.close(); clearInterval(watchHealth); clearTimeout(watchTimer);
 }
 function scheduleWatch() {
  if (closed || processingChanges || !project.watching) return;
  clearTimeout(watchTimer); watchTimer = setTimeout(() => { watchFinished = flushChanges().catch(() => watchFailed('watch_failed')); }, 120);
 }
 async function flushChanges() {
  processingChanges = true;
  try {
   await ready;
   if (closed || !project.watching) return;
   db.exec('BEGIN'); scanTransaction = true;
   const paths = [...pending]; pending.clear();
   if (paths.includes('') && !closed && project.watching) {
    generation = randomUUID(); const beforeErrors = project.scanErrors; project.skippedFiles = 0;
    await scan(approvedRoot);
    if (project.scanErrors === beforeErrors) removeMissing('seen != ?', generation);
   }
   for (const path of paths) {
    if (path === '') continue;
    if (closed || !project.watching) break;
    const absolute = join(approvedRoot, path);
    try {
     const stat = await lstat(absolute, { bigint: true });
     if (stat.isSymbolicLink() || await realpath(absolute) !== absolute) { removeMissing('path=? OR substr(path,1,?)=?', path, path.length + 1, path + '/'); continue; }
     if (stat.isDirectory()) await scan(absolute, path + '/', path.split('/').length);
     else if (stat.isFile() && stat.size <= BigInt(Number.MAX_SAFE_INTEGER)) await indexFile(path, stat);
    } catch (error) {
     if (error.code === 'ENOENT') removeMissing('path=? OR substr(path,1,?)=?', path, path.length + 1, path + '/');
     else { project.scanErrors++; project.status = 'partial'; }
    }
   }
  } finally { if (scanTransaction) { db.exec('COMMIT'); scanTransaction = false; } processingChanges = false; if (pending.size) scheduleWatch(); }
 }
 async function settleRecorder() {
  await ready;
  // shortcut: allow native save notifications to arrive; rapid intermediate states can still coalesce.
  await new Promise(resolve => setTimeout(resolve, 150)); await yieldTurn();
  for (let pass = 0; pass < 2; pass++) {
   clearTimeout(watchTimer); await watchFinished;
   if (!project.watching || !pending.size) break;
   watchFinished = flushChanges().catch(() => watchFailed('watch_failed')); await watchFinished; await yieldTurn();
  }
  return !closed && project.status === 'ready' && project.watching && project.watchError === null && !processingChanges && pending.size === 0;
 }
 try {
  watcher = watch(approvedRoot, { recursive: true }, (_kind, name) => {
   if (closed || !project.watching) return;
   if (name === null || String(name) === basename(approvedRoot)) { pending.add(''); scheduleWatch(); return; }
   const path = String(name).split(sep).join('/'); const parts = path.split('/');
   if (parts.some(part => !safeName(part) || part === '..' || part === '' || part.includes('\\') || part.includes('\0')) || binary.has(extname(path).toLowerCase()) || path.length > 8192) return;
   if (pending.size >= 10000) { watchFailed('watch_overflow'); return; }
   pending.add(path); scheduleWatch();
  });
  project.watching = true; watcher.on('error', () => watchFailed('watch_failed'));
  watchHealth = setInterval(() => { void lstat(approvedRoot, { bigint: true }).then(stat => { if (!stat.isDirectory() || stat.isSymbolicLink() || stat.dev !== approvedRootStat.dev || stat.ino !== approvedRootStat.ino) watchFailed('watch_failed'); }).catch(() => watchFailed('watch_failed')); }, 5000); watchHealth.unref();
 } catch { watchFailed('watch_unavailable'); }

 async function scan(folder, prefix = '', depth = 0) {
  if (closed) return;
  // shortcut: keep directory handles below 65; use iterative discovery for deeper trees.
  if (depth > 64) { project.scanErrors++; return; }
  try {
   if ((await lstat(folder)).isSymbolicLink() || await realpath(folder) !== folder) { project.skippedFiles++; return; }
   for await (const entry of await opendir(folder)) {
    if (closed) return;
    const path = prefix + entry.name;
    if (!safeName(entry.name) || entry.isSymbolicLink() || path.length > 8192 || path.includes('\\') || path.includes('\0')) { project.skippedFiles++; continue; }
    if (entry.isDirectory()) await scan(join(folder, entry.name), path + '/', depth + 1);
    else if (entry.isFile() && !binary.has(extname(entry.name).toLowerCase())) {
     try {
      const stat = await lstat(join(folder, entry.name), { bigint: true });
      if (!stat.isFile() || stat.isSymbolicLink() || stat.size > BigInt(Number.MAX_SAFE_INTEGER) || await realpath(join(folder, entry.name)) !== join(folder, entry.name)) { project.skippedFiles++; continue; }
      await indexFile(path, stat);
     } catch { project.scanErrors++; }
    } else project.skippedFiles++;
    if (++scannedEntries % 256 === 0) { if (scanTransaction) db.exec('COMMIT; BEGIN'); await yieldTurn(); }
   }
  } catch { project.scanErrors++; }
 }
 const ready = (async () => {
  db.exec('BEGIN'); scanTransaction = true;
  try { await scan(approvedRoot); if (!closed && project.scanErrors === 0) removeMissing('seen != ?', generation); if (!closed && firstScan) { setMeta.run('baselineCapturedAt', new Date().toISOString()); advanceRevision(); } } finally { db.exec('COMMIT'); scanTransaction = false; buildingBaseline = false; }
  project.status = project.scanErrors || project.watchError ? project.indexedFiles ? 'partial' : 'error' : 'ready';
 })();

 async function safeFile(path) {
  const parts = path.split('/');
  if (parts.some(part => !safeName(part) || part === '..' || part.includes('\\') || part.includes('\0')) || binary.has(extname(path).toLowerCase())) fail(422, 'excluded_source', 'This source is excluded from project access.');
  let absolute = approvedRoot;
  for (const part of parts) { absolute = join(absolute, part); if ((await lstat(absolute)).isSymbolicLink()) fail(422, 'excluded_source', 'Symbolic links are excluded from source access.'); }
  if (await realpath(absolute) !== absolute || !absolute.startsWith(approvedRoot + sep)) fail(422, 'excluded_source', 'Source must remain inside the approved project.');
  const handle = await open(absolute, constants.O_RDONLY | constants.O_NOFOLLOW);
  const stat = await handle.stat({ bigint: true });
  if (!stat.isFile()) { await handle.close(); fail(422, 'excluded_source', 'Only regular source files can be read.'); }
  return { handle, stat, absolute };
 }
 async function source(file, startLine = 1, lines = 160, persist = true) {
  if (openSources >= 2) fail(429, 'source_busy', 'Two source reads are already in progress. Try again when they finish.');
  openSources++;
  let handle, timer;
  try {
   const opened = await safeFile(file.path); handle = opened.handle;
   const digest = createHash('sha256'), decoder = new TextDecoder('utf-8', { fatal: true });
   const stream = handle.createReadStream({ autoClose: false, highWaterMark: 64_000 });
   timer = setTimeout(() => stream.destroy(new ApiError(408, 'source_timeout', 'Source hashing exceeded 30 seconds. Select a smaller source file.')), 30_000);
   let line = 1, captured = '', tail = '', lastCharacter = '', characters = 0, charsLimited = false, capturedEndLine = 0;
   const consume = text => {
    if (text.includes('\0') || /[\x01-\x08\x0b\x0c\x0e-\x1f]/.test(text)) fail(422, 'excluded_source', 'Binary content is excluded from source access.'); // eslint-disable-line no-control-regex -- binary detection excludes nontext control bytes
    if (privateText.test(tail + text)) fail(422, 'private_source', 'Possible private values were detected; this source was withheld.');
    tail = (tail + text).slice(-8192);
    for (const character of text) {
     if (line >= startLine && line < startLine + lines) {
      if (characters + character.length <= 40_000) { captured += character; characters += character.length; capturedEndLine = line; } else charsLimited = true;
     }
     if (character === '\n') line++;
     lastCharacter = character;
    }
   };
   for await (const chunk of stream) { digest.update(chunk); consume(decoder.decode(chunk, { stream: true })); }
   consume(decoder.decode());
   const after = await handle.stat({ bigint: true }); const pathAfter = await lstat(opened.absolute, { bigint: true });
   if (!sameStat(opened.stat, after) || !sameStat(after, pathAfter) || await realpath(opened.absolute) !== opened.absolute) fail(409, 'source_changed', 'The source changed while it was being read. Refresh it.');
   const totalLines = after.size === 0n ? 0 : line - (lastCharacter === '\n' ? 1 : 0);
   if (startLine > Math.max(1, totalLines)) fail(416, 'source_range', 'The selected range starts beyond this file. Choose an earlier starting line.');
   if (captured.endsWith('\n')) captured = captured.slice(0, -1);
   const endLine = capturedEndLine || Math.min(totalLines, startLine - 1);
   const snapshot = { projectId: project.id, fileId: file.id, path: file.path, language: file.language, startLine, endLine, sourceHash: digest.digest('hex'), text: captured, truncated: startLine > 1 || totalLines >= startLine + lines || charsLimited, capturedAt: new Date().toISOString(), fileBytes: Number(after.size) };
   if (!closed && persist) persistSnapshot(snapshot); return snapshot;
  } catch (error) {
   if (error instanceof ApiError) throw error;
   if (error instanceof TypeError) fail(422, 'excluded_source', 'This file is not valid readable UTF-8 source.');
   fail(422, 'source_unavailable', 'The selected source is unavailable or excluded. Refresh the project selection.');
  } finally { clearTimeout(timer); await handle?.close().catch(() => {}); openSources--; }
 }
 async function scripts() {
  let opened;
  try {
   opened = await safeFile('package.json');
   if (opened.stat.size > 100_000n) fail(422, 'invalid_manifest', 'The project manifest exceeds the supported 100 KB limit.');
   const text = await opened.handle.readFile('utf8');
   if (!sameStat(opened.stat, await opened.handle.stat({ bigint: true })) || !sameStat(opened.stat, await lstat(opened.absolute, { bigint: true }))) fail(409, 'manifest_changed', 'The project command definition changed. Refresh the commands.');
   if (privateText.test(text)) fail(422, 'private_manifest', 'Possible private values were detected in the project manifest.');
   const result = manifestSchema.safeParse(JSON.parse(text));
   if (!result.success) fail(422, 'invalid_manifest', 'The project manifest has no valid script map.');
   const manifestHash = hash(text);
   return { scripts: Object.entries(result.data.scripts).filter(([id, command]) => /^[A-Za-z0-9:_-]{1,80}$/.test(id) && !/^(?:pre|post)/i.test(id) && /(?:test|check|lint|typecheck)/i.test(id) && command.length > 0 && command.length <= 4000).slice(0, 100).map(([id, command]) => ({ id, command, manifestHash })) };
  } catch (error) {
   if (error.code === 'ENOENT') return { scripts: [] };
   if (error instanceof ApiError) throw error;
   fail(422, 'invalid_manifest', 'Project commands could not be read. Use manual verification.');
  } finally { await opened?.handle.close().catch(() => {}); }
 }
 function cleanOutput(raw) {
  if (privateText.test(raw)) return '[Output withheld: possible private values.]';
  let text = raw.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, ''); // eslint-disable-line no-control-regex -- terminal escape and nontext control removal
  for (const path of [approvedRoot, directory, process.env.HOME].filter(Boolean)) text = text.split(path).join('[local path]');
  return text.slice(-24_000);
 }
 async function sourceState(fileId) {
  const file = find.get(fileId), tracked = knownTracked.get(fileId);
  if (!file && !tracked) fail(404, 'unknown_file', 'The requested file is not known to this project.');
  if (sourceStateReading) fail(503, 'source_state_busy', 'A current-source read is already in progress. Try again.');
  sourceStateReading = true;
  try {
   try {
    const current = await source(file ?? { id: fileId, path: tracked.path, language: 'Text' }, 1, 1, false);
    return { fileId, sourceHash: current.sourceHash, status: 'available' };
   } catch (error) {
    if (error instanceof ApiError && error.status === 422) return { fileId, sourceHash: null, status: 'unavailable' };
    fail(503, 'source_state_unknown', 'Current source identity could not be established. Try again.');
   }
  } finally { sourceStateReading = false; }
 }
 async function runFreshness(run) {
  if (run.status === 'stale') return 'stale';
  if (run.status !== 'passed' && run.status !== 'failed') return 'unknown';
  const context = runContexts.get(run.id); if (!context?.covered) return 'unknown';
  try {
   const covered = await settleRecorder();
   if (project.revision !== context.revision) return 'stale';
   const file = find.get(run.fileId); if (!file) return 'unknown';
   const current = await source(file, 1, 1, false), available = await scripts();
   if (current.sourceHash !== run.sourceHash || !available.scripts.some(script => script.id === run.scriptId && script.manifestHash === run.manifestHash) || project.revision !== context.revision) return 'stale';
   return covered && !closed && project.status === 'ready' && project.watching && project.watchError === null && !pending.size && !processingChanges ? 'current' : 'unknown';
  } catch { return 'unknown'; }
 }
 async function startRun(consent) {
  if (active) fail(409, 'check_busy', 'A project check is already in progress.');
  active = true;
  try {
   const contextCovered = await settleRecorder(); const contextRevision = project.revision;
   const file = find.get(consent.fileId); if (!file) fail(404, 'unknown_file', 'Choose a file from the current project.');
   const snapshot = await source(file, 1, 160, false); const available = await scripts(); const script = available.scripts.find(script => script.id === consent.scriptId);
   if (!script || script.manifestHash !== consent.manifestHash || snapshot.sourceHash !== consent.sourceHash) fail(409, 'stale_consent', 'The selected source or command changed. Refresh them and approve the current command.');
   while (runs.size >= 20) { const oldest = runs.keys().next().value; runs.delete(oldest); runContexts.delete(oldest); }
   const run = { id: randomUUID(), projectId: project.id, fileId: file.id, scriptId: script.id, sourceHash: consent.sourceHash, manifestHash: consent.manifestHash, status: 'running', output: '', exitCode: null, startedAt: new Date().toISOString(), finishedAt: null };
   runs.set(run.id, run); runContexts.set(run.id, { covered: contextCovered, revision: contextRevision });
   const environment = Object.fromEntries(['PATH', 'HOME', 'TMPDIR', 'TEMP', 'TMP', 'SystemRoot'].flatMap(name => process.env[name] ? [[name, process.env[name]]] : []));
   const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['--ignore-scripts', 'run', script.id], { cwd: approvedRoot, shell: false, env: { ...environment, CI: 'true', npm_config_ignore_scripts: 'true' }, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] });
   let rawOutput = '', timedOut = false, cancelled = false, finished = false, withheld = false;
   const record = chunk => { const text = rawOutput + chunk.toString('utf8'); withheld ||= privateText.test(text); rawOutput = text.slice(-24_000); run.output = withheld ? '[Output withheld: possible private values.]' : cleanOutput(rawOutput); };
   child.stdout.on('data', record); child.stderr.on('data', record);
   const kill = () => { try { if (process.platform !== 'win32' && child.pid) process.kill(-child.pid, 'SIGKILL'); else child.kill('SIGKILL'); } catch { /* process already exited */ } };
   stopRun = () => { cancelled = true; kill(); };
   const timer = setTimeout(() => { timedOut = true; kill(); }, 30_000);
   runFinished = new Promise(resolve => {
    const finish = async (status, exitCode) => {
     if (finished) return; finished = true; clearTimeout(timer);
     let finalStatus = status;
     if (status === 'passed' || status === 'failed') {
      try { const contextStillCovered = await settleRecorder(); const current = await source(file, 1, 160, false); const currentScripts = await scripts(); if (!contextCovered || !contextStillCovered || project.status !== 'ready' || !project.watching || pending.size || processingChanges || project.revision !== contextRevision || current.sourceHash !== consent.sourceHash || !currentScripts.scripts.some(script => script.id === consent.scriptId && script.manifestHash === consent.manifestHash)) finalStatus = 'stale'; }
      catch { finalStatus = 'stale'; }
     }
     run.status = finalStatus; run.exitCode = exitCode; run.finishedAt = new Date().toISOString(); active = false; stopRun = undefined; resolve();
    };
    child.once('error', () => { run.output = 'The selected project check could not start.'; void finish('error', null); });
    child.once('close', code => { void finish(timedOut ? 'timeout' : cancelled || code === null ? 'error' : code === 0 ? 'passed' : 'failed', code); });
   });
   return { ...run, freshness: 'unknown' };
  } catch (error) { active = false; throw error; }
 }
 async function handle(request, response) {
  const route = (request.url ?? '').split('?')[0]; if (!route.startsWith('/api/')) return false;
  try {
   if (closed) fail(503, 'service_closed', 'The local project service has stopped.');
   if (request.headers.host !== base.host) fail(403, 'invalid_host', 'This API requires the approved local host.');
   const requestOrigin = request.headers.origin, site = request.headers['sec-fetch-site'];
   if (requestOrigin !== undefined && requestOrigin !== origin || site !== undefined && site !== 'same-origin' || requestOrigin === undefined && site === undefined) fail(403, 'invalid_origin', 'This API requires a same-origin browser request.');
   const url = new URL(request.url, origin); const method = request.method;
   if (route === '/api/session') {
    if (method !== 'POST') fail(405, 'invalid_method', 'Use POST to open a local session.');
    if (requestOrigin !== origin) fail(403, 'invalid_origin', 'Opening a session requires the approved browser origin.');
    query(url, []); if (!z.object({}).strict().safeParse(await body(request)).success) fail(400, 'invalid_body', 'The session request must be an empty JSON object.');
    response.setHeader('Set-Cookie', `${cookieName}=${session}; HttpOnly; SameSite=Strict; Path=/api`); send(response, 200, { ok: true }); return true;
   }
   const cookie = (request.headers.cookie ?? '').split(/;\s*/).find(value => value.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1) ?? '';
   if (!/^[a-f0-9]{64}$/.test(cookie) || !timingSafeEqual(Buffer.from(cookie), Buffer.from(session))) fail(401, 'session_required', 'Open a local project session before reading source.');
   if (method !== 'GET' && requestOrigin !== origin) fail(403, 'invalid_origin', 'This operation requires the approved browser origin.');
   const requestedProject = /^\/api\/projects\/([^/]+)\//.exec(route);
   if (requestedProject && requestedProject[1] !== project.id) fail(404, 'unknown_project', 'The requested project is not open in this session.');
   if (await handleExtraApi?.(request, response)) return true;
   if (route === '/api/projects/current') { if (method !== 'GET') fail(405, 'invalid_method', 'Use GET to read the project.'); query(url, []); send(response, 200, { ...project }); return true; }
   const match = /^\/api\/projects\/([a-f0-9]{64})\/(files|source|source-state|scripts|runs|changes|versions)(?:\/([a-f0-9-]{36}))?$/.exec(route);
   if (!match || match[1] !== project.id) fail(404, 'unknown_project', 'The requested project is not open in this session.');
   const [, , kind, runId] = match;
   if (kind === 'runs' && !runId && method === 'POST') {
    if (requestOrigin !== origin) fail(403, 'invalid_origin', 'Running a check requires the approved browser origin.');
    query(url, []); const parsed = consentSchema.safeParse(await body(request)); if (!parsed.success) fail(400, 'invalid_consent', 'Approve an existing command with its current source and manifest identity.');
    send(response, 202, await startRun(parsed.data)); return true;
   }
   if (method !== 'GET') fail(405, 'invalid_method', 'This operation uses GET.');
   if (kind === 'files' && !runId) {
    query(url, ['q', 'cursor', 'limit']); const search = url.searchParams.get('q') ?? '', cursor = url.searchParams.get('cursor') ?? '';
    if (search.length > 200 || cursor.length > 8192 || search.includes('\0') || cursor.includes('\0')) fail(400, 'invalid_query', 'The file search or cursor is too long or invalid.');
    const limit = integer(url.searchParams.get('limit'), 50, 100); const rows = page.all(cursor, search, limit + 1); const files = rows.slice(0, limit);
    send(response, 200, { files, nextCursor: rows.length > limit ? files.at(-1).path : null, project: { ...project } });
   } else if (kind === 'source' && !runId) {
    query(url, ['fileId', 'start', 'lines']); const id = identity.safeParse(url.searchParams.get('fileId')); if (!id.success) fail(400, 'invalid_file', 'Choose a file from the current project.');
    const file = find.get(id.data); if (!file) fail(404, 'unknown_file', 'The requested file is not in this project index.');
    send(response, 200, await source(file, integer(url.searchParams.get('start'), 1, 999_999_999), integer(url.searchParams.get('lines'), 160, 200)));
   } else if (kind === 'source-state' && !runId) {
    query(url, ['fileId']); const id = identity.safeParse(url.searchParams.get('fileId')); if (!id.success) fail(400, 'invalid_file', 'Choose a known project file.');
    send(response, 200, await sourceState(id.data));
   } else if (kind === 'scripts' && !runId) { query(url, []); send(response, 200, await scripts()); }
   else if (kind === 'changes' && !runId) {
    query(url, ['cursor', 'limit']); const cursor = url.searchParams.get('cursor'); const limit = integer(url.searchParams.get('limit'), 50, 100); let seq = Number.MAX_SAFE_INTEGER;
    if (cursor !== null) { const valid = z.uuid().safeParse(cursor); const known = valid.success ? db.prepare('SELECT seq FROM changes WHERE id=?').get(valid.data) : undefined; if (!known) fail(400, 'cursor_expired', 'The change cursor is unavailable. Reload the latest changes.'); seq = known.seq; }
    const rows = db.prepare('SELECT * FROM changes WHERE seq < ? ORDER BY seq DESC LIMIT ?').all(seq, limit + 1);
    const changes = rows.slice(0, limit).map(({ id, fileId, path, kind, capturedAt, sourceHash, tracked }) => ({ id, fileId, path, kind, capturedAt, sourceHash, tracked: Boolean(tracked) }));
    send(response, 200, { changes, nextCursor: rows.length > limit ? changes.at(-1).id : null, revision: project.revision });
   } else if (kind === 'versions' && !runId) {
    query(url, ['fileId', 'limit']); const id = identity.safeParse(url.searchParams.get('fileId')); if (!id.success) fail(400, 'invalid_file', 'Choose a known project file.');
    if (!find.get(id.data) && !knownTracked.get(id.data)) fail(404, 'unknown_file', 'The requested file is not in this project recorder.');
    const versions = db.prepare('SELECT snapshot FROM versions WHERE fileId=? ORDER BY seq DESC LIMIT ?').all(id.data, integer(url.searchParams.get('limit'), 20, 20)).map(row => sourceSnapshotSchema.parse(JSON.parse(row.snapshot)));
    send(response, 200, { versions });
   }
   else if (kind === 'runs' && runId) { query(url, []); const run = runs.get(runId); if (!run) fail(404, 'unknown_run', 'The requested check is no longer in this local session.'); send(response, 200, { ...run, freshness: await runFreshness(run) }); }
   else fail(404, 'unknown_operation', 'This project operation was not found.');
  } catch (error) {
   const safe = error instanceof ApiError ? error : new ApiError(500, 'operation_failed', 'The local project operation failed. Existing learning records were preserved.');
   send(response, safe.status, { error: { code: safe.code, message: safe.message } });
  }
  return true;
 }
 async function close() {
  if (closed) return; closed = true; watcher?.close(); clearTimeout(watchTimer); clearInterval(watchHealth); stopRun?.(); await Promise.all([ready, runFinished, watchFinished]);
  while (openSources) await new Promise(resolve => setTimeout(resolve, 10));
  db.close();
 }
 async function readSource(fileId, start = 1, lines = 160) {
  if (closed) fail(503, 'service_closed', 'The local project service has stopped.');
  if (!identity.safeParse(fileId).success || !Number.isInteger(start) || start < 1 || start > 999999999 || !Number.isInteger(lines) || lines < 1 || lines > 200) fail(400, 'invalid_source', 'Choose a known file and a valid source range.');
  const file = find.get(fileId); if (!file) fail(404, 'unknown_file', 'The requested file is not in this project index.');
  return source(file, start, lines);
 }
 return { handle, ready, close, readSource };
}
