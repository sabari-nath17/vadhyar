import { afterEach, expect, it, vi } from 'vitest';
import { newIntent, snapshotIdentity } from '../src/project/model.js';
import { projectPreview, validateProjectOutput, requestProject } from '../src/project/coach.js';
import { pathSchema } from '../src/project/shared.js';
import { hash } from '../src/extension/source.js';
const files = [{path:'src/feature.ts',content:'export const count = 1;\n',hash:hash('export const count = 1;\n')}];
const snapshot = {id:snapshotIdentity(files), capturedAt:new Date().toISOString(), files,omitted:[]};
const intent = newIntent({title:'Count',request:'Show count',expected:'Display the stored count',origin:'manual'});
const envelope = (result: unknown) => ({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(result)}]}]});
it('requires confirmed intent, bounds context and rejects foreign citations and omitted grouping files', () => {
 expect(() => projectPreview('explain','model',snapshot,[intent],intent.id,['src/feature.ts'])).toThrow(/Confirm/);
 intent.confirmedAt = new Date().toISOString(); const preview = projectPreview('explain','model',snapshot,[intent],intent.id,['src/feature.ts']);
 const result = {summary:'Count display',purpose:'Select count',logic:'Reads the count',consequence:'Displayed number',steps:[{title:'Read',text:'Read this constant',path:'src/feature.ts',line:1}],questions:[],plan:[],prompt:''};
 expect(validateProjectOutput(envelope(result),preview).kind).toBe('guide'); expect(() => validateProjectOutput(envelope({...result,steps:[{...result.steps[0],path:'elsewhere.ts'}]}),preview)).toThrow(/outside/);
 const group = projectPreview('group','model',snapshot,[intent],undefined,['src/feature.ts']); expect(validateProjectOutput(envelope({groups:[{title:'Count',rationale:'Constant',intentId:'',paths:['src/feature.ts'],decision:null}]}),group).kind).toBe('group');
 expect(() => validateProjectOutput(envelope({groups:[{title:'Unknown',rationale:'Guess',intentId:'',paths:['missing.ts'],decision:null}]}),group)).toThrow(/unknown/);
 expect(() => validateProjectOutput({status:'incomplete',output:[]},preview)).toThrow();
});

it('supports planning before source exists while keeping explanations grounded', () => {
 const empty={...snapshot,files:[],id:snapshotIdentity([])}; const preview=projectPreview('plan','model',empty,[intent],intent.id,[]); const result={summary:'First slice',purpose:'Create count',logic:'No implementation exists yet',consequence:'Proposed behavior',steps:[],questions:[],plan:['Create one small display'],prompt:'Implement the confirmed count display and review the diff.'}; expect(validateProjectOutput(envelope(result),preview).kind).toBe('guide'); expect(()=>projectPreview('explain','model',empty,[intent],intent.id,[])).toThrow(/Select/);
});

it('rejects duplicate group files and non-relative paths', () => {
 const preview=projectPreview('group','model',snapshot,[intent],undefined,['src/feature.ts']); expect(()=>validateProjectOutput(envelope({groups:[{title:'Count',rationale:'Constant',intentId:'',paths:['src/feature.ts','src/feature.ts'],decision:null}]}),preview)).toThrow(); for(const path of ['/etc/a.ts','src//a.ts','C:/a.ts','src\\a.ts']) expect(pathSchema.safeParse(path).success).toBe(false);
});

afterEach(() => vi.unstubAllGlobals());

it('grounds one proposed decision in full selected source, without claiming its requirement connection is proven', () => {
 const content = '\n'.repeat(30) + 'export function reserve(seats: number) {\n  return seats > 0;\n}\n';
 const currentFiles = [{ path: 'src/reserve.ts', content, hash: hash(content) }];
 const current = { ...snapshot, id: snapshotIdentity(currentFiles), files: currentFiles };
 const preview = projectPreview('group', 'model', current, [intent], undefined, ['src/reserve.ts']);
 expect(JSON.parse(preview.text).files[0].content).toContain('return seats > 0;');
 const topic = { title: 'Positive capacity', rationale: 'The condition determines whether zero capacity is rejected.', intentId: intent.id, paths: ['src/reserve.ts'], decision: { path: 'src/reserve.ts', line: 32, code: '  return seats > 0;' } };
 expect(validateProjectOutput(envelope({ groups: [topic] }), preview).kind).toBe('group');
 for (const decision of [{ ...topic.decision, code: 'return true;' }, { ...topic.decision, line: 999 }, { ...topic.decision, path: 'missing.ts' }]) expect(() => validateProjectOutput(envelope({ groups: [{ ...topic, decision }] }), preview)).toThrow();
 expect(preview.instruction).toMatch(/one .*decision/i);
 expect(preview.instruction).toMatch(/clarif/i);
 const explanation = projectPreview('explain', 'model', current, [intent], intent.id, ['src/reserve.ts']);
 explanation.topicIdentity = '0'.repeat(64); explanation.text = JSON.stringify({ ...JSON.parse(explanation.text), topic: { decision: topic.decision } });
 const result = { summary: 'Capacity', purpose: 'Reserve seats', logic: 'Positive capacity', consequence: 'Zero is rejected', steps: [{ title: 'Inspect', text: 'Look at the condition', path: 'src/reserve.ts', line: 32 }], questions: [], plan: [], prompt: '' };
 expect(validateProjectOutput(envelope(result), explanation).kind).toBe('guide');
 expect(() => validateProjectOutput(envelope({ ...result, steps: [{ ...result.steps[0], line: 31 }] }), explanation)).toThrow(/confirmed decision/);
});

it('uses the real SDK Responses request and structured formats for group and plan (mock HTTP)', async()=>{
 const names:string[]=[]; vi.stubGlobal('fetch',vi.fn(async (url:unknown,init:RequestInit)=>{
 expect(String(url)).toBe('https://api.openai.com/v1/responses'); const body=JSON.parse(String(init.body)); names.push(body.text.format.name); expect(body.store).toBe(false); const value=body.text.format.name==='project_group' ? {groups:[{title:'Count',rationale:'Supplied constant',intentId:'',paths:['src/feature.ts'],decision:null}]} : {summary:'Next slice',purpose:'Show count',logic:'Use the current count',consequence:'Display count',steps:[{title:'Read',text:'Inspect',path:'src/feature.ts',line:1}],questions:[],plan:['Add one display'],prompt:'Implement the confirmed display and report actual checks.'}; return new Response(JSON.stringify({id:'synthetic-response',model:body.model,status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(value)}]}]}),{headers:{'content-type':'application/json'}});
 })); for(const operation of ['group','plan'] as const) { const preview=projectPreview(operation,'synthetic-model',snapshot,[intent],intent.id,['src/feature.ts']); const result=await requestProject('synthetic-key-not-a-credential',preview,new AbortController().signal); expect(result.responseId).toBe('synthetic-response'); } expect(names).toEqual(['project_group','project_plan']);
});
