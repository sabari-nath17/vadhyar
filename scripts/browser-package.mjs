import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { cp, lstat, mkdir, mkdtemp, readFile, readdir, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url)), version = '0.1.0';
const digest = content => createHash('sha256').update(content).digest('hex');
async function fileIdentities(folder, prefix = '') {
 const files = [];
 for (const entry of (await readdir(folder, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
  const path = prefix + entry.name;
  if (entry.isDirectory()) files.push(...await fileIdentities(join(folder, entry.name), path + '/'));
  else if (entry.isFile()) { const content = await readFile(join(folder, entry.name)); files.push({ path, bytes: content.length, sha256: digest(content) }); }
  else throw new Error('Release inputs must be regular files.');
 }
 return files;
}

export async function packageBrowser(output = join(root, 'dist', 'releases')) {
 const work = await mkdtemp(join(tmpdir(), 'vadhyar-browser-package-')), name = `vadhyar-browser-${version}`, directory = join(work, name);
 try {
  // Keep the source-checkout assets served by an existing companion untouched.
  const client = join(work, 'client'); await mkdir(join(client, 'prototype'), { recursive: true });
  for (const path of ['src', 'assets', 'index.html', 'build.mjs', 'tsconfig.json']) await cp(join(root, 'prototype', path), join(client, 'prototype', path), { recursive: true });
  await cp(join(root, 'tsconfig.json'), join(client, 'tsconfig.json'));
  for (const path of await readdir(join(root, 'prototype'))) if (path.endsWith('.mjs') && !path.endsWith('.test.mjs')) await cp(join(root, 'prototype', path), join(client, 'prototype', path));
  await cp(join(root, 'docs', 'third-party'), join(client, 'docs', 'third-party'), { recursive: true });
  await symlink(join(root, 'node_modules'), join(client, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
  const clientBuild = join(client, 'prototype', 'build.mjs');
  await writeFile(clientBuild, await readFile(clientBuild, 'utf8') + "\nawait writeFile(new URL('../client-metafile.json', root), JSON.stringify(result.metafile));\n");
  execFileSync(process.execPath, [join(client, 'prototype', 'build.mjs')], { cwd: client, stdio: 'inherit' });
  await mkdir(join(directory, 'runtime'), { recursive: true });
  const result = await build({ absWorkingDir: client, entryPoints: ['prototype/serve.mjs'], outfile: join(directory, 'runtime', 'serve.mjs'), bundle: true, preserveSymlinks: true, platform: 'node', format: 'esm', target: 'node24', metafile: true, legalComments: 'eof', logLevel: 'info', banner: { js: "import { createRequire as runtimeRequire } from 'node:module'; import { fileURLToPath as runtimePath } from 'node:url'; import { dirname as runtimeDirectory } from 'node:path'; const require = runtimeRequire(import.meta.url); const __filename = runtimePath(import.meta.url); const __dirname = runtimeDirectory(__filename);" } });
  await cp(join(client, 'prototype', 'dist'), join(directory, 'runtime', 'dist'), { recursive: true });
  await cp(join(root, 'scripts', 'browser-install.mjs'), join(directory, 'install.mjs'));
  await cp(join(root, 'scripts', 'browser-start.mjs'), join(directory, 'start.mjs'));
  await cp(join(root, 'docs', 'browser-installation.md'), join(directory, 'README.md'));
  await cp(join(root, 'LICENSE'), join(directory, 'LICENSE'));
  const manifest = { name: 'vadhyar-browser', version, private: true, type: 'module', license: 'MIT', engines: { node: '>=24.0.0' }, scripts: { start: 'node start.mjs' } };
  await writeFile(join(directory, 'package.json'), JSON.stringify(manifest, null, 2) + '\n');
  await writeFile(join(directory, 'package-lock.json'), JSON.stringify({ name: manifest.name, version, lockfileVersion: 3, requires: true, packages: { '': manifest } }, null, 2) + '\n');
  const lockText = await readFile(join(root, 'package-lock.json')), lock = JSON.parse(lockText), packages = new Set(), inputs = {};
  const clientMetafile = JSON.parse(await readFile(join(client, 'client-metafile.json'), 'utf8'));
  const clientPackages = new Set(Object.keys(clientMetafile.inputs).map(path => /(?:^|\/)node_modules\/((?:@[^/]+\/)?[^/]+)/.exec(path)?.[1]).filter(Boolean));
  const clientDependencies = [];
  for (const name of [...clientPackages].sort()) { const installed = JSON.parse(await readFile(join(root, 'node_modules', name, 'package.json'), 'utf8')), pinned = lock.packages[`node_modules/${name}`]; if (!pinned?.integrity || pinned.version !== installed.version) throw new Error(`Installed ${name} does not match the committed dependency lock.`); clientDependencies.push({ name, version: pinned.version, integrity: pinned.integrity, license: installed.license }); }
  for (const path of Object.keys(result.metafile.inputs).sort()) {
   inputs[path] = digest(await readFile(join(client, path)));
   const match = /^node_modules\/((?:@[^/]+\/)?[^/]+)/.exec(path); if (match) packages.add(match[1]);
  }
  let notices = await readFile(join(directory, 'runtime', 'dist', 'THIRD_PARTY_NOTICES.txt'), 'utf8');
  const dependencies = [];
  for (const name of [...packages].sort()) {
   const folder = join(root, 'node_modules', name), metadata = JSON.parse(await readFile(join(folder, 'package.json'), 'utf8')), pinned = lock.packages[`node_modules/${name}`];
   if (!pinned?.integrity || pinned.version !== metadata.version) throw new Error(`Installed ${name} does not match the committed dependency lock.`);
   let license;
   for (const file of ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'LICENCE']) { try { license = await readFile(join(folder, file), 'utf8'); break; } catch (error) { if (error.code !== 'ENOENT') throw error; } }
   if (!license) throw new Error(`Missing runtime license text for ${name}.`);
   notices += `\nBundled local runtime: ${name} ${metadata.version}\n${license}\n`;
   for (const path of (await readdir(folder, { recursive: true })).sort()) if (/(?:license|licence|notice)/i.test(basename(path)) && (await lstat(join(folder, path))).isFile()) notices += `\n${name}/${path}\n${await readFile(join(folder, path), 'utf8')}\n`;
   dependencies.push({ name, version: pinned.version, integrity: pinned.integrity, license: metadata.license });
  }
  for (const path of ['tsconfig.json', 'prototype/tsconfig.json']) inputs[path] = digest(await readFile(join(client, path)));
  for (const path of ['scripts/browser-package.mjs', 'scripts/browser-install.mjs', 'scripts/browser-start.mjs', 'docs/browser-installation.md']) inputs[path] = digest(await readFile(join(root, path)));
  await writeFile(join(directory, 'THIRD_PARTY_NOTICES.txt'), notices);
  const clientSources = await fileIdentities(join(client, 'prototype', 'src'), 'prototype/src/');
  await writeFile(join(directory, 'BUILD_INFO.json'), JSON.stringify({ version, sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), nodeVersion: process.versions.node, sourceLockSha256: digest(lockText), runtimeDependencies: dependencies, clientDependencies, inputs, clientSources }, null, 2) + '\n');
  const files = await fileIdentities(directory); await writeFile(join(directory, 'MANIFEST.json'), JSON.stringify({ version, files }, null, 2) + '\n');
  await mkdir(resolve(output), { recursive: true });
  const archive = join(resolve(output), `${name}.tar.gz`);
  const owners = process.platform === 'darwin' ? ['--uid', '0', '--gid', '0', '--uname', 'root', '--gname', 'root'] : ['--owner=0', '--group=0', '--numeric-owner'];
  execFileSync('tar', [...owners, '-czf', archive, '-C', work, name], { stdio: 'inherit', env: { ...process.env, COPYFILE_DISABLE: '1' } });
  const sha256 = digest(await readFile(archive)); await writeFile(archive + '.sha256', `${sha256}  ${name}.tar.gz\n`);
  return { archive, sha256, files };
 } finally { await rm(work, { recursive: true, force: true }); }
}

if (process.argv[1] && await realpath(process.argv[1]) === fileURLToPath(import.meta.url)) {
 try { const result = await packageBrowser(); process.stdout.write(`Browser release: ${result.archive}\nSHA-256: ${result.sha256}\n`); }
 catch (error) { process.stderr.write(`Browser packaging stopped: ${error.message}\n`); process.exitCode = 1; }
}
