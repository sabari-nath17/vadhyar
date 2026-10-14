// PocketFlow's selected concepts → relationships → reading order port; retained notice: docs/third-party/pocketflow-LICENSE.txt.
import { createHash } from 'node:crypto';
import { posix } from 'node:path';
import ts from 'typescript';
import { z } from 'zod';
import { sourceSnapshotSchema } from './project-types.ts';
import { createSourceWalkthrough, orderConcepts } from './source-concepts.ts';
import { codebaseKnowledgeSchema, type CodebaseKnowledge } from './knowledge-types.ts';

export function createCodebaseKnowledge(input: unknown[]): CodebaseKnowledge {
 const sources = z.array(sourceSnapshotSchema).min(1).max(5).parse(input);
 if (new Set(sources.map(source => source.fileId)).size !== sources.length || new Set(sources.map(source => source.path)).size !== sources.length || sources.some(source => source.projectId !== sources[0].projectId)) throw new Error('Select unique captured files from one project.');
 const files = sources.map(source => ({ ...createSourceWalkthrough(source), path: source.path, truncated: source.truncated, capturedAt: source.capturedAt, fileBytes: source.fileBytes, unresolvedModuleReferences: 0 }));
 const relationships: CodebaseKnowledge['relationships'] = [], seen = new Set<string>();
 const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];
 // Resolution uses captured paths only; no filesystem, tsconfig, packages or library files are consulted.
 const resolve = (specifier: string, from: string) => {
  if (!specifier.startsWith('./') && !specifier.startsWith('../')) return undefined;
  const base = posix.normalize(posix.join(posix.dirname(from), specifier)), candidates = [base];
  if (/\.(?:js|jsx)$/.test(base)) candidates.push(base.replace(/\.jsx?$/, '.ts'), base.replace(/\.jsx?$/, '.tsx'));
  if (!posix.extname(base)) for (const extension of extensions) candidates.push(base + extension, posix.join(base, 'index' + extension));
  const matches = files.filter(file => candidates.includes(file.path));
  return matches.length === 1 && !['unsupported', 'invalid'].includes(matches[0].status) ? matches[0] : undefined;
 };
 for (const [index, source] of sources.entries()) {
  const current = files[index];
  if (['unsupported', 'invalid'].includes(current.status)) continue;
  const ast = ts.createSourceFile(source.path, source.text, ts.ScriptTarget.Latest, true);
  for (const statement of ast.statements) {
   if (!ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement) || !statement.moduleSpecifier || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
   const target = resolve(statement.moduleSpecifier.text, source.path);
   if (!target) { current.unresolvedModuleReferences++; continue; }
   const kind = ts.isImportDeclaration(statement) ? 'imports' : 're-exports', key = `${current.fileId}:${target.fileId}:${kind}`;
   if (seen.has(key)) continue;
   seen.add(key); relationships.push({ from: current.fileId, to: target.fileId, kind, line: source.startLine + ast.getLineAndCharacterOfPosition(statement.moduleSpecifier.getStart(ast)).line });
  }
 }
 const analysisVersion = 1;
 const knowledgeId = createHash('sha256').update(JSON.stringify({ projectId: sources[0].projectId, analysisVersion, sources: files.map(({ fileId, path, sourceHash, startLine, endLine, truncated }) => ({ fileId, path, sourceHash, startLine, endLine, truncated })) })).digest('hex');
 return codebaseKnowledgeSchema.parse({ projectId: sources[0].projectId, knowledgeId, analysisVersion, generatedAt: new Date().toISOString(), files, relationships, order: orderConcepts(files.map(file => ({ id: file.fileId })), relationships, files[0].fileId), limits: [
  'Selected saved excerpts only: up to five files, 160 lines and 40,000 characters per file, five named top-level concepts per excerpt. Omitted concepts and truncated captures remain visible.',
  'Relative import and re-export links are file relationships, not cross-file function calls or runtime traces. External, missing, ambiguous, dynamic, require, namespace/member dispatch and configured-alias relationships are outside coverage.',
  'Sequential source captures and rechecks are not an atomic whole-project snapshot or a continued freshness guarantee. Unsaved buffers, unselected source and runtime/environment state are outside this evidence.',
  'The reading order is a static proposal. It does not confirm requirements, execute checks, advance learning stages or establish mastery. No source is sent to a provider by this operation.',
 ] });
}
