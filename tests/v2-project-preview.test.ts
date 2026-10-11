import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { expect, it, vi } from 'vitest';
import type * as VSCode from 'vscode';

const host = vi.hoisted(() => ({root:'',pick:vi.fn(),warning:vi.fn(),request:vi.fn()}));
vi.mock('vscode', () => {
  const listener = () => ({dispose(){}});
  return {
    workspace:{isTrusted:true,get workspaceFolders(){return [{uri:{scheme:'file',fsPath:host.root}}];},textDocuments:[],getConfiguration:()=>({get:()=> 'UI specimen — no live API'}),createFileSystemWatcher:()=>({dispose(){},onDidChange:listener,onDidCreate:listener,onDidDelete:listener}),onDidSaveTextDocument:listener,onDidChangeTextDocument:listener,registerTextDocumentContentProvider:listener},
    window:{showQuickPick:host.pick,showWarningMessage:host.warning},
    Uri:{file:(fsPath:string)=>({scheme:'file',fsPath}),parse:(value:string)=>value},RelativePattern:class{},commands:{executeCommand:vi.fn()},ViewColumn:{One:1},
  };
});
vi.mock('../src/project/coach.js',async original => ({...await original<typeof import('../src/project/coach.js')>(),requestProject:host.request}));
import { createProjectController } from '../src/project/controller.js';

it('records real project captures, revisions and a script result with explicitly mocked guidance',async()=>{
  const folder=await mkdtemp(join(tmpdir(),'vadhyar-ui-project-'));
  host.root=join(folder,'Recorded developer project');
  const memory=join(folder,'memory');
  await mkdir(join(host.root,'src'),{recursive:true});
  const source=await readFile('novadesk/src/approval.ts','utf8');
  await writeFile(join(host.root,'src/approval.ts'),source);
  await writeFile(join(host.root,'src/readme.md'),'Developer UI recording. Simulated actors.\n');
  await writeFile(join(host.root,'package.json'),JSON.stringify({scripts:{test:'node -e "process.exit(0)"'}}));
  const controller=createProjectController({storageUri:{fsPath:memory},secrets:{get:async()=> 'test-only-not-a-real-key'}} as unknown as VSCode.ExtensionContext,()=>{},async()=>{});
  const copy=()=>JSON.parse(JSON.stringify(controller.inspect()));
  try {
    await controller.act({type:'projectReady'});await controller.act({type:'projectStart'});
    await controller.act({type:'projectAddIntent',intent:{title:'Approval rule',request:'Only the owning client can approve a milestone.',expected:'Another client must be stopped.',origin:'manual'}});
    await controller.act({type:'projectAddIntent',intent:{title:'Approval rule — revised',request:'Keep milestone approval with the owning client.',expected:'Allow the owner. Stop another client.',origin:'manual'},replaces:controller.inspect().selectedIntent});
    const intent=controller.inspect().intents.at(-1)!;
    await controller.act({type:'projectConfirmIntent',id:intent.id,revision:intent.revision});
    host.pick.mockResolvedValue([{label:'src/approval.ts'}]);
    await controller.act({type:'projectSelectFiles'});
    const idea=copy();
    await writeFile(join(host.root,'src/approval.ts'),source.replace("return actor.role === 'client';","return actor.role === 'client' && actor.id === _milestone.ownerClientId;"));
    await controller.act({type:'projectReady'});
    const changed=copy();
    await controller.act({type:'projectPreview',operation:'plan'});
    const sharing=copy();
    expect(host.request).not.toHaveBeenCalled();
    const startLine=source.split('\n').findIndex(line=>line.includes('function canApproveMilestone'))+1;
    host.request.mockResolvedValue({output:{kind:'guide',result:{summary:'UI specimen: a plan layout, with a mocked response.',purpose:'Keep the approval condition tied to the milestone owner.',logic:'Inspect the actor and the milestone before changing the condition.',consequence:'A plan proposes work; it does not execute or verify it.',steps:[{title:'Approval condition',text:'UI specimen. Inspect the saved function in the editor.',path:'src/approval.ts',line:startLine}],questions:['Which value identifies the milestone owner?'],plan:['Inspect the saved condition.','Make one small change in the editor.','Run the project’s selected check.'],prompt:'UI specimen: inspect src/approval.ts and propose one small ownership change. Review every diff. This response was mocked for UI checks.'}},responseId:'UI-specimen-mocked-response',model:'UI specimen — no live API',latencyMs:0});
    await controller.act({type:'projectSend',identity:sharing.preview.identity});
    const plan=copy();
    host.pick.mockResolvedValue({label:'test'});await controller.act({type:'projectSelectCheck'});
    host.warning.mockResolvedValue('Run selected check');await controller.act({type:'projectRunCheck'});
    const check=copy();
    expect(idea.fileCount).toBe(3);expect(idea.intents).toHaveLength(2);expect(changed.changes).toHaveLength(1);
    expect(plan.guide?.result.prompt).toContain('UI specimen');expect(check.checkResult?.exitCode).toBe(0);
    expect(check.checkResult).not.toHaveProperty('requirementPassed');
    const output=process.env.VADHYAR_PANEL_RECORD_DIR;
    if(output) { await mkdir(output,{recursive:true});await writeFile(join(output,'project-recorded.json'),JSON.stringify({recordedAt:new Date().toISOString(),scope:'Real disposable capture/intent/diff/script actions; VS Code dialogs and guidance mocked. Zero OpenAI requests. The script exits zero and establishes no rule coverage.',scenes:{projectIdea:idea,projectChanged:changed,projectPlan:plan,projectCheck:check,projectShare:sharing}},null,2)+'\n'); }
  } finally {controller.dispose();await rm(folder,{recursive:true,force:true});}
});
