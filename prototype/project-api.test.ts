import { describe, expect, it, vi } from 'vitest';
import { getSourceState, sourceFreshness } from './src/project-api.js';
import type { SourceSnapshot } from './src/project-types.js';

const fileId = 'a'.repeat(64), sourceHash = 'b'.repeat(64);
const source: SourceSnapshot = { fileId, sourceHash, projectId: 'c'.repeat(64), path: 'src/rule.ts', language: 'TypeScript', startLine: 1, endLine: 1, text: 'export const limit = 3;', truncated: false, fileBytes: 23, capturedAt: '2026-10-14T12:00:00.000Z' };

describe('point-in-time selected source state', () => {
 it('distinguishes matching, changed, unavailable and differently bound source identities', () => {
  expect(sourceFreshness(source, { status: 'available', fileId, sourceHash })).toBe('current');
  expect(sourceFreshness(source, { status: 'available', fileId, sourceHash: 'd'.repeat(64) })).toBe('changed');
  expect(sourceFreshness(source, { status: 'unavailable', fileId, sourceHash: null })).toBe('unknown');
  expect(sourceFreshness(source, null)).toBe('unknown');
  expect(sourceFreshness(source, { status: 'available', fileId: 'e'.repeat(64), sourceHash })).toBe('unknown');
 });
 it('validates the host response and does not mistake a failed read for current source', async () => {
  const fetch = vi.spyOn(globalThis, 'fetch');
  try {
   fetch.mockResolvedValue(new Response(JSON.stringify({ status: 'available', fileId, sourceHash }), { status: 200 }));
   expect(await getSourceState(source.projectId, fileId)).toEqual({ status: 'available', fileId, sourceHash });
   expect(fetch.mock.calls[0][0]).toContain(`/source-state?fileId=${fileId}`);
   expect(fetch.mock.calls[0][1]?.method).toBe('GET');
   fetch.mockResolvedValue(new Response(JSON.stringify({ status: 'unavailable', fileId, sourceHash }), { status: 200 }));
   await expect(getSourceState(source.projectId, fileId)).rejects.toThrow();
   fetch.mockResolvedValue(new Response(JSON.stringify({ error: { code: 'source_busy', message: 'Current source cannot be established.' } }), { status: 503 }));
   await expect(getSourceState(source.projectId, fileId)).rejects.toMatchObject({ status: 503, code: 'source_busy' });
   expect(fetch).toHaveBeenCalledTimes(3);
  } finally { fetch.mockRestore(); }
 });
});
