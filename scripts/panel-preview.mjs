// Developer-only renderer preview. It records messages; it never calls the host or OpenAI.
import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const digest = text => createHash('sha256').update(text).digest('hex');
const record = JSON.parse(await readFile('docs/design-v2/phase-0/recorded-checks.json','utf8'));
const captured = JSON.parse(await readFile('docs/s13-evidence/developer-session.json','utf8'));
const content = await readFile('novadesk/src/approval.ts','utf8');
const startLine = content.split('\n').findIndex(line => line.includes('function canApproveMilestone'))+1;
if (!startLine || digest(content)!==record.seed.sourceHash) throw new Error('The recorded developer scenario no longer matches the seed. Rerecord it first.');
const refs=[{id:'preview-source',path:'src/approval.ts',symbol:'canApproveMilestone',startLine,endLine:startLine+3,hash:digest(content)}];
const graph={version:'UI specimen · not a new extraction',identity:digest('ui-example'),sourceHash:digest(content),extractedAt:record.capturedAt,refs,relationships:[]};
const evidence=[record.seed.counterexample,record.corrected.ownershipRun].map((run,index)=>({id:run.id,kind:index?'ownership':'counterexample',at:run.finishedAt,title:index?'Recorded corrected-source check':'Recorded seed counterexample',detail:index?`${run.cases.length} cases executed; ${run.cases.filter(item=>item.status==='passed').length} matched.`:`Code ${run.observedApproval?'allowed':'denied'} approval.`,sourceHash:run.sourceHash,requirementRevision:run.requirementRevision,current:false}));
const common={...record.seed,ownershipRun:undefined,counterexample:undefined,prediction:undefined,evidence,sourceHash:digest(content),refs,graph,graphCurrent:true,mappingConfirmed:true,referencesCurrent:true,checksSupported:true,checkpointCount:captured.checkpoints.filter(point=>point.hash===digest(content)).length,checkpointHash:digest(content),hasKey:true,baselineHash:digest(content),exercise:'ownership'};
const context={identity:digest(content+record.seed.requirement.text),model:'UI preview · not a live request',instruction:'Developer-only specimen. The real host supplies its bounded prompt.',text:JSON.stringify({requirement:{path:'vadhyar-requirement.md',text:record.seed.requirement.text},source:{path:'src/approval.ts',content},relationships:[]},null,2)};
const correctedContent=content.replace("return actor.role === 'client';","return actor.role === 'client' && actor.id === _milestone.ownerClientId;");
if(digest(correctedContent)!==record.corrected.sourceHash) throw new Error('Corrected source identity does not match the recorded runner result.');
const diff={id:'recorded-developer-diff',type:'diff',predictionId:record.seed.prediction.id,recordedAt:record.capturedAt,sourceHash:record.corrected.sourceHash,requirementRevision:record.seed.requirement.revision,before:{content,hash:digest(content)},after:{content:correctedContent,hash:digest(correctedContent)}};
const scenes={
 home:{...common,confirmed:false,stage:'confirm'},
 confirm:{...common,confirmed:false,stage:'confirm'},
 understand:{...common,stage:'understand',mappingConfirmed:false},
 sharing:{...common,stage:'understand',preview:context},
 predict:{...common,stage:'predict'},
 observe:{...common,stage:'observe',prediction:record.seed.prediction,counterexample:record.seed.counterexample,counterexampleCurrent:true},
 change:{...common,stage:'change',prediction:record.seed.prediction,counterexample:record.seed.counterexample,counterexampleCurrent:true},
 verify:{...common,...record.corrected,refs,graph,graphCurrent:true,referencesCurrent:false,checksSupported:true,stage:'verify',ownershipCurrent:true,counterexampleCurrent:false,diff,baselineHash:record.seed.sourceHash},
 imported:{...common,stage:'understand',requirement:{...record.seed.requirement,title:'Recorded rule as imported specimen',checksAvailable:false}},
 connect:{...common,stage:'understand',hasKey:false,preview:context},
 loading:{...common,stage:'understand',preview:context,busy:true},
 stale:{...common,stage:'understand',contextStale:true,referencesCurrent:false,graphCurrent:false},
 error:{...common,stage:'understand',error:'Preview example: explanation request could not complete.'},
 extracting:{...common,stage:'understand',busy:true,graph:undefined,graphCurrent:false},
 unsaved:{...common,stage:'predict',contextStale:true,error:'UI specimen: this source has unsaved edits. Save and refresh before checking.'},
 runnerError:{...common,...record.corrected,stage:'verify',diff,baselineHash:record.seed.sourceHash,ownershipCurrent:false,ownershipRun:{...record.corrected.ownershipRun,kind:'timeout',message:'UI specimen: the check runner timed out. No behavior was recorded.'}},
 gated:{...common,confirmed:false,stage:'predict'},
 project:{refs:[],busy:false,project:{name:'Vadhyar UI specimen',busy:false,started:false,fileCount:0,omitted:[],changes:[],intents:[],files:[],selectedFiles:[],captureConnected:false}},
};
// Labelled precondition specimens expose existing controls; they are not coaching results.
const tour={...common,stage:'understand',explanationCurrent:true,walkthrough:{sourceHash:common.sourceHash,requirementRevision:common.requirement.revision,index:0},explanation:{sourceHash:common.sourceHash,requirementRevision:common.requirement.revision,responseId:'UI-specimen-mocked-response',model:'UI specimen — no live API',latencyMs:0,explanation:{summary:'UI specimen for route checks. No live explanation request was made.',steps:[{title:'Follow the approval rule',text:'UI specimen: open the selected permission function.',sourceRefId:refs[0].id}]}}};
Object.assign(scenes,{
 tour,
 connections:{...common,stage:'understand',graph:undefined,graphCurrent:false},
 predictionSaved:{...common,stage:'predict',prediction:record.seed.prediction},
 hintSharing:{...scenes.change,hintPreview:context},
 changed:{...scenes.verify,diff:undefined},
 cleared:{...common,confirmed:false,stage:'confirm',sessionCleared:'UI-specimen-clear-event'},
});
scenes.fullLesson={...scenes.verify,referencesCurrent:true,refs:refs.map(ref=>({...ref,hash:record.corrected.sourceHash})),graph:{...graph,sourceHash:record.corrected.sourceHash,refs:refs.map(ref=>({...ref,hash:record.corrected.sourceHash}))}};
scenes.fullTour={...scenes.fullLesson,explanationCurrent:true,walkthrough:{...tour.walkthrough,sourceHash:record.corrected.sourceHash},explanation:{...tour.explanation,sourceHash:record.corrected.sourceHash}};
const projectRecord=JSON.parse(await readFile('docs/design-v2/simplification/project/project-recorded.json','utf8'));
for(const [name,project] of Object.entries(projectRecord.scenes)) scenes[name]={refs:[],busy:false,project};
const project=projectRecord.scenes.projectPlan;
Object.assign(scenes,{
 projectNewIdea:{refs:[],busy:false,project:{...project,intents:[],selectedIntent:undefined,guide:undefined}},
 projectUnconfirmed:{refs:[],busy:false,project:{...project,intents:project.intents.map(intent=>({...intent,confirmedAt:undefined})),guide:undefined}},
 projectSuggest:{refs:[],busy:false,project:{...project,selectedFiles:[],guide:undefined}},
 projectBusy:{refs:[],busy:false,project:{...project,busy:true,operation:'UI specimen: operation in progress'}},
 projectGroup:{refs:[],busy:false,project:{...project,groups:[{title:'UI specimen — proposed file group',rationale:'UI specimen for route checks; no grouping request was made.',intentId:project.selectedIntent,paths:project.selectedFiles}],groupSnapshot:project.snapshot}},
});
const output='dist/gallery/preview';await mkdir(output,{recursive:true});
for(const file of await readdir('dist')) if(/\.(js|css|woff2|png)$/.test(file)) await cp(`dist/${file}`,`${output}/${file}`);
await cp('dist/media',`${output}/media`,{recursive:true});
const stateJson=JSON.stringify(scenes).replaceAll('<','\\u003c');
await writeFile(`${output}/index.html`, `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vadhyar recorded UI preview</title><link rel="stylesheet" href="panel.css"><style>.preview-label{height:24px;display:flex;align-items:center;gap:8px;padding:0 8px;font:12px system-ui;background:#F4EFE6;color:#2C3539}.preview-label select{width:auto;min-height:20px;padding:0;font:12px system-ui}.vd-learning{height:calc(100dvh - 24px)}</style></head><body><div class="preview-label"><span>Recorded preview · no API or storage</span><label>View <select id="preview-scene">${Object.keys(scenes).map(name=>`<option>${name}</option>`).join('')}</select></label></div><div id="root"></div><output hidden id="preview-action-log">[]</output><script>
const scenes=${stateJson};const params=new URLSearchParams(location.search);document.body.className='vd-theme-'+(params.get('theme')||'light');let current=scenes[params.get('case')]||scenes.predict;document.querySelector('#preview-scene').value=params.get('case')||'predict';const actions=[];document.querySelector('#preview-scene').onchange=e=>{current=scenes[e.target.value];window.postMessage(current,'*');};window.acquireVsCodeApi=()=>({postMessage:message=>{actions.push(message);document.querySelector('#preview-action-log').textContent=JSON.stringify(actions);if(message.type==='ready')window.postMessage(current,'*');else if(message.type==='setStage'){current={...current,stage:message.stage};window.postMessage(current,'*');}else window.postMessage({...current,notice:'Preview recorded '+message.type+'. No host operation was executed.'},'*');}});
</script><script src="panel.js"></script></body></html>`);
process.stdout.write('Recorded renderer preview: http://127.0.0.1:4187/gallery/preview/index.html\n');
