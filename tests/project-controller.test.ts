import { mkdtemp, mkdir, readFile, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type * as VSCode from 'vscode';
const host = vi.hoisted(() => ({ root: '', pick: vi.fn(), open: vi.fn(), info: vi.fn(), warning: vi.fn(), request: vi.fn(), documents: [] as { isDirty: boolean; uri: { scheme: string; fsPath: string } }[] }));
vi.mock('vscode', () => {
 const disposable = { dispose() {} }; const listener = () => disposable;
 return { workspace: { isTrusted: true, get workspaceFolders() { return [{uri:{scheme:'file',fsPath:host.root}}]; },get textDocuments() { return host.documents; }, getConfiguration:()=>({get:()=> 'test-model'}),createFileSystemWatcher:()=>({dispose(){},onDidChange:listener,onDidCreate:listener,onDidDelete:listener}),onDidSaveTextDocument:listener,onDidChangeTextDocument:listener,registerTextDocumentContentProvider:listener },
   window:{showQuickPick:host.pick,showOpenDialog:host.open,showInformationMessage:host.info,showWarningMessage:host.warning},
   Uri:{file:(fsPath:string)=>({scheme:'file',fsPath}),parse:(value:string)=>value}, RelativePattern:class{}, commands:{executeCommand:vi.fn()}, ViewColumn:{One:1} };
});
vi.mock('../src/project/coach.js', async importOriginal => ({...await importOriginal<typeof import('../src/project/coach.js')>(),requestProject:host.request}));
import { createProjectController } from '../src/project/controller.js';
import { loadProject, saveProject } from '../src/project/model.js';
let folder: string, storage: string, controller: ReturnType<typeof createProjectController>;
function create() { return createProjectController({storageUri:{fsPath:storage},secrets:{get:async()=> 'test-only-not-a-real-key'}} as unknown as VSCode.ExtensionContext,()=>{},async()=>{}); }
beforeEach(async()=>{
 vi.clearAllMocks();host.documents=[];folder=await mkdtemp(join(tmpdir(),'vadhyar-project-controller-'));host.root=join(folder,'project');storage=join(folder,'memory');await mkdir(join(host.root,'src'),{recursive:true});await writeFile(join(host.root,'src/a.ts'),'export const a = 1;\n');await writeFile(join(host.root,'src/b.ts'),'export const b = 2;\n');controller=create();await controller.act({type:'projectReady'});await controller.act({type:'projectStart'});
});
afterEach(async()=>{controller.dispose();await rm(folder,{recursive:true,force:true});});
it('works outside NovaDesk, preserves intent revisions, invalidates context and restores memory',async()=>{
 await controller.act({type:'projectAddIntent',intent:{title:'Count',request:'Show count',expected:'Display the stored count',origin:'manual'}});const intent=controller.inspect().intents[0];await controller.act({type:'projectConfirmIntent',id:intent.id,revision:intent.revision});host.pick.mockResolvedValue([{label:'src/a.ts'},{label:'src/b.ts'}]);await controller.act({type:'projectSelectFiles'});await controller.act({type:'projectPreview',operation:'explain'});const preview=controller.inspect().preview!;expect(host.request).not.toHaveBeenCalled();
 host.request.mockResolvedValue({output:{kind:'guide',result:{summary:'Count',purpose:'Display',logic:'Constant',consequence:'Number',steps:[{title:'Inspect',text:'Read',path:'src/a.ts',line:1}],questions:[],plan:[],prompt:''}},responseId:'synthetic',model:'test-model',latencyMs:1});await controller.act({type:'projectSend',identity:preview.identity});expect(host.request).toHaveBeenCalledTimes(1);expect(controller.inspect().guide?.snapshot).toBe(controller.inspect().snapshot);
 await writeFile(join(host.root,'src/a.ts'),'export const a = 3;\n');await controller.act({type:'projectReady'});expect(controller.inspect().guide?.snapshot).not.toBe(controller.inspect().snapshot);expect(controller.inspect().changes).toHaveLength(1);
 await controller.act({type:'projectAddIntent',replaces:intent.id,intent:{title:'Count',request:'Change count',expected:'Display three',origin:'manual'}});expect(controller.inspect().intents).toHaveLength(2);expect(controller.inspect().selectedFiles).toEqual([]); expect(controller.inspect().guide).toBeUndefined(); await controller.act({type:'projectSelectIntent',id:intent.id}); expect(controller.inspect().guide?.responseId).toBe('synthetic'); await controller.act({type:'projectSelectIntent',id:controller.inspect().intents[1].id}); controller.dispose();controller=create();await controller.act({type:'projectReady'});expect(controller.inspect().intents).toHaveLength(2);expect(controller.inspect().intents[1].supersedes).toBe(intent.id);
});
it('rejects unconfirmed intent, stale previews, dirty source and unmapped paths',async()=>{
 await controller.act({type:'projectAddIntent',intent:{title:'New',request:'Add feature',expected:'',origin:'manual'}});await expect(controller.act({type:'projectPreview',operation:'explain'})).rejects.toThrow(/Confirm/);await expect(controller.act({type:'projectSend',identity:'0'.repeat(64)})).rejects.toThrow(/preview/);await expect(controller.act({type:'projectOpenSource',path:'../../secret.ts',snapshot:controller.inspect().snapshot!})).rejects.toThrow();
 host.documents=[{isDirty:true,uri:{scheme:'file',fsPath:join(host.root,'src/a.ts')}}];await expect(controller.act({type:'projectPreview',operation:'group'})).rejects.toThrow(/Save/);expect(host.request).not.toHaveBeenCalled();
});
it('captures agent events exactly once and keeps captured intent unconfirmed',async()=>{
 host.info.mockResolvedValue('Enable bridge');await controller.act({type:'projectConnectCapture'});await mkdir(join(host.root,'.vadhyar'));const events=[{id:'11111111-1111-4111-8111-111111111111',title:'Reminder',request:'Add email reminders',expected:''}];await writeFile(join(host.root,'.vadhyar/intent-events.json'),JSON.stringify(events));await controller.act({type:'projectReady'});await controller.act({type:'projectReady'});expect(controller.inspect().intents).toHaveLength(1);expect(controller.inspect().intents[0].confirmedAt).toBeUndefined();expect(controller.inspect().intents[0].origin).toBe('agent');expect((await loadProject(storage)).capturedEventIds).toHaveLength(1);
});
it('runs only an explicitly selected existing script and never invents requirement coverage',async()=>{
 await writeFile(join(host.root,'package.json'),JSON.stringify({scripts:{test:'node -e "process.exit(0)"'}}));host.pick.mockResolvedValue({label:'test'});await controller.act({type:'projectSelectCheck'});host.warning.mockResolvedValue(undefined);await controller.act({type:'projectRunCheck'});expect(controller.inspect().checkResult).toBeUndefined();host.warning.mockResolvedValue('Run selected check');await controller.act({type:'projectRunCheck'});expect(controller.inspect().checkResult?.exitCode).toBe(0);expect(controller.inspect().checkResult).not.toHaveProperty('requirementPassed');await writeFile(join(host.root,'package.json'),JSON.stringify({scripts:{test:'node -e "process.exit(1)"'}}));await expect(controller.act({type:'projectRunCheck'})).rejects.toThrow(/changed/);
});

it('links an imported requirement to its document and blocks guidance after PRD drift',async()=>{
 const spec='### Requirement: Count\nShow count.\n#### Scenario: Display\nDisplay one.'; await writeFile(join(host.root,'spec.md'),spec);host.open.mockResolvedValue([{scheme:'file',fsPath:join(host.root,'spec.md')}]);host.pick.mockResolvedValue({label:'Count',item:{title:'Count',request:spec,expected:'Display one.'}});await controller.act({type:'projectImportIntent'});const intent=controller.inspect().intents.at(-1)!;await controller.act({type:'projectConfirmIntent',id:intent.id,revision:intent.revision});expect(intent.sourcePath).toBe('spec.md'); await controller.act({type:'projectAddIntent',replaces:intent.id,intent:{title:'Count',request:'Change count',expected:'Display two',origin:'manual'}}); const revised=controller.inspect().intents.at(-1)!; expect(revised.sourcePath).toBe('spec.md'); await controller.act({type:'projectConfirmIntent',id:revised.id,revision:revised.revision}); await writeFile(join(host.root,'spec.md'),spec+'\nDisplay two.');await controller.act({type:'projectReady'});expect(controller.inspect().specificationStale).toBe(true);await expect(controller.act({type:'projectPreview',operation:'plan'})).rejects.toThrow(/PRD changed/);expect(host.request).not.toHaveBeenCalled();
});

it('imports a physical picker path through a workspace alias and blocks a dirty alias of that file', async () => {
 const text = '### Requirement: Count\nShow count.\n#### Scenario: Display\nDisplay one.';
 await writeFile(join(host.root, 'spec.md'), text);
 const original = host.root, alias = join(folder, 'workspace-alias');
 await symlink(original, alias, 'dir'); host.root = alias;
 const physical = await realpath(join(original, 'spec.md'));
 host.open.mockResolvedValue([{ scheme: 'file', fsPath: physical }]);
 host.pick.mockResolvedValue({ label: 'Count', item: { title: 'Count', request: text, expected: 'Display one.' } });
 await controller.act({ type: 'projectImportIntent' });
 expect(controller.inspect().intents.at(-1)?.sourcePath).toBe('spec.md');
 host.open.mockResolvedValue([{ scheme: 'file', fsPath: join(alias, 'spec.md') }]);
 host.documents = [{ isDirty: true, uri: { scheme: 'file', fsPath: physical } }];
 await expect(controller.act({ type: 'projectImportIntent' })).rejects.toThrow(/saved local/);
 expect(controller.inspect().intents).toHaveLength(1);
});

it('requires an enabled integration for captured requests and keeps unknown groups unconfirmed', async()=>{
 const capture={title:'Mail',request:'Add email reminders',expected:'Send once'}; await expect(controller.captureIntent(capture)).rejects.toThrow(/Enable/); host.info.mockResolvedValue('Enable bridge'); await controller.act({type:'projectConnectCapture'}); await controller.captureIntent(capture); const intent=controller.inspect().intents.at(-1)!; expect(intent.origin).toBe('agent'); expect(intent.confirmedAt).toBeUndefined(); await controller.act({type:'projectConfirmIntent',id:intent.id,revision:intent.revision}); host.pick.mockResolvedValue([{label:'src/a.ts'}]); await controller.act({type:'projectSelectFiles'}); await controller.act({type:'projectPreview',operation:'group'}); const preview=controller.inspect().preview!; host.request.mockResolvedValue({output:{kind:'group',result:[{title:'New feature',rationale:'Intent unknown',intentId:'',paths:['src/a.ts'],decision:{path:'src/a.ts',line:1,code:'export const a = 1;'}}]},responseId:'synthetic',model:'test-model',latencyMs:1}); await controller.act({type:'projectSend',identity:preview.identity}); host.pick.mockResolvedValue(undefined); await controller.act({type:'projectUseGroup',index:0}); expect(controller.inspect().selectedIntent).toBe(intent.id); expect(controller.inspect().topic).toBeUndefined(); expect(host.pick).toHaveBeenLastCalledWith(expect.any(Array), expect.objectContaining({title:expect.stringMatching(/Clarify/)}));
});

it('confirms one proposed requirement connection, restores the focused topic and blocks it after source changes', async () => {
 await controller.act({ type: 'projectAddIntent', intent: { title: 'Count', request: 'Show count', expected: 'Show one', origin: 'manual' } });
 const intent = controller.inspect().intents[0]; await controller.act({ type: 'projectConfirmIntent', id: intent.id, revision: intent.revision });
 host.pick.mockResolvedValue([{ label: 'src/a.ts' }]); await controller.act({ type: 'projectSelectFiles' });
 await controller.act({ type: 'projectPreview', operation: 'group' });
 const group = { title: 'Stored value', rationale: 'Investigate the value used for display.', intentId: intent.id, paths: ['src/a.ts'], decision: { path: 'src/a.ts', line: 1, code: 'export const a = 1;' } };
 host.request.mockResolvedValue({ output: { kind: 'group', result: [group] }, responseId: 'synthetic', model: 'test-model', latencyMs: 1 });
 await controller.act({ type: 'projectSend', identity: controller.inspect().preview!.identity });
 host.pick.mockResolvedValue(undefined); await controller.act({ type: 'projectUseGroup', index: 0 }); expect(controller.inspect().topic).toBeUndefined();
 host.pick.mockResolvedValue({ id: intent.id, label: intent.title }); await controller.act({ type: 'projectUseGroup', index: 0 });
 expect(controller.inspect().topic).toMatchObject({ requirementId: intent.id, requirementRevision: intent.revision, snapshot: controller.inspect().snapshot, decision: group.decision, relationships: { status: 'unavailable' } });
 controller.dispose(); controller = create(); await controller.act({ type: 'projectReady' });
 expect(controller.inspect().topic?.decision).toEqual(group.decision);
 const saved = await readFile(join(storage, 'project.json'), 'utf8'), invalid = await loadProject(storage);
 invalid.topic!.identity = '0'.repeat(64); await expect(saveProject(storage, invalid)).rejects.toThrow();
 expect(await readFile(join(storage, 'project.json'), 'utf8')).toBe(saved);
 await controller.act({ type: 'projectPreview', operation: 'explain' });
 expect(controller.inspect().preview?.topicIdentity).toBe(controller.inspect().topic?.identity);
 expect(JSON.parse(controller.inspect().preview!.text).topic.decision).toEqual(group.decision);
 await writeFile(join(host.root, 'src/a.ts'), 'export const a = 3;\n'); await controller.act({ type: 'projectReady' });
 expect(controller.inspect().topic?.snapshot).not.toBe(controller.inspect().snapshot);
 await expect(controller.act({ type: 'projectPreview', operation: 'explain' })).rejects.toThrow(/topic.*historical/i);
});

it('rejects a proposed topic when the source changes during the requirement picker', async () => {
 await controller.act({ type: 'projectAddIntent', intent: { title: 'Count', request: 'Show count', expected: 'Show one', origin: 'manual' } });
 const intent = controller.inspect().intents[0]; await controller.act({ type: 'projectConfirmIntent', id: intent.id, revision: intent.revision });
 host.pick.mockResolvedValue([{ label: 'src/a.ts' }]); await controller.act({ type: 'projectSelectFiles' });
 await controller.act({ type: 'projectPreview', operation: 'group' });
 host.request.mockResolvedValue({ output: { kind: 'group', result: [{ title: 'Value', rationale: 'Inspect', intentId: '', paths: ['src/a.ts'], decision: { path: 'src/a.ts', line: 1, code: 'export const a = 1;' } }] }, responseId: 'synthetic', model: 'test-model', latencyMs: 1 });
 await controller.act({ type: 'projectSend', identity: controller.inspect().preview!.identity });
 host.pick.mockImplementationOnce(async () => { await writeFile(join(host.root, 'src/a.ts'), 'export const a = 3;\n'); return { id: intent.id, label: intent.title }; });
 await expect(controller.act({ type: 'projectUseGroup', index: 0 })).rejects.toThrow(/changed.*clarif/i);
 expect(controller.inspect().topic).toBeUndefined();
});

it.each(['dirty', 'saved'])('rejects %s source changes while native check confirmation is open', async mode => {
 await writeFile(join(host.root, 'package.json'), JSON.stringify({ scripts: { test: 'node -e "require(\'node:fs\').writeFileSync(\'ran.txt\', \'executed\')"' } }));
 host.pick.mockResolvedValue({ label: 'test' }); await controller.act({ type: 'projectSelectCheck' });
 host.warning.mockImplementationOnce(async () => {
   if (mode === 'dirty') host.documents = [{ isDirty: true, uri: { scheme: 'file', fsPath: join(host.root, 'src/a.ts') } }];
   else await writeFile(join(host.root, 'src/a.ts'), 'export const a = 3;\n');
   return 'Run selected check';
 });
 await expect(controller.act({ type: 'projectRunCheck' })).rejects.toThrow(/changed|save|unsaved/i);
 expect(controller.inspect().checkResult).toBeUndefined();
 await expect(readFile(join(host.root, 'ran.txt'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
});
