import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getSelectedKnowledge } from './src/knowledge-api.js';
import { createCodebaseKnowledge } from './src/source-knowledge.js';

const text = 'export function owns() { return true; }';
const source = { projectId: 'a'.repeat(64), fileId: 'b'.repeat(64), path: 'src/rule.ts', sourceHash: createHash('sha256').update(text).digest('hex'), text, language: 'TypeScript', startLine: 1, endLine: 1, truncated: false, capturedAt: '2026-10-14T12:00:00.000Z', fileBytes: text.length };
const selection = [{ fileId: source.fileId, sourceHash: source.sourceHash, startLine: 1 }];
afterEach(() => vi.unstubAllGlobals());

describe('selected-knowledge browser API boundary', () => {
 it('requests only the exact selected pins through a same-origin GET and validates the response', async () => {
  const knowledge = createCodebaseKnowledge([source]), fetch = vi.fn(async () => ({ ok: true, json: async () => knowledge }));
  vi.stubGlobal('fetch', fetch);
  expect(await getSelectedKnowledge(source.projectId, selection)).toEqual(knowledge);
  const [url, options] = fetch.mock.calls[0] as unknown as [string, RequestInit];
  expect(JSON.parse(new URL(url, 'http://127.0.0.1').searchParams.get('selection')!)).toEqual(selection);
  expect(options.method).toBe('GET'); expect(options.credentials).toBe('same-origin'); expect(options.body).toBeUndefined();
 });
 it('rejects a valid response belonging to a different source, range or project', async () => {
  const knowledge = createCodebaseKnowledge([source]);
  for (const foreign of [
   { ...knowledge, projectId: 'f'.repeat(64), files: [{ ...knowledge.files[0], projectId: 'f'.repeat(64) }] },
   { ...knowledge, files: [{ ...knowledge.files[0], sourceHash: 'f'.repeat(64) }] },
   createCodebaseKnowledge([{ ...source, startLine: 2, endLine: 2 }]),
  ]) {
   vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => foreign })));
   await expect(getSelectedKnowledge(source.projectId, selection)).rejects.toThrow(/does not match/);
  }
 });
 it('fences a response that completes after its consumer aborted', async () => {
  const knowledge = createCodebaseKnowledge([source]), controller = new AbortController();
  let finish!: (value: unknown) => void;
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: () => new Promise(resolve => { finish = resolve; }) })));
  const pending = getSelectedKnowledge(source.projectId, selection, controller.signal);
  await vi.waitFor(() => expect(finish).toBeTypeOf('function'));
  controller.abort(new Error('selection replaced')); finish(knowledge);
  await expect(pending).rejects.toThrow('selection replaced');
 });
 it('rejects invalid pins before any request and leaves stale errors explicit without retrying', async () => {
  const fetch = vi.fn(async () => ({ ok: false, status: 409, json: async () => ({ error: { code: 'source_changed', message: 'Capture changed source again.' } }) }));
  vi.stubGlobal('fetch', fetch);
  await expect(getSelectedKnowledge(source.projectId, [...selection, ...selection])).rejects.toThrow(); expect(fetch).not.toHaveBeenCalled();
  await expect(getSelectedKnowledge(source.projectId, selection)).rejects.toMatchObject({ status: 409, code: 'source_changed' }); expect(fetch).toHaveBeenCalledTimes(1);
 });
 it('preserves explicit ranges and declaration focus in the request', async () => {
  const text = Array.from({ length: 6 }, (_, index) => `export function action${index}() { return ${index}; }`).join('\n');
  const captured = { ...source, text, endLine: 6, fileBytes: text.length, sourceHash: createHash('sha256').update(text).digest('hex') };
  const pins = [{ fileId: captured.fileId, sourceHash: captured.sourceHash, startLine: 1, lines: 200, focus: 'concept-5' }];
  const knowledge = createCodebaseKnowledge([captured], ['concept-5']), fetch = vi.fn(async () => ({ ok: true, json: async () => knowledge }));
  vi.stubGlobal('fetch', fetch);
  expect((await getSelectedKnowledge(source.projectId, pins)).files[0].order[0]).toBe('concept-5');
  const [url] = fetch.mock.calls[0] as unknown as [string, RequestInit];
  expect(JSON.parse(new URL(url, 'http://127.0.0.1').searchParams.get('selection')!)).toEqual(pins);
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => createCodebaseKnowledge([captured]) })));
  await expect(getSelectedKnowledge(source.projectId, pins)).rejects.toThrow(/does not match/);
 });
 it('allows consistent same-file ranges and rejects mixed revisions or invalid bounds before fetch', async () => {
  const later = { ...source, startLine: 4, endLine: 4, truncated: true }, knowledge = createCodebaseKnowledge([source, later]);
  const pins = [...selection, { ...selection[0], startLine: 4, lines: 1 }], fetch = vi.fn(async () => ({ ok: true, json: async () => knowledge }));
  vi.stubGlobal('fetch', fetch);
  expect((await getSelectedKnowledge(source.projectId, pins)).files.map(file => file.contextId)).toHaveLength(2);
  fetch.mockClear();
  for (const invalid of [[...selection, { ...pins[1], sourceHash: 'f'.repeat(64) }], [{ ...selection[0], lines: 201 }], [{ ...selection[0], focus: 'not-a-declaration' }], [...selection, { ...selection[0], lines: 160 }]]) await expect(getSelectedKnowledge(source.projectId, invalid)).rejects.toThrow();
  expect(fetch).not.toHaveBeenCalled();
 });
 it('rejects a schema-valid response that exceeds the selected capture budget', async () => {
  const captured = { ...source, endLine: 2, text: `${text}\n`, fileBytes: text.length + 1 }, knowledge = createCodebaseKnowledge([captured]);
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => knowledge })));
  await expect(getSelectedKnowledge(source.projectId, [{ ...selection[0], lines: 1 }])).rejects.toThrow(/does not match/);
 });
});
