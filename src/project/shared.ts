import { z } from 'zod';

export const sha = z.string().regex(/^[a-f0-9]{64}$/);
export const pathSchema = z.string().min(1).max(500).refine(path => !path.includes('\\') && !path.includes(':') && !path.split('/').some(part => !part || part === '..' || part.startsWith('.')), 'Invalid project path');
export const intentInput = z.object({ title: z.string().trim().min(1).max(120), request: z.string().trim().min(1).max(6000), expected: z.string().trim().max(6000), origin: z.enum(['manual', 'specification', 'agent']) }).strict();
export const intentSchema = intentInput.extend({ id: z.uuid(), revision: sha, createdAt: z.iso.datetime(), confirmedAt: z.iso.datetime().optional(), supersedes: z.uuid().optional(), sourcePath: pathSchema.optional(), sourceHash: sha.optional() }).strict();
export type Intent = z.infer<typeof intentSchema>;
export const fileSchema = z.object({ path: pathSchema, hash: sha, content: z.string().max(100_000) }).strict();
export type ProjectFile = z.infer<typeof fileSchema>;
export const snapshotSchema = z.object({ id: sha, capturedAt: z.iso.datetime(), files: z.array(fileSchema).max(300), omitted: z.array(z.string()).max(1000) }).strict();
export type Snapshot = z.infer<typeof snapshotSchema>;
export interface FileChange { path: string; kind: 'added' | 'modified' | 'deleted'; beforeHash?: string; afterHash?: string; added: number; removed: number }
export const guideSchema = z.object({ summary: z.string().min(1).max(1400), purpose: z.string().min(1).max(1400), logic: z.string().min(1).max(2400), consequence: z.string().min(1).max(1400), steps: z.array(z.object({ title: z.string().min(1).max(120), text: z.string().min(1).max(1600), path: pathSchema, line: z.number().int().positive() }).strict()).max(8), questions: z.array(z.string().min(1).max(600)).max(5), plan: z.array(z.string().min(1).max(900)).max(8), prompt: z.string().max(6000) }).strict();
export const groupSchema = z.object({ groups: z.array(z.object({ title: z.string().min(1).max(120), rationale: z.string().min(1).max(1000), intentId: z.string(), paths: z.array(pathSchema).min(1).max(30).refine(paths => new Set(paths).size === paths.length, 'Duplicate group path') }).strict()).min(1).max(20) }).strict();
export type Guide = z.infer<typeof guideSchema>;
export type Group = z.infer<typeof groupSchema>['groups'][number];
export const projectAction = z.discriminatedUnion('type', [
  z.object({ type: z.literal('projectReady') }).strict(),
  z.object({ type: z.literal('projectStart') }).strict(),
  z.object({ type: z.literal('projectAddIntent'), intent: intentInput, replaces: z.uuid().optional() }).strict(),
  z.object({ type: z.literal('projectConfirmIntent'), id: z.uuid(), revision: sha }).strict(),
  z.object({ type: z.literal('projectSelectIntent'), id: z.uuid() }).strict(),
  z.object({ type: z.literal('projectImportIntent') }).strict(),
  z.object({ type: z.literal('projectConnectCapture') }).strict(),
  z.object({ type: z.literal('projectSelectFiles') }).strict(),
  z.object({ type: z.literal('projectSuggestFiles') }).strict(),
  z.object({ type: z.literal('projectUseGroup'), index: z.number().int().min(0).max(19) }).strict(),
  z.object({ type: z.literal('projectOpenSource'), path: pathSchema, snapshot: sha, line: z.number().int().positive().optional() }).strict(),
  z.object({ type: z.literal('projectOpenDiff'), path: pathSchema, snapshot: sha }).strict(),
  z.object({ type: z.literal('projectPreview'), operation: z.enum(['group', 'explain', 'plan']) }).strict(),
  z.object({ type: z.literal('projectSend'), identity: sha }).strict(),
  z.object({ type: z.literal('projectCopyPrompt') }).strict(),
  z.object({ type: z.literal('projectSelectCheck') }).strict(),
  z.object({ type: z.literal('projectRunCheck') }).strict(),
  z.object({ type: z.literal('projectCancel') }).strict(),
]);
export type ProjectAction = z.infer<typeof projectAction>;
export interface ProjectPreview { identity: string; operation: 'group' | 'explain' | 'plan'; model: string; instruction: string; text: string; snapshot: string; intentRevision?: string }
export interface GuideEvidence { snapshot: string; intentRevision: string; operation: 'explain' | 'plan'; result: Guide; responseId: string; model: string; latencyMs: number; totalTokens?: number }
export const checkSchema = z.object({ script: z.string().regex(/^[A-Za-z0-9:_-]{1,80}$/), packageHash: sha }).strict();
export interface CheckResult { snapshot: string; intentRevision?: string; script: string; packageHash: string; exitCode: number | null; kind: 'completed' | 'timeout' | 'error'; latencyMs: number; output: string }
export interface ProjectState {
  name: string; busy: boolean; operation?: string; error?: string; notice?: string; dirty?: boolean;
  specificationStale?: boolean; started: boolean; snapshot?: string; baseline?: string; fileCount: number; omitted: string[]; changes: FileChange[];
  intents: Intent[]; selectedIntent?: string; files: string[]; selectedFiles: string[];
  groups?: Group[]; groupSnapshot?: string; guide?: GuideEvidence; preview?: ProjectPreview;
  check?: z.infer<typeof checkSchema>; checkResult?: CheckResult; checkDefinitionStale?: boolean; captureConnected: boolean;
}
