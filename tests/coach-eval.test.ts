import { afterEach, expect, it, vi } from 'vitest';
import CoachEvalProvider from '../scripts/coach-eval.js';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

it('runs synthetic validator cases and fails explicitly when live credentials are absent', async () => {
  vi.stubEnv('OPENAI_API_KEY', ''); vi.stubEnv('VADHYAR_EVAL_MODEL', '');
  const provider = new CoachEvalProvider();
  for (const kind of ['validator-citation', 'validator-fix', 'validator-verdict', 'validator-incomplete', 'validator-level', 'validator-conceptual']) {
    expect((await provider.callApi('', { vars: { kind } })).output).toEqual({ kind, rejected: kind !== 'validator-conceptual' });
  }
  expect((await provider.callApi('', { vars: { kind: 'explain' } })).error).toMatch(/No request/);
});

it('uses production request builders and validators for explanations and progressive hints (mock HTTP)', async () => {
  vi.stubEnv('OPENAI_API_KEY', 'synthetic-eval-key-not-a-credential'); vi.stubEnv('VADHYAR_EVAL_MODEL', 'fixture-model');
  const requests: { input: { content: string }[]; model: string; text: { format: { name: string } } }[] = [];
  vi.stubGlobal('fetch', vi.fn(async (_url: unknown, init: RequestInit) => {
    const body = JSON.parse(String(init.body)); requests.push(body);
    const context = JSON.parse(body.input[1].content);
    const id = context.references[0].id;
    const value = body.text.format.name === 'progressive_hint'
      ? { level: context.hintLevel, text: 'Trace the identity values supplied to this decision.', sourceRefId: id }
      : { summary: 'The current client role check does not identify ownership.', steps: [{ title: 'Role', text: 'Inspect the role check.', sourceRefId: id }] };
    return new Response(JSON.stringify({ id: 'synthetic-response', model: body.model, status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(value) }] }] }), { headers: { 'content-type': 'application/json' } });
  }));
  const provider = new CoachEvalProvider();
  expect((await provider.callApi('', { vars: { kind: 'explain' } })).error).toBeUndefined();
  expect((await provider.callApi('', { vars: { kind: 'hint', level: 3 } })).error).toBeUndefined();
  expect(requests.map(item => item.text.format.name)).toEqual(['source_explanation', 'progressive_hint']);
  expect(requests.every(item => item.model === 'fixture-model')).toBe(true);
  expect(requests[1].input[0].content).toContain('hint level 3');
  expect(JSON.parse(requests[1].input[1].content).previousHints).toHaveLength(2);
});

it.each(['api-error', 'invalid-output'])('keeps %s as a failed evaluation without passing output (mock HTTP)', async kind => {
  vi.stubEnv('OPENAI_API_KEY', 'synthetic-eval-key-not-a-credential'); vi.stubEnv('VADHYAR_EVAL_MODEL', 'fixture-model');
  vi.stubGlobal('fetch', vi.fn(async () => kind === 'api-error'
    ? new Response(JSON.stringify({ error: { message: 'synthetic failure' } }), { status: 503, headers: { 'content-type': 'application/json' } })
    : new Response(JSON.stringify({ id: 'synthetic-response', model: 'fixture-model', status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: '{invalid' }] }] }), { headers: { 'content-type': 'application/json' } })));
  const provider = new CoachEvalProvider();
  for (const operation of ['explain', 'hint']) {
    const result = await provider.callApi('', { vars: { kind: operation } });
    expect(result.error).toMatch(/no passing output was fabricated/);
    expect(result).not.toHaveProperty('output');
  }
});
