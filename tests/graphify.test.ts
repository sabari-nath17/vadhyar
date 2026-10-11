import { existsSync, readFileSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { extractGraph, validateGraph } from '../src/extension/graphify.js';
import { hash } from '../src/extension/source.js';
import raw from './fixtures/graphify-0.9.84.json' with { type: 'json' };

const content = readFileSync(new URL('../novadesk/src/approval.ts', import.meta.url), 'utf8');
const source = { path: 'src/approval.ts', absolutePath: '/prepared/src/approval.ts', content, hash: hash(content) };

it('validates the actual no-cluster 0.9.84 shape and selects grounded entrypoint references', () => {
  const graph = validateGraph(raw, source);
  expect(graph.refs[0].symbol).toBe('canApproveMilestone');
  expect(graph.refs).toHaveLength(4);
  expect(graph.relationships).toHaveLength(3);
  expect(graph.relationships.every(edge => edge.provenance === 'AST-extracted')).toBe(true);
});
it('rejects foreign paths, unknown edges, invalid spans and unsupported provenance', () => {
  expect(() => validateGraph({ ...raw, nodes: raw.nodes.map(node => ({ ...node, source_file: '../secret.ts' })) }, source)).toThrow();
  expect(() => validateGraph({ ...raw, edges: [{ ...raw.edges[0], target: 'invented' }] }, source)).toThrow();
  expect(() => validateGraph({ ...raw, nodes: raw.nodes.map(node => ({ ...node, source_location: 'L999' })) }, source)).toThrow();
  expect(() => validateGraph({ ...raw, edges: [{ ...raw.edges[0], confidence: 'INFERRED' }] }, source)).toThrow();
});

it('requires an absolute Graphify executable and reports a missing prerequisite without fabricating a graph', async () => {
  const base = await mkdtemp(join(tmpdir(), 'vadhyar-graphify-path-'));
  try {
    await expect(extractGraph('graphify', join(base, 'relative'), source)).rejects.toThrow(/absolute/);
    expect(existsSync(join(base, 'relative'))).toBe(false);
    await expect(extractGraph(join(base, 'missing'), join(base, 'missing-output'), source)).rejects.toThrow(/vadhyar.graphifyPath/);
  } finally { await rm(base, { recursive: true, force: true }); }
});
