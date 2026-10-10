import { z } from 'zod';

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
}
