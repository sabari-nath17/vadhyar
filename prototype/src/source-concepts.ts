// Adapted from PocketFlow nodes.py / flow.py at 05b24cbbb0fe409c5e23c9791f0342f07524ffdc; see docs/third-party/pocketflow-LICENSE.txt.
import ts from 'typescript';
import { sourceSnapshotSchema } from './project-types.ts';
import { walkthroughSchema, type Concept, type CatalogDeclaration, type Relationship, type Walkthrough } from './walkthrough-types.ts';

// Port of OrderChapters' complete, unique index validation; IDs replace YAML indices.
export function validateConceptOrder(order: string[], concepts: Pick<Concept, 'id'>[]): string[] {
 const ids = new Set(concepts.map(concept => concept.id));
 if (order.length !== ids.size || new Set(order).size !== ids.size || order.some(id => !ids.has(id))) throw new Error('Concept order must include every captured concept exactly once.');
 return order;
}

// Entry point first, then its supporting concepts; cycles and disconnected declarations remain inspectable.
export function orderConcepts(concepts: Pick<Concept, 'id'>[], relationships: Pick<Relationship, 'from' | 'to'>[], entryId: string): string[] {
 const order: string[] = [];
 for (const seed of [entryId, ...concepts.map(concept => concept.id)]) {
  const queue = [seed];
  while (queue.length) {
   const id = queue.shift()!;
   if (order.includes(id)) continue;
   order.push(id);
   queue.push(...relationships.filter(edge => edge.from === id).map(edge => edge.to));
  }
 }
 return validateConceptOrder(order, concepts);
}

export function createSourceWalkthrough(input: unknown, focus?: string): Walkthrough {
 const source = sourceSnapshotSchema.parse(input);
 if (source.endLine - source.startLine + 1 > 200 || source.endLine < source.startLine && !(source.startLine === 1 && source.endLine === 0 && source.fileBytes === 0 && !source.text)) throw new Error('Select a visible captured range of at most 200 lines.');
 const result: Walkthrough = { projectId: source.projectId, fileId: source.fileId, sourceHash: source.sourceHash, startLine: source.startLine, endLine: source.endLine, status: 'empty', concepts: [], relationships: [], order: [], omittedConcepts: 0, catalog: [], omittedDeclarations: 0, message: '' };
 const kinds: Record<string, ts.ScriptKind> = { ts: ts.ScriptKind.TS, tsx: ts.ScriptKind.TSX, js: ts.ScriptKind.JS, jsx: ts.ScriptKind.JSX, mjs: ts.ScriptKind.JS, cjs: ts.ScriptKind.JS };
 const scriptKind = kinds[source.path.split('.').at(-1) ?? ''];
 if (scriptKind === undefined) {
  if (focus !== undefined) throw new Error('Choose a complete declaration from this captured catalog.');
  return walkthroughSchema.parse({ ...result, status: 'unsupported', message: 'Concept extraction supports JavaScript and TypeScript excerpts. Other source remains readable.' });
 }
 const file = ts.createSourceFile(source.path, source.text, ts.ScriptTarget.Latest, true, scriptKind);
 // Only this captured excerpt exists in the compiler host. No filesystem, config, imports or libraries are loaded.
 const options: ts.CompilerOptions = { noLib: true, noResolve: true, types: [], target: ts.ScriptTarget.Latest, allowJs: true };
 const host: ts.CompilerHost = { getSourceFile: name => name === file.fileName ? file : undefined, getDefaultLibFileName: () => '', writeFile: () => {}, getCurrentDirectory: () => '', getDirectories: () => [], fileExists: name => name === file.fileName, readFile: name => name === file.fileName ? source.text : undefined, getCanonicalFileName: name => name, useCaseSensitiveFileNames: () => true, getNewLine: () => '\n' };
 const program = ts.createProgram([file.fileName], options, host);
 const syntaxErrors = program.getSyntacticDiagnostics(file).length > 0;
 const checker = program.getTypeChecker();
 const declarations: { node: ts.Declaration; concept: Concept; catalog: CatalogDeclaration; exported: boolean }[] = [];
 const line = (offset: number) => source.startLine + file.getLineAndCharacterOfPosition(offset).line;
 const add = (node: ts.Declaration, name: string, kind: Concept['kind'], scope: string[]) => {
  const concept: Concept = { id: `concept-${declarations.length}`, name: name.slice(0, 200), kind, startLine: line(node.getStart(file)), endLine: line(Math.max(node.getStart(file), node.getEnd() - 1)) };
  let complete = true;
  if (syntaxErrors) {
   const text = source.text.slice(node.getStart(file), node.getEnd());
   const isolated = ts.createSourceFile(source.path, ts.isVariableDeclaration(node) ? `const ${text};` : text, ts.ScriptTarget.Latest, true, scriptKind);
   complete = !(ts.isFunctionDeclaration(node) && !node.body) && program.getSyntacticDiagnostics(isolated).length === 0;
   const body = ts.isFunctionDeclaration(node) ? node.body : ts.isVariableDeclaration(node) && node.initializer && (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer)) && ts.isBlock(node.initializer.body) ? node.initializer.body : ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node) ? node : undefined;
   // A missing closing brace leaves captured trailing comments inside the visible, incomplete parent.
   if (!complete && body && body.getChildren(file).at(-1)?.kind !== ts.SyntaxKind.CloseBraceToken) concept.endLine = Math.min(source.endLine, line(Math.max(0, source.text.length - 1)));
  }
  const statement = ts.isVariableDeclaration(node) ? node.parent.parent : node;
  const exported = scope.length === 0 && Boolean(ts.getModifiers(statement as ts.HasModifiers)?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword));
  declarations.push({ node, concept, exported, catalog: { ...concept, scope: (scope.join(' > ') || (source.startLine > 1 ? 'captured top level; outer scope unknown' : 'top level')).slice(0, 300), complete } });
 };
 // Complete nested leaves can be read even when a bounded capture omits their enclosing declaration's end.
 const collect = (node: ts.Node, scope: string[]) => {
  let name: string | undefined;
  if (ts.isFunctionDeclaration(node) && node.name && (node.body || syntaxErrors)) { name = node.name.text; add(node, name, 'function', scope); }
  else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer && (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))) { name = node.name.text; add(node, name, 'function', scope); }
  else if (ts.isSourceFile(node.parent) && ts.isClassDeclaration(node) && node.name) { name = node.name.text; add(node, name, 'class', scope); }
  else if (ts.isSourceFile(node.parent) && ts.isInterfaceDeclaration(node)) add(node, node.name.text, 'interface', scope);
  else if (ts.isSourceFile(node.parent) && ts.isTypeAliasDeclaration(node)) add(node, node.name.text, 'type', scope);
  else if (ts.isMethodDeclaration(node) && node.name) name = node.name.getText(file);
  else if ((ts.isArrowFunction(node) || ts.isFunctionExpression(node)) && !ts.isVariableDeclaration(node.parent)) name = '(anonymous function)';
  ts.forEachChild(node, child => collect(child, name ? [...scope, name] : scope));
 };
 for (const statement of file.statements) collect(statement, []);
 result.catalog = declarations.slice(0, 100).map(declaration => declaration.catalog);
 result.omittedDeclarations = Math.max(0, declarations.length - result.catalog.length);
 const complete = declarations.slice(0, 100).filter(declaration => declaration.catalog.complete);
 const focused = focus === undefined ? undefined : complete.find(declaration => declaration.concept.id === focus);
 if (focus !== undefined && !focused) throw new Error('Choose a complete declaration from this captured catalog.');
 if (syntaxErrors && (!source.truncated || !complete.length)) return walkthroughSchema.parse({ ...result, status: 'invalid', message: 'This capture contains invalid or incomplete syntax. Complete declarations in a truncated capture can be read individually; no relationships were inferred.' });
 if (!complete.length) return walkthroughSchema.parse({ ...result, message: 'No complete named declarations were found in this excerpt. Try another source range.' });
 const relationships: Relationship[] = [], seen = new Set<string>();
 const declarationNodes = new Set(declarations.map(declaration => declaration.node));
 // AnalyzeRelationships: bound direct calls/type references replace generated edges. Missing edges stay unknown.
 for (const declaration of syntaxErrors ? [] : complete) {
  const visit = (node: ts.Node) => {
   if (node !== declaration.node && declarationNodes.has(node as ts.Declaration)) return;
   if ((ts.isArrowFunction(node) || ts.isFunctionExpression(node)) && !(ts.isVariableDeclaration(declaration.node) && node === declaration.node.initializer)) return;
   let target: ts.Node | undefined, kind: Relationship['kind'] = 'calls';
   if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) target = node.expression;
   else if (ts.isNewExpression(node) && ts.isIdentifier(node.expression)) { target = node.expression; kind = 'constructs'; }
   else if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) { target = node.typeName; kind = 'uses type'; }
   if (target) {
    const symbol = checker.getSymbolAtLocation(target);
    const match = complete.find(item => symbol?.declarations?.includes(item.node) && (kind === 'uses type' ? item.concept.kind !== 'function' : kind === 'calls' ? item.concept.kind === 'function' : ['class', 'function'].includes(item.concept.kind)));
    if (match) {
     const edge = { from: declaration.concept.id, to: match.concept.id, kind, line: line(target.getStart(file)) };
     const key = `${edge.from}:${edge.to}:${kind}`;
     if (!seen.has(key)) { relationships.push(edge); seen.add(key); }
    }
   }
   ts.forEachChild(node, visit);
  };
  visit(declaration.node);
 }
 const concepts = complete.map(item => item.concept);
 const entry = focused ?? complete.find(item => item.exported && item.concept.kind === 'function') ?? complete.find(item => item.concept.kind === 'function') ?? complete[0];
 // OrderChapters → selected chapters: no automatic model calls, repository crawl or Markdown execution.
 const order = orderConcepts(concepts, relationships, entry.concept.id).slice(0, 5);
 const selected = concepts.filter(concept => order.includes(concept.id));
 return walkthroughSchema.parse({ ...result, status: syntaxErrors ? 'partial' : 'ready', concepts: selected, relationships: relationships.filter(edge => order.includes(edge.from) && order.includes(edge.to)), order, omittedConcepts: concepts.length - selected.length, message: syntaxErrors ? 'Partial saved capture: these declaration slices parse completely, but their enclosing capture is incomplete. Incomplete parents remain in the catalog; all call and type edges are suppressed. Scope outside this capture, callbacks and runtime behavior remain unknown.' : 'Proposed reading order: selected entry, then supporting declarations. Static calls and type references are bound only within this capture; external, member, callback execution and dynamic relationships remain unknown. This is not a runtime trace or requirement verification.' });
}
