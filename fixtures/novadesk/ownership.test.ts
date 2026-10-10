import { expect, it } from 'vitest';
import { canApproveMilestone } from '@novadesk/approval';

const milestone = Object.freeze({ id: 'milestone-1', ownerClientId: 'client-owner', status: 'active' as const });

it('owner-client-active', () => {
  expect(canApproveMilestone({ id: 'client-owner', role: 'client' }, milestone)).toBe(true);
});
it('other-client-active', () => {
  expect(canApproveMilestone({ id: 'client-other', role: 'client' }, milestone)).toBe(false);
});
it('freelancer-active', () => {
  expect(canApproveMilestone({ id: 'freelancer-1', role: 'freelancer' }, milestone)).toBe(false);
});
