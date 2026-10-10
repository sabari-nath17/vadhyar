import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { z } from 'zod';
import { hash, type PreparedFile } from './source.js';
import type { GraphEvidence, SourceRef } from '../shared.js';

const run = promisify(execFile);
const rawGraph = z.object({
  nodes: z.array(z.object({ id: z.string().min(1).max(128), label: z.string().min(1).max(128), file_type: z.literal('code'), source_file: z.literal('approval.ts'), source_location: z.string().regex(/^L[1-9]\d*$/), _origin: z.literal('ast') })).min(1).max(200),
  edges: z.array(z.object({ source: z.string(), target: z.string(), relation: z.literal('contains'), confidence: z.literal('EXTRACTED'), source_file: z.literal('approval.ts'), source_location: z.string().regex(/^L[1-9]\d*$/), _origin: z.literal('ast') })).max(400),
  hyperedges: z.array(z.unknown()).max(0), input_tokens: z.literal(0), output_tokens: z.literal(0),
});

export function validateGraph(raw: unknown, source: PreparedFile): GraphEvidence {
  const graph = rawGraph.parse(raw);
  const lines = source.content.trimEnd().split('\n');
  const ids = new Set(graph.nodes.map(node => node.id));
  if (ids.size !== graph.nodes.length) throw new Error('Duplicate Graphify node identity.');
  for (const node of graph.nodes) {
    const line = Number(node.source_location.slice(1));
    const symbol = node.label.replace(/\(\)$/, '');
    if (line > lines.length || (node.label !== 'approval.ts' && (!/^[A-Za-z_$][\w$]*$/.test(symbol) || !lines[line - 1].includes(symbol)))) throw new Error('Graphify source anchor is invalid.');
  }
  for (const edge of graph.edges) {
    if (!ids.has(edge.source) || !ids.has(edge.target) || Number(edge.source_location.slice(1)) > lines.length) throw new Error('Graphify edge identity is invalid.');
  }
  const entry = graph.nodes.find(node => node.label === 'canApproveMilestone()');
  if (!entry) throw new Error('Graphify approval entrypoint is missing.');
  const selected = [entry.id];
  for (let cursor = 0; cursor < selected.length && selected.length < 5; cursor++) {
    for (const edge of graph.edges) {
      const neighbor = edge.source === selected[cursor] ? edge.target : edge.target === selected[cursor] ? edge.source : undefined;
      if (neighbor && !selected.includes(neighbor) && selected.length < 5) selected.push(neighbor);
    }
  }
  const refs: SourceRef[] = selected.map((id, index) => {
    const node = graph.nodes.find(item => item.id === id)!;
    const startLine = Number(node.source_location.slice(1));
    const next = graph.nodes.map(item => Number(item.source_location.slice(1))).filter(line => line > startLine).sort((a, b) => a - b)[0];
    return { id: `graph-${source.hash}-${index}`, path: source.path, startLine, endLine: node.label === 'approval.ts' ? lines.length : (next ? next - 1 : lines.length), symbol: node.label.replace(/\(\)$/, ''), hash: source.hash };
  });
  const refId = (id: string) => refs[selected.indexOf(id)].id;
  return {
    version: '0.9.84', identity: hash(source.hash + JSON.stringify(graph)), sourceHash: source.hash, extractedAt: new Date().toISOString(), refs,
    relationships: graph.edges.filter(edge => selected.includes(edge.source) && selected.includes(edge.target)).map(edge => ({ sourceId: refId(edge.source), targetId: refId(edge.target), relation: edge.relation, provenance: 'AST-extracted' })),
  };
}

export async function extractGraph(executable: string, storage: string, source: PreparedFile): Promise<GraphEvidence> {
  await mkdir(storage, { recursive: true });
  const output = await mkdtemp(join(storage, 'graph-'));
  const input = join(output, 'input');
  await mkdir(input); await mkdir(join(output, 'home'));
  await writeFile(join(input, 'approval.ts'), source.content, { flag: 'wx', mode: 0o600 });
  const options = { cwd: output, env: { PATH: '/usr/bin:/bin', HOME: join(output, 'home'), GRAPHIFY_NO_AUTO_REFRESH: '1' }, timeout: 60_000, maxBuffer: 65_536 };
  try {
    const version = await run(executable, ['--version'], options);
    if (version.stdout.trim() !== 'graphify 0.9.84') throw new Error('version');
    await run(executable, ['extract', input, '--code-only', '--no-cluster', '--out', output], options);
  } catch { throw new Error('Graphify extraction failed. Install isolated graphifyy==0.9.84; check the pinned executable and timeout.'); }
  const file = join(output, 'graphify-out/graph.json');
  if ((await stat(file)).size > 500_000) throw new Error('Graphify output exceeds the supported size.');
  return validateGraph(JSON.parse(await readFile(file, 'utf8')), source);
}
