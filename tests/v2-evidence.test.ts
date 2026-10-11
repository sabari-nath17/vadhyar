import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import type { PanelState } from '../src/shared.js';
import { lessonSteps, recordedSummary } from '../src/panel/v2/evidence.js';

const record = JSON.parse(readFileSync(new URL('../docs/design-v2/phase-0/recorded-checks.json', import.meta.url), 'utf8')) as { seed: PanelState; corrected: PanelState };
record.seed.ownershipCurrent = true;
record.corrected.ownershipCurrent = true;
describe('V2 recorded-evidence presentation', () => {
  it('derives registry length and actual matched case counts', () => {
    expect(lessonSteps).toHaveLength(6);
    expect(recordedSummary(record.seed)).toMatchObject({ matched: 2, total: 3, passed: false });
    expect(recordedSummary(record.corrected)).toMatchObject({ matched: 3, total: 3, passed: true });
  });
  it('withholds achievements for stale or incomplete verification', () => {
    const stale = recordedSummary({ ...record.corrected, sourceHash: 'earlier' });
    expect(stale.passed).toBe(false);
    expect(stale.earned).not.toContain('all-cases-match');
    const state = structuredClone(record.corrected);
    if (state.ownershipRun?.kind !== 'completed') throw new Error('Recorded runner evidence missing.');
    state.ownershipRun.cases.pop();
    expect(recordedSummary(state).complete).toBe(false);
  });
  it('requires the host current-check flag even when source hashes match', () => {
    expect(recordedSummary({ ...record.corrected, ownershipCurrent: undefined }).passed).toBe(false);
    expect(recordedSummary({ ...record.corrected, ownershipCurrent: false }).earned).not.toContain('all-cases-match');
  });
  it('uses the recorded transfer cases and rejects duplicate or contradictory results', () => {
    const state = structuredClone(record.corrected);
    if (state.ownershipRun?.kind !== 'completed') throw new Error('Recorded runner evidence missing.');
    state.ownershipRun.suiteId = 'transfer';
    state.ownershipRun.cases.push({id:'owner-client-archived',expectedApproval:false,observedApproval:false,status:'passed'});
    expect(recordedSummary(state)).toMatchObject({passed:true,total:4,matched:4});
    state.ownershipRun.cases[3] = {...state.ownershipRun.cases[0]};
    expect(recordedSummary(state).complete).toBe(false);
    state.ownershipRun.cases[3] = {id:'owner-client-archived',expectedApproval:false,observedApproval:true,status:'passed'};
    expect(recordedSummary(state).passed).toBe(false);
  });
  it('never infers independent authorship or source-open history', () => {
    expect(recordedSummary(record.corrected).earned).not.toContain('fixed-it-yourself');
    expect(recordedSummary(record.corrected).earned).not.toContain('found-the-bug');
    expect(recordedSummary({ ...record.corrected, hints: undefined }).earned).not.toContain('no-hints');
  });
  it('requires a correlated prediction saved before execution', () => {
    const state = structuredClone(record.corrected);
    state.prediction!.savedAt = '2099-01-01T00:00:00.000Z';
    expect(recordedSummary(state).earned).not.toContain('predicted-first');
    state.prediction!.id = 'uncorrelated';
    expect(recordedSummary(state).predictedFirst).toBe(false);
  });
});
