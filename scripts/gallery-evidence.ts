import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { runFullOwnership, runOwnership } from '../src/extension/checks.js';
import { hash } from '../src/extension/source.js';
import type { PanelState, Prediction } from '../src/shared.js';

const root = resolve(process.cwd());
const folder = await mkdtemp(join(tmpdir(), 'vadhyar-gallery-evidence-'));
const content = await readFile(join(root, 'novadesk/src/approval.ts'), 'utf8');
const text = await readFile(join(root, 'novadesk/vadhyar-requirement.md'), 'utf8');
const revision = hash(text);
const prediction: Prediction = { id: '72fb5e9b-a306-408d-b60a-8459d5b2e724', savedAt: new Date().toISOString(), predictedApproval: false, reasoning: 'Developer check: predict denial under the owner-only requirement.', sourceHash: hash(content), requirementRevision: revision };
try {
  await writeFile(join(folder, 'prediction.json'), JSON.stringify(prediction), { mode: 0o600 });
  const source = { path: 'src/approval.ts', absolutePath: join(root, 'novadesk/src/approval.ts'), content, hash: hash(content) };
  const counterexample = await runOwnership(root, folder, source, prediction);
  const seed = await runFullOwnership(root, folder, source, prediction);
  const correctedContent = content.replace("return actor.role === 'client';", "return actor.role === 'client' && actor.id === _milestone.ownerClientId;");
  if (correctedContent === content) throw new Error('Expected teaching seed not found.');
  const corrected = await runFullOwnership(root, folder, { ...source, content: correctedContent, hash: hash(correctedContent) }, prediction);
  if (seed.kind !== 'completed' || seed.requirementPassed || corrected.kind !== 'completed' || !corrected.requirementPassed) throw new Error('Expected developer checks did not complete.');
  const common: PanelState = { refs: [], busy: false, confirmed: true, requirement: { id: 'novadesk-approval-ownership', revision, text }, prediction, counterexample, hints: [] };
  const record = { capturedAt: new Date().toISOString(), provenance: 'Recorded developer checks in disposable runner copies. No learner authorship or independent learning claim. No API requests.', seed: { ...common, sourceHash: source.hash, ownershipRun: seed }, corrected: { ...common, sourceHash: corrected.sourceHash, ownershipRun: corrected } };
  await writeFile(join(root, 'docs/design-v2/phase-0/recorded-checks.json'), JSON.stringify(record, null, 2) + '\n');
} finally { await rm(folder, { recursive: true, force: true }); }
