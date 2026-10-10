# Vadhyar UI finish review — 11 October 2026

## Disposition

Ship the reviewed UI/code correction batch to native acceptance. The synthetic finish review passes; release acceptance remains partial because the revised panel has not been exercised in a trusted native Extension Development Host.

## Fidelity

Reviewed all 17 refreshed captures: four host-theme simulations at 320, 360 and 900px, plus Observe, Verify, both sharing previews and the expanded walkthrough. The Digital Manuscript direction, local type, semantic evidence surfaces, five-step registry and one primary action remain coherent and readable. The header is shorter, requirement controls stay in their disclosure, and the seeded fixture bug is visibly disclosed. The first explanation is concise; the walkthrough now belongs behind Explain further.

## Findings disposition

| Earlier finding | Status | Review evidence |
|---|---|---|
| Relative PNG URL lacked a native resource base | Resolved in code; native verification partial | `src/extension/extension.ts:279–282` supplies a host-issued dist base and restricts `base-uri`, images and fonts to the webview CSP source. |
| Sharing preview hid selected filenames | Resolved | `src/panel/ui.tsx:19–26` shows the selected rule and both actual filenames. `src/panel/workflow.ts:48–54` derives them from the exact payload; unavailable/malformed summaries disable Send. Both refreshed consent captures show the filenames before transmission. |
| Stage/hint focus explicitly prevented viewport reveal | Resolved in code; native keyboard verification partial | `src/panel/app.tsx:48` allows normal browser focus scrolling. No new claim of a native keyboard pass is made. |
| Captures omitted the real walkthrough and current diff prerequisite | Resolved within synthetic scope | `walkthrough-360.png` shows valid expanded controls. `verify-360.png` shows the enabled rerun action with the supplied correlated current diff state. |

## Material fix list

No further code correction is required by this confirmation review. Complete trusted native acceptance for logo/font loading, theme appearance, viewport sizing and keyboard focus. Header compactness improved, but full-page synthetic captures do not establish that the primary action fits a particular native viewport height.

## Boundaries and limits

These captures use synthetic host messages and development data. They are visual evidence, not actual API transmissions, native source navigation, saved learner predictions or executed runner evidence. The implementation team's browser assertions and contrast arithmetic were reported to this reviewer; this reviewer inspected the correction code and captures without rerunning tests or calculations. The native host test reportedly reached activation and then awaited Workspace Trust, so it does not establish revised-panel acceptance.

Skipped tests, API requests, native-host execution and unrelated concurrent work. Remaining risk: the revised asset and focus behavior still need trusted native confirmation.

## Bounded v1.1.0 correction review

Authoritative brief: the user-supplied v1.1.0 attachment. This pass covers only the 680px cap, Confirm registry stage, unavailable controls, visible fixture disclosure and the Break corrections. Fresh v1.1 captures have not yet been reviewed.

**Disposition: fix, then confirm the refreshed captures.** The 680px cap, six-stage registry, quiet unavailable-primary class, visible seeded-bug sentence, collapsed-game unmount, board-blur pause, slower reduced-motion tick and stroke direction icons are implemented in the inspected code.

Material findings remaining at this review point:

- **P2 — Confirm hides the acceptance cases it asks the learner to review.** `src/panel/app.tsx:55,59` leaves the disclosure closed. The v1.1 Confirm state explicitly requires expanded acceptance cases. Show them when Confirm is current.
- **P2 — Reachable callers retain silent native-disabled controls.** `src/panel/reuse-controls.tsx:6,13,25–28` still use the `disabled` attribute without a linked reason, contrary to the new focusable unavailable-control contract. Hide irrelevant boundary actions or use the shared control with an accurate reason.
- **P2 — Some reasons describe prerequisites the host does not have.** `src/panel/app.tsx:57` says Change requires saving a snapshot, although `src/panel/workflow.ts:20` gates on the counterexample's baseline, not checkpoint count. `src/panel/change.tsx:15` gives stale hint links the generic wait-for-operation reason. Use the actual prerequisite or hide an action that cannot become current by waiting.

The inspected `host-acceptance.json` now records trusted activation, panel opening, native source navigation, rejected invalid source ID, requirement/mapping confirmation and storage assertions. This is stronger host evidence than the previous trust-blocked run. It does not establish revised native appearance, font/image loading or keyboard visual behavior. A separate visual launch reportedly remained trust-blocked.

Skipped tests, external calls and native interaction. The arrow rotation's native appearance remains unverified; no CSP failure is asserted from code alone.
