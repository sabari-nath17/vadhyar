import { z } from 'zod';
import { identitySchema } from './project-types.ts';

const anchorSchema = z.number().int().positive();
export const conceptSchema = z.object({ id: z.string().regex(/^concept-\d+$/), name: z.string().min(1).max(200), kind: z.enum(['function', 'class', 'interface', 'type']), startLine: anchorSchema, endLine: anchorSchema }).strict();
export const catalogDeclarationSchema = conceptSchema.extend({ scope: z.string().min(1).max(300), complete: z.boolean() }).strict();
export const relationshipSchema = z.object({ from: conceptSchema.shape.id, to: conceptSchema.shape.id, kind: z.enum(['calls', 'constructs', 'uses type']), line: anchorSchema }).strict();
export const walkthroughSchema = z.object({
 projectId: identitySchema, fileId: identitySchema, sourceHash: identitySchema,
 startLine: anchorSchema, endLine: z.number().int().nonnegative(),
 status: z.enum(['ready', 'partial', 'unsupported', 'invalid', 'empty']),
 concepts: z.array(conceptSchema).max(5), relationships: z.array(relationshipSchema).max(75),
 order: z.array(conceptSchema.shape.id).max(5), omittedConcepts: z.number().int().nonnegative(),
 catalog: z.array(catalogDeclarationSchema).max(100), omittedDeclarations: z.number().int().nonnegative(),
 message: z.string().max(1000),
}).strict().superRefine((value, context) => {
 const ids = new Set(value.concepts.map(concept => concept.id));
 const invalid = (message: string) => context.addIssue({ code: 'custom', message });
 const catalogIds = new Set(value.catalog.map(declaration => declaration.id));
 if (ids.size !== value.concepts.length) invalid('Concept identities must be unique.');
 if (catalogIds.size !== value.catalog.length) invalid('Declaration identities must be unique.');
 if (value.order.length !== ids.size || new Set(value.order).size !== ids.size || value.order.some(id => !ids.has(id))) invalid('Order must contain every concept exactly once.');
 if (['ready', 'partial'].includes(value.status) ? !ids.size : ids.size > 0 || value.relationships.length > 0) invalid('Walkthrough status must match its evidence.');
 if (value.status === 'partial' && value.relationships.length) invalid('Partial captures cannot establish bound relationships.');
 if (value.endLine - value.startLine + 1 > 200 || value.endLine < value.startLine && !(value.startLine === 1 && value.endLine === 0)) invalid('Walkthroughs require a captured range of at most 200 lines or a valid empty file.');
 if (value.catalog.some(declaration => declaration.startLine < value.startLine || declaration.endLine > value.endLine || declaration.endLine < declaration.startLine)) invalid('Declarations must remain inside the visible captured excerpt.');
 if (value.concepts.some(concept => !value.catalog.some(declaration => declaration.complete && Object.entries(concept).every(([key, item]) => declaration[key as keyof typeof declaration] === item)))) invalid('Every graph concept must match a complete captured declaration.');
 if (value.concepts.some(concept => concept.startLine < value.startLine || concept.endLine > value.endLine || concept.endLine < concept.startLine)) invalid('Concepts must remain inside the captured excerpt.');
 if (value.relationships.some(edge => !ids.has(edge.from) || !ids.has(edge.to) || edge.line < value.startLine || edge.line > value.endLine)) invalid('Relationships must reference captured concepts and lines.');
});
export type Concept = z.infer<typeof conceptSchema>;
export type CatalogDeclaration = z.infer<typeof catalogDeclarationSchema>;
export type Relationship = z.infer<typeof relationshipSchema>;
export type Walkthrough = z.infer<typeof walkthroughSchema>;
