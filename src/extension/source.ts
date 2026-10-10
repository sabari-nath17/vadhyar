import { createHash } from 'node:crypto';
import { readFile, realpath, stat } from 'node:fs/promises';
import { isAbsolute, join, relative } from 'node:path';
import type { SourceRef } from '../shared.js';

export const hash = (text: string) => createHash('sha256').update(text).digest('hex');
export interface PreparedFile { path: string; absolutePath: string; content: string; hash: string }

export async function readPrepared(root: string, path: string): Promise<PreparedFile> {
  if (!['src/approval.ts', 'vadhyar-requirement.md'].includes(path)) throw new Error('Unsupported source path.');
  const base = await realpath(root);
  const absolutePath = await realpath(join(base, path));
  const inside = relative(base, absolutePath);
  if (isAbsolute(inside) || inside.startsWith('..')) throw new Error('Source crosses the workspace boundary.');
  const info = await stat(absolutePath);
  if (!info.isFile() || info.size > 20_000) throw new Error('Prepared file exceeds the supported size.');
  const content = await readFile(absolutePath, 'utf8');
  return { path, absolutePath, content, hash: hash(content) };
}

export function approvalReference(source: PreparedFile): SourceRef {
  const lines = source.content.trimEnd().split('\n');
  const startLine = lines.findIndex(line => line.startsWith('export function canApproveMilestone(')) + 1;
  if (!startLine) throw new Error('Prepared approval entrypoint is missing.');
  return { id: `approval-${source.hash}`, path: source.path, startLine, endLine: lines.length, symbol: 'canApproveMilestone', hash: source.hash };
}

export function withApprovalReference(refs: SourceRef[], source: PreparedFile): SourceRef[] {
  const approval = approvalReference(source);
  return [...refs.filter(ref => ref.hash === source.hash && ref.id !== approval.id), approval];
}

export function resolveReference(refs: SourceRef[], id: string, source: PreparedFile): SourceRef {
  const ref = refs.find(item => item.id === id);
  if (!ref) throw new Error('Unknown source reference.');
  if (ref.path !== source.path || ref.hash !== source.hash) throw new Error('Source reference is stale; refresh context.');
  if (!Number.isInteger(ref.startLine) || !Number.isInteger(ref.endLine) || ref.startLine < 1 || ref.endLine < ref.startLine || ref.endLine > source.content.trimEnd().split('\n').length) throw new Error('Invalid source line span.');
  return ref;
}
