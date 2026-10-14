import { useEffect, useRef, useState } from 'react';
import { Controls, Handle, MarkerType, Position, ReactFlow, type NodeProps, type Node, type FitViewOptions } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { SourceSnapshot } from './project-types.js';
import { projectRequest } from './project-api.js';
import { walkthroughSchema, type Concept, type Walkthrough } from './walkthrough-types.js';
import { SourceViewer } from './SourceViewer.js';
import { StepControls } from './StepControls.js';
import { Control } from './ui.js';
import './walkthrough.css';
type ConceptNode = Node<{ concept: Concept; selected: boolean; choose: () => void }, 'concept'>;
function SourceNode({ data }: NodeProps<ConceptNode>) {
 return <><Handle type="target" position={Position.Right} isConnectable={false} /><Control className="concept-node-button nodrag" aria-pressed={data.selected} onClick={data.choose}><strong>{data.concept.name}</strong><span>{data.concept.kind} · lines {data.concept.startLine}–{data.concept.endLine}</span></Control><Handle type="source" position={Position.Right} isConnectable={false} /></>;
}
const nodeTypes = { concept: SourceNode };
const fitViewOptions = { padding: { top: '20px', bottom: '20px', left: '20px', right: '100px' }, maxZoom: 1 } satisfies FitViewOptions;
export function SourceWalkthrough({ source }: { source: SourceSnapshot }) {
 const [walkthrough, setWalkthrough] = useState<Walkthrough | null>(null), [step, setStep] = useState(0), [busy, setBusy] = useState(false), [error, setError] = useState('');
 const pending = useRef<AbortController | null>(null);
 useEffect(() => () => pending.current?.abort(), []);
 const load = async () => {
  pending.current?.abort(); const controller = new AbortController(); pending.current = controller;
  setBusy(true); setError(''); setWalkthrough(null);
  try {
   const params = new URLSearchParams({ fileId: source.fileId, sourceHash: source.sourceHash, start: String(source.startLine) });
   const value = await projectRequest(`/api/projects/${source.projectId}/walkthrough?${params}`, walkthroughSchema, undefined, controller.signal);
   if (controller.signal.aborted) return;
   if (value.sourceHash !== source.sourceHash || value.fileId !== source.fileId || value.projectId !== source.projectId || value.startLine !== source.startLine || value.endLine !== source.endLine) throw new Error('Walkthrough identity does not match the selected source. Refresh the saved file.');
   setWalkthrough(value); setStep(0);
  } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Source concepts could not be loaded.'); }
  finally { if (!controller.signal.aborted) setBusy(false); }
 };
 const ordered = walkthrough?.order.map(id => walkthrough.concepts.find(concept => concept.id === id)!) ?? [];
 const current = ordered[step];
 const nodes: ConceptNode[] = ordered.map((concept, index) => ({ id: concept.id, type: 'concept', position: { x: 0, y: index * 110 }, data: { concept, selected: index === step, choose: () => setStep(index) } }));
 const edges = walkthrough?.relationships.map((edge, index) => ({ id: `relationship-${index}`, source: edge.from, target: edge.to, label: `${edge.kind} · L${edge.line}`, type: 'smoothstep', pathOptions: { offset: 25 + index * 12 }, style: { stroke: '#526540', strokeWidth: 1.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#526540' } })) ?? [];
 return <div className="source-walkthrough"><SourceViewer source={source} focus={current} /><Control className="secondary" disabled={busy || !source.text || source.endLine < source.startLine} reason="Load a nonempty captured source range to explore its concepts." onClick={() => { void load(); }}>{busy ? 'Reading source concepts…' : walkthrough ? 'Reload source concepts' : 'Explore source concepts'}</Control>{error && <p className="notice warning" role="alert">{error}</p>}{walkthrough && <section className="concept-walkthrough" aria-label="Captured source walkthrough"><h3>Read one concept at a time.</h3><p className="disclosure">{walkthrough.message}{walkthrough.omittedConcepts > 0 ? ` ${walkthrough.omittedConcepts} further concepts are outside this five-concept view.` : ''}</p>{current && <><StepControls currentStep={step} totalSteps={ordered.length} onSelect={setStep} title={current.name} description={`${current.kind} on lines ${current.startLine}–${current.endLine}. This reading order is a proposal; compare the source with your confirmed rule.`} /><ol className="concept-list" aria-label="Ordered source concepts">{ordered.map((concept, index) => <li key={concept.id}><Control className="text-button" aria-current={index === step ? 'step' : undefined} onClick={() => setStep(index)}>{concept.name} · lines {concept.startLine}–{concept.endLine}</Control></li>)}</ol><details open><summary>Static source relationship map</summary><div className="concept-map" aria-label="Read-only source relationship map"><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} nodesDraggable={false} nodesConnectable={false} edgesReconnectable={false} elementsSelectable={false} nodesFocusable={false} edgesFocusable={false} deleteKeyCode={null} zoomOnScroll={false} fitView fitViewOptions={fitViewOptions}><Controls showInteractive={false} fitViewOptions={fitViewOptions} /></ReactFlow></div></details><ul className="relationship-list" aria-label="Static source relationships">{walkthrough.relationships.map((edge, index) => <li key={index}>{ordered.find(concept => concept.id === edge.from)!.name} → {ordered.find(concept => concept.id === edge.to)!.name}: {edge.kind} at line {edge.line}</li>)}</ul>{!edges.length && <p className="disclosure">No supported relationships between these concepts were extracted. Disconnected concepts are retained.</p>}<p className="disclosure">Captured file {source.sourceHash.slice(0, 12)}. Reload checks the saved file identity. Text, controls and map navigate source only; predictions and verification stay in the lesson.</p></>}</section>}</div>;
}
