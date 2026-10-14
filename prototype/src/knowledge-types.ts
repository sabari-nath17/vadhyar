import { z } from 'zod';
import { identitySchema } from './project-types.ts';
import { walkthroughSchema } from './walkthrough-types.ts';

export const knowledgeSelectionSchema = z.array(z.object({ fileId: identitySchema, sourceHash: identitySchema, startLine: z.number().int().min(1).max(999_999_999) }).strict()).min(1).max(5).superRefine((files, context) => {
 if (new Set(files.map(file => file.fileId)).size !== files.length) context.addIssue({ code: 'custom', message: 'Select each file once.' });
});
export const knowledgeFileSchema = walkthroughSchema.safeExtend({ path: z.string().min(1).max(8192), truncated: z.boolean(), capturedAt: z.string().datetime(), fileBytes: z.number().nonnegative(), unresolvedModuleReferences: z.number().int().nonnegative() }).superRefine((file, context) => {
 if (file.endLine - file.startLine + 1 > 160 || file.endLine < file.startLine && !(file.startLine === 1 && file.endLine === 0 && file.fileBytes === 0)) context.addIssue({ code: 'custom', message: 'Knowledge captures are limited to 160 lines or a valid empty file.' });
});
export const moduleRelationshipSchema = z.object({ from: identitySchema, to: identitySchema, kind: z.enum(['imports', 're-exports']), line: z.number().int().positive() }).strict();
export const codebaseKnowledgeSchema = z.object({
 projectId: identitySchema, knowledgeId: identitySchema, analysisVersion: z.literal(1), generatedAt: z.string().datetime(),
 files: z.array(knowledgeFileSchema).min(1).max(5), relationships: z.array(moduleRelationshipSchema).max(50), order: z.array(identitySchema).min(1).max(5), limits: z.array(z.string().min(1).max(1000)).min(1).max(8),
}).strict().superRefine((value, context) => {
 const ids = new Set(value.files.map(file => file.fileId));
 const invalid = (message: string) => context.addIssue({ code: 'custom', message });
 if (ids.size !== value.files.length || new Set(value.files.map(file => file.path)).size !== value.files.length) invalid('Knowledge files and paths must be unique.');
 if (value.files.some(file => file.projectId !== value.projectId)) invalid('Every captured file must belong to this project.');
 if (value.order.length !== ids.size || new Set(value.order).size !== ids.size || value.order.some(id => !ids.has(id)) || value.order[0] !== value.files[0].fileId) invalid('Reading order must start at the selected entry and include every file once.');
 if (new Set(value.relationships.map(edge => `${edge.from}:${edge.to}:${edge.kind}`)).size !== value.relationships.length) invalid('Module relationships must be unique.');
 for (const edge of value.relationships) {
  const file = value.files.find(file => file.fileId === edge.from), target = value.files.find(file => file.fileId === edge.to);
  if (!file || !target || [file.status, target.status].some(status => ['unsupported', 'invalid'].includes(status)) || edge.line < file.startLine || edge.line > file.endLine) invalid('Module relationships must reference supported captured files and lines.');
 }
});
export type KnowledgeSelection = z.infer<typeof knowledgeSelectionSchema>;
export type CodebaseKnowledge = z.infer<typeof codebaseKnowledgeSchema>;
