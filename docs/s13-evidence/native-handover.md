# Vadhyar NovaDesk evidence handover

Prepared exercise with disclosed bugs. Passing fixed checks is behavior evidence, not mastery or a measured learning gain. Earlier authorship and external assistance are unknown. This report is a snapshot; freshness can change after export.

## Confirmed requirement revisions

### novadesk\-approval\-ownership
Revision: c455503e7dd3d132533643ffac28b908a553596f8ad47e2959db46daf74c864d

\# NovaDesk ownership requirement

ID&#58; novadesk\-approval\-ownership
Revision&#58; 1

Only the client who owns a milestone may approve it\. A freelancer may not approve it\.
This prepared teaching fixture intentionally checks client role without checking ownership\.
Actors are simulated; this is not authentication\. Archived lifecycle rules are withheld until the later transfer exercise\.

\#\# Scenarios

\- \*\*owner\-client\-active&#58;\*\* Given an active milestone owned by client\-owner, when client\-owner approves it, then approval is allowed\.
\- \*\*other\-client\-active&#58;\*\* Given that milestone, when client\-other approves it, then approval is denied\.
\- \*\*freelancer\-active&#58;\*\* Given that milestone, when freelancer\-1 approves it, then approval is denied\.


### Archived milestone transfer
Revision: 6705e110bc2989d4f5a4575682e5f091d9498c2e0e98a7e97ca535940902415d

\# NovaDesk archived\-milestone transfer

ID&#58; novadesk\-approval\-ownership
Revision&#58; 2

Only the owning client may approve an active milestone\. An archived milestone must never be approved, including by its owning client\. Freelancers remain denied\.

This is a separate prepared transfer attempt after the ownership exercise\. Inspect and edit the source yourself\. Any hints used here are recorded as assistance; passing the fixed cases does not establish mastery or independent understanding\.

\#\# Scenarios

\- \*\*owner\-client\-active&#58;\*\* The owning client may approve an active milestone\.
\- \*\*other\-client\-active&#58;\*\* A different client must not approve that milestone\.
\- \*\*freelancer\-active&#58;\*\* A freelancer must not approve that milestone\.
\- \*\*owner\-client\-archived&#58;\*\* The owning client must not approve an archived milestone\.


## Attempts and assistance

- cc130f8d-9cc9-4fdc-b63d-fae1ffa6e23c: ownership; 1 coach hints recorded. Source: eda0127427545d06c9e2ff88bd51d6022674f43dbd1ccbd56da5f6c8ae3e7fd3; requirement: c455503e7dd3d132533643ffac28b908a553596f8ad47e2959db46daf74c864d.

- 860d1fc9-070e-4f75-9b66-414af5bd80d0: archived transfer; 0 coach hints recorded. Source: d41e8c0de5bd6baac8e64c1cd9f79ae7e2b5ea0f117e3a7b0f88ca142a1214db; requirement: 6705e110bc2989d4f5a4575682e5f091d9498c2e0e98a7e97ca535940902415d.

## Recorded evidence

### Requirement confirmed
2026\-10\-10T23&#58;23&#58;34\.529Z · historical or unverified for export inputs
ID: requirement\-c455503e7dd3d132533643ffac28b908a553596f8ad47e2959db46daf74c864d
Requirement: c455503e7dd3d132533643ffac28b908a553596f8ad47e2959db46daf74c864d
Source: not captured in this record

novadesk\-approval\-ownership

### Source checkpoint
2026\-10\-10T23&#58;23&#58;42\.615Z · historical or unverified for export inputs
ID: checkpoint\-0\-eda0127427545d06c9e2ff88bd51d6022674f43dbd1ccbd56da5f6c8ae3e7fd3
Requirement: c455503e7dd3d132533643ffac28b908a553596f8ad47e2959db46daf74c864d
Source: eda0127427545d06c9e2ff88bd51d6022674f43dbd1ccbd56da5f6c8ae3e7fd3

src/approval\.ts

### Validated explanation saved
2026\-10\-10T23&#58;25&#58;14\.484Z · historical or unverified for export inputs
ID: explanation\-resp\_04510892b99a7d29016acac953e24887d2a9bd2d414cb67a1f
Requirement: c455503e7dd3d132533643ffac28b908a553596f8ad47e2959db46daf74c864d
Source: eda0127427545d06c9e2ff88bd51d6022674f43dbd1ccbd56da5f6c8ae3e7fd3

Model gpt\-6\-astra; response resp\_04510892b99a7d29016acac953e24887d2a9bd2d414cb67a1f; 9266 ms\.

### Ownership prediction saved
2026\-10\-10T23&#58;26&#58;01\.340Z · historical or unverified for export inputs
ID: cc130f8d\-9cc9\-4fdc\-b63d\-fae1ffa6e23c
Requirement: c455503e7dd3d132533643ffac28b908a553596f8ad47e2959db46daf74c864d
Source: eda0127427545d06c9e2ff88bd51d6022674f43dbd1ccbd56da5f6c8ae3e7fd3

Predicted allow\. Developer release rehearsal&#58; the current return uses only the client role, so the different client will be allowed even though the ownership rule requires denial\. This is an automated developer test, not a learner answer\.

### Prepared case executed
2026\-10\-10T23&#58;26&#58;04\.987Z · historical or unverified for export inputs
ID: c2274b7d\-f98e\-425b\-807b\-9f0964b997d9
Requirement: c455503e7dd3d132533643ffac28b908a553596f8ad47e2959db46daf74c864d
Source: eda0127427545d06c9e2ff88bd51d6022674f43dbd1ccbd56da5f6c8ae3e7fd3

other\-client\-active&#58; observed allow; requirement failed\.

### Coach hint recorded
2026\-10\-10T23&#58;26&#58;31\.980Z · historical or unverified for export inputs
ID: 353d71fd\-6a8a\-4f2c\-99c7\-5763abc85453
Requirement: c455503e7dd3d132533643ffac28b908a553596f8ad47e2959db46daf74c864d
Source: eda0127427545d06c9e2ff88bd51d6022674f43dbd1ccbd56da5f6c8ae3e7fd3

Level 1&#58; The current function checks only the client role\. The recorded counterexample observed another client being allowed at the same source hash as the current version\. Knowing who an actor is differs from deciding what they may do&#58; what relationship to this milestone should determine whether a client is authorized to approve it?

### Saved\-source diff opened
2026\-10\-10T23&#58;29&#58;19\.277Z · historical or unverified for export inputs
ID: f0c250ee\-f2c4\-4035\-8729\-4c71eb5c1007
Requirement: c455503e7dd3d132533643ffac28b908a553596f8ad47e2959db46daf74c864d
Source: d41e8c0de5bd6baac8e64c1cd9f79ae7e2b5ea0f117e3a7b0f88ca142a1214db

Native diff&#58; eda0127427545d06c9e2ff88bd51d6022674f43dbd1ccbd56da5f6c8ae3e7fd3 → d41e8c0de5bd6baac8e64c1cd9f79ae7e2b5ea0f117e3a7b0f88ca142a1214db

### Full checks executed
2026\-10\-10T23&#58;29&#58;26\.505Z · historical or unverified for export inputs
ID: 547c8aeb\-d91e\-4dd9\-9ff3\-0d34883fce85
Requirement: c455503e7dd3d132533643ffac28b908a553596f8ad47e2959db46daf74c864d
Source: d41e8c0de5bd6baac8e64c1cd9f79ae7e2b5ea0f117e3a7b0f88ca142a1214db

ownership&#58; owner\-client\-active passed \(required allow, observed allow\); other\-client\-active passed \(required deny, observed deny\); freelancer\-active passed \(required deny, observed deny\)\. Exit 0\.

### Requirement confirmed
2026\-10\-10T23&#58;29&#58;44\.089Z · matches inputs at export
ID: requirement\-6705e110bc2989d4f5a4575682e5f091d9498c2e0e98a7e97ca535940902415d
Requirement: 6705e110bc2989d4f5a4575682e5f091d9498c2e0e98a7e97ca535940902415d
Source: not captured in this record

Archived milestone transfer

### Transfer prediction saved
2026\-10\-10T23&#58;29&#58;56\.832Z · historical or unverified for export inputs
ID: 860d1fc9\-070e\-4f75\-9b66\-414af5bd80d0
Requirement: 6705e110bc2989d4f5a4575682e5f091d9498c2e0e98a7e97ca535940902415d
Source: d41e8c0de5bd6baac8e64c1cd9f79ae7e2b5ea0f117e3a7b0f88ca142a1214db

Predicted allow\. Developer release rehearsal&#58; ownership now matches, but the saved decision does not inspect milestone status\. I expect the archived owner to be allowed, which breaks the revised requirement\. This is a delegated developer test, not a learner prediction\.

### Prepared case executed
2026\-10\-10T23&#58;29&#58;57\.271Z · historical or unverified for export inputs
ID: 37d579cd\-b48d\-4160\-adbb\-eb8981998b7e
Requirement: 6705e110bc2989d4f5a4575682e5f091d9498c2e0e98a7e97ca535940902415d
Source: d41e8c0de5bd6baac8e64c1cd9f79ae7e2b5ea0f117e3a7b0f88ca142a1214db

owner\-client\-archived&#58; observed allow; requirement failed\.

### Saved\-source diff opened
2026\-10\-10T23&#58;30&#58;17\.773Z · matches inputs at export
ID: 67200a9d\-ad80\-4c8a\-9986\-b677e7cbdb58
Requirement: 6705e110bc2989d4f5a4575682e5f091d9498c2e0e98a7e97ca535940902415d
Source: 8e39a8e0f9d8b358da6629dfec955fed5327e15c071fd884c8b267a41605b35e

Native diff&#58; d41e8c0de5bd6baac8e64c1cd9f79ae7e2b5ea0f117e3a7b0f88ca142a1214db → 8e39a8e0f9d8b358da6629dfec955fed5327e15c071fd884c8b267a41605b35e

### Full checks executed
2026\-10\-10T23&#58;30&#58;19\.241Z · matches inputs at export
ID: dd3c145f\-f7cb\-42ba\-af3c\-b102ea12c38c
Requirement: 6705e110bc2989d4f5a4575682e5f091d9498c2e0e98a7e97ca535940902415d
Source: 8e39a8e0f9d8b358da6629dfec955fed5327e15c071fd884c8b267a41605b35e

transfer&#58; owner\-client\-active passed \(required allow, observed allow\); other\-client\-active passed \(required deny, observed deny\); freelancer\-active passed \(required deny, observed deny\); owner\-client\-archived passed \(required deny, observed deny\)\. Exit 0\.

### Local reflection saved
2026\-10\-10T23&#58;30&#58;48\.951Z · matches inputs at export
ID: 35911d0d\-a092\-4ab1\-81a5\-ff2108fb34d1
Requirement: 6705e110bc2989d4f5a4575682e5f091d9498c2e0e98a7e97ca535940902415d
Source: 8e39a8e0f9d8b358da6629dfec955fed5327e15c071fd884c8b267a41605b35e

Developer acceptance rehearsal, delegated by the user\. The first change checked client ownership and passed the three fixed cases\. The archived owner still broke the revised requirement until the second saved change required active status\. All four checks now match the rule\. One recorded ownership hint and zero transfer hints describe this run; these outcomes do not establish learner authorship, mastery or independent understanding\.
