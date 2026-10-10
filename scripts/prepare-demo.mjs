import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';
import { URL } from 'node:url';

const destination = process.argv[2];
if (process.argv.length !== 3 || !destination || !isAbsolute(destination)) throw new Error('Usage: npm run demo:prepare -- /absolute/new/NovaDesk-folder');
await mkdir(destination, { mode: 0o700 });
await mkdir(join(destination, 'src'));
for (const file of ['src/approval.ts', 'vadhyar-requirement.md']) {
  await writeFile(join(destination, file), await readFile(new URL(`../novadesk/${file}`, import.meta.url)), { flag: 'wx', mode: 0o600 });
}
process.stdout.write(`Prepared a fresh disclosed NovaDesk seed: ${destination}\n`);
process.stdout.write('Open this folder in VS Code. Existing folders are never reset or overwritten.\n');
