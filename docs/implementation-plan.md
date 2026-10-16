# Implementation plan — one connected lesson

Status: the human's latest direction narrows execution to the accepted current-version M0 stability checkpoint, with feature work now stopped and specialist chats held. M1+ tasks below remain the bounded future roadmap and require a later human resume; no automatic next-task activation after stability acceptance. The [task register](../tasks/todo.md) owns exact leases and dated acceptance. This remains the single plan consuming the [product/design specification](product-logic-contract.md) and [capability register](capability-register.md); preserve the interrupted cleanup and history.

## Baseline gate and ownership

The working tree is the browser product under prototype/, on codex/browser-repository-cleanup at HEAD 92e118d, with unfinished uncommitted cleanup. Published main and the browser-v0.1.0 download are distinct baselines. A Git SHA alone does not identify today's edited source; use the dated source/config/test fingerprint and current-check receipt.

Engineering owns shared types, persistence, host/service interfaces, dependency/lockfile/CI changes and integration. UI/UX owns only explicitly leased UI files after the consumed contract is frozen. Source Intelligence owns only the reader/analysis files in its ready task. Product Quality reviews independently; test ownership stays with the task's single implementation owner. PM alone reconciles canonical specification, plan, task register and evidence register. All other roles return handoffs.

One implementation task may write at a time until a non-overlapping lease is explicitly recorded. Later tasks may reuse released files sequentially; their presence in two task lists is not concurrent ownership. A proposed new path is labelled new below. Files outside a lease require re-scoping before editing. Each task includes its tests and no more than about five implementation paths. Required README/CHANGELOG/AI_USAGE/task updates are a serialized milestone integration batch, not concurrent feature ownership.

## Shared execution and acceptance contract

For every task: review callers and current state before editing; preserve error handling, accessibility, source IDs and consent; use existing dependencies; inspect the diff and run types/lint/focused tests immediately. Run build/full relevant tests at the slice boundary in an isolated copy and unused port. Never rebuild shared prototype/dist or restart/reload another learner's session.

Current commands, run only in the isolated copy: npm run typecheck; npm run lint; npm test (its pretest builds browser assets); npm run browser:check when packaging/runtime inputs change. Focused unit command: npm exec -- vitest run --config prototype/vitest.config.ts <named-test-file>. Focused service command: node --test <named-service-test>. Native dependency policy: node scripts/dependency-audit.mjs --output <isolated-output-directory>. No new tool installation is part of current execution.

Persisted record changes need old-record fixtures, byte-preserving failed reads/writes, export, generation/reset conflicts and rollback compatibility tests. No silent bulk migration, history pruning or storage reset. Requests bind project, attempt, source/range, record generation and operation identity. Late callbacks cannot certify current coverage. Provider and command consent remain separate.

Reviewer silence is not approval. Each task stops for its acceptance receipt and named review. Earlier execution allowed PM to activate the next ready task after review. The latest stability stopping point supersedes that continuation: after the current M0 version is accepted, stop and keep later tasks deferred until the human resumes. Execution is not permission to publish, install new dependencies, run learner commands or incur provider charges without their separate consent.

## Stage 0 — pin and accept the actual baseline

### M0-00 · P0 · Reproduce and freeze the baseline

- Upstream: current checkout, cleanup handoff, source/config/test fingerprints and historical release receipts.
- Exclusive owner: Engineering Lead for isolated install/build/package/HTTP verification; Product Quality independently accepts the exact packaged browser. PM records the outcome; no product writer.
- Files: read package.json, prototype/launch.mjs, prototype/serve.mjs, current tests/config and scripts/browser-package*.mjs. No source changes authorized. Save source/lock fingerprint manifests and a bounded receipt with environment, exact commands and outcomes. The 14:35 IST activation permits a fresh locked install and actual isolated packaged-browser acceptance; the earlier planning receipt used linked dependencies. No public release/primary-checkout staging is part of this task.
- Interfaces: establish existing ProjectInfo, SourceSnapshot, ProjectAttempt, ProjectRun, teaching and knowledge contracts; no new interface.
- State/migration: copy source for checks only; exclude user data, credentials and shared dist. No migration/reset.
- Dependencies: fresh npm ci --ignore-scripts using the current lock in a disposable snapshot is authorized; no new dependency adoption or shared node_modules changes. Report environment/lock/install identity and any mismatch.
- Out of scope: finishing/publishing cleanup, refreshing the running UI, creating a release, learner efficacy.
- Acceptance: current types/lint/unit/service/installer outcomes tied to source identity; exact untouched served-asset hashes; capability rows distinguish service/unit reproduction from rendered/live-provider acceptance.
- Failure/recovery: record any failing command and preserve logs/source; do not fix it inside this audit. Identify whether failure is source, environment or stale artifact.
- Rollback: no app mutation; temporary outputs do not replace existing artifacts.
- Reviewer/stop: Product Quality and PM reconcile findings. Gate stays open if current artifact acceptance or a P0 defect is unresolved.

### M0-02 · P0 · Preview and protect the complete outgoing teaching payload

- Upstream: AI Workflow's 16 October injected-provider reproduction, current source/privacy/consent contracts and the reconciled read-only UI/AI handoff in milestone-handoffs.md. No real secret or external provider was used in that audit.
- Exclusive owner: Engineering Lead; UI/UX supplies the consent-copy handoff before this single writer edits the panel.
- Exact existing files: prototype/teaching-service.mjs, prototype/teaching-service.test.mjs, prototype/src/TeachingPanel.tsx and prototype/project-service.mjs; new prototype/privacy.mjs if extracting the shared policy/preview formatter is necessary, plus optional new prototype/privacy.d.mts for its strict NodeNext TSX consumer (at most six).
- Consumes/produces: current rule/case/source/model approval → exact normalized payload preview and recognizable-private-value refusal over raw source, rule/case and other outgoing context strings before explanation generation. Expose full source metadata/text and model; fixed request instructions/settings may collapse. The existing host-memory credential/model-listing path remains separate.
- State/migration: preserve task text, source pins, old interpretations and draft/export recovery; no storage format change and no silent redaction that alters meaning.
- Dependencies/out of scope: existing privacy policy/controls only; no new scanner/SDK, generic DLP guarantee, provider replacement or contextual tutor expansion.
- Acceptance: synthetic recognizable private values in source, requirement, case or outgoing metadata cause zero provider work from the refused lesson request; an injected provider confirms preview/transmission equality. Decline/Escape sends nothing; changed context/model requires fresh approval. The existing dialog starts on Cancel, returns focus and permits complete preview scrolling at narrow widths. Refusal preserves input/records and legitimate Unicode/200-line context succeeds. Preserve source-stream, manifest and both command-output policy consumers plus existing service guards. Credential setup must not become lesson content or be refused merely for receiving its separately approved key.
- Failure/recovery: error reports only redacted category, never the private-looking value; failed filtering/preview fails closed; explicit correction/review is required before another request.
- Rollback: revert only these paths, with no record reset. If protection cannot be retained, keep teaching unavailable rather than knowingly reopening the exposure; core reading/records remain usable.
- Reviewer/stop: AI Workflow + Product Quality + UI/UX. Stop after the scoped privacy/consent regression and rendered-dialog acceptance; no real-provider call is necessary to test this boundary.

### M0-01 · P1 · Reproduce the check-result freshness finding

- Upstream: Product Quality's concrete late-response case, current receipt contract and M0-00 identity.
- Exclusive owner: Engineering Lead, only after a separately approved task scope; Product Quality supplies the adversarial case.
- Exact existing files: prototype/src/ProjectLesson.tsx, prototype/src/check-receipt.ts, prototype/check-receipt.test.ts; prototype/project-service.test.mjs only if the host boundary is implicated (maximum four).
- Interfaces: accepted terminal receipt must match live attempt/source/manifest/operation and live host/validation context; execution fact and coverage remain separate. A revision change triggers a fresh receipt read, not an automatic stale verdict: unrelated captures can advance metadata.
- State/migration: retain late receipt as historical/unknown; never manufacture satisfied coverage. No storage migration.
- Dependencies/out of scope: none; no runner rewrite, sandbox or new check types.
- Acceptance: delayed terminal response after disconnect/revision change cannot be accepted as current; reconnect/reread can recover legitimate receipt; ordinary matching completion still works.
- Failure/recovery: keep last receipt and draft when status is lost; never auto-repeat execution. A source-level suspicion is not labelled reproduced until the regression case runs.
- Rollback: revert only this task's intended paths; retain original receipts and no record reset.
- Reviewer/stop: owner reproduces the actual async continuation before editing; Product Quality independently observes the immutable vulnerable before artifact, then rejects/accepts the separately built after artifact and regression mutation before acceptance. Keep both pinned artifacts; do not reset shared working source to replay the before state. A synthetic parent/action sink is disclosed separately from actual host/persistence acceptance. Stop once the bounded race is resolved or disproved with evidence.

### M0-03 · P1 · Validate returned source selection once

- Upstream: Source Intelligence's inspected getSource boundary gap and current API test fixtures. This is not a reproduced host failure.
- Exclusive owner: Engineering Lead.
- Exact existing files: prototype/src/project-api.ts and prototype/project-api.test.ts (two).
- Interfaces: getSource/getCapturedSource return a SourceSnapshot only for the requested project/file/start and a valid bounded actual span. Reuse this shared helper for callers rather than adding per-screen checks.
- State/migration: no record change; refresh may legitimately return a new full-file hash. Preserve historical160-line ranges, explicit200-line reads, short EOF and character truncation; do not require the old hash or a fabricated full requested length.
- Dependencies/out of scope: none; no host/parser rewrite, widened captures or endpoint replacement.
- Acceptance: shape-valid wrong project/file/start/oversized-span responses are refused; valid historical/short/truncated/currently-changed reads succeed; failure preserves the caller's previous valid source/draft.
- Failure/recovery: use existing explicit read retry; no automatic replacement, external sharing or code/check execution.
- Rollback: revert helper/tests only; stored source identities remain untouched.
- Reviewer/stop: Source Intelligence + Product Quality; stop after focused source/API regressions and relevant caller checks.

### M0-04 · P1 · Internal copy, visual and provenance quality gate

- Upstream: accepted current-artifact evidence, prototype/DESIGN.md, existing asset provenance and the human's internal-review clarification.
- Exclusive owner: PM for canonical gate/triage; UI/UX returns read-only copy findings and Visual Evidence returns an independent rendered/provenance handoff. No concurrent UI implementation lease.
- Exact record files: docs/capability-register.md, docs/milestone-handoffs.md, tasks/todo.md and this implementation plan. Audited implementation paths are discovered and reported by the existing specialists; a future correction gets an exact serialized file lease before editing.
- Interfaces: quoted copy or actual asset/render identity → keep/enrich/rewrite/remove/uncertain decision with reason, proposed correction and named reviewer. Copy quality is separate from unverifiable AI-authorship claims.
- State/migration: never rewrite learner entries, clear records, erase historical receipts or alter seeded demonstration evidence. No data migration.
- Dependencies/out of scope: no detector service/score, automatic deletion, generated imagery, redesign, new component system, SEO campaign or telemetry. Reuse existing assets, icons and CSS.
- Acceptance: every non-keep verdict has a quotation or identified rendered asset, a concrete product reason and a specific fix; actual screenshots support appearance, code supports behaviour, existing provenance supports origin. Important consent/unsaved/stale/cost/accessibility disclosures survive. PM records the keep/remove/unknown inventory and Product Quality owns the recurring release gate.
- Failure/recovery: uncertain provenance stays uncertain; do not infer authorship from style. Missing traffic/cohort data does not become an invented metric. Unsupported or subjective corrections remain proposals.
- Rollback: preserve original bytes/history before any later scoped correction; no bulk deletion or rewrite. This audit changes only canonical records.
- Reviewer/stop: Product Quality reviews reconciled findings; any concrete safe cleanup is serialized after the active code task and rechecked in its rendered surface. Stop the audit after the bounded current corpus; keep the gate for later slices.

### M0-04b · P1 · Correct scoped copy and exclude the unverified banner

- Upstream: M0-04 UI/visual handoffs, current M0-02 payload contract and the human's banner decision. No AI-origin score or guess is accepted.
- Exclusive owner/files: UI/UX owns prototype/src/Website.tsx and prototype/src/Workspace.tsx only after the current code writer releases its lease; PM serializes README.md, prototype/README.md and docs/assets/browser-image-provenance.json. Do not edit TeachingPanel, Control or ProjectLesson.
- Interfaces: accurate sharing/Notebook/change instructions; label-first Notebook counts; an optional context-specific confirmation label passed only by the existing unsaved-navigation guard. Preserve the current default label/behaviour for reset, source replacement, new-question and check-context confirmations.
- State/migration: wording only plus the guard label; no saved-record/draft schema or action change. Keep essential warnings, exports, Keep working/Escape and pending-host-request disclosures. Preserve original banner bytes/history; reuse existing wordmark for new material.
- Dependencies/out of scope: no new library, detection service, image generation/editing, redesign, wholesale prose rewrite or learner-content edits.
- Acceptance: source/excerpt/rule/case sharing scope is accurate; Notebook does not promise active resume; unchanged-source investigations remain possible. Counts at 0/1/2 and the unsaved branch read correctly. Unsaved navigation says Leave without saving while unrelated confirmations retain their existing semantics. Banner has no current README use and its exact-byte exclusion decision is recorded.
- Failure/recovery: cancelling preserves fields/focus; export remains distinct; confirmed navigation discards only the intended unsaved fields; same-page navigation remains a no-op. No storage reset or silent command/provider replay.
- Rollback: revert only the copy/context-label/reference hunks; preserve records, original assets and provenance history.
- Reviewer/stop: Product Quality plus UI/UX; typecheck/lint and focused existing tests, actual rendered counter/guard/sharing states and local-link/JSON checks. Stop before the reader layout or a new feature.

### M0-04c · P1 · Group reader actions with their explanations

- Upstream: M0-04 actual reading screenshot, current Control output and accepted copy correction; exact baseline/source identity required.
- Exclusive owner/files: UI/UX, prototype/src/SourceReadingBundle.tsx and prototype/src/project-style.css. PM coordinates; no shared Control changes.
- Interfaces: retain current capture/replace/remove actions and disabled reasons; group each existing action and explanation locally instead of presenting a sibling explanation beside an unrelated action.
- State/migration: no capture identity, source freshness, storage, handlers, exports or accessibility-description contract changes.
- Dependencies/out of scope: existing CSS and component structure only; no design system, diagram rewrite, new navigation or screenshot retouching.
- Acceptance: duplicate, replaceable and mixed-version captures keep correct controls and complete explanations at desktop and 900-pixel widths; keyboard focus and accessible descriptions remain associated with the correct control. Native scrolling remains available.
- Failure/recovery: a failed/retried read retains captures and reasons; layout cannot hide consequential state or disable recovery.
- Rollback: revert only local grouping/styles, preserving the shared Control API and all records.
- Reviewer/stop: Product Quality plus Visual Evidence; inspect diff, types/lint and focused existing checks, then actual rendered/local keyboard acceptance. Stop before a new feature.

### M0-04d · P1 · Retain meaningful focus after teaching setup

- Upstream: Product Quality's actual corrected4191 reproduction: Connect/Disconnect replace the focused control and focus falls to BODY; the controlled in-flight Cancel browser request also removes its focused button and falls to BODY. This is a non-blocking privacy followup, not a credential exposure.
- Exclusive owner/files: UI/UX, prototype/src/TeachingPanel.tsx only after M0-02 acceptance and the current copy lease release. Engineering reviews integration; no concurrent privacy writer.
- Interfaces: explicit user Connect/Disconnect/Cancel browser request/Retry teaching setup → meaningful enabled teaching/recovery control after the resulting render. Retry intent waits for its final success/failure render; background setup/status work must not steal focus. Existing consent-dialog focus return remains separate.
- State/migration: no provider, model, consent, draft, source or saved-record format change. Preserve password clearing and memory/authentication disclosures.
- Dependencies/out of scope: existing React/ref/effect patterns only; no focus framework, shared Control rewrite, generic focus manager or new library.
- Acceptance: reproduce before fix; after successful explicit Connect, keyboard focus remains in teaching setup at the selected-model control; after Disconnect, focus reaches the key field or a meaningful setup control; after in-flight cancellation, focus reaches the visible Retry teaching setup/recovery control. Explicit Retry teaching setup preserves meaningful focus after either success or failure. Page change/unmount, an intervening learner focus choice and background status reads do not cause stale focus or steal it. Native dialog Cancel/Escape still return focus correctly.
- Failure/recovery: absent/disabled/unmounted targets cannot throw; failed setup preserves user-visible recovery and no automatic request replay.
- Rollback: revert only focused UI-state/ref hunks; no storage reset or change to host/provider controls.
- Reviewer/stop: Product Quality independently checks actual keyboard focus through the local synthetic transport; types/lint and focused existing checks pass. Stop before tutor or source-flow expansion.

### M0-04e · P2 · Focus the next action after choosing a starting concept

- Upstream: accepted M0-04c wrapper/layout/capture scope; Product Quality's one activation followed by desktop/900px state captures40/41 shows Use as starting concept removes its invoking analysis controls and leaves BODY focused; this was not two independent activations. The unchanged handler is not attributed to the wrapper patch.
- Exclusive owner/files: UI/UX, prototype/src/SourceReadingBundle.tsx only after M0-04c source lease release. Engineering retains the separate receipt/component paths.
- Interfaces: explicit starting-concept choice → existing Analyze selected ranges becomes the visible keyboard focus target. No new props or shared Control contract.
- State/source/migration: preserve current capture focus, source versions, intentional analysis invalidation, exports and all learner records. No storage or migration.
- Dependencies: reuse the existing stable toolbar control/native DOM focus. No framework, generic focus manager, new component or dependency.
- Out of scope: automatic analysis, navigation, copy/style changes, remove-capture focus, broader reader redesign and M2 persistence.
- Acceptance: reproduce the existing focus loss before editing; after the explicit choice, Analyze is focused and visible at desktop/900px. The choice remains recorded, analysis is invalidated exactly as before, no automatic request runs, and explicit reanalysis/export still work. Existing disabled reasons/order remain.
- Failure/recovery: no throw for an absent/unmounted target; no background focus stealing or deferred focus replay. User work survives a failed analysis and normal retry.
- Rollback: revert only the local focus-target/handler hunk; no data reset or other accepted reader changes removed.
- Reviewer/stop: Product Quality independently checks the frozen new source; Visual Evidence only if a new visual issue appears. Inspect diff, types/lint, meaningful existing reader tests/full relevant unit suite and actual keyboard self-checks in an isolated build. Stop after the one-action focus receipt, before a new feature.

### M0-05 · P1 · Ground the UI/UX-award quality target

- Upstream: PM-verified actual human quality request in Product Quality chat, existing specification/design, returned M0-04 evidence and the recorded GitHub shortlist.
- Exclusive owner: Plan AI and UI improvements returns a read-only official-source handoff; PM alone reconciles the current specification/plan. Product Quality retains independent acceptance and UI/UX later owns any exact design lease.
- Exact record files: docs/product-logic-contract.md, docs/implementation-plan.md, docs/capability-register.md, docs/milestone-handoffs.md and tasks/todo.md. No app/source changes in this research task.
- Interfaces: dated official criteria/reference evidence → at most five measurable product/design/accessibility checks mapped to the existing one-task lesson and discovered screens/files. Unknown or missing reference content remains provisional.
- State/migration: no records, source versions or storage change. Existing snapshot evidence stays attributed to its actual artifact.
- Dependencies/out of scope: existing architecture/assets/dependencies first; no repository collection installation, competitor art, AI-generated imagery, new app/navigation, paid review service, award entry, publication or deployment.
- Acceptance: primary sources directly support criteria; recommendations improve actual learner task clarity/recovery/keyboard/reflow rather than claim a trophy. Separate screenshot appearance, observed behaviour and real learner comprehension. Adoption proposals follow existing license/compatibility/owner gates.
- Failure/recovery: unavailable historic links are reported, not invented; conflicting references reconcile into one direction. Do not delay the current privacy acceptance for aspirational research.
- Rollback: retain evidence and revert only later approved specification refinements; no application mutation in this task.
- Reviewer/stop: PM plus Product Quality/UI/UX reconcile the bounded handoff. Concrete code changes receive a separate exact lease; stop research after the relevant criteria, not an exhaustive reference crawl.

## Stage 1 — one excellent lesson

### M1-01 · P0 · Resume one confirmed task's draft

- Upstream: approved specification/plan, accepted M0 baseline and draft-envelope review. This is the first proposed feature slice, not all of Stage 1. Baseline P0 findings are resolved/disproved first.
- Exclusive owner: Engineering Lead. UI/UX reviews behaviour; no concurrent writer.
- Files: prototype/src/Workspace.tsx, prototype/src/ProjectLesson.tsx; new prototype/src/task-draft.ts and prototype/task-draft.test.ts (four paths).
- Consumes: existing project/recordId/serial, attempt ID, stage and exact current SourceSnapshot. Produces: a versioned draft envelope (projectId, recordId, originating serial, attemptId, stage, file/hash/range pin, allowlisted field values and savedAt; proposed maximum 32KiB with no source duplication/credentials) and explicit restored / stale / conflict / unsaved states; existing ProjectAction remains the only authority for saved progress.
- State/migration: separate draft storage; do not change or migrate vadhyar.project.v1 records. Bind field allowlist to stage, generation and source. Preserve invalid raw bytes for export; restoring a draft cannot submit it or resume a command/provider request.
- Dependencies: zero new runtime/dev libraries. Use Zod and existing storage/error/export controls.
- Out of scope: feature search, multi-turn tutor, grading, reading-bundle persistence, multi-tab atomic writes, new destinations.
- Acceptance: (1) reload restores unsaved prediction/reasoning for the same confirmed task without changing its saved stage; (2) another project/attempt/stage/reset generation or changed source cannot inherit it as current; (3) denied/quota/corrupt/conflicting storage preserves visible work, old saved bytes and export/retry.
- Failure/recovery: source unavailable restores as historical/unknown with explicit refresh; source drift requires review; reset/conflict fences reject obsolete writes. No provider calls or command replay on restore.
- Rollback: old version-1 record bytes remain readable; disable/revert draft consumers while leaving sidecar bytes untouched. Test rollback with an old record and a new draft present.
- Reviewer/stop: Product Quality + UI/UX; isolated regression checks and actual reload/failure/keyboard acceptance on a disposable project/origin. Stop before changing entry or teaching.

### M1-02 · P1 · Recover question setup

- Upstream: accepted M1-01 draft contract and UI handoff.
- Exclusive owner: UI/UX Lead, with Engineering integration review.
- Files: prototype/src/ProjectExplorer.tsx, prototype/src/Workspace.tsx, prototype/src/task-draft.ts and prototype/task-draft.test.ts (the latter two created by M1-01).
- Consumes/produces: source selection + rule/case/query → bounded setup draft; confirmation still calls existing start(source, requirement, caseInput).
- State/migration: separate setup identity from an active attempt; never replace an active question or retained reading captures implicitly. No v1-record rewrite.
- Dependencies/out of scope: none; no new search service, automatic lesson start or Git import.
- Acceptance: setup survives reload; switching project/source cannot mix fields silently; current paging/retry and Keep working/export remain intact.
- Failure/recovery: failed source/history reads retain input and last valid selection; unavailable source cannot be confirmed.
- Rollback: remove setup consumption, retain sidecar and existing saved attempts.
- Reviewer/stop: Product Quality + Engineering; stop at accepted setup recovery.

### M1-03a · P1 · Propose bounded task context

- Upstream: Source Intelligence handoff, confirmed candidate limits and M1-02.
- Exclusive owner: Engineering Lead. Source Intelligence supplies relevance/provenance acceptance.
- Existing files: prototype/project-service.mjs, prototype/project-service.test.mjs, prototype/src/project-types.ts; new prototype/task-entry.mjs and prototype/task-entry.test.mjs (five).
- Consumes/produces: feature/error text, explicit source selection or approved host save event → small ranked candidate list with host file IDs/range pins, reason and coverage/unknown state. Host resolves all paths; no raw error text grants path authority.
- State/migration: proposals are ephemeral until confirmed; save-event source remains historical until reread. No watcher expansion, Git history or editor-buffer import.
- Dependencies/out of scope: deterministic metadata/bounded captures first, no MiniSearch/vector index/model filesystem access or whole-project claim.
- Acceptance: relevant supported task can start from text/change without prior path knowledge; ambiguous/no-match/private/deleted/oversized inputs preserve intent and offer manual selection; only approved project IDs/ranges are returned.
- Failure/recovery: unavailable index falls back to current file selection; late proposals cannot replace a newer query/task.
- Rollback: remove the candidate route while retaining current file browser and saved attempts.
- Reviewer/stop: Source Intelligence + Product Quality; stop if actual relevance is insufficient—do not label filename matching semantic understanding.

### M1-03b · P1 · Confirm context in the existing workspace

- Upstream: accepted M1-03a DTO and one UI direction.
- Exclusive owner: UI/UX Lead.
- Existing files: prototype/src/ProjectExplorer.tsx, prototype/src/project-api.ts, prototype/project-api.test.ts, prototype/src/Workspace.tsx, prototype/src/project-style.css (five).
- Consumes/produces: task intent/candidates → reviewed rule/case/source confirmation → existing start action. Entry choices remain within Project and Path's next action.
- State/migration: reuse setup draft; source expansion/change gets explicit confirmation. Existing active question archives only through its current guard.
- Dependencies/out of scope: none; cmdk/Radix/Lucide remain conditional, no redesign of navigation.
- Acceptance: feature, error, selected-source and supported saved-change entries converge on the same confirmation; one obvious next action; keyboard/narrow/error states retain input and drafts.
- Failure/recovery: no-result and retry are distinct from empty project; rejected/late context cannot start a task.
- Rollback: restore manual-source entry without deleting new draft/history bytes.
- Reviewer/stop: UI/UX handoff reviewed by Engineering + Product Quality; stop after the bounded entry journey.

### M1-04 · P1 · Extend the existing tutor service

- Upstream: accepted task context, AI Workflow policy/consent/budget handoff, current provider contracts.
- Exclusive owner: Engineering Lead.
- Existing files: prototype/teaching-service.mjs, prototype/teaching-service.test.mjs, prototype/src/project-types.ts (three).
- Consumes/produces: explicit Explain / Hint / Ask me / Show flow request with approved task/attempt/source/turn context → bounded matching interpretation with one optional question, citations, uncertainty, assistance type and actual usage when supplied.
- State/migration: do not introduce server-held account memory or store secrets. Revalidate sources before/after; keep connection epochs/cancellation and no fallback. New DTO version must not reinterpret old saved explanations. Supplementary approved source pins have explicit context lineage/revision, distinct from the immutable baseline; refresh/replacement invalidates current context but cannot expand verification coverage.
- Dependencies/out of scope: existing official SDK and Zod; no provider rewrite, voice, OAuth/Ollama or shell tools.
- Acceptance: progressive requested hints and direct explanation use the same approved task; malformed/irrelevant/wrong-source output is refused; prompt injection, cancellation, duplicate operations and source/connection drift do not create accepted evidence or silent retries.
- Failure/recovery: preserve input/prior turns; show actual unknown usage after lost acknowledgement; no auto-replay after restart.
- Rollback: keep one-shot route/old explanation reader usable; new request handler can be reverted without mutating v1 records.
- Reviewer/stop: AI Workflow + Product Quality + Source Intelligence. Synthetic tests establish protocol behaviour only; live-provider semantic quality remains a separate acceptance gate.

### M1-05a · P1 · Retain tutor turns as assistance

- Upstream: frozen M1-04 result contract and reviewed sidecar/export design.
- Exclusive owner: Engineering Lead.
- Existing files: prototype/src/project-learning.ts, prototype/project-learning.test.ts and prototype/src/Workspace.tsx; new prototype/src/tutor-record.ts and prototype/tutor-record.test.ts (five).
- Consumes/produces: validated task-bound turns → bounded assistance record and combined export. No tutor response changes stage or requirement verdict.
- State/migration: separate versioned record bound to project/generation/attempt/source. Preserve old teaching array and v1 bytes; context expansion requires consent. Capacity refusal keeps the new result exportable without silent pruning.
- Dependencies/out of scope: none; no general chat store, Dexie or cloud sync.
- Acceptance: turns retain source/version/mode/assistance and actual usage; old records export identically absent sidecar; malformed/stale/conflicting sidecars remain recoverable and cannot masquerade as saved progress.
- Failure/recovery: failed retention surfaces unsaved result with export/retry; reset generations prevent resurrection.
- Rollback: old app ignores sidecar; original records remain readable, new assistance can be exported separately.
- Reviewer/stop: Product Quality + AI Workflow; stop at accepted storage/export contract.

### M1-05b · P1 · Put contextual help beside the active task

- Upstream: M1-04/05a and reviewed master-screen states.
- Exclusive owner: UI/UX Lead.
- Existing files: prototype/src/TeachingPanel.tsx, prototype/src/ProjectLesson.tsx, prototype/src/project-style.css; new prototype/tutor-interaction.test.ts only if needed for extracted request-state logic (at most four).
- Consumes/produces: confirmed task, learner attempt and assistance log → contextual modes, one-question interaction, full payload review and retained/unsaved status.
- State/migration: draft text and assistance log retain distinct save acknowledgements. Navigate/cancel/source changes fence responses. No new navigation destination.
- Dependencies/out of scope: native controls and CSS first; no complete chat component framework or decorative motion.
- Acceptance: Explain/Hint/Ask me/Show flow stay on one task; direct answer remains accessible without penalty; offline/provider failure, stop, stale and quota states preserve reasoning and have keyboard recovery.
- Failure/recovery: review exact changed context before another request; no duplicate send from repeated activation and no request replay on resume.
- Rollback: one-shot explanation UI remains accessible; retained sidecars remain exportable.
- Reviewer/stop: AI Workflow + Product Quality; stop before assessment expansion.

### M1-06 · P1 · One defensible prediction MCQ

- Upstream: independently reviewed exercise/answer oracle for an actual supported task, frozen task/source identities and practice-vs-investigation contract.
- Exclusive owner: Engineering Lead; AI Workflow supplies policy and Product Quality approves the answer/key independently.
- Existing files: prototype/src/ProjectLesson.tsx, prototype/src/Workspace.tsx and prototype/src/project-learning.ts; new prototype/src/practice.ts and prototype/practice.test.ts (five).
- Consumes/produces: reviewed question/version/alternatives/rationale/validation pins → selected answer, assistance and scoped correctness/unknown feedback. Unreviewed generated questions remain ungraded.
- State/migration: use a separately versioned practice envelope/export bound to originating attempt, stage, source pins and question version, preserving v1 attempts and the main prediction. Save first answer/reasoning before independently validated feedback. Skip/exit returns to that investigation stage without advancing it; if the task changed, keep practice historical and return without rewinding. Record known prior hint/answer exposure. Wrong-source or changed-source grading is blocked. Freeze this lifecycle before coding.
- Dependencies/out of scope: Zod/native radios; no model-self-grading, generic curriculum, scores/mastery, dnd-kit or arbitrary code execution.
- Acceptance: independent oracle proves key and plausible alternatives; ambiguous/unsupported/version-mismatched questions withhold automatic correctness; answering cannot skip investigation prerequisites.
- Failure/recovery: retain the learner's answer if validation is unavailable; offer explanation/flag-question without inventing a grade.
- Rollback: disable the card while keeping prediction/practice exports and original records.
- Reviewer/stop: Product Quality + AI Workflow. Stop if no defensible oracle exists; the first-lesson gate remains open rather than substituting a disconnected demo.

### M1-07 · P1 · One meaningful typed-code task

- Upstream: M1-06 practice envelope, same confirmed task and a reviewed expected behaviour/check method.
- Exclusive owner: Engineering Lead, with UI/UX handoff for existing text controls.
- Existing files: prototype/src/practice.ts, prototype/practice.test.ts, prototype/src/ProjectLesson.tsx, prototype/src/project-learning.ts, prototype/project-learning.test.ts (five; practice paths are created by M1-06).
- Consumes/produces: learner-authored relevant code/change + source pins → saved attempt, assistance declaration and independently scoped verification/review outcome.
- State/migration: retain original code attempts and verification identity; drafts recover via the approved envelope. Bind check/manual review to the explicitly captured submitted saved-source project/file/range/hash and intact check/manifest identity. Keep the typed text identity separately; different textarea code cannot inherit a saved file's pass. Unapplied/unreviewed typed code remains unverified. This evidence binding does not grade by exact string. Practice typing is not a command or a correctness result.
- Dependencies/out of scope: current textarea/editor/check runner; no embedded editor, generated-code auto-run, iframe/worker sandbox claim or exact-string grading.
- Acceptance: two equivalent correct implementations are accepted by the declared checks/review; plausible incorrect code is distinguished; no check runs without separate approval and an exit code alone cannot satisfy the requirement.
- Failure/recovery: unsupported check uses explicit manual/unverified status; timeout, stale source and lost jobs retain code and evidence without auto-replay.
- Rollback: remove practice UI while retaining code/assistance exports; original manual investigation remains usable.
- Reviewer/stop: Product Quality + Source Intelligence. Stop after one actual task, not a broad coding platform.

### M1-08 · P0 gate · Accept one connected lesson

- Upstream: accepted M1-01 through M1-07 and all P0 findings resolved/disproved.
- Exclusive owner: Product Quality Lead, read-only acceptance; Visual Evidence captures only the exact accepted artifact when separately authorized. PM records outcome.
- Files: consume all task receipts and product source; no app implementation paths. Produce exact artifact/source/environment evidence, not a new design.
- Interfaces/state/dependencies: no new contracts or libraries; isolated test project/origin with explicit fixture disclosure, no user-record reset.
- Acceptance: complete easy entry → confirmed source → prediction → requested tutor help → meaningful code task → scoped verification → interruption/resume on one task. Repeat with AI absent; include unknown/unmet outcome, changed source and equivalent code. Keyboard/reflow/zoom/reduced-motion/native-scroll states must pass. Reviewed MCQ answer and learner-authored change remain distinct from mastery.
- Failure/recovery: a saved record must survive every injected failure; stop on consent bypass, source mix, false grade, lost work or forged/currentness claim.
- Rollback: no new public release; revert only a failing feature lease while preserving exports and original storage.
- Reviewer/stop: PM + Engineering + UI/UX + AI Workflow; human acceptance required before Stage 2. Live-provider usefulness and unfamiliar-learner comprehension require observed evaluation, not synthetic protocol tests.

## Stage 2 — source flow, different case and revisit

### M2-01 · P1 · Retain task-linked reading context

- Upstream/owner: accepted M1-08 and Source Intelligence handoff; Source Intelligence Lead is the exclusive implementer, Engineering reviews persistence/interface integration.
- Files: prototype/src/SourceReadingBundle.tsx, prototype/src/reading-bundle.ts, prototype/reading-bundle.test.ts, prototype/src/Workspace.tsx (four; confirm exact storage contract before lease).
- Interfaces/state: explicit one-to-five range pins plus version-bound static analysis snapshot → resumable task-linked context and current/stale/unknown/history labels. Retaining captures alone does not retain their previous map or explanation; store the approved analysis result separately and never silently recompute it as historical evidence. Preserve current mixed-version refusal, view-local exports and original v1 data; sidecar compatibility must be reviewed.
- Dependencies/out of scope: none; no automatic project capture or whole-repository completeness.
- Acceptance: reload restores approved pins and old explanations as historical; changed/missing source requires explicit recapture; failed analysis/replacement retains valid captures/export.
- Failure/recovery/rollback: invalid/capacity/conflicting state remains exportable; disable persistence consumer without deleting sidecar/history.
- Reviewer/stop: Product Quality + Engineering; stop before adding example execution.

### M2-01b · P1 · Ask about a task-bound source node

- Upstream/owner: accepted M2-01 and frozen contextual tutor/approval contract; UI/UX Lead is the single writer, Engineering and Source Intelligence review the interface.
- Existing files: prototype/src/SourceWalkthrough.tsx, prototype/src/ProjectExplorer.tsx, prototype/src/ProjectLesson.tsx, prototype/src/TeachingPanel.tsx; new prototype/source-context.test.ts if needed for extracted context validation (at most five).
- Interfaces/state: inspect-node → source navigation or explicit question carrying attempt/context revision plus project/file/hash/range/concept identity. A local concept ID alone is insufficient. ProjectSource forwards the optional callback; an unconfirmed task asks for confirmation before a tutor request.
- Dependencies/out of scope: existing components/React Flow; no new diagram/tutor framework or direct provider call from a node.
- Acceptance: task/source/context match across inspect/question/help views; extra excerpts require renewed payload review; keyboard/text alternatives reach the same action and stale/late callbacks cannot write into another task.
- Failure/recovery/rollback: declined consent or unavailable provider preserves reading/draft/history; remove callback wiring without deleting retained analysis or assistance.
- Reviewer/stop: Source Intelligence + AI Workflow + Product Quality; stop at one useful task-bound question before a simulated example.

### M2-02 · P1 · Step through a clearly labelled example

- Upstream/owner: M2-01/M2-01b, reviewed small-flow contract; Source Intelligence Lead.
- Existing files: prototype/src/SourceWalkthrough.tsx, prototype/src/walkthrough-types.ts, prototype/walkthrough-service.mjs, prototype/walkthrough-service.test.mjs, prototype/src/StepControls.tsx (five).
- Interfaces/state: selected source-supported nodes + declared example input/assumptions → simulated steps, inspect-source and question context. Preserve static relationship provenance; actual observed execution remains unsupported.
- Dependencies/out of scope: existing React Flow; no ELK, replacement graph engine, runtime instrumentation or generated code execution.
- Acceptance: node/source/question share exact pins; keyboard/text/non-drag route matches diagram; inferred/simulated path never receives an observed-execution label and drift preserves historical explanation.
- Failure/recovery/rollback: unsupported syntax/path stays unknown, late responses ignored, text/source remains usable if diagram fails; revert only example controls.
- Reviewer/stop: Product Quality + AI Workflow + UI/UX; stop at a few reviewed nodes/example steps.

### M2-03a · P1 · Record a different-case application

- Upstream/owner: M1-08 and accepted practice records; Engineering Lead, UI/UX handoff.
- Existing files: prototype/src/project-learning.ts, prototype/project-learning.test.ts, prototype/src/ProjectLesson.tsx, prototype/src/Workspace.tsx (four).
- Interfaces/state: a distinct-case prediction with source/assistance → its own verification and scoped outcome. This extends the current self-reported transfer prediction; freeze versioned compatibility/export before adding any persisted fields.
- Dependencies/out of scope: none; no mastery or automatic independence claim.
- Acceptance: the different case has its own evidence/unknown state; prior assistance is retained; passed selected checks and independent application stay distinct.
- Failure/recovery/rollback: no command/teaching replay on restore, invalid new state cannot destroy old history, and exported old/new records remain available after disabling the new reader.
- Reviewer/stop: Product Quality + AI Workflow; stop after one distinct actual case is independently reviewed.

### M2-03b · P2 · Offer a simple revisit list

- Upstream/owner: M2-03a's reliable attempt records; UI/UX Lead, Engineering contract review.
- Existing files: prototype/src/LearningPath.tsx, prototype/src/Workspace.tsx; new prototype/src/review-queue.ts and prototype/review-queue.test.ts (four).
- Interfaces/state: explicit learner-selected task references → small revisit list in Path/Notebook. Queue state is separate from correctness, assistance, original attempts and mastery; use a reviewed versioned sidecar rather than silently changing v1.
- Dependencies/out of scope: existing controls/storage; no ts-fsrs, adaptive scheduling, rewards or calendar notification.
- Acceptance: revisiting opens the right recorded task/source; stale/missing references are labelled, not replaced; removing a queue item never deletes an attempt.
- Failure/recovery/rollback: corrupt/quota/conflicting queue bytes remain recoverable and do not block core records; disable the queue without dropping history.
- Reviewer/stop: Product Quality + Engineering; stop at manual revisit, before Stage 3 approval.

## Stage 3 — two narrow specialist journeys

### M3-01 · P1 · Browser/UI-quality handoff loop

- Upstream/owner: Stage 2 acceptance, actual suitable web project and approved external-tool protocol; Engineering Lead, with UI/UX and AI Workflow handoffs.
- Existing files: prototype/src/ProjectLesson.tsx, prototype/src/Workspace.tsx, prototype/src/project-learning.ts; new prototype/src/tool-journey.ts and prototype/tool-journey.test.ts (five).
- Interfaces/state: need/applicability/official-tool/action/scope/approval → handoff → supplied or attested result → explanation → learner change → separate verification. Version and export the journey beside the same task; no new destination.
- Dependencies/out of scope: upstream browser checks already available to learner; no skill copies, hidden installs, ambient assistant observation or general-purpose shell runner.
- Acceptance: approval precedes the exact action; current task/source and provenance follow every step; forged/manual result cannot appear host-verified and screenshot alone cannot mark behaviour accepted.
- Failure/recovery/rollback: missing tool/permission leaves actionable handoff and core lesson intact; redaction/failed import retains drafts; disable new view without dropping prior records.
- Reviewer/stop: Product Quality + Visual Evidence + AI Workflow; stop after one real UI finding/change/recheck journey.

### M3-02 · P1 · Scoped dependency/security-analysis handoff

- Upstream/owner: M3-01 accepted journey contract and verified supported project/tool format; Engineering Lead, Ponytail/source-policy handoffs.
- Existing files: prototype/src/tool-journey.ts, prototype/tool-journey.test.ts, prototype/src/ProjectLesson.tsx, prototype/src/project-learning.ts (four; tool paths created by M3-01).
- Interfaces/state: dependency/lock scope + separately approved tool action → untrusted sanitized report with advisory/version/source identity → learner explanation/change → explicit rerun/review.
- Dependencies/out of scope: prefer available npm lock audit or a separately verified OSV/Semgrep/secret-scanner handoff; adopt none by default. No comprehensive-security claim, secret capture, database/shell agent or hosted upload without separate consent.
- Acceptance: unsupported project/old lock/report cannot receive a clean verdict; false positives/unknown coverage remain visible; advisory report and actual requirement satisfaction are separate.
- Failure/recovery/rollback: unavailable/offline tool leaves unknown status and manual recovery, never an assumed pass; preserve sanitized report/history on revert.
- Reviewer/stop: Product Quality + Ponytail + Source Intelligence; stop after one narrow supported journey and human review.

## Explicitly deferred

Voice/microphone integration, additional providers/OAuth/local models, more languages, broader exercise types, full embedded IDE, account/cloud sync, persistence replacement, adaptive scheduling, runtime tracing, external assistant telemetry and universal security/integration support need later specification and approval. The existing prepared/historical material and user records are preserved; they are not accepted current product features.

## Open decisions and gates

| Decision | Accountable owner | Due before | Stop if unresolved |
| --- | --- | --- | --- |
| Current baseline, outgoing-context privacy and terminal-receipt race | Engineering + Product Quality | M1-01 activation | No feature task starts |
| Draft sidecar/rollback and context freshness | Engineering + UI/UX | M1-01 coding | No storage write |
| Candidate relevance and capture limits | Source Intelligence + Engineering | M1-03a coding | Manual entry remains |
| Tutor context/consent/output/evaluation budgets | AI Workflow + Product Quality | M1-04 coding | Existing one-shot stays |
| Independent exercise oracle and equivalent-code method | Product Quality + AI Workflow | M1-06 coding | No automatic grade |
| Master-screen states and actual rendered acceptance | UI/UX + Visual Evidence | UI lease / M1-08 | No expansion |
| Dependency additions and official evidence | Engineering + Ponytail | Any install/lock change | Zero new packages |
| Audience and efficacy pilot boundaries | CEO + PM | M1-08 learner trial | No efficacy claim |

## Prior cleanup plan — frozen, unfinished

The following previous plan is retained verbatim as an interrupted slice. Its publication authorization is not active within this planning task. It is not the next milestone execution scope.

# Browser companion implementation and maintenance

Current scope: a local browser learning workspace for investigating one concrete rule in an approved existing software project. Source reading, predictions, observations, changes, explicitly approved checks, reflection and export retain their independent evidence boundaries. See the [feature contract](../prototype/feature-contract.md), [product behavior](product-logic-contract.md) and [task record](../tasks/todo.md).

## Authorized cleanup — 2026-10-15T03:04:35+05:30

The user selected **browser product only** after asking to remove unwanted GitHub folders including NovaDesk. Remove obsolete native/demo source, packaging, tests, evaluation tools, static-site copies and development clutter from the current tree. Repair all callers/configuration/dependencies/documentation. Keep the real-project browser workflow, installer, active source/privacy tests, copyright notices and current release evidence. Reuse the existing shared Control inside the browser before removing its old native source.

Before deletion, identify import/build/test/package/link dependencies. Verify changed code with typecheck/lint/focused cases, then run all current browser unit/service/installer and strict dependency checks in an isolated copy. Exercise the actual packaged browser. Push the working branch, wait for required CI, fast-forward protected main normally and verify the public tree.

## Recovery and limits

The complete pre-cleanup source, research, task/evidence ledgers, event/native implementation and earlier package setup remain at [92e118d](https://github.com/sabari-nath17/vadhyar/tree/92e118d542ab7332a6d6821929a870cc25187516). Published tags and release assets stay unchanged. Preserve local recordings, .ignore/Graft artifacts and active sessions; do not force-push, rewrite history or rebuild shared served assets.

This cleanup adds no learner features or efficacy claims. Teaching quality, human review, untested platforms and signed installation remain separately scoped. Product expansion and readiness monitoring stay stopped after the requested cleanup.
