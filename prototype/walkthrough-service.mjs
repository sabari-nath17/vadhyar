import { URL } from 'node:url';
import { z } from 'zod';
import { createSourceWalkthrough } from './src/source-concepts.ts';
const identity = z.string().regex(/^[a-f0-9]{64}$/);
const inputSchema = z.object({ fileId: identity, sourceHash: identity, start: z.string().regex(/^[1-9]\d{0,8}$/), lines: z.string().regex(/^[1-9]\d{0,2}$/).refine(value => Number(value) <= 200).optional(), focus: z.string().max(80).regex(/^concept-\d+$/).optional() }).strict();
// Mounted only inside createProjectService's Host, origin and session checks.
export function createWalkthroughHandler({ readSource }) {
 return async (request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  const route = /^\/api\/projects\/([a-f0-9]{64})\/walkthrough$/.exec(url.pathname);
  if (!route) return false;
  const send = (status, value) => { response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); response.end(JSON.stringify(value)); };
  const fail = (status, message) => send(status, { error: { message } });
  if (request.method !== 'GET') { fail(405, 'Use GET to inspect captured source concepts.'); return true; }
  const parsed = inputSchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success || [...url.searchParams.keys()].some(key => url.searchParams.getAll(key).length !== 1)) { fail(400, 'Choose captured source with its full-file identity and a valid source range.'); return true; }
  try {
   const start = Number(parsed.data.start), lines = Number(parsed.data.lines ?? 160);
   const source = await readSource(parsed.data.fileId, start, lines);
   if (source.projectId !== route[1] || source.fileId !== parsed.data.fileId) { fail(404, 'The captured source does not belong to this project.'); return true; }
   if (source.sourceHash !== parsed.data.sourceHash) { fail(409, 'The saved source changed. Load the excerpt again before exploring concepts.'); return true; }
   if (source.startLine !== start || source.endLine - source.startLine + 1 > lines) { fail(422, 'The returned capture does not match the requested source range.'); return true; }
   send(200, createSourceWalkthrough(source, parsed.data.focus));
  } catch { fail(422, 'This source could not be read or analyzed safely. Load a supported excerpt again.'); }
  return true;
 };
}
