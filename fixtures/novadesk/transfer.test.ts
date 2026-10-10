import './ownership.test.js';
import { expect, it } from 'vitest';
import { canApproveMilestone } from '@novadesk/approval';

it('owner-client-archived', ({ task }) => {
  const actual = canApproveMilestone({ id: 'client-owner', role: 'client' }, { id: 'milestone-1', ownerClientId: 'client-owner', status: 'archived' });
  Object.assign(task.meta, { approval: actual });
  expect(actual).toBe(false);
});
