import { describe, expect, it } from 'vitest';
import { canApproveMilestone, type Actor, type Milestone } from '../novadesk/src/approval.js';

describe('NovaDesk disclosed role-only seed (not ownership-policy verification)', () => {
  it.each<[string, Actor, boolean]>([
    ['allows the owning client', { id: 'client-owner', role: 'client' }, true],
    ['SEEDED BUG: allows a different client', { id: 'client-other', role: 'client' }, true],
    ['denies a freelancer', { id: 'freelancer-1', role: 'freelancer' }, false],
  ])('%s on an active milestone', (_description, actor, expected) => {
    const milestone: Milestone = {
      id: 'milestone-1',
      ownerClientId: 'client-owner',
      status: 'active',
    };

    expect(canApproveMilestone(Object.freeze(actor), Object.freeze(milestone))).toBe(expected);
  });
});
