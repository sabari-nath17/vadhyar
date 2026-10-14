import * as vscode from 'vscode';
import { lstat, readFile, realpath } from 'node:fs/promises';
import { basename, join, relative } from 'node:path';
import { z } from 'zod';
import { hash } from '../extension/source.js';
import { parseSpecification, readPickedSpecification, readSpecification } from '../extension/requirements.js';
import { captureProject, changesBetween, loadProject, newIntent, privateText, readProjectFile, saveProject, suggestSources, supportedPath, type ProjectRecord } from './model.js';
import { projectAction, intentInput, type ProjectPreview, type ProjectState, type Group, type CheckResult, type ProjectRelationships } from './shared.js';
import { availableTopicIntents, projectPreview, requestProject } from './coach.js';
import { projectScripts, runProjectScript } from './checks.js';
import { decisionChange, extractProjectRelationships } from './topics.js';

export function createProjectController(context: vscode.ExtensionContext, publish: (state: ProjectState) => void, setupKey: () => Promise<void>) {
 let record: ProjectRecord | undefined, preview: ProjectPreview | undefined, groups: Group[] | undefined, groupSnapshot: string | undefined, checkResult: CheckResult | undefined;
 let groupReviewedPaths: string[] | undefined, relationships: ProjectRelationships | undefined;
 let busy = false, operation: string | undefined, error: string | undefined, notice: string | undefined, request: AbortController | undefined;
 let queue: Promise<unknown> = Promise.resolve(), debounce: ReturnType<typeof setTimeout> | undefined;
 function root() {
   if (!vscode.workspace.isTrusted) throw new Error('Project Guide needs a trusted workspace.');
   const folders = vscode.workspace.workspaceFolders;
   if (folders?.length !== 1 || folders[0].uri.scheme !== 'file') throw new Error('Open one local project folder.');
   return folders[0].uri.fsPath;
 }
 function storage() { if (!context.storageUri) throw new Error('Workspace memory is unavailable.'); return context.storageUri.fsPath; }
 function dirty() { const folders = vscode.workspace.workspaceFolders; if (!vscode.workspace.isTrusted || folders?.length !== 1 || folders[0].uri.scheme !== 'file') return true; return vscode.workspace.textDocuments.some(doc => doc.isDirty && doc.uri.scheme === 'file' && supportedPath(relative(folders[0].uri.fsPath, doc.uri.fsPath))); }
 function selectedTopic() { return record?.topic?.requirementId === record?.selectedIntent ? record?.topic : undefined; }
 function selectedGuide() {
   const revision = record?.intents.find(item => item.id === record!.selectedIntent)?.revision;
   const guides = record?.guides.filter(item => item.intentRevision === revision && (item.operation === 'plan' || item.topicIdentity === selectedTopic()?.identity));
   return guides?.filter(item => item.snapshot === record?.current?.id).at(-1) ?? guides?.at(-1) ?? record?.guides.filter(item => item.intentRevision === revision).at(-1) ?? (record?.guide?.intentRevision === revision ? record?.guide : undefined);
 }
 function invalidateContext() { preview = undefined; groups = undefined; groupSnapshot = undefined; groupReviewedPaths = undefined; relationships = undefined; }
 function state(): ProjectState {
   return { name: basename(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? 'Workspace'), busy, operation, error, notice, dirty: dirty(), specificationStale: specificationStale(), started: Boolean(record?.baseline), snapshot: record?.current?.id, baseline: record?.baseline?.id, fileCount: record?.current?.files.length ?? 0, omitted: record?.current?.omitted ?? [], changes: record?.baseline && record.current ? changesBetween(record.baseline, record.current) : [], intents: record?.intents ?? [], selectedIntent: record?.selectedIntent, files: record?.current?.files.map(file => file.path) ?? [], selectedFiles: record?.selectedFiles ?? [], groups: groups?.map(group => ({ ...group, change: decisionChange(record!.baseline!, record!.current!, group.decision) })), groupSnapshot, groupReviewedPaths, relationships, topic: record?.topic, guide: selectedGuide(), preview, check: record?.check, checkResult: checkResult ?? record?.checkRuns.at(-1), checkDefinitionStale: Boolean((checkResult ?? record?.checkRuns.at(-1)) && record?.current?.files.find(file => file.path === 'package.json')?.hash !== (checkResult ?? record?.checkRuns.at(-1))?.packageHash), captureConnected: record?.captureConnected ?? false };
 }
 function specificationStale(id = record?.selectedIntent) { const intent = record?.intents.find(item => item.id === id); return Boolean(intent?.sourcePath && record?.current && record.current.files.find(file => file.path === intent.sourcePath)?.hash !== intent.sourceHash); }
 function emit() { publish(state()); }
 async function persist(next: ProjectRecord) { await saveProject(storage(), next); record = next; }
 async function refresh() {
   if (!record?.baseline) return;
   if (dirty()) { preview = undefined; notice = 'Unsaved source changes. Save before capturing, sharing or checking.'; return; }
   const current = await captureProject(root());
   // Files newly excluded by ignore rules are not deletions.
   for (const file of record.current?.files ?? []) if (!current.files.some(item => item.path === file.path) && !current.omitted.includes(file.path)) {
     try { await lstat(join(root(), file.path)); current.omitted.push(file.path); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
   }
   if (current.id !== record.current?.id) { invalidateContext(); notice = 'Saved project changed. Earlier guidance is retained as historical evidence.'; }
   await persist({ ...record, current, selectedFiles: record.selectedFiles.filter(path => current.files.some(file => file.path === path)) });
 }
 const eventSchema = z.object({ id: z.uuid(), title: z.string().min(1).max(120), request: z.string().min(1).max(6000), expected: z.string().max(6000).default('') }).strict();
 async function captureEvents() {
   if (!record?.captureConnected) return;
   const folder = join(root(), '.vadhyar'); const path = join(folder, 'intent-events.json');
   try {
     if ((await lstat(folder)).isSymbolicLink() || (await lstat(path)).isSymbolicLink()) throw new Error('Capture bridge cannot use symbolic links.');
     const info = await lstat(path); if (info.size > 100_000) throw new Error('Capture event file exceeds 100KB.');
     const events = z.array(eventSchema).max(50).parse(JSON.parse(await readFile(path, 'utf8')));
     const next = structuredClone(record);
     for (const event of events) {
       if (next.capturedEventIds.includes(event.id)) continue;
       next.intents.push(newIntent({ title: event.title, request: event.request, expected: event.expected, origin: 'agent' })); next.capturedEventIds.push(event.id);
     }
     if (next.intents.length !== record.intents.length) { await persist(next); notice = 'New coding request captured. Confirm its intended behavior before using it.'; }
   } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
 }
 async function selectFiles(paths?: string[], suggested?: string[]) {
   if (!record?.current) throw new Error('Start tracking the project first.');
   const picked = paths ?? (await vscode.window.showQuickPick(record.current.files.map(file => ({ label: file.path, picked: (suggested ?? record!.selectedFiles).includes(file.path), description: suggested?.includes(file.path) ? 'Suggested from intent terms; confirm relevance' : undefined })), { title: 'Confirm relevant source files (up to 30)', canPickMany: true }))?.map(item => item.label);
   if (!picked) return;
   if (picked.length > 30 || picked.some(path => !record!.current!.files.some(file => file.path === path))) throw new Error('Choose at most 30 current project files.');
   await persist({ ...record, selectedFiles: picked }); invalidateContext();
 }
 async function perform(raw: unknown) {
   const action = projectAction.parse(raw); root(); record ??= await loadProject(storage()); error = undefined;
   if (action.type !== 'projectReady' && action.type !== 'projectConnectCapture') await refresh();
   if (action.type === 'projectReady') { await refresh(); await captureEvents(); }
   else if (action.type === 'projectStart') {
     if (dirty()) throw new Error('Save project files before starting a snapshot.');
     if (record.baseline) throw new Error('Tracking is already active. Existing history was preserved.');
     const snapshot = await captureProject(root()); await persist({ ...record, baseline: snapshot, current: snapshot }); notice = 'Tracking starts now. Earlier changes and authorship are unknown.';
   } else if (action.type === 'projectAddIntent') {
     if (action.intent.origin === 'agent' && !record.captureConnected) throw new Error('Enable the capture bridge before accepting agent requests.');
     const next = newIntent(action.intent);
     const previous = record.intents.find(item => item.id === action.replaces);
     if (action.replaces && !previous) throw new Error('Previous intent is unavailable.');
     await persist({ ...record, intents: [...record.intents, { ...next, supersedes: action.replaces, sourcePath: previous?.sourcePath, sourceHash: previous?.sourceHash }], selectedIntent: next.id, selectedFiles: [] }); invalidateContext();
   } else if (action.type === 'projectConfirmIntent') {
     const intent = record.intents.find(item => item.id === action.id);
     if (!intent || intent.revision !== action.revision || !intent.expected.trim() || specificationStale(intent.id)) throw new Error('Add expected behavior and confirm the current intent revision.');
     await persist({ ...record, intentSnapshots: record.current && !record.intentSnapshots.some(item => item.intentId === intent.id) ? [...record.intentSnapshots, { intentId: intent.id, revision: intent.revision, snapshot: record.current }] : record.intentSnapshots, selectedIntent: intent.id, intents: record.intents.map(item => item.id === intent.id ? { ...item, confirmedAt: new Date().toISOString() } : item) }); invalidateContext();
   } else if (action.type === 'projectSelectIntent') {
     if (!record.intents.some(item => item.id === action.id)) throw new Error('Unknown feature intent.');
     await persist({ ...record, selectedIntent: action.id, selectedFiles: [] }); invalidateContext();
   } else if (action.type === 'projectImportIntent') {
     const picked = await vscode.window.showOpenDialog({ title: 'Choose a workspace PRD or specification', defaultUri: vscode.Uri.file(root()), canSelectMany: false, filters: { Markdown: ['md'] } });
     if (picked?.[0]) {
       if (picked[0].scheme !== 'file') throw new Error('Choose a saved local specification.');
       const file = await readPickedSpecification(root(), picked[0].fsPath);
       const dirtyPaths = await Promise.all(vscode.workspace.textDocuments.filter(doc => doc.isDirty && doc.uri.scheme === 'file').map(doc => realpath(doc.uri.fsPath).catch(() => doc.uri.fsPath)));
       if (dirtyPaths.includes(file.absolutePath)) throw new Error('Choose a saved local specification.');
       let candidates: { title: string; request: string; expected: string }[];
       try { candidates = parseSpecification(file.content).map(item => ({ title: item.title, request: item.text, expected: item.scenarios.map(s => s.title + ': ' + s.text).join('\n') })); }
       catch { candidates = [{ title: basename(file.path, '.md'), request: file.content.slice(0, 6000), expected: '' }]; }
       const pickedIntent = await vscode.window.showQuickPick(candidates.map(item => ({ label: item.title, item })), { title: 'Select a feature intention; confirm its expected behavior next' });
       if (pickedIntent) {
         if ((await readSpecification(root(), file.path)).hash !== file.hash) throw new Error('Specification changed while selecting. Import again.');
         const intent = { ...newIntent({ ...pickedIntent.item, origin: 'specification' }), sourcePath: file.path, sourceHash: file.hash }; await persist({ ...record, intents: [...record.intents, intent], selectedIntent: intent.id, selectedFiles: [] }); invalidateContext();
       }
     }
   } else if (action.type === 'projectConnectCapture') {
     const agreed = await vscode.window.showInformationMessage('Enable the workspace intent-event bridge? Requests written by your coding agent will be saved locally as unconfirmed intent. No API transmission occurs.', { modal: true }, 'Enable bridge');
     if (agreed) { await persist({ ...record, captureConnected: !record.captureConnected }); await captureEvents(); notice = 'Capture bridge setting updated. External agents must use the documented command or event protocol.'; }
   } else if (action.type === 'projectSelectFiles') await selectFiles();
   else if (action.type === 'projectSuggestFiles') {
     const intent = record.intents.find(item => item.id === record!.selectedIntent);
     if (!record.current || !intent?.confirmedAt) throw new Error('Confirm a feature before finding its code.');
     const suggested = suggestSources(record.current, intent);
     notice = suggested.length ? 'These source matches are proposals. Confirm the relevant files.' : 'No source matches found. Choose relevant files or build this new feature first.';
     await selectFiles(undefined, suggested);
   }
   else if (action.type === 'projectUseGroup') {
     if (!groups?.[action.index] || groupSnapshot !== record.current?.id) throw new Error('Suggested group is stale; review current source again.');
     const group = groups[action.index];
     if (!group.decision) throw new Error('No grounded decision was proposed. Select source containing the decision and review again.');
     const intentions = availableTopicIntents(record.current!, record.intents);
     const choices = intentions.map(intent => ({ label: intent.title, description: intent.expected, id: intent.id, picked: intent.id === group.intentId }));
     choices.sort((a, b) => Number(b.picked) - Number(a.picked));
     const picked = await vscode.window.showQuickPick([...choices, { label: 'No matching requirement — add or revise an intention', description: 'The topic remains unconfirmed.', id: '', picked: false }], { title: group.intentId ? 'Confirm the proposed requirement connection, or choose another' : 'Clarify: which requirement does this decision support?' });
     if (picked?.id) {
       const intent = intentions.find(item => item.id === picked.id);
       const current = await captureProject(root());
       if (!intent || dirty() || current.id !== groupSnapshot) throw new Error('Source or requirement changed while clarifying. Review the topic again.');
       const evidence = relationships ?? { status: 'unavailable' as const, snapshot: current.id, files: [], links: [], inferredEdges: 0, reason: 'Graphify was unavailable; dependencies are not verified.' };
       const data = { ...group, snapshot: current.id, baseline: record.baseline!.id, requirementId: intent.id, requirementRevision: intent.revision, confirmedAt: new Date().toISOString(), reviewedPaths: groupReviewedPaths ?? group.paths, unreviewedPaths: current.files.map(file => file.path).filter(path => !(groupReviewedPaths ?? group.paths).includes(path)), omitted: current.omitted, change: decisionChange(record.baseline!, current, group.decision), relationships: { ...evidence, links: evidence.links.filter(link => link.toPath === group.decision!.path) } };
       const intentSnapshots = record.intentSnapshots.some(item => item.intentId === intent.id && item.snapshot.id === current.id) ? record.intentSnapshots : [...record.intentSnapshots, { intentId: intent.id, revision: intent.revision, snapshot: current }];
       await persist({ ...record, selectedIntent: intent.id, selectedFiles: group.paths, topic: { ...data, identity: hash(JSON.stringify(data)) }, intentSnapshots }); preview = undefined;
       notice = 'Requirement connection confirmed. The explanation will focus on this one decision.';
     } else if (picked) notice = 'Clarification needed. Add or revise an intention, confirm it, then review the learning topics again.';
   } else if (action.type === 'projectOpenSource' || action.type === 'projectOpenDiff') {
     const current = record.current;
     if (!current || action.snapshot !== current.id || dirty()) throw new Error('Source is stale or unsaved; refresh first.');
     const file = current.files.find(file => file.path === action.path), before = record.baseline?.files.find(file => file.path === action.path);
     if (action.type === 'projectOpenSource') {
       if (!file || (await readProjectFile(root(), file.path)).hash !== file.hash) throw new Error('Unknown or changed source.');
       const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(join(root(), file.path))); const line = action.line ?? 1;
       if (line > doc.lineCount || hash(doc.getText()) !== file.hash || doc.isDirty) throw new Error('Source location is stale.');
       const editor = await vscode.window.showTextDocument(doc, vscode.ViewColumn.One); const range = new vscode.Range(line - 1, 0, line - 1, doc.lineAt(line - 1).text.length); editor.selection = new vscode.Selection(range.start, range.end); editor.revealRange(range);
     } else {
       if (!before && !file) throw new Error('Unknown diff path.');
       const left = vscode.Uri.parse(`vadhyar-project:/before/${encodeURIComponent(action.path)}?${record.baseline!.id}`), right = vscode.Uri.parse(`vadhyar-project:/current/${encodeURIComponent(action.path)}?${current.id}`);
       await vscode.commands.executeCommand('vscode.diff', left, right, `${action.path} — tracked changes`, { viewColumn: vscode.ViewColumn.One });
     }
   } else if (action.type === 'projectPreview') {
     if (!record.current || dirty()) throw new Error('Save and capture source before sharing.');
     if (action.operation !== 'group' && specificationStale()) throw new Error('Imported PRD changed. Reimport and confirm its current intention.');
     const approved = projectPreview(action.operation, model(), record.current, record.intents, record.selectedIntent, record.selectedFiles, record.baseline, selectedTopic());
     if (action.operation === 'group') {
       request = new AbortController(); busy = true; operation = 'Reading captured source relationships with Graphify…'; emit();
       try {
         try { relationships = await extractProjectRelationships(vscode.workspace.getConfiguration('vadhyar').get<string>('graphifyPath', ''), storage(), record.current, request.signal); }
         catch { relationships = { status: 'unavailable', snapshot: record.current.id, files: [], links: [], inferredEdges: 0, reason: 'Graphify unavailable. Check the configured absolute 0.9.84 executable; no dependencies were verified.' }; }
         if (request.signal.aborted) throw new Error('Relationship extraction cancelled. Review the context again.');
         if (dirty() || (await captureProject(root())).id !== approved.snapshot) throw new Error('Source changed during relationship extraction. Review again.');
       } finally { busy = false; request = undefined; operation = undefined; }
     }
     preview = approved;
   } else if (action.type === 'projectSend') {
     if (specificationStale() && preview?.operation !== 'group') throw new Error('Imported PRD changed. Reimport and confirm it before sharing.');
     if (!preview || preview.identity !== action.identity || preview.model !== model() || preview.snapshot !== record.current?.id || dirty()) throw new Error('Sharing preview is missing or stale. Review it again.');
     const fresh = projectPreview(preview.operation, model(), record.current!, record.intents, record.selectedIntent, record.selectedFiles, record.baseline, selectedTopic());
     if (fresh.identity !== preview.identity) throw new Error('Intent or selected context changed. Review sharing again.');
     const key = await context.secrets.get('openai.apiKey'); if (!key) throw new Error('Connect OpenAI securely in Settings before sending.');
     request = new AbortController(); busy = true; operation = `Preparing ${preview.operation === 'group' ? 'feature groups' : preview.operation === 'plan' ? 'your build plan' : 'your explanation'}…`; emit();
     const approved = preview;
     try {
       const result = await requestProject(key, approved, request.signal);
       const current = await captureProject(root());
       if (dirty() || current.id !== approved.snapshot || model() !== approved.model) throw new Error('Source or model changed during the request. No current guidance was accepted.');
       if (result.output.kind === 'group') { groups = result.output.result; groupSnapshot = approved.snapshot; groupReviewedPaths = record.selectedFiles.slice(); }
       else {
         const evidence = { snapshot: approved.snapshot, intentRevision: approved.intentRevision!, operation: approved.operation as 'explain' | 'plan', result: result.output.result, responseId: result.responseId, model: result.model, latencyMs: result.latencyMs, totalTokens: result.usage?.totalTokens, topicIdentity: approved.topicIdentity };
         const intent = record.intents.find(item => item.revision === approved.intentRevision && item.id === record!.selectedIntent)!;
         const intentSnapshots = record.intentSnapshots.some(item => item.snapshot.id === record!.current!.id && item.intentId === intent.id) ? record.intentSnapshots : [...record.intentSnapshots, { intentId: intent.id, revision: intent.revision, snapshot: record.current! }];
         await persist({ ...record, guide: evidence, guides: [...record.guides, evidence], intentSnapshots });
       }
       preview = undefined;
     } finally { busy = false; request = undefined; operation = undefined; }
   } else if (action.type === 'projectCopyPrompt') {
     const intent = record.intents.find(item => item.id === record!.selectedIntent);
     const guide = selectedGuide();
     if (!guide?.result.prompt || guide.snapshot !== record.current?.id || guide.intentRevision !== intent?.revision || dirty() || specificationStale()) throw new Error('Refresh the current build prompt before copying.');
     await vscode.env.clipboard.writeText(guide.result.prompt); notice = 'Proposed prompt copied. It was not sent to a coding agent or executed.';
   } else if (action.type === 'projectSelectCheck') {
     const manifest = await projectScripts(root());
     const picked = await vscode.window.showQuickPick(manifest.scripts.map(([name, command]) => ({ label: name, description: command })), { title: 'Choose an existing project check; review its command before running' });
     if (picked) await persist({ ...record, check: { script: picked.label, packageHash: manifest.hash } });
   } else if (action.type === 'projectRunCheck') {
     if (!record.check || !record.current || dirty()) throw new Error('Choose a project check and save source first.');
     const approvedSnapshot = record.current.id;
     const consent = await vscode.window.showWarningMessage(`Run npm run --ignore-scripts ${record.check.script} in ${basename(root())}? Only the selected script runs; automatic npm pre/post hooks are disabled. This executes trusted project code, is not sandboxed, and may change files.`, { modal: true }, 'Run selected check');
     if (consent === 'Run selected check') {
       await refresh();
       if (dirty() || record.current?.id !== approvedSnapshot) throw new Error('Project changed or has unsaved edits while confirming. Save, refresh and review the check again.');
       request = new AbortController(); busy = true; operation = 'Running the selected project check…'; emit();
       try {
         const result = await runProjectScript(root(), record.check.script, record.check.packageHash, record.current.id, record.intents.find(item => item.id === record!.selectedIntent)?.revision, request.signal);
         result.output = privateText.test(result.output) ? 'Possible private output was withheld.' : result.output;
         await persist({ ...record, checkRuns: [...record.checkRuns, { ...result, output: '' }] });
         checkResult = result;
         await refresh(); const manifest = await projectScripts(root());
         if (dirty() || record.current.id !== result.snapshot || manifest.hash !== result.packageHash) notice = 'Project changed during execution. This result is historical, not current.';
       } finally { busy = false; request = undefined; operation = undefined; }
     }
   }
   emit(); return state();
 }
 function model() { return vscode.workspace.getConfiguration('vadhyar').get<string>('model', 'gpt-6-astra'); }
 function act(raw: unknown): Promise<ProjectState> {
   if (projectAction.safeParse(raw).data?.type === 'projectCancel') { request?.abort(); return Promise.resolve(state()); }
   const result = queue.then(() => perform(raw)); queue = result.catch(() => undefined);
   return result.catch(caught => { busy = false; operation = undefined; error = caught instanceof Error ? caught.message.slice(0, 250) : 'Project operation failed.'; emit(); throw caught; });
 }
 function schedule() { if (!record?.baseline && !record?.captureConnected) return; if (debounce) clearTimeout(debounce); debounce = setTimeout(() => { void act({ type: 'projectReady' }).catch(() => undefined); }, 600); }
 const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(root(), '**/*'));
 const subscriptions = [watcher, watcher.onDidChange(schedule), watcher.onDidCreate(schedule), watcher.onDidDelete(schedule), vscode.workspace.onDidSaveTextDocument(schedule), vscode.workspace.onDidChangeTextDocument(() => { if (record && dirty()) { preview = undefined; emit(); } }),
   vscode.workspace.registerTextDocumentContentProvider('vadhyar-project', { provideTextDocumentContent(uri) { const snap = uri.path.startsWith('/before/') ? record?.baseline : record?.current; if (!snap || uri.query !== snap.id) throw new Error('Snapshot is unavailable.'); const path = decodeURIComponent(uri.path.replace(/^\/(before|current)\//, '')); return snap.files.find(file => file.path === path)?.content ?? ''; } }),

 ];
 return { act, inspect: state, setupKey, async captureIntent(raw: unknown) { const parsed = intentInput.omit({ origin: true }).parse(raw); await act({ type: 'projectReady' }); if (!record?.captureConnected) throw new Error('Enable the capture bridge before accepting agent requests.'); return act({ type: 'projectAddIntent', intent: { ...parsed, origin: 'agent' } }); }, dispose() { request?.abort(); if (debounce) clearTimeout(debounce); subscriptions.forEach(item => item.dispose()); } };
}
