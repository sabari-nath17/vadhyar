# Approved desktop UI — implementation acceptance

14 October 2026, IST. UI owner: Plan Duolingo-inspired Vadhyar UI. The user authorized implementation of the [approved design](DESIGN.md). Final human review remains pending. This is a same-computer desktop coding companion, used beside an editor/coding tool.

## Delivered surface and preserved behavior

- Path, Project and Notebook replace the connected six-destination presentation. A separate, focused lesson retains Predict → Observe → Change → Verify → Reflect → Separate case. Its progress/path labels derive from `learning-path.ts` and validated attempt state; reflection alone does not complete the separate case.
- The original wordmark/fonts, parchment/ochre/teal palette, labeled circular path, task/source hierarchy, tactile action and small original lotus match the approved direction. No dependency or third-party visual asset was added by this UI slice.
- Source search/pages/ranges/history and the reused single-file walkthrough/map remain available. Source navigation cannot advance a learning action. Generic answers remain free text because the real-project contract has no finite outcome set.
- View/attempt/source fences reject abandoned or superseded responses. Same-page navigation preserves drafts. Draft and accepted-record exports are distinct. Browser write failures retain valid work with unsaved labels. Capacity or newer-tab refusals keep the returned receipt/interpretation separately, without advancing saved progress; export/retry and protection before leaving preserve the only returned copy.
- Direct source-state reads detect drift independently of the short event feed. Failed/reconnecting host status immediately makes recording/receipt scope unknown; execution facts remain visible. Pending checks persist before POST, resume GET only after reload, and become explicitly unknown after host-job loss. Current command verification rereads its receipt. Unknown error/timeout coverage can accompany a truthful uncertain/unmet verdict.
- Original predictions and accepted prior evidence remain historical after explicit refresh. Unmet/uncertain verdicts stay visible in completed Lesson and default Path. A completed question retains explicit source-review access. Short cases/predictions/assistance accept factual entries such as0, false and none; reasoning/evidence remain substantive. Every later step can reopen the confirmed rule/case, filename search states its scope, and the optional teacher explains disabled setup actions. Notebook includes raw command contexts/results, search, reflections and complete export.
- The optional prepared application/data remain separate and unchanged. Its stored pages/modes/notes still use the existing application. Connected page selection was in-memory before this slice; no persisted destination migration or storage reset was needed. No new course, multi-file picker, provider, runner or phone connection was added.

## Primary desktop evidence

Measured in the in-app browser through Computer/Browser controls on a disposable SeatCheck fixture at `http://127.0.0.1:4181`. Its intentionally incorrect initial `>= 0` condition produced an actual failed test; the later `> 0` capture is the corrected QA fixture. These are synthetic QA questions, not a real learner record or learning validation.

| View | Actual browser measurement | Observed result |
| --- | --- | --- |
| Full desktop master | 1440×1000 CSS px; scrollY 0; document width 1440; header x0–1440/y0–84.125; lesson body x200–1368, width1168 | Full wordmark, focused task and source rail; no document overflow |
| Desktop | 1024×900 CSS px | No horizontal document overflow; task and contextual source disclosure reflow |
| Practical coding panel | 900×900 CSS px; task x70–830, width760; action footer y799.333–900 | Readable full-width task; prediction inputs above footer, source follows as contextual disclosure |
| Minimum-window robustness | 320×844 and391×844 CSS px | No horizontal document overflow; same desktop journey remains operable |

The IAB viewport inherited a75% page scale. CSS dimensions were measured instead of assumed. Its raw screenshot exports contained additional native compositor area beyond the web viewport (1920×1333 for the1440 page;1200×1200 for the900 panel). The final PNGs crop only that exterior to the measured page bounds, without resizing or changing UI pixels. Raw JPEGs remain outside the repository under `/tmp/vadhyar-ui-20261014`. A later panel viewport override did not apply to the bound tab (actual1440×1000 remained); that unmatched capture was discarded as900 evidence, and the earlier correctly measured900px receipt remains the panel proof. The page itself filled its measured width; the earlier blank strip/top clipping was a screenshot/scroll artifact, corrected by returning to scrollY0 and checking actual header/body bounds.

Final rendered images were opened with `view_image` in the same comparison pass as the approved desktop lesson and Path concepts:

- [Desktop lesson](/Users/sabarismac/.codex/visualizations/2026/10/14/01a13a8b-f169-77f3-b663-0f7ef970a747/desktop-1440-clean.png)
- [900px coding panel](/Users/sabarismac/.codex/visualizations/2026/10/14/01a13a8b-f169-77f3-b663-0f7ef970a747/panel-900.png)
- [Desktop Path](/Users/sabarismac/.codex/visualizations/2026/10/14/01a13a8b-f169-77f3-b663-0f7ef970a747/path-desktop.png)

Legacy `lesson-mobile`/`observation-mobile` filenames and `validation.json.mobile_artifacts` belong to the earlier static receipt. They mean narrow desktop-window illustrations. They are retained for historical links; the current master and use case are desktop/panel. No phone device frame, LAN/tunnel/pairing, phone journey or phone availability is delivered. The [static receipt](validation.json) predates implementation; its old DESIGN.md hash describes that earlier document, not this authorized revision.

## Fidelity ledger and copy audit

| Comparison | Concept evidence | Render evidence / correction |
| --- | --- | --- |
| Layout and density | Desktop lesson: open task at left, white captured-source rail at right; no global lesson sidebar |1440 measurements match the master composition; source stacks at900 rather than becoming an unreadable third column |
| Typography | Inter interface; teacher/rule serif; separate source monospace | Computed task heading60032px/40px Inter and source13px/26px JetBrains; Path rule uses bundled Playfair600 |
| Palette and controls | Parchment#F4EFE6, ochre#D9A05B, dark bottom lip, restrained teal | Computed enabled primary rgb(217,160,91); scoped tokens, outlines and recorded-activity states match; light-source syntax changed to readable ink; the captured rail wraps authored lines, retaining line numbers, so the actual deciding comparison fits without horizontal clipping (384px client/scroll width) |
| Artwork/container model | Original wordmark and small lotus; flat Path; one adjacent action surface | Wordmark bytes retained/aspect preserved; no books hero or dashboard card grid; path rail connections corrected |
| Navigation/progress | Three destinations and six actual activities |Path/Project/Notebook; registry-derived current/recorded/upcoming/historical labels; Separate case remains current until its answer exists |
| Motion/focus | Immediate source inspection; purposeful task advance, reduced-motion support | Enter saves and advances with heading focus and computed animation `none`; pointer stage fade only follows accepted advancement; focus ring visible in screenshots |
| Source/result proof | Captured context and explicit review, separate from interpretation/outcome | Path/hash/range/time, walkthrough disclosure and real check/consent controls preserved; host-restart scope becomes unknown immediately |

Visible copy was compared against the master. The preserved labels include Your path, Guided/Review, Project, Notebook, What do you expect?, What in the code led you there?, YOUR CAPTURED SOURCE and Save prediction. Intentional contract-driven adaptations: generic task heading instead of the SeatCheck-specific question; free text instead of illustrative booking radios; actual capture time/current source instead of static seeded text; explicit teacher/project-source access; truthful unresolved/unsaved/unknown labels and recovery actions; Separate case replaces the ambiguous New case. The static DESIGN PROPOSAL footer is absent from the working product. The source walkthrough retains its existing Explore source concepts action inside the disclosure. No unrelated UI copy, invented metrics or product journey was added.

## Actual acceptance and limits

| Check | Actual result |
| --- | --- |
| Page identity / meaningful app / framework overlay | Correct local URL and title, real project content, no framework error overlay |
| Console | Final IAB error/warn read was empty; intentionally lost host sessions/jobs were handled by visible recovery states |
| Primary interaction | Source→confirmed question→prediction→self-reported observation→unchanged refresh→actual failed command→unmet verdict→reflection→distinct separate case |
| Records and interruption | Exported unsaved answers/identity; Keep working; saved record export contained command/output/verdict/assistance/separate case; search/empty/reflection views worked; changed-source Complete refresh preserved accepted history |
| Reload and restart | Acknowledged running job survived browser reload with GET-only status; host restart/reconnect produced unknown scope and historical last receipt; five explicit consents produced exactly five fixture execution markers |
| Exact lost-running receipt | `lost-running-dom.txt` shows Last received command status: running, unknown scope, explicit clear/history and blocked verification. Waiting for output is absent. Captured npm output existed and stayed historical, so the empty-output fallback was not used in this probe |
| Independent freshness | After23 unrelated saves, selected-source drift was still shown; original prediction remained attached to baseline |
| Keyboard/window | Enter advancement focused the next task and had no task animation; native dialog Keep working/confirmation and source disclosure/walkthrough were exercised;1440/1024/900/320/391 measurements had no document overflow |
| Automated checks | Before M02/M03, `node prototype/check.mjs`: typecheck, lint,98 unit tests, browser build and66 service tests passed. M02/M03 then passed focused typecheck/lint/build and actual rendered conflict/discovery probes. The final checkpoint rerun is recorded below after the parallel parser change settles |

Independent feature-lane acceptance additionally records30 main-journey checks and5 recovery checks on disposable fixtures, including fixture teaching consent, notebook export and reload. Those are their receipts, not a claim of live provider access by this UI owner. The [logic contract](../../product-logic-contract.md) remains the broader C01–C25 register: actual UI probes above cover parts of it, while retained domain/service regressions cover source privacy, bounds, storage/conflict/capacity, attempt fences, execution freshness and provider failure. Do not read this as every permutation of C01–C25 having been exercised in this lane.

Not exercised here: live OpenAI credentials/generation, screen reader, physical touch hardware, actual OS reduced-motion setting, full200% zoom journey, frame-time profiling, every long-content/error permutation, hosted/cross-device access or learning efficacy. Reduced-motion/focus/scrolling CSS and bounds were inspected; that is not a hardware/performance certification. The root extension suite was not rerun for this browser-only UI slice; extension behavior was not changed.

Applied workflows: Skill Router, Frontend App Builder for faithful implementation/fidelity inventory, Frontend Testing & Debugging for the rendered loop, React Best Practices for primitive effect dependencies/versioned storage and Ponytail for existing controls/fonts/dependencies. The established project/host/domain/reuse contracts were consumed rather than replaced.

## C01–C25 coverage matrix

“Partial browser” means the named UI path was exercised, not every permutation. “Regression/source” means the preserved test/source evidence exists and passed or was inspected; it is not a new browser proof. The referenced tests are included by the98-unit/66-service run; final checkpoint results are recorded separately below.

| Case | Exact evidence and remaining boundary |
| --- | --- |
| C01 | Partial browser: cold connection to4181 and host restart/reconnect retaining records. [Host/session regression](../../../prototype/project-service.test.mjs). Separate absent-host cold-start UI was not captured. |
| C02 | Independent feature-lane fixtures; [domain](../../../prototype/project-learning.test.ts) different-project/language records and [walkthrough](../../../prototype/walkthrough-service.test.mjs) supported/unsupported bounds. Two-language new-UI journey not performed by this lane. |
| C03 | Partial browser: search, selection and source/history reads. [Source consumers](../../../prototype/src/ProjectExplorer.tsx) fence file/source/history requests and retry each failed operation. Delayed-list/source/history failure permutations remain browser-unverified here. |
| C04 | Regression: [host](../../../prototype/project-service.test.mjs), [domain](../../../prototype/project-learning.test.ts), [concepts](../../../prototype/source-concepts.test.ts) and [walkthrough](../../../prototype/walkthrough-service.test.mjs) validate private/empty/range/partial sources. Full new-UI matrix not rerun. |
| C05 | Browser: confirmed question setup and replacement dialog; accepted old attempts retained/exported. Domain archive/capacity guards passed. |
| C06 | Browser: free-text draft and reasoning, export/Keep working, explicit Enter save and next-heading focus; no execution from prediction. Domain duplicate prediction refusal passed. |
| C07 | Regression/source: fresh observation read rejects changed baseline; [ProjectLesson](../../../prototype/src/ProjectLesson.tsx) preserves draft and offers fresh question. New-UI A→B-before-observation repro not captured here. |
| C08 | Browser: actual unchanged refresh advances to Verify without requiring an edit; reflection/separate case still available on unmet verdict. |
| C09 | Browser: Complete-stage drift/refresh archived accepted failed result, reflection and separate case before returning to Verify. Domain also covers Reflect-stage archival. |
| C10 | Regression: [host execution](../../../prototype/project-service.test.mjs) dependency/config/manifest drift, queued saves, partial watch coverage and post-terminal freshness; UI rereads receipt and shows unknown on unavailable host. Full dynamic browser matrix unverified here. |
| C11 | Regression: host preflight rejects changed manifest after settling. Exact command/source/manifest review exercised in browser; timed manifest-replacement browser race not performed here. |
| C12 | Browser: acknowledged-running reload, explicit host restart, unknown/clear, retained historical receipt, no replay. Raw receipts: /tmp/vadhyar-ui-20261014/host-restart-dom.txt and lost-running-dom.txt; marker count5 after5explicit consents. Lost-start/transient-read permutations are additionally covered by domain/independent recovery, not all repeated here. |
| C13 | Browser: actual failed fixture command, explicit not-satisfied verdict, reflection and completed visible unresolved reason. [Domain](../../../prototype/project-learning.test.ts) error/timeout unknown-coverage admission/refusal matrix passed; error/timeout were not forced through this lane’s browser. |
| C14 | Regression/source: domain wrong-attempt callbacks on identical source refused; parent view/attempt/source and lesson mounted/stage guards inspected. Delayed Q1→Q2 browser race remains unverified here. |
| C15 | Browser: same-Project destination left its draft protection intact; subsequent Notebook navigation opened confirmation; Escape kept the exact text. Lesson close/export/Keep working and running-operation navigation also exercised. Reset/example-switch draft permutations not rerun here. |
| C16 | Independent main journey used injected fixture teaching and exact consent. [Teaching service](../../../prototype/teaching-service.test.mjs) consent/cancel/rotation/disconnect/failure/privacy regressions passed. Live OpenAI and full new-UI cancel/rotation matrix unverified. |
| C17 | Regression/source: five-interpretation capacity/retention guards, boolean onResult handled, rejected interpretation remains separately exportable with explicit non-retention label in [TeachingPanel](../../../prototype/src/TeachingPanel.tsx). Actual newer-tab interpretation refusal is now owner-rendered: no text draft, busy=false, response visible even with teacher collapsed, Close/Browse guarded, complete export preserved. [Durable M02 receipt](recovery-evidence.json). Capacity/quota permutations remain separate. |
| C18 | Browser: reflection left Separate case current; distinct case recorded without an invented observed outcome; unmet verdict persisted. Domain normalized-identical-case refusal and [path tests](../../../prototype/learning-path.test.ts) passed. |
| C19 | Browser: archival/reload, search/empty/reflection view, complete record download and inspected export contents. [Activity tests](../../../prototype/activity.test.ts) deduplicate historical copies. Archived resume is not offered. |
| C20 | Regression/source: domain history/refresh/teaching/storage capacity refusals preserve evidence, with existing export/new-question/reset errors. Exhausted-capacity browser states not exercised here. |
| C21 | Regression/source: domain corruption, failed writes, reset generation/conflicts and exportable in-memory state; UI unsaved labels/protection/backup distinction inspected. Actual newer-tab refusal was injected for a returned check and teacher response; saved records stayed protected while returned evidence remained separately exportable. [Receipt tests](../../../prototype/check-receipt.test.ts) cover the actual3MB cap and conflicts without model/points advancement. Browser quota/corruption/reset-fault permutations were not forced. |
| C22 | Browser: selected-file edit followed by23 unrelated saves still produced drift and historical outcomes. [API freshness tests](../../../prototype/project-api.test.ts) and direct source-state host regressions passed; no feed-absence freshness inference. |
| C23 | Browser: after actual host restart, recording/receipt scope became unknown and execution output stayed retained; reconnect had no automatic POST. Feed-only failure retry/source semantics inspected; feed outage permutation not forced here. |
| C24 | Partial browser:1440/1024 desktop,900 panel,320/391 robustness, heading focus, Enter advancement with animation none, Escape/Keep working and source disclosure/walkthrough. Physical touch/screen reader/OS reduced motion/full200% zoom/performance remain unverified. |
| C25 | Regression/source: [prepared App](../../../prototype/src/App.tsx), [model](../../../prototype/src/model.ts) and prepared tests remain unchanged; saved example pages/modes/notes/storage keys preserved. Full legacy-navigation browser exercise not repeated here. |

## Recovery closeout after the first rendered pass

The [durable recovery receipt](recovery-evidence.json) preserves sanitized DOM snapshots, exported synthetic source/question/results, UI source fingerprints and fixture bundle identity. It supersedes temporary-path-only evidence for the following probes.

- An actual accepted check start was refused by a newer-tab serial. The returned job remained separately held, polled through its actual terminal passed output and exported; verification stayed blocked. The saved newer question export contained no refused returned job. Refresh with empty text fields explicitly protected the held receipt, and Keep working retained it. Seven [receipt regressions](../../../prototype/check-receipt.test.ts) additionally prove actual3MB capacity and accept/update conflicts preserve stored bytes, active model and activity points; genuine storage write failure keeps the established memory-only contract.
- M02: a valid injected fixture interpretation was refused after another tab saved a new question. With busy=false and no answer draft, its parent notice stayed visible, replacement generation was disabled, Close and Browse opened the same leave/export guard, and the exported unsaved question contained the full interpretation with source/range/question identity. Keep working retained it even with the teacher disclosure closed. No live OpenAI request was made.
- M03: delayed authenticated check discovery showed Reading existing project checks, HTTP503 showed read failure plus explicit GET retry, and successful empty[] alone showed No supported root-package check. Manual evidence remained available. Fixture execution markers stayed6 before/after this probe; discovery did not run a check. An early fixture response changed the body after headers had been sent and produced an unreadable-schema state; the harness was corrected before the genuine503 receipt. The UI now uses a plain readable-list error for malformed responses.

P07 bounded source-reading work is an independently owned additive slice. This desktop checkpoint does not claim its parser/catalogue or actual-repository comprehension acceptance until its separate integration and checks pass.

## Initial desktop checkpoint validation

Exact staged-tree export passed typecheck, lint, 99 unit tests, build and 70 service tests; no failures/skips. Log: /tmp/vadhyar-ui-20261014/checks-exact-ui-index.log. Only33 owned UI/design/log paths were staged over Engineering baseline894a5ab. SourceReadingBundle imports/source-owned parser changes were excluded. The staged tree was exported into /tmp/vadhyar-ui-checkpoint-20261014 before running checks, so uncommitted parallel code did not enter this gate.
