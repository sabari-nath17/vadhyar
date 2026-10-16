import { useId, type ButtonHTMLAttributes, type ReactNode } from 'react';
export function Control({ disabled, reason = 'Available after the current operation finishes.', className, onClick, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { reason?: string }) {
  const id = useId();
  return <><button {...props} className={disabled ? className?.replace('vd-primary', 'vd-unavailable') : className} aria-disabled={disabled || undefined} aria-describedby={disabled ? id : props['aria-describedby']} onClick={event => { if (disabled) { event.preventDefault(); return; } onClick?.(event); }}>{children}</button>{disabled && <p id={id} className="vd-muted vd-unavailable-reason">{reason}</p>}</>;
}
export function Mark() { return <span className="brand"><img src="/assets/logo.png" alt="Vadhyar: understand what you build" /></span>; }
export function Arrow() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>; }
export function NavIcon({ name }: { name: 'Path' | 'Project' | 'Notebook' | 'Learn' | 'Source' | 'Close' | 'Check' | 'History' | 'Observe' | 'Settings' }) {
 const paths = {
  Learn: 'M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1m0-15c3-2 6-2 9-1v15c-3-1-6-1-9 1V5',
  Project: 'M3 6h6l2 3h10v11H3Z', Notebook: 'M6 3h13v18H6ZM3 7h3m-3 5h3m-3 5h3m4-10h5m-5 4h5', Source: 'm8 6-6 6 6 6m8-12 6 6-6 6', Close: 'm6 6 12 12M6 18 18 6', Path: 'M9 4c15 4-12 10 1 16m2-17a3 3 0 1 1-6 0 3 3 0 0 1 6 0m3 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0', Check: 'm5 12 4 4L19 6', History: 'M12 5v7l4 2M3 12a9 9 0 1 0 3-6L3 9m0-6v6h6', Observe: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12m13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0', Settings: 'M4 7h16M4 17h16M8 4v6M16 14v6'
 };
 return <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d={paths[name]} /></svg>;
}
export function Lotus() { return <svg className="lotus" viewBox="0 0 96 88" aria-hidden="true"><path d="M48 65C29 47 32 26 48 7c16 19 19 40 0 58Z" fill="#D9A05B" /><path d="M48 65C18 65 8 51 10 25c23 4 34 17 38 40Zm0 0c30 0 40-14 38-40-23 4-34 17-38 40Z" fill="#6A8A82" /><path d="M5 74h86" fill="none" /></svg>; }
export function Heading({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) { return <div className="page-heading"><div><h1 tabIndex={-1} id="page-heading">{title}</h1>{children && <p className="lede">{children}</p>}</div>{action}</div>; }
export function download(text: string, filename = 'vadhyar-notebook.md') { const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
