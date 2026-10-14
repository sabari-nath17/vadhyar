import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { URL } from 'node:url';
import { auditDecision } from './dependency-audit.mjs';

const { structuredClone } = globalThis;

const policy = JSON.parse(await readFile(new URL('../docs/security/dependency-exceptions.json', import.meta.url), 'utf8'));
const lock = JSON.parse(await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'));
const clean = { metadata: { vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 } }, vulnerabilities: {} };
const full = { metadata: { vulnerabilities: { info: 0, low: 0, moderate: 0, high: 3, critical: 0, total: 3 } }, vulnerabilities: Object.fromEntries(Object.keys(policy.packages).map(name => [name, { severity: 'high', nodes: [`node_modules/${name}`], via: name === 'node-forge' ? [{ url: policy.advisory, severity: 'high' }] : [name === 'jks-js' ? 'node-forge' : 'jks-js'] }])) };
const time = Date.parse('2026-10-15T00:00:00+05:30');

test('keeps native findings visible and accepts only the exact pinned development chain', () => {
  assert.equal(auditDecision(full, clean, lock, policy, time).nativeAuditClean, false);
  assert.equal(auditDecision(clean, clean, lock, policy, time).nativeAuditClean, true);
});
test('refuses expired, changed-version, production and malformed audits', () => {
  assert.throws(() => auditDecision(full, clean, lock, policy, Date.parse(policy.expiresAt) + 1), /expired/);
  const changed = structuredClone(lock); changed.packages['node_modules/node-forge'].version = '1.4.1';
  assert.throws(() => auditDecision(full, clean, changed, policy, time), /version/);
  assert.throws(() => auditDecision(full, full, lock, policy, time), /Production/);
  assert.throws(() => auditDecision({}, clean, lock, policy, time), /Malformed/);
  const inconsistent = structuredClone(clean); inconsistent.metadata.vulnerabilities.high = 1;
  assert.throws(() => auditDecision(inconsistent, clean, lock, policy, time), /Malformed/);
  const misclassified = structuredClone(full); misclassified.metadata.vulnerabilities.high = 2; misclassified.metadata.vulnerabilities.critical = 1;
  assert.throws(() => auditDecision(misclassified, clean, lock, policy, time), /Malformed/);
});
test('refuses new advisories, non-development scope and changed dependency chains', () => {
  const newFinding = structuredClone(full); newFinding.vulnerabilities['node-forge'].via[0].url = 'https://github.com/advisories/new';
  assert.throws(() => auditDecision(newFinding, clean, lock, policy, time), /Unapproved/);
  const missing = structuredClone(full); missing.vulnerabilities['node-forge'].via = ['node-forge'];
  assert.throws(() => auditDecision(missing, clean, lock, policy, time), /Unapproved/);
  const cycle = structuredClone(full); cycle.vulnerabilities.promptfoo.via = ['promptfoo'];
  assert.throws(() => auditDecision(cycle, clean, lock, policy, time), /Unapproved/);
  const runtime = structuredClone(lock); runtime.packages['node_modules/node-forge'].dev = false;
  assert.throws(() => auditDecision(full, clean, runtime, policy, time), /scope/);
  const changed = structuredClone(lock); changed.packages['node_modules/jks-js'].dependencies['node-forge'] = '*';
  assert.throws(() => auditDecision(full, clean, changed, policy, time), /chain/);
});
