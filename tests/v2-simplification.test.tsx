import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ProgressSegments, Task, TaskNotices } from '../src/panel/v2/components.js';
import { Observation } from '../src/panel/results.js';
import { EvidenceReview } from '../src/panel/home.js';
import { Change } from '../src/panel/change.js';
import { ProjectPanel } from '../src/panel/project.js';
import type { ProjectState } from '../src/project/shared.js';

describe('simplified shell retains the current product', () => {
  it('pins the rule and code-evidence control above the lesson', () => {
    const app = readFileSync('src/panel/app.tsx', 'utf8');
    expect(app).toContain('vd-pinned-top');
    expect(app).toContain('Review your rule');
    expect(app).toContain('Current code');
  });
  it('keeps locked segments as interactive explanations, not silent disabled controls', () => {
    const html = renderToStaticMarkup(<ProgressSegments current={0} done={[]} available={[0]} onChoose={() => {}} onClose={() => {}} />);
    expect(html).toContain('data-locked="true"');
    expect(html).not.toContain('aria-disabled="true"');
    expect(html).toContain('available after earlier steps');
  });
  it('records all supplied features plus the newer current controls before UI changes', () => {
    const parity = JSON.parse(readFileSync('feature-parity.json', 'utf8'));
    expect(parity.features.slice(0,28).map((item: {inventoryRow:number}) => item.inventoryRow)).toEqual(Array.from({length:28},(_,index) => index+1));
    expect(parity.features.some((item: {id:string}) => item.id === 'project-prompt')).toBe(true);
    expect(parity.features.some((item: {id:string}) => item.id === 'reflection')).toBe(true);
  });
  it('shows the prediction, observed code and expected rule in one flat ledger', () => {
    const record = JSON.parse(readFileSync('docs/design-v2/phase-0/recorded-checks.json','utf8'));
    const html = renderToStaticMarkup(<Observation state={record.seed} />);
    expect(html).toContain('<dt>Predicted</dt>');
    expect(html).toContain('<dt>Code did</dt>');
    expect(html).toContain('<dt>Rule says</dt>');
    expect(html).toContain(record.seed.prediction.reasoning);
    expect(html).not.toContain('vd-prediction');
  });
  it('opens evidence as a sheet without losing the underlying task', () => {
    const html = renderToStaticMarkup(<EvidenceReview state={{refs:[],busy:false}} send={() => {}} back={() => {}} />);
    expect(html).toContain('id="vd-evidence"');
    expect(html).toContain('role="tablist"');
    expect(html).toContain('Timeline and handover');
    expect(html).toContain('Technical details');
    expect(html).toContain('Back to my task');
    const app = readFileSync('src/panel/app.tsx','utf8');
    expect(app).toContain('setEvidenceOpen(true)');
    expect(app).not.toContain("setRoute('evidence')");
  });
  it('makes hint review a direct action without an extra disclosure', () => {
    const record = JSON.parse(readFileSync('docs/design-v2/phase-0/recorded-checks.json','utf8'));
    const html = renderToStaticMarkup(<Change state={record.seed} send={() => {}} />);
    expect(html).toContain('Review before getting a hint');
    expect(html).not.toContain('<summary>Need a hint?');
  });
  it('gives Project Guide the same pinned idea, status and progress shell', () => {
    const state = {name:'A real project',busy:false,started:true,snapshot:'a'.repeat(64),fileCount:0,omitted:[],changes:[],intents:[],files:[],selectedFiles:[],captureConnected:false} as ProjectState;
    const html = renderToStaticMarkup(<ProjectPanel state={state} send={() => {}} setupKey={() => {}} />);
    expect(html).toContain('vd-pinned-top');
    expect(html).toContain('Review your idea');
    expect(html).toContain('Show project evidence');
    expect(html).toContain('Project steps');
  });
  it('makes saved ideas directly selectable in the idea task', () => {
    const state = {name:'A real project',busy:false,started:true,fileCount:0,omitted:[],changes:[],intents:[{id:'idea',title:'My feature',createdAt:new Date(0).toISOString(),request:'Keep this idea',expected:'The intended behavior',origin:'manual',revision:'a'.repeat(64)}],selectedIntent:'idea',files:[],selectedFiles:[],captureConnected:false} as ProjectState;
    const html = renderToStaticMarkup(<ProjectPanel state={state} send={() => {}} setupKey={() => {}} />);
    expect(html).toContain('Saved ideas');
    expect(html).not.toContain('<summary>Saved ideas');
  });
  it('keeps recovery messages inside the scrolling task, above the pinned action', () => {
    const html = renderToStaticMarkup(<TaskNotices.Provider value={<p>Saved input retained after an error.</p>}><Task title="My current task" action={<button>Next</button>}><p>My work</p></Task></TaskNotices.Provider>);
    expect(html.indexOf('vd2-task-scroll')).toBeLessThan(html.indexOf('Saved input retained'));
    expect(html.indexOf('Saved input retained')).toBeLessThan(html.indexOf('vd2-actionbar'));
  });
  it('supports high contrast light explicitly in the gallery and theme tokens', () => {
    expect(readFileSync('src/panel/v2/tokens.css','utf8')).toContain('.vd-theme-hc-light');
    expect(readFileSync('src/panel/v2/gallery.tsx','utf8')).toContain('High contrast light');
  });
});
