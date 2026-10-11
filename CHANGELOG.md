# Change log

Record each meaningful project change during the event, newest first. Update this file in the same commit as the change. Use a real timestamp with timezone, for example `YYYY-MM-DDTHH:MM:SS+05:30`.

## Event build log

## 2026-10-11T01:31:17.000+05:30 — Project Guide for evolving local projects

- Changed: added five `src/project/` modules, `src/panel/project.tsx`, `scripts/capture-intent.mjs`, four test files, implementation/usage guides and a synthetic capture. Integrated existing host commands, SDK export, shared panel state, stylesheet and package metadata; updated README/design/earlier guide plan and records.
- Why: handle features added mid-project, inspect changes across files, confirm relevant source, explain logic and prepare a reviewable next-slice coding prompt in the learner's own workspace.
- Corrections: preserve intent/import provenance; reject unknown or stale context/citations; separate script success from requirement coverage; keep output ephemeral; preserve corrupt/full memory; deduplicate file events and source contents; require a connected capture integration.
- Checks: typecheck/lint/build, 19 focused and 67 combined tests (17 files, 22.51 s; real timeout 20,008 ms). Real temporary files/Git/storage/CLI/check processes and SDK requests through mock HTTP ran. Synthetic UI passed 12 theme/size combinations, sharing/copy/stale/reduced-motion/page-error checks; capture visually inspected. Five local-link checks passed; instruction files remain 32/21 lines; Git whitespace passed.
- Limits: new native Project Guide/editor and live grouping/planning acceptance pending. No credentials inspected, universal prompt interception, whole-project Graphify adapter or general acceptance-case mapper. Parent UI/reuse work and index preserved; no mixed-work commit or push.
- Final verification — 2026-10-11T01:35:23.000+05:30: corrected UTF-8 byte limits and CLI Unicode input; typecheck/lint/build, focused 20/20 and combined 68/68 tests passed (22.46 s; actual timeout 20,010 ms). Supersedes the earlier counts for this working tree.

## 2026-10-11T00:29:22+05:30 — S7: progressive hints and verified learner edit

- Changed: Added three progressive hint levels using the existing SDK/preview boundary, source-linked hint evidence, read-only baseline/native diff and the fixed full ownership runner. Extended the existing session/activity, host actions and theme-native panel; updated trusted harness observations/hash, focused tests and project records. No dependency or model-routing change.
- Why: Guide the learner without supplying a completed fix, then compare and verify the code they saved. The original failed counterexample remains historical; actual incorrect outcomes remain failures and execution errors have no learner verdict.
- Checks: Typecheck/lint/build and 36/36 product tests passed, including five independently added Snake tests. One real configured gpt-6-astra hint was accepted (5,423 ms; 1,134 tokens); the user edited/saved a disposable learning copy. Native diff inspected and recorded; user-triggered panel rerun passed 3/3 with no skips, exit 0, 455 ms. Source/diff/prediction hashes and mode-0600 activity agree. Impeccable Operate detector returned no findings; current-theme hint/result table and focused result heading inspected.
- Corrections: One read-only reviewer found reference replacement breaking retained graph/explanation links and inline equality syntax bypassing the hint guard. Both fixed with regressions; reviewer confirmed the fixes. A size-limit regression also prevented an oversized session from replacing a readable record. The three new regressions failed before correction; final focused boundary suite passed 9/9.
- Limits: The acceptance prediction was labeled development data. Assistance included one recorded API hint and Codex workflow/field clarification; no complete fix was supplied or applied by the coach/Codex. Only hint level 1 was exercised live; progression levels 1–3 have product tests. Native automation returned stale tab snapshots, so the user clicked the final runner; stored results and visible panel were inspected afterward. No key value inspection/request, restart/resume, broader stale-state work, semantic leakage evaluation, theme-variant/cross-platform/VSIX QA or push. Core loop was exercised without restarting the host; final reference/leakage/size corrections are covered by product tests. Existing seed, ignore/Graft artifacts, earlier checkpoints and independent Snake/Build Guide commit dee3111 are preserved. Gate B passed; stop before S8.

- Checkpoint boundary: Later concurrent UI/import/walkthrough/evaluation work is preserved in the shared checkout and excluded from this milestone. A plain S7-only build copy passed the final typecheck/lint, focused 11/11, full 36/36 (22.55 s), build and detector. Scope review retained the fixed prepared requirement path and ensured the existing masked key prompt is reachable from hint sharing. Native Gate B evidence above precedes this isolation; no extra API request or native-loop replay was made.

## 2026-10-11T00:14:03+05:30 — Snake Easter egg and Build Guide plan

- Changed: Added `src/panel/snake.ts`, `src/panel/snake-game.tsx` and `tests/snake.test.ts`; integrated one panel component and scoped theme styles. Added `docs/build-guide-plan.md`; updated README, AI_USAGE and task records.
- Why: User requested project/prompt guidance planning and game Easter eggs, then selected Snake. The proposed guide captures one feature's intent, prepares a focused prompt and reconnects resulting code to the learning loop. The game stays local and separate from learning evidence.
- Checks: Typecheck, lint, build and focused Snake 5/5 passed; full working-tree product suite passed 35/35, including pre-existing S7 work. Isolated browser checks passed keyboard reveal/steering, direction buttons, pause/resume, blur/close pause, restart, wall loss and board widths 320/768/1024/1440; no game host messages or page errors. Rendered screenshot inspected. Default Playwright browser was absent; existing Chrome used with a disposable context. Initial blur assertion used a disabled mock-host button; corrected the mock ready state and reran successfully.
- Limits: Build Guide is planned only. No API call, credential access, push or new dependency. Browser checks used a mock host; actual Extension Host game acceptance, theme variants and screen-reader behavior remain unverified. Preserve concurrent S7 source/harness changes; this milestone stages only its own panel integration, game, plan and records.

## 2026-10-10T23:41:53+05:30 — S6: saved prediction and trusted ownership counterexample

- Changed: Added the fixed Vitest runner in `src/extension/checks.ts`; extended shared actions, the existing atomic session and extension host; added the prediction/result panel and theme-native form styles. The trusted different-client test now reports its actual boolean without changing its expectation; its manifest hash was updated. Added runner tests and extended session/message boundaries; updated project records and current scope instructions.
- Why: Save the learner's prediction before execution/reveal and compare it with measured current-source behavior. Only `other-client-active` runs. A role-only seed approval remains a failed requirement check, even when predicted correctly. Errors, malformed results and timeout produce an execution problem without a learner verdict.
- Checks: Test-first runner/session failures were observed before implementation. Final typecheck/lint/build and 21/21 product tests passed, including real seed/correct/throwing/hung source runs and trusted-definition/report validation. Focused S6 suite passed 10/10. Native final acceptance saved prediction first with mode 0600, then ran one case/two skipped (exit 1; 484 ms), verified Save → Run → result → source keyboard focus and selected source lines 12–15. Impeccable Operate detector returned no findings; one independent read-only review corrected an overly broad pass label to the specific different-client check.
- Correction/limits: Stale UI control state caused command text to replace the selected seed function; restored it byte-identically, verified no source diff, confirmed the native flow and reran the 3/3 baseline. No new API call, key value inspection/request, dependency change or push. Full result persistence/resume, learner edits/full-policy rerun, native error-state fault injection and cross-platform/VSIX checks are later scope. Automated host checks were not rerun. Human teaching/content review and replacement-key status for later API work remain unverified. Gate A and prior commits are preserved; stop before S7.

## 2026-10-10T23:05:15+05:30 — Narrow presentation to the requested scope

- Removed the added navigation, technology tags, learning-loop table and extra project-record section; retained the supplied banner and professional description. Existing setup/status information is folded into one expandable section. Removed the unused logo copy and the five added GitHub topics.
- User requested this correction. Documentation-only scope; preserve pending S5 changes and publish only this correction. Link/record/whitespace and exact commit-scope checks are performed before publication; application behavior is unchanged.

## 2026-10-10T22:54:25+05:30 — Presentation publication verified

- Published presentation commit 15e9a8c2e68f3ee46ca0cf5f0495758957f2bea6 to canonical remote main with a normal fast-forward push. It includes the previously completed S4 history; its own diff has only README, two supplied images and three documentation records.
- GitHub API confirmed remote main SHA and all six file blob identities. Source/config/test/script/package trees are byte-identical between S4 and the presentation commit. Existing uncommitted S5/OpenAI work remains local and unstaged.
- No application checks were rerun, no force-push/reset/history rewrite was used, and browser appearance remains unchecked. This verification record is a subsequent documentation-only milestone.

## 2026-10-10T22:52:28+05:30 — Authorized presentation publication checkpoint

- User explicitly authorized publication provided existing code is preserved. Remote main was 9a95200; the reviewed completed local baseline is 0dfbb85 (S4). Publication includes that existing committed build so README commands have their matching source, plus only the six presentation/documentation paths in this new milestone.
- Prepared checks: remote ancestry, empty pre-existing staging area, required record presence, README local links/anchors, rule limits, six-path scope and completed-baseline credential-pattern scan passed. Pending S5/OpenAI files and dependency changes stay local; no source changes, force-push or history rewrite are part of this presentation commit.
- Commit/push and remote SHA verification follow this checkpoint; prior S4 runtime results are recorded evidence, not rerun checks. Browser appearance and full demo readiness remain unverified.

## 2026-10-10T22:49:02+05:30 — GitHub presentation and supplied branding

- Changed: README branded header, navigation, clearer product description, learning-loop/status tables and corrected stale setup/integration statements; added unaltered supplied artwork in docs/assets/vadhyar-banner.jpg and docs/assets/vadhyar-logo.png. Updated the canonical GitHub About description and five relevant topics.
- Why: Make the repository easier to understand and present while preserving organizer documentation and honest build boundaries.
- Checks: Reviewed organizer template README/RULES/AGENTS/SUBMISSION; local Markdown files/anchors, actual npm script names, required record presence, under-50-line instruction limits, byte-identical artwork copies and Git whitespace passed. GitHub Markdown renderer retained the branded header/navigation; live About/topics read-back matched.
- Limits: Documentation-only side task; no application tests or host/API/Graphify checks rerun. Existing S4 results are attributed to the prior handoff. Human presentation review and full-browser appearance are pending. Required event/submission records remain; this is not final submission certification. Application changes, Git staging/history and active Gate A work were left to the main build. README/artwork/records are uncommitted and unpushed; no push authorization was inferred.

## 2026-10-10T22:29:20+05:30 — S3: confirmed requirement and atomic checkpoints

- S3: exact requirement confirmation/revision hashes, source snapshots and atomic extension-workspace storage. Strict stored-record identity validation and serialized actions preserve evidence. Typecheck/lint/build passed; session test passed including corrupt-record rejection and actual filesystem write failure preserving prior contents; full product 10/10. Real host restored confirmation/hash on a new activation, rejected changed confirmation identity, captured exact source and preserved two concurrent captures. /tmp/vadhyar-host-evidence.json records restoredOnActivation/concurrentWritesPreserved true. Restart test initially stalled on a trust-startup event race, fixed by checking trust again after its management view opens; only owned test processes were terminated. Source never reset/edited. UI uses native theme, text rendering and refresh/confirm/checkpoint actions. Twenty revisions/checkpoints supported; multi-host concurrent storage and corrupt-session recovery UI remain unverified. S2b cffb7a2 preserved; next S4.


## 2026-10-10T22:19:56+05:30 — S2b: validated native navigation

- S2b: thin React panel, strict Zod ready/openSource actions, allowlisted real-path source reads and host-issued hash-bound references. Unknown IDs, invalid spans, traversal/symlink escape and stale source are rejected; prepared workspace must be single/local/trusted with the expected requirement ID. CSP permits only extension scripts/styles; React renders text. Typecheck/lint/build passed; focused boundaries 2/2, full product 9/9. Real host opened src/approval.ts and selected line 12; invented reference rejected. Fresh evidence /tmp/vadhyar-host-evidence.json. Installed exact React/react-dom 19.3.0, types 19.3.0, Zod 4.6.5 with scripts disabled. UI keyboard/theme review not yet performed; no polished preview or verification runner. S2a commit 43eba1d preserved.


## 2026-10-10T22:15:30+05:30 — S2a: real extension activation

- S2a: extension manifest, esbuild bootstrap, native command and real-host activation check. Typecheck, lint, build and product 7/7 passed. Real VS Code 1.140.0 host evidence at /tmp/vadhyar-host-evidence.json confirms activation, trusted prepared workspace and panel opening. Initial CLI launches gave no evidence/untrusted failures; fixed fail-closed freshness guard, direct Code executable and explicit /tmp profile path after macOS tmpdir mismatch. User confirmed workspace trust. No global trust disable. esbuild 0.28.2/@types/vscode 1.140.0 installed with scripts disabled; build uses the registry native binary. Source navigation/unsupported-workspace handling arrive in S2b; integrations not checked. S1b checkpoint faf9b98 retained; no push.


## 2026-10-10T22:06:20+05:30 — S1b: trusted prepared ownership checks

- Added requirement, scenario/harness/config, product contract tests and type/test configuration. Updated scope/status records.
- Typecheck/lint passed; product 7/7; seed policy 2 passes/1 expected failure; correct disposable edit 3/3; deny-all rejected. Source seed unchanged. Runtime/editor/API integration remains pending.


## 2026-10-10T21:53:27.000+05:30 — S1a: testable NovaDesk seeded fixture

- Changed: Added package.json/lockfile, ESLint configuration, the pure actor/milestone approval contract and three labeled baseline cases. Updated README, task/AI records and SUBMISSION's canonical repository URL and fixture/check status.
- Why: Establish a small executable fixture for the next ownership learning slice while keeping its intentional bug visible.
- Validation: Observed deny-all test-first red (2 failed, 1 passed); final focused/full baseline green (3 passed); strict typecheck and lint passed; clean npm ci and dependency tree passed; unmatched test selection correctly exited 1. Install audit reported 0 vulnerabilities.
- Limitations: Role-only seed intentionally allows another client; baseline green is not ownership-policy success. npm warns about the unapproved optional fsevents install script, but non-watch checks work. No editor/UI, Graphify/OpenAI, packaging, archived checks or demo verification. Human review pending; local checkpoint only, no push.

## 2026-10-10T21:46:01.000+05:30 — S0b: reconcile canonical history and project instructions

- Changed: Adopted the existing canonical Vadhyar history in the local checkout; adapted AGENTS.md, added .customrules, merged local/remote .gitignore entries, corrected README repository links and preserved/extended tasks/todo.md.
- Why: Establish the current project's rules and safe file boundary before the authorized seeded fixture slice.
- Validation: Read both remote commits and canonical instructions; checked affected local Markdown links, instruction line limits, five ignore probes, protected .ignore/local .gitignore content and Git whitespace.
- Limitations: Documentation only; no application scripts/checks yet. Human file review pending. No force-push, history rewrite, second repository or push.

## 2026-10-10T20:30:35+05:30 — Initialize Vadhyar repository

- Changed: Created this repository from the organizer's template; named the project Vadhyar; customized README, submission details and AI usage; added the implementation plan, source decisions and code/script/screenshot locations.
- Why: Establish the project's source and progress record for the hackathon.
- Validation: Confirmed GitHub template metadata and generated repository; checked local Markdown references and Git diff whitespace before this commit. Remote commit verification follows the push.
- Limitations: Documentation setup only. No application code, runnable scripts, screenshots, working demo or application test results are included yet. Earlier design documentation is identified as planning, not event implementation.

## Template setup — 10 October 2026

- Changed: Added the event README, rules, agent guide, change log, AI usage record, submission checklist, Git ignore rules, and pull request checklist.
- Why: Give participants a consistent starting point for event rules, basic coding patterns, documented changes, and regular commits.
- Validation: Checked local Markdown links, event detail consistency, required documents, and diff whitespace before publishing.
- Limitations: Documentation scaffolding only; no participant project, application, or working demo is included. GitHub publication and template status are verified separately after creation.

### S4 — 2026-10-10T22:44:02+05:30

Real Graphify 0.9.84 integration is verified in VS Code: four source references, three AST contains relationships, current hash checks, learner mapping confirmation and native navigation. Typecheck/lint/build, 12 product tests and real host acceptance passed. Codex implemented the adapter and checks; human teaching/content review is pending. Gate A still needs S5. Initial Graphify auto-refresh affected the existing Pi skill; its exact prior SKILL.md and stock prior references were restored, but prior custom references are unknown. Runtime disables auto-refresh and isolates HOME.

## S5 code checkpoint — 2026-10-10T22:56:03+05:30

- Changed: official OpenAI SDK/package lock, src/extension/coach.ts, extension/shared/panel actions, focused parser/context tests and host preview guards; required setup/status records.
- Why: minimal source-grounded Explain with SecretStorage, approved bounded context, validated reference IDs, cancellation and actual provider metadata.
- Checks: clean install with scripts disabled; typecheck/lint/build; focused 2/2 and full 14/14; actual UI source navigation/Graphify/preview/masked setup; diff reviewed. Isolated S5 host retry failed at trust (no new acceptance evidence).
- Limits: live request/key storage remain pending user entry. Gate A is pending; S6 unimplemented. No push by this build; concurrent published presentation history is preserved.


## 2026-10-10T23:11:44+05:30 — S5 / Gate A verified

- Changed: official OpenAI SDK, coach boundary, SecretStorage command, exact-context preview, shared/panel actions, cancellation, sanitized errors/logging, strict response/current-ID tests and required records.
- Why: source-grounded Explain with a real account request and validated native source references.
- Validation: one live gpt-6-astra response accepted at 23:04:25.626 IST, 8,732 ms/1,850 tokens; current real Graphify four references/three relationships; all three model citation buttons selected correct native source; key-presence state survived host restart. Product 14/14, clean install, typecheck/lint/build passed; final boundary results follow in tasks/todo.md.
- Limits: isolated S5 automated host retry failed at trust; manual live acceptance passed. No S6, other-model benchmark, provider fault injection, polish, VSIX or push by this build. Prior Graphify global reference recovery uncertainty remains recorded.

## 2026-10-11T00:39:00+05:30 — Selective reuse integrations

- Added version-bound walkthrough navigation/export, workspace Markdown requirement selection with preserved revisions and unmapped-check blocking, and Promptfoo production-coach evaluations.
- Reused the existing host references, sessions, coach and checks; preserved ongoing S7 and UI changes. Main changes: extension handlers, shared contracts, requirement/walkthrough modules, panel controls, evaluation provider/config/runner, package lock and focused tests.
- Verified typecheck/lint/build, 48 working-tree tests, upstream tour schema and 2/2 offline eval cases. Live eval missing key/model; native UI/playback acceptance pending. No push or mixed-work commit.


## 2026-10-11T01:45:48+05:30 — combined-tree stabilization review

- Reviewed the completed uncommitted Project Guide/UI/selective-reuse integration; preserved both canonical modes and all overlapping work. Recorded a NovaDesk-first V1 recommendation with Project Guide kept as a separate experimental mode.
- Changed only `README.md` (Node 22.22 engine consistency), `tasks/todo.md` and appended audit documentation. No runtime/S8 change, staging, commit or push.
- Latest-tree typecheck/lint/build and 68 tests passed; offline coach validators 2/2 and installed dependency-tree check passed. Actual isolated VS Code activation succeeded; trust/window selection prevented native import/walkthrough acceptance. CodeTour playback, connected agent capture and live Project Guide/evaluation acceptance remain unverified. Historical 12 synthetic theme/width checks were not replayed. See the task record for exact evidence and limits.

## 2026-10-11T02:17:43+05:30 — S8 NovaDesk persistence and resume

- Persist/restore complete prepared-learning evidence and selected stage through the existing controller, with schema-1 migration, validated version-2 records and synced atomic saves. Imported requirement/checkpoint history and separate Project Guide/Gate A storage are preserved.
- Restored results require matching requirement/source/trusted-check fingerprints; interrupted runs require explicit retry. Added local saved reflections using existing panel controls and a scoped light-theme historical-result fill correction. No coach source-edit authority or new dependency.
- Final combined tree: typecheck/lint/build, 77 tests and 2 offline validator cases passed. Disposable real VS Code panel close/reopen and fresh extension-host restart restored correlated saved identities; a later disposable edit made the old pass historical. UI interactions/themes used synthetic host responses; detector returned eight existing typography advisories, exit 2. See [evidence](docs/s8-evidence/resume.json) and [task record](tasks/todo.md) for boundaries.
- Active S7 session/source and Gate A file remain byte-identical. No API request, key handling, commit or push; mixed Project Guide/reuse/UI work preserved. Next S9; connected capture, CodeTour playback, live new-coach quality and packaging remain unverified.

## 2026-10-11T03:10:40+05:30 — S9 NovaDesk stale state and safe controls

- Bound current explanations/source links/check results to their source, requirement and relevant trusted-check identities; retained historical evidence while rejecting stale navigation/verification. Added fixed memory-location and native-confirmed NovaDesk-only clear actions with narrow scope, failure recovery and later-record preservation. S8 schema and Project Guide workflow remain unchanged.
- Used existing controller/panel controls; no dependency, CSS/motion or coach change. Typecheck/lint/build and **89/89 tests** passed; offline validators **2/2**. Disposable filesystem and mocked dialog/SecretStorage checks cover failures and scope. Synthetic rendered interactions passed; final native confirmation/Trash acceptance remains blocked by Trust/window selection, so Gate C is not certified. [Evidence](docs/s9-evidence/session-controls.json).
- Active learner/session/Gate A hashes and unrelated work preserved. No API request, key handling, commit or push. Next S10 after outstanding native integrity acceptance; a clean checkpoint is still needed for the mixed tree.

## 2026-10-11T03:27:38+05:30 — S9 final native integrity acceptance

Actual trusted disposable host verified seeded failure/save staleness, memory reveal, native Cancel/Confirm, retained Project Guide/source/credential presence and panel reopen. Current source/bundle hashes match the 89-test boundary; no runtime edit. Earlier native failures remain historical diagnostics. Gate C now passes for NovaDesk; native failure/OS Trash restoration, CodeTour/capture/live eval remain unverified. No commit or push. [Evidence](docs/s9-evidence/native-acceptance.json).


## 2026-10-11T03:52:35+05:30 — S10 transfer and evidence handover

- Added a separately confirmed archived-milestone revision and fixed four-case transfer through the existing runner/controller/session. Original ownership cases and seeded source remain unchanged. Conflicting prepared documents and modified definitions are rejected safely.
- Added a timeline derived only from saved evidence and native Markdown handover with current/historical identities, recorded hint counts and inert text. Reused bounded native export/revalidation/atomic-write behavior.
- Typecheck/lint/build and **93/93 tests** passed. Real VS Code: user prediction saved before the failed archived case, user-delegated developer test edit, native diff, four-case pass, exact saved-record report and panel reopen passed. No learner-authorship/mastery claim. [Evidence](docs/s10-evidence/transfer.json).
- Project Guide and active S7/Gate A data preserved; no API request, dependency, commit or push. Next S11; release/demo quality is not yet certified.


## 2026-10-11T04:00:41+05:30 — S11 coach reliability and offline evaluation

- Reject explicit unsupported verdicts and malformed response metadata, correlate hint cases and use lifecycle guidance for the archived challenge; classify SDK connection failures correctly. No new dependency or model routing.
- Expanded the existing Promptfoo set to six offline validators plus six live cases; added accepted-output control and real SDK mock-HTTP failure tests. Full typecheck/lint/build and **103 tests** passed; offline **6/6** and disposable mutation regression passed. [Evidence](docs/s11-evidence/coach-quality.json).
- Live evaluation remains unrun because separate environment credentials/model are absent; human teaching review remains pending. No API/key operation, commit or push; Project Guide/active learner data preserved. Next S12.

- S12: accessible Settings focus, truthful seed disclosure, scoped NovaDesk metadata sizing, correct light-theme result fills and stable native panel reopening; 104 tests plus real disposable editor-loop/restart evidence.

## 2026-10-11T05:02:28+05:30 — Landing / installer publication verified

- Delivered: https://vadhyar-website.vercel.app, GitHub v0.1.0 installer/checksum and docs/installation.md; public Vadhyar wording corrected at the user's request.
- Evidence: final live HTML/source and wording equality, four widths/two themes plus keyboard/reduced motion; published asset downloaded back and checksum passed. Anonymous asset endpoint returns HTTP 200. Earlier source 36/36, clean installation, installed real runner and Graphify checks are retained.
- Boundary: included milestone project, macOS Apple Silicon, VS Code 1.140.0+; no fresh API/learning validation or parent source publication. Existing package and tag remain immutable after wording changes.

## 2026-10-11T05:20:46+05:30 — S13 local release candidate

Packaged the real Vitest runtime, added explicit application Graphify setup and exclusive fresh-demo preparation, and supplied runtime notices/setup/demo documentation. Combined typecheck/lint/build, 106 tests and six offline cases passed. Installed native ownership/archived rehearsal, live explanation/hint, exact evidence export and owned extension-host resume passed. Labelled still-frame backup and source/VSIX artifacts are local; mixed work uncommitted. macOS-arm64 only; seven development advisories and human/live-eval/CodeTour/capture limits recorded. No push/publication.


## 2026-10-11T05:42:34+05:30 — Strengthening H1

- Proved experimental Project Guide on the disclosed unrelated SeatCheck fixture: confirmed imported intention, selected source, live grounded explanation, actual failing/passing reviewed script, native diff and resume. Fixed native path-alias import rejection and guide/editor placement, preserving existing validation and protocols.
- Current combined tree passed typecheck/lint/build, 111 tests in 24 files and offline coach 6/6. Developer acceptance edits are not learner-authorship evidence. H2–H5 deferred; no universal support, connected capture, CodeTour playback or human-quality claim. [Evidence](docs/strengthen-evidence/acceptance.json).


## 2026-10-11T06:36:39+05:30 — grounded learning topics, follow-up

- Reused Project Guide's existing controller, source capture, confirmation, bounded context, native navigation and atomic records. No dependency, controller, message family or model routing added.
- Topics now disclose their proposed requirement, exact decision, selection reason, extracted static references and unreviewed context. Requirement confirmation is explicit; unknown connections remain unresolved.
- Saved one source/requirement-bound topic and focused explanation; old records remain compatible. Native panel reopen/restart and historical link blocking were verified in a disposable workspace.
- Typecheck/lint/build, 118 tests and six offline validators passed. Two live production coaching operations and real Graphify 0.9.84 passed native acceptance. New keyboard/theme matrices, other platforms and human teaching-quality review remain unverified. The 06:00 IST brief cutoff had passed; this is follow-up work, not a submission claim or a repackaged release.


<!-- Preserved publication records from canonical GitHub history. -->

## 2026-10-11T04:49:13+05:30 — Landing website and early GitHub installer

- Changed: website/, docs/installation.md, docs/landing-release.md, README, package manifest/lock (pinned runtime Vitest), .vscodeignore, .gitignore and publication records.
- Why: deliver the user-authorized public website, real download and reproducible setup without publishing ongoing parent changes.
- Checks: clean source typecheck/lint/build, 36/36 product tests; static contract, four browser widths/two themes, keyboard/reduced motion, contrast; real isolated VSIX install/installed runner and Graphify extraction.
- Limits: macOS Apple Silicon, S7 NovaDesk demo only; no new API or human learning validation; no blanket license selected. Public verification follows publication; see release acceptance.


## 2026-10-11T04:57:58+05:30 — Public Vadhyar wording

Changed public website, installation guide, README and GitHub release copy to describe Vadhyar without the retired sample labels, as requested. Preserved supported-project boundaries and the existing installer; added a static copy regression check. Browser checks, installation/runtime acceptance and source suite remain recorded separately.

## 2026-10-11T07:38:58+05:30 — Freeze Vadhyar 0.1.1 for submission preparation

- Reused completed checkpoint 102a1ec plus the finished hash-checked safety patch; merged canonical GitHub main 866666a in a separate release worktree, retaining both histories. Panel-v2 and ongoing footage are excluded.
- Versioned the macOS-arm64 installer, aligned README/setup/SUBMISSION with the organizer template, and recorded Team Vadhyar with user-confirmed names/roles. Preserved the earlier public 0.1.0 and original development index/sessions.
- Safety behavior retained: common quoted-credential guard, revalidation after native check approval, disabled implicit npm pre/post hooks, and execution errors for cancelled/abnormal exits. Selected project scripts still execute trusted code and may modify files.
- Fresh checks: typecheck/lint/build exit 0; 38 focused/134 full tests; 6 offline validators; production audit zero; package integrity/exclusions and clean CLI install/eight file matches passed. Actual installed fixtures/dependencies produced the disclosed failure and corrected three/four-case passes outside VS Code.
- Files: release docs, package version/allowlist, .customrules scope, preserved upstream records, completed source/test safety files and docs/submission-evidence/verification.json. Final immutable SHA and artifact hashes follow in external release metadata. Native/live/human acceptance remains separately historical/unverified; organizer submission stays pending until after 08:00 IST and the announced form.

- 2026-10-11T07:46:56+05:30: retained the user-supplied Aravind handle with an explicit unverified label; updated the historical S7-only push instruction to the authorization rule. Repository About topics now identify the VS Code, developer-education and hackathon scope.

- 2026-10-11T07:50:29+05:30: at the user’s 07:50 IST cutoff, the separate redesign was at 6c24897c474ded0c67f86a1fc3d8fd08439e5bdf with an ongoing test edit; its own ledger still required four-theme/all-state review, final parity, an updated package and native acceptance. Selected the verified original panel for v0.1.1, preserving all redesign work separately. Completed S8–S13, Project Guide/T1 and the reviewed safety patch are included. README now follows the exact supplied overview/run/status structure; no source behavior changed. Organizer submission remains pending until the announced window and method.

## 2026-10-11T07:59:52+05:30 — Verified GitHub checkpoint and matching release

- Published implementation `4f36cedcb93940e526165fbf94d6681542f54066` / immutable `v0.1.1` using normal pushes; old main/history and 0.1.0 preserved. VSIX and exact source ZIP match the frozen checkpoint; four downloaded assets match local SHA256SUMS and GitHub digests. Isolated final CLI install, eight core hashes, six packaged documents and source manifest fields passed.
- Completed the exact supplied README overview/run/status format and a source-linked 51-item feature inventory. NovaDesk S8–S13, experimental Project Guide/T1 and reviewed safety fixes are present. Redesign remained unverified at 07:50 IST and was preserved separately. Main follow-up is documentation only.
- Verification tooling corrections handled VSCE lowercase readme/changelog names, fonts under dist, source-only AI_USAGE, the native CLI path and VS Code-added manifest __metadata. An attempted byte comparison while a download was still running was discarded; only completed downloads support publication acceptance. No product behavior change was inferred.
- Fresh code results remain 38 focused / 134 full tests, six offline validators, typecheck/lint/build exit 0 and zero production audit vulnerabilities. No additional API call, credential value access, active-session reload or parent index change. Native safety-patched replay, live build-plan acceptance, connected capture, CodeTour playback and human review remain unverified.
- User-confirmed team/roles preserved; Aravind handle retained explicitly unverified. Organizer hand-in is separate, pending the announced after-08:00 window/method and eligibility confirmation.

- 2026-10-11T08:01:15+05:30: post-freeze submission packet uploaded and downloaded; exact bytes and GitHub SHA256 digest match. Release now has five verified assets (four original artifacts plus the exact-SHA submission packet). No organizer receipt is inferred.


## 2026-10-11T08:10:08+05:30 — isolated judge setup for frozen 0.1.1

Added `scripts/setup-judge.mjs` and focused tests to make the supported judge setup reproducible without changing the frozen runtime. Checks OS/CPU/versions, verifies release bytes/SHA-256, installs Graphify 0.9.84 in a new environment, uses an isolated VS Code profile and records real extraction/packaged-runner diagnostics. Existing folders are refused; no credential handling, automatic trust or GUI reload. README and installation link the new judge guide; actual results are in `docs/judge-setup-evidence.json`.

Executed: fresh installation through the official VS Code CLI, pip check/version, real network-denied Graphify extraction (4 nodes/3 edges/zero model tokens), expected disclosed seed outcome (2 passes/1 ownership failure), 4 focused and 138 full tests, typecheck/lint/build and 6 offline validators. Initial lint error about preserving caught errors was fixed, then lint passed. Preserved 4 protected source/session records and original Git index/branch/HEAD. Limits: macOS Apple Silicon test only; judge OS unknown; new native panel/live API acceptance not run. The frozen tag/VSIX remain unchanged; this new helper is on the setup branch pending publication.
