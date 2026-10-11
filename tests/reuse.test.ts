import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { parseSpecification, readPickedSpecification, readSpecification, selectRequirement } from '../src/extension/requirements.js';
import { codeTour } from '../src/extension/walkthrough.js';
import { hash } from '../src/extension/source.js';
import { loadSession, saveSession } from '../src/extension/session.js';
import { availableSteps, requirementProse } from '../src/panel/workflow.js';
import tourSchema from './fixtures/codetour.schema.json' with { type: 'json' };

const spec = '## Requirements\n### Requirement: Ownership\nOnly the owner SHALL approve.\n#### Scenario: Other client\n- **WHEN** another client approves\n- **THEN** deny\n### Requirement: Archived\nArchived milestones SHALL be rejected.\n#### Scenario: Archived owner\n- **WHEN** an owner approves an archived milestone\n- **THEN** deny';

it('imports requirements and scenarios while ignoring fenced headings and rejecting ambiguous titles', () => {
  const parsed = parseSpecification(spec);
  expect(parsed.map(item => item.title)).toEqual(['Ownership', 'Archived']);
  expect(parsed[0].scenarios).toEqual([{ title: 'Other client', text: '- **WHEN** another client approves\n- **THEN** deny' }]);
  expect(parseSpecification('```md\n### Requirement: Fake\n```\n' + spec)).toHaveLength(2);
  expect(() => parseSpecification(spec + '\n### Requirement: Ownership\nDuplicate')).toThrow(/unique/);
  expect(() => parseSpecification('No requirement headings')).toThrow();
  expect(() => parseSpecification('x'.repeat(20_001))).toThrow(/20,000/);
});

it('persists selected source/revision/scenarios and prior requirements without claiming executable coverage', async () => {
  const root = await mkdtemp(join(tmpdir(), 'vadhyar-import-'));
  try {
    await mkdir(join(root, 'openspec'));
    await writeFile(join(root, 'openspec/spec.md'), spec);
    const file = await readSpecification(root, 'openspec/spec.md');
    const imported = selectRequirement(file, 'Ownership');
    expect(requirementProse(imported.requirement.text)).toBe('Only the owner SHALL approve.');
    expect(imported.requirement.checksAvailable).toBe(false);
    expect(availableSteps({ refs: [], busy: false, confirmed: true, sourceHash: hash('source'), requirement: imported.requirement })).toEqual(['confirm', 'understand']);
    const session = await loadSession(root);
    session.activeImport = { path: file.path, title: 'Ownership' };
    session.requirements.push({ ...imported.requirement, confirmedAt: new Date().toISOString() });
    await saveSession(root, session);
    const changed = selectRequirement({ ...file, content: spec + '\n', hash: hash(spec + '\n') }, 'Ownership');
    expect(changed.requirement.revision).not.toBe(imported.requirement.revision);
    session.requirements.push({ ...changed.requirement, confirmedAt: new Date().toISOString() });
    await saveSession(root, session);
    expect((await loadSession(root)).requirements).toEqual(session.requirements);
    await expect(readSpecification(root, '../outside.md')).rejects.toThrow(/inside/);
    await expect(readSpecification(root, '.env.md')).rejects.toThrow(/inside/);
    await symlink(tmpdir(), join(root, 'outside'));
    await expect(readSpecification(root, 'outside/escape.md')).rejects.toThrow();
    expect(() => selectRequirement(file, 'Removed')).toThrow(/missing/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

it('canonicalizes native picked files while preserving outside, hidden and symlink boundaries', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'vadhyar-native-import-'));
  const root = join(folder, 'workspace'), alias = join(folder, 'alias');
  try {
    await mkdir(root); await writeFile(join(root, 'spec.md'), spec);
    await symlink(root, alias, 'dir');
    expect((await readPickedSpecification(alias, join(root, 'spec.md'))).path).toBe('spec.md');
    await writeFile(join(folder, 'outside.md'), spec);
    await expect(readPickedSpecification(root, join(folder, 'outside.md'))).rejects.toThrow(/inside/);
    await writeFile(join(root, '.hidden.md'), spec);
    await expect(readPickedSpecification(root, join(root, '.hidden.md'))).rejects.toThrow(/inside/);
    await symlink(join(root, 'spec.md'), join(root, 'link.md'));
    await expect(readPickedSpecification(root, join(root, 'link.md'))).rejects.toThrow(/regular/);
  } finally { await rm(folder, { recursive: true, force: true }); }
});

it('exports only the CodeTour safe subset with current references and inert text', () => {
  const source = { path: 'src/approval.ts', absolutePath: '/project/src/approval.ts', content: 'first\nsecond\n', hash: hash('first\nsecond\n') };
  const refs = [{ id: 'decision', path: source.path, startLine: 2, endLine: 2, hash: source.hash, symbol: 'decision' }];
  const explanation = { responseId: 'fixture', model: 'fixture', requestedModel: 'fixture', latencyMs: 0, explanation: { summary: 'Fixture', steps: [{ title: 'Decision', text: '[run](command:unsafe) <script> https://example.com', sourceRefId: 'decision' }] } };
  const identity = { sourceHash: source.hash, requirementRevision: hash('requirement') };
  const tour = codeTour(explanation, refs, source, identity, identity.requirementRevision);
  expect(tourSchema.required.every(key => key in tour)).toBe(true);
  expect(tourSchema.properties.steps.items.required.every(key => key in tour.steps[0])).toBe(true);
  expect(Object.keys(tour.steps[0]).every(key => key in tourSchema.properties.steps.items.properties)).toBe(true);
  expect(Object.keys(tour)).toEqual(['title', 'steps']);
  expect(Object.keys(tour.steps[0])).toEqual(['title', 'file', 'line', 'description']);
  expect(tour.steps[0].line).toBe(2);
  expect(tour.steps[0].description).not.toContain('command:');
  expect(tour.steps[0].description).not.toContain('<script>');
  expect(() => codeTour(explanation, refs, { ...source, hash: hash('changed') }, identity, identity.requirementRevision)).toThrow(/stale/);
  expect(() => codeTour(explanation, refs, source, identity, hash('changed requirement'))).toThrow(/stale/);
  expect(() => codeTour(explanation, [{ ...refs[0], endLine: 100 }], source, identity, identity.requirementRevision)).toThrow(/span/);
});
