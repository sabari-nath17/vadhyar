import type { ReactNode } from 'react';
import { Control } from '../../src/panel/ui.js';
import { preparedSource, type Page } from './model.js';
export { Control };
export function Mark() { return <span className="brand"><img src="/assets/logo.png" alt="Vadhyar: understand what you build" /></span>; }
export function Arrow() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>; }
export function NavIcon({ name }: { name: Page | 'Source' | 'Close' }) {
 const paths = {
  Today: 'm3 10 9-7 9 7v10h-6v-6H9v6H3Z', Learn: 'M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1m0-15c3-2 6-2 9-1v15c-3-1-6-1-9 1V5', Practice: 'm8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18', Project: 'M3 6h6l2 3h10v11H3Z', Progress: 'M5 20v-6m7 6V9m7 11V4', Notebook: 'M6 3h13v18H6ZM3 7h3m-3 5h3m-3 5h3m4-10h5m-5 4h5', Website: 'M13 4h7v7m0-7L10 14M8 5H4v15h15v-4', Source: 'm8 6-6 6 6 6m8-12 6 6-6 6', Close: 'm6 6 12 12M6 18 18 6'
 };
 return <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d={paths[name]} /></svg>;
}
export function Heading({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) { return <div className="page-heading"><div><h1 tabIndex={-1} id="page-heading">{title}</h1>{children && <p className="lede">{children}</p>}</div>{action}</div>; }
export function Source({ fixed = false, revision = 1, compact = false }: { fixed?: boolean; revision?: number; compact?: boolean }) {
 const lines = preparedSource(fixed, revision).split('\n');
 return <div className={'source-window' + (compact ? ' compact' : '')}><div className="source-title"><span><NavIcon name="Source" /> src/approval.ts</span><span>Prepared r{revision}</span></div><pre aria-label="Prepared source code">{lines.map((line, index) => <div key={index}><span className="line-number" aria-hidden="true">{index + 1}</span><code className={line.includes('actor.id') ? 'added-line' : ''}>{line}</code></div>)}</pre></div>;
}
export function download(text: string, filename = 'vadhyar-notebook.md') { const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
