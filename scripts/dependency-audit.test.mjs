import assert from 'node:assert/strict';
import test from 'node:test';
import { auditDecision } from './dependency-audit.mjs';

const { structuredClone } = globalThis;

const clean = { metadata: { vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 } }, vulnerabilities: {} };
const finding = { metadata: { vulnerabilities: { info: 0, low: 0, moderate: 0, high: 1, critical: 0, total: 1 } }, vulnerabilities: { dependency: { severity: 'high', isDirect: false, via: [{ url: 'https://github.com/advisories/example', severity: 'high' }] } } };

test('accepts only clean full and production native reports', () => {
  assert.equal(auditDecision(clean, clean).nativeAuditClean, true);
});
test('blocks development and production findings without temporary exceptions', () => {
  assert.throws(() => auditDecision(finding, clean), /Dependency findings/);
  assert.throws(() => auditDecision(finding, finding), /Production/);
  const lowerSeverity = structuredClone(finding); lowerSeverity.metadata.vulnerabilities.high = 0; lowerSeverity.metadata.vulnerabilities.low = 1; lowerSeverity.vulnerabilities.dependency.severity = 'low';
  assert.throws(() => auditDecision(lowerSeverity, clean), /Dependency findings/);
});
test('refuses malformed and inconsistent native reports', () => {
  assert.throws(() => auditDecision({}, clean), /Malformed/);
  const inconsistent = structuredClone(clean); inconsistent.metadata.vulnerabilities.high = 1;
  assert.throws(() => auditDecision(inconsistent, clean), /Malformed/);
  const misclassified = structuredClone(finding); misclassified.metadata.vulnerabilities.high = 0; misclassified.metadata.vulnerabilities.critical = 1;
  assert.throws(() => auditDecision(misclassified, clean), /Malformed/);
  assert.throws(() => auditDecision(clean, { ...clean, vulnerabilities: [] }), /Malformed/);
});
