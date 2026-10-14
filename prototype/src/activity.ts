import type { ProjectState } from './project-learning.js';
export function activityPoints(state: ProjectState): number {
 const seen = new Set<string>(); let points = 0;
 for (const a of [...state.history, ...(state.attempt ? [state.attempt] : [])]) {
  for (const [kind, value, reward] of [['prediction', a.prediction, 10], ['observation', a.observation, 5], ['verification', a.verification, 10], ['reflection', a.reflection, 10], ['transfer', a.transfer, 15]] as const) {
   if (!value) continue;
   const key = `${kind}:${value.recordedAt}:${a.baseline.fileId}:${a.baseline.sourceHash}`;
   if (!seen.has(key)) { seen.add(key); points += reward; }
  }
 }
 return points;
}
export function savedPredictionCount(state: ProjectState): number {
 return new Set([...state.history, ...(state.attempt ? [state.attempt] : [])].filter(a => a.prediction).map(a => `${a.baseline.fileId}:${a.baseline.sourceHash}:${a.prediction!.recordedAt}`)).size;
}
