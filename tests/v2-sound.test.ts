import { afterEach, expect, it, vi } from 'vitest';
import { playTone } from '../src/panel/v2/sound.js';
import { requirementCases, requirementTitle } from '../src/panel/workflow.js';
import type { PanelState } from '../src/shared.js';

afterEach(() => vi.unstubAllGlobals());
it('does not open audio when sound is off and survives unavailable audio', () => {
  const audio=vi.fn(function(){throw new Error('Unavailable');});vi.stubGlobal('AudioContext',audio);
  playTone(false,'tap');expect(audio).not.toHaveBeenCalled();
  expect(()=>playTone(true,'verified')).not.toThrow();expect(audio).toHaveBeenCalledTimes(1);
});
it('plays a bounded local tone and closes its audio context', () => {
  const oscillator={frequency:{value:0},connect:vi.fn(),start:vi.fn(),stop:vi.fn(),onended:undefined as (()=>void)|undefined};
  const gain={connect:vi.fn(),gain:{setValueAtTime:vi.fn(),exponentialRampToValueAtTime:vi.fn()}};
  const close=vi.fn(()=>Promise.resolve());vi.stubGlobal('AudioContext',class {currentTime=1;destination={};createOscillator=()=>oscillator;createGain=()=>gain;close=close;});
  playTone(true,'reveal');expect(oscillator.frequency.value).toBe(520);expect(oscillator.stop).toHaveBeenCalledWith(1.12);
  oscillator.onended?.();expect(close).toHaveBeenCalledOnce();
});
it('reads titles and examples from the actual requirement without supplying a demo fallback', () => {
  const rule={text:'# My custom rule\n\n- **custom-case:** The action must stop.'} as NonNullable<PanelState['requirement']>;
  expect(requirementTitle(rule)).toBe('My custom rule');expect(requirementCases(rule)).toEqual([{title:'custom case',text:'The action must stop.'}]);
  expect(requirementCases(undefined)).toEqual([]);expect(requirementCases({...rule,scenarios:[{title:'Actual scenario',text:'My example'}]})).toEqual([{title:'Actual scenario',text:'My example'}]);
});
