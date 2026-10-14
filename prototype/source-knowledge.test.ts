import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
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
function capture(path: string, fullText: string, startLine = 1, lines = 160): SourceSnapshot {
 const savedLines = fullText.split('\n'); if (savedLines.at(-1) === '') savedLines.pop();
 const text = savedLines.slice(startLine - 1, startLine - 1 + lines).join('\n');
 return { ...snapshot(path, text, startLine), sourceHash: hash(fullText), fileBytes: Buffer.byteLength(fullText), truncated: startLine > 1 || savedLines.length > startLine - 1 + lines };
}

describe('selected-source codebase knowledge backend', () => {
 it('connects real alias imports and re-exports to selected files without inventing cross-file calls', () => {
  const sources = selectedSources(), result = createCodebaseKnowledge(sources);
  expect(result.projectId).toBe(projectId);
  expect(result.analysisVersion).toBe(2);
  expect(result.relationships).toEqual([
   { from: result.files[0].contextId, to: result.files[1].contextId, kind: 'imports', line: 1 },
   { from: result.files[0].contextId, to: result.files[2].contextId, kind: 're-exports', line: 2 },
  ]);
  expect(result.order).toEqual(result.files.map(file => file.contextId));
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
  expect(result.order).toEqual([result.files[0].contextId, result.files[1].contextId, result.files[3].contextId, result.files[2].contextId]);
  expect(new Set(result.order).size).toBe(sources.length);
  expect(result.relationships).toHaveLength(3);
 });

 it('anchors file relationships and local concepts to the actual captured offsets and identities', () => {
  const sources = [snapshot('src/entry.ts', 'import "./helper";\nexport function entry() {}', 20), snapshot('src/helper.ts', 'export function helper() {}', 60)];
  const result = createCodebaseKnowledge(sources);
  expect(result.relationships).toEqual([{ from: result.files[0].contextId, to: result.files[1].contextId, kind: 'imports', line: 20 }]);
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
  expect(result.relationships).toEqual([{ from: result.files[0].contextId, to: result.files[1].contextId, kind: 'imports', line: 1 }]);
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
   { from: result.files[0].contextId, to: result.files[1].contextId, kind: 'imports', line: 1 },
   { from: result.files[0].contextId, to: result.files[2].contextId, kind: 're-exports', line: 2 },
  ]);
  expect(result.files[0].unresolvedModuleReferences).toBe(1);
 });

 it('keeps a malformed selected candidate in ambiguity checks instead of linking the remaining valid file', () => {
  const sources = [
   snapshot('src/entry.ts', 'import "./helper.js";\nexport function entry() {}'),
   snapshot('src/helper.ts', 'export const = ;'),
   snapshot('src/helper.js', 'export function helper() {}'),
  ];
  const result = createCodebaseKnowledge(sources);
  expect(result.files.map(file => file.status)).toEqual(['ready', 'invalid', 'ready']);
  expect(result.relationships).toEqual([]);
  expect(result.files[0].unresolvedModuleReferences).toBe(1);
 });

 it('keeps unsupported, malformed, declaration-free and empty files distinct and emits no parsed edges from them', () => {
  const sources = [
   snapshot('src/entry.ts', 'import "./helper";\nexport const = ;'),
   snapshot('src/helper.ts', 'export function helper() {}'),
   snapshot('src/script.py', 'def helper():\n return 1'),
   snapshot('src/side-effect.ts', 'console.log("captured source");'),
   snapshot('src/empty.ts', ''),
  ];
  const result = createCodebaseKnowledge(sources);
  expect(result.files.map(file => file.status)).toEqual(['invalid', 'ready', 'unsupported', 'empty', 'empty']);
  expect(result.relationships).toEqual([]);
  expect(result.files[4]).toMatchObject({ startLine: 1, endLine: 0, concepts: [], relationships: [], order: [] });
  expect(result.order).toEqual(result.files.map(file => file.contextId));
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
  expect(result.files[0].catalog.map(concept => concept.name)).toEqual(Array.from({ length: 8 }, (_, index) => `f${index}`));
  expect(result.files[0].catalog.every(concept => concept.complete)).toBe(true);
  expect(result.files[0].omittedDeclarations).toBe(0);
 });

 it('keeps distinct captured ranges of one full-file identity separate in context ordering and anchors', () => {
  const text = Array.from({ length: 210 }, (_, index) => index === 29 ? 'export function earlier() {}' : index === 169 ? 'export function later() {}' : '// saved line').join('\n');
  const sources = [capture('src/large.ts', text), capture('src/large.ts', text, 151, 50)], result = createCodebaseKnowledge(sources);
  expect(result.files.map(file => file.fileId)).toEqual([sources[0].fileId, sources[0].fileId]);
  expect(result.files.map(file => file.sourceHash)).toEqual([hash(text), hash(text)]);
  expect(result.files.map(({ startLine, endLine }) => ({ startLine, endLine }))).toEqual([{ startLine: 1, endLine: 160 }, { startLine: 151, endLine: 200 }]);
  expect(result.files[0].contextId).not.toBe(result.files[1].contextId);
  expect(result.order).toEqual(result.files.map(file => file.contextId));
  expect(result.files[0].catalog).toEqual([expect.objectContaining({ name: 'earlier', startLine: 30, endLine: 30, complete: true })]);
  expect(result.files[1].catalog).toEqual([expect.objectContaining({ name: 'later', startLine: 170, endLine: 170, complete: true })]);
  expect(codebaseKnowledgeSchema.safeParse(result).success).toBe(true);
  for (const invalid of [
   [sources[0], sources[0]],
   [sources[0], { ...sources[1], sourceHash: hash('different full file') }],
   [sources[0], { ...sources[1], path: 'src/renamed.ts' }],
  ]) expect(() => createCodebaseKnowledge(invalid)).toThrow();
 });

 it('uses a start-of-file representative context for a unique imported module with several captured ranges', () => {
  const text = Array.from({ length: 180 }, (_, index) => index === 0 ? 'export function first() {}' : index === 169 ? 'export function later() {}' : '// saved line').join('\n');
  const sources = [snapshot('src/entry.ts', 'import "./helper";\nexport function entry() {}'), capture('src/helper.ts', text, 161, 20), capture('src/helper.ts', text)];
  const result = createCodebaseKnowledge(sources);
  expect(result.relationships).toEqual([{ from: result.files[0].contextId, to: result.files[2].contextId, kind: 'imports', line: 1 }]);
  expect(result.files[0].unresolvedModuleReferences).toBe(0);
  expect(new Set(result.files.map(file => file.contextId)).size).toBe(3);
  expect(result.order).toEqual([result.files[0].contextId, result.files[2].contextId, result.files[1].contextId]);
  const fallback = createCodebaseKnowledge([sources[0], sources[1], capture('src/helper.ts', text, 21, 20)]);
  expect(fallback.relationships).toEqual([{ from: fallback.files[0].contextId, to: fallback.files[1].contextId, kind: 'imports', line: 1 }]);
 });

 it('retains individually complete imports in a partial capture while rejecting syntactically malformed import evidence', () => {
  const tail = '\nexport function leaf() {}\nexport function parent() {\n// captured inside parent\nreturn leaf();\n}';
  const target = snapshot('src/helper.ts', 'export function helper() {}');
  const valid = createCodebaseKnowledge([capture('src/entry.ts', 'import "./helper";' + tail, 1, 4), target]);
  expect(valid.files[0].status).toBe('partial'); expect(valid.files[0].relationships).toEqual([]);
  expect(valid.relationships).toEqual([{ from: valid.files[0].contextId, to: valid.files[1].contextId, kind: 'imports', line: 1 }]);
  const malformed = createCodebaseKnowledge([capture('src/entry.ts', 'import { helper from "./helper";' + tail, 1, 4), target]);
  expect(malformed.files[0].status).toBe('partial'); expect(malformed.files[0].relationships).toEqual([]);
  expect(malformed.relationships).toEqual([]);
 });

 it('keeps a real partial lesson capture as declaration metadata and an explicit 200-line capture as complete source', () => {
  const text = readFileSync(new URL('./src/ProjectLesson.tsx', import.meta.url), 'utf8');
  const result = createCodebaseKnowledge([capture('src/ProjectLesson.tsx', text), capture('src/ProjectLesson.tsx', text, 1, 200)]);
  const [partial, complete] = result.files;
  expect(partial.status).toBe('partial'); expect(partial.endLine).toBe(160); expect(partial.truncated).toBe(true);
  expect(partial.catalog).toContainEqual(expect.objectContaining({ name: 'ProjectLesson', complete: false }));
  expect(partial.relationships).toEqual([]);
  expect(complete.status).toBe('ready'); expect(complete.truncated).toBe(false);
  expect(complete.catalog).toContainEqual(expect.objectContaining({ name: 'ProjectLesson', complete: true }));
  expect(complete.catalog.length).toBeGreaterThan(5);
  expect(complete.catalog.some(declaration => declaration.name === 'retryReceipt' && declaration.complete && declaration.scope.includes('ProjectLesson'))).toBe(true);
  expect(complete.fileBytes).toBe(Buffer.byteLength(text));
  expect(partial.sourceHash).toBe(hash(text)); expect(complete.sourceHash).toBe(hash(text));
  expect(partial.contextId).not.toBe(complete.contextId);
  const unfinished = partial.catalog.find(declaration => declaration.name === 'ProjectLesson')!;
  expect(() => createCodebaseKnowledge([capture('src/ProjectLesson.tsx', text)], [unfinished.id])).toThrow();
 });

 it('can focus a complete nested declaration beyond the first five graph concepts while retaining the full catalogue', () => {
  const text = [...Array.from({ length: 7 }, (_, index) => `export function first${index}() { return ${index}; }`), 'export function host() { function nested() { return true; } return nested(); }'].join('\n');
  const source = snapshot('src/nested.ts', text), result = createCodebaseKnowledge([source]), file = result.files[0];
  const nested = file.catalog.find(declaration => declaration.name === 'nested')!;
  expect(nested).toMatchObject({ complete: true, scope: expect.stringContaining('host') });
  expect(file.catalog.length).toBe(9); expect(file.omittedDeclarations).toBe(0);
  expect(file.concepts.some(concept => concept.id === nested.id)).toBe(false);
  const focused = createCodebaseKnowledge([source], [nested.id]);
  expect(focused.files[0].order[0]).toBe(nested.id);
  expect(focused.files[0].concepts).toContainEqual(expect.objectContaining({ id: nested.id, name: 'nested' }));
  expect(focused.files[0].catalog).toEqual(file.catalog);
  expect(focused.files[0].contextId).toBe(file.contextId); expect(focused.knowledgeId).not.toBe(result.knowledgeId);
  expect(() => createCodebaseKnowledge([source], ['concept-9999'])).toThrow();
 });

 it('hashes selected source identities deterministically while excluding capture and generation timestamps', () => {
  const sources = selectedSources(), first = createCodebaseKnowledge(sources);
  const recaptured = createCodebaseKnowledge(sources.map(source => ({ ...source, capturedAt: '2026-10-14T15:00:00.000Z' })));
  expect(first.knowledgeId).toMatch(/^[a-f0-9]{64}$/);
  expect(recaptured.knowledgeId).toBe(first.knowledgeId);
  expect(recaptured.files.map(file => file.contextId)).toEqual(first.files.map(file => file.contextId));
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
  expect(otherProject.files[0].contextId).not.toBe(original.files[0].contextId);
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

 it('enforces the 200-line capture bound and accepts only a legitimate empty-file range', () => {
  const atLastLine = (lines: number) => snapshot('src/entry.ts', [...Array.from({ length: lines - 1 }, () => '// saved source line'), 'export function atEnd() {}'].join('\n'));
  const bounded = createCodebaseKnowledge([atLastLine(200)]);
  expect(bounded.files[0].concepts[0]).toMatchObject({ name: 'atEnd', startLine: 200, endLine: 200 });
  for (const lines of [201, 221]) expect(() => createCodebaseKnowledge([atLastLine(lines)])).toThrow();
  expect(codebaseKnowledgeSchema.safeParse({ ...bounded, files: [{ ...bounded.files[0], endLine: 201 }] }).success).toBe(false);

  const empty = snapshot('src/empty.ts', ''), emptyResult = createCodebaseKnowledge([empty]);
  expect(emptyResult.files[0]).toMatchObject({ status: 'empty', startLine: 1, endLine: 0, fileBytes: 0 });
  for (const invalid of [{ ...empty, fileBytes: 1 }, { ...empty, startLine: 2, endLine: 1 }, { ...empty, startLine: 2, endLine: 0 }]) expect(() => createCodebaseKnowledge([invalid])).toThrow();
  expect(codebaseKnowledgeSchema.safeParse({ ...emptyResult, files: [{ ...emptyResult.files[0], fileBytes: 1 }] }).success).toBe(false);
  expect(codebaseKnowledgeSchema.safeParse({ ...emptyResult, files: [{ ...emptyResult.files[0], startLine: 2, endLine: 1 }] }).success).toBe(false);
 });

 it('accepts bounded distinct host-issued ranges and complete-declaration focus without browser-chosen paths or commands', () => {
  const selection = selectedSources().map(({ fileId, sourceHash, startLine }) => ({ fileId, sourceHash, startLine }));
  expect(knowledgeSelectionSchema.safeParse(selection).success).toBe(true);
  expect(knowledgeSelectionSchema.safeParse([{ ...selection[0], lines: 200, focus: 'concept-7' }, { ...selection[0], startLine: 161, lines: 40 }]).success).toBe(true);
  expect(knowledgeSelectionSchema.safeParse([{ ...selection[0], lines: 1 }]).success).toBe(true);
  const invalidSelections = [
   [], Array.from({ length: 6 }, (_, index) => ({ ...selection[0], fileId: hash(`selection-${index}`) })),
   { files: selection }, [selection[0], selection[0]],
   [{ ...selection[0], path: '../unselected.ts' }], [{ ...selection[0], command: 'run' }],
   [{ ...selection[0], fileId: 'invalid' }], [{ ...selection[0], sourceHash: 'invalid' }],
   [{ ...selection[0], startLine: 0 }], [{ ...selection[0], startLine: 1.5 }], [{ ...selection[0], startLine: 1_000_000_000 }],
   [selection[0], { ...selection[0], lines: 160 }], [selection[0], { ...selection[0], focus: 'concept-1' }],
   [selection[0], { ...selection[0], startLine: 161, sourceHash: hash('mixed current source') }],
   ...[0, 201, 1.5, '200'].map(lines => [{ ...selection[0], lines }]),
   ...['run', 'concept-x', 'concept-1;run', 1].map(focus => [{ ...selection[0], focus }]),
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
   { ...result, files: [{ ...result.files[0] }, { ...result.files[1], contextId: result.files[0].contextId }, result.files[2]] },
   { ...result, files: [{ ...result.files[0], contextId: 'untrusted' }, ...result.files.slice(1)] },
   { ...result, order: result.order.slice(1) },
   { ...result, order: [result.order[0], result.order[0], result.order[2]] },
   { ...result, order: [hash('foreign file'), ...result.order.slice(1)] },
   { ...result, order: [result.order[1], result.order[0], result.order[2]] },
   { ...result, relationships: [{ ...result.relationships[0], from: hash('foreign file') }] },
   { ...result, relationships: [{ ...result.relationships[0], to: hash('foreign file') }] },
   { ...result, relationships: [{ ...result.relationships[0], line: 999 }] },
   { ...result, relationships: [result.relationships[0], result.relationships[0]] },
   { ...result, files: [{ ...result.files[0], concepts: [{ ...result.files[0].concepts[0], endLine: 999 }] }, ...result.files.slice(1)] },
   { ...result, files: [{ ...result.files[0], catalog: [{ ...result.files[0].catalog[0], endLine: 999 }] }, ...result.files.slice(1)] },
   { ...result, files: [{ ...result.files[0], catalog: [{ ...result.files[0].catalog[0], complete: false }] }, ...result.files.slice(1)] },
   { ...result, files: [{ ...result.files[0], catalog: [result.files[0].catalog[0], result.files[0].catalog[0]] }, ...result.files.slice(1)] },
   { ...result, files: [{ ...result.files[0], catalog: [{ ...result.files[0].catalog[0], command: 'run' }] }, ...result.files.slice(1)] },
   ...(['invalid', 'unsupported'] as const).map(status => ({ ...result, files: [result.files[0], { ...result.files[1], status, concepts: [], relationships: [], order: [] }, result.files[2]] })),
  ];
  for (const invalid of invalidResults) expect(codebaseKnowledgeSchema.safeParse(invalid).success).toBe(false);
 });
});
