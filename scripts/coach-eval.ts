import { explain, previewContext, previewHint, requestHint, validateExplanation, validateHint } from '../src/extension/coach.js';
import { approvalReference, hash } from '../src/extension/source.js';
import type { Counterexample, Hint } from '../src/shared.js';

// Synthetic, intentionally flawed source; no learner workspace or API credentials enter reports.
const content = "export function canApproveMilestone(actor: { role: string; id: string }, milestone: { ownerClientId: string }) {\n  return actor.role === 'client';\n}\n";
const source = { path: 'src/approval.ts', absolutePath: '/synthetic/src/approval.ts', content, hash: hash(content) };
const refs = [approvalReference(source)];
const envelope = (value: unknown) => ({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(value) }] }] });

export default class CoachEvalProvider {
  id() { return 'vadhyar-production-coach'; }
  async callApi(_prompt: string, context?: { vars?: Record<string, unknown> }) {
    const kind = String(context?.vars?.kind ?? 'explain');
    if (kind.startsWith('validator-')) {
      try {
        if (kind === 'validator-citation') validateExplanation(envelope({ summary: 'Fixture', steps: [{ title: 'Fixture', text: 'Fixture', sourceRefId: 'invented' }] }), refs);
        else if (kind === 'validator-fix') validateHint(envelope({ level: 1, text: "return actor.id === milestone.ownerClientId;", sourceRefId: refs[0].id }), refs, 1);
        else if (kind === 'validator-verdict') validateExplanation(envelope({ summary: 'All tests passed. The feature is verified.', steps: [{ title: 'Fixture', text: 'Fixture', sourceRefId: refs[0].id }] }), refs);
        else if (kind === 'validator-incomplete') validateExplanation({ status: 'incomplete', output: [] }, refs);
        else if (kind === 'validator-level') validateHint(envelope({ level: 3, text: 'Inspect the values supplied to the decision.', sourceRefId: refs[0].id }), refs, 1);
        else if (kind === 'validator-conceptual') validateHint(envelope({ level: 1, text: 'What identifies the owner of this milestone?', sourceRefId: refs[0].id }), refs, 1);
        else return { error: 'Unknown validator fixture.' };
        return { output: { kind, rejected: false }, metadata: { mode: 'synthetic-validator', humanReview: 'not performed' } };
      } catch { return { output: { kind, rejected: true }, metadata: { mode: 'synthetic-validator', humanReview: 'not performed' } }; }
    }
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.VADHYAR_EVAL_MODEL;
    if (!apiKey || !model) return { error: 'Live evaluation requires OPENAI_API_KEY and VADHYAR_EVAL_MODEL in the process environment. No request was made.' };
    const text = `Only the owning client may approve.\n${String(context?.vars?.input ?? '')}`;
    const requirement = { path: 'vadhyar-requirement.md', absolutePath: '/synthetic/vadhyar-requirement.md', content: text, hash: hash(text) };
    try {
      if (kind === 'explain') {
        const preview = previewContext(model, requirement, source, { sourceHash: source.hash, refs, relationships: [] });
        const result = await explain(apiKey, preview, refs, AbortSignal.timeout(65_000));
        return { output: result.explanation, metadata: { mode: 'live-production-coach', model: result.model, responseId: result.responseId, humanReview: 'pending' } };
      }
      if (kind !== 'hint') return { error: 'Unknown evaluation operation.' };
      const level = Number(context?.vars?.level ?? 1);
      if (![1, 2, 3].includes(level)) return { error: 'Unsupported hint level.' };
      const at = '2026-10-11T00:00:00.000Z';
      const prediction = { id: '526f0aad-37ef-4fa4-82a8-cd6c56a35542', savedAt: at, predictedApproval: false, reasoning: String(context?.vars?.input ?? 'Only the owner may approve.'), sourceHash: source.hash, requirementRevision: requirement.hash };
      const observed: Counterexample = { id: 'cf52e02d-2a29-4169-a044-72b88b3950bf', predictionId: prediction.id, caseId: 'other-client-active', startedAt: at, finishedAt: at, latencyMs: 1, sourceHash: source.hash, requirementRevision: requirement.hash, vitestVersion: '5.0.3', kind: 'completed', observedApproval: true, requirementPassed: false, exitCode: 1, executedCases: 1, skippedCases: 2 };
      const previous: Hint[] = ['Does a client role identify the owner?', 'Trace the actor and milestone identity fields.'].slice(0, level - 1).map((text, index) => ({ level: index + 1, text, sourceRefId: refs[0].id }));
      const preview = previewHint(model, requirement, source, refs, prediction, observed, previous);
      const result = await requestHint(apiKey, preview, refs, level, AbortSignal.timeout(65_000));
      return { output: result.hint, metadata: { mode: 'live-production-coach', model: result.model, responseId: result.responseId, humanReview: 'pending' } };
    } catch {
      return { error: 'Production coach rejected the request or response. Review account access and the fixture; no passing output was fabricated.' };
    }
  }
}
