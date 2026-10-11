import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ProgressSegments } from '../src/panel/v2/components.js';
import { Observation } from '../src/panel/results.js';
import { EvidenceReview } from '../src/panel/home.js';
import { Change } from '../src/panel/change.js';

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
});
