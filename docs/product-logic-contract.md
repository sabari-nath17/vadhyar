# Vadhyar product behavior contract

14 October 2026, IST. Owner: **Verify Vadhyar product logic**. Scope: the approved browser redesign being implemented by **Plan Duolingo-inspired Vadhyar UI**, using the existing local-folder companion. This specifies behavior, not a second visual direction or permission to add unrelated features.

**User goal:** after changes in my coding tool, understand one consequential decision in my own project, record a prediction, compare evidence and decide what to investigate or change next. The learner may be uncertain, interrupted or wrong; useful completion must not depend on manufacturing a bug or a passing verdict.

The [feature handoff](../prototype/feature-contract.md), [runtime DTOs](../prototype/src/project-types.ts), [learning transitions](../prototype/src/project-learning.ts), [approved design](design/2026-10-14-duolingo-minimal/DESIGN.md) and [logic board](logic-board.md) are the source references. Preserve the existing interfaces and storage keys. **Implemented** means source behavior was inspected; **required UI behavior** means it must be implemented and exercised before the new UI is accepted. A written rule alone is not an implemented feature.

**Primary device and use case:** a desktop/laptop browser on the same computer as the learner's project, used alongside their code editor and terminal. Full desktop and practical split windows are the primary design/acceptance targets; use 1024/1440px and approximately 700–900px as concrete layout probes. Keep the question, captured source and evidence usable there. 320/390px probes cover a very narrow browser pane and zoom/reflow robustness; they are not a second phone product or equal-priority phone master screen. Do not add phone-specific onboarding, navigation journeys, device frames, pairing or mobile availability claims. Existing narrow-window reflow remains useful without adding phone connectivity.

## 1. Independent facts; no single success flag

| Fact | Authority | Meaning / limit |
| --- | --- | --- |
| Connected local project | Authenticated host response | One approved folder on this computer; phone/LAN access unsupported |
| Recording available | Fresh project status, watcher state and read outcome | Eligible saved files are followed; unavailable/stale status is unknown, not healthy |
| Captured source | Host snapshot: project/file/path/range/full-file hash/text/time | One selected saved excerpt; not runtime, environment, deployed data or whole-project coverage |
| Current-source check | Explicit successful host read / available current per-file signal | A known newer hash can show drift; absence in a short event feed cannot show freshness |
| Lesson progress | Validated active attempt and its actual fields | Activities recorded in Vadhyar, not correctness, unaided work or understanding |
| Durable learning save | Browser persistence acknowledgement | Saved in this browser profile at this address/port; memory-only work stays visibly unsaved |
| Command status | Host job result | This approved command's status/output and scoped freshness; not the requirement verdict |
| Requirement verdict | Learner's assessment, reason and coverage | Satisfied for checked case / not satisfied / uncertain; self-reported |
| Teaching interpretation | Validated provider response and retention acknowledgement | Source-bounded assistance; neither execution evidence nor a saved result until accepted |

Do not turn a file save, model completion, check exit 0, source-map edge, activity reward or reflection into a claim that the whole app works or the learner has mastered it. A successful save does not establish live source freshness. A successful source read does not establish the deployed/runtime revision.

## 2. Ownership and identity

- The host approves the project root. The browser cannot supply arbitrary filesystem paths or command strings. Changing folders uses the launcher; a different project identity loads a separate learning record.
- An attempt owns immutable confirmed requirement, case and baseline source. Editing the rule/case, choosing another file/range, or replacing a stale prediction starts a new attempt after appropriate draft/replacement confirmation. Saved old work enters history; it is not rewritten.
- Every asynchronous operation owns the originating **project, attempt, source selection, request identity and operation context**. A late response may update only that matching view/attempt. Abort or ignore responses after replacement, navigation or a newer request. Source equality alone does not identify a question.
- Drafts and pending UI operations belong to their mounted question/view. Same-destination navigation is a no-op and must not clear draft protection. Leaving uses Keep working / explicit discard, with export where available; pending execution is not automatically cancelled or repeated by navigation.
- Host SQLite owns metadata, saved-file events and selected source versions. Browser storage owns generic attempts/history. Prepared examples retain their separate `vadhyar.mock.v1` data. No cross-device/profile/port synchronization or generic import is implied.
- Settings, Guided/Review presentation, page selection and source-panel visibility must use their actual persistence behavior. Generic records currently persist attempts/history, not invented profiles, goals or course preferences. Prepared stored pages/modes must remain readable during navigation migration.

## 3. Screen and control contract

| Surface / control | Prerequisite / real action | State, persistence and recovery |
| --- | --- | --- |
| Connection / Connect or Retry | Launch the local host for an approved folder; same-origin session bootstrap and project read | Show connecting/error until actual response. Reconnect must retain browser work and use draft protection if it changes the view/root. No invented connected dashboard. |
| Path / Choose a question | No active attempt, or explicit replacement | Open Project setup. No seeded question or course is automatically created. |
| Path / Continue | Active attempt exists | Open its actual next activity. Completed reflection with no separate case opens that case; a fully recorded path offers review or a new question. No automatic run or stage mutation. |
| Path / earlier activity | Recorded field exists | Read its captured evidence; cannot rewrite immutable prediction or bypass missing prerequisites. Historical source/evidence remains identified. |
| Project / search, next page, select file/range | Host-issued IDs, eligible source and bounded queries | Latest request wins. Keep query/source/drafts on failure. Retry file list, source or versions according to the operation that failed; never substitute another retry. Version loading/error is selection-bound: previous-file versions cannot be displayed as the new file's history. |
| Project / source steps, list or map | Supported captured excerpt and validated walkthrough | Read-only navigation to the same source anchors. Does not advance learning, reveal an executed outcome, call a model or run code. |
| Project / Begin | Nonempty valid selected excerpt; confirmed rule and concrete case within domain bounds | Start at Predict. Preserve old attempt with confirmation; refuse when retention/storage prevents safe replacement. |
| Lesson / save stage | Current attempt and stage-specific valid input | Apply the existing transition, then persist. Clear only accepted field drafts. Failed validation leaves draft. A persistence failure retains valid work in this tab, marks it unsaved and offers export/retry. |
| Lesson / read source or change presentation | Valid captured context | Does not mutate lesson progress or run source. Source-panel close is reversible and must not discard a lesson draft. |
| Notebook / search and inspect | Actual recorded data | Generic Notebook searches recorded reflections/history. Prepared authored notes remain separate. Do not fabricate notes, resume actions or validated understanding. |
| History / review | Archived record exists | Read/export only under current domain. Only the active saved attempt resumes; archived resume is not implemented. |
| Export visible record | Valid in-memory ProjectState | Export accepted current/archived evidence, labels, source identities and assistance, including actions kept only in memory after a storage failure. Raw form drafts and interpretations rejected from retention are excluded; those interpretations have a separate export. Download request is not proof the user has safely stored a backup. |
| Download saved backup | Browser raw record available | Preserve/export saved bytes, including corrupt data, without overwriting them. Do not confuse saved backup with newer unsaved visible work. |
| Reset project record | Explicit confirmation; offer backup/export first | Atomically replace this browser's project record with a fresh identity. Clear active view only on success. Retain host source history, other projects and prepared records. Old tab generations cannot resurrect prior work. |
| Settings / provider Connect | Explicit key; actual model list | Key is cleared from the form and held only by host session. Listing models sends no source and does not establish generation capability. No ambient credential import or silent model selection/fallback. |
| Ask teacher / Review and Send | Active matching source/question; selected model; fewer than five retained interpretations; exact sharing approval | Show real pending/error/result. Cancel stays local before send; leaving aborts the browser request, but cannot undo incurred provider usage. No automatic generation retry. |
| Teacher result / inspect or export | Valid returned interpretation | Accepted retained result is recorded assistance. If retention fails, keep valid result individually exportable with an explicit **not saved in this record** label. Rejected/stale result cannot acquire a saved/current badge. |
| Prepared example / enter and return | Explicit NovaDesk example choice, through draft protection | Separate example state and simulated/mock provenance; role-only ownership defect disclosed. SeatCheck's zero-seat defect belongs to the static design illustrations, not another implemented runtime example. Returning preserves generic record. |
| About / website | Read-only navigation | Product availability and coverage match current implemented features. No phone, installable bridge, automatic grading or unlimited-scale claim. |

Required accessibility behavior: actual buttons/radios, field labels and error associations, visible focus, keyboard access to every source/map action, dialog cancellation and focus return, current-stage announcement without focus loss, and reduced-motion behavior. An unavailable action must explain the missing prerequisite without relying only on color. Keep errors that block action visible when support panels collapse.

## 4. Lesson transition table

Confirm/Understand are requirement/case acknowledgement and source exploration in setup. They are not separately persisted generic stages or measured understanding gates. The actual stages remain `predict → observe → change → verify → reflect → complete`.

| Action | Prerequisites | Output / next activity | Must not imply |
| --- | --- | --- | --- |
| Start | Valid current-project captured source, rule and case | New active question at Predict; prior saved attempt archived | An inferred requirement, imported AI intent or whole-codebase understanding |
| Save prediction | Predict; outcome text and reasoning valid | Immutable answer against baseline A; Observe next | Correct/unaided answer or no prior external observation |
| Record observation | Prediction exists; fresh saved excerpt matches baseline identity/text/range | Self-reported result/method; Change/review next | Vadhyar executed the case or proved runtime revision |
| Review/refresh after observation | Same selected project/file/path/start line | Changed/unchanged capture; Verify next | A required edit, fresh executed check or requirement satisfaction |
| Record manual verification | Verify or pre-reflection replacement; method/evidence, verdict, reason, assistance | Self-reported verification; Reflect next | Executed or independently assessed evidence |
| Record command verification | Matching terminal job plus verdict/reason/assistance; passed/failed requires current scope; error/timeout with unknown scope allows only uncertain/unmet assessment | Actual command evidence and separate assessment; Reflect next; unknown coverage stays visible | Exit status supplied the human verdict, unknown scope became current, or the command covered all cases |
| Save reflection | Recorded verification and verdict | Reflection saved; separate case available | The requirement passed: failed/uncertain results may still be reflected on |
| Record separate case | Reflection; case differs after whitespace/case normalization; prediction/reasoning/assistance | Separate answer recorded, without an invented outcome | Semantic independence, executed transfer, correctness or mastery |
| Record teaching | Matching active source and valid bounded citations; retention available | Retained assistance, same lesson activity | Progress advancement, runtime evidence or an unaided attempt |

Path completion is derived from fields: prediction, observation, refresh, verification, reflection and separate-case record. `stage === 'complete'` means reflection exists; **the separate case is still current while `transfer` is absent**. Use “Recorded” for completed activities. An unmet/uncertain requirement remains visibly unresolved even when the reasoning record is complete. Duplicate archived copies must not increase saved-prediction counts or activity XP.

Current retention is bounded: 20 archived attempts, 20 refreshes per attempt, five interpretations per attempt, and 3,000,000 serialized JSON string code units per project record (not a byte guarantee). Hitting a limit must refuse safe mutation and retain evidence. Export alone does not free capacity. For per-attempt refresh/teaching limits, export and start another question if archive capacity permits. For full project history/record size, export followed by explicit project-record reset is the available recovery. Same-source replacement of the active verification is currently allowed; do not promise permanent retention of every check run. Archival before changed-source invalidation is guaranteed.

## 5. Dynamic-code matrix

| Change / interruption | Required decision |
| --- | --- |
| Code changes after selection but before prediction | The question still describes captured A. Offer inspect/new question on B; do not call A current merely because the user can predict it. |
| Code changes after prediction, before observation | Fresh observation read rejects B as A. Preserve A's answer and draft; offer a confirmed fresh question on B. |
| Code changes after observation, before verification | Explicit refresh adopts B for verification; prediction/observation remain baseline A. Preserve their version labels and comparison scope. |
| Code changes after accepted verification at Reflect or Complete | Archive accepted old evidence before clearing dependent current verification/reflection/separate case; require fresh B evidence. No green current-result badge for old outcomes. |
| Refresh finds identical source | Record unchanged capture, retain later evidence and proceed when eligible. Do not execute checks or create an invented revision. |
| Imported files/config/checks change during command | Existing host recorder/coverage checks mark scoped result stale; retain actual exit/output. Source/manifest consent is freshly validated after settling before start. No automatic rerun. |
| Imported files/config/manifest or recorded project context change after terminal completion, before recording/display as current | The retained terminal result is an execution fact at its earlier time, not fresh evidence for today's context. Revalidate available scope or label it historical/currentness unknown; require fresh scoped evidence before current-result treatment. Do not rewrite a passed execution as an assertion failure or automatically rerun. |
| Runtime data/environment/deployment changes, selected file unchanged | Outcome may differ without a selected-file hash change. State method/runtime as learner report or unknown; do not invent a source-change explanation. |
| Short recent event feed lacks the selected file | Freshness is unknown. Use direct current-source read or available latest-per-file capture to detect drift; feed absence cannot certify unchanged source. |
| Selected source is deleted, excluded, private, invalid or out of range | Keep old captured evidence; current source is unavailable. Explain the specific limitation and permit a different valid selection/new question. |
| Reopen a saved/completed record | Validate structure and ownership; source/dependency/runtime freshness starts unknown. Old evidence is about its captured version until a new host check. |
| Response completes after another question/view/request replaced it | Abort/ignore; no change to replacement record, stage, draft or current-source display. |

The native recorder observes eligible saved files, not unsaved editor buffers, every keystroke, AI-session completion, Git history or deployed behavior. Coalescing/exclusion/depth/watch/disk limits stay visible. A host capture revision is a recorder sequence, not a semantic whole-app version.

## 6. Execution and unknown outcomes

| Status | UI meaning and allowed action |
| --- | --- |
| Not started | Review approved existing check and exact context; explicit consent required |
| Starting, response not yet confirmed | Operation may be accepted; prevent duplicate execution, protect navigation and drafts |
| Running with acknowledged job | Poll its GET status; never retry POST automatically |
| Passed / failed | Actual terminal command result; separately record scoped human verdict |
| Error / timeout | Execution failure/unknown coverage, distinct from a failed assertion; may be recorded honestly with an uncertain/unmet verdict and visible unknown scope, never a satisfied/current command result |
| Stale | Keep actual output/exit as historical operation evidence; cannot record as current verification |
| Start response lost / unavailable | Start outcome unknown, potentially executed; never state “did not run” without proof or silently resend |
| Host restarted / acknowledged job evicted | GET 404/410 becomes unknown result; explicit clear/review action; no inferred pass/fail or automatic rerun |

**Required recovery refinement:** an acknowledged job pointer must survive browser reload, bound to originating project/attempt/file/source/manifest. Restoration resumes GET status only against the running host. Host jobs remain session-bound unless a separate durable job backend is implemented. Retain unknown status honestly after host restart/eviction. Keep no-response start outcomes distinct from an acknowledged resumable job. Provider generation and trusted repository execution are separate operations; model output never owns check status.

The first runner exposes approved existing root-package check/test/lint/typecheck scripts. It does not install packages, accept arbitrary browser commands or invoke implicit npm hooks. It executes trusted repository code on this computer; it is not a hostile-code sandbox or an immutable execution snapshot. Other language runners are not connected.

## 7. Error, cancellation and persistence matrix

| Failure / cancellation | Keep | Recovery / prohibited shortcut |
| --- | --- | --- |
| Connection/project-status read fails | Saved browser work and captured source | Mark current host/recording state unknown; reconnect/read retry without pretending old status is fresh |
| File list/source/history read fails | Current selection, query and drafts | Retry that read; no fallback source or fake empty-success state |
| Loading or feed error | Last known data with explicit status | Loading/error is not “starting index captured; no changes” |
| Sharing/check review cancelled | Draft, source, prediction and prior evidence | Stay local; no provider transmission or execution |
| Pending read or teacher request abandoned | Saved evidence and current record | Abort/ignore late completion by operation/attempt; cancellation is not reversal of provider usage |
| Save refused by validation/conflict/capacity | Existing saved record and draft/returned result | Explain refusal; do not show a saved badge or overwrite protected data |
| Genuine storage write fails | Valid new work in this tab | Mark unsaved, export visible work, retry explicit save; leaving/reload requires discard review |
| Corrupt saved JSON | Original raw bytes | Download backup; explicit reset only. No silent overwrite with empty state |
| Another tab changed/reset record | This tab's draft and latest saved data | Reject obsolete save; export/reload after review. Simultaneous cross-tab writes remain unsupported; use one tab |
| History/source context write fails | Exact prior retained history and revision | Atomic rollback; visible coverage/error state, never deletion before failed replacement |
| Provider setup/generation fails or stale response returns | Recorder, drafts, previous valid interpretations | Named failure; explicit retry with new consent as needed; no ambient credential or model fallback |
| Teaching cannot be retained | Valid returned result, if any | Label not recorded and allow individual export; exclude it from saved-history/progress claims |
| Reset fails | Prior saved record and current view | Error; do not show a successful reset or clear draft protection |

## 8. Acceptance register for the new UI

These are concrete journeys to run on an approved disposable project after implementation. A row remains pending until the owner records actual observed results; old tests or static mockups do not certify the new UI.

| ID | Probe / required outcome |
| --- | --- |
| C01 | Cold start, absent host and reconnect: actual project status, protected drafts, no fake connected/recording state |
| C02 | Two differently named folders / readable languages: separate source/records; unsupported parser or runner disclosed |
| C03 | Search/paging/selection with delayed old response: latest request wins; list/source/history failures retry their own read; previous-file versions cannot appear as new-file history |
| C04 | Empty/private/deleted/out-of-range/partial source: safe distinct states; no empty lesson or fabricated source/map |
| C05 | Start with confirmed rule/case; existing question replacement preserves prior record and respects unsaved drafts |
| C06 | Predict with reasoning; duplicate save rejected; draft choice does not auto-submit or reveal/execute an outcome |
| C07 | A→B before observation: reject mismatch, preserve A and permit fresh B question |
| C08 | Already-correct source: unchanged Refresh → Verify → Reflect, with no forced edit |
| C09 | Changed source at Reflect and Complete: old accepted evidence remains reviewable/exportable; new evidence required |
| C10 | Changed imports/config/checks during execution AND after terminal completion before recording/current-result display, queued/reverted saves, partial watcher: real stale/historical/unknown scope labels, no whole-project freshness inference |
| C11 | Approve a command then alter manifest during settling: reject before replacement execution; fresh consent recovers |
| C12 | Running check, lost response, failed status read, acknowledged-job browser reload and host restart: GET-only recovery or explicit unknown; no duplicate execution |
| C13 | Failed/error/timeout command plus uncertain/unmet verdict: reflection available; unresolved requirement remains visible |
| C14 | Same captured source but different question: a late Q1 observe/refresh/teaching/status response cannot write Q2 |
| C15 | Same-page navigation, then leave/reload/reset/example switch with drafts or pending work: correct protection remains |
| C16 | Sharing review/cancel/send, provider disconnect/rotation/cancel/failure: exact context, no secret persistence, stage unchanged, late result rejected |
| C17 | Retention/storage/conflict failure after valid teaching: individually exportable result labelled not recorded; no paid sixth retained request |
| C18 | Reflection saved without transfer: Separate case is current; normalized identical case refused; recorded new answer has no invented observed outcome |
| C19 | Archive/reload/export/search: captured identities and self-report/assistance remain; counts/XP deduplicate historical copies; archived records are review-only |
| C20 | History/refresh/provider capacity full: refuse mutation, preserve evidence and explain export plus explicit reset where supported |
| C21 | Corrupt storage, failed writes, stale serial-zero tab and failed reset: raw/saved/visible work preserved appropriately |
| C22 | More than 20 unrelated feed events after selected-file change: no false unchanged/current label; direct/per-file drift detection still works |
| C23 | Polling/feed unavailable after healthy state: recording/currentness becomes unknown; historical data is clearly retained |
| C24 | Desktop-first 1024/1440px and practical 700–900px split-window use, keyboard and reduced motion: question/source/evidence and every control/dialog/source-map action stay usable. 320/390px and zoom are secondary reflow probes, not phone support; no hidden blocking errors or document overflow. |
| C25 | Prepared records migrated through new navigation: their pages/modes/notes preserved, examples labelled, no merging with generic data |

## 9. Ownership, gaps and release boundary

Root owns this contract and the logic board. UI owner owns components, navigation, operation fences, truthful status/retention labels and browser/accessibility acceptance. Feature owner owns launcher/setup and additive job/source-freshness contracts, domain/host validation and their regression tests. Reuse owner owns source/map adaptations and bounded provenance. Shared schema/caller changes are coordinated before writing; Git staging remains serialized. No push.

A finding is closed only when its affected implementation, callers, UI labels/disabled reasons, persisted/restored/exported evidence, current design/setup documentation and focused verification agree. An owner acknowledgement or a note in this contract is insufficient. Apply only the parts actually affected: the desktop/phone finding requires consistent desktop priority and capability wording, not deletion of working reflow CSS or a new connection feature. Preserve historical receipts while correcting the current contract.

At initial contract creation, **required implementation refinements** are: attempt-bound asynchronous saves, same-page draft protection, operation-specific retry, unknown recording/loading labels, honest non-retained teaching display, acknowledged-job reload recovery, selected-source detection outside the short event feed, and honest freshness after terminal command completion. Assign their exact callers and tests; do not declare them complete merely because this document exists.

Not part of the current design: phone connection/pairing, hosted accounts/sync, standalone installer or coding-tool bridge, automatic AI-session intent capture, semantic transfer grading, course catalogue/scheduling, all-language runners, universal repository size, mastery or independent-authorship certification. Keep these outside controls and availability claims until separately implemented and verified. Human learning/teaching efficacy and live provider access remain unverified.

## 10. Newly authorized source-knowledge backend

The user separately authorized the reuse chat to build a source-knowledge backend in parallel. This is an additional backend slice; the current UI must not claim it is available merely from this proposed interface. Root review covers its contract; reuse owner supplies code and actual proof.

Current owner interface: authenticated GET `/api/projects/:projectId/knowledge?selection=<JSON array>`, 1–5 `{fileId, sourceHash, startLine}` pins, first entry is the reading entry point, query length at most 4096 characters. It uses existing safe source reads, bounded source walkthroughs and ordering. It has no model transmission, stage transition, source edit or command execution. The small `serve.mjs` mount hunk belongs to the reuse owner; shared feature schema and UI changes remain separately owned.

| Gate | Required behavior / proof |
| --- | --- |
| K01 / authority | Mount only after existing Host/Origin/session checks. Reject wrong project, unknown pin fields, unknown/repeated query parameters, invalid identities/ranges and duplicate selected file IDs before collecting source. |
| K02 / identity | Deterministic knowledge identity from stable project/pin/content/range/extraction identities; capture time is metadata, not semantic identity. Returned anchors/order/edges resolve only to validated selected source. |
| K03 / freshness | Read sequentially and recheck pinned hashes/ranges; reject the stale selected batch. Label capture optimistic/non-atomic across files, not a runtime/whole-project/atomic Git snapshot. Test drift between collection and recheck. |
| K04 / interpretation | Static selected-file concepts and relative import/re-export candidates only. External/dynamic/alias/ambiguous/partial paths remain explicitly unknown, not broken or invented. Supported empty/parser-failure states are distinct. |
| K05 / ordering | Complete unique entry-first selected-file order and bounded concept order; no missing/duplicate/foreign IDs. Test cycles/disconnected files and ambiguous candidates. Source reading order is a proposal, not a learning/verification grade. |
| K06 / resource and cancellation | One in-flight batch; bounded total budget and declared client-timeout relationship. Stop subsequent source reads on disconnect/timeout, discard late results and release ownership safely. Existing per-file hashing limits alone do not bound a ten-read batch. |
| K07 / exposure and provenance | Preserve donor/license attribution and actual modification mapping. No source upload, model cost, stage advancement or execution from the knowledge GET. UI exposure awaits verified DTO/caller integration; do not silently expand teaching sharing context. |

K01–K07 are additional backend acceptance, separate from C01–C25's current-design journeys. They remain pending until the reuse owner returns the implemented interface and observed checks. A future model-written multi-file explanation would require its own exact context approval and response provenance; it is not authorized by this read-only endpoint.

Independent review at 20:37 IST: 10 service and 12 source-knowledge unit cases pass. K06's fixed 12-second response budget is below the existing 15-second browser GET timeout. A native HTTP probe returned 408 after 12,006 ms, retained the busy slot until the active host read drained, stopped subsequent reads and recovered; a late read failure did not send another response. Cancellation does not interrupt the already-running host hash, which retains its existing 30-second guard. K01 remains open: a wrong-project request returned 404 but performed one source read; the approved-project check must precede collection and a regression must assert zero reads. No browser integration or live provider evidence is claimed by these backend checks.

Subsequent independent recheck at 20:40 IST closes that K01 defect: the host validates the approved project after Host/Origin/session validation and before delegated handlers. The exact protected-API case passes with foreign-project 404 and zero source reads. All 14 current knowledge unit tests pass, including malformed-candidate ambiguity and same-pins/different-project knowledge identity. These proofs concern the bounded backend; UI exposure and optimistic multi-file capture limits remain separate.

The [final backend evidence](backend-knowledge-evidence.json) now records 19 new unit and 10 HTTP cases, the direct 160-line/empty-range bound regression, actual mounted launcher 200→409→200 source-change recovery and retained license mapping. Root verifies all seven recorded source fingerprints. K01–K07 pass within those bounded cases; new multi-file UI exposure and any model-sharing expansion remain unsupported. The [logic board](logic-board.md) separately records 35 executed redesigned-browser checks and partial/unverified C-row coverage; this contract's existence is not blanket release acceptance.
