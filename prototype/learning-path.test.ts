import { describe, expect, it } from 'vitest';
import { lessonSteps, pathStepState } from './src/learning-path.js';
import { newProjectState, projectTransition } from './src/project-learning.js';
import type { SourceSnapshot } from './src/project-types.js';

const source: SourceSnapshot = { projectId: 'a'.repeat(64), fileId: 'b'.repeat(64), path: 'src/reserve.js', language: 'JavaScript', sourceHash: 'c'.repeat(64), startLine: 1, endLine: 1, text: 'export const canReserve = seats => seats > 0;', fileBytes: 45, truncated: false, capturedAt: '2026-10-14T00:00:00.000Z' };
const started = () => projectTransition(newProjectState(source.projectId), { type: 'start', source, requirement: 'No remaining seats must block a booking.', caseInput: 'Request a booking with zero seats.' });
function reflected() {
 let s = projectTransition(started(), { type: 'predict', text: 'The booking is blocked.', reasoning: 'The condition requires a positive number of seats.' });
 s = projectTransition(s, { type: 'observe', source, text: 'I inspected the function and observed that zero produces false.' });
 s = projectTransition(s, { type: 'refresh', source });
 s = projectTransition(s, { type: 'verifyManual', description: 'Called canReserve with zero in my editor.', evidence: 'The result was false; other callers remain unchecked.', verdict: 'uncertain', reason: 'The selected function agrees, but caller coverage is unknown.', assistance: 'I inspected the source with no additional help.' });
 return projectTransition(s, { type: 'reflect', text: 'A local function result does not establish every booking path.' });
}

describe('state-derived question path', () => {
 it('offers only the current activity and labels every later prerequisite', () => {
  const a = started().attempt!;
  expect(lessonSteps.map((_, i) => pathStepState(a, i, 'unknown'))).toEqual(['current', 'upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming']);
  expect(lessonSteps.map(s => s.key)).toEqual(['predict', 'observe', 'change', 'verify', 'reflect', 'complete']);
 });
 it('keeps the separate case current after reflection until its actual answer is recorded', () => {
  const s = reflected();
  expect(s.attempt!.stage).toBe('complete');
  expect(pathStepState(s.attempt!, 5, 'current')).toBe('current');
  const next = projectTransition(s, { type: 'transfer', caseInput: 'The seat count is a negative integer.', prediction: 'The function returns false.', reasoning: 'A negative number does not satisfy the positive condition.', assistance: 'No additional help was used for this case.' });
  expect(pathStepState(next.attempt!, 5, 'current')).toBe('recorded');
 });
 it('keeps the baseline prediction recorded while source-dependent prior activities lose current styling', () => {
  const a = reflected().attempt!;
  for (const freshness of ['changed', 'unknown'] as const) {
   expect(pathStepState(a, 0, freshness)).toBe('recorded');
   expect(pathStepState(a, 1, freshness)).toBe('historical');
   expect(pathStepState(a, 3, freshness)).toBe('historical');
   expect(pathStepState(a, 5, freshness)).toBe('current');
  }
  expect(a.prediction?.sourceHash).toBe(source.sourceHash);
 });
});
