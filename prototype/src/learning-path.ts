import type { ProjectAttempt } from './project-learning.js';

export const lessonSteps = [
 { key: 'predict', label: 'Predict', title: 'What do you expect?', description: 'Make a prediction before observing the case.', action: 'Save prediction', next: 'Make your prediction.', prerequisite: 'Start this question' },
 { key: 'observe', label: 'Observe', title: 'What did you observe?', description: 'Record what happened in your own editor or running project.', action: 'Record observation', next: 'Observe the case.', prerequisite: 'After prediction' },
 { key: 'change', label: 'Change', title: 'Check the saved source.', description: 'Edit in your usual tool if needed, then refresh the saved file.', action: 'Refresh saved source', next: 'Review the saved source.', prerequisite: 'After observation' },
 { key: 'verify', label: 'Verify', title: 'What does the evidence support?', description: 'Keep the check result and your requirement verdict separate.', action: 'Record scoped verification', next: 'Check your evidence.', prerequisite: 'After source refresh' },
 { key: 'reflect', label: 'Reflect', title: 'What changed in your thinking?', description: 'Explain the result and what you would investigate next.', action: 'Save reflection', next: 'Keep the useful reasoning.', prerequisite: 'After scoped evidence' },
 { key: 'complete', label: 'Separate case', title: 'Try a different case.', description: 'Choose a new input or state and explain your prediction.', action: 'Record separate case', next: 'Try a separate case.', prerequisite: 'After reflection' },
] as const satisfies readonly { key: ProjectAttempt['stage']; label: string; title: string; description: string; action: string; next: string; prerequisite: string }[];

export type Freshness = 'current' | 'changed' | 'unknown';
export function pathStepState(attempt: ProjectAttempt, index: number, freshness: Freshness) {
 const current = lessonSteps.findIndex(step => step.key === attempt.stage);
 if (index > current) return 'upcoming';
 if (index === current && !(attempt.stage === 'complete' && attempt.transfer)) return 'current';
 if (index > 0 && freshness !== 'current') return 'historical';
 return 'recorded';
}
