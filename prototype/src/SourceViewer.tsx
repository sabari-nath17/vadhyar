// Adapted from shareAI-lab/learn-claude-code source-viewer.tsx at ce8f9f186058939da54c9d6fead78dfb5d0fd6c3; see docs/third-party/learn-claude-code-LICENSE.txt.
import { useEffect, useMemo, useRef } from 'react';
import type { Concept } from './walkthrough-types.js';
import type { SourceSnapshot } from './project-types.js';
import { NavIcon } from './ui.js';
const keywords = new Set('def class import from return if elif else while for in not and or is None True False try except raise with as yield break continue pass global lambda async await self const let var function export default new true false null undefined interface type extends public private static throw switch case'.split(' '));
// shortcut: lexical colors do not parse multiline strings/comments; use a full highlighter when exact syntax coloring is needed.
function highlightLine(line: string, language: string) {
 if (!['Python', 'JavaScript', 'TypeScript'].includes(language)) return line;
 const parts = line.split(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\/\/.*$|#.*$|\b\d+(?:\.\d+)?\b|\b[a-zA-Z_]\w*\b)/);
 return parts.map((part, index) => <span key={index} className={keywords.has(part) ? 'syntax-keyword' : /^(?:#|\/\/)/.test(part) ? 'syntax-comment' : /^(?:"|')/.test(part) ? 'syntax-string' : /^\d/.test(part) ? 'syntax-number' : undefined}>{part}</span>);
}
export function SourceViewer({ source, focus }: { source: SourceSnapshot; focus?: Concept }) {
 const lines = useMemo(() => source.text && source.endLine >= source.startLine ? source.text.split('\n') : [], [source.text, source.startLine, source.endLine]);
 const selectedLine = useRef<HTMLDivElement>(null);
 useEffect(() => { selectedLine.current?.scrollIntoView({ block: 'nearest' }); }, [focus?.id]);
 return <div className="source-window real-source"><div className="source-title"><span><NavIcon name="Source" />{source.path}</span><span>{source.language} · {lines.length ? `lines ${source.startLine}–${source.endLine}` : source.fileBytes === 0 ? 'Empty file' : 'No source in this range'}</span></div><pre tabIndex={0} aria-label="Selected project source">{!lines.length && <code>No source was captured for this range.</code>}{lines.map((line, index) => {
  const number = source.startLine + index, focused = focus && number >= focus.startLine && number <= focus.endLine;
  return <div key={index} ref={number === focus?.startLine ? selectedLine : undefined} className={focused ? 'concept-focus' : undefined} data-source-line={number}><span className="line-number" aria-hidden="true">{number}</span><code>{highlightLine(line, source.language)}</code></div>;
 })}</pre><div className="source-foot">Full-file identity {source.sourceHash.slice(0, 12)} · {source.fileBytes.toLocaleString()} bytes{source.truncated ? ' · excerpt only' : ''}</div></div>;
}
