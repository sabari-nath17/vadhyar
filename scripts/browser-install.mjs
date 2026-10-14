#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const allowed = /^(?:install\.mjs|start\.mjs|package(?:-lock)?\.json|README\.md|LICENSE|BUILD_INFO\.json|THIRD_PARTY_NOTICES\.txt|runtime\/serve\.mjs|runtime\/dist\/(?:index\.html|app\.(?:js|css)|THIRD_PARTY_NOTICES\.txt|assets\/[a-z0-9][a-z0-9_.-]*\.(?:png|woff2)|assets\/[a-zA-Z0-9][a-zA-Z0-9_.-]*-OFL\.txt))$/;
const required = ['install.mjs', 'start.mjs', 'package.json', 'package-lock.json', 'README.md', 'LICENSE', 'BUILD_INFO.json', 'THIRD_PARTY_NOTICES.txt', 'runtime/serve.mjs', 'runtime/dist/index.html', 'runtime/dist/app.js', 'runtime/dist/app.css'];

export async function installBrowser(source, destination) {
 if (Number(process.versions.node.split('.')[0]) < 24) throw new Error('Install Node.js 24 LTS or newer before installing Vadhyar.');
 if (process.getuid?.() === 0) throw new Error('Install as your normal user. Do not use sudo or root.');
 const base = await realpath(source), manifestPath = join(base, 'MANIFEST.json');
 if (!(await lstat(manifestPath)).isFile() || (await lstat(manifestPath)).isSymbolicLink()) throw new Error('The release manifest must be a regular file.');
 const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
 if (manifest.version !== '0.1.0' || !Array.isArray(manifest.files) || manifest.files.length > 250 || new Set(manifest.files.map(file => file.path)).size !== manifest.files.length || required.some(path => !manifest.files.some(file => file.path === path))) throw new Error('The release manifest is unsupported or incomplete.');
 const contents = []; let bytes = 0;
 for (const file of manifest.files) {
  if (!allowed.test(file.path) || !/^[a-f0-9]{64}$/.test(file.sha256) || !Number.isSafeInteger(file.bytes) || file.bytes < 0 || file.bytes > 32_000_000 || (bytes += file.bytes) > 64_000_000) throw new Error('The release contains an unsupported file or size.');
  const path = join(base, file.path), info = await lstat(path);
  if (!info.isFile() || info.isSymbolicLink() || info.size !== file.bytes || await realpath(path) !== path) throw new Error('The release contains an unsafe or changed file.');
  const content = await readFile(path);
  if (createHash('sha256').update(content).digest('hex') !== file.sha256) throw new Error('Release checksum mismatch. Download the archive again.');
  contents.push({ path: file.path, content });
 }
 const target = resolve(destination);
 await mkdir(dirname(target), { recursive: true });
 try { await mkdir(target, { mode: 0o700 }); }
 catch (error) { if (error.code === 'EEXIST') throw new Error('The install destination already exists. Choose a new directory; existing files were preserved.', { cause: error }); throw error; }
 try {
  for (const file of contents) { const path = join(target, file.path); await mkdir(dirname(path), { recursive: true, mode: 0o700 }); await writeFile(path, file.content, { flag: 'wx', mode: 0o600 }); }
  await writeFile(join(target, 'MANIFEST.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
 } catch (error) { await rm(target, { recursive: true, force: true }); throw error; }
 return target;
}

if (process.argv[1] && await realpath(process.argv[1]) === fileURLToPath(import.meta.url)) {
 try {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== '--to' || !args[1])) throw new Error('Use node install.mjs [--to /new/install/directory].');
  const data = process.platform === 'darwin' ? join(homedir(), 'Library', 'Application Support') : process.platform === 'win32' ? process.env.LOCALAPPDATA ?? homedir() : join(homedir(), '.local', 'share');
  const installed = await installBrowser(dirname(fileURLToPath(import.meta.url)), args[1] ?? join(data, 'Vadhyar', 'browser', '0.1.0'));
  process.stdout.write(`Vadhyar browser 0.1.0 installed in ${installed}\nStart with node followed by this directory's start.mjs and --project /path/to/trusted/project.\n`);
 } catch (error) { process.stderr.write(`Installation stopped: ${error.message}\n`); process.exitCode = 1; }
}
