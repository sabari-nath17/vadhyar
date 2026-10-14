import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL, URL } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

export function auditDecision(full, production, lock, policy, now = Date.now()) {
  if (!full?.metadata?.vulnerabilities || !production?.metadata?.vulnerabilities || !full.vulnerabilities || !production.vulnerabilities) throw new Error('Malformed native audit report.');
  for (const report of [full, production]) {
    const counts = report.metadata.vulnerabilities;
    const severities = ['info', 'low', 'moderate', 'high', 'critical'];
    if (Array.isArray(report.vulnerabilities) || severities.some(name => !Number.isInteger(counts[name]) || counts[name] < 0 || Object.values(report.vulnerabilities).filter(finding => finding.severity === name).length !== counts[name]) || severities.reduce((total, name) => total + counts[name], 0) !== counts.total || Object.keys(report.vulnerabilities).length !== counts.total) throw new Error('Malformed native audit counts.');
  }
  if (Object.keys(production.vulnerabilities).length) throw new Error('Production dependency findings block release.');
  const findings = Object.entries(full.vulnerabilities);
  if (!findings.length) return { accepted: [], nativeAuditClean: true };
  if (!Number.isFinite(Date.parse(policy.expiresAt)) || now > Date.parse(policy.expiresAt)) throw new Error('Development dependency exception expired.');
  const names = Object.keys(policy.packages).sort();
  if (findings.map(([name]) => name).sort().join(',') !== names.join(',')) throw new Error('New or changed dependency findings block release.');
  if (lock.packages[''].devDependencies?.promptfoo !== policy.packages.promptfoo || lock.packages[''].dependencies?.promptfoo) throw new Error('Promptfoo is no longer the pinned development-only tool.');
  for (const [name, finding] of findings) {
    const node = `node_modules/${name}`;
    const dependency = lock.packages[node];
    if (!dependency?.dev || dependency.version !== policy.packages[name] || finding.severity !== 'high' || finding.nodes?.length !== 1 || finding.nodes[0] !== node) throw new Error(`Dependency scope or version changed: ${name}.`);
    const via = finding.via;
    const parent = { promptfoo: 'jks-js', 'jks-js': 'node-forge' }[name];
    if (via?.length !== 1 || (name === 'node-forge' ? typeof via[0] !== 'object' || via[0]?.url !== policy.advisory || via[0]?.severity !== 'high' : via[0] !== parent)) throw new Error(`Unapproved advisory: ${name}.`);
  }
  if (lock.packages['node_modules/promptfoo'].optionalDependencies?.['jks-js'] !== '^1.1.5' || lock.packages['node_modules/jks-js'].dependencies?.['node-forge'] !== '^1.4.0') throw new Error('Accepted development dependency chain changed.');
  return { accepted: names, nativeAuditClean: false, advisory: policy.advisory, expiresAt: policy.expiresAt };
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
  const lock = JSON.parse(await readFile(resolve(root, 'package-lock.json'), 'utf8'));
  const policy = JSON.parse(await readFile(resolve(root, 'docs/security/dependency-exceptions.json'), 'utf8'));
  const decision = { ...auditDecision(reports[0], reports[1], lock, policy), nativeExitCodes };
  await writeFile(resolve(directory, 'triage.json'), JSON.stringify(decision, null, 2) + '\n');
  process.stdout.write(decision.nativeAuditClean ? 'Native full and production audits are clean.\n' : `Native full audit exit ${nativeExitCodes['full-audit']}: ${decision.accepted.length} accepted development findings; production audit exit ${nativeExitCodes['production-audit']}: clean. Temporary risk triage expires ${decision.expiresAt}. See docs/dependency-risk.md and unmodified native reports.\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main().catch(error => { process.stderr.write(`Dependency risk triage refused: ${error.message}\n`); process.exitCode = 1; });
