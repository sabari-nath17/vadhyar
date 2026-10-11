import { randomUUID } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { lstat, mkdir, open, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

async function main() {
const root = resolve(process.argv[2] ?? '.');
process.stdin.setEncoding('utf8');
let input = ''; for await (const chunk of process.stdin) { input += chunk; if (input.length > 13_000) throw new Error('Capture input is too large.'); }
const raw = JSON.parse(input);
const event = { id: raw.id ?? randomUUID(), title: raw.title, request: raw.request, expected: raw.expected ?? '' };
if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(event.id) || typeof event.title !== 'string' || !event.title.trim() || event.title.length > 120 || typeof event.request !== 'string' || !event.request.trim() || event.request.length > 6000 || typeof event.expected !== 'string' || event.expected.length > 6000) throw new Error('Invalid capture event.');
if (/(\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}|-----BEGIN [A-Z ]*PRIVATE KEY|(?:api[_-]?key|secret|password|token)\s*[:=]\s*["'][^"']+["'])/i.test(event.title + event.request + event.expected)) throw new Error('Possible private content; capture rejected.');
const folder = join(root, '.vadhyar'); await mkdir(folder, { recursive: true, mode: 0o700 });
if ((await lstat(folder)).isSymbolicLink()) throw new Error('Capture folder cannot be a symbolic link.');
const lock = join(folder, 'capture.lock'), path = join(folder, 'intent-events.json'), pending = join(folder, `capture-${event.id}.tmp`);
const handle = await open(lock, 'wx', 0o600);
try {
 let events = [];
 try { const info = await lstat(path); if (info.isSymbolicLink() || !info.isFile() || info.size > 100_000) throw new Error('Unsupported capture event file.'); events = JSON.parse(await readFile(path, 'utf8')); }
 catch (error) { if (error.code !== 'ENOENT') throw error; }
 if (!Array.isArray(events)) throw new Error('Invalid event history.');
 if (events.some(item => item.id === event.id)) { process.stdout.write('Capture already recorded.\n'); }
 else {
   if (events.length >= 50) throw new Error('Capture event history is full; existing data was preserved.');
   events.push(event); const text = JSON.stringify(events); if (Buffer.byteLength(text, 'utf8') > 100_000) throw new Error('Capture event history exceeds 100KB.');
   await writeFile(pending, text, { flag: 'wx', mode: 0o600 }); await rename(pending, path); process.stdout.write('Unconfirmed coding intention recorded locally.\n');
 }
} finally { await handle.close(); await rm(pending, { force: true }); await rm(lock, { force: true }); }

}
void main().catch(() => { process.stderr.write("Capture failed. Check the event input, destination or capture lock; existing history was preserved.\n"); process.exitCode = 1; });
