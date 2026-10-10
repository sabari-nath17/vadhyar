import { z } from 'zod';

export const panelAction = z.discriminatedUnion('type', [
  z.object({ type: z.literal('ready') }).strict(),
  z.object({ type: z.literal('openSource'), id: z.string().min(1).max(128) }).strict(),
  z.object({ type: z.literal('confirmRequirement'), revision: z.string().regex(/^[a-f0-9]{64}$/) }).strict(),
  z.object({ type: z.literal('checkpoint') }).strict(),
]);
export type PanelAction = z.infer<typeof panelAction>;
export interface SourceRef { id: string; path: string; startLine: number; endLine: number; symbol: string; hash: string }
export interface PanelState {
  refs: SourceRef[]; error?: string; busy: boolean;
  requirement?: { id: string; revision: string; text: string };
  confirmed?: boolean; checkpointCount?: number; checkpointHash?: string;
}
