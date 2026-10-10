import type { ExplainEvidence, SourceRef } from '../shared.js';
import { resolveReference, type PreparedFile } from './source.js';

// Escape Markdown so model text cannot become links, images, HTML or commands in CodeTour.
export const plain = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/([\\`*_{}[\]()#+.!|~-])/g, '\\$1').replace(/:/g, '&#58;');

export function codeTour(explanation: ExplainEvidence, refs: SourceRef[], source: PreparedFile, identity: { sourceHash: string; requirementRevision: string }, requirementRevision: string) {
  if (identity.sourceHash !== source.hash || identity.requirementRevision !== requirementRevision) throw new Error('Walkthrough is stale; refresh the explanation before navigating or exporting.');
  return {
    title: 'Vadhyar — understand this change',
    steps: explanation.explanation.steps.map(step => {
      const ref = resolveReference(refs, step.sourceRefId, source);
      return { title: plain(step.title), file: ref.path, line: ref.startLine, description: plain(step.text) };
    }),
  };
}
