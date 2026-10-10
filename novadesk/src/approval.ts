export interface Actor {
  id: string;
  role: 'client' | 'freelancer';
}

export interface Milestone {
  id: string;
  ownerClientId: string;
  status: 'active' | 'archived';
}

export function canApproveMilestone(actor: Actor, _milestone: Milestone): boolean {
  // Disclosed teaching seed: ownership is intentionally omitted.
  return actor.role === 'client';
}
