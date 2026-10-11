import { EventEmitter } from 'node:events';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const processMock = vi.hoisted(() => ({ spawn: vi.fn() }));
vi.mock('node:child_process', () => ({ spawn: processMock.spawn }));
import { projectScripts, runProjectScript } from '../src/project/checks.js';
let folder: string;
beforeEach(async () => {
  processMock.spawn.mockReset();
  folder = await mkdtemp(join(tmpdir(), 'vadhyar-red-team-check-'));
  await writeFile(join(folder, 'package.json'), JSON.stringify({ scripts: { test: 'node check.mjs' } }));
});
afterEach(async () => { await rm(folder, { recursive: true, force: true }); });

it.each([0, 1, null])('classifies an exit code of %s without inventing a completed result', async code => {
  processMock.spawn.mockImplementation(() => {
    const child = Object.assign(new EventEmitter(), { stdout: new EventEmitter(), stderr: new EventEmitter(), kill: vi.fn() });
    queueMicrotask(() => child.emit('close', code, code === null ? 'SIGTERM' : null));
    return child;
  });
  const manifest = await projectScripts(folder);
  const result = await runProjectScript(folder, 'test', manifest.hash, 'snapshot', undefined, new AbortController().signal);
  expect(result.kind).toBe(code === null ? 'error' : 'completed');
  expect(result.exitCode).toBe(code);
});

it('does not spawn a command when cancellation already happened', async () => {
  processMock.spawn.mockImplementation(() => {
    const child = Object.assign(new EventEmitter(), { stdout: new EventEmitter(), stderr: new EventEmitter(), kill: () => queueMicrotask(() => child.emit('close', null, 'SIGKILL')) });
    return child;
  });
  const manifest = await projectScripts(folder), cancelled = new AbortController(); cancelled.abort();
  const result = await runProjectScript(folder, 'test', manifest.hash, 'snapshot', undefined, cancelled.signal);
  expect(processMock.spawn).not.toHaveBeenCalled();
  expect(result.kind).toBe('error');
  expect(result.exitCode).toBeNull();
});

it('rejects private-looking manifest values before displaying or running a command', async () => {
  await writeFile(join(folder, 'package.json'), JSON.stringify({ scripts: { test: 'node check.mjs' }, token: 'fixture-only-not-a-credential' }));
  await expect(projectScripts(folder)).rejects.toThrow(/private value/i);
  expect(processMock.spawn).not.toHaveBeenCalled();
});
