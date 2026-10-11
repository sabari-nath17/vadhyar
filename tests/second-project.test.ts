import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { expect, it } from 'vitest';
import { captureProject, newIntent } from '../src/project/model.js';
import { projectScripts, runProjectScript } from '../src/project/checks.js';
import { projectPreview } from '../src/project/coach.js';

it('uses selected JavaScript source and an approved existing check in a non-NovaDesk project', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'vadhyar-seat-check-test-'));
  const root = join(folder, 'SeatCheck');
  try {
    await cp('fixtures/seat-check', root, { recursive: true, errorOnExist: true, force: false });
    const source = join(root, 'src/reservation.js');
    const seed = await readFile(source, 'utf8');
    const before = await captureProject(root);
    const intent = { ...newIntent({ title: 'Available seats', request: 'Permit reservations only with capacity', expected: 'Two seats allow; zero or negative seats deny', origin: 'manual' }), confirmedAt: new Date().toISOString() };
    const preview = projectPreview('explain', 'test-model', before, [intent], intent.id, ['src/reservation.js']);
    expect(preview.text).toContain('src/reservation.js');
    expect(preview.text).not.toContain('reservation.test.js');
    const manifest = await projectScripts(root);
    expect(manifest.scripts).toEqual([['test', 'node --test tests/reservation.test.js']]);
    const failed = await runProjectScript(root, 'test', manifest.hash, before.id, intent.revision, new AbortController().signal);
    expect(failed.kind).toBe('completed');
    expect(failed.exitCode).toBe(1);
    expect(failed).not.toHaveProperty('requirementPassed');
    await writeFile(source, seed.replace('remainingSeats >= 0', 'remainingSeats > 0'));
    const after = await captureProject(root);
    expect(after.id).not.toBe(before.id);
    const passed = await runProjectScript(root, 'test', manifest.hash, after.id, intent.revision, new AbortController().signal);
    expect(passed.kind).toBe('completed');
    expect(passed.exitCode).toBe(0);
    expect(passed.snapshot).toBe(after.id);
    expect(failed.snapshot).not.toBe(after.id);
    expect(passed.output).toMatch(/pass 3/);
    expect(await readFile('fixtures/seat-check/src/reservation.js', 'utf8')).toBe(seed);
  } finally { await rm(folder, { recursive: true, force: true }); }
}, 30_000);
