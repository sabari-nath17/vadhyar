import { projectRequest } from './project-api.js';
import { identitySchema } from './project-types.js';
import { codebaseKnowledgeSchema, knowledgeSelectionSchema, type CodebaseKnowledge, type KnowledgeSelection } from './knowledge-types.js';

export async function getSelectedKnowledge(projectId: string, selection: KnowledgeSelection, signal?: AbortSignal): Promise<CodebaseKnowledge> {
 const id = identitySchema.parse(projectId), pins = knowledgeSelectionSchema.parse(selection);
 const value = await projectRequest(`/api/projects/${id}/knowledge?${new URLSearchParams({ selection: JSON.stringify(pins) })}`, codebaseKnowledgeSchema, undefined, signal);
 if (signal?.aborted) throw signal.reason ?? new Error('The knowledge request was cancelled.');
 if (value.projectId !== id || value.files.length !== pins.length || value.files.some((file, index) => file.fileId !== pins[index].fileId || file.sourceHash !== pins[index].sourceHash || file.startLine !== pins[index].startLine || file.endLine - file.startLine + 1 > (pins[index].lines ?? 160) || pins[index].focus !== undefined && file.order[0] !== pins[index].focus)) throw new Error('The knowledge response does not match this selected source. Capture it again.');
 return value;
}
