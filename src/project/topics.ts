import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, isAbsolute, join } from 'node:path';
import { promisify } from 'node:util';
import { z } from 'zod';
import { pathSchema, type Group, type ProjectRelationships, type Snapshot } from './shared.js';

const run = promisify(execFile);
const anchor = { source_file: pathSchema, source_location: z.string().regex(/^L[1-9]\d*$/), _origin: z.literal('ast') };
const rawGraph = z.object({
 nodes: z.array(z.object({ ...anchor, id: z.string().min(1).max(128), label: z.string().min(1).max(128), file_type: z.literal('code') })).max(3000),
 edges: z.array(z.object({ ...anchor, source: z.string(), target: z.string(), relation: z.string(), confidence: z.string() })).max(6000),
 hyperedges: z.array(z.unknown()).max(0), input_tokens: z.literal(0), output_tokens: z.literal(0),
});

export function validateProjectRelationships(raw: unknown, snapshot: Snapshot): ProjectRelationships {
 const graph = rawGraph.parse(raw), files = new Map(snapshot.files.map(file => [file.path, file]));
 const nodes = new Map(graph.nodes.map(node => [node.id, node]));
 if (nodes.size !== graph.nodes.length) throw new Error('Duplicate Graphify identity.');
 function line(path: string, location: string) {
   const code = files.get(path)?.content.split('\n')[Number(location.slice(1)) - 1];
   if (code === undefined) throw new Error('Graphify anchor is outside captured source.');
   return code;
 }
 for (const node of graph.nodes) {
   const code = line(node.source_file, node.source_location), symbol = node.label.replace(/\(\)$/, '');
   if (node.label !== basename(node.source_file) && !code.includes(symbol)) throw new Error('Graphify symbol does not match captured source.');
 }
 const links: ProjectRelationships['links'] = [];
 for (const edge of graph.edges) {
   const from = nodes.get(edge.source), to = nodes.get(edge.target);
   if (!from || !to || from.source_file !== edge.source_file) throw new Error('Graphify edge identity is invalid.');
   line(edge.source_file, edge.source_location);
   if (edge.confidence !== 'EXTRACTED' || !['calls', 'imports', 'imports_from'].includes(edge.relation)) continue;
   links.push({ fromPath: from.source_file, fromSymbol: from.label, toPath: to.source_file, toSymbol: to.label, line: Number(edge.source_location.slice(1)), relation: edge.relation as 'calls' | 'imports' | 'imports_from' });
 }
 return { status: 'extracted', snapshot: snapshot.id, version: '0.9.84', extractedAt: new Date().toISOString(), files: [...new Set(graph.nodes.map(node => node.source_file))].sort(), links, inferredEdges: graph.edges.filter(edge => edge.confidence !== 'EXTRACTED').length, reason: '' };
}

export async function extractProjectRelationships(executable: string, storage: string, snapshot: Snapshot, signal?: AbortSignal): Promise<ProjectRelationships> {
 if (!isAbsolute(executable) || executable.includes('\0')) throw new Error('Configure the absolute Graphify 0.9.84 executable.');
 await mkdir(storage, { recursive: true });
 const output = await mkdtemp(join(storage, 'project-graph-')), input = join(output, 'input');
 await mkdir(input); await mkdir(join(output, 'home'));
 for (const file of snapshot.files) {
   pathSchema.parse(file.path);
   const path = join(input, file.path); await mkdir(dirname(path), { recursive: true });
   await writeFile(path, file.content, { flag: 'wx', mode: 0o600 });
 }
 const options = { cwd: output, env: { PATH: '/usr/bin:/bin', HOME: join(output, 'home'), GRAPHIFY_NO_AUTO_REFRESH: '1', PYTHONDONTWRITEBYTECODE: '1' }, timeout: 55_000, maxBuffer: 65_536, signal };
 // shortcut: network denial is macOS-only; verify an equivalent boundary before shipping another platform.
 const command = process.platform === 'darwin' ? '/usr/bin/sandbox-exec' : executable;
 const prefix = process.platform === 'darwin' ? ['-p', '(version 1) (allow default) (deny network*)', executable] : [];
 if ((await run(command, [...prefix, '--version'], { ...options, timeout: 5000 })).stdout.trim() !== 'graphify 0.9.84') throw new Error('Unsupported Graphify version; use 0.9.84.');
 await run(command, [...prefix, 'extract', input, '--code-only', '--no-cluster', '--out', output], options);
 const path = join(output, 'graphify-out/graph.json');
 if ((await stat(path)).size > 2_000_000) throw new Error('Graphify output exceeds the supported limit.');
 return validateProjectRelationships(JSON.parse(await readFile(path, 'utf8')), snapshot);
}

export function decisionChange(before: Snapshot, after: Snapshot, decision: Group['decision']): 'changed-span' | 'current-only' {
 if (!decision) return 'current-only';
 const left = before.files.find(file => file.path === decision.path)?.content.split('\n') ?? [];
 const right = after.files.find(file => file.path === decision.path)?.content.split('\n') ?? [];
 let start = 0, end = 0;
 while (start < left.length && start < right.length && left[start] === right[start]) start++;
 while (end < left.length - start && end < right.length - start && left[left.length - 1 - end] === right[right.length - 1 - end]) end++;
 return decision.line > start && decision.line <= right.length - end ? 'changed-span' : 'current-only';
}
