# Vadhyar logic board

14 October 2026, IST. Owner: **Verify Vadhyar product logic**. This is the acceptance register for the three user-designated chats. Findings below describe the inspected working tree, not a published release. Source and design owners keep their existing files; this board owns review and verification only. No push or network exposure is authorized by this review.

## Workstreams and decision rights

| Chat | Owns | Required handoff |
| --- | --- | --- |
| [Plan Duolingo-inspired Vadhyar UI](thread://01a13a8b-f169-77f3-b663-0f7ef970a747?hostId=local) | Approved design implementation, navigation, components and styles | Layout labels and stage/status meaning match supported behavior |
| [Complete browser code reuse](thread://01a13a7c-3a80-7710-a464-98f6657227ab?hostId=local) | Captured source viewer, walkthrough, concepts and map adaptations | Empty/stale/partial source is handled honestly; browsing never executes or advances a lesson |
| [Plan Vadhyar rebuild workflow](thread://01a138f7-13d0-78e0-b3b3-abe8c8e23cf8?hostId=local) | Generic project service, recorder, learning state, provider and feature callers | Reproduced defects fixed at their shared cause with focused regressions |

The logic board reads actual changes and evidence before closing a finding. A message delivered, an owner response, a passing old suite and a proposed fix are separate from a verified correction. Shared records are append-only by each owner; staging and commits remain serialized by their owners.

## Initial findings

All six code findings were reproduced with disposable inputs; reviewers made no shared implementation edits. Status **open / assigned** means the owner received the repro and acceptance test, and the fix has not yet been verified by this board.

| ID / priority | Simple question and observed failure | Owner / smallest correction | Acceptance / status |
| --- | --- | --- | --- |
| L1 / P1 | If code changes between prediction and observation, which version was observed? The reducer assigns the baseline hash even when the learner actually ran changed code. | Feature chose the strict option: reread selected saved source before recording; reject baseline mismatch and start a fresh attempt while retaining the original. | Independent actual A→B execution repro now rejects B as A, retains A prediction, and permits a fresh B attempt. Missing/wrong identities are tested. **Verified working-tree correction; final checkpoint pending.** |
| L2 / P1 | Does a refresh keep a verification that was already saved? At the reflection stage a changed refresh clears the accepted verification without archiving it. | Feature archives accepted evidence before invalidation, including the pre-reflection state; distinct record IDs and activity deduplication work. | Independent manual/script × failed/uncertain matrix retains exact evidence after refresh, persisted restore and export; XP does not duplicate. Deduplicated Workspace prediction count **2/2 tests passed**. **Verified working-tree correction; final checkpoint pending.** |
| L3 / P1 | Can an imported file change while a check runs? An actual dependency changed and recorder revision advanced, yet the selected-file/manifest-only run remained passed. | Feature settles recording first, then freshly validates source/manifest consent; completion checks recorded project-change identity and available coverage. No whole-project guarantee from partial watching. | Independent dependency drift is stale; exact pre-run manifest replacement rejects with 409/no run/no marker; fresh consent recovers and unchanged runs pass. Root's permanent regression **1/1 passed**. **Verified working-tree correction; final checkpoint pending.** |
| L4 / P2 | Can a lesson start without any selected code? A one-line file requested at line 9999 returns an empty reversed range; valid text fields permit a complete manual lesson. | Feature domain rejects empty/whitespace/reversed source; Begin guard inspected. Reuse renders valid empty files without fabricated numbered source. | Viewer tests **11/11 passed**, 19:36 IST. Independent host repro now returns 416; empty files remain browsable but cannot start a lesson. **Verified working-tree correction; final checkpoint pending.** |
| L5 / P2 | Does browsing the same two ranges erase actual older versions? Alternating A/B 22 times retains 20 rows with only two distinct contexts. | Feature deduplicates retained file/hash/range identities before pruning; revisited context becomes newest. Replacement/repair/pruning use a rollback savepoint. | Independent normal retention, insert failure, legacy duplicate repair and nested restart-scan success/failure all preserve expected history/revision. **Verified working-tree correction; final checkpoint pending.** |
| L6 / P2 | Does reset invalidate work in another tab that was never saved? A serial-zero old generation can save after reset because reset removes the stored generation. | Feature persists the new blank reset generation, using existing identity checks. | Independent repro rejects the old serial-zero tab, preserves reset data, permits fresh saves and preserves old data on failed reset. **Verified working-tree correction; final checkpoint pending.** |

Source locations at initial inspection: `prototype/src/project-learning.ts` observation/refresh/start/persistence; `prototype/src/ProjectLesson.tsx` observation/refresh callers; `prototype/project-service.mjs` source-range/history/run completion; `prototype/src/ProjectExplorer.tsx` Begin; `prototype/src/Workspace.tsx` Reset. Locate current spans after owner edits rather than treating old line numbers as permanent.

## Product contracts challenged

| Assumption | Load / if false | Accepted boundary and cheap check |
| --- | --- | --- |
| A phone layout means the phone can use the local project | High: there is no connection to the laptop | Current server binds 127.0.0.1 and rejects other Host/Origin values. Phone connectivity is unsupported. Narrow layouts remain useful on the same computer. Physical-phone tests require a future approved connection mode; do not loosen access controls to satisfy a mockup. |
| Saved locally means shared across devices, browsers or ports | High: the learner appears to lose progress | Host SQLite retains file history; browser localStorage retains attempts at this browser address. Label both owners. Different browsers/devices/ports have separate learning stores; no synchronization/import claim. |
| Automatic recording means lessons silently follow the latest code | High: prediction and outcome cease to refer to the same case | The native recorder follows eligible saved files; the active lesson is a captured source version with explicit refresh. Show newer-source state and retain the original answer. A metadata event is not runtime/build evidence. |
| A selected-file hash describes the whole running application | High: imported code/config/deployed data can change behavior | Capture exact selected file/range and record available project-change signals. Runtime identity and coverage remain self-reported or unknown unless actually instrumented. A source capture is not proof of deployed code. |
| Confirm/Understand are measured learning gates | Medium: the path overstates understanding | They currently describe requirement/case/source setup. Begin enters Predict; optional source exploration/teaching does not prove understanding. Stage badges describe recorded activity only. |
| Any project means every language can execute checks, and any size is verified | High: unsupported projects are promised execution/capacity | Text browsing/manual learning is broad; concepts are bounded JS/TS and execution exposes approved root-package scripts. The measured 10,001-file synthetic case is evidence for that run, not an unlimited-capacity guarantee. |
| Passing a command or answering a different case proves the rule or mastery | High: false learning/correctness claims | Command status, human verdict, assistance and independent transfer remain separate. Separate-case answers are self-reports; activity XP measures activity. Prepared SeatCheck/NovaDesk defects remain disclosed examples. |
| A green old suite proves the new logic cases | High: missing branches pass unnoticed | Existing 52 focused reducer/activity/service/provider tests passed while L1–L3 still reproduced. Each correction requires its own failing-before/passing-after case and callers checked. |

For the generic browser, [feature-contract](../prototype/feature-contract.md), [logic-contract](../prototype/logic-contract.md) and [current setup](../prototype/README.md) describe behavior. [The new UI proposal](design/2026-10-14-duolingo-minimal/DESIGN.md) maps that behavior to screens. Historical extension/prepared-example design contracts must not silently supply automatic execution or fabricated outcomes to the generic browser.

## Dynamic-code decision rule

1. Confirm one requirement and concrete case against a readable selected source. A different rule/case/selection starts another attempt and preserves the old one.
2. Save prediction and reasoning against immutable baseline A before recording an outcome. Source navigation and model teaching do not execute the case.
3. Before recording observation, establish the available saved-source identity. If it changed to B, never label a B outcome as A; explicitly separate the comparison or begin a new prediction. The learner still declares how/where the runtime outcome was observed.
4. Record the outcome separately from expected behavior. No observed failure means there may be no edit to make; unchanged refresh is valid.
5. Edits happen in the original tool. Refresh compares actual source identity, retains earlier accepted evidence, and invalidates current dependent verification. Old records stay historical.
6. Run an approved existing check only after exact consent. Changed evidence is stale; timeout/error/unknown are distinct from failed assertions. Recheck is a new action, never an automatic mutation retry.
7. Record a scoped verdict, assistance and reflection, even when failed or uncertain. A completed record is completed activity on a captured version, not a permanent correctness badge for today's code.

## Verification receipts and remaining gates

- Independent access audit executed the actual same-origin/session service test and static-server Host/path test: **2 passed**. No LAN exposure or physical-phone access attempted.
- Independent dynamic audit executed reducer/activity **21/21** and project/teaching services **31/31**: **52/52 passed**. Its three disposable reproductions demonstrated gaps outside those tests.
- Independent product audit executed real service/domain/storage reproductions for out-of-range source, duplicate context retention and serial-zero reset. No shared implementation edits.
- Reuse owner corrected the source viewer to show Empty file / No source in this range without numbered blank source or reversed bounds, disabled source exploration for missing content, and added a post-await abort fence. Board inspected the current source and reran `prototype/source-concepts.test.ts`: **11/11 passed**, 19:36 IST. This closes the presentation portion of L4 only.
- Dynamic reviewer reran reducer/activity **28/28**, plus independent real A→B observation and manual/script × failed/uncertain archival/restore/export reproductions. L1 and L2 evidence retention pass; L2's prediction-count caller remains open.
- Product reviewer reran the domain file **27/27**, plus empty/reversed/whitespace source and serial-zero reset assertions. L4 domain and L6 pass; host range and distinct-history corrections remain pending.
- Product reviewer then reran host/history service cases **4/4** and independently confirmed 416 out-of-range behavior, empty-file browsing, 20 distinct contexts and newest-position revisit. A forced replacement insert failure still deleted prior history (20→19 contexts); L5 remains open until replacement/pruning are atomic.
- Design contract corrections inspected: same-computer access/phone unsupported, browser/profile/address/port storage, captured versus current source, historical stage badges, conditional phone acceptance and generic-contract precedence are explicit. Corrected static exports and their fresh validation receipt are still pending at this inspection.
- Later design inspection confirms all five corrected SVGs and their local links, including the changed-source path. Root visually inspected `path-source-changed.png`: captured source, browser-owned learning, retained baseline prediction, historical prior outcomes, explicit refresh and no implied new check are visible. The owner's updated validation receipt remains pending.
- L3 reviewer executed the original imported-file drift case: now stale. Nine focused Node checks pass, and the prediction-count helper passes two activity checks. A print-only command replacement during recorder settling still executed without fresh consent (202 then stale), so L3 remains open. No harmful command or shared project was used.
- Final L3 independent rerun after reordering rejects the exact 60ms manifest replacement with 409/no run ID and no replacement marker; fresh consent afterward and unchanged runs complete normally. Original dependency drift remains stale. The permanent pre-start manifest regression still needs to be added by the feature owner.
- Final L5 independent rerun: five normal/fault/restart scenarios and six focused repository checks pass, including exact prior rows and DB/live revision retained after insert failure. The savepoint also works inside the scanner's transaction.
- Root combined checks at 19:52 IST: prototype strict typecheck and lint passed; all four unit files **53/53 passed**. Full local-service suite is running. No full new browser journey is inferred from these results.
- Root local-service suite completed **41/41**, including dependency/config/check changes, queued/partial/lost-watcher states, distinct history and atomic replacement, Host/session/provider/walkthrough boundaries. Prototype build and diff check passed.
- Root took exclusive ownership of one appended 30-line test block, `manifest replacement during recorder settling is rejected before execution`, reusing the existing fixture. It independently passes **1/1**: changed manifest is rejected before a run/marker, then a fresh approved command completes. All prior test-file bytes were preserved; prototype typecheck, focused lint and diff checks passed. The feature owner may include this explicitly authorized test block in its correctness checkpoint.
- Design lane completed its refreshed receipt at **19:56:45 IST**: 30 recorded local links, five SVGs, six raster exports and eleven proposed contrast pairs. Root independently parsed all five SVGs, checked all six PNG signatures/dimensions and 27 direct design/reference links, and inspected the changed-source raster. Design remains proposed; no implemented redesigned UI or physical-phone behavior is claimed.

## Current closeout

All six initial findings are **verified in the current working tree** within the exercised cases. Their scope includes the correction regressions found during review (deduplicated prediction count, atomic history replacement and post-settling consent validation). The three owner handoffs now share the same device, source-version, storage and evidence contracts.

Implementation/reuse owners still serialize their local checkpoints. Root's board and additive review records remain outside their staged ownership; root has not changed the shared index or pushed. The root test block above is explicitly approved for the feature checkpoint. Current checks are working-tree evidence and must not be relabelled as acceptance of an older compiled package or a published release.
- Owner correction receipts, focused reruns and final shared checkpoint identities remain pending. This board will update these entries from actual observed results.

Not checked by this initial board: live OpenAI/teaching quality, a fresh complete browser journey after corrections, physical phone connectivity/usability, million-file capacity, learning efficacy or atomic simultaneous-tab writes. Pending-run reload and selected-source warnings based only on a short event window require a recovery/coverage contract before stronger resume/currentness claims. No automatic monitoring schedule, deployment, push, vault edit or memory update was created.

Earlier stored observations are preserved. Records made before the fresh-source observation guard cannot be retroactively validated against their actual runtime revision; the correction does not convert historical self-reports into executed proof.

## Approved redesign — complete behavior contract

User follow-up: establish all logics while completing the new design. UI implementation is authorized in the design chat. The six initial fixes above remain accepted baseline work; the redesigned UI has additional behavior acceptance, recorded in [the product behavior contract](product-logic-contract.md).

The contract maps nine independent status/data facts, screen/control prerequisites and persistence, all actual lesson transitions, dynamic-code decisions, execution/unknown outcomes and cancellation/recovery to **25 concrete acceptance journeys**. Current code, required UI behavior and future capabilities are distinguished. Root owns the contract/board; UI and feature owners implement their exclusive scopes.

| ID | Required correction or guarantee | Evidence / owner / status |
| --- | --- | --- |
| D1 | Late operations cannot attach to a different question on the same source | Model-level Q1→Q2 observation accepted under old callers; async view/attempt/request fence required. UI owner assigned; feature owner coordinates any shared action schema. |
| D2 | Same-page navigation preserves draft protection; confirmed discard actually clears the abandoned form | Old navigate clears dirty while child draft may remain. UI owner assigned; C15 acceptance pending. |
| D3 | Failed polling/loading/feed is unknown; old healthy recorder data cannot remain current | Old CompanionStatus uses retained watching flag and empty feed fallback. UI owner assigned; C01/C23 pending. |
| D4 | Retry the failed read and bind displayed versions to the selected file | Old explorer shares one error/Retry source and retains old versions on file switch. UI owner assigned; C03 pending. |
| D5 | Acknowledged pending checks survive browser reload; response loss/host restart remain unknown without rerunning | Feature owner owns additive pointer/domain contract, UI owns navigation/start/poll presentation. C12/C15 pending. |
| D6 | Selected-source drift detection survives unrelated events beyond the short feed | Direct host or retained per-file identity required; absence of an event is not freshness. Feature + UI owners assigned; C10/C22 pending. |
| D7 | Path progress and retained teaching/notes/settings reflect actual records | Reflection saved is not separate-case completion; non-retained teaching is labelled; generic/prepared records stay separate. Required UI guarantees, not assumed new features. C16–C20/C25 pending. |
| D8 | Terminal command success cannot remain current evidence after later dependency/config/manifest changes | Current retained job GET does not revalidate completion scope. Preserve actual execution outcome; fresh scope or historical/unknown treatment required before recording/display as current. Feature + UI owners assigned; C10 pending. |

Independent consistency review corrected export scope (accepted ProjectState rather than raw drafts), attempt versus project capacity recovery, static SeatCheck versus runtime NovaDesk provenance, and the actual 3,000,000 JSON string-code-unit limit. It also extended freshness acceptance to changes after a terminal command, not only changes during execution.

The newly user-authorized source-knowledge backend has a separate interface and K01–K07 acceptance in the behavior contract. Reuse owner owns that service/DTO/tests and additive server mount; model/UI exposure is not implied. Independent review at 20:37 IST passes 10 service and 12 unit cases, including the real 12-second deadline, no queued reads, busy ownership until the active read drains and late-error recovery. K01 is still open: wrong project returns 404 after one source read; the owner must move that authority check before collection and prove zero reads.

The new D8 guard exposed a C13 regression under review: `verifyRun` requires current freshness for every terminal result, while the host marks execution error/timeout as unknown. Honest uncertain reflection on an unsuccessful investigation must remain possible without giving unknown evidence a current badge. Feature and UI owners received the exact mismatch; correction and focused proof remain pending.

No new product-suite success is claimed by defining these rules. Existing feature checkpoint `5e2ebc9` and reuse checkpoint `b571397` are actual local owner commits; the redesigned UI acceptance must refer to its own current artifact. Shared index was released by the reuse owner, but active UI/feature writers may create later staged work; inspect before any root checkpoint. No push, phone mode, live provider request, vault edit or memory update.
