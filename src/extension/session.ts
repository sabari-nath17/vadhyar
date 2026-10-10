import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';
import { hash } from './source.js';
import { hintSchema, predictionSchema } from '../shared.js';

const sha = z.string().regex(/^[a-f0-9]{64}$/);
const identity = { id: z.uuid(), predictionId: z.uuid(), sourceHash: sha, requirementRevision: sha };
const runIdentity = { ...identity, startedAt: z.iso.datetime(), finishedAt: z.iso.datetime(), latencyMs: z.number().int().nonnegative(), fingerprints: z.object({ harness: sha, config: sha, lock: sha }).strict().optional(), vitestVersion: z.literal('5.0.3'), baselineHash: sha, suiteId: z.literal('ownership') };
const snapshot = z.object({ content: z.string().max(20_000), hash: sha }).strict();
const activitySchema = z.discriminatedUnion('type', [
  z.object({ ...identity, type: z.literal('hint'), recordedAt: z.iso.datetime(), counterexampleId: z.uuid(), contextIdentity: sha, result: z.object({ responseId: z.string().min(1).max(128), model: z.string().min(1).max(128), requestedModel: z.string().min(1).max(128), latencyMs: z.number().int().nonnegative(), usage: z.object({ inputTokens: z.number().int().nonnegative(), outputTokens: z.number().int().nonnegative(), totalTokens: z.number().int().nonnegative() }).strict().optional(), hint: hintSchema }).strict() }).strict(),
  z.object({ ...identity, type: z.literal('diff'), recordedAt: z.iso.datetime(), before: snapshot, after: snapshot }).strict(),
  z.object({ type: z.literal('ownership'), diffId: z.uuid(), run: z.discriminatedUnion('kind', [
    z.object({ ...runIdentity, kind: z.literal('completed'), cases: z.array(z.object({ id: z.enum(['owner-client-active', 'other-client-active', 'freelancer-active']), observedApproval: z.boolean(), expectedApproval: z.boolean(), status: z.enum(['passed', 'failed']) }).strict()).length(3), requirementPassed: z.boolean(), exitCode: z.union([z.literal(0), z.literal(1)]) }).strict(),
    z.object({ ...runIdentity, kind: z.enum(['executionError', 'timeout']), message: z.string().min(1).max(250) }).strict(),
  ]) }).strict(),
]);
const sessionSchema = z.object({
  schemaVersion: z.literal(1),
  requirements: z.array(z.object({ id: z.literal('novadesk-approval-ownership'), revision: sha, text: z.string().max(20_000), confirmedAt: z.iso.datetime() }).strict()).max(20),
  checkpoints: z.array(z.object({ capturedAt: z.iso.datetime(), path: z.literal('src/approval.ts'), content: z.string().max(20_000), hash: sha, requirementRevision: sha }).strict()).max(20),
  predictions: z.array(predictionSchema).max(20).default([]),
  activity: z.array(activitySchema).max(60).default([]),
}).strict().superRefine((record, ctx) => {
  if (record.requirements.some(item => hash(item.text) !== item.revision) || record.checkpoints.some(item => hash(item.content) !== item.hash || !record.requirements.some(req => req.revision === item.requirementRevision))) ctx.addIssue({ code: 'custom', message: 'Stored evidence identity is invalid.' });
  if (record.predictions.some(item => !record.requirements.some(req => req.revision === item.requirementRevision)) || new Set(record.predictions.map(item => item.id)).size !== record.predictions.length) ctx.addIssue({ code: 'custom', message: 'Stored prediction identity is invalid.' });
  for (const event of record.activity) {
    const item = event.type === 'ownership' ? event.run : event;
    const prediction = record.predictions.find(prediction => prediction.id === item.predictionId);
    if (!prediction || prediction.requirementRevision !== item.requirementRevision) ctx.addIssue({ code: 'custom', message: 'Stored activity prediction is invalid.' });
    if (event.type === 'hint' && event.result.hint.sourceRefId !== `approval-${event.sourceHash}`) ctx.addIssue({ code: 'custom', message: 'Stored hint reference is invalid.' });
    if (event.type === 'diff' && (hash(event.before.content) !== event.before.hash || hash(event.after.content) !== event.after.hash || event.after.hash !== event.sourceHash || event.before.hash !== prediction?.sourceHash)) ctx.addIssue({ code: 'custom', message: 'Stored diff identity is invalid.' });
    if (event.type === 'ownership') {
      const diff = record.activity.find(item => item.type === 'diff' && item.id === event.diffId);
      const run = event.run;
      if (run.baselineHash !== prediction?.sourceHash || diff?.type !== 'diff' || diff.predictionId !== run.predictionId || diff.sourceHash !== run.sourceHash) ctx.addIssue({ code: 'custom', message: 'Stored run diff is invalid.' });
      if (run.kind === 'completed' && (run.cases.some((item, index) => item.id !== ['owner-client-active', 'other-client-active', 'freelancer-active'][index] || item.expectedApproval !== (index === 0) || (item.status === 'passed') !== (item.observedApproval === item.expectedApproval)) || run.requirementPassed !== run.cases.every(item => item.status === 'passed') || run.exitCode !== (run.requirementPassed ? 0 : 1))) ctx.addIssue({ code: 'custom', message: 'Stored run outcome is invalid.' });
    }
  }
});
export type Session = z.infer<typeof sessionSchema>;

export async function loadSession(folder: string): Promise<Session> {
  let text: string;
  try { text = await readFile(join(folder, 'session.json'), 'utf8'); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { schemaVersion: 1, requirements: [], checkpoints: [], predictions: [], activity: [] }; throw error; }
  if (text.length > 900_000) throw new Error('Stored session exceeds supported size.');
  return sessionSchema.parse(JSON.parse(text));
}

export async function saveSession(folder: string, session: Session): Promise<void> {
  const record = sessionSchema.parse(session);
  const text = JSON.stringify(record);
  if (text.length > 900_000) throw new Error('Stored session exceeds supported size.');
  await mkdir(folder, { recursive: true });
  const pending = join(folder, `session-${randomUUID()}.tmp`);
  try {
    await writeFile(pending, text, { flag: 'wx', mode: 0o600 });
    await rename(pending, join(folder, 'session.json'));
  } finally { await rm(pending, { force: true }); }
}
