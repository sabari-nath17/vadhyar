import { describe, expect, it } from 'vitest';
import type { PanelState } from '../src/shared.js';
import { availableSteps, completedSteps, currentRun, requirementProse, steps, suggestedStep, sharingSummary } from '../src/panel/workflow.js';

const base: PanelState = { refs: [], busy: false, sourceHash: 'source', requirement: { id: 'rule', revision: 'revision', text: 'Rule' }, confirmed: true, ownershipCurrent: true };
const counterexample = { id: 'run', predictionId: 'prediction', startedAt: '', finishedAt: '', latencyMs: 1, sourceHash: 'source', requirementRevision: 'revision', vitestVersion: '5.0.3' as const, caseId: 'other-client-active' as const, kind: 'completed' as const, observedApproval: true, requirementPassed: false, exitCode: 1 as const, executedCases: 1 as const, skippedCases: 2 as const };
const run = { ...counterexample, baselineHash: 'before', suiteId: 'ownership' as const, cases: [], requirementPassed: true, exitCode: 0 as const };
describe('panel workflow derives steps and evidence from host state', () => {
  it('locks future stages until their real prerequisites exist', () => {
    expect(steps).toHaveLength(6);
    expect(availableSteps({ refs: [], busy: false })).toEqual(['confirm']);
    expect(availableSteps(base)).toEqual(['confirm', 'understand', 'predict']);
    expect(availableSteps({ ...base, requirement: { ...base.requirement!, checksAvailable: false } })).toEqual(['confirm', 'understand']);
    expect(completedSteps(base)).toEqual(['confirm']);
    expect(availableSteps({ ...base, counterexample })).toEqual(['confirm', 'understand', 'predict', 'observe']);
    expect(availableSteps({ ...base, counterexample, baselineHash: 'before' })).toContain('change');
    expect(availableSteps({ ...base, counterexample: { ...counterexample, requirementPassed: true }, baselineHash: 'before' })).not.toContain('change');
  });
  it('never treats an earlier source or requirement as a current passed run', () => {
    expect(currentRun({ ...base, ownershipRun: run })).toBe(true);
    expect(currentRun({ ...base, ownershipRun: run, ownershipCurrent: false })).toBe(false);
    expect(currentRun({ ...base, ownershipRun: run, ownershipCurrent: undefined })).toBe(false);
    expect(currentRun({ ...base, ownershipRun: run, sourceHash: 'changed' })).toBe(false);
    expect(currentRun({ ...base, ownershipRun: run, requirement: { ...base.requirement!, revision: 'changed' } })).toBe(false);
    expect(currentRun({ ...base, ownershipRun: { ...run, kind: 'timeout', message: 'Timeout' } })).toBe(false);
    expect(suggestedStep({ ...base, ownershipRun: run })).toBe('verify');
    const explanation = { responseId: 'synthetic', model: 'test', requestedModel: 'test', latencyMs: 0, explanation: { summary: 'Recorded interpretation', steps: [] } };
    expect(completedSteps({ ...base, explanation, explanationCurrent: false })).not.toContain('understand');
    expect(completedSteps({ ...base, explanation, explanationCurrent: true })).toContain('understand');
  });
  it('uses the restored stage only while its real prerequisites are available', () => {
    expect(suggestedStep({ ...base, counterexample, baselineHash: 'source', stage: 'change' })).toBe('change');
    expect(suggestedStep({ ...base, stage: 'verify' })).toBe('understand');
  });
  it('summarizes the exact sharing payload and rejects malformed context', () => {
    expect(sharingSummary(JSON.stringify({ requirement: { path: 'rule.md', text: 'Actual requirement.' }, source: { path: 'src/example.ts' } }))).toEqual({ requirement: 'Actual requirement.', files: ['rule.md', 'src/example.ts'] });
    expect(sharingSummary('invalid')).toBeUndefined();
    expect(sharingSummary('{}')).toBeUndefined();
    expect(sharingSummary('x'.repeat(30_001))).toBeUndefined();
  });
  it('shows requirement prose from the actual document, excluding metadata', () => {
    expect(requirementProse('# Requirement\n\nID: example\nRevision: 1\n\nOnly the owner can approve.\nThe bug is disclosed.\n\n## Scenarios')).toBe('Only the owner can approve.');
    expect(requirementProse('A different rule.')).toBe('A different rule.');
    expect(requirementProse('# Metadata only')).toMatch(/Refresh/);
  });
});
