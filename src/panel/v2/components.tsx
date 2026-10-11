import { createContext, useContext, useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type ReactNode, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { lessonSteps, proofLabels, type Proof } from './evidence.js';

export type Tone = 'ok' | 'bad' | 'hint';
export type Pose = 'welcome' | 'thinking' | 'pointing' | 'curious' | 'aha' | 'celebrate' | 'resting' | 'key';
function primaryOnEnter(event: ReactKeyboardEvent<HTMLElement>) {
  if (event.key !== 'Enter' || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
  const target = event.target;
  if (!(target instanceof HTMLElement) || target.isContentEditable || target.closest('.snake-board') || /^(BUTTON|TEXTAREA|SELECT|SUMMARY|A)$/.test(target.tagName) || target instanceof HTMLInputElement && target.type !== 'radio') return;
  event.preventDefault();
  const scope = event.currentTarget.closest('dialog') ?? event.currentTarget.closest('.vd-stage') ?? event.currentTarget;
  scope.querySelector<HTMLButtonElement>('.vd2-button-primary')?.click();
}
export function Glyph({ name }: { name: 'check' | 'close' | 'lock' | 'bulb' | 'source' | 'settings' | 'clock' | 'play' | 'lotus' }) {
  const paths = {
    play: 'm8 5 11 7-11 7Z', lotus: 'M12 18C5 16 2 11 3 6c6 1 9 5 9 12Zm0 0c7-2 10-7 9-12-6 1-9 5-9 12Zm0 0c-5-4-5-10 0-15 5 5 5 11 0 15ZM5 19h14l-2 3H7Z',
    check: 'm5 12 4 4L19 6', close: 'm6 6 12 12M6 18 18 6',
    lock: 'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5Z',
    bulb: 'M9 18h6M10 22h4M8 14a7 7 0 1 1 8 0l-1 4H9Z',
    source: 'm8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18',
    settings: 'M4 7h16M4 17h16M8 4v6M16 14v6', clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v6l4 2',
  };
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

export function StickerButton({ variant = 'secondary', unavailable, reason, busy, operation, children, onClick, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'quiet'; unavailable?: boolean; reason?: string; busy?: boolean; operation?: string }) {
  const id = useId();
  const blocked = unavailable || busy;
  return <div className="vd2-control"><button {...props} className={`vd2-button vd2-button-${blocked ? 'unavailable' : variant} ${className ?? ''}`} aria-disabled={blocked || undefined} aria-busy={busy || undefined} aria-describedby={blocked ? id : props['aria-describedby']} onClick={event => { if (blocked) { event.preventDefault(); return; } onClick?.(event); }}>{busy ? operation ?? 'Preparing current context…' : children}</button>{blocked && <p className="vd2-caption" id={id}>{reason ?? 'Available after the current operation finishes.'}</p>}</div>;
}

export function ActionBar({ children }: { children: ReactNode }) { return <footer className="vd2-actionbar">{children}</footer>; }

export function ProgressSegments({ current, done, available, busy = false, onChoose, onClose, onLocked }: { current: number; done: readonly number[]; available?: readonly number[]; busy?: boolean; onChoose: (index: number) => void; onClose: () => void; onLocked?: (index: number) => void }) {
  const [message, setMessage] = useState('');
  return <><nav className="vd2-progress" aria-label="Lesson progress"><button className="vd2-iconbutton" aria-label="Close lesson" onClick={onClose}><Glyph name="close" /></button><div><p className="vd2-label">{lessonSteps[current]} · {current + 1} of {lessonSteps.length}</p><div className="vd2-segments">{lessonSteps.map((name, index) => {
    const locked = busy || !(available ?? [...done, current]).includes(index);
    return <button key={name} className={`vd2-segment ${current === index ? 'vd2-current' : done.includes(index) ? 'vd2-done' : ''}`} aria-current={current === index ? 'step' : undefined} aria-label={`${name}${locked ? ' — available after earlier steps' : ''}`} data-locked={locked || undefined} onClick={() => { if (!locked) onChoose(index); else if (onLocked) onLocked(index); else setMessage(busy ? 'Finish the current operation first.' : `${name} is available after earlier steps.`); }}><span /></button>;
  })}</div></div></nav>{message && <p role="status" className="vd2-caption">{message}</p>}</>;
}

export function AnswerCard({ label, number, name, value, selected, choose }: { label: string; number: number; name: string; value: string; selected: boolean; choose: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const select = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && (event.target.isContentEditable || /TEXTAREA|SELECT/.test(event.target.tagName) || event.target instanceof HTMLInputElement && event.target.type !== 'radio')) return;
      if (event.key === String(number) && !event.metaKey && !event.ctrlKey && !event.altKey) { event.preventDefault(); choose(); input.current?.focus(); }
    };
    document.addEventListener('keydown', select);
    return () => document.removeEventListener('keydown', select);
  }, [number, choose]);
  return <label className={`vd2-answer ${selected ? 'vd2-selected' : ''}`}><input ref={input} type="radio" name={name} value={value} checked={selected} onChange={choose} /><span className="vd2-number" aria-hidden="true">{number}</span><span>{label}</span>{selected && <span className="vd2-check"><Glyph name="check" /></span>}</label>;
}

export function FeedbackSheet({ tone, title, text, children, onClose }: { tone: Tone; title: string; text: string; children: ReactNode; onClose?: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const previous = document.activeElement;
    heading.current?.focus();
    return () => { if (previous instanceof HTMLElement && previous.isConnected && document.activeElement === document.body) previous.focus(); };
  }, [title]);
  return <section className={`vd2-sheet vd2-tone-${tone}`} aria-label="Code feedback" onKeyDown={event => { primaryOnEnter(event); if (event.key === 'Escape') onClose?.(); }}><div className="vd2-sheet-copy"><Glyph name={tone === 'ok' ? 'check' : tone === 'hint' ? 'bulb' : 'close'} /><div><h2 ref={heading} tabIndex={-1}>{title}</h2><p aria-live="polite">{text}</p></div></div><ActionBar>{children}</ActionBar></section>;
}

export function PathNode({ state, label, description, onSelect }: { state: 'current' | 'done' | 'locked' | 'planned' | 'break'; label: string; description: string; onSelect?: () => void }) {
  const art = <Glyph name={state === 'current' ? 'play' : state === 'done' ? 'check' : state === 'break' ? 'lotus' : state === 'planned' ? 'clock' : 'lock'} />;
  return <div className={`vd2-pathnode vd2-node-${state}`}>{(state === 'current' || state === 'planned') && <span className="vd2-tag">{state === 'current' ? 'START' : 'PLANNED'}</span>}{state === 'planned' || state === 'locked' ? <div className="vd2-node-art" aria-hidden="true">{art}</div> : <button aria-label={label} className="vd2-node-art" onClick={onSelect}>{art}</button>}<h3>{label}</h3><p className="vd2-caption">{description}</p></div>;
}

export function Chip({ children, icon = 'check' }: { children: ReactNode; icon?: 'check' | 'clock' | 'lock' | 'source' | 'bulb' }) { return <span className="vd2-chip"><Glyph name={icon} />{children}</span>; }
export function Banner({ tone, title, children, action }: { tone: Tone; title: string; children: ReactNode; action?: ReactNode }) { return <aside className={`vd2-banner vd2-tone-${tone}`}><Glyph name={tone === 'ok' ? 'check' : tone === 'hint' ? 'bulb' : 'close'} /><div><h3>{title}</h3><p>{children}</p>{action}</div></aside>; }
export function RequirementFrame({ rule, children, compact = false }: { rule: string; children?: ReactNode; compact?: boolean }) { return <section className={`vd2-requirement ${compact ? 'vd2-compact' : ''}`} aria-label="Requirement"><p className="vd2-label">Your rule</p><h2>{rule}</h2>{children}</section>; }
export function Guide({ pose, large = false }: { pose: Pose; large?: boolean }) { return <img className={`vd2-guide ${large ? 'vd2-guide-large' : ''}`} src={`./media/guide/${pose}.svg`} alt={`The Guide, ${pose === 'key' ? 'holding a key' : pose}`} />; }
export function Bloom({ animate }: { animate: boolean }) { return <svg className={`vd2-bloom ${animate ? 'vd2-bloom-once' : ''}`} width="160" height="160" viewBox="0 0 240 240" fill="none" stroke="#2C3539" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><use href="./media/guide/celebrate.svg#rays" />{['left','right','center'].map(side => <use key={side} className={`vd2-petal-${side}`} href={`./media/guide/bloom.svg#petal-${side}`} />)}{['pot','eyes','hand'].map(part => <use key={part} href={`./media/guide/celebrate.svg#${part}`} />)}<path d="M113 136q7 6 14 0" /></svg>; }
export function ProofSticker({ proof, earned }: { proof: Proof; earned: readonly Proof[] }) { if (!earned.includes(proof)) return null; return <figure className="vd2-proof"><img src={`./media/stickers/${proof}.svg`} alt="" /><figcaption>{proofLabels[proof]}</figcaption></figure>; }
export function Disclosure({ title, children }: { title: string; children: ReactNode }) { return <details className="vd2-disclosure"><summary>{title}</summary><div>{children}</div></details>; }

export const TaskNotices = createContext<ReactNode>(null);
export function Task({ title, pose, art, children, action }: { title: string; pose?: Pose; art?: ReactNode; children: ReactNode; action: ReactNode }) {
  const notices = useContext(TaskNotices);
  return <><div className="vd2-task-scroll" onKeyDown={primaryOnEnter}><div className="vd2-task-layout"><div className="vd2-task-copy"><h2 tabIndex={-1}>{title}</h2>{notices}{children}</div>{(pose || art) && <aside className="vd2-task-guide">{art ?? (pose && <Guide pose={pose} large />)}</aside>}</div></div><ActionBar>{action}</ActionBar></>;
}

export function StartSheet({ id, title, pose, open = true, children, action, onClose }: { id?: string; title: string; pose?: Pose; open?: boolean; children: ReactNode; action: ReactNode; onClose: () => void }) {
  const sheet = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const dialog = sheet.current;
    dialog?.showModal();
    dialog?.querySelector<HTMLElement>('h2')?.focus();
    return () => { dialog?.close(); if (previous instanceof HTMLElement && previous.isConnected) previous.focus(); };
  }, [open]);
  return <dialog id={id} ref={sheet} className="vd2-startsheet" aria-labelledby={titleId} onKeyDown={primaryOnEnter} onCancel={event => { event.preventDefault(); onClose(); }}><div className="vd2-start-copy">{pose && <Guide pose={pose} />}<h2 id={titleId} tabIndex={-1}>{title}</h2>{children}</div><ActionBar>{action}</ActionBar></dialog>;
}
