import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL, URL } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

export function auditDecision(full, production) {
  if (!full?.metadata?.vulnerabilities || !production?.metadata?.vulnerabilities || !full.vulnerabilities || !production.vulnerabilities) throw new Error('Malformed native audit report.');
  for (const report of [full, production]) {
    const counts = report.metadata.vulnerabilities;
    const severities = ['info', 'low', 'moderate', 'high', 'critical'];
    if (Array.isArray(report.vulnerabilities) || severities.some(name => !Number.isInteger(counts[name]) || counts[name] < 0 || Object.values(report.vulnerabilities).filter(finding => finding.severity === name).length !== counts[name]) || severities.reduce((total, name) => total + counts[name], 0) !== counts.total || Object.keys(report.vulnerabilities).length !== counts.total) throw new Error('Malformed native audit counts.');
  }
  if (Object.keys(production.vulnerabilities).length) throw new Error('Production dependency findings block release.');
  if (Object.keys(full.vulnerabilities).length) throw new Error('Dependency findings block release, including development dependencies.');
  return { nativeAuditClean: true };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== '--output')) throw new Error('Usage: node scripts/dependency-audit.mjs [--output directory]');
  const directory = resolve(root, args[1] ?? 'dist/security');
  await mkdir(directory, { recursive: true });
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const reports = [];
  const nativeExitCodes = {};
  for (const [name, extra] of [['full-audit', []], ['production-audit', ['--omit=dev']]]) {
    const result = spawnSync(npm, ['audit', '--json', ...extra], { cwd: root, encoding: 'utf8', maxBuffer: 10_000_000 });
    await writeFile(resolve(directory, `${name}.json`), result.stdout ?? '');
    if (result.error || ![0, 1].includes(result.status)) throw new Error('Native dependency audit failed or was unavailable.');
    const report = JSON.parse(result.stdout);
    if (report.error) throw new Error('Native dependency audit returned an error.');
    if (result.status !== (Object.keys(report.vulnerabilities ?? {}).length ? 1 : 0)) throw new Error('Native dependency audit status disagrees with its report.');
    nativeExitCodes[name] = result.status;
    reports.push(report);
  }
  const decision = { ...auditDecision(reports[0], reports[1]), nativeExitCodes };
  await writeFile(resolve(directory, 'triage.json'), JSON.stringify(decision, null, 2) + '\n');
  process.stdout.write('Native full and production audits are clean.\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main().catch(error => { process.stderr.write(`Dependency risk triage refused: ${error.message}\n`); process.exitCode = 1; });
