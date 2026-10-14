import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createCodebaseKnowledge } from './src/source-knowledge.js';
import { codebaseKnowledgeSchema, knowledgeSelectionSchema } from './src/knowledge-types.js';
import type { SourceSnapshot } from './src/project-types.js';

const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const projectId = hash('knowledge-test-project');
function snapshot(path: string, text: string, startLine = 1): SourceSnapshot {
 return { projectId, fileId: hash(path), path, language: path.endsWith('.py') ? 'Python' : 'TypeScript', startLine, endLine: text ? startLine + text.split('\n').length - 1 : 0, sourceHash: hash(text), text, truncated: startLine > 1, capturedAt: '2026-10-14T14:00:00.000Z', fileBytes: Buffer.byteLength(text) };
}
function selectedSources() {
 return [
  snapshot('src/entry.ts', 'import { helper as renamed } from "./helper.js";\nexport { type Details } from "./types";\nexport function entry() { return renamed(); }'),
  snapshot('src/helper.ts', 'export function helper() { return true; }'),
  snapshot('src/types.ts', 'export interface Details { id: string }'),
 ];
}

describe('selected-source codebase knowledge backend', () => {
 it('connects real alias imports and re-exports to selected files without inventing cross-file calls', () => {
  const sources = selectedSources(), result = createCodebaseKnowledge(sources);
  expect(result.projectId).toBe(projectId);
  expect(result.analysisVersion).toBe(1);
  expect(result.relationships).toEqual([
   { from: sources[0].fileId, to: sources[1].fileId, kind: 'imports', line: 1 },
   { from: sources[0].fileId, to: sources[2].fileId, kind: 're-exports', line: 2 },
  ]);
  expect(result.order).toEqual(sources.map(source => source.fileId));
  expect(result.files.map(file => file.path)).toEqual(sources.map(source => source.path));
  expect(result.files.every(file => file.unresolvedModuleReferences === 0)).toBe(true);
  expect(result.files[0].relationships).toEqual([]);
  expect(codebaseKnowledgeSchema.safeParse(result).success).toBe(true);
  expect(result.limits.length).toBeGreaterThan(0);
 });

 it('orders the entry before imported support while retaining cycles and disconnected selections', () => {
  const sources = [
   snapshot('src/entry.ts', 'import "./a";\nexport function entry() {}'),
   snapshot('src/a.ts', 'import "./b";\nexport function a() {}'),
   snapshot('src/isolated.ts', 'export function isolated() {}'),
   snapshot('src/b.ts', 'import "./entry";\nexport function b() {}'),
  ];
  const result = createCodebaseKnowledge(sources);
  expect(result.order).toEqual([sources[0].fileId, sources[1].fileId, sources[3].fileId, sources[2].fileId]);
  expect(new Set(result.order).size).toBe(sources.length);
  expect(result.relationships).toHaveLength(3);
 });

 it('anchors file relationships and local concepts to the actual captured offsets and identities', () => {
  const sources = [snapshot('src/entry.ts', 'import "./helper";\nexport function entry() {}', 20), snapshot('src/helper.ts', 'export function helper() {}', 60)];
  const result = createCodebaseKnowledge(sources);
  expect(result.relationships).toEqual([{ from: sources[0].fileId, to: sources[1].fileId, kind: 'imports', line: 20 }]);
  expect(result.files[0]).toMatchObject({ path: sources[0].path, fileId: sources[0].fileId, sourceHash: sources[0].sourceHash, startLine: 20, endLine: 21, truncated: true, capturedAt: sources[0].capturedAt, fileBytes: sources[0].fileBytes });
  expect(result.files[0].concepts[0]).toMatchObject({ name: 'entry', startLine: 21, endLine: 21 });
  expect(result.files[1].concepts[0]).toMatchObject({ name: 'helper', startLine: 60, endLine: 60 });
 });

 it('does not resolve external, unselected, dynamic, require, comment or string references as file edges', () => {
  const sources = [
   snapshot('src/entry.ts', 'import { helper } from "./helper";\nimport "zod";\nexport * from "../not-selected";\nconst text = "import from ./helper";\n// import "./helper";\nexport const run = () => import("./helper");\nconst loader = require("./helper");'),
   snapshot('src/helper.ts', 'export function helper() {}'),
  ];
  const result = createCodebaseKnowledge(sources);
  expect(result.relationships).toEqual([{ from: sources[0].fileId, to: sources[1].fileId, kind: 'imports', line: 1 }]);
  expect(result.files[0].unresolvedModuleReferences).toBe(2);
 });

 it('resolves selected JavaScript-to-TypeScript and directory-index paths but leaves ambiguous imports unknown', () => {
  const sources = [
   snapshot('src/entry.ts', 'import "./helper.js";\nexport * from "./dir";\nimport "./ambiguous";'),
   snapshot('src/helper.ts', 'export function helper() {}'),
   snapshot('src/dir/index.ts', 'export function index() {}'),
   snapshot('src/ambiguous.ts', 'export function value() {}'),
   snapshot('src/ambiguous.js', 'export function value() {}'),
  ];
  const result = createCodebaseKnowledge(sources);
  expect(result.relationships).toEqual([
   { from: sources[0].fileId, to: sources[1].fileId, kind: 'imports', line: 1 },
   { from: sources[0].fileId, to: sources[2].fileId, kind: 're-exports', line: 2 },
  ]);
  expect(result.files[0].unresolvedModuleReferences).toBe(1);
 });

 it('keeps a malformed selected candidate in ambiguity checks instead of linking the remaining valid file', () => {
  const sources = [
   snapshot('src/entry.ts', 'import "./helper.js";\nexport function entry() {}'),
   snapshot('src/helper.ts', 'export function incomplete() {'),
   snapshot('src/helper.js', 'export function helper() {}'),
  ];
  const result = createCodebaseKnowledge(sources);
  expect(result.files.map(file => file.status)).toEqual(['ready', 'invalid', 'ready']);
  expect(result.relationships).toEqual([]);
  expect(result.files[0].unresolvedModuleReferences).toBe(1);
 });

 it('keeps unsupported, malformed, declaration-free and empty files distinct and emits no parsed edges from them', () => {
  const sources = [
   snapshot('src/entry.ts', 'import "./helper";\nexport function incomplete() {'),
   snapshot('src/helper.ts', 'export function helper() {}'),
   snapshot('src/script.py', 'def helper():\n return 1'),
   snapshot('src/side-effect.ts', 'console.log("captured source");'),
   snapshot('src/empty.ts', ''),
  ];
  const result = createCodebaseKnowledge(sources);
  expect(result.files.map(file => file.status)).toEqual(['invalid', 'ready', 'unsupported', 'empty', 'empty']);
  expect(result.relationships).toEqual([]);
  expect(result.files[4]).toMatchObject({ startLine: 1, endLine: 0, concepts: [], relationships: [], order: [] });
  expect(result.order).toEqual(sources.map(source => source.fileId));
 });

 it('keeps same-named declarations and concept IDs scoped to each selected file', () => {
  const sources = [snapshot('src/a.ts', 'export function shared() {}'), snapshot('src/b.ts', 'export function shared() {}')];
  const result = createCodebaseKnowledge(sources);
  expect(result.files.map(file => file.concepts.map(concept => [concept.id, concept.name]))).toEqual([[['concept-0', 'shared']], [['concept-0', 'shared']]]);
  expect(result.files.map(file => file.fileId)).toEqual(sources.map(source => source.fileId));
  expect(result.relationships).toEqual([]);
 });

 it('retains the per-file five-concept bound and declares omissions', () => {
  const result = createCodebaseKnowledge([snapshot('src/entry.ts', Array.from({ length: 8 }, (_, index) => `export function f${index}() { return ${index}; }`).join('\n'))]);
  expect(result.files[0].concepts).toHaveLength(5);
  expect(result.files[0].order).toHaveLength(5);
  expect(result.files[0].omittedConcepts).toBe(3);
 });

 it('hashes selected source identities deterministically while excluding capture and generation timestamps', () => {
  const sources = selectedSources(), first = createCodebaseKnowledge(sources);
  const recaptured = createCodebaseKnowledge(sources.map(source => ({ ...source, capturedAt: '2026-10-14T15:00:00.000Z' })));
  expect(first.knowledgeId).toMatch(/^[a-f0-9]{64}$/);
  expect(recaptured.knowledgeId).toBe(first.knowledgeId);
  expect(createCodebaseKnowledge(sources).knowledgeId).toBe(first.knowledgeId);
  expect(createCodebaseKnowledge([{ ...sources[0], sourceHash: hash('changed full file identity') }, ...sources.slice(1)]).knowledgeId).not.toBe(first.knowledgeId);
  expect(createCodebaseKnowledge([sources[1], sources[0], sources[2]]).knowledgeId).not.toBe(first.knowledgeId);
  expect(createCodebaseKnowledge(sources.slice(0, 2)).knowledgeId).not.toBe(first.knowledgeId);
  expect(createCodebaseKnowledge([{ ...sources[0], startLine: 20, endLine: 22, truncated: true }, ...sources.slice(1)]).knowledgeId).not.toBe(first.knowledgeId);
  expect(createCodebaseKnowledge([{ ...sources[0], truncated: true }, ...sources.slice(1)]).knowledgeId).not.toBe(first.knowledgeId);
 });

 it('binds the knowledge identity to its project even when selected file and source pins match', () => {
  const sources = selectedSources(), original = createCodebaseKnowledge(sources);
  const otherProject = createCodebaseKnowledge(sources.map(source => ({ ...source, projectId: hash('other knowledge project') })));
  expect(otherProject.files.map(({ fileId, sourceHash, startLine, endLine }) => ({ fileId, sourceHash, startLine, endLine }))).toEqual(original.files.map(({ fileId, sourceHash, startLine, endLine }) => ({ fileId, sourceHash, startLine, endLine })));
  expect(otherProject.knowledgeId).not.toBe(original.knowledgeId);
 });

 it('rejects zero or excess selections, foreign projects, duplicate identities or paths, and malformed source', () => {
  const sources = selectedSources();
  const invalidInputs: unknown[][] = [
   [], Array.from({ length: 6 }, (_, index) => snapshot(`src/${index}.ts`, 'export function x() {}')),
   [sources[0], { ...sources[1], projectId: hash('foreign project') }],
   [sources[0], { ...sources[1], fileId: sources[0].fileId }],
   [sources[0], { ...sources[1], path: sources[0].path }],
   [{ ...sources[0], sourceHash: 'invalid' }],
   [{ ...sources[0], startLine: 20, endLine: 19 }],
   [{ ...sources[0], text: 'x'.repeat(40_001) }],
  ];
  for (const inputs of invalidInputs) expect(() => createCodebaseKnowledge(inputs)).toThrow();
 });

 it('enforces the 160-line capture bound and accepts only a legitimate empty-file range', () => {
  const atLastLine = (lines: number) => snapshot('src/entry.ts', [...Array.from({ length: lines - 1 }, () => '// saved source line'), 'export function atEnd() {}'].join('\n'));
  const bounded = createCodebaseKnowledge([atLastLine(160)]);
  expect(bounded.files[0].concepts[0]).toMatchObject({ name: 'atEnd', startLine: 160, endLine: 160 });
  for (const lines of [161, 181]) expect(() => createCodebaseKnowledge([atLastLine(lines)])).toThrow();
  expect(codebaseKnowledgeSchema.safeParse({ ...bounded, files: [{ ...bounded.files[0], endLine: 161 }] }).success).toBe(false);

  const empty = snapshot('src/empty.ts', ''), emptyResult = createCodebaseKnowledge([empty]);
  expect(emptyResult.files[0]).toMatchObject({ status: 'empty', startLine: 1, endLine: 0, fileBytes: 0 });
  for (const invalid of [{ ...empty, fileBytes: 1 }, { ...empty, startLine: 2, endLine: 1 }, { ...empty, startLine: 2, endLine: 0 }]) expect(() => createCodebaseKnowledge([invalid])).toThrow();
  expect(codebaseKnowledgeSchema.safeParse({ ...emptyResult, files: [{ ...emptyResult.files[0], fileBytes: 1 }] }).success).toBe(false);
  expect(codebaseKnowledgeSchema.safeParse({ ...emptyResult, files: [{ ...emptyResult.files[0], startLine: 2, endLine: 1 }] }).success).toBe(false);
 });

 it('accepts only bounded unique host-issued source selections without browser-chosen paths or commands', () => {
  const selection = selectedSources().map(({ fileId, sourceHash, startLine }) => ({ fileId, sourceHash, startLine }));
  expect(knowledgeSelectionSchema.safeParse(selection).success).toBe(true);
  const invalidSelections = [
   [], Array.from({ length: 6 }, (_, index) => ({ ...selection[0], fileId: hash(`selection-${index}`) })),
   { files: selection }, [selection[0], selection[0]],
   [{ ...selection[0], path: '../unselected.ts' }], [{ ...selection[0], command: 'run' }],
   [{ ...selection[0], fileId: 'invalid' }], [{ ...selection[0], sourceHash: 'invalid' }],
   [{ ...selection[0], startLine: 0 }], [{ ...selection[0], startLine: 1.5 }], [{ ...selection[0], startLine: 1_000_000_000 }],
  ];
  for (const invalid of invalidSelections) expect(knowledgeSelectionSchema.safeParse(invalid).success).toBe(false);
 });

 it('rejects output identity, ordering and originating-line inconsistencies at the response boundary', () => {
  const result = createCodebaseKnowledge(selectedSources());
  const invalidResults = [
   { ...result, command: 'run' },
   { ...result, files: [{ ...result.files[0], projectId: hash('foreign project') }, ...result.files.slice(1)] },
   { ...result, files: [{ ...result.files[0] }, { ...result.files[1], fileId: result.files[0].fileId }, result.files[2]] },
   { ...result, files: [{ ...result.files[0] }, { ...result.files[1], path: result.files[0].path }, result.files[2]] },
   { ...result, order: result.order.slice(1) },
   { ...result, order: [result.order[0], result.order[0], result.order[2]] },
   { ...result, order: [hash('foreign file'), ...result.order.slice(1)] },
   { ...result, order: [result.order[1], result.order[0], result.order[2]] },
   { ...result, relationships: [{ ...result.relationships[0], from: hash('foreign file') }] },
   { ...result, relationships: [{ ...result.relationships[0], to: hash('foreign file') }] },
   { ...result, relationships: [{ ...result.relationships[0], line: 999 }] },
   { ...result, relationships: [result.relationships[0], result.relationships[0]] },
   { ...result, files: [{ ...result.files[0], concepts: [{ ...result.files[0].concepts[0], endLine: 999 }] }, ...result.files.slice(1)] },
   ...(['invalid', 'unsupported'] as const).map(status => ({ ...result, files: [result.files[0], { ...result.files[1], status, concepts: [], relationships: [], order: [] }, result.files[2]] })),
  ];
  for (const invalid of invalidResults) expect(codebaseKnowledgeSchema.safeParse(invalid).success).toBe(false);
 });
});
