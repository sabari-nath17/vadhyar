// PocketFlow's selected concepts → relationships → reading order port; retained notice: docs/third-party/pocketflow-LICENSE.txt.
import { createHash } from 'node:crypto';
import { posix } from 'node:path';
import ts from 'typescript';
import { z } from 'zod';
import { sourceSnapshotSchema } from './project-types.ts';
import { createSourceWalkthrough, orderConcepts } from './source-concepts.ts';
import { codebaseKnowledgeSchema, type CodebaseKnowledge } from './knowledge-types.ts';

export function createCodebaseKnowledge(input: unknown[], focuses?: (string | undefined)[]): CodebaseKnowledge {
 const sources = z.array(sourceSnapshotSchema).min(1).max(5).parse(input);
 if (new Set(sources.map(source => `${source.fileId}:${source.startLine}:${source.endLine}`)).size !== sources.length || sources.some(source => source.projectId !== sources[0].projectId || sources.some(other => source.fileId === other.fileId ? source.path !== other.path || source.sourceHash !== other.sourceHash : source.path === other.path))) throw new Error('Select distinct captured ranges from one project and saved revision.');
 if (focuses && (focuses.length !== sources.length || focuses.some(focus => focus !== undefined && !/^concept-\d+$/.test(focus)))) throw new Error('Select a valid declaration focus for each captured range.');
 const digest = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
 const files = sources.map((source, index) => ({ ...createSourceWalkthrough(source, focuses?.[index]), contextId: digest({ projectId: source.projectId, fileId: source.fileId, sourceHash: source.sourceHash, startLine: source.startLine, endLine: source.endLine, truncated: source.truncated }), path: source.path, truncated: source.truncated, capturedAt: source.capturedAt, fileBytes: source.fileBytes, unresolvedModuleReferences: 0 }));
 const relationships: CodebaseKnowledge['relationships'] = [], seen = new Set<string>();
 const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];
 // Resolution uses captured paths only; no filesystem, tsconfig, packages or library files are consulted.
 const resolve = (specifier: string, from: string) => {
  if (!specifier.startsWith('./') && !specifier.startsWith('../')) return undefined;
  const base = posix.normalize(posix.join(posix.dirname(from), specifier)), candidates = [base];
  if (/\.(?:js|jsx)$/.test(base)) candidates.push(base.replace(/\.jsx?$/, '.ts'), base.replace(/\.jsx?$/, '.tsx'));
  if (!posix.extname(base)) for (const extension of extensions) candidates.push(base + extension, posix.join(base, 'index' + extension));
  const matches = files.filter(file => candidates.includes(file.path));
  if (new Set(matches.map(file => file.fileId)).size !== 1) return undefined;
  return matches.find(file => file.startLine === 1 && !['unsupported', 'invalid'].includes(file.status)) ?? matches.find(file => !['unsupported', 'invalid'].includes(file.status));
 };
 for (const [index, source] of sources.entries()) {
  const current = files[index];
  if (['unsupported', 'invalid'].includes(current.status)) continue;
  const ast = ts.createSourceFile(source.path, source.text, ts.ScriptTarget.Latest, true);
  for (const statement of ast.statements) {
   if (!ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement) || !statement.moduleSpecifier || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
   // Partial frames may retain complete imports; incomplete declarations cannot create evidence.
   if (ts.transpileModule(statement.getText(ast), { fileName: source.path, reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.Latest, jsx: ts.JsxEmit.Preserve } }).diagnostics?.some(diagnostic => diagnostic.category === ts.DiagnosticCategory.Error)) continue;
   const target = resolve(statement.moduleSpecifier.text, source.path);
   if (!target) { current.unresolvedModuleReferences++; continue; }
   const kind = ts.isImportDeclaration(statement) ? 'imports' : 're-exports', key = `${current.contextId}:${target.contextId}:${kind}`;
   if (seen.has(key)) continue;
   seen.add(key); relationships.push({ from: current.contextId, to: target.contextId, kind, line: source.startLine + ast.getLineAndCharacterOfPosition(statement.moduleSpecifier.getStart(ast)).line });
  }
 }
 const analysisVersion = 2;
 const knowledgeId = digest({ projectId: sources[0].projectId, analysisVersion, sources: files.map(({ contextId, path, order }) => ({ contextId, path, order })) });
 return codebaseKnowledgeSchema.parse({ projectId: sources[0].projectId, knowledgeId, analysisVersion, generatedAt: new Date().toISOString(), files, relationships, order: orderConcepts(files.map(file => ({ id: file.contextId })), relationships, files[0].contextId), limits: [
  'Selected saved excerpts only: up to five captured ranges, 200 lines and 40,000 characters per range, 100 visible declarations and five graph concepts per excerpt. Incomplete declarations, omitted entries and truncated captures remain visible.',
  'Relative import and re-export links are file relationships, not cross-file function calls or runtime traces. External, missing, ambiguous, dynamic, require, namespace/member dispatch and configured-alias relationships are outside coverage.',
  'Sequential source captures and rechecks are not an atomic whole-project snapshot or a continued freshness guarantee. Unsaved buffers, unselected source and runtime/environment state are outside this evidence.',
  'The reading order is a static proposal. It does not confirm requirements, execute checks, advance learning stages or establish mastery. No source is sent to a provider by this operation.',
 ] });
}
