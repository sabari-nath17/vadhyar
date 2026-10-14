# Vadhyar: hackathon readiness and adversarial review

## 1. What is being reviewed

The existing NovaDesk learning loop and experimental Project Guide are reviewed for honest evidence, safe context sharing, consent-bound execution and a reliable hackathon demonstration.

**Verdict: enough functionality for a credible hackathon presentation, with limits.** The compelling unit is one intention, one mistaken prediction, one visible edit and the actual checks that follow. Adding more features is lower priority than rehearsing the exact artifact. This is a developer demonstration, not proof of independent learner mastery or universal repository support.

Scope: checkpoint `102a1ecce30f8bd512f4ba46bbcbac181438ae9a`, branch `codex/panel-v2-phase0`, plus the narrowly owned fixes below. The parent panel-v2 work is concurrent and excluded from this review's verification. No native window, existing learning record, credential, Git index, branch or installed artifact is changed by this pass. No API request is made.

### Capability and presentation claims

| Claim | Evidence inspected | Presentation boundary |
| --- | --- | --- |
| NovaDesk supports requirement → source → prediction → observation → edit → checks → transfer → saved evidence | [S13 native acceptance](s13-evidence/release.json), [task record](../tasks/todo.md) | Recorded installed macOS-arm64 acceptance; deliberately prepared bugs and delegated developer edits. Not fresh acceptance of panel-v2. |
| Project Guide works outside NovaDesk | [H1 acceptance](strengthen-evidence/acceptance.json) | One separately prepared JavaScript SeatCheck project: live explanation, real failing/passing npm check, source diff and restored context. Not every repository. |
| Topics disclose the requirement, exact decision, rationale, dependencies and reviewed coverage | [T1 evidence](learning-topics-evidence/README.md) | Recorded live grouping/explanation and real Graphify static links. T1 is outside earlier installers; links are neither runtime traces nor complete dependencies. |
| A check result supports an observed outcome | Actual test/check records and source identities | Exit zero proves that selected script's success; it does not establish complete PRD compliance. |
| Vadhyar makes the user understand their code | Not established by available evidence | Describe the learning flow and preserved evidence. Do not claim mastery, measured learning gain, independent authorship or teaching-quality validation. |
| Every current feature is available in the downloadable extension | Contradicted by README's public S7 versus local development distinction | Identify the exact installed/demo build. Do not demonstrate local features and imply the older public package contains them. |

Assumptions: the presentation uses this team's own machine and the stated macOS prerequisites. The organizer's actual judging rubric and presentation duration were not supplied. Readiness here does not certify event eligibility, submission completion, cross-platform support or the parent redesign.

## 2. Six hostile reviewers

| Reviewer | Sharp challenge | Question they will demand an answer to |
| --- | --- | --- |
| Skeptical hackathon judge | An explanation panel alone resembles a generic AI wrapper. | Can you show a committed prediction being contradicted by execution, followed by an edit and changed results? |
| First-time builder | Two workflows and many controls can obscure the next useful action. | Which single decision am I investigating, and what should I do immediately after the counterexample? |
| Privacy engineer | A masked API key does not protect a quoted credential literal embedded in project context. | Which data is actually shared, and does the guard still work after JSON serialization? |
| Platform reliability engineer | A confirmation can become stale; a command can be cancelled or killed. | Does execution still match the reviewed source, and can an interrupted process appear completed? |
| Test engineer | A green check can test the wrong behavior or miss requirements. | Which cases really ran against which source and check definition, and what remains outside their coverage? |
| Learning researcher | Developer rehearsal and model feedback are not learning evidence. | Can an independent beginner explain and make the next change without assistance, and what was actually measured? |

## 3. Ranked risks and demonstrated defects

Scores are reviewer judgments on a 1–5 likelihood/impact scale, not measured probabilities. They prioritize the unpatched snapshot and remaining demonstration risks.

| Rank | Risk | L × I | Why it is easy to miss | Early warning signal | Action/status |
| --- | --- | --- | --- | --- | --- |
| 1 | Private context escapes the common-pattern guard | 4 × 5 = 20 | Raw assignment tests missed closing quotes in JSON keys and escaped prediction text. | A configuration containing a synthetic quoted password remains captured or previewable. | **Fixed:** shared guard for both coaches/model consumers, raw/serialized quoted fields, manifest withholding. The guard remains heuristic; context still needs review. |
| 2 | Execution exceeds the source/command that was approved | 4 × 5 = 20 | Happy-path confirmation does not edit source while a dialog is open; npm silently runs pre/post hooks. | A dirty or newly saved source file still starts a check; pretest/posttest side-effect markers appear. | **Fixed:** recapture/revalidate after explicit confirmation, reject changed/dirty source, suppress automatic npm hooks and disclose that choice. A reviewed script itself can still modify files and call other commands. |
| 3 | Presentation overclaims learning, graph coverage or requirement compliance | 4 × 4 = 16 | Citation and exit validation are easy to confuse with semantic correctness. | Narration says “mastered,” “all requirements verified,” or “complete project map.” | **Before presentation:** use the claim boundaries above and identify who made the edit. Human teaching quality and independent transfer remain unverified. |
| 4 | Demonstrated artifact differs from downloaded/rehearsed artifact | 4 × 4 = 16 | Older package evidence and concurrent redesign are both present in the same project history. | A fresh installed profile lacks a shown topic/control, or a link describes old behavior. | **Before presentation:** freeze/rehearse the exact package; do not promote previous acceptance to panel-v2 acceptance. |
| 5 | Abnormal check termination looks like completed execution | 3 × 4 = 12 | Mock children normally return numeric codes; pre-cancelled requests were still spawned. | A signal-terminated child has `kind: completed` with null exit code. | **Fixed:** null exits are execution errors; an already cancelled request never spawns. macOS process-tree behavior is the bounded supported context; Windows is unverified. |

Four fault categories produced twelve failing regression assertions before the changes. Additional manifest coverage was added with the shared fix. No fixture bug was silently repaired and no existing session schema was changed.

### Smallest owned repair

- `src/extension/privacy.ts`: one shared common-pattern guard; `coach.ts` and `project/model.ts` reuse it, preserving the model's existing export and callers.
- `src/project/checks.ts`: withhold private-looking manifests, return a pre-start cancellation error, run only the selected npm script without implicit lifecycle hooks, classify null exits as execution errors.
- `src/project/controller.ts`: require the exact native confirmation choice, refresh saved source and reject source changes/dirty buffers before spawning.
- Three new regression files plus two dialog-race cases in `tests/project-controller.test.ts`; no panel, protocol, persistence migration or dependency changes.

[npm's official configuration documentation](https://docs.npmjs.com/cli/v11/using-npm/config/) states that `ignore-scripts` leaves an explicitly selected run command available while suppressing its pre/post scripts. The regression also executes real local synthetic scripts and verifies the side-effect files.

## 4. Twelve-month pre-mortem

These are hypothetical failure narratives, not predictions or events that occurred.

1. **The demo expands faster than its evidence.** More languages and dashboards are added. A beginner accepts a plausible explanation as truth, runs a narrow green check and ships an incorrect feature. The product is remembered as a confident wrapper. Warning: support claims grow without fixture-independent native evidence, and “current” results no longer show their input identities. Prevention: preserve bounded review, case-specific outcomes and explicit unknown coverage; evaluate teaching separately.
2. **Convenience erodes the execution boundary.** Implicit hooks, changed files during consent and automatic agent capture become normal. A check surprises a user by modifying unrelated files, or source text contains a secret that reaches an API. Trust collapses. Warning: command/context previews do not describe the bytes and operations that actually run. Prevention: keep explicit review, fixed or confirmed commands, source-version checks, timeouts and conservative withholding. Do not market Workspace Trust as a sandbox.
3. **Saved history becomes unusable.** Longer use reaches the documented 20-guide/20-run/50-intention limits. Safe writes reject further records, while packages/docs disagree about available features. Users lose continuity even though old data is preserved. Warning: repeated storage-limit errors or installs missing advertised controls. Prevention: monitor these errors and design an explicit reviewed history/archive policy later; never silently prune records during this patch.

## 5. What to fix before committing/presenting, and what to monitor later

**Before presenting:** complete the proved boundary fixes and checks; use one exact artifact; rehearse fresh disposable NovaDesk and SeatCheck workspaces; show native source/diff and actual outcomes; disclose prepared material/developer edits; keep the older public S7 installer distinction visible. Do not depend on unverified live build-plan, connected capture or CodeTour playback. Existing H1/T1 evidence is historical, not a fresh live rehearsal here.

A three-to-four-minute story is sufficient if the organizer permits that length:

1. Show the concrete intention and disclose NovaDesk's seed.
2. Navigate to the decision, save a prediction, execute the ownership counterexample and pause on the failed requirement.
3. Use one grounded hint, make a labelled developer edit, show the native diff and actual three-case rerun.
4. Switch to the distinct SeatCheck project: its confirmed intention, actual source, grounded explanation, small edit and its explicitly selected check.
5. Reopen saved context. Close on what was intended, investigated, changed and executed; mention the archived follow-up without claiming independent mastery.

**After launch:** monitor unsupported-context/runner/storage errors and source-history limits; review semantic teaching quality with beginners; verify connected capture and additional platforms before claiming them; maintain an artifact/feature compatibility record. These are monitored/planned work, not implemented features in this pass.

### Verification evidence

Recorded at **2026-10-11T07:16:52+05:30**. [Machine-readable results and owned-file identities](red-team-evidence/checks.json). The isolated review contains only checkpoint `102a1ec` and this patch. It is not the concurrently edited panel-v2 tree.

| Check | Actual result |
| --- | --- |
| Before-fix regression batch | 12 failed / 12 passed; four files, exit 1 |
| Shared privacy/caller batch | 27/27 passed; four files |
| Safety + second-project batch | Initial run: 25 passed, one existing subprocess test timed out at 5 s during concurrent checks. Sequential rerun: 26/26 passed, 3.14 s; no timeout relaxation. |
| `npm run typecheck` | Exit 0 after each implementation batch |
| `npm run lint` | Exit 0 after each implementation batch |
| `npm run build` | Exit 0; output confined to the isolated copy |
| `npm test` | **134/134 passed, 29 files, 26.82 s**, start 07:13:22 IST |
| `npm run eval:coach -- --offline` | **6/6 passed**, zero failures/errors/API requests; synthetic validators, not live teaching evaluation |

The npm-hook regression uses actual child processes and side-effect marker files. Dialog races and process-event errors use the existing mock host/EventEmitter boundary. The full suite retains real prepared ownership/transfer runner checks, including the intentionally hung-source timeout. No credential value is accessed and no existing learner source is edited.

The guarded source patch remains **uncommitted** alongside parent UI work. Before staging or packaging, review only intended ownership and rehearse the resulting exact artifact; no commit or push occurred here.

### Applied-checkout verification — 2026-10-11T07:25:32+05:30

After guarded application, this working checkout independently passed the 26-test focused batch (1.91 s), `npm run typecheck`, `npm run lint`, and **134/134 tests / 29 files / 28.80 s**, start **07:18:49 IST**. All owned source/test SHA-256 values still match the isolated verified patch. Checkout `dist` was not rebuilt; bundle/offline validation remains explicitly the isolated-copy result. These checks do not establish native or visual acceptance of the parent's concurrent redesign. Documentation drift about project Graphify and truncated grouping context was corrected with links to the distinct recorded H1/T1 evidence.
