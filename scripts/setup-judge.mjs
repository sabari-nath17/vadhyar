import { Buffer } from 'node:buffer';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { arch, platform } from 'node:os';
import { isAbsolute, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const exec = promisify(execFile);
export const release = Object.freeze({
  version: '0.1.1', target: 'darwin-arm64', bytes: 35501049,
  sha256: '2b3d6f649299b429a6eeddb5a54ee70e7acecfc404d09d531a7284eee65d71aa',
  url: 'https://github.com/sabari-nath17/vadhyar/releases/download/v0.1.1/vadhyar-0.1.1-darwin-arm64.vsix',
});

export function validatePrerequisites(system) {
  if (system.platform !== 'darwin' || system.arch !== 'arm64') throw new Error('This installer is verified only for macOS Apple Silicon. Windows, Linux and Intel Mac require separate compatibility verification; installation stopped.');
  const [major, minor] = system.node.replace(/^v/, '').split('.').map(Number);
  if (!((major === 22 && minor >= 22) || major === 24 || major >= 26)) throw new Error('Install Node.js 22.22+, 24.x or 26+ before running setup.');
  const python = /^Python (\d+)\.(\d+)\./.exec(system.python);
  if (!python || Number(python[1]) !== 3 || Number(python[2]) < 10) throw new Error('Install Python 3.10+ first.');
  const vscode = /^(\d+)\.(\d+)\./.exec(system.vscode);
  if (!vscode || Number(vscode[1]) < 1 || (Number(vscode[1]) === 1 && Number(vscode[2]) < 140)) throw new Error('Install VS Code 1.140.0+ first.');
  return system;
}

export async function freshDestination(destination) {
  if (!destination || !isAbsolute(destination) || destination.includes('\0')) throw new Error('Choose an absolute NEW setup folder. Existing folders are never overwritten.');
  try { await mkdir(destination, { mode: 0o700 }); }
  catch { throw new Error('Cannot create the NEW setup folder. It may already exist or its parent may be unavailable; existing data is preserved.'); }
}

export function verifyArchive(bytes) {
  if (bytes.length !== release.bytes || createHash('sha256').update(bytes).digest('hex') !== release.sha256) throw new Error('Installer size/checksum does not match the frozen release; installation stopped.');
}

export function validateSeedRunner(report, exitCode) {
  const results = report.testResults?.flatMap(suite => suite.assertionResults ?? []) ?? [];
  const expected = [['owner-client-active', 'passed', true], ['other-client-active', 'failed', true], ['freelancer-active', 'passed', false]];
  if (exitCode !== 1 || results.length !== 3 || expected.some(([title, status, actual]) => results.filter(result => result.title === title && result.status === status && result.meta?.approval === actual).length !== 1)) throw new Error('Prepared runner diagnostic did not produce the disclosed ownership bug; setup is incomplete.');
  return expected.map(([caseId, status, actual]) => ({ caseId, status, actual }));
}

async function run(operation, executable, args, options = {}) {
  const started = Date.now();
  process.stdout.write(`${operation}: running\n`);
  try {
    const env = { PATH: process.env.PATH ?? '/usr/bin:/bin', HOME: process.env.HOME, TMPDIR: process.env.TMPDIR ?? '/tmp' };
    const result = await exec(executable, args, { timeout: 60000, maxBuffer: 2_000_000, env, ...options });
    process.stdout.write(`${operation}: complete (${Date.now() - started} ms)\n`);
    return result;
  } catch (error) {
    if (options.allowSeedFailure && error.code === 1 && !error.killed) return { stdout: '', exitCode: 1 };
    throw new Error(`${operation}: ${error.killed ? 'timed out' : 'failed'} (status ${Number.isInteger(error.code) ? error.code : 'unavailable'}). Setup is incomplete; existing sessions are untouched.`, { cause: error });
  }
}

async function prerequisites() {
  // Reject unsupported systems before invoking or installing anything.
  validatePrerequisites({ platform: platform(), arch: arch(), node: process.version, python: 'Python 3.13.0', vscode: '1.140.0' });
  let code = 'code';
  try { await access('/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code'); code = '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code'; } catch { /* Use the official CLI on PATH. */ }
  const python = await run('python-prerequisite', 'python3', ['--version']);
  const vscode = await run('vscode-prerequisite', code, ['--version']);
  return { ...validatePrerequisites({ platform: platform(), arch: arch(), node: process.version, python: python.stdout.trim(), vscode: vscode.stdout.trim().split('\n')[0] }), code };
}

async function download(destination) {
  const response = await globalThis.fetch(release.url, { signal: globalThis.AbortSignal.timeout(120000) });
  if (!response.ok || !response.body) throw new Error('Frozen installer download failed; check Internet access and retry in a new setup folder.');
  const chunks = []; let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > release.bytes) throw new Error('Installer download exceeded the frozen size; installation stopped.');
    chunks.push(chunk);
  }
  const bytes = Buffer.concat(chunks); verifyArchive(bytes);
  await writeFile(destination, bytes, { flag: 'wx', mode: 0o600 });
}

export async function install(destination, system) {
  await freshDestination(destination);
  const directories = ['home', 'downloads', 'profile/User', 'extensions', 'diagnostics', 'diagnostics/graph-input'];
  for (const directory of directories) await mkdir(join(destination, directory), { recursive: true, mode: 0o700 });
  // Children receive no API credentials or personal home/configuration files.
  const env = { PATH: process.env.PATH ?? '/usr/bin:/bin', HOME: join(destination, 'home'), TMPDIR: process.env.TMPDIR ?? '/tmp', CI: '1', GRAPHIFY_NO_AUTO_REFRESH: '1', PYTHONDONTWRITEBYTECODE: '1' };
  const options = { cwd: destination, env };
  const graphEnvironment = join(destination, 'graphify');
  await run('graphify-environment', 'python3', ['-m', 'venv', graphEnvironment], options);
  const python = join(graphEnvironment, 'bin/python');
  const graphify = join(graphEnvironment, 'bin/graphify');
  await run('graphify-install', python, ['-m', 'pip', 'install', '--no-input', '--disable-pip-version-check', 'graphifyy==0.9.84'], { ...options, timeout: 300000 });
  await run('graphify-dependencies', python, ['-m', 'pip', 'check'], options);
  const graphVersion = (await run('graphify-version', graphify, ['--version'], options)).stdout.trim();
  if (graphVersion !== 'graphify 0.9.84') throw new Error('Unexpected Graphify version; installation stopped.');
  const archive = join(destination, 'downloads/vadhyar-0.1.1-darwin-arm64.vsix');
  await download(archive);
  const profile = join(destination, 'profile'); const extensions = join(destination, 'extensions');
  await run('vscode-install', system.code, ['--user-data-dir', profile, '--extensions-dir', extensions, '--install-extension', archive], options);
  let installed;
  for (const directory of await readdir(extensions)) {
    try {
      const metadata = JSON.parse(await readFile(join(extensions, directory, 'package.json'), 'utf8'));
      if (metadata.publisher === 'sabari-nath17' && metadata.name === 'vadhyar' && metadata.version === release.version) installed = join(extensions, directory);
    } catch { /* Ignore VS Code metadata entries. */ }
  }
  if (!installed) throw new Error('Frozen Vadhyar installation was not found in the isolated profile.');
  const demo = join(destination, 'NovaDesk');
  await run('prepare-fresh-novadesk', process.execPath, [join(installed, 'scripts/prepare-demo.mjs'), demo], options);
  await writeFile(join(profile, 'User/settings.json'), JSON.stringify({ 'vadhyar.graphifyPath': graphify }, null, 2) + '\n', { flag: 'wx', mode: 0o600 });

  const input = join(destination, 'diagnostics/graph-input'); const output = join(destination, 'diagnostics');
  const source = await readFile(join(demo, 'src/approval.ts'), 'utf8');
  await writeFile(join(input, 'approval.ts'), source, { flag: 'wx', mode: 0o600 });
  await run('graphify-real-extraction', '/usr/bin/sandbox-exec', ['-p', '(version 1)(allow default)(deny network*)', graphify, 'extract', input, '--code-only', '--no-cluster', '--out', output], options);
  const graph = JSON.parse(await readFile(join(output, 'graphify-out/graph.json'), 'utf8'));
  if (graph.input_tokens !== 0 || graph.output_tokens !== 0 || !graph.nodes?.some(node => node.label === 'canApproveMilestone()') || !graph.nodes.every(node => node.file_type === 'code' && node.source_file === 'approval.ts' && node._origin === 'ast' && /^L[1-9]\d*$/.test(node.source_location) && Number(node.source_location.slice(1)) <= source.trimEnd().split('\n').length)) throw new Error('Real Graphify output does not match the prepared source/version contract.');

  const reportPath = join(output, 'ownership.json');
  const result = await run('packaged-seeded-runner', process.execPath, [join(installed, 'node_modules/vitest/vitest.mjs'), 'run', '--config', join(installed, 'fixtures/novadesk/vitest.config.ts'), '--pool=threads', '--maxWorkers=1', '--reporter=json', '--outputFile', reportPath], { ...options, cwd: installed, timeout: 20000, allowSeedFailure: true });
  const seededCases = validateSeedRunner(JSON.parse(await readFile(reportPath, 'utf8')), result.exitCode ?? 0);
  const evidence = { recordedAt: new Date().toISOString(), system, release, graphify: { version: graphVersion, nodeCount: graph.nodes.length, edgeCount: graph.edges.length, inputTokens: graph.input_tokens, outputTokens: graph.output_tokens }, seedDiagnostic: { exitCode: result.exitCode, cases: seededCases, disclosure: 'Deliberate ownership bug: different client is incorrectly allowed. This diagnostic is not a learner attempt or passing requirement.' }, nativePanel: 'Not exercised by setup', liveOpenAI: 'Not requested; native secure key entry, account/model access and explicit sharing are still required', workspaceTrust: 'Required; never disabled' };
  await writeFile(join(destination, 'setup-evidence.json'), JSON.stringify(evidence, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  const quote = value => `'${value.replaceAll("'", "'\\''")}'`;
  process.stdout.write(`\nLocal dependencies and frozen installer verified. Launch the isolated demo:\n${[system.code, '--new-window', '--user-data-dir', profile, '--extensions-dir', extensions, demo].map(quote).join(' ')}\nTrust only NovaDesk, then run Vadhyar: Understand this change. Live coaching needs secure native key entry and an account-supported vadhyar.model.\nEvidence: ${join(destination, 'setup-evidence.json')}\n`);
  return evidence;
}

async function main() {
  const [action, destination] = process.argv.slice(2);
  if (!((action === '--check' && !destination && process.argv.length === 3) || (action === '--install' && destination && process.argv.length === 4))) throw new Error('Usage: node scripts/setup-judge.mjs --check OR --install /absolute/NEW/setup-folder');
  const system = await prerequisites();
  if (action === '--check') { process.stdout.write('Supported local prerequisites found. Installation, Graphify extraction, native panel and live API have not run.\n'); return; }
  await install(destination, system);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
}
