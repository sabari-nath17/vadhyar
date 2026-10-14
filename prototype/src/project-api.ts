import { z } from 'zod';
import { filesPageSchema, projectSourceStateSchema, projectChangesSchema, projectVersionsSchema, projectInfoSchema, projectRunSchema, scriptsSchema, sourceSnapshotSchema, type SourceSnapshot, type ProjectSourceState, type ProjectScript } from './project-types.js';
const errorSchema = z.object({ error: z.object({ message: z.string().max(1000), code: z.string().max(80).optional() }).passthrough() }).passthrough();
export class ProjectApiError extends Error { constructor(public status: number, public code: string, message: string) { super(message); } }
export async function projectRequest<T>(path: string, schema: z.ZodType<T>, body?: unknown, signal?: AbortSignal): Promise<T> {
 const timeout = AbortSignal.timeout(body === undefined ? 15_000 : 70_000);
 const response = await fetch(path, { method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin', headers: body === undefined ? undefined : { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), signal: signal ? AbortSignal.any([signal, timeout]) : timeout });
 let value: unknown; try { value = await response.json(); } catch { throw new Error('The local project service returned an unreadable response.'); }
 if (!response.ok) { const error = errorSchema.safeParse(value); throw new ProjectApiError(response.status, error.success ? error.data.error.code ?? 'request_failed' : 'request_failed', error.success ? error.data.error.message : `Project request failed (${response.status}).`); }
 return schema.parse(value);
}
export async function connectProject() { const response = await fetch('/api/session', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: '{}', signal: AbortSignal.timeout(15_000) }); if (!response.ok) throw new Error('Local project connection failed. Restart the launcher and retry.'); return projectRequest('/api/projects/current', projectInfoSchema); }
export const getProject = () => projectRequest('/api/projects/current', projectInfoSchema);
export const getFiles = (projectId: string, query: string, cursor: string | null, signal?: AbortSignal) => projectRequest(`/api/projects/${projectId}/files?${new URLSearchParams({ q: query, limit: '50', ...(cursor ? { cursor } : {}) })}`, filesPageSchema, undefined, signal);
export const getSource = (projectId: string, fileId: string, start = 1, lines = 160) => projectRequest(`/api/projects/${projectId}/source?${new URLSearchParams({ fileId, start: String(start), lines: String(lines) })}`, sourceSnapshotSchema);
export const getCapturedSource = (source: SourceSnapshot) => getSource(source.projectId, source.fileId, source.startLine, Math.max(1, source.endLine - source.startLine + 1));
export const getScripts = (projectId: string) => projectRequest(`/api/projects/${projectId}/scripts`, scriptsSchema);
export const runScript = (source: SourceSnapshot, script: ProjectScript) => projectRequest(`/api/projects/${source.projectId}/runs`, projectRunSchema, { scriptId: script.id, fileId: source.fileId, sourceHash: source.sourceHash, manifestHash: script.manifestHash, approved: true });
export const getRun = (projectId: string, runId: string) => projectRequest(`/api/projects/${projectId}/runs/${runId}`, projectRunSchema);

export const getChanges = (projectId: string) => projectRequest(`/api/projects/${projectId}/changes?limit=20`, projectChangesSchema);
export const getVersions = (projectId: string, fileId: string) => projectRequest(`/api/projects/${projectId}/versions?${new URLSearchParams({fileId,limit:'20'})}`, projectVersionsSchema);

export const getSourceState = (projectId: string, fileId: string, signal?: AbortSignal) => projectRequest(`/api/projects/${projectId}/source-state?${new URLSearchParams({ fileId })}`, projectSourceStateSchema, undefined, signal);
export function sourceFreshness(source: SourceSnapshot, state: ProjectSourceState | null): 'current' | 'changed' | 'unknown' {
 return !state || state.fileId !== source.fileId || state.status === 'unavailable' ? 'unknown' : state.sourceHash === source.sourceHash ? 'current' : 'changed';
}
