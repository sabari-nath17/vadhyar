// Adapted from PocketFlow nodes.py / flow.py at 05b24cbbb0fe409c5e23c9791f0342f07524ffdc; see docs/third-party/pocketflow-LICENSE.txt.
import ts from 'typescript';
import { sourceSnapshotSchema } from './project-types.ts';
import { walkthroughSchema, type Concept, type Relationship, type Walkthrough } from './walkthrough-types.ts';

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

export function createSourceWalkthrough(input: unknown): Walkthrough {
 const source = sourceSnapshotSchema.parse(input);
 const result: Walkthrough = { projectId: source.projectId, fileId: source.fileId, sourceHash: source.sourceHash, startLine: source.startLine, endLine: source.endLine, status: 'empty', concepts: [], relationships: [], order: [], omittedConcepts: 0, message: '' };
 const kinds: Record<string, ts.ScriptKind> = { ts: ts.ScriptKind.TS, tsx: ts.ScriptKind.TSX, js: ts.ScriptKind.JS, jsx: ts.ScriptKind.JSX, mjs: ts.ScriptKind.JS, cjs: ts.ScriptKind.JS };
 const kind = kinds[source.path.split('.').at(-1) ?? ''];
 if (kind === undefined) return walkthroughSchema.parse({ ...result, status: 'unsupported', message: 'Concept extraction supports JavaScript and TypeScript excerpts. Other source remains readable.' });
 const file = ts.createSourceFile(source.path, source.text, ts.ScriptTarget.Latest, true, kind);
 // Only this captured excerpt exists in the compiler host. No filesystem, config, imports or libraries are loaded.
 const options: ts.CompilerOptions = { noLib: true, noResolve: true, types: [], target: ts.ScriptTarget.Latest, allowJs: true };
 const host: ts.CompilerHost = { getSourceFile: name => name === file.fileName ? file : undefined, getDefaultLibFileName: () => '', writeFile: () => {}, getCurrentDirectory: () => '', getDirectories: () => [], fileExists: name => name === file.fileName, readFile: name => name === file.fileName ? source.text : undefined, getCanonicalFileName: name => name, useCaseSensitiveFileNames: () => true, getNewLine: () => '\n' };
 const program = ts.createProgram([file.fileName], options, host);
 if (program.getSyntacticDiagnostics(file).length) return walkthroughSchema.parse({ ...result, status: 'invalid', message: 'This excerpt could not be parsed as complete source. Load an excerpt beginning at a complete declaration; no relationships were inferred.' });
 const checker = program.getTypeChecker();
 const declarations: { node: ts.Declaration; concept: Concept; exported: boolean }[] = [];
 const line = (offset: number) => source.startLine + file.getLineAndCharacterOfPosition(offset).line;
 const add = (node: ts.Declaration, name: string, kind: Concept['kind'], statement: ts.Statement) => {
  declarations.push({ node, concept: { id: `concept-${declarations.length}`, name: name.slice(0, 200), kind, startLine: line(node.getStart(file)), endLine: line(Math.max(node.getStart(file), node.getEnd() - 1)) }, exported: Boolean(ts.getModifiers(statement as ts.HasModifiers)?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)) });
 };
 // IdentifyAbstractions: bounded source anchors replace model-created names and file indices.
 for (const statement of file.statements) {
  if (ts.isFunctionDeclaration(statement) && statement.name && statement.body) add(statement, statement.name.text, 'function', statement);
  else if (ts.isClassDeclaration(statement) && statement.name) add(statement, statement.name.text, 'class', statement);
  else if (ts.isInterfaceDeclaration(statement)) add(statement, statement.name.text, 'interface', statement);
  else if (ts.isTypeAliasDeclaration(statement)) add(statement, statement.name.text, 'type', statement);
  else if (ts.isVariableStatement(statement)) for (const node of statement.declarationList.declarations) {
   if (ts.isIdentifier(node.name) && node.initializer && (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))) add(node, node.name.text, 'function', statement);
  }
 }
 if (!declarations.length) return walkthroughSchema.parse({ ...result, message: 'No complete named top-level concepts were found in this excerpt. Try another source range.' });
 const relationships: Relationship[] = [], seen = new Set<string>();
 // AnalyzeRelationships: bound direct calls/type references replace generated edges. Missing edges stay unknown.
 for (const declaration of declarations) {
  const visit = (node: ts.Node) => {
   let target: ts.Node | undefined, kind: Relationship['kind'] = 'calls';
   if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) target = node.expression;
   else if (ts.isNewExpression(node) && ts.isIdentifier(node.expression)) { target = node.expression; kind = 'constructs'; }
   else if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) { target = node.typeName; kind = 'uses type'; }
   if (target) {
    const symbol = checker.getSymbolAtLocation(target);
    const match = declarations.find(item => symbol?.declarations?.includes(item.node) && (kind === 'uses type' ? item.concept.kind !== 'function' : kind === 'calls' ? item.concept.kind === 'function' : ['class', 'function'].includes(item.concept.kind)));
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
 const concepts = declarations.map(item => item.concept);
 const entry = declarations.find(item => item.exported && item.concept.kind === 'function') ?? declarations.find(item => item.concept.kind === 'function') ?? declarations[0];
 // OrderChapters → selected chapters: no automatic model calls, repository crawl or Markdown execution.
 const order = orderConcepts(concepts, relationships, entry.concept.id).slice(0, 5);
 const selected = concepts.filter(concept => order.includes(concept.id));
 return walkthroughSchema.parse({ ...result, status: 'ready', concepts: selected, relationships: relationships.filter(edge => order.includes(edge.from) && order.includes(edge.to)), order, omittedConcepts: concepts.length - selected.length, message: 'Proposed reading order: entry point, then supporting concepts. Static calls and type references from this captured excerpt; external, member and dynamic calls are outside this map. This is not a runtime trace or requirement verification.' });
}
