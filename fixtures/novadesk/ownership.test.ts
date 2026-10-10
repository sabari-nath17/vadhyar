import { expect, it } from 'vitest';
import { canApproveMilestone } from '@novadesk/approval';

const milestone = Object.freeze({ id: 'milestone-1', ownerClientId: 'client-owner', status: 'active' as const });

it('owner-client-active', ({ task }) => {
  const actual = canApproveMilestone({ id: 'client-owner', role: 'client' }, milestone);
  Object.assign(task.meta, { approval: actual });
  expect(actual).toBe(true);
});
it('other-client-active', ({ task }) => {
  const actual = canApproveMilestone({ id: 'client-other', role: 'client' }, milestone);
  Object.assign(task.meta, { approval: actual });
  expect(actual).toBe(false);
});
it('freelancer-active', ({ task }) => {
  const actual = canApproveMilestone({ id: 'freelancer-1', role: 'freelancer' }, milestone);
  Object.assign(task.meta, { approval: actual });
  expect(actual).toBe(false);
});
