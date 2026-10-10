import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';
import { hash } from './source.js';

const sha = z.string().regex(/^[a-f0-9]{64}$/);
const sessionSchema = z.object({
  schemaVersion: z.literal(1),
  requirements: z.array(z.object({ id: z.literal('novadesk-approval-ownership'), revision: sha, text: z.string().max(20_000), confirmedAt: z.iso.datetime() }).strict()).max(20),
  checkpoints: z.array(z.object({ capturedAt: z.iso.datetime(), path: z.literal('src/approval.ts'), content: z.string().max(20_000), hash: sha, requirementRevision: sha }).strict()).max(20),
}).strict().superRefine((record, ctx) => {
  if (record.requirements.some(item => hash(item.text) !== item.revision) || record.checkpoints.some(item => hash(item.content) !== item.hash || !record.requirements.some(req => req.revision === item.requirementRevision))) ctx.addIssue({ code: 'custom', message: 'Stored evidence identity is invalid.' });
});
export type Session = z.infer<typeof sessionSchema>;

export async function loadSession(folder: string): Promise<Session> {
  let text: string;
  try { text = await readFile(join(folder, 'session.json'), 'utf8'); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { schemaVersion: 1, requirements: [], checkpoints: [] }; throw error; }
  if (text.length > 900_000) throw new Error('Stored session exceeds supported size.');
  return sessionSchema.parse(JSON.parse(text));
}

export async function saveSession(folder: string, session: Session): Promise<void> {
  const record = sessionSchema.parse(session);
  await mkdir(folder, { recursive: true });
  const pending = join(folder, `session-${randomUUID()}.tmp`);
  try {
    await writeFile(pending, JSON.stringify(record), { flag: 'wx', mode: 0o600 });
    await rename(pending, join(folder, 'session.json'));
  } finally { await rm(pending, { force: true }); }
}
