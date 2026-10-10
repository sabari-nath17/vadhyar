# NovaDesk ownership requirement

ID: novadesk-approval-ownership
Revision: 1

Only the client who owns a milestone may approve it. A freelancer may not approve it.
This prepared teaching fixture intentionally checks client role without checking ownership.
Actors are simulated; this is not authentication. Archived lifecycle rules are withheld until the later transfer exercise.

## Scenarios

- **owner-client-active:** Given an active milestone owned by client-owner, when client-owner approves it, then approval is allowed.
- **other-client-active:** Given that milestone, when client-other approves it, then approval is denied.
- **freelancer-active:** Given that milestone, when freelancer-1 approves it, then approval is denied.
