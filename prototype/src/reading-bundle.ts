import { sourceSnapshotSchema, type SourceSnapshot } from './project-types.js';
import type { Walkthrough } from './walkthrough-types.js';

export type ReadingCapture = { source: SourceSnapshot; focus?: string };
type Frame = Pick<SourceSnapshot, 'projectId' | 'fileId' | 'sourceHash' | 'startLine' | 'endLine'>;
export const readingCaptureKey = (source: Frame) => [source.projectId, source.fileId, source.sourceHash, source.startLine, source.endLine].join(':');
export const canUseReadingConcept = (status: Walkthrough['status'], complete: boolean) => complete && status !== 'invalid' && status !== 'unsupported';

export function inspectCapturedLine(source: SourceSnapshot, line: number): SourceSnapshot {
 const text = source.text.split('\n')[line - source.startLine];
 if (!Number.isInteger(line) || line < source.startLine || line > source.endLine || text === undefined) throw new Error('Choose a line inside this retained capture.');
 return { ...source, startLine: line, endLine: line, text, truncated: true };
}

export function putReadingCapture(captures: ReadingCapture[], input: SourceSnapshot, replaceKey?: string): ReadingCapture[] {
 const source = sourceSnapshotSchema.parse(input), span = source.endLine - source.startLine + 1;
 if (span > 200 || span < 1 && !(source.startLine === 1 && source.endLine === 0 && source.fileBytes === 0)) throw new Error('Choose a captured range of up to 200 lines, or a valid empty file.');
 if (captures.some(capture => capture.source.projectId !== source.projectId)) throw new Error('Keep this reading bundle within one project.');
 const duplicate = captures.findIndex(capture => readingCaptureKey(capture.source) === readingCaptureKey(source));
 if (duplicate >= 0) throw new Error('This exact captured range is already included.');
 if (replaceKey !== undefined) {
  const index = captures.findIndex(capture => readingCaptureKey(capture.source) === replaceKey);
  if (index < 0 || captures[index].source.fileId !== source.fileId || captures[index].source.startLine !== source.startLine) throw new Error('Display the same file and starting line before replacing this capture.');
  return captures.map((capture, position) => position === index ? { source } : capture);
 }
 if (captures.some(capture => capture.source.fileId === source.fileId && capture.source.startLine === source.startLine && capture.source.endLine === source.endLine)) throw new Error('This file range is already captured. Explicitly replace it with the displayed capture.');
 if (captures.length >= 5) throw new Error('A reading bundle holds up to five captures. Remove one before adding another.');
 return [...captures, { source }];
}

export function chooseReadingEntry(captures: ReadingCapture[], key: string): ReadingCapture[] {
 const entry = captures.find(capture => readingCaptureKey(capture.source) === key);
 if (!entry) throw new Error('Choose an existing captured range as the entry.');
 return [entry, ...captures.filter(capture => capture !== entry)];
}

export function hasMixedReadingVersions(captures: ReadingCapture[]): boolean {
 return captures.some(capture => captures.some(other => other.source.fileId === capture.source.fileId && other.source.sourceHash !== capture.source.sourceHash));
}

export function readingPins(captures: ReadingCapture[]) {
 if (!captures.length || hasMixedReadingVersions(captures)) throw new Error('Capture one consistent saved version of each selected file before analysis.');
 return captures.map(({ source, focus }) => ({ fileId: source.fileId, sourceHash: source.sourceHash, startLine: source.startLine, lines: Math.max(1, source.endLine - source.startLine + 1), ...(focus ? { focus } : {}) }));
}

export function findCapturedSource(captures: ReadingCapture[], input: string) {
 const query = input.trim().slice(0, 200).toLowerCase();
 const matches: { key: string; fileId: string; path: string; line: number; text: string }[] = [];
 if (!query) return { matches, truncated: false };
 for (const { source } of captures) for (const [offset, text] of source.text.split('\n').entries()) {
  const line = source.startLine + offset;
  if (line > source.endLine || !text.toLowerCase().includes(query)) continue;
  if (matches.length === 30) return { matches, truncated: true };
  matches.push({ key: readingCaptureKey(source), fileId: source.fileId, path: source.path, line, text });
 }
 return { matches, truncated: false };
}
