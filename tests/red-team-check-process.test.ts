import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { projectScripts, runProjectScript } from '../src/project/checks.js';

it('executes the selected script without implicit npm pre/post hooks', async () => {
  const root = await mkdtemp(join(tmpdir(), 'vadhyar-red-team-lifecycle-'));
  try {
    const scripts: Record<string, string> = {};
    for (const name of ['pretest', 'test', 'posttest']) {
      scripts[name] = `node ${name}.mjs`;
      await writeFile(join(root, `${name}.mjs`), `import { writeFileSync } from 'node:fs'; writeFileSync('${name}.txt', 'fixture executed');`);
    }
    await writeFile(join(root, 'package.json'), JSON.stringify({ scripts }));
    const manifest = await projectScripts(root);
    const result = await runProjectScript(root, 'test', manifest.hash, 'snapshot', undefined, new AbortController().signal);
    expect(result.kind).toBe('completed'); expect(result.exitCode).toBe(0);
    expect(await readFile(join(root, 'test.txt'), 'utf8')).toBe('fixture executed');
    await expect(readFile(join(root, 'pretest.txt'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(readFile(join(root, 'posttest.txt'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
  } finally { await rm(root, { recursive: true, force: true }); }
}, 15_000);

it.each([
  ['one large chunk', 'process.stdout.write(`password="${value}"${padding}`);'],
  ['a field split across output chunks', 'process.stdout.write("pass"); setTimeout(() => { process.stderr.write(`word="${value}"`); setTimeout(() => process.stderr.write(padding), 20); }, 20);'],
])('withholds private output from %s before its identifying prefix leaves the retained tail', async (_name, write) => {
  const root = await mkdtemp(join(tmpdir(), 'vadhyar-red-team-output-'));
  try {
    await writeFile(join(root, 'package.json'), JSON.stringify({ scripts: { test: 'node check.mjs' } }));
    await writeFile(join(root, 'check.mjs'), `const value = 'fixture-only-not-a-credential'; const padding = 'x'.repeat(12000 - value.length - 1); ${write}`);
    const manifest = await projectScripts(root);
    const result = await runProjectScript(root, 'test', manifest.hash, 'snapshot', 'intent', new AbortController().signal);
    expect(result).toMatchObject({ kind: 'completed', exitCode: 0, snapshot: 'snapshot', intentRevision: 'intent', packageHash: manifest.hash });
    expect(result.output).toBe('Possible private output was withheld.');
    expect(result.output).not.toContain('fixture-only-not-a-credential');
  } finally { await rm(root, { recursive: true, force: true }); }
}, 15_000);
