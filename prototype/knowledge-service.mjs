import { URL } from 'node:url';
import { randomUUID } from 'node:crypto';
import process from 'node:process';
import { clearTimeout, setTimeout } from 'node:timers';
import { knowledgeSelectionSchema } from './src/knowledge-types.ts';
import { sourceSnapshotSchema } from './src/project-types.ts';
import { createCodebaseKnowledge } from './src/source-knowledge.ts';

class KnowledgeError extends Error {
 constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}
// Mount only inside createProjectService's Host, Origin and session checks.
export function createKnowledgeHandler({ readSource }) {
 let busy = false;
 return async (request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1'), route = /^\/api\/projects\/([a-f0-9]{64})\/knowledge$/.exec(url.pathname);
  if (!route) return false;
  const operationId = randomUUID(), startedAt = Date.now(); let outcome = 'cancelled', fileCount = 0;
  const send = (status, value) => { if (response.destroyed || response.writableEnded) return; outcome = String(status); response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }); response.end(JSON.stringify(value)); };
  const fail = (status, code, message) => { throw new KnowledgeError(status, code, message); };
  let active = false, cancelled = false, timer;
  const cancel = () => { cancelled = true; };
  try {
   if (request.method !== 'GET') fail(405, 'invalid_method', 'Use GET to inspect selected-source knowledge.');
   if (request.headers['transfer-encoding'] || Number(request.headers['content-length'] ?? 0) !== 0) { request.resume(); fail(400, 'invalid_body', 'Source-knowledge GET requests do not accept a body.'); }
   const raw = url.searchParams.get('selection');
   if (!raw || raw.length > 4096 || [...url.searchParams.keys()].length !== 1 || url.searchParams.getAll('selection').length !== 1) fail(400, 'invalid_selection', 'Select one to five captured ranges with their current identities.');
   let input; try { input = JSON.parse(raw); } catch { fail(400, 'invalid_selection', 'The selected-source request is not valid JSON.'); }
   const parsed = knowledgeSelectionSchema.safeParse(input);
   if (!parsed.success) fail(400, 'invalid_selection', 'Select unique host-issued file identities and valid source ranges.');
   if (busy) fail(429, 'knowledge_busy', 'Another source-knowledge request is in progress. Wait for it to finish.');
   busy = true; active = true; response.once('close', cancel);
   fileCount = parsed.data.length;
   // The response deadline stops queued work; a current host read retains its own 30-second guard.
   timer = setTimeout(() => { cancelled = true; send(408, { error: { code: 'knowledge_timeout', message: 'Source-knowledge capture exceeded 12 seconds. Select fewer or smaller files and retry.' } }); }, 12_000);
   const sources = [];
   for (const pin of parsed.data) {
    if (cancelled || response.destroyed) return true;
    const source = sourceSnapshotSchema.parse(await readSource(pin.fileId, pin.startLine, pin.lines ?? 160));
    if (source.projectId !== route[1] || source.fileId !== pin.fileId) fail(404, 'unknown_project', 'The selected source does not belong to this project.');
    if (source.sourceHash !== pin.sourceHash || source.startLine !== pin.startLine) fail(409, 'source_changed', 'A selected source changed. Capture it again before building knowledge.');
    if (source.endLine - source.startLine + 1 > (pin.lines ?? 160)) fail(422, 'knowledge_unavailable', 'The captured source exceeds the requested range.');
    sources.push(source);
   }
   if (cancelled || response.destroyed) return true;
   const knowledge = createCodebaseKnowledge(sources, parsed.data.map(pin => pin.focus));
   for (const [index, before] of sources.entries()) {
    if (cancelled || response.destroyed) return true;
    const after = sourceSnapshotSchema.parse(await readSource(before.fileId, before.startLine, parsed.data[index].lines ?? 160));
    if (['projectId', 'fileId', 'path', 'sourceHash', 'startLine', 'endLine', 'text', 'truncated', 'fileBytes'].some(key => before[key] !== after[key])) fail(409, 'source_changed', 'A selected source changed during analysis. Capture the selection again.');
   }
   if (!cancelled) send(200, knowledge);
  } catch (error) {
   if (error instanceof KnowledgeError) send(error.status, { error: { code: error.code, message: error.message } });
   else {
    const status = [404, 408, 409, 416, 422, 429, 503].includes(error?.status) ? error.status : 422;
    send(status, { error: { code: 'knowledge_unavailable', message: 'Selected-source knowledge could not be captured safely. Load the source again and retry.' } });
   }
  } finally {
   if (active) {
    clearTimeout(timer); response.removeListener('close', cancel); busy = false;
    if (process.env.NODE_ENV !== 'production') process.stderr.write(JSON.stringify({ operation: 'knowledge', operationId, durationMs: Date.now() - startedAt, outcome, fileCount }) + '\n');
   }
  }
  return true;
 };
}
