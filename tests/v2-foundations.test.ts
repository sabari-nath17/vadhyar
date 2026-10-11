import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync('src/panel/v2/tokens.css', 'utf8');
function declarations(block: string) { return Object.fromEntries([...block.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(item => [item[1], item[2].trim()])); }
const light = declarations(css.slice(css.indexOf(':root {'), css.indexOf('}\n')));
const darkBlock = css.slice(css.indexOf('.vd-theme-dark'), css.indexOf('.vd-theme-hc'));
const dark = { ...light, ...declarations(darkBlock) };
const hc = { ...light, ...declarations(css.slice(css.indexOf('.vd-theme-hc,'), css.indexOf('.vd-theme-hc-light, body.'))) };
const hcLight = { ...hc, ...declarations(css.slice(css.indexOf('.vd-theme-hc-light, body.'), css.indexOf('@media'))) };
function value(tokens: Record<string, string>, key: string): string {
  function resolve(raw: string): string {
    if (raw.startsWith('#')) return raw;
    const ref = raw.match(/^var\((--[\w-]+)(?:,\s*(.+))?\)$/);
    if (!ref) throw new Error('Expected an inspectable color token.');
    return resolve(tokens[ref[1]] ?? ref[2]);
  }
  return resolve(tokens[key]);
}
function luminance(color: string) { return color.slice(1).match(/../g)!.map(item => parseInt(item, 16) / 255).map(item => item <= .04045 ? item / 12.92 : ((item + .055) / 1.055) ** 2.4).reduce((sum, item, index) => sum + item * [.2126, .7152, .0722][index], 0); }
function contrast(a: string, b: string) { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
describe('V2 token and authored asset boundaries', () => {
  it.each([['light', light], ['dark', dark], ['high contrast dark', hc], ['high contrast light', hcLight]])('keeps %s text and UI borders above their contrast floor', (_name, tokens) => {
    for (const background of ['--canvas', '--card', '--sheet-ok', '--sheet-bad', '--sheet-hint']) {
      for (const foreground of ['--text', '--muted']) expect(contrast(value(tokens, foreground), value(tokens, background))).toBeGreaterThanOrEqual(4.5);
      expect(contrast(value(tokens, '--border'), value(tokens, background))).toBeGreaterThanOrEqual(3);
    }
    expect(contrast(value(tokens, '--pass-text'), value(tokens, '--sheet-ok'))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(value(tokens, '--fail-text'), value(tokens, '--sheet-bad'))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(value(tokens, '--on-primary'), value(tokens, '--primary'))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(value(tokens, '--disabled-text'), value(tokens, '--disabled-bg'))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(value(tokens, '--link'), value(tokens, '--canvas'))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(value(tokens, '--focus'), value(tokens, '--canvas'))).toBeGreaterThanOrEqual(3);
  });
  it('ships the full inert SVG asset set without scripts, links or baked text', () => {
    const paths = ['brand','guide','path','stickers','gates'].flatMap(folder => readdirSync(join('media', folder)).map(file => join('media', folder, file)));
    expect(paths).toHaveLength(26);
    for (const file of paths) {
      const svg = readFileSync(file, 'utf8');
      expect(svg).toMatch(/<svg[^>]+viewBox=/);
      expect(svg).not.toMatch(/<(script|foreignObject|text)|\bon\w+=|href=|https?:\/\/(?!www\.w3\.org)/i);
    }
    for (const pose of ['welcome','thinking','pointing','curious','aha','celebrate','key']) {
      const svg = readFileSync(`media/guide/${pose}.svg`, 'utf8');
      for (const id of ['eyes','hand','petals']) expect(svg).toContain(`id="${id}"`);
    }
  });
  it('includes the descending hand in both square brand emblems', () => {
    for (const file of ['symbol', 'symbol-mono']) expect(readFileSync(`media/brand/${file}.svg`, 'utf8')).toContain('id="hand"');
  });
  it('redefines the surface-dependent selected color inside the dark theme', () => {
    expect(Object.hasOwn(declarations(darkBlock), '--selected')).toBe(true);
  });
});
