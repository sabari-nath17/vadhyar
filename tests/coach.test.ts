import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import recorded from './fixtures/graphify-0.9.84.json' with { type: 'json' };
import { validateGraph } from '../src/extension/graphify.js';
import { hash } from '../src/extension/source.js';
import { previewContext, validateExplanation } from '../src/extension/coach.js';

const content = await readFile('novadesk/src/approval.ts', 'utf8');
const source = { path: 'src/approval.ts', absolutePath: '/prepared/src/approval.ts', content, hash: hash(content) };
const reqText = await readFile('novadesk/vadhyar-requirement.md', 'utf8');
const requirement = { path: 'vadhyar-requirement.md', absolutePath: '/prepared/vadhyar-requirement.md', content: reqText, hash: hash(reqText) };
const graph = validateGraph(recorded, source);
const explanation = { summary: 'The current decision checks client role.', steps: [{ title: 'Decision', text: 'Follow the role condition.', sourceRefId: graph.refs[0].id }] };
const response = (value: unknown) => ({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(value) }] }] });

describe('coach transmission and response boundary', () => {
  it('previews only the prepared requirement/source and current IDs; rejects stale or secret-bearing context', () => {
    const preview = previewContext('gpt-6-astra', requirement, source, graph);
    expect(preview.text).toContain(content.replace(/\n/g, '\\n').replace(/"/g, '\\"'));
    expect(preview.text).not.toContain('ownership.test');
    expect(preview.identity).not.toBe(previewContext('different-model', requirement, source, graph).identity);
    expect(() => previewContext('gpt-6-astra', requirement, source, { ...graph, sourceHash: '0'.repeat(64) })).toThrow();
    const secret = { ...source, content: "const apiKey = 'sk-FAKEONLY12345678901234567890';" };
    secret.hash = hash(secret.content);
    expect(() => previewContext('gpt-6-astra', requirement, secret, { ...graph, sourceHash: secret.hash, refs: [] })).toThrow(/secret/i);
  });
  it('accepts structured grounded text and rejects refusal, incomplete, unknown IDs and executable fields', () => {
    expect(validateExplanation(response(explanation), graph.refs)).toEqual(explanation);
    expect(() => validateExplanation(response({ ...explanation, command: 'run something' }), graph.refs)).toThrow();
    expect(() => validateExplanation(response({ ...explanation, steps: [{ ...explanation.steps[0], sourceRefId: 'invented' }] }), graph.refs)).toThrow(/reference/i);
    expect(() => validateExplanation({ status: 'incomplete', output: [] }, graph.refs)).toThrow(/incomplete/i);
    expect(() => validateExplanation({ status: 'completed', output: [{ type: 'message', content: [{ type: 'refusal', refusal: 'no' }] }] }, graph.refs)).toThrow(/refus/i);
    expect(() => validateExplanation(response('not an object'), graph.refs)).toThrow();
  });
});
