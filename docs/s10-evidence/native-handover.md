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

- bf7d1530-b44e-4cbf-9377-84f10b18e7aa: ownership; 0 coach hints recorded. Source: eda0127427545d06c9e2ff88bd51d6022674f43dbd1ccbd56da5f6c8ae3e7fd3; requirement: c455503e7dd3d132533643ffac28b908a553596f8ad47e2959db46daf74c864d.

- b4ae3e53-01b0-46db-b5fd-1aeb0febaf35: archived transfer; 0 coach hints recorded. Source: d41e8c0de5bd6baac8e64c1cd9f79ae7e2b5ea0f117e3a7b0f88ca142a1214db; requirement: 6705e110bc2989d4f5a4575682e5f091d9498c2e0e98a7e97ca535940902415d.

## Recorded evidence

### Requirement confirmed
2026\-10\-10T22&#58;10&#58;30\.768Z · historical or unverified for export inputs
ID: requirement\-c455503e7dd3d132533643ffac28b908a553596f8ad47e2959db46daf74c864d
Requirement: c455503e7dd3d132533643ffac28b908a553596f8ad47e2959db46daf74c864d
Source: not captured in this record

novadesk\-approval\-ownership

### Source checkpoint
2026\-10\-10T22&#58;10&#58;30\.782Z · historical or unverified for export inputs
ID: checkpoint\-0\-eda0127427545d06c9e2ff88bd51d6022674f43dbd1ccbd56da5f6c8ae3e7fd3
Requirement: c455503e7dd3d132533643ffac28b908a553596f8ad47e2959db46daf74c864d
Source: eda0127427545d06c9e2ff88bd51d6022674f43dbd1ccbd56da5f6c8ae3e7fd3

src/approval\.ts

### Ownership prediction saved
2026\-10\-10T22&#58;10&#58;30\.795Z · historical or unverified for export inputs
ID: bf7d1530\-b44e\-4cbf\-9377\-84f10b18e7aa
Requirement: c455503e7dd3d132533643ffac28b908a553596f8ad47e2959db46daf74c864d
Source: eda0127427545d06c9e2ff88bd51d6022674f43dbd1ccbd56da5f6c8ae3e7fd3

Predicted allow\. Integration setup driver observes the disclosed role\-only seed\.

### Prepared case executed
2026\-10\-10T22&#58;10&#58;31\.183Z · historical or unverified for export inputs
ID: 36e08cbf\-918b\-483a\-888e\-6b14a56b7e37
Requirement: c455503e7dd3d132533643ffac28b908a553596f8ad47e2959db46daf74c864d
Source: eda0127427545d06c9e2ff88bd51d6022674f43dbd1ccbd56da5f6c8ae3e7fd3

other\-client\-active&#58; observed allow; requirement failed\.

### Saved\-source diff opened
2026\-10\-10T22&#58;10&#58;31\.254Z · historical or unverified for export inputs
ID: 7960764c\-f17b\-4d38\-b3f6\-9a161af3ab8e
Requirement: c455503e7dd3d132533643ffac28b908a553596f8ad47e2959db46daf74c864d
Source: d41e8c0de5bd6baac8e64c1cd9f79ae7e2b5ea0f117e3a7b0f88ca142a1214db

Native diff&#58; eda0127427545d06c9e2ff88bd51d6022674f43dbd1ccbd56da5f6c8ae3e7fd3 → d41e8c0de5bd6baac8e64c1cd9f79ae7e2b5ea0f117e3a7b0f88ca142a1214db

### Full checks executed
2026\-10\-10T22&#58;10&#58;31\.791Z · historical or unverified for export inputs
ID: c88fa06d\-da89\-4f57\-b042\-54eeb5656624
Requirement: c455503e7dd3d132533643ffac28b908a553596f8ad47e2959db46daf74c864d
Source: d41e8c0de5bd6baac8e64c1cd9f79ae7e2b5ea0f117e3a7b0f88ca142a1214db

ownership&#58; owner\-client\-active passed \(required allow, observed allow\); other\-client\-active passed \(required deny, observed deny\); freelancer\-active passed \(required deny, observed deny\)\. Exit 0\.

### Requirement confirmed
2026\-10\-10T22&#58;13&#58;36\.041Z · matches inputs at export
ID: requirement\-6705e110bc2989d4f5a4575682e5f091d9498c2e0e98a7e97ca535940902415d
Requirement: 6705e110bc2989d4f5a4575682e5f091d9498c2e0e98a7e97ca535940902415d
Source: not captured in this record

Archived milestone transfer

### Source checkpoint
2026\-10\-10T22&#58;13&#58;36\.059Z · historical or unverified for export inputs
ID: checkpoint\-1\-d41e8c0de5bd6baac8e64c1cd9f79ae7e2b5ea0f117e3a7b0f88ca142a1214db
Requirement: 6705e110bc2989d4f5a4575682e5f091d9498c2e0e98a7e97ca535940902415d
Source: d41e8c0de5bd6baac8e64c1cd9f79ae7e2b5ea0f117e3a7b0f88ca142a1214db

src/approval\.ts

### Transfer prediction saved
2026\-10\-10T22&#58;15&#58;01\.549Z · historical or unverified for export inputs
ID: b4ae3e53\-01b0\-46db\-b5fd\-1aeb0febaf35
Requirement: 6705e110bc2989d4f5a4575682e5f091d9498c2e0e98a7e97ca535940902415d
Source: d41e8c0de5bd6baac8e64c1cd9f79ae7e2b5ea0f117e3a7b0f88ca142a1214db

Predicted allow\. observed

### Prepared case executed
2026\-10\-10T22&#58;15&#58;01\.933Z · historical or unverified for export inputs
ID: 6ec8f4a2\-bf90\-48f2\-9f03\-a50608eb5a92
Requirement: 6705e110bc2989d4f5a4575682e5f091d9498c2e0e98a7e97ca535940902415d
Source: d41e8c0de5bd6baac8e64c1cd9f79ae7e2b5ea0f117e3a7b0f88ca142a1214db

owner\-client\-archived&#58; observed allow; requirement failed\.

### Saved\-source diff opened
2026\-10\-10T22&#58;18&#58;22\.754Z · matches inputs at export
ID: d672b550\-c5dd\-4f01\-8c88\-d75341b925ea
Requirement: 6705e110bc2989d4f5a4575682e5f091d9498c2e0e98a7e97ca535940902415d
Source: 8e39a8e0f9d8b358da6629dfec955fed5327e15c071fd884c8b267a41605b35e

Native diff&#58; d41e8c0de5bd6baac8e64c1cd9f79ae7e2b5ea0f117e3a7b0f88ca142a1214db → 8e39a8e0f9d8b358da6629dfec955fed5327e15c071fd884c8b267a41605b35e

### Full checks executed
2026\-10\-10T22&#58;18&#58;29\.935Z · matches inputs at export
ID: e4e56f90\-e5d8\-48ad\-9110\-135db56a9793
Requirement: 6705e110bc2989d4f5a4575682e5f091d9498c2e0e98a7e97ca535940902415d
Source: 8e39a8e0f9d8b358da6629dfec955fed5327e15c071fd884c8b267a41605b35e

transfer&#58; owner\-client\-active passed \(required allow, observed allow\); other\-client\-active passed \(required deny, observed deny\); freelancer\-active passed \(required deny, observed deny\); owner\-client\-archived passed \(required deny, observed deny\)\. Exit 0\.
