import { z } from 'zod';
import { identitySchema } from './project-types.ts';

const anchorSchema = z.number().int().positive();
export const conceptSchema = z.object({ id: z.string().regex(/^concept-\d+$/), name: z.string().min(1).max(200), kind: z.enum(['function', 'class', 'interface', 'type']), startLine: anchorSchema, endLine: anchorSchema }).strict();
export const relationshipSchema = z.object({ from: conceptSchema.shape.id, to: conceptSchema.shape.id, kind: z.enum(['calls', 'constructs', 'uses type']), line: anchorSchema }).strict();
export const walkthroughSchema = z.object({
 projectId: identitySchema, fileId: identitySchema, sourceHash: identitySchema,
 startLine: anchorSchema, endLine: z.number().int().nonnegative(),
 status: z.enum(['ready', 'unsupported', 'invalid', 'empty']),
 concepts: z.array(conceptSchema).max(5), relationships: z.array(relationshipSchema).max(75),
 order: z.array(conceptSchema.shape.id).max(5), omittedConcepts: z.number().int().nonnegative(),
 message: z.string().max(1000),
}).strict().superRefine((value, context) => {
 const ids = new Set(value.concepts.map(concept => concept.id));
 const invalid = (message: string) => context.addIssue({ code: 'custom', message });
 if (ids.size !== value.concepts.length) invalid('Concept identities must be unique.');
 if (value.order.length !== ids.size || new Set(value.order).size !== ids.size || value.order.some(id => !ids.has(id))) invalid('Order must contain every concept exactly once.');
 if (value.status === 'ready' ? !ids.size : ids.size > 0 || value.relationships.length > 0) invalid('Walkthrough status must match its evidence.');
 if (value.concepts.some(concept => concept.startLine < value.startLine || concept.endLine > value.endLine || concept.endLine < concept.startLine)) invalid('Concepts must remain inside the captured excerpt.');
 if (value.relationships.some(edge => !ids.has(edge.from) || !ids.has(edge.to) || edge.line < value.startLine || edge.line > value.endLine)) invalid('Relationships must reference captured concepts and lines.');
});
export type Concept = z.infer<typeof conceptSchema>;
export type Relationship = z.infer<typeof relationshipSchema>;
export type Walkthrough = z.infer<typeof walkthroughSchema>;
