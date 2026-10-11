import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { hash } from '../src/extension/source.js';
import { steps } from '../src/panel/workflow.js';
import { lessonSteps } from '../src/panel/v2/evidence.js';
import { ProgressSegments, Task } from '../src/panel/v2/components.js';
import { SharingPreview, SourceLinks } from '../src/panel/ui.js';
import { Understand } from '../src/panel/understand.js';
import { PathHome, Completion, EvidenceReview } from '../src/panel/home.js';
import { panelAction } from '../src/shared.js';
import type { SourceRef, PanelState } from '../src/shared.js';

const render = (element: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(element);
describe('V2 panel keeps real host boundaries and simple task slots', () => {
  it('preserves every current host, contract, project controller and fixture byte', () => {
    const snapshot = JSON.parse(readFileSync('docs/design-v2/current-app-snapshot.json','utf8')) as { immutableFiles: {path:string;sha256:string}[] };
    for (const file of snapshot.immutableFiles) expect(hash(readFileSync(file.path,'utf8')),file.path).toBe(file.sha256);
  });
  it('uses one registry while keeping the host stage IDs', () => {
    expect(lessonSteps).toEqual(steps.map(step=>step.name));
    expect(steps.map(step=>step.id)).toEqual(['confirm','understand','predict','observe','change','verify']);
  });
  it('uses actual allowed stages rather than inventing an unlocked sequence', () => {
    const markup=render(<ProgressSegments current={0} done={[]} available={[0,1,2]} onChoose={()=>{}} onClose={()=>{}} />);
    expect(markup).toContain('aria-label="Your guess"');
    expect(markup).toContain('aria-label="What happened — available after earlier steps" aria-disabled="true"');
  });
  it('separates scrollable task content from the visible action', () => {
    const markup=render(<Task title="A real question" pose="curious" action={<button>My next step</button>}><p>Current project content</p></Task>);
    expect(markup).toContain('vd2-task-scroll');
    expect(markup).toMatch(/<footer class="vd2-actionbar"><button>My next step<\/button><\/footer>/);
  });
  it('keeps exact sharing context and never enables a malformed preview', () => {
    const preview={identity:'identity',model:'recorded-model',instruction:'Exact instructions',text:JSON.stringify({requirement:{path:'my-rule.md',text:'My own rule'},source:{path:'src/my-code.ts'}})};
    const markup=render(<SharingPreview preview={preview} kind="explain" busy={false} hasKey send={()=>{}} />);
    expect(markup).toContain('My own rule');expect(markup).toContain('src/my-code.ts');expect(markup).toContain('recorded-model');expect(markup).toContain('Exactly what will be shared');
    const malformed=render(<SharingPreview preview={{...preview,text:'invalid'}} kind="explain" busy={false} hasKey send={()=>{}} />);
    expect(malformed).toContain('aria-disabled="true"');expect(malformed).not.toContain('NovaDesk');
  });
  it('renders actual source links and preserves their stale gate', () => {
    const refs=[{id:'real',path:'src/custom.ts',symbol:'myFunction',startLine:4,endLine:8}] as SourceRef[];
    const markup=render(createElement(SourceLinks,{refs,busy:false,current:false,send:()=>{}}));
    expect(markup).toContain('src/custom.ts:4–8');expect(markup).toContain('myFunction');expect(markup).toContain('aria-disabled="true"');
  });
  it('accepts actual browser message records without running a case before save acknowledgement', () => {
    const actions=JSON.parse(readFileSync('docs/design-v2/phase-2/actions.json','utf8'));
    for(const group of ['sharing','source','prediction']) for(const item of actions[group]) expect(panelAction.safeParse(item).success).toBe(true);
    expect(actions.prediction.some((item:{type:string})=>item.type==='runCounterexample')).toBe(false);
    expect(actions.prediction.at(-1).predictedApproval).toBe(false);
    expect(actions.prediction.at(-1).reasoning).toBe(actions.typed.reason);
  });
  it('keeps all baseline UI actions available', () => {
    const coverage=JSON.parse(readFileSync('docs/design-v2/phase-2/action-coverage.json','utf8'));
    expect(coverage.lost).toEqual([]);
    const files=['app','home','project','change','results','understand','reuse-controls','ui'].map(name=>readFileSync(`src/panel/${name}.tsx`,'utf8')).join('\n');
    for(const name of coverage.before) expect(files,name).toContain(`'${name}'`);
  });
  it('shows the user rule and honest feature availability on the path', () => {
    const state = {refs:[],busy:false,requirement:{title:'My own booking rule',text:'Only the owner may cancel.',checksAvailable:false}} as PanelState;
    const markup=render(<PathHome state={state} start={()=>{}} proof={()=>{}} takeBreak={()=>{}} challenge={()=>{}} />);
    expect(markup).toContain('My own booking rule');expect(markup).toContain('Explanation only');expect(markup).not.toContain('NovaDesk');
    expect(markup).toContain('Vadhyar: Open Project Guide');expect(markup).not.toContain('PLANNED');
    expect(markup).not.toContain('Found the bug');expect(markup).not.toContain('Fixed it yourself');
  });
  it('withholds completion claims and export without current recorded evidence', () => {
    const record=JSON.parse(readFileSync('docs/design-v2/phase-0/recorded-checks.json','utf8'));
    const markup=render(<Completion state={{...record.corrected,ownershipCurrent:false}} home={()=>{}} proof={()=>{}} challenge={()=>{}} />);
    expect(markup).toContain('result needs a refresh');expect(markup).not.toContain('All cases match');expect(markup).not.toContain('Try the next rule');
    const evidence=render(<EvidenceReview state={{refs:[],busy:false}} send={()=>{}} back={()=>{}} />);
    expect(evidence).toContain('No saved proof');expect(evidence).toContain('aria-disabled="true"');
  });
  it('shows the missing-key and stale-code recovery without an automatic send', () => {
    const noKey=render(<Understand state={{refs:[],busy:false,hasKey:false}} send={()=>{}} next={()=>{}} />);
    expect(noKey).toContain('Connect OpenAI for guidance');expect(noKey).not.toContain('Send for an explanation');
    const stale=render(<Understand state={{refs:[],busy:false,hasKey:true,contextStale:true}} send={()=>{}} next={()=>{}} />);
    expect(stale).toContain('Your code needs a refresh');expect(stale).toContain('Read the saved code');
  });

});
