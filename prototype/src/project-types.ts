import { z } from 'zod';
export const identitySchema = z.string().regex(/^[a-f0-9]{64}$/);
export const projectInfoSchema = z.object({ id: identitySchema, name: z.string().min(1).max(200), status: z.enum(['indexing','ready','partial','error']), indexedFiles: z.number().int().nonnegative(), skippedFiles: z.number().int().nonnegative(), scanErrors: z.number().int().nonnegative(), totalBytes: z.number().nonnegative(), revision: z.number().int().nonnegative(), watching: z.boolean(), watchError: z.enum(['watch_unavailable','watch_failed','watch_overflow']).nullable() }).strict();
export const projectFileSchema = z.object({ id: identitySchema, path: z.string().min(1).max(8192), size: z.number().nonnegative(), language: z.string().max(40) }).strict();
export const filesPageSchema = z.object({ files: z.array(projectFileSchema).max(100), nextCursor: z.string().max(8192).nullable(), project: projectInfoSchema }).strict();
export const sourceSnapshotSchema = z.object({ projectId: identitySchema, fileId: identitySchema, path: z.string().min(1).max(8192), language: z.string().max(40), startLine: z.number().int().positive(), endLine: z.number().int().nonnegative(), sourceHash: identitySchema, text: z.string().max(40_000), truncated: z.boolean(), capturedAt: z.string().datetime(), fileBytes: z.number().nonnegative() }).strict();
export const projectScriptSchema = z.object({ id: z.string().min(1).max(80), command: z.string().min(1).max(4000), manifestHash: identitySchema }).strict();
export const scriptsSchema = z.object({ scripts: z.array(projectScriptSchema).max(100) }).strict();
export const projectRunSchema = z.object({ id: z.uuid(), projectId: identitySchema, fileId: identitySchema, scriptId: z.string().min(1).max(80), sourceHash: identitySchema, manifestHash: identitySchema, status: z.enum(['running','passed','failed','error','timeout','stale']), freshness: z.enum(['current','stale','unknown']).optional(), output: z.string().max(24_000), exitCode: z.number().int().nullable(), startedAt: z.string().datetime(), finishedAt: z.string().datetime().nullable() }).strict();
export type ProjectInfo = z.infer<typeof projectInfoSchema>;
export type ProjectFile = z.infer<typeof projectFileSchema>;
export type SourceSnapshot = z.infer<typeof sourceSnapshotSchema>;
export type ProjectScript = z.infer<typeof projectScriptSchema>;
export type ProjectRun = z.infer<typeof projectRunSchema>;

export const projectChangesSchema = z.object({ changes: z.array(z.object({ id: z.uuid(), fileId: identitySchema, path: z.string().min(1).max(8192), kind: z.enum(['added','modified','deleted']), capturedAt: z.string().datetime(), sourceHash: identitySchema.nullable(), tracked: z.boolean() }).strict()).max(100), nextCursor: z.string().max(8192).nullable(), revision: z.number().int().nonnegative() }).strict();
export const projectVersionsSchema = z.object({ versions: z.array(sourceSnapshotSchema).max(20) }).strict();
export const teachingStatusSchema = z.object({provider:z.literal('openai'),connected:z.boolean(),models:z.array(z.string().min(1).max(200)).max(500),model:z.string().max(200).nullable()}).strict();
export const teachingExplanationSchema = z.object({sourceHash:identitySchema,fileId:identitySchema,path:z.string().max(8192),startLine:z.number().int().positive(),endLine:z.number().int().nonnegative(),model:z.string().max(200),generatedAt:z.string().datetime(),explanation:z.object({summary:z.string().max(6000),conditions:z.array(z.object({startLine:z.number().int().positive(),endLine:z.number().int().positive(),explanation:z.string().max(3000)}).strict()).max(20),questions:z.array(z.string().max(2000)).max(10),limits:z.array(z.string().max(2000)).max(20)}).strict()}).strict();

export const projectSourceStateSchema = z.discriminatedUnion('status', [
 z.object({ status: z.literal('available'), fileId: identitySchema, sourceHash: identitySchema }).strict(),
 z.object({ status: z.literal('unavailable'), fileId: identitySchema, sourceHash: z.null() }).strict()
]);
export type ProjectSourceState = z.infer<typeof projectSourceStateSchema>;
