import { spawn } from 'node:child_process';
import { setTimeout, clearTimeout } from 'node:timers';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve('.');
const started = Date.now();
const child = spawn('/Applications/Visual Studio Code.app/Contents/MacOS/Code', ['--new-window', '--disable-extensions', '--user-data-dir', '/tmp/vadhyar-host-profile', `--extensionDevelopmentPath=${root}`, `--extensionTestsPath=${join(root, 'dist/host-test.cjs')}`, join(root, 'novadesk')], { stdio: ['ignore', 'pipe', 'pipe'] });
child.stdout.on('data', () => {});
child.stderr.on('data', () => {});
const timer = setTimeout(() => { child.kill(); process.exitCode = 1; }, 180_000);
child.on('exit', code => {
  clearTimeout(timer);
  try {
    const evidence = JSON.parse(readFileSync('/tmp/vadhyar-host-evidence.json', 'utf8'));
    if (Date.parse(evidence.capturedAt) < started) throw new Error('stale');
    process.exitCode = code ?? 1;
  } catch {
    process.stderr.write('Host check failed: no fresh acceptance evidence.\n');
    process.exitCode = 1;
  }
});
