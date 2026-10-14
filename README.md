<p align="center">
  <img src="docs/assets/vadhyar-banner.jpg" alt="Vadhyar — Understand what you build" width="600" />
</p>

# Vadhyar — Understand what you build

Help a beginner connect an AI-built feature to their intention, investigate one decision, make their own change, and inspect the checks that actually ran.

[Development instructions](AGENTS.md) · [Product plan](docs/implementation-plan.md) · [Current work](tasks/todo.md).

**Requirement → relevant source → prediction → observed behavior → your edit → executed checks → independent follow-up.**

[Install the demo](docs/judge-setup.md) · [Download 0.1.1](https://github.com/sabari-nath17/vadhyar/releases/tag/v0.1.1) · [View the pitch deck](docs/pitch/README.md)

## What you can do

| Feature | What it helps you do |
| --- | --- |
| **Follow your intention into the code** | Confirm a requirement, inspect real Graphify relationships and open validated source locations in the native editor. |
| **Predict before seeing the answer** | Save an outcome and reason before the trusted counterexample runs. Compare your prediction with actual behavior and the required rule. |
| **Investigate with progressive hints** | Review the sharing context and request source-grounded guidance. The coach guides; you make the code change. |
| **Edit, compare and check** | Save your edit, inspect the native before/after diff and rerun the owner, other-client and freelancer cases. Failed requirements remain failures. |
| **Try the next change yourself** | Attempt the archived-milestone follow-up while preserving ownership behavior. Hint use is recorded; a rehearsal does not establish independent mastery. |
| **Keep an inspectable learning record** | Reopen saved context, distinguish current evidence from stale history, add a reflection and inspect the evidence journey or Markdown handover. |

These features form the **prepared NovaDesk learning workflow**. [All recorded features and verification boundaries](docs/feature-coverage.md) are listed separately.

### Project Guide — experimental

For a separate local project, **Vadhyar: Open Project Guide** offers:

- **Feature intentions and history:** add/import an intention, confirm expected behavior and preserve earlier revisions.
- **Changes across files:** capture a baseline, inspect additions/edits/deletions and confirm the relevant source group.
- **One decision to investigate:** suggested topics disclose the requirement, changed function/condition, selection reason, static dependencies and context left unreviewed. Ambiguous requirement connections need confirmation.
- **Reviewed coaching and checks:** preview selected context for an explanation or build plan/prompt; choose an existing project script and approve each execution. Save context for later.

The unrelated **SeatCheck** supporting fixture exercises project tracking, source changes and actual checks. Selected context and static relationships have bounded coverage. A successful script is evidence for that script, not complete PRD compliance or support for every repository. [Project Guide scope and controls](docs/project-guide.md).

## Project overview

- **Project name:** Vadhyar.
- **Short description:** A local VS Code learning companion for beginners building with AI. It connects their intention to source, helps them reason before making their own edit, and preserves evidence of the checks that actually ran.
- **Contributors:** SabariNath S A ([sabari-nath17](https://github.com/sabari-nath17)) and Aravind (`aravindksubash17`, unverified handle supplied by the user). [Historical contribution record](SUBMISSION.md#participants).
- **Working demo:** [Frozen 0.1.1 installer and source](https://github.com/sabari-nath17/vadhyar/releases/tag/v0.1.1), [installation](docs/installation.md), [NovaDesk walkthrough/reset](docs/demo.md), [separate-project walkthrough](docs/strengthen-demo.md).
- **Technology stack:** TypeScript, React, native VS Code APIs, Zod, esbuild, Vitest, Graphify 0.9.84 and the official OpenAI Responses API SDK. Promptfoo is development-only.

**v0.1.1 source checkpoint:** [`4f36cedcb93940e526165fbf94d6681542f54066`](https://github.com/sabari-nath17/vadhyar/tree/4f36cedcb93940e526165fbf94d6681542f54066) · [Complete 51-feature inventory and evidence](docs/feature-coverage.md) · [Prepared submission record](SUBMISSION.md). Later main-branch documentation does not change this installer/source checkpoint.

## See Vadhyar in VS Code

Actual product captures from 11 October 2026: the original 0.1.1 interface in an Extension Development Host, using disposable workspaces. [Capture evidence and limits](docs/product-screenshots/README.md).

### NovaDesk: connect the requirement to the decision

![Vadhyar's confirmed NovaDesk ownership requirement beside the actual approval function in VS Code](docs/product-screenshots/novadesk-requirement-source.jpg)

The prepared fixture deliberately checks only the client role. Vadhyar connects the confirmed ownership requirement to the native source location so the missing decision can be investigated.

<details>
<summary>Saved prediction → failed counterexample → developer edit and actual checks</summary>

![A saved Allow prediction beside the executed different-client counterexample, visibly marked BREAKS RULE](docs/product-screenshots/novadesk-saved-prediction.jpg)

The prediction is saved before execution. Another client is actually allowed; the required outcome is Deny. **The requirement check fails.**

![Native before-and-after ownership diff beside three executed checks that match the ownership rule](docs/product-screenshots/novadesk-native-diff-checks.jpg)

After a **Codex developer rehearsal edit**, the native diff shows the added ownership condition. All three trusted cases match their expected outcomes. This is executed check evidence, not an independent learner assessment.

</details>

### Project Guide: a different project, its own intention and source

![Experimental Project Guide tracking SeatCheck's available-seat intention beside its separate reservation function](docs/product-screenshots/project-guide-intention-source.jpg)

**SeatCheck is a separate JavaScript supporting fixture**, with its own requirement, source and existing tests. The capture shows a confirmed intention, preserved revision history and a project baseline; its starting zero-seat bug is disclosed.

<details>
<summary>Inspect the tracked change and the approved project check</summary>

![SeatCheck's native tracked diff beside its approved npm test result: three tests pass and no requirement-coverage verdict is inferred](docs/product-screenshots/project-guide-native-diff-check.jpg)

A Codex developer edit changes `>= 0` to `> 0`. After native command confirmation, the project's existing test runs: **3 passed, 0 failed, exit 0**. The panel explicitly limits that result to the selected script. No new live coaching request was made for these captures.

</details>

## Install and demonstrate

**Judges: start with [the automated setup and prerequisite checklist](docs/judge-setup.md).** It installs the frozen VSIX and pinned Graphify into new isolated folders and checks real extraction/runner behavior. The supported target is **macOS Apple Silicon**; other systems are unverified. Live coaching still needs secure native key entry and account/model access.

[Download the macOS Apple Silicon VSIX](https://github.com/sabari-nath17/vadhyar/releases/download/v0.1.1/vadhyar-0.1.1-darwin-arm64.vsix) · [Exact artifact/source identities](https://github.com/sabari-nath17/vadhyar/releases/download/v0.1.1/release-manifest.json).

Install using **Extensions → ⋯ → Install from VSIX…**. Prepare a fresh disclosed NovaDesk fixture, trust that folder and run **Vadhyar: Understand this change**.

```sh
git clone --branch v0.1.1 --depth 1 https://github.com/sabari-nath17/vadhyar.git vadhyar-demo
cd vadhyar-demo
node scripts/prepare-demo.mjs /absolute/new/NovaDesk-demo-001
code --new-window /absolute/new/NovaDesk-demo-001
```

**NovaDesk is deliberately prepared material:** simulated actors and a seeded ownership bug. Confirm the requirement → follow current source → save a prediction → execute the counterexample → investigate with a grounded hint → edit/save in the native editor → rerun the three ownership checks → attempt the archived-milestone follow-up → inspect saved evidence. Developer rehearsals are not proof of independent learner mastery.

**Project Guide is experimental and separate.** Open **Vadhyar: Open Project Guide** in one trusted local project. Start tracking, add/import and confirm an intention, select real source, review the exact sharing context, request guidance, make your own edit, and select/approve an existing project check. Earlier guidance becomes historical after relevant changes. See [coverage, capture, memory and limits](docs/project-guide.md).

The checked unrelated SeatCheck project demonstrates that workflow on one distinct supporting fixture. It does not establish universal repository support. A script's successful exit proves that script's behavior; it does not establish complete PRD compliance.

### Run the project

1. **Prerequisites and versions:** macOS Apple Silicon; VS Code 1.140.0+ (enable **Shell Command: Install 'code' command in PATH** for the CLI examples); Node `^22.22.0 || ^24.0.0 || >=26.0.0`; Python 3.10+ and separately installed `graphifyy==0.9.84`. Fresh release tools: Node 26.7.0/npm 11.19.0 and VS Code 1.140.0; packaging verification used Python 3.14.7. Native Graphify acceptance previously recorded Python 3.13.15.
2. **Dependency installation:** `npm ci`. The VSIX includes its pinned production runner dependencies; installed demo checks do not require npm ci.
3. **Environment setup:** set the application-level `vadhyar.graphifyPath` and `vadhyar.model`. The installed workflow requires no environment variables or .env file. Live coaching uses a key entered only in the native masked prompt and stored in VS Code SecretStorage; model/account access and API charges are separate.
4. **Start the project:** `npm run build`, then launch a disposable workspace with `code --new-window --extensionDevelopmentPath="$PWD" /absolute/new/NovaDesk-demo-001`. Do not reload the active learner's window.
5. **Run checks or tests:**

```sh
npm run typecheck
npm run lint
npm run build
npm test -- --maxWorkers=1
npm run eval:coach -- --offline
npm run package:vsix
```

The six offline evaluator cases validate synthetic responses, not live teaching quality. Separate live evaluation credentials are required and are not requested in chat.

### Current status

- **Working features:** prepared NovaDesk ownership and archived transfer; prediction-before-run; progressive hints; validated source navigation; native diff; actual trusted checks; restart/resume; source/requirement/check stale handling; scoped local session controls; reflection and evidence handover.
- **Experimental:** Project Guide intent revisions, source snapshots/diffs, reviewed live guidance, explicitly approved existing checks, saved context and grounded learning topics. Real static Graphify relationships have bounded coverage; model requirement connections require confirmation.
- **Release verification:** typecheck/lint/build, 134/134 tests and 6/6 offline validators passed; clean-profile CLI install and packaged runner behavior passed. Fresh results, source identity and installer hashes are in [the frozen-release record](docs/submission-release.md) and the downloadable manifest. [S13](docs/s13-evidence/release.json), [H1](docs/strengthen-evidence/acceptance.json) and [T1](docs/learning-topics-evidence/README.md) are separately dated historical native/live evidence.
- **Safety patch:** shared common-credential guard, source revalidation after native check confirmation, disabled automatic npm pre/post hooks, and execution errors for cancellation/abnormal termination. The selected script still executes trusted project code and can modify files; Workspace Trust is not a sandbox.
- **Known limitations:** macOS-arm64 acceptance only; paid live API/model access; heuristic secret detection; incomplete static/selected context; unverified native CodeTour playback, connected coding-agent capture and human teaching quality. No mastery, authorship or complete-requirement verdict is inferred.
- **Deferred:** panel-v2 redesign, OAuth/cloud sync, automatic repairs, generalized assessments, comparison and Malayalam review. The frozen release stays available while design work continues.

- **Libraries, APIs, and public datasets used:** [Reuse/source register](docs/reuse-sources.md) · [Third-party notices](THIRD_PARTY_NOTICES.md) · [Selective reuse](docs/selective-reuse.md). CodeTour supplies a safe tour format/schema; OpenSpec supplies the requirement/scenario convention. Their licenses are preserved. Graphify, Vitest and the official OpenAI SDK are used directly. No external public dataset is required; the demo uses disclosed local supporting fixtures.

See [AI_USAGE.md](AI_USAGE.md) for AI assistance and [CHANGELOG.md](CHANGELOG.md) for the development record.

## Project origins

Vadhyar was originally developed for the [DevDay Exchange Community Hackathon: Kochi](https://luma.com/z10nz8gp), held on 10–11 October 2026. It now continues as an ongoing product project.

The original [event rules](RULES.md), [submission record](SUBMISSION.md) and [organizer documentation template](https://github.com/anima-regem/devday-kochi-hackathon-template/tree/416329035c57c5cc82e42289bcf38d9cf5587011) remain as historical provenance. Their deadlines, team limits and event-only requirements do not govern ongoing development. Organizer receipt/eligibility is separate from repository publication. Current work follows [AGENTS.md](AGENTS.md), [.customrules](.customrules) and the [task record](tasks/todo.md).

## Website and earlier release

[Website](https://vadhyar-website.vercel.app) uses an illustrative walkthrough and may link the narrower [0.1.0 S7 installer](https://github.com/sabari-nath17/vadhyar/releases/tag/v0.1.0). That historical release remains available. Use **0.1.1** for the frozen full learning-loop candidate; the redesign is not included.

[AI assistance](AI_USAGE.md) · [Development changes](CHANGELOG.md) · [Slice evidence](tasks/todo.md) · [Implementation plan](docs/implementation-plan.md).


## Historical event pitch deck

The [final hackathon presentation](docs/pitch/README.md) is available as a [PDF](docs/pitch/Vadhyar-Hackathon-final.pdf) and an [editable PowerPoint](docs/pitch/Vadhyar-Hackathon-final.pptx).
