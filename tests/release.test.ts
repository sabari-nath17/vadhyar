import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { expect, it } from 'vitest';

const run = promisify(execFile);
it('prepares a new demo with the exact disclosed seed and refuses to overwrite a saved attempt', async () => {
  const base = await mkdtemp(join(tmpdir(), 'vadhyar-release-demo-'));
  const destination = join(base, 'NovaDesk');
  try {
    await run(process.execPath, ['scripts/prepare-demo.mjs', destination]);
    expect(await readFile(join(destination, 'src/approval.ts'))).toEqual(await readFile('novadesk/src/approval.ts'));
    expect(await readFile(join(destination, 'vadhyar-requirement.md'))).toEqual(await readFile('novadesk/vadhyar-requirement.md'));
    await writeFile(join(destination, 'src/approval.ts'), 'A saved learner attempt');
    await expect(run(process.execPath, ['scripts/prepare-demo.mjs', destination])).rejects.toThrow();
    expect(await readFile(join(destination, 'src/approval.ts'), 'utf8')).toBe('A saved learner attempt');
    await expect(run(process.execPath, ['scripts/prepare-demo.mjs', 'relative-folder'])).rejects.toThrow();
  } finally { await rm(base, { recursive: true, force: true }); }
});
