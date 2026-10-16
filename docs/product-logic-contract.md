# Next milestone — one connected lesson

Status: the human has requested a stability stopping point for the current version. The M0 focus/integrated review passed within scope with no blocker; code work is stopped and specialist chats are held. The connected-lesson requirements below remain the agreed future direction and are not represented as implemented. Author: Project Manager — Vadhyar. The [implementation plan](implementation-plan.md) defines task contracts; the [task register](../tasks/todo.md) owns exact activations and acceptance.

The existing behaviour contract below remains the baseline. New requirements in this section are proposals, not shipped capabilities. [Capability register](capability-register.md) separates reproduced behaviour, inspected code, partial work and proposals. The interrupted browser-only cleanup is preserved in the task register; no publish, reset or deployment is authorized by this milestone.

## Confirmed first lesson task

The human selected Vadhyar's source-trust extension: getSourceState should explicitly reject evidence for another file, while continuing to accept valid requested-file unavailable states and changed hashes. The current sourceFreshness helper already classifies foreign-file evidence as unknown; that working behaviour anchors the prediction, not a fabricated defect. The meaningful code task adds the stricter boundary. Tutor help, short practice, saved-source submission and scoped verification stay attached to this one task.

This confirmation chooses the objective. Refreeze source/range identities after upstream changes; Product Quality must independently accept the exercise oracle and equivalent-code checking method. Do not implement the target change on the learner's behalf or mark their practice complete merely because specialists built the practice feature. Keep original prediction-source identity separate from the later submitted-code version.

## Quality target carried from the human's later direction

Aim for UI/UX-award-level craft through understandable tasks, accurate copy, strong recovery, consistent visual hierarchy and accessible interaction. Use relevant official judging/reference evidence to make checks concrete, without claiming eligibility, readiness, a win or demonstrated learning benefit. Keep one design direction and the existing architecture; previously shared GitHub repositories remain evaluated references rather than an installation list. M0-05 research supplies the bounded handoff; independent privacy/functional acceptance remains required.

### Reconciled quality checks

The official [UX Design Awards criteria](https://ux-design-awards.com/jury/judging-criteria) support research-grounded usefulness, accessibility, responsible data/AI use and consistent experience/writing. [Awwwards evaluation](https://www.awwwards.com/about-evaluation/) separates design 40%, usability 30%, creativity 20% and content 10%; these are reference dimensions, not Vadhyar scores or eligibility. PM opened both official sources on 16 October 2026. Use the following checks in existing task reviews; they add no new application module.

| Check | Acceptance evidence and existing task mapping |
| --- | --- |
| Task orientation | One primary next action, visible confirmed rule/case/source. Measure unfamiliar-learner orientation rather than infer it from a screenshot. The proposed five-person feasibility pilot uses 60 seconds as an initial orientation target, with 30 seconds a non-gating stretch; record actual results and treat these as internal hypotheses, not award rules or learning proof. M1-03/M1-08. |
| Source/help connection | Source links open the intended captured range; every local reader action keeps its own explanation; node questions retain task/source lineage. M0-04c/M2-01/01b. |
| Repair without loss | Relevant validation errors preserve text and offer a keyboard route to affected fields, following the [GOV.UK error-summary behaviour](https://design-system.service.gov.uk/components/error-summary/) using existing controls. A wrong prediction is learning evidence, not an invalid form. Quota/stale/source/provider/host failures preserve/export work and never replay commands or generation silently. M1-01/02/05 and current safety gates. |
| Keyboard/reflow | Test the supported journey without pointer/drag, including dialog return and visible focus near fixed controls. Preserve 700–900 pixel checks and assess ordinary-content reflow at 320 CSS pixels, equivalent to 1280 pixels at 400% zoom. [W3C reflow guidance](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) limits two-dimensional exceptions to content that needs them; code/map regions do not exempt surrounding controls or paragraphs. This is a test target, not a current WCAG-compliance claim. M1-08 and each changed surface. |
| Consistent craft/truthful states | Review actual master-screen states against existing type/spacing/contrast/asset provenance. Important stale/unsaved/cost consequences stay visible. Interpretation, observation, command outcome and learner verdict remain distinct; relevant status is announced without unnecessary focus stealing. M0-04/M0-04d/M1-08. |

The specification lead's [Duolingo path reference](https://blog.duolingo.com/new-duolingo-home-screen-design/) is a 2022 historical pattern for a clear next activity and earlier work, not verification of today's interface. Existing React Flow/CSS/icons/controls remain preferred. No current gap establishes a need for Radix, Lucide, cmdk, another animation engine, editor, layout, search or storage framework. Performance/assistive-technology/real-learner studies require actual measurements; role rehearsal is not a substitute. No award entry, fee, public deployment or complete accessibility/learning claim is authorized by this research.

## Objective and scope

Help one person understand and independently modify one task in their existing AI-built project. Preserve the React browser companion, protected local Node host, SQLite source history, browser learning records and Path / Project / Notebook. Initial audience assumption is an AI-assisted JS/TS builder who can read basic conditions and edit/run their own project; absolute-beginner suitability and 8 GB performance are unverified. Initial supported scope is one trusted local JS/TS project on a desktop/laptop; broader languages, phone access and hardware/model performance are not promised.

A usable lesson connects entry → confirmed task/source → prediction → requested help → meaningful learner change → scoped verification → resume. Short practice remains distinct from the full investigation, but references the same task and source. Activity, assistance, process success, requirement satisfaction and independent application remain separate facts.

## Capability map and build order

| Stable module | Responsibility | Depends on |
| --- | --- | --- |
| task-context | Entry, small approved context, immutable task/source identity, draft recovery | Existing project/source/record contracts |
| contextual-tutor | Multi-turn text help and assistance history for that task | task-context |
| validated-practice | One defensible prediction MCQ and one typed-code task | task-context; reviewed assessment contract |
| source-flow | Inspect a small source-backed flow and step through a labelled example | task-context; existing reader/map |
| application-review | Different-case attempt and simple revisit list | validated-practice; reliable attempt records |
| specialist-journeys | Approved tool handoff/result/explanation/change/verification | Reliable task/evidence contracts |

Build order: baseline gate → task-context → contextual-tutor / validated-practice, integrated one at a time → one-lesson acceptance → source-flow / application-review → specialist-journeys. Voice, more languages, richer assessment and integrations follow separate acceptance. No destination is added for an individual capability.

## A. Entry and reliable resume

Let Project begin with a feature/question, pasted error, selected source, or a learner-approved saved change. An error or feature description is a search lead, not evidence of a cause. Use host-approved metadata and explicitly selected bounded captures; show why each candidate is suggested and what is missing. If there is no useful match, retain the input and offer ordinary file/source selection. Never claim semantic repository-wide search from filename filtering.

Before starting, show one rule, concrete case and small source context with exact identity/ranges. Confirmation creates the existing attempt; extending its source context later is explicit. Keep its immutable prediction baseline separate from supplementary approved captures. Each context revision records its parent, originating attempt, selected pins and approval; refresh/replacement invalidates dependent current help without rewriting the baseline. Extra reading/tutor context never enlarges verification coverage implicitly. Saved-change entry initially uses the local host's captured versions/events; Git history, unsaved editor buffers and another assistant's private activity are outside scope.

Preserve saved records and draft text through refresh/restart. Restore only against the matching project, record generation, attempt, stage and source pins. Show stale/unknown context before continuing; never relabel an old draft as current. New draft persistence must not rewrite the existing version-1 record format or silently delete old/corrupt bytes. Engineering must specify and test the separate bounded draft envelope before it is used. Failed saving keeps visible work with retry/export; clearing it is explicit.

## B. Contextual text tutor

Use the existing provider/service and SDK first. Provide Explain, Give a hint, Ask me and Show the flow for the confirmed task. Ask one useful question at a time. Hints become more explicit only when requested. A direct explanation remains available and is recorded as assistance without a penalty or mastery claim.

Proposed request contract: task/attempt identity, operation identity, mode, confirmed rule/case, approved source pins, the learner's selected attempts and bounded prior turns, selected model and explicit payload consent. The host resolves source text from its own approved IDs; browser/model claims never grant filesystem or execution authority. The approval preview includes all text sent, including the actual rule/case text, previous turns and learner answers. Apply the existing recognizable-private-value refusal policy to every outgoing context field, not only source, without silently rewriting task meaning. More source, another model or a changed task requires renewed review.

Proposed result contract: matching request/task/source identities, bounded text, valid source references, one optional question, declared uncertainty and assistance type. Schema validity and valid citation bounds do not prove the explanation correct. Preserve the existing source recheck, connection epoch, one-active-request limit, timeout, safe output, store:false and no automatic retry/fallback. Reject or retain as historical late results after navigation/source/task changes; they must not advance the learner's stage.

Show the current request and Stop immediately; retain the input after failure. Cancellation cannot undo provider use already incurred. Initially retain the existing five-assistant-output budget across old interpretations and new turns; local Show the flow need not spend a model call. Keep the existing request-body/output limits, preview selected context and refuse over-budget input without dropping prior evidence. Record the actual model/request scope and token/usage facts only when the provider supplies them; do not invent a price or promise a latency. Measure first useful response during acceptance before choosing streaming or another transport. Core reading and records work with AI disconnected. Show the flow initially opens the existing static source explanation or its text equivalent; it does not fabricate an execution trace.

## C. Validated short practice

Start with one prediction MCQ and one meaningful typed-code task tied to the confirmed task. Store question/version, source pins, alternatives, answer rationale, validation method, attempt, assistance and outcome separately. A source change makes the old exercise historical; it cannot silently receive a new key.

Only offer automatic correctness for an MCQ with an independently reviewed answer and defensible evidence: a pinned requirement plus deterministic check/observed case, or a recorded human-reviewed oracle. Review misleading alternatives and counterexamples. A model may draft a question, but another model agreeing, a citation existing, or a schema passing is insufficient. If there is no independent oracle, retain it as an ungraded prediction and withhold correctness feedback. The first accepted lesson requires one reviewed MCQ for an actual supported task; a detached prepared demo does not satisfy this gate.

For the first typed-code task, use existing text controls and the learner's editor. The learner writes or changes relevant code, records the attempt and explicitly chooses existing checks or manual review. The assessed submission must be an explicitly captured externally saved source version with project/file/range/hash identity, or an independently reviewed typed submission. A check receipt applies only to its captured saved source/manifest; a different textarea answer cannot inherit that result. Until the learner applies/captures their code or it is explicitly reviewed, the typed answer remains unverified. Preserve its own text identity separately from the saved source; this binds evidence without using string equality as a correctness oracle. Typing itself earns no correctness or competence claim. Accept different valid implementations through the declared checks and independent review, never exact-string equality. Test at least two equivalent correct solutions and a plausible incorrect one against the same oracle. Clearly distinguish unverified, passed selected checks, failed selected checks and reviewed outcome. No generated exercise code is automatically executed, installed or written into the project. An already-correct investigation may end with a justified no-change outcome; the initial coding exercise must use a legitimate learner-confirmed extension or requirement rather than forcing a needless edit. The exact first learner task, revision, cases and independent oracle must be frozen before assessment implementation.

A short-practice record binds the originating attempt, stage, source pins and question version. Opening it preserves the main prediction and exposes known prior hints/answers as assistance. Save the first choice/reasoning before revealing independently validated feedback; an unvalidated question reveals no correctness key. Skip/Leave practice returns to the originating investigation stage without satisfying its prerequisites. If the investigation changes meanwhile, retain practice as historical and return to the current task without rewinding it. Keep short practice exit/skip and investigation progression distinct. A completed MCQ cannot skip observation, change, evidence or reflection prerequisites.

## D. Interactive source and logic

Extend SourceWalkthrough / SourceReadingBundle and existing React Flow; keep the capture limits and exact source/range identities. A selected node opens its source, supports a task-scoped question and has a keyboard/text route. Start with a few relevant nodes. Retain native panel scrolling and non-drag controls.

Use explicit evidence labels: source-supported static relationship; simulated example walkthrough; actual observed execution. The current static analysis supports only the first. A simulated branch can use a declared input and stated assumptions, but is never labelled recorded execution. Runtime instrumentation is outside this milestone. Preserve historical explanations and mark them stale/unknown after drift; changed and restored bytes do not automatically restore verification coverage.

## E. Two specialist-tool journeys

Use Need → suitable tool → explicit approval → execution or handoff → actual result → explanation → learner change → verification. Start with a browser/UI-quality task and one dependency/security-analysis task supported by a known project format. Prefer handoff to an already available upstream tool; never copy a library of skill files into Vadhyar or introduce a generic model-controlled runner.

A recommendation records problem, applicability, official tool identity/version, local/hosted boundary, cost/permissions, scope and exact requested action. Approval applies only to that action. No automatic installations, uploads, shell/database actions or visibility into another coding assistant. A manually attached report remains learner-supplied/untrusted; it is not a host-attested command receipt. Redact secrets before retaining results. Explain a finding with source and limitations, ask the learner to make the change, then verify it independently. A clean dependency report is not complete security, and a screenshot is not functional acceptance.

## F. History and later application

Reuse attempt/history and Notebook. Preserve original predictions, assistance, code attempts, reviewed outcomes, real command facts and learner verdicts as distinct fields/events. Support export and inspectable historical source. Do not infer independent application from a repeat of the same case or AI-authored change.

After one lesson is accepted, add a different-case task with its own prediction and verification and a simple explicit revisit list. Defer adaptive scheduling/ts-fsrs, streaks/mastery scoring, social rankings and certification until attempts and assessment records are reliable.

## One UI direction and required states

Keep the parchment/ink/ochre identity and existing controls described in the current design contract. Aim for easy progression and clear choices; do not borrow Duolingo artwork or identity. Use literal labels, one obvious next action, contextual help, consistent spacing and professional licensed icons only when existing ones are insufficient. No AI-generated imagery. Use real source, diagrams and actual application screenshots.

The single master lesson has a header with task title/progress/Close, a context strip with rule/case/path/range/freshness, and Task / Code / Help views. On wide screens Task sits beside a context pane that switches Code/Help; on narrow screens use one active view. Preserve each view's draft and scroll position; one active view or consent dialog owns the primary action. Full hashes can collapse while stale, unsaved, pending and cost consequences stay visible.

| State | Primary action | Required visible boundary |
| --- | --- | --- |
| Context review | Confirm task | Exact selected context and missing/ambiguous evidence |
| Prediction | Save prediction | Original reasoning retained; known help exposure recorded |
| Hint / explanation | Review request | All outgoing text, model and possible usage cost |
| Provider pending | Stop | Actual request scope; no invented progress |
| Code practice | Record attempt | Typed vs externally saved/assessed source identity |
| Check preparation | Review check | Exact separate command/source/manifest approval |
| Check result | Record verdict | Process result, freshness and learner verdict are distinct |
| Stale source | Review source | Original draft/prediction remains historical |
| Unknown host | Reconnect | Captured work remains available; currentness unknown |
| Unsaved / quota refusal | Retry saving | Export and Keep working remain reachable |
| Provider failed/cancelled | Back to task | Input/prior help retained; explicit retry only |
| Resume/conflict | Resume task / Review recovered draft | Generation/stage/source match or explicit recovery |

Review one master lesson in these states before expanding it: initial task/context confirmation; prediction; requested hint/direct explanation; typed-code attempt; selected-check result; stale/unknown source; unsaved/storage failure; provider unavailable/cancelled; resume conflict. At narrow widths choose task/source/tutor views instead of compressing unreadable panes. Keep consent, unsaved work, uncertainty and consequential costs visible when details collapse.

Required acceptance: keyboard-only operation and focus return; native code/tutor/diagram scrolling; visible focus/contrast; practical 700–900px companion window; 200% zoom/reflow; non-drag map navigation; reduced motion. Automated accessibility tools supplement rendered/manual checks. No ambient animation or custom default smooth scroller.

## Dependencies and alternatives

First task: zero new runtime libraries. Keep installed React, Zod, official OpenAI SDK, TypeScript analysis, existing controls, CSS and React Flow. The latter two analysis/map packages may be declared devDependencies but are bundled into delivered code; include them in security/licence inventories.

Genuine alternatives: a storage rewrite could improve atomic multi-tab use but introduces migration risk; use the current one-writing-tab boundary and a bounded draft envelope first. A complete chat framework could reduce UI work but adds data/protocol assumptions; extend the existing teacher first. A full IDE/editor could provide richer editing but changes execution trust and setup; use the learner's editor and existing text controls for the first practice task. Revisit only after a demonstrated blocker, not because a shortlist exists.

[Dependency decisions](capability-register.md#dependency-decisions) separate runtime, development checks, external learner tools, source-owned components and design references. No package is approved merely by appearing in this document.

## Acceptance, review and open decisions

The first feature task is durable recovery for one confirmed task, bounded separately from intent search and tutoring. Baseline privacy/freshness findings are resolved or disproved first. Its exact files, interfaces, failure cases and stop are in the implementation plan. The complete first-lesson gate additionally requires the reviewed MCQ, meaningful learner change, scoped verification and no-AI recovery on the same task.

Open decisions are owned and due at gates, not assumed: Engineering + Product Quality approve the draft envelope/compatibility before M1-01; Source Intelligence approves candidate-selection limits before M1-03; AI Workflow + Product Quality approve consent/context budgets before M1-04; Product Quality approves the exercise oracle before M1-06; UI/UX approves the master-screen states before any UI expansion; CEO reviews audience/scope trade-offs after the current handoffs. Missing role findings remain provisional.

No implementation task is activated by this draft. Human approval of this specification, implementation plan and next execution scope is the stopping gate.

---

# Existing browser behaviour contract

# Baseline behaviour

The learner investigates one consequential decision in an approved local project, records a prediction, compares evidence and decides what to investigate next. Useful completion must allow uncertainty, interruption and an already-correct program. Current surfaces are Path, Project and Notebook on a desktop browser beside the learner's editor.

[Feature contract](../prototype/feature-contract.md), [runtime DTOs](../prototype/src/project-types.ts), [learning transitions](../prototype/src/project-learning.ts), [design](../prototype/DESIGN.md) and [source reading](source-reading.md) define maintained interfaces. This document states required behavior; exact test and browser execution belong to their dated receipts.

## Independent facts

| Fact | Authority and limit |
| --- | --- |
| Connected project / recorder | Fresh authenticated host status for one approved folder; errors mean unknown coverage |
| Captured source | Project/file/path/range/full-file hash/text/time; excludes unsaved buffers and runtime state |
| Currentness | Explicit successful source-state/read and observed watch coverage; no inference from absent recent events |
| Lesson progress | Validated attempt fields; activity is not competence or correctness |
| Durable save | Browser persistence acknowledgement for this profile/origin; memory-only work is visibly unsaved |
| Command status | Approved host process result and scoped freshness; not the human requirement verdict |
| Requirement verdict | Learner's satisfied/unmet/uncertain assessment, reason and coverage; self-reported |
| Teaching | Source-bound provider interpretation and retention acknowledgement; assistance, not executed evidence |

A source save, model completion, exit code 0, static edge, reward or reflection cannot establish that the whole app works or the learner mastered it.

## Identity and ownership

The host approves the project root and issues file identities. Browser requests cannot supply arbitrary filesystem paths or commands. Different roots have separate project/record identities.

An attempt owns an immutable confirmed requirement, case, captured baseline and prediction. Replacing its question/selection or stale baseline starts a new attempt with draft/replacement confirmation; prior saved work enters history.

Every asynchronous operation is fenced to its project, view, attempt, selected source, request and operation context. Ignore/abort late responses after replacement/navigation. Same source alone does not identify a question. Same-page navigation is a no-op.

SQLite owns metadata, save events and selected source history. Browser storage owns learning attempts/history. Reset writes a new record identity before clearing the view, rejects older generations and leaves host history intact. No cross-browser/profile/port/device sync is implied. Existing old user records are not removed by source cleanup.

## Learning transitions

| Action | Prerequisite and result |
| --- | --- |
| Begin | Valid nonempty captured source, confirmed rule and concrete case; starts Predict, archives prior saved attempt after review |
| Save prediction | Valid outcome/reasoning; retains immutable baseline and advances to Observe |
| Record observation | Fresh selected range must still match prediction source; stores self-reported result/method, then Change |
| Refresh | Explicit current-source read; changed/unchanged comparison, preserved original prediction and archived dependent evidence; no forced edit |
| Verify manually | Evidence/method, independent verdict/reason and assistance; records self-report, then Reflect |
| Verify command | Matching terminal host receipt plus verdict/reason/assistance; passed/failed needs current coverage; error/timeout with unknown coverage permits uncertain/unmet only |
| Reflect | Saved verification including uncertain/unmet outcomes; makes separate case available |
| Separate case | Distinct normalized case, prediction/reasoning and assistance; records another reasoning task without inventing an observed outcome |

Earlier activities show captured records; later activities explain prerequisites. Guided/Review is presentation, not a gate bypass. Archived attempts are review/export-only; only the active attempt resumes. Counts/rewards deduplicate historical copies and do not claim unaided authorship.

## Source and selected reading

Project search/paging/selection uses host IDs, bounded queries and latest-request identity. Keep valid query/source/drafts on failure; retry the operation that failed. Previous-file versions cannot appear as new-file history. Empty/private/deleted/out-of-range/partial source stays distinct from a valid source result.

The reading bundle retains up to five explicit ranges, exact captured versions, complete/partial declaration anchors and local text search. Analysis refuses mixed versions of the same file. Reopening recaptures current source; replacing a retained range is explicit. Failed range/analysis loads preserve captures/export.

Static relative import/re-export links and proposed order concern selected captures only. They do not establish callbacks, HTTP/storage handoffs or runtime coverage. Reading cannot advance learning, run code or share source. Bundles are view-local; export before leaving/reloading Project.

## Command lifecycle

Expose only eligible existing root-package scripts. Review exact command/source/manifest and obtain separate consent. No installs, arbitrary command strings or npm pre/post hooks. Queued saves settle before revalidation. Trusted repository commands run without a sandbox, under timeout/output limits.

Persist the attempt/source/script/manifest-bound starting intent before POST. Reload resumes acknowledged GET status only. Lost start acknowledgement or restarted/missing jobs remain unknown; explicit clear archives that uncertainty before another run. Never replay execution automatically. New execution always needs new approval.

Source/manifest changes before start refuse obsolete consent. Eligible source/dependency/config/check drift during or after a completed job makes coverage stale/unknown while retaining its execution fact. A new command verdict rereads the receipt; incomplete watch scope remains explicit.

## Optional teaching

Require an explicit host-memory key, actual model list/selection and exact excerpt approval. Listing models sends no source and does not establish generation compatibility. The provider has no edit/shell tools, ambient auth, silent model fallback or automatic retry. Render bounded source-cited output safely.

The result is recorded assistance only after validated retention. Failed/capacity-refused retention keeps valid output individually exportable and visibly unsaved; do not issue a sixth retained interpretation. Navigation/cancellation cannot reverse already incurred provider usage. Failure preserves recorder/drafts/prior valid interpretations.

## Recovery and retention

Keep working / explicit discard / export protects drafts and pending work across leaving, replacing and resetting. Failed persistence leaves validated work in the tab visibly unsaved with retry/export. Corrupt saved bytes remain untouched for backup. Saved raw backup and newer visible export are different recovery artifacts.

Conflicting/reset tab generations refuse obsolete saves; use one writing tab because simultaneous writes are not atomic. Failed reset retains prior saved data/view. Capacity refusal never silently prunes protected evidence. History-context write failure rolls back atomically. Host/status failure marks recording/currentness unknown immediately, while retaining historical work.

Keyboard focus, labelled controls, Escape/cancel/focus return, reduced motion and visible blocking errors are required. Desktop/split-window layouts are primary; narrow-window probes do not establish phone connectivity.

## Acceptance and scope

Changes need focused regressions for identity, drift, consent, retry/lost jobs, draft guards, persistence refusal/reset, provider retention and failed/stale reading. UI changes also need actual rendered desktop/source/export acceptance. [Published-preview verification](browser-release-verification.md) records exact executed source/artifact scopes; it is not blanket acceptance of subsequent changes.

The [original C01–C25/K01–K07 register](https://github.com/sabari-nath17/vadhyar/blob/92e118d542ab7332a6d6821929a870cc25187516/docs/product-logic-contract.md) and [maintainer reader receipt](https://github.com/sabari-nath17/vadhyar/blob/92e118d542ab7332a6d6821929a870cc25187516/docs/logic-evidence/persona-real-reader-acceptance.json) remain historical evidence. Their proposed/implemented/tested distinctions and original counts stay intact in [history](history.md).

Automatic grading, mastery/authorship certification, runtime instrumentation, whole-repository completeness, cloud sync, phone/LAN pairing and shared editor bridges are unavailable. Live teacher quality, independent learner outcomes, Windows execution and full device/accessibility coverage remain unverified. The portable installer is separately implemented and has exact release receipts.
