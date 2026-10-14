import { createHash } from 'node:crypto';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { SourceSnapshot } from './src/project-types.js';
import { ReadingBundleRelationships, SourceReadingBundle } from './src/SourceReadingBundle.js';
import { createCodebaseKnowledge } from './src/source-knowledge.js';
import { canUseReadingConcept, chooseReadingEntry, findCapturedSource, hasMixedReadingVersions, inspectCapturedLine, putReadingCapture, readingCaptureKey, readingPins } from './src/reading-bundle.js';

const hash = (text: string) => createHash('sha256').update(text).digest('hex');
function source(path: string, text = 'export function example() {}', startLine = 1): SourceSnapshot {
 return { projectId: hash('reading-project'), fileId: hash(path), path, text, language: 'TypeScript', startLine, endLine: text ? startLine + text.split('\n').length - 1 : 0, sourceHash: hash(`full-file:${path}`), truncated: startLine > 1, capturedAt: '2026-10-14T16:00:00.000Z', fileBytes: Buffer.byteLength(text) };
}

describe('explicit captured source reading bundles', () => {
 it('preserves up to five explicit captures, refuses duplicates and preserves existing work at capacity', () => {
  let captures = putReadingCapture([], source('a.ts'));
  expect(() => putReadingCapture(captures, source('a.ts'))).toThrow(/already included/);
  for (const path of ['b.ts', 'c.ts', 'd.ts', 'e.ts']) captures = putReadingCapture(captures, source(path));
  const before = captures;
  expect(() => putReadingCapture(captures, source('f.ts'))).toThrow(/up to five/);
  expect(captures).toBe(before); expect(captures.map(capture => capture.source.path)).toEqual(['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts']);
 });
 it('keeps distinct ranges of one saved file and sends exact spans instead of a default window', () => {
  const first = source('a.ts', 'line one\nline two', 10), later = source('a.ts', 'line fifty', 50);
  const captures = putReadingCapture(putReadingCapture([], first), later);
  expect(captures).toHaveLength(2); expect(hasMixedReadingVersions(captures)).toBe(false);
  expect(readingPins(captures)).toEqual([{fileId:first.fileId,sourceHash:first.sourceHash,startLine:10,lines:2},{fileId:later.fileId,sourceHash:later.sourceHash,startLine:50,lines:1}]);
  expect(readingCaptureKey(first)).not.toBe(readingCaptureKey(later));
 });
 it('requires explicit replacement for a newer version of the same range and clears obsolete concept focus', () => {
  const original = source('a.ts'), updated = { ...original, sourceHash: hash('updated saved file') };
  const captures = [{ source: original, focus: 'concept-2' }, { source: source('b.ts') }];
  expect(() => putReadingCapture(captures, updated)).toThrow(/Explicitly replace/);
  const replaced = putReadingCapture(captures, updated, readingCaptureKey(original));
  expect(replaced).toEqual([{source:updated},captures[1]]); expect(captures[0].source.sourceHash).toBe(original.sourceHash);
  expect(() => putReadingCapture(captures, source('c.ts'), readingCaptureKey(original))).toThrow(/same file/);
 });
 it('moves the chosen captured entry first without losing other ranges or their focus', () => {
  const captures = [ {source:source('a.ts')}, {source:source('a.ts','later range',20),focus:'concept-0'}, {source:source('b.ts')} ];
  const selected = chooseReadingEntry(captures, readingCaptureKey(captures[1].source));
  expect(selected).toEqual([captures[1],captures[0],captures[2]]); expect(readingPins(selected)[0].focus).toBe('concept-0');
  expect(captures[0].source.startLine).toBe(1); expect(() => chooseReadingEntry(captures,'missing')).toThrow(/existing/);
 });
 it('retains mixed saved versions for reading and export but refuses analysis until recaptured', () => {
  const original = source('a.ts'), later = { ...source('a.ts','later range',20), sourceHash:hash('new revision') };
  const captures = putReadingCapture(putReadingCapture([], original), later);
  expect(hasMixedReadingVersions(captures)).toBe(true); expect(() => readingPins(captures)).toThrow(/consistent/);
  const replaced = putReadingCapture(captures, {...original,sourceHash:later.sourceHash},readingCaptureKey(original));
  expect(hasMixedReadingVersions(replaced)).toBe(false); expect(readingPins(replaced)).toHaveLength(2);
  expect(JSON.parse(JSON.stringify(captures))[0].source.sourceHash).toBe(original.sourceHash);
 });
 it('bounds ranges and project identity while keeping legitimate empty files readable', () => {
  const first = source('a.ts');
  expect(() => putReadingCapture([{source:first}],{...source('b.ts'),projectId:hash('another project')})).toThrow(/one project/);
  expect(() => putReadingCapture([],source('long.ts',Array(201).fill('line').join('\n')))).toThrow(/200 lines/);
  expect(() => putReadingCapture([],{...first,endLine:0})).toThrow(/valid empty/);
  const empty = putReadingCapture([],source('empty.ts','')); expect(readingPins(empty)[0].lines).toBe(1);
  expect(findCapturedSource(empty,'example').matches).toEqual([]);
 });
 it('finds literal captured lines with exact offsets, scopes same-file ranges and caps results at thirty', () => {
  const captures = [{source:source('a.ts','const Amount = 1;\n// [literal]',30)}, {source:source('a.ts','Amount',80)}];
  expect(findCapturedSource(captures,' amount ').matches.map(match => [match.path,match.line])).toEqual([['a.ts',30],['a.ts',80]]);
  expect(findCapturedSource(captures,'[literal]').matches[0].line).toBe(31); expect(findCapturedSource(captures,' ').matches).toEqual([]);
  const many = [{source:source('many.ts',Array(31).fill('needle').join('\n'),100)}], found = findCapturedSource(many,'needle');
  expect(found.matches).toHaveLength(30); expect(found.matches.at(-1)?.line).toBe(129); expect(found.truncated).toBe(true);
  expect(findCapturedSource([{source:source('thirty.ts',Array(30).fill('needle').join('\n'))}],'needle').truncated).toBe(false);
 });
 it('renders labelled local controls and prompts without duplicating source before capture or inventing grades', () => {
  const html = renderToStaticMarkup(createElement(SourceReadingBundle,{source:source('entry.ts','const text = "<script>unsafe()</script>";',30),onNavigate:() => {throw new Error('Rendering must not navigate');}}));
  expect(html).not.toContain('<script>unsafe()'); expect(html).not.toContain('data-source-line="30"');
  expect(html).toContain('Find in captured source'); expect(html).toContain('Reading prompts');
  expect(html).toContain('open view'); expect(html).toContain('Export reading bundle'); expect(html).not.toContain('score'); expect(html).not.toContain('mastered');
 });
 it('inspects the retained matching line and identity even after a different saved version is displayed', () => {
  const retained = source('a.ts','const value = 1;\n// retained match',40), current = { ...retained, text:'const value = 2;\n// current version',sourceHash:hash('changed saved file') };
  const capture = putReadingCapture([],retained), match = findCapturedSource(capture,'retained').matches[0], inspected = inspectCapturedLine(capture[0].source,match.line);
  expect(inspected).toMatchObject({startLine:41,endLine:41,text:'// retained match',sourceHash:retained.sourceHash,capturedAt:retained.capturedAt,truncated:true});
  expect(inspected.sourceHash).not.toBe(current.sourceHash); expect(inspected.text).not.toContain('current version');
  expect(() => inspectCapturedLine(retained,42)).toThrow(/inside/); expect(() => inspectCapturedLine(retained,39)).toThrow(/inside/);
 });
 it('refuses starting concepts from invalid, unsupported or incomplete analysis while allowing complete supported slices', () => {
  expect(canUseReadingConcept('invalid',true)).toBe(false); expect(canUseReadingConcept('unsupported',true)).toBe(false);
  expect(canUseReadingConcept('partial',false)).toBe(false); expect(canUseReadingConcept('ready',false)).toBe(false);
  expect(canUseReadingConcept('ready',true)).toBe(true); expect(canUseReadingConcept('partial',true)).toBe(true);
 });
 it('renders captured static module links with escaped paths, exact ranges and source-line actions', () => {
  const captures = [{source:source('src/entry.ts','import "./<script>helper";',20)}, {source:source('src/<script>helper.ts')}];
  const knowledge = createCodebaseKnowledge(captures.map(capture => capture.source));
  expect(knowledge.relationships).toHaveLength(1);
  const html = renderToStaticMarkup(createElement(ReadingBundleRelationships,{knowledge,captures,onInspect:() => {throw new Error('Rendering must not inspect');},onNavigate:() => {throw new Error('Rendering must not navigate');}}));
  expect(html).toContain('src/entry.ts'); expect(html).toContain('captured lines 20–20'); expect(html).toContain('src/&lt;script&gt;helper.ts'); expect(html).not.toContain('src/<script>helper.ts');
  expect(html).toContain('imports at line 20'); expect(html).toContain('Inspect captured link line 20'); expect(html).toContain('Recapture saved link line 20');
  expect(html).toContain('do not establish data handoff, callbacks or runtime behavior');
 });
});
