import { z } from 'zod';

const sha = z.string().regex(/^[a-f0-9]{64}$/);
export const predictionSchema = z.object({
  id: z.uuid(), savedAt: z.iso.datetime(), predictedApproval: z.boolean(), reasoning: z.string().trim().min(1).max(1000), sourceHash: sha, requirementRevision: sha,
}).strict();
export type Prediction = z.infer<typeof predictionSchema>;
export interface RunIdentity {
  id: string; predictionId: string; startedAt: string; finishedAt: string; latencyMs: number;
  sourceHash: string; requirementRevision: string; fingerprints?: { harness: string; config: string; lock: string }; vitestVersion: '5.0.3';
}
export interface OwnershipCase { id: 'owner-client-active' | 'other-client-active' | 'freelancer-active'; observedApproval: boolean; expectedApproval: boolean; status: 'passed' | 'failed' }
export type RunnerOutcome = { kind: 'completed'; cases: OwnershipCase[]; requirementPassed: boolean; exitCode: 0 | 1 } | { kind: 'executionError' | 'timeout'; message: string };
export type Counterexample = RunIdentity & { caseId: 'other-client-active' } & ({ kind: 'completed'; observedApproval: boolean; requirementPassed: boolean; exitCode: 0 | 1; executedCases: 1; skippedCases: 2 } | { kind: 'executionError' | 'timeout'; message: string });
export type OwnershipRun = RunIdentity & RunnerOutcome & { baselineHash: string; suiteId: 'ownership' };
export const hintSchema = z.object({ level: z.number().int().min(1).max(3), text: z.string().min(1).max(1200), sourceRefId: z.string().min(1).max(128) }).strict();
export type Hint = z.infer<typeof hintSchema>;
export interface HintEvidence {
  id: string; type: 'hint'; predictionId: string; recordedAt: string; sourceHash: string; requirementRevision: string; counterexampleId: string; contextIdentity: string;
  result: { responseId: string; model: string; requestedModel: string; latencyMs: number; usage?: { inputTokens: number; outputTokens: number; totalTokens: number }; hint: Hint };
}
export interface DiffEvidence {
  id: string; type: 'diff'; predictionId: string; recordedAt: string; sourceHash: string; requirementRevision: string;
  before: { content: string; hash: string }; after: { content: string; hash: string };
}

export const panelAction = z.discriminatedUnion('type', [
  z.object({ type: z.literal('ready') }).strict(),
  z.object({ type: z.literal('setupKey') }).strict(),
  z.object({ type: z.literal('previewExplain') }).strict(),
  z.object({ type: z.literal('explain'), identity: z.string().regex(/^[a-f0-9]{64}$/) }).strict(),
  z.object({ type: z.literal('cancelExplain') }).strict(),
  z.object({ type: z.literal('openSource'), id: z.string().min(1).max(128) }).strict(),
  z.object({ type: z.literal('confirmRequirement'), revision: z.string().regex(/^[a-f0-9]{64}$/) }).strict(),
  z.object({ type: z.literal('checkpoint') }).strict(),
  z.object({ type: z.literal('refreshGraph') }).strict(),
  z.object({ type: z.literal('confirmMapping'), identity: z.string().regex(/^[a-f0-9]{64}$/) }).strict(),
  z.object({ type: z.literal('savePrediction'), predictedApproval: z.boolean(), reasoning: z.string().trim().min(1).max(1000), sourceHash: sha, requirementRevision: sha }).strict(),
  z.object({ type: z.literal('runCounterexample'), predictionId: z.uuid() }).strict(),
  z.object({ type: z.literal('previewHint') }).strict(),
  z.object({ type: z.literal('hint'), identity: sha }).strict(),
  z.object({ type: z.literal('openDiff') }).strict(),
  z.object({ type: z.literal('runOwnership') }).strict(),
]);
export type PanelAction = z.infer<typeof panelAction>;
export interface SourceRef { id: string; path: string; startLine: number; endLine: number; symbol: string; hash: string }
export interface GraphEvidence {
  version: string; identity: string; sourceHash: string; extractedAt: string; refs: SourceRef[];
  relationships: { sourceId: string; targetId: string; relation: string; provenance: string }[];
}
export interface ContextPreview { identity: string; model: string; instruction: string; text: string }
export interface ExplainEvidence {
  responseId: string; model: string; requestedModel: string; latencyMs: number;
  usage?: { inputTokens: number; outputTokens: number; totalTokens: number };
  explanation: { summary: string; steps: { title: string; text: string; sourceRefId: string }[] };
}
export interface PanelState {
  refs: SourceRef[]; error?: string; busy: boolean;
  requirement?: { id: string; revision: string; text: string };
  confirmed?: boolean; checkpointCount?: number; checkpointHash?: string;
  graph?: GraphEvidence; mappingConfirmed?: boolean; mappingRequirementRevision?: string;
  hasKey?: boolean; preview?: ContextPreview; explanation?: ExplainEvidence;
  sourceHash?: string; prediction?: Prediction; counterexample?: Counterexample; counterexampleRunning?: boolean;
  baselineHash?: string; hintPreview?: ContextPreview; hints?: HintEvidence[]; diff?: DiffEvidence; ownershipRun?: OwnershipRun; ownershipRunning?: boolean;
}
