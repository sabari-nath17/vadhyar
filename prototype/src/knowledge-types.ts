import { z } from 'zod';
import { identitySchema } from './project-types.ts';
import { walkthroughSchema } from './walkthrough-types.ts';

export const knowledgeSelectionSchema = z.array(z.object({ fileId: identitySchema, sourceHash: identitySchema, startLine: z.number().int().min(1).max(999_999_999), lines: z.number().int().min(1).max(200).optional(), focus: z.string().regex(/^concept-\d+$/).optional() }).strict()).min(1).max(5).superRefine((files, context) => {
 if (new Set(files.map(file => `${file.fileId}:${file.startLine}:${file.lines ?? 160}`)).size !== files.length) context.addIssue({ code: 'custom', message: 'Select each source range once.' });
 if (files.some(file => files.some(other => other.fileId === file.fileId && other.sourceHash !== file.sourceHash))) context.addIssue({ code: 'custom', message: 'Ranges from one file must share the same saved revision.' });
});
export const knowledgeFileSchema = walkthroughSchema.safeExtend({ contextId: identitySchema, path: z.string().min(1).max(8192), truncated: z.boolean(), capturedAt: z.string().datetime(), fileBytes: z.number().nonnegative(), unresolvedModuleReferences: z.number().int().nonnegative() }).superRefine((file, context) => {
 if (file.endLine - file.startLine + 1 > 200 || file.endLine < file.startLine && !(file.startLine === 1 && file.endLine === 0 && file.fileBytes === 0)) context.addIssue({ code: 'custom', message: 'Knowledge captures are limited to 200 lines or a valid empty file.' });
});
export const moduleRelationshipSchema = z.object({ from: identitySchema, to: identitySchema, kind: z.enum(['imports', 're-exports']), line: z.number().int().positive() }).strict();
export const codebaseKnowledgeSchema = z.object({
 projectId: identitySchema, knowledgeId: identitySchema, analysisVersion: z.literal(2), generatedAt: z.string().datetime(),
 files: z.array(knowledgeFileSchema).min(1).max(5), relationships: z.array(moduleRelationshipSchema).max(50), order: z.array(identitySchema).min(1).max(5), limits: z.array(z.string().min(1).max(1000)).min(1).max(8),
}).strict().superRefine((value, context) => {
 const ids = new Set(value.files.map(file => file.contextId));
 const invalid = (message: string) => context.addIssue({ code: 'custom', message });
 if (ids.size !== value.files.length || new Set(value.files.map(file => `${file.fileId}:${file.startLine}:${file.endLine}`)).size !== value.files.length) invalid('Captured context identities and source ranges must be unique.');
 if (value.files.some(file => value.files.some(other => file.fileId === other.fileId ? file.path !== other.path || file.sourceHash !== other.sourceHash : file.path === other.path))) invalid('Captured ranges must have consistent file paths and saved revisions.');
 if (value.files.some(file => file.projectId !== value.projectId)) invalid('Every captured file must belong to this project.');
 if (value.order.length !== ids.size || new Set(value.order).size !== ids.size || value.order.some(id => !ids.has(id)) || value.order[0] !== value.files[0].contextId) invalid('Reading order must start at the selected entry and include every captured range once.');
 if (new Set(value.relationships.map(edge => `${edge.from}:${edge.to}:${edge.kind}`)).size !== value.relationships.length) invalid('Module relationships must be unique.');
 for (const edge of value.relationships) {
  const file = value.files.find(file => file.contextId === edge.from), target = value.files.find(file => file.contextId === edge.to);
  if (!file || !target || [file.status, target.status].some(status => ['unsupported', 'invalid'].includes(status)) || edge.line < file.startLine || edge.line > file.endLine) invalid('Module relationships must reference supported captured files and lines.');
 }
});
export type KnowledgeSelection = z.infer<typeof knowledgeSelectionSchema>;
export type CodebaseKnowledge = z.infer<typeof codebaseKnowledgeSchema>;
