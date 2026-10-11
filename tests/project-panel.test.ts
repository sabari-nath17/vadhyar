import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { ProjectPanel } from '../src/panel/project.js';
import type { ProjectState } from '../src/project/shared.js';
import { newIntent } from '../src/project/model.js';
const intent = { ...newIntent({ title: 'Positive capacity', request: 'Reserve seats', expected: 'Zero is rejected', origin: 'manual' }), confirmedAt: new Date().toISOString() };
const snapshot = '1'.repeat(64);
const group = { title: 'Capacity condition', rationale: 'This condition selects positive capacity.', intentId: intent.id, paths: ['src/reserve.js'], decision: { path: 'src/reserve.js', line: 2, code: 'return seats > 0;' }, change: 'changed-span' as const };
const relationships = { status: 'extracted' as const, snapshot, version: '0.9.84' as const, files: ['src/reserve.js', 'src/checkout.js'], links: [{ fromPath: 'src/checkout.js', fromSymbol: 'checkout()', toPath: 'src/reserve.js', toSymbol: 'canReserve()', line: 3, relation: 'calls' as const }], inferredEdges: 1, reason: '' };
const state: ProjectState = { name: 'Example', busy: false, started: true, snapshot, baseline: snapshot, fileCount: 3, omitted: [], changes: [], intents: [intent], selectedIntent: intent.id, files: ['src/reserve.js', 'src/checkout.js', 'notes.md'], selectedFiles: group.paths, groups: [group], groupSnapshot: snapshot, groupReviewedPaths: group.paths, relationships, captureConnected: false };
const render = (value: ProjectState) => renderToStaticMarkup(createElement(ProjectPanel, { state: value, send() {}, setupKey() {} }));
it('shows five topic disclosures, grounded native targets and actual outside-context paths', () => {
 const html = render(state);
 for (const label of ['Requirement connection:', 'Decision to investigate:', 'Why selected:', 'Other code that references this file:', 'Outside the reviewed context:', 'Zero is rejected', 'src/checkout.js:3', 'notes.md', '2 other captured files', '0 recorded capture omissions', 'Captured source contents not shared with the model:', '1 inferred edges were excluded', 'Confirm requirement and focus on this decision']) expect(html).toContain(label);
 expect(html).toContain('return seats &gt; 0;'); expect(html).toContain('These links do not prove that this particular condition executes.');
});
it('retains unknown requirement and missing relationships as unresolved, and disables historical topic targets', () => {
 const unknown = render({ ...state, groups: [{ ...group, intentId: '' }], relationships: { ...relationships, status: 'unavailable', files: [], links: [], reason: 'Graphify unavailable; dependencies are not verified.' } });
 expect(unknown).toContain('Clarify requirement before teaching'); expect(unknown).toContain('which confirmed requirement'); expect(unknown).toContain('dependencies are not verified');
 const historical = render({ ...state, dirty: true }); expect(historical).toContain('Historical topic.'); expect(historical).toContain('aria-disabled="true"');
});
