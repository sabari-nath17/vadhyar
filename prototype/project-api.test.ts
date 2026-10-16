import { describe, expect, it, vi } from 'vitest';
import { getCapturedSource, getSource, getSourceState, sourceFreshness } from './src/project-api.js';
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
 it('preserves the 160-line legacy default while allowing explicit 200-line browsing and captured ranges', async () => {
  const fetch = vi.spyOn(globalThis, 'fetch');
  try {
   fetch.mockImplementation(async input => {
    const startLine = Number(new URL(String(input), 'http://127.0.0.1').searchParams.get('start'));
    return new Response(JSON.stringify({ ...source, startLine, endLine: startLine }), { status: 200 });
   });
   await getSource(source.projectId, fileId);
   expect(new URL(String(fetch.mock.calls[0][0]), 'http://127.0.0.1').searchParams.get('lines')).toBe('160');
   fetch.mockClear();
   await getSource(source.projectId, fileId, 1, 200);
   expect(new URL(String(fetch.mock.calls[0][0]), 'http://127.0.0.1').searchParams.get('lines')).toBe('200');
   fetch.mockClear();
   await getCapturedSource({ ...source, startLine: 20, endLine: 179 });
   const requested = new URL(String(fetch.mock.calls[0][0]), 'http://127.0.0.1').searchParams;
   expect(requested.get('start')).toBe('20');
   expect(requested.get('lines')).toBe('160');
  } finally { fetch.mockRestore(); }
 });
 it('accepts a shorter truncated re-read with a new source hash', async () => {
  const fetch = vi.spyOn(globalThis, 'fetch');
  const historical = { ...source, startLine: 20, endLine: 179 };
  const refreshed = { ...historical, sourceHash: 'd'.repeat(64), endLine: 22, text: 'line 20\nline 21\nline 22', truncated: true };
  try {
   fetch.mockResolvedValue(new Response(JSON.stringify(refreshed), { status: 200 }));
   await expect(getCapturedSource(historical)).resolves.toEqual(refreshed);
  } finally { fetch.mockRestore(); }
 });
 it('accepts an empty-file response with an empty zero-line span', async () => {
  const fetch = vi.spyOn(globalThis, 'fetch');
  const empty = { ...source, endLine: 0, sourceHash: 'd'.repeat(64), text: '', truncated: false, fileBytes: 0 };
  try {
   fetch.mockResolvedValue(new Response(JSON.stringify(empty), { status: 200 }));
   await expect(getSource(source.projectId, fileId)).resolves.toEqual(empty);
  } finally { fetch.mockRestore(); }
 });
 it('rejects shape-valid source responses for another identity, start, or range', async () => {
  const fetch = vi.spyOn(globalThis, 'fetch');
  const requested = { ...source, startLine: 20, endLine: 21 };
  const invalid = [
   { ...requested, projectId: 'e'.repeat(64) },
   { ...requested, fileId: 'f'.repeat(64) },
   { ...requested, startLine: 21, endLine: 21 },
   { ...requested, endLine: 22 },
   { ...requested, endLine: 19 },
   { ...requested, endLine: 18 }
  ];
  try {
   for (const value of invalid) {
    fetch.mockResolvedValueOnce(new Response(JSON.stringify(value), { status: 200 }));
    await expect(getSource(source.projectId, fileId, 20, 2)).rejects.toThrow('The local project service returned source outside the requested selection.');
   }
   expect(fetch).toHaveBeenCalledTimes(invalid.length);
  } finally { fetch.mockRestore(); }
 });
});
