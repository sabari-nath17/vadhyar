<p align="center">
  <img src="docs/assets/vadhyar-banner.jpg" alt="Vadhyar — Understand what you build" width="600" />
</p>

# Vadhyar

**Understand the feature AI built. Make your next change yourself.**

Vadhyar is a VS Code learning companion for beginners building with AI. It helps you connect a requirement to its code, understand the logic and make your next change yourself.

Built for [DevDay Kochi](https://luma.com/z10nz8gp). [Event rules](RULES.md) · [Submission](SUBMISSION.md).

## Website and installation

[Open the website](https://vadhyar-website.vercel.app) · [Download Vadhyar 0.1.0](https://github.com/sabari-nath17/vadhyar/releases/download/v0.1.0/vadhyar-0.1.0.vsix) · [Installation guide](docs/installation.md)

Install through **Extensions → ⋯ → Install from VSIX…**. This first installer requires **macOS Apple Silicon, VS Code 1.140.0+, Python 3.10+ and Graphify 0.9.84**. The guide covers the prepared project, Graphify setup and your own OpenAI API key. API usage is billed separately.

The public 0.1.0 installer packages the completed **S7 milestone learning workflow**. Later work described below belongs to the current development checkout and is not part of that installer. The website walkthrough is illustrative. [Release scope and checks](docs/landing-release.md).

<details>
<summary>Project setup, status and development records</summary>

## Current progress

**Local V1 release candidate.** S1b–S13 implement the NovaDesk loop, archived transfer, persistence, stale evidence, local reflection and handover. The installed macOS-arm64 candidate exercised real Graphify, live explanation/hint, both failed counterexamples, native edits/diffs, three/four-case passes and extension-host resume. Edits in that rehearsal were delegated developer tests. [Install/setup](docs/release.md), [demo/reset](docs/demo.md), [actual evidence](docs/s13-evidence/release.json). The candidate is uncommitted and distinct from the older public S7 installer.

The latest local candidate also contains H1's demonstrated native import/editor fixes and the disclosed SeatCheck Project Guide rehearsal. Its combined tree passed 111 tests, typecheck/lint/build and six offline validators. [Latest acceptance and limits](docs/strengthen-evidence/acceptance.json), [second-project demo/reset](docs/strengthen-demo.md). Optional explain-back, explorer, alternative comparison and Malayalam work is deferred.

| Area | Status |
| --- | --- |
| Template and repository | Created |
| Product direction and implementation plan | Documented; see [the plan](docs/implementation-plan.md) |
| Slice status and development instructions | [Task record](tasks/todo.md), [AGENTS.md](AGENTS.md) and [.customrules](.customrules) |
| NovaDesk fixture | Seeded source and trusted ownership harness implemented; disclosed bug retained |
| VS Code extension | S2b thin panel and native source navigation verified |
| Requirement confirmation and source checkpoints | S3 persistence and restart recorded as verified |
| Graphify integration | S4 real extraction and host navigation recorded as verified; four refs and three AST contains relationships |
| OpenAI runtime coaching | S5 live validated response and all three native citation buttons verified |
| Saved prediction and ownership counterexample | S6 real runner and native keyboard/source flow verified; seed remains a failed requirement check |
| Progressive hints, learner edit, native diff and full rerun | S7 / Gate B verified in the real host; one live hint, user-saved edit and all three ownership cases passed |
| NovaDesk restart/resume | S8 implemented; disposable native panel reopen and extension restart passed |
| NovaDesk stale state and session controls | S9 / Gate C passed; native Cancel/Confirm/reopen and NovaDesk-only scope verified |
| Archived transfer and evidence handover | S10 functional native test passed: separate requirement/prediction, four trusted cases, persisted timeline and Markdown snapshot; no learner-authorship claim |
| Project Guide for ordinary workspaces | One prepared unrelated JavaScript project verified natively: confirmed imported intention, selected source, live grounded explanation, saved diff, reviewed npm check and resume. The T1 follow-up verifies live topic grouping; build-plan calls and connected capture remain unverified. [Reproduce](docs/strengthen-demo.md) |
| Run scripts and dependency versions | Typecheck, lint, build, product tests and host checks available; versions pinned |
| Local release/demo | macOS-arm64 VSIX installed in an initially empty named profile; full native rehearsal and labelled still-frame backup recorded; other platforms unverified |

## Demonstrated NovaDesk flow

### Experimental Project Guide

Run **Vadhyar: Open Project Guide** with one trusted local folder. Start tracking, add/import a feature intention and confirm expected behavior, inspect changes across files, select relevant source, then review context before requesting an explanation or a build plan and copyable prompt. Add a new intention when your idea changes; earlier requirements remain. Source and PRD edits invalidate old guidance. Capture from an agent requires the documented command or hook; it is not automatic interception of every tool. [Usage, capture setup, memory and limits](docs/project-guide.md).

Project Guide uses actual workspace code and the existing OpenAI SDK at runtime. A disclosed SeatCheck fixture exercised one live explanation and native saved-change/check/resume workflow; mock HTTP tests cover other boundaries. This proves that fixture's workflow, not universal repository support, teaching quality or requirement coverage. The prepared six-stage NovaDesk demo is retained separately. [Second-project evidence](docs/strengthen-evidence/acceptance.json).

**NovaDesk is the prepared sample project used to demonstrate Vadhyar.** It is a small milestone application with simulated actors. The requirement is: **only the owning client may approve a milestone**. A disclosed seeded bug omits the ownership check.

Requirement → source walkthrough → learner prediction → observed behavior → learner edit → executed checks → archived-milestone follow-up challenge.

The implemented foundations use TypeScript, React, VS Code APIs, Zod, esbuild, Graphify and Vitest. OpenAI Responses API Explain is verified live. See [reuse decisions](docs/reuse-sources.md) for sources and attribution.

## Repository layout

- `src/` — extension host and thin React panel.
- `novadesk/src/approval.ts` — pure seeded permission decision.
- `tests/fixture-baseline.test.ts` — three baseline cases, including the disclosed bug.
- `scripts/` — reproducible setup, run and packaging scripts as they become available.
- `screenshots/` — images captured from the actual project as it progresses.
- `docs/` — implementation plan and reuse/source decisions.
- `docs/assets/` — supplied Vadhyar banner, copied without modification.
- [CHANGELOG.md](CHANGELOG.md) — meaningful development milestones and actual checks.
- [AI_USAGE.md](AI_USAGE.md) — actual Codex contributions.
- [SUBMISSION.md](SUBMISSION.md) — submission details and readiness checklist.

## Run the project

Run commands from the repository root. Node must satisfy `^22.22.0 || ^24.0.0 || >=26.0.0`; recorded build checks use Node 26.7.0 and npm 11.19.0. The development extension uses VS Code 1.140.0 on macOS; Python 3.10+ is required for Graphify, with Python 3.13 verified. See [extension launch](#extension-development-s2a) and [Graphify setup](#graphify-setup-and-recorded-s4-evidence) below. The local S13 VSIX and rehearsal are described in [release setup](docs/release.md); the separately published website and S7 installer have the narrower scope stated above.

```sh
npm ci
npm run build
npm run typecheck
npm run lint
npm run test
# Focused, non-watch baseline:
npm run test -- tests/fixture-baseline.test.ts
```

The pure contract is `canApproveMilestone(actor, milestone): boolean`. Actors have an ID and client/freelancer role; milestones have an owning-client ID and active/archived status. The seed checks role only: owner allowed, **different client also allowed (the intentional bug)**, freelancer denied. Baseline tests assert these observations and exercise frozen inputs; green does not mean the ownership requirement is satisfied. Ownership-policy checks are supplied by S1b, and archived rejection is a later transfer exercise.

No API key is needed for source/checkpoint/graph actions, prediction, counterexample, diff or ownership rerun. OpenAI Explain and hints require user API access. The local platform-specific package includes the trusted Vitest runtime; Graphify remains an explicit external prerequisite. The API integration stores its key in VS Code SecretStorage, outside source, logs and the panel.

Development tools are TypeScript, ESLint/typescript-eslint and Vitest, with exact versions in package.json and the npm lockfile. TypeScript 6.0.3 stays inside the installed parser's supported range. On the verified npm version, clean installation warns that the optional `fsevents` install script is not approved; non-watch checks succeed without approving it.

## Development workflow

Keep all project code in this repository. After each meaningful milestone, update the changelog and AI usage record and commit the coherent change. Push only when authorized. Add screenshots only when they represent actual implemented behavior. The template suggests a meaningful checkpoint about every 30 minutes while actively building.

GitHub account: [sabari-nath17](https://github.com/sabari-nath17). Participant names and final team membership remain to be confirmed.

## Event

[DevDay Exchange Community: Kochi](https://luma.com/z10nz8gp), 10–11 October 2026. Event details and organizer rules remain in [RULES.md](RULES.md).

## Prepared ownership checks (S1b)

The requirement is in `novadesk/vadhyar-requirement.md`. The extension-owned manifest pins ordinary cases and harness/config hashes in `fixtures/novadesk`. Product tests validate the seed plus disposable correct and incorrect edits; policy failures are not learner successes. Run `npm run test -- tests/scenario-contract.test.ts`. To inspect the disclosed defect directly, run `npm exec -- vitest run --config fixtures/novadesk/vitest.config.ts` (expected exit 1, one ownership failure). The working seed remains unchanged.

## Extension development (S2a)

Run `npm run build`, then `/Applications/Visual\ Studio\ Code.app/Contents/Resources/app/bin/code --new-window --extensionDevelopmentPath="$PWD" "$PWD/novadesk"`. Trust this prepared folder and run **Vadhyar: Understand this change**. `npm run test:host` launches the installed macOS Code executable in the dedicated `/tmp/vadhyar-host-profile` and requires fresh `/tmp/vadhyar-host-evidence.json`. Close other windows using that test profile before running it. Tests never disable Workspace Trust. This host check is macOS-specific; cross-platform setup is not verified.

The thin panel opens a validated current source reference using the native editor. Only the prepared single local NovaDesk folder is supported. It rejects unknown IDs, unsaved source/requirement buffers, escaping symlinks and stale references. Refresh the context after relevant edits; regenerate graph references when source changes. S5 adds the verified live Explain flow below.

## Requirement and checkpoints (S3)

Read the requirement in the panel and confirm its displayed revision, then **Save source checkpoint**. Exact allowed source contents, hashes and timestamps are saved atomically in VS Code workspace extension storage; no earlier history is inferred. Restart restores confirmed identity. Refresh after requirement edits and confirm the new revision. Unsaved prepared buffers block actions. Limits: 20 requirement revisions and 20 checkpoints. S9 supplies memory/clear controls below; general concurrent-host transaction acceptance remains unverified.

## Graphify setup and recorded S4 evidence

Recorded milestone: **2026-10-10T22:44:02+05:30**. These are prior build results; the presentation update does not rerun or extend them.

Real Graphify 0.9.84 integration is verified in VS Code: four source references, three AST contains relationships, current hash checks, learner mapping confirmation and native navigation. Typecheck/lint/build, 12 product tests and real host acceptance passed. Codex implemented the adapter and checks; human teaching/content review is pending. Gate A still needs S5. Initial Graphify auto-refresh affected the existing Pi skill; its exact prior SKILL.md and stock prior references were restored, but prior custom references are unknown. Runtime disables auto-refresh and isolates HOME.

Graphify development prerequisite (Python 3.13 verified):

```sh
python3 -m venv .venv-graphify
.venv-graphify/bin/pip install 'graphifyy==0.9.84'
.venv-graphify/bin/pip check
GRAPHIFY_NO_AUTO_REFRESH=1 .venv-graphify/bin/graphify --version
```

Open only `novadesk` in the Extension Development Host; confirm its requirement, extract source relationships, confirm the proposed mapping and use the source buttons. `npm run test:host` uses the installed macOS VS Code and the isolated `/tmp/vadhyar-host-profile`; trust this prepared folder when prompted. The S13 installed build uses an explicitly configured absolute `vadhyar.graphifyPath`; the Python environment remains external.

## Explain setup (S5 / Gate A verified)

Install with `npm ci --ignore-scripts`, then typecheck, lint, test and build with the named package scripts. In the trusted NovaDesk Extension Development Host, confirm the requirement, capture source, refresh relationships and confirm the mapping. Select **Preview context for Explain** and inspect its exact expandable payload. **Set API key securely** opens a masked native input; press Enter to save only in VS Code SecretStorage. Never paste a key into chat or project files.

**Share this context and Explain** makes one request to OpenAI. The user setting `vadhyar.model` defaults to `gpt-6-astra`. One real request established access to this model for the configured account; other account/model access remains unverified. No fallback is automatic. The request has a 60-second timeout, no retries and a 4,000-token output ceiling. Cancellation stops the local request; provider billing may still apply. Accepted output is rendered as text with native source buttons and measured response ID/latency/token usage. API errors retain checkpoints; retry explicitly. Edits require saving and refreshing context.

S5 checks passed clean install, typecheck/lint/build and 14 product tests. Gate A passed in the actual trusted Extension Development Host: SecretStorage survived restart; fresh Graphify produced four refs/three relationships; one validated `gpt-6-astra` response took 8,732 ms and used 1,850 tokens (1,468 input/382 output); all three returned source buttons opened correct native selections. The isolated-profile automated S5 host retry stopped at Workspace Trust without fresh evidence; manual live acceptance is recorded separately, with no trust bypass. Validated output/metadata are saved atomically in workspace extension storage `gate-a.json`; key contents are never saved there. The complete learning-loop demo remains pending.

## Saved prediction and trusted counterexample (S6)

In the trusted prepared NovaDesk panel, confirm the current requirement, choose **Allow approval** or **Deny approval**, enter your reasoning and select **Save prediction**. The host saves it atomically in the existing workspace session before enabling **Run ownership counterexample**. The runner executes only the existing `other-client-active` case against a copy of the exact current source, with the pinned trusted harness/config and installed Vitest 5.0.3. Panel messages cannot supply a command, path or alternative case. Unsaved source/requirement buffers block execution; changes during a run invalidate its result.

The unchanged seed produces **Different-client ownership check FAILED**: approval allowed, expected denial, one case executed, two skipped and exit 1. The panel compares this observation with the saved prediction, displays source/requirement hashes and opens the checked function in the native editor. A matching prediction does not turn the failed requirement into a success. Runner errors, invalid output and the 20-second timeout show an execution problem with retry, without a learner verdict.

S6 typecheck, lint, build and all 21 product tests passed, including actual seeded/correct/throwing/hung source runs. Native acceptance verified prediction saved before execution, keyboard focus through Save → Run → result → source, and function selection at lines 12–15; the final run took 484 ms. No OpenAI call was made in S6. S7 retains this before-edit observation while refreshing changed source in the current interaction. Complete attempt persistence/resume after restart belongs to S8.

## Progressive hints and learner verification (S7)

After the failed counterexample, select **Preview hint 1** and inspect the exact instruction/evidence payload. **Share this context and request hint** uses the configured `vadhyar.model` and checks SecretStorage before requesting. If no key is stored, the existing masked native prompt opens. Hints progress through a concept, relevant source fields and a debugging action, with a maximum of three. Each accepted hint records its level, source/requirement/prediction identity, actual response ID, model, time and usage. The coach supplies text guidance and a validated source link; it has no source-edit or command tool.

Edit and save `src/approval.ts` yourself in VS Code. Select **Refresh saved source**, then **Open before/after diff**. The native editor compares a read-only captured baseline with your saved file; exact before/after snapshots are recorded. **Run all three ownership checks** uses only the pinned owner/different-client/freelancer suite against the saved source. The table shows required and actual decisions for every case. An incorrect edit remains **FAILED**; errors and timeout report an execution problem without a learner-answer verdict. Earlier observations and hint links are marked historical after an edit.

S7 product checks passed typecheck, lint, build and 36 tests, including the independently added five Snake tests. Real process checks distinguish seed/correct/deny-all/throwing code and timeout. One live configured `gpt-6-astra` hint was validated (5,423 ms; 1,134 tokens), followed by a user-performed saved edit and inspected native diff in a disposable learning copy. The user triggered the real panel rerun: all three cases passed, none skipped, exit 0, 455 ms. Exact hashes correlate the prediction, diff and runner; the repository seed remains unchanged. This guided development acceptance establishes Gate B without claiming independent understanding. Hint/diff/run activity uses the existing atomic workspace session; activity is limited to 60 events and the complete record to 900,000 characters. Restart/resume UI, broader stale-state coverage, semantic hint-quality evaluation, theme variants and packaging remain later slices. Final milestone checks ran on an isolated S7-only build copy; newer concurrent interface/integration work remains in the shared checkout and is excluded from that checkpoint.

## Build Guide and a small Easter egg

The proposed [Build Guide](docs/build-guide-plan.md) extends Vadhyar with one-feature planning and reviewed, copyable coding prompts. It is a plan, not an implemented project mentor. Bounded project/source selection is a prerequisite because the current learning scenario is NovaDesk-specific.

The panel now includes a local **Snake** Easter egg. Open the **🥚** at the bottom, select **Play**, and use arrow keys/WASD or the direction buttons. Escape pauses; **New game** resets. Leaving the game, closing the egg or hiding the page pauses play. Game state resets when the panel reloads; its score is separate from learning records. It makes no OpenAI requests, reads no project files and adds no dependency.

Snake has five passing logic tests and isolated Chromium keyboard/layout checks at 320, 768, 1024 and 1440 pixels. These browser checks use a mock VS Code bridge; the game has not been exercised in the actual Extension Development Host.

</details>

## Selective reuse additions

Vadhyar now provides CodeTour-compatible walkthrough navigation/export, OpenSpec-style requirement import, and a pinned Promptfoo coach evaluation command. Imported scenarios are descriptive and cannot receive a trusted ownership verdict. See [usage, provenance and verification limits](docs/selective-reuse.md).

## NovaDesk session resume (S8)

Vadhyar restores the confirmed requirement/checkpoint, saved prediction and observation, hints, before/after source, reflections, check runs and selected learning step. Save a reflection in Verify to retain it locally; it is not sent to the coach. Unsaved input drafts are not restored.

Schema 1 records migrate to schema 2 in memory and are replaced only after a validated atomic save. Missing legacy observations or check fingerprints remain missing or historical. Source, requirement and trusted-check fingerprints determine whether a saved result is current; interrupted checks require explicit retry. Reopening the panel or extension does not run checks or call OpenAI automatically. Project Guide keeps its separate storage and workflow. [S8 verification and limits](docs/s8-evidence/resume.json) include a disposable native panel reopen and fresh extension-host restart; the active S7 session was preserved. S9 adds the focused integrity controls below.

## NovaDesk stale state and session controls (S9)

Saved explanations, relationships and source links are historical when their source or requirement no longer matches. Navigation requires rebuilt current references; earlier check results require matching source, requirement and trusted harness/config/lock fingerprints. Save edited files, refresh context and explicitly rerun the trusted checks to obtain a current result. A stale pass does not verify current code.

Open Settings for **Show memory location** or **Clear NovaDesk session**. Clearing requires a native confirmation naming the workspace. It removes only NovaDesk learning records, the saved explanation and identified extraction/check scratch data; Project Guide records, workspace source and credentials remain. Credential sign-out is separate. OS Trash is requested when supported. Failed clearing keeps/restores primary records and reports recovery instructions; an ambiguous or interrupted recovery folder is retained for inspection. Do not delete it blindly.

Typecheck, lint, build, all 89 tests and two offline validator cases passed on the combined tree. Disposable filesystem and mocked host checks cover cancel, failure, partial deletion, later-writer conflicts and scope preservation. Final native acceptance passed in a trusted disposable Development Host: Cancel preserved the session, Confirm cleared only NovaDesk, and panel reopening returned to Confirm. Project Guide sentinels, source and credential presence survived. The active S7 records remain unchanged. OS Trash was requested; restoring from it and native failure injection were not exercised. [S9 evidence and limits](docs/s9-evidence/session-controls.json).


## Archived transfer and evidence handover (S10)

After a current pass of all three ownership cases, choose **Start archived transfer challenge**. Vadhyar creates the fixed prepared `vadhyar-transfer.md` requirement only when no conflicting file exists. Confirm the new revision, inspect source and save a prediction before running the owning-client/archived case. Edit the source yourself, save/refresh, open the native diff and rerun all four checks. A deny-all edit still fails the active-owner case. Requirement revisions and earlier attempts remain recorded.

**Evidence so far · timeline and handover** shows saved events with requirement/source/check identities and historical labels. **Export Markdown handover** opens a native save dialog and confirms overwrite. Its inert text is a snapshot of saved evidence, including actual hint counts; it makes no mastery or authorship claim. No API key is required for this flow. [S10 native/automated evidence](docs/s10-evidence/transfer.json) separates the user-saved prediction from the delegated developer test edit.


## Grounded learning topics — development follow-up

Project Guide tracks the captured project broadly and teaches one confirmed decision. Each proposed topic shows its requirement connection, exact current function/condition line, model selection reason, validated Graphify static references and source outside the reviewed context. Confirm the connection or clarify it before focusing the explanation. The saved decision is bound to its requirement/source identities; edits make it historical and disable old links.

This follow-up passed typecheck/lint/build, all **118 tests** and six offline coach validators. A disposable native host exercised live topic grouping and focused explanation, real Graphify, requirement clarification, source/caller navigation, panel reopen, actual extension restart and historical-topic blocking. It remains experimental, uncommitted and **outside the previously packaged installers**. [Plan](docs/learning-topics-plan.md), [evidence and reproduce/reset](docs/learning-topics-evidence/README.md). Static file relationships are incomplete; they are not runtime traces or proof of requirement satisfaction.

## Working browser mock — 14 October 2026

The separate [Vadhyar prototype](prototype/README.md) provides six destinations, source-driven questions, local records and a connected website view. Run `node prototype/launch.mjs --project /absolute/path/to/a/trusted/project`; open http://127.0.0.1:4173. The prepared ownership lesson remains an optional example. It uses existing dependencies and leaves the extension/website bundles unchanged.

The [research and revised product decisions](docs/research/2026-10-14-industry-learning/README.md), [UI critique](prototype/ui-review.md) and [logic/implementation contract](prototype/logic-contract.md) distinguish a working mock from real repository authority or measured learning. Prepared browser checks are not project test execution. Records are local, self-recorded discussion material; use one recording tab and export before reset.


## Local project companion prototype

The browser prototype now opens a trusted local project, follows eligible saved changes, keeps durable metadata/selected-source contexts, and records source-driven questions with scoped manual/script evidence. OpenAI teaching is optional and explicitly consented; its key stays only in host memory. Run `node prototype/launch.mjs --project /absolute/path/to/project`. [Setup, limits and checks](prototype/README.md), [feature contract](prototype/feature-contract.md). NovaDesk remains an optional separate example. This is the source-checkout launcher, not a completed standalone installer or shared extension/plugin bridge.

## Browser source walkthrough adoption — 14 October 2026

The local-project browser now adapts Learn Claude Code's source viewer and manual step controls, ports PocketFlow's concept/relationship/order workflow, and renders a focused read-only map using React Flow `12.12.0`. Select a JS/TS file in Project, then **Explore source concepts**. Exact upstream-file mappings, modifications, retained notices and actual integration limits are in [browser reuse](docs/browser-reuse.md). A changed file rejects its earlier source hash; the map never determines runtime behavior, a requirement verdict or learning progress.
