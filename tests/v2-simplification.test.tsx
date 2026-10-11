import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ProgressSegments } from '../src/panel/v2/components.js';

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
});
