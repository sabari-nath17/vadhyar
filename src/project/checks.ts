import { spawn } from 'node:child_process';
import { readFile, lstat } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';
import { hash } from '../extension/source.js';
import type { CheckResult } from './shared.js';

export async function projectScripts(root: string) {
 const path = join(root, 'package.json'); const info = await lstat(path);
 if (info.isSymbolicLink() || !info.isFile() || info.size > 100_000) throw new Error('Unsupported package manifest.');
 const text = await readFile(path, 'utf8'); const data = z.object({ scripts: z.record(z.string(), z.string().max(5000)) }).parse(JSON.parse(text));
 const scripts = Object.entries(data.scripts).filter(([name]) => /^[A-Za-z0-9:_-]{1,80}$/.test(name) && /(?:test|check|lint|typecheck)/i.test(name));
 return { scripts, hash: hash(text) };
}
export async function runProjectScript(root: string, script: string, packageHash: string, snapshot: string, intentRevision: string | undefined, signal: AbortSignal): Promise<CheckResult> {
 const manifest = await projectScripts(root);
 if (manifest.hash !== packageHash || !manifest.scripts.some(([name]) => name === script)) throw new Error('Selected check definition changed; choose it again.');
 const started = Date.now();
 return new Promise(resolve => {
   const environment = Object.fromEntries(['PATH', 'HOME', 'TMPDIR', 'TEMP', 'TMP', 'SystemRoot'].flatMap(name => process.env[name] ? [[name, process.env[name]!]] : []));
   const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', script], { cwd: root, shell: false, env: { ...environment, CI: 'true' }, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] });
   let output = '', timedOut = false;
   const record = (chunk: Buffer) => { output = (output + chunk.toString('utf8')).slice(-12_000); };
   child.stdout.on('data', record); child.stderr.on('data', record);
   const stop = () => { try { if (process.platform !== 'win32' && child.pid) process.kill(-child.pid, 'SIGKILL'); else child.kill('SIGKILL'); } catch { /* process already exited */ } };
   const timer = setTimeout(() => { timedOut = true; stop(); }, 30_000);
   const finish = (kind: CheckResult['kind'], exitCode: number | null) => { clearTimeout(timer); signal.removeEventListener('abort', stop); resolve({ snapshot, intentRevision, packageHash, script, kind, exitCode, latencyMs: Date.now() - started, output }); };
   signal.addEventListener('abort', stop, { once: true }); if (signal.aborted) stop();
   child.once('error', () => { output = 'The selected check could not start.'; finish('error', null); });
   child.once('close', code => finish(timedOut ? 'timeout' : signal.aborted ? 'error' : 'completed', code));
 });
}
