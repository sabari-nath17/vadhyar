import { expect, it } from 'vitest';
import { hash } from '../src/extension/source.js';
import { snapshotIdentity } from '../src/project/model.js';
import { decisionChange, validateProjectRelationships } from '../src/project/topics.js';
const files = [
 { path: 'src/decision.ts', content: 'export function decide(n: number) {\n return n > 0;\n}\n', hash: '' },
 { path: 'src/use.ts', content: "import { decide } from './decision.js';\nexport function use() { return decide(1); }\n", hash: '' },
 { path: 'src/other.ts', content: 'export function other() { return false; }\n', hash: '' },
].map(file => ({ ...file, hash: hash(file.content) }));
const snapshot = { id: snapshotIdentity(files), files, capturedAt: new Date().toISOString(), omitted: [] };
const node = (id: string, label: string, path: string, line = 1) => ({ id, label, source_file: path, source_location: `L${line}`, file_type: 'code', _origin: 'ast' });
const edge = (source: string, target: string, relation: string, line = 2, confidence = 'EXTRACTED') => ({ source, target, relation, confidence, source_file: 'src/use.ts', source_location: `L${line}`, _origin: 'ast' });
const graph = { nodes: [node('decision', 'decide()', files[0].path), node('use', 'use()', files[1].path, 2), node('other', 'other()', files[2].path)], edges: [edge('use', 'decision', 'calls'), edge('use', 'other', 'contains'), edge('use', 'decision', 'indirect_call', 2, 'INFERRED')], hyperedges: [], input_tokens: 0, output_tokens: 0 };
it('accepts only extracted static dependency evidence and never turns containment or inferred edges into callers', () => {
 const evidence = validateProjectRelationships(graph, snapshot);
 expect(evidence.links).toEqual([{ fromPath: 'src/use.ts', fromSymbol: 'use()', toPath: 'src/decision.ts', toSymbol: 'decide()', line: 2, relation: 'calls' }]);
 expect(evidence.inferredEdges).toBe(1); expect(evidence.files).toEqual(files.map(file => file.path).sort());
 for (const invalid of [ { ...graph, nodes: [...graph.nodes, graph.nodes[0]] }, { ...graph, nodes: [{ ...graph.nodes[0], source_file: '../private.ts' }] }, { ...graph, edges: [edge('use', 'missing', 'calls')] }, { ...graph, edges: [edge('use', 'decision', 'calls', 100)] }, { ...graph, nodes: [{ ...graph.nodes[0], label: 'invented()' }, ...graph.nodes.slice(1)] } ]) expect(() => validateProjectRelationships(invalid, snapshot)).toThrow();
});
it('labels a reviewed decision separately from the real before/after changed span', () => {
 const baselineFiles = [{ ...files[0], content: files[0].content.replace('> 0', '>= 0') }, ...files.slice(1)].map(file => ({ ...file, hash: hash(file.content) }));
 const before = { ...snapshot, id: snapshotIdentity(baselineFiles), files: baselineFiles };
 expect(decisionChange(before, snapshot, { path: files[0].path, line: 2, code: ' return n > 0;' })).toBe('changed-span');
 expect(decisionChange(before, snapshot, { path: files[0].path, line: 1, code: 'export function decide(n: number) {' })).toBe('current-only');
 expect(decisionChange(snapshot, snapshot, null)).toBe('current-only');
});
