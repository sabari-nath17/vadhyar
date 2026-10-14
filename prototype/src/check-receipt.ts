import type { ProjectAttempt } from './project-learning.js';
import { projectRunSchema, type ProjectRun } from './project-types.js';

export function checkReceiptBuffer(attempt: ProjectAttempt, operationId: string, value: ProjectRun) {
 const run = projectRunSchema.parse(value), p = attempt.pendingCheck;
 const matching = p && p.operationId === operationId && run.projectId === attempt.current.projectId && run.fileId === p.fileId && run.sourceHash === p.sourceHash && run.manifestHash === p.manifestHash && run.scriptId === p.scriptId && (p.id === null || p.id === run.id);
 const coherent = run.status === 'running' ? run.finishedAt === null && run.exitCode === null : run.finishedAt !== null && Date.parse(run.finishedAt) >= Date.parse(run.startedAt) && (run.status !== 'passed' || run.exitCode === 0) && (run.status !== 'failed' || (run.exitCode !== null && run.exitCode !== 0));
 if (!matching || !coherent) throw new Error('The returned receipt does not match this question’s approved operation.');
 return { attemptId: attempt.id, operationId, run };
}
export type CheckReceiptBuffer = ReturnType<typeof checkReceiptBuffer>;
