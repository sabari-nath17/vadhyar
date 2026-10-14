import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createSourceWalkthrough, validateConceptOrder } from './src/source-concepts.js';
import { walkthroughSchema } from './src/walkthrough-types.js';
import { SourceViewer } from './src/SourceViewer.js';
import { StepControls } from './src/StepControls.js';
import type { SourceSnapshot } from './src/project-types.js';

function snapshot(text: string, path = 'src/reservation.ts', startLine = 1): SourceSnapshot {
 return { projectId: 'a'.repeat(64), fileId: 'b'.repeat(64), path, language: path.endsWith('.py') ? 'Python' : 'TypeScript', startLine, endLine: startLine + text.split('\n').length - 1, sourceHash: createHash('sha256').update(text).digest('hex'), text, truncated: startLine > 1, capturedAt: '2026-10-14T12:00:00.000Z', fileBytes: text.length };
}
const code = 'type Customer = { id: string };\ninterface Booking { customerId: string }\nfunction owns(c: Customer, b: Booking) { return c.id === b.customerId; }\nexport function reserve(c: Customer, b: Booking) { return owns(c, b); }';
function repositoryCapture(path: string, lines = 200): SourceSnapshot {
 const full = readFileSync(new URL(`./${path}`, import.meta.url), 'utf8'), all = full.split('\n'), text = all.slice(0, lines).join('\n');
 return { ...snapshot(text, path), sourceHash: createHash('sha256').update(full).digest('hex'), fileBytes: Buffer.byteLength(full), truncated: all.length > lines };
}

describe('PocketFlow adaptation on actual bounded source', () => {
 it('identifies source concepts, resolves relationships and orders the entry point before its support', () => {
  const source = snapshot(code, 'src/reservation.ts', 20), result = createSourceWalkthrough(source);
  expect(result.status).toBe('ready');
  expect(result.concepts.map(concept => [concept.name, concept.startLine, concept.endLine])).toEqual([['Customer',20,20],['Booking',21,21],['owns',22,22],['reserve',23,23]]);
  expect(result.order.map(id => result.concepts.find(concept => concept.id === id)!.name)).toEqual(['reserve','Customer','Booking','owns']);
  expect(result.relationships).toContainEqual({ from: 'concept-3', to: 'concept-2', kind: 'calls', line: 23 });
  expect(result.relationships.filter(edge => edge.kind === 'uses type')).toHaveLength(4);
  expect(result.sourceHash).toBe(source.sourceHash);
 });
 it('does not invent calls from comments, strings, shadowed parameters, members or external imports', () => {
  const source = snapshot('import { external } from "./outside";\nfunction helper() { return true; }\nexport function run(helper: () => boolean, obj: {helper: () => boolean}) {\n// helper()\nconst text = "helper()"; external(); obj.helper(); return helper();\n}');
  expect(createSourceWalkthrough(source).relationships).toEqual([]);
 });
 it('retains cycles, recursion and disconnected concepts without infinite ordering', () => {
  const result = createSourceWalkthrough(snapshot('function a() { return b(); }\nexport function b() { return a() + b(); }\nfunction isolated() { return 4; }'));
  expect(result.order).toEqual(['concept-1','concept-0','concept-2']);
  expect(result.relationships).toHaveLength(3);
 });
 it('supports arrow functions, class construction and TSX while leaving property dispatch unknown', () => {
  const result = createSourceWalkthrough(snapshot('class Store {}\nconst construct = () => new Store();\nexport const Page = () => <div>{construct()}</div>;', 'src/Page.tsx'));
  expect(result.concepts.map(concept => concept.kind)).toEqual(['class','function','function']);
  expect(result.relationships.map(edge => edge.kind)).toEqual(['constructs','calls']);
  expect(result.order).toEqual(['concept-2','concept-1','concept-0']);
 });
 it('keeps merged type and value names attached to their actual declaration kind', () => {
  const result = createSourceWalkthrough(snapshot('interface Value {id:string}\nfunction Value() {return "value";}\nexport function read(v:Value) {return Value();}'));
  expect(result.relationships).toContainEqual({from:'concept-2',to:'concept-0',kind:'uses type',line:3});
  expect(result.relationships).toContainEqual({from:'concept-2',to:'concept-1',kind:'calls',line:3});
 });
 it('caps the selected graph and declares omitted concepts instead of whole-repository coverage', () => {
  const result = createSourceWalkthrough(snapshot(Array.from({ length: 8 }, (_, index) => `export function f${index}() { return ${index}; }`).join('\n')));
  expect(result.concepts).toHaveLength(5); expect(result.order).toHaveLength(5); expect(result.omittedConcepts).toBe(3);
 });
 it('catalogs complete nested declarations in Vadhyar’s actual 200-line lesson capture', () => {
  const source = repositoryCapture('src/ProjectLesson.tsx'), result = createSourceWalkthrough(source);
  expect(source.endLine).toBeLessThanOrEqual(200);
  expect(['ready','partial']).toContain(result.status);
  for (const name of ['observe', 'refresh', 'execute', 'recordRun']) {
   const declaration = result.catalog.find(declaration => declaration.name === name)!;
   expect(declaration.complete).toBe(true); expect(declaration.scope).toContain('ProjectLesson');
   expect(source.text.split('\n').slice(declaration.startLine - 1, declaration.endLine).join('\n')).toContain(`${name} =`);
  }
  const observe = result.catalog.find(declaration => declaration.name === 'observe')!;
  expect(createSourceWalkthrough(source, observe.id).order[0]).toBe(observe.id);
 });
 it('focuses actual act, runScript and getRun declarations outside their default five-concept graphs', () => {
  for (const [path, names] of [['src/Workspace.tsx', ['act']], ['src/project-api.ts', ['runScript','getRun']]] as const) {
   const source = repositoryCapture(path), result = createSourceWalkthrough(source);
   for (const name of names) {
    const declaration = result.catalog.find(declaration => declaration.name === name)!;
    expect(declaration.complete).toBe(true); expect(result.order).not.toContain(declaration.id);
    const focused = createSourceWalkthrough(source, declaration.id);
    expect(focused.order[0]).toBe(declaration.id);
    expect(focused.concepts.find(concept => concept.id === declaration.id)).toEqual({id:declaration.id,name,kind:declaration.kind,startLine:declaration.startLine,endLine:declaration.endLine});
    expect(focused.concepts.length).toBeLessThanOrEqual(5);
   }
  }
 });
 it('recovers only independently complete leaves in a partial capture and suppresses every bound edge', () => {
  const source = snapshot('export function outer() {\n function leaf() { return support(); }\n const support = () => 1;\n // still inside the captured parent', 'src/partial.ts', 30), result = createSourceWalkthrough(source);
  expect(result.status).toBe('partial'); expect(result.relationships).toEqual([]);
  expect(result.catalog[0]).toMatchObject({ name: 'outer', startLine: 30, endLine: 33, complete: false });
  expect(result.catalog.slice(1).map(declaration => [declaration.name,declaration.scope,declaration.complete])).toEqual([['leaf','outer',true],['support','outer',true]]);
  expect(result.concepts.map(concept => concept.name)).toEqual(['leaf','support']);
  expect(() => createSourceWalkthrough(source, result.catalog[0].id)).toThrow(/complete declaration/);
  expect(() => createSourceWalkthrough(source, 'concept-999')).toThrow(/complete declaration/);
  const wholeInvalid = createSourceWalkthrough({ ...source, truncated: false });
  expect(wholeInvalid.status).toBe('invalid'); expect(wholeInvalid.concepts).toEqual([]); expect(wholeInvalid.relationships).toEqual([]);
 });
 it('attributes named nested calls to the nested declaration while respecting local parameter shadows', () => {
  const source = snapshot('function helper() { return 1; }\nexport function outer() {\n function inner() { return helper(); }\n const shadow = (helper: () => number) => helper();\n return inner();\n}'), result = createSourceWalkthrough(source);
  expect(result.catalog.map(declaration => [declaration.name, declaration.scope])).toEqual([['helper','top level'],['outer','top level'],['inner','outer'],['shadow','outer']]);
  expect(result.relationships).toEqual([{from:'concept-1',to:'concept-2',kind:'calls',line:5},{from:'concept-2',to:'concept-0',kind:'calls',line:3}]);
  expect(result.order).toEqual(['concept-1','concept-2','concept-0','concept-3']);
 });
 it('does not attribute calls inside a returned anonymous arrow to the enclosing declaration', () => {
  const result = createSourceWalkthrough(snapshot('function helper() { return true; }\nexport function start() { return () => helper(); }'));
  expect(result.relationships).toEqual([]);
  const initializer = createSourceWalkthrough(snapshot('function helper() { return true; }\nexport const start = () => helper();'));
  expect(initializer.relationships).toEqual([{from:'concept-1',to:'concept-0',kind:'calls',line:2}]);
 });
 it('retains the actual call to a callback-taking function while excluding calls inside the passed anonymous callback', () => {
  const result = createSourceWalkthrough(snapshot('function helper() { return true; }\nfunction consume(callback: () => boolean) { return callback(); }\nexport function start() { return consume(function () { return helper(); }); }'));
  expect(result.relationships).toEqual([{from:'concept-2',to:'concept-1',kind:'calls',line:3}]);
 });
 it('bounds the catalog to 100 visible declarations and permits focus on its final complete declaration', () => {
  const source = snapshot(Array.from({ length: 105 }, (_, index) => `export function f${index}() { return ${index}; }`).join('\n')), result = createSourceWalkthrough(source);
  expect(result.catalog).toHaveLength(100); expect(result.omittedDeclarations).toBe(5); expect(result.omittedConcepts).toBe(95);
  expect(createSourceWalkthrough(source, result.catalog[99].id).order[0]).toBe(result.catalog[99].id);
  expect(() => createSourceWalkthrough(source, 'concept-100')).toThrow(/complete declaration/);
 });
 it('rejects forged catalog anchors, incomplete graph entries, partial edges and ranges beyond 200 lines', () => {
  const source = snapshot(code), result = createSourceWalkthrough(source);
  for (const invalid of [
   { ...result, catalog: [result.catalog[0], result.catalog[0], ...result.catalog.slice(2)] },
   { ...result, catalog: [{ ...result.catalog[0], endLine: 999 }, ...result.catalog.slice(1)] },
   { ...result, catalog: [{ ...result.catalog[0], complete: false }, ...result.catalog.slice(1)] },
   { ...result, concepts: [{ ...result.concepts[0], name: 'invented name' }, ...result.concepts.slice(1)] },
   { ...result, status: 'partial' },
   { ...result, endLine: 201 },
  ]) expect(walkthroughSchema.safeParse(invalid).success).toBe(false);
  expect(() => createSourceWalkthrough(snapshot(Array.from({length:201}, () => '// captured').join('\n')))).toThrow(/200 lines/);
 });
 it('keeps unsupported, malformed and empty source distinct', () => {
  expect(createSourceWalkthrough(snapshot('def x():\n return 1', 'src/x.py')).status).toBe('unsupported');
  const invalid = createSourceWalkthrough(snapshot('export function incomplete() {', 'src/x.ts'));
  expect(invalid.status).toBe('invalid'); expect(invalid.concepts).toEqual([]); expect(invalid.relationships).toEqual([]);
  expect(createSourceWalkthrough(snapshot('console.log("hello");')).status).toBe('empty');
 });
 it('ports complete order validation and rejects fabricated anchors, relationships and schema fields', () => {
  const result = createSourceWalkthrough(snapshot(code));
  for (const order of [result.order.slice(1), [result.order[0], ...result.order.slice(0,-1)], ['concept-99',...result.order.slice(1)]]) expect(() => validateConceptOrder(order, result.concepts)).toThrow(/exactly once/);
  expect(walkthroughSchema.safeParse({ ...result, commands: ['run'] }).success).toBe(false);
  expect(walkthroughSchema.safeParse({ ...result, concepts: [{...result.concepts[0],endLine:999}, ...result.concepts.slice(1)] }).success).toBe(false);
  expect(walkthroughSchema.safeParse({ ...result, relationships: [{from:'concept-99',to:'concept-0',kind:'calls',line:1}] }).success).toBe(false);
  expect(() => createSourceWalkthrough({ ...snapshot(code), sourceHash: 'untrusted' })).toThrow();
 });
});

describe('Learn Claude Code adaptations', () => {
 it('does not fabricate numbered source or a reversed span for empty files and invalid saved ranges', () => {
  const empty = {...snapshot(''),endLine:0};
  const valid = renderToStaticMarkup(createElement(SourceViewer,{source:empty}));
  expect(valid).toContain('Empty file'); expect(valid).not.toContain('data-source-line'); expect(valid).not.toContain('lines 1–0');
  const invalid = renderToStaticMarkup(createElement(SourceViewer,{source:{...empty,fileBytes:50,startLine:9999,endLine:1}}));
  expect(invalid).toContain('No source in this range'); expect(invalid).not.toContain('data-source-line'); expect(invalid).not.toContain('9999–1');
 });
 it('renders untrusted source as text and highlights the actual captured line span', () => {
  const source = snapshot('const text = "<script>alert(1)</script>";\nreturn text;', 'src/x.ts', 30);
  const html = renderToStaticMarkup(createElement(SourceViewer, { source, focus: {id:'concept-0',name:'text',kind:'function',startLine:31,endLine:31} }));
  expect(html).not.toContain('<script>'); expect(html).toContain('&lt;script&gt;');
  expect(html).toContain('data-source-line="30"'); expect(html).toContain('class="concept-focus" data-source-line="31"');
  expect(html).toContain('syntax-keyword'); expect(html).toContain(source.sourceHash.slice(0,12));
 });
 it('bounds manual source navigation at the first and final concept without autoplay', () => {
  const props = {totalSteps:3,onSelect:() => {},title:'Source concept',description:'Captured source'};
  const first = renderToStaticMarkup(createElement(StepControls, {...props,currentStep:0}));
  const last = renderToStaticMarkup(createElement(StepControls, {...props,currentStep:2}));
  expect(first.match(/aria-disabled="true"/g)).toHaveLength(2); expect(last.match(/aria-disabled="true"/g)).toHaveLength(1);
  expect(first).toContain('1 / 3'); expect(last).toContain('3 / 3'); expect(first).not.toContain('Auto-play');
 });
});
