import { randomUUID } from 'node:crypto';
import { lstat, mkdir, mkdtemp, open, readFile, readdir, realpath, rename, rm, rmdir } from 'node:fs/promises';
import { isAbsolute, join, relative } from 'node:path';
import { z } from 'zod';
import { hash } from './source.js';
import { importSelectionSchema } from './requirements.js';
import { hintSchema, learningStage, predictionSchema } from '../shared.js';
import { explanationSchema } from './coach.js';

const sha = z.string().regex(/^[a-f0-9]{64}$/);
const identity = { id: z.uuid(), predictionId: z.uuid(), sourceHash: sha, requirementRevision: sha };
const executionIdentity = { ...identity, startedAt: z.iso.datetime(), finishedAt: z.iso.datetime(), latencyMs: z.number().int().nonnegative(), fingerprints: z.object({ harness: sha, config: sha, lock: sha }).strict().optional(), vitestVersion: z.literal('5.0.3') };
const runIdentity = { ...executionIdentity, baselineHash: sha, suiteId: z.enum(['ownership', 'transfer']) };
const snapshot = z.object({ content: z.string().max(20_000), hash: sha }).strict();
const activitySchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('counterexample'), run: z.discriminatedUnion('kind', [
    z.object({ ...executionIdentity, caseId: z.enum(['other-client-active', 'owner-client-archived']), kind: z.literal('completed'), observedApproval: z.boolean(), requirementPassed: z.boolean(), exitCode: z.union([z.literal(0), z.literal(1)]), executedCases: z.literal(1), skippedCases: z.union([z.literal(2), z.literal(3)]) }).strict(),
    z.object({ ...executionIdentity, caseId: z.enum(['other-client-active', 'owner-client-archived']), kind: z.enum(['executionError', 'timeout']), message: z.string().min(1).max(250) }).strict(),
  ]) }).strict(),
  z.object({ ...identity, type: z.literal('reflection'), recordedAt: z.iso.datetime(), text: z.string().trim().min(1).max(2000) }).strict(),
  z.object({ ...identity, type: z.literal('hint'), recordedAt: z.iso.datetime(), counterexampleId: z.uuid(), contextIdentity: sha, result: z.object({ responseId: z.string().min(1).max(128), model: z.string().min(1).max(128), requestedModel: z.string().min(1).max(128), latencyMs: z.number().int().nonnegative(), usage: z.object({ inputTokens: z.number().int().nonnegative(), outputTokens: z.number().int().nonnegative(), totalTokens: z.number().int().nonnegative() }).strict().optional(), hint: hintSchema }).strict() }).strict(),
  z.object({ ...identity, type: z.literal('diff'), recordedAt: z.iso.datetime(), before: snapshot, after: snapshot }).strict(),
  z.object({ type: z.literal('ownership'), diffId: z.uuid(), run: z.discriminatedUnion('kind', [
    z.object({ ...runIdentity, kind: z.literal('completed'), cases: z.array(z.object({ id: z.enum(['owner-client-active', 'other-client-active', 'freelancer-active', 'owner-client-archived']), observedApproval: z.boolean(), expectedApproval: z.boolean(), status: z.enum(['passed', 'failed']) }).strict()).min(3).max(4), requirementPassed: z.boolean(), exitCode: z.union([z.literal(0), z.literal(1)]) }).strict(),
    z.object({ ...runIdentity, kind: z.enum(['executionError', 'timeout']), message: z.string().min(1).max(250) }).strict(),
  ]) }).strict(),
]);
const sessionSchema = z.object({
  schemaVersion: z.union([z.literal(1), z.literal(2)]),
  activeImport: importSelectionSchema.optional(),
  activeExercise: z.literal('transfer').optional(),
  requirements: z.array(z.object({ id: z.string().regex(/^(novadesk-approval-ownership|imported-[a-f0-9]{64})$/), revision: sha, text: z.string().max(20_000), confirmedAt: z.iso.datetime(), sourcePath: z.string().max(1000).optional(), sourceRevision: sha.optional(), title: z.string().max(200).optional(), scenarios: z.array(z.object({ title: z.string(), text: z.string() }).strict()).max(40).optional(), checksAvailable: z.boolean().optional() }).strict()).max(20),
  checkpoints: z.array(z.object({ capturedAt: z.iso.datetime(), path: z.literal('src/approval.ts'), content: z.string().max(20_000), hash: sha, requirementRevision: sha }).strict()).max(20),
  predictions: z.array(predictionSchema).max(20).default([]),
  activity: z.array(activitySchema).max(60).default([]),
  learning: z.array(z.object({ requirementRevision: sha, sourceHash: sha, stage: learningStage, checkpointHash: sha.optional(), predictionId: z.uuid().optional(), baseline: snapshot.optional(), pending: z.object({ kind: z.enum(['counterexample', 'ownership']), startedAt: z.iso.datetime(), sourceHash: sha, diffId: z.uuid().optional() }).strict().optional() }).strict()).max(20).default([]),
}).strict().superRefine((record, ctx) => {
  if (record.activeImport && record.activeExercise) ctx.addIssue({ code: 'custom', message: 'Stored requirement selection is ambiguous.' });
  if (record.requirements.some(item => hash(item.text) !== item.revision) || record.checkpoints.some(item => hash(item.content) !== item.hash || !record.requirements.some(req => req.revision === item.requirementRevision))) ctx.addIssue({ code: 'custom', message: 'Stored evidence identity is invalid.' });
  if (record.predictions.some(item => !record.requirements.some(req => req.revision === item.requirementRevision)) || new Set(record.predictions.map(item => item.id)).size !== record.predictions.length) ctx.addIssue({ code: 'custom', message: 'Stored prediction identity is invalid.' });
  for (const event of record.activity) {
    const item = event.type === 'ownership' || event.type === 'counterexample' ? event.run : event;
    const prediction = record.predictions.find(prediction => prediction.id === item.predictionId);
    if (!prediction || prediction.requirementRevision !== item.requirementRevision) ctx.addIssue({ code: 'custom', message: 'Stored activity prediction is invalid.' });
    if (event.type === 'hint' && event.result.hint.sourceRefId !== `approval-${event.sourceHash}`) ctx.addIssue({ code: 'custom', message: 'Stored hint reference is invalid.' });
    if (event.type === 'diff' && (hash(event.before.content) !== event.before.hash || hash(event.after.content) !== event.after.hash || event.after.hash !== event.sourceHash || event.before.hash !== prediction?.sourceHash)) ctx.addIssue({ code: 'custom', message: 'Stored diff identity is invalid.' });
    if (event.type === 'counterexample' && (item.sourceHash !== prediction?.sourceHash || event.run.caseId !== (prediction?.caseId ?? 'other-client-active') || (event.run.kind === 'completed' && (event.run.skippedCases !== (event.run.caseId === 'owner-client-archived' ? 3 : 2) || event.run.requirementPassed !== !event.run.observedApproval || event.run.exitCode !== (event.run.requirementPassed ? 0 : 1))))) ctx.addIssue({ code: 'custom', message: 'Stored counterexample outcome is invalid.' });
    if (event.type === 'ownership') {
      const diff = record.activity.find(item => item.type === 'diff' && item.id === event.diffId);
      const run = event.run;
      const ids = run.suiteId === 'transfer' ? ['owner-client-active', 'other-client-active', 'freelancer-active', 'owner-client-archived'] : ['owner-client-active', 'other-client-active', 'freelancer-active'];
      if (run.suiteId !== (prediction?.caseId === 'owner-client-archived' ? 'transfer' : 'ownership')) ctx.addIssue({ code: 'custom', message: 'Stored run exercise is invalid.' });
      if (run.baselineHash !== prediction?.sourceHash || diff?.type !== 'diff' || diff.predictionId !== run.predictionId || diff.sourceHash !== run.sourceHash) ctx.addIssue({ code: 'custom', message: 'Stored run diff is invalid.' });
      if (run.kind === 'completed' && (run.cases.length !== ids.length || run.cases.some((item, index) => item.id !== ids[index] || item.expectedApproval !== (index === 0) || (item.status === 'passed') !== (item.observedApproval === item.expectedApproval)) || run.requirementPassed !== run.cases.every(item => item.status === 'passed') || run.exitCode !== (run.requirementPassed ? 0 : 1))) ctx.addIssue({ code: 'custom', message: 'Stored run outcome is invalid.' });
    }
  }
  if (new Set(record.learning.map(item => item.requirementRevision)).size !== record.learning.length) ctx.addIssue({ code: 'custom', message: 'Stored learning identity is duplicated.' });
  for (const item of record.learning) {
    const prediction = record.predictions.find(prediction => prediction.id === item.predictionId);
    if (!record.requirements.some(req => req.revision === item.requirementRevision) || (item.predictionId && prediction?.requirementRevision !== item.requirementRevision) || (item.baseline && (hash(item.baseline.content) !== item.baseline.hash || item.baseline.hash !== prediction?.sourceHash)) || (item.checkpointHash && !record.checkpoints.some(checkpoint => checkpoint.hash === item.checkpointHash && checkpoint.requirementRevision === item.requirementRevision))) ctx.addIssue({ code: 'custom', message: 'Stored learning identity is invalid.' });
    if (item.pending && (!prediction || (item.pending.kind === 'counterexample' && item.pending.sourceHash !== prediction.sourceHash) || (item.pending.kind === 'ownership' && !record.activity.some(event => event.type === 'diff' && event.id === item.pending?.diffId && event.predictionId === prediction.id && event.sourceHash === item.pending.sourceHash)))) ctx.addIssue({ code: 'custom', message: 'Stored pending execution identity is invalid.' });
  }
}).transform(record => ({ ...record, schemaVersion: 2 as const }));
export type Session = z.infer<typeof sessionSchema>;

const recordedExplanation = z.object({ capturedAt: z.iso.datetime(), requirementRevision: sha, sourceHash: sha, contextIdentity: sha, graphIdentity: sha, graphifyVersion: z.literal('0.9.84'), graphReferences: z.number().int().min(1).max(5), graphRelationships: z.number().int().nonnegative(), responseId: z.string().min(1).max(128), model: z.string().min(1).max(128), requestedModel: z.string().min(1).max(128), latencyMs: z.number().int().nonnegative(), usage: z.object({ inputTokens: z.number().int().nonnegative(), outputTokens: z.number().int().nonnegative(), totalTokens: z.number().int().nonnegative() }).strict().optional(), explanation: explanationSchema }).strict();

export async function loadSession(folder: string): Promise<Session> {
  let text: string;
  try { text = await readFile(join(folder, 'session.json'), 'utf8'); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    const entries = await readdir(folder).catch((error: NodeJS.ErrnoException) => { if (error.code === 'ENOENT') return []; throw error; });
    if (entries.some(name => name.startsWith('novadesk-clear-'))) throw new Error('NovaDesk clearing was interrupted. Saved records remain in the memory folder; inspect it before continuing.', { cause: error });
    return { schemaVersion: 2, requirements: [], checkpoints: [], predictions: [], activity: [], learning: [] };
  }
  if (text.length > 900_000) throw new Error('Stored session exceeds supported size.');
  return sessionSchema.parse(JSON.parse(text));
}

export async function saveSession(folder: string, session: Session): Promise<void> {
  const record = sessionSchema.parse(session);
  await writeRecord(folder, 'session', JSON.stringify(record));
}

export async function loadExplanation(folder: string) {
  let text: string;
  try { text = await readFile(join(folder, 'gate-a.json'), 'utf8'); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return; throw error; }
  try { if (text.length > 900_000) throw new Error('size'); return recordedExplanation.parse(JSON.parse(text)); }
  catch (cause) { throw new Error('Saved explanation is invalid. Its file is preserved; show memory location to inspect it.', { cause }); }
}

export async function saveExplanation(folder: string, record: unknown) {
  await writeRecord(folder, 'gate-a', JSON.stringify(recordedExplanation.parse(record), null, 2));
}

async function writeRecord(folder: string, name: 'session' | 'gate-a', text: string) {
  if (text.length > 900_000) throw new Error('Stored session exceeds supported size.');
  await mkdir(folder, { recursive: true });
  const pending = join(folder, `${name}-${randomUUID()}.tmp`);
  try {
    const file = await open(pending, 'wx', 0o600);
    try { await file.writeFile(text); await file.sync(); }
    finally { await file.close(); }
    await rename(pending, join(folder, `${name}.json`));
  } finally { await rm(pending, { force: true }).catch(() => undefined); }
}

export async function clearNovaDeskSession(folder: string, remove: (path: string) => PromiseLike<void>) {
  const info = await lstat(folder).catch((error: NodeJS.ErrnoException) => { if (error.code === 'ENOENT') return; throw error; });
  if (!info) return;
  if (!info.isDirectory() || info.isSymbolicLink()) throw new Error('Memory must be a regular local directory.');
  const base = await realpath(folder);
  const entries = await readdir(base);
  if (entries.some(name => name.startsWith('novadesk-clear-'))) throw new Error('An earlier clear needs recovery. Show memory location; existing records are preserved.');
  const names = entries.filter(name => ['session.json', 'gate-a.json'].includes(name) || /^(session|gate-a)-[a-f0-9-]{36}\.tmp$/.test(name) || /^(graph|ownership)-[A-Za-z0-9]{6}$/.test(name));
  const records = new Map<string, string>();
  for (const name of names) {
    const path = join(base, name), info = await lstat(path);
    if (info.isSymbolicLink()) throw new Error('Cannot safely clear a symbolic link in NovaDesk memory.');
    if (/^(graph|ownership)-/.test(name)) {
      const marker = join(path, name.startsWith('graph-') ? 'input/approval.ts' : 'novadesk/src/approval.ts');
      const resolved = await realpath(marker).catch(() => { throw new Error('Cannot safely identify NovaDesk scratch data.'); });
      const inside = relative(path, resolved);
      if (!info.isDirectory() || isAbsolute(inside) || inside.startsWith('..') || !(await lstat(resolved)).isFile()) throw new Error('Cannot safely identify NovaDesk scratch data.');
    } else {
      if (!info.isFile() || info.size > 900_000) throw new Error('Memory records must be regular supported files.');
      if (name.endsWith('.json')) records.set(name, await readFile(path, 'utf8'));
    }
  }
  if (!names.length) return;
  const retired = await mkdtemp(join(base, 'novadesk-clear-'));
  const moved: string[] = [];
  try {
    for (const name of names) { await rename(join(base, name), join(retired, name)); moved.push(name); }
    await remove(retired);
  } catch {
    try {
      for (const name of moved.reverse()) {
        const existing = await lstat(join(base, name)).catch((error: NodeJS.ErrnoException) => { if (error.code !== 'ENOENT') throw error; });
        if (existing) throw new Error('Memory changed during recovery; preserve both records.');
        try { await rename(join(retired, name), join(base, name)); }
        catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
      }
      for (const [name, text] of records) {
        const existing = await lstat(join(base, name)).catch((error: NodeJS.ErrnoException) => { if (error.code !== 'ENOENT') throw error; });
        if (!existing) await writeRecord(base, name === 'session.json' ? 'session' : 'gate-a', text);
      }
      await rmdir(retired).catch(() => undefined);
    } catch { throw new Error(`NovaDesk was not cleared. Recovery records remain at ${retired}; show memory location.`); }
    throw new Error('NovaDesk was not cleared. Saved records were restored; check file permissions and retry.');
  }
}
