import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { panelAction } from '../src/shared.js';
import { projectAction } from '../src/project/shared.js';

interface Feature { id: string; inventoryRow: number | null; hostAction: string[]; route: string[]; maxTaps: number; baseline: {route:string[];taps:number} }
interface Witness { id: string; route: string[]; taps: number; actions: {type:string}[]; visible: boolean }
const read = (path:string) => JSON.parse(readFileSync(path,'utf8'));
const inventory = read('feature-parity.json') as {features:Feature[]};
const witnesses = read('docs/design-v2/simplification/parity/browser-routes.json') as Witness[];

describe('current panel feature parity evidence', () => {
  it('retains all 28 supplied rows and newer controls within the declared route budget', () => {
    expect(inventory.features).toHaveLength(53);
    expect(new Set(inventory.features.map(feature=>feature.id)).size).toBe(53);
    expect(inventory.features.slice(0,28).map(feature=>feature.inventoryRow)).toEqual(Array.from({length:28},(_,index)=>index+1));
    for(const feature of inventory.features) {
      expect(feature.baseline.route.length,feature.id).toBeGreaterThan(0);
      if(feature.id==='open') {
        const manifest=read('package.json');
        expect(manifest.contributes.commands.some((command:{command:string})=>command.command==='vadhyar.open')).toBe(true);
        continue;
      }
      const routes=witnesses.filter(witness=>witness.id===feature.id);
      expect(routes.length,feature.id).toBeGreaterThan(0);
      expect(routes[0].route,feature.id).toEqual(feature.route);
      for(const route of routes) {expect(route.visible,feature.id).toBe(true);expect(route.taps,feature.id).toBe(route.route.length);expect(route.taps,feature.id).toBeLessThanOrEqual(feature.maxTaps);}
    }
  });
  it('requires new browser evidence whenever the renderer changes and validates every recorded message', () => {
    const record=read('docs/design-v2/simplification/parity/record.json') as {sources:Record<string,string>};
    for(const [file,expected] of Object.entries(record.sources)) expect(createHash('sha256').update(readFileSync(file)).digest('hex'),file).toBe(expected);
    const observed=new Set(witnesses.flatMap(witness=>witness.actions.map(action=>action.type)));
    for(const witness of witnesses) for(const action of witness.actions) expect(panelAction.safeParse(action).success || projectAction.safeParse(action).success,witness.id).toBe(true);
    for(const feature of inventory.features) for(const action of feature.hostAction) if(!action.startsWith('vadhyar.')) expect(observed.has(action),action).toBe(true);
    expect(witnesses.find(witness=>witness.id==='lock')?.actions.some(action=>action.type==='runCounterexample')).toBe(false);
    expect(witnesses.find(witness=>witness.id==='planned-demo')?.actions).toEqual([]);
  });
  it('keeps every recorded 360px state within the footer and scrolling-task budgets', () => {
    const states=read('docs/design-v2/simplification/gates/states.json') as {theme:string;scene:string;overflow:boolean;task:{height:number};action:{height:number}}[];
    expect(states).toHaveLength(88);
    expect(new Set(states.map(state=>state.theme))).toEqual(new Set(['light','dark','hc','hc-light']));
    for(const state of states) {expect(state.overflow,state.scene).toBe(false);expect(state.action.height,state.scene).toBeLessThanOrEqual(88);expect(state.task.height,state.scene).toBeGreaterThanOrEqual(416);}
  });
});
