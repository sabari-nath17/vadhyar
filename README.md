<p align="center">
  <img src="docs/assets/vadhyar-banner.jpg" alt="Vadhyar — Understand what you build" width="600" />
</p>

# Vadhyar

**Understand the feature AI built. Make your next change yourself.**

Vadhyar is a VS Code learning companion for beginners building with AI. It helps you connect a requirement to its code, understand the logic and make your next change yourself.

Built for [DevDay Kochi](https://luma.com/z10nz8gp). [Event rules](RULES.md) · [Submission](SUBMISSION.md).

<details>
<summary>Project setup, status and development records</summary>

## Current progress

**Development prototype.** The latest recorded milestone is S4; the live OpenAI integration is the remaining Gate A task. The [slice record](tasks/todo.md) and [changelog](CHANGELOG.md) track subsequent build updates.

| Area | Status |
| --- | --- |
| Template and repository | Created |
| Product direction and implementation plan | Documented; see [the plan](docs/implementation-plan.md) |
| Slice status and development instructions | [Task record](tasks/todo.md), [AGENTS.md](AGENTS.md) and [.customrules](.customrules) |
| NovaDesk fixture | Seeded source and trusted ownership harness implemented; disclosed bug retained |
| VS Code extension | S2b thin panel and native source navigation verified |
| Requirement confirmation and source checkpoints | S3 persistence and restart recorded as verified |
| Graphify integration | S4 real extraction and host navigation recorded as verified; four refs and three AST contains relationships |
| OpenAI runtime coaching | Planned; live API gate pending |
| Prediction, learner-edit verification and follow-up flow in the panel | Planned |
| Run scripts and dependency versions | Typecheck, lint, build, product tests and host checks available; versions pinned |
| Complete working demo, screenshots and VSIX | Pending |

## Planned demo

**NovaDesk is the prepared sample project used to demonstrate Vadhyar.** It is a small milestone application with simulated actors. The requirement is: **only the owning client may approve a milestone**. A disclosed seeded bug omits the ownership check.

Requirement → source walkthrough → learner prediction → observed behavior → learner edit → executed checks → archived-milestone follow-up challenge.

The implemented foundations use TypeScript, React, VS Code APIs, Zod, esbuild, Graphify and Vitest. OpenAI Responses API coaching is planned. See [reuse decisions](docs/reuse-sources.md) for sources and attribution.

## Repository layout

- `src/` — extension host and thin React panel.
- `novadesk/src/approval.ts` — pure seeded permission decision.
- `tests/fixture-baseline.test.ts` — three baseline cases, including the disclosed bug.
- `scripts/` — reproducible setup, run and packaging scripts as they become available.
- `screenshots/` — images captured from the actual project as it progresses.
- `docs/` — implementation plan and reuse/source decisions.
- `docs/assets/` — supplied Vadhyar banner and transparent logo, copied without modification.
- [CHANGELOG.md](CHANGELOG.md) — meaningful development milestones and actual checks.
- [AI_USAGE.md](AI_USAGE.md) — actual Codex contributions.
- [SUBMISSION.md](SUBMISSION.md) — submission details and readiness checklist.

## Run the project

Run commands from the repository root. Node must satisfy `^22.13.0 || ^24.0.0 || >=26.0.0`; recorded build checks use Node 26.7.0 and npm 11.19.0. The development extension uses VS Code 1.140.0 on macOS; Python 3.10+ is required for Graphify, with Python 3.13 verified. See [extension launch](#extension-development-s2a) and [Graphify setup](#graphify-setup-and-recorded-s4-evidence) below. There is no hosted demo or installable VSIX yet.

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

No API key is needed for the documented source/checkpoint/graph actions. OpenAI coaching and packaging remain pending. The planned API integration stores its key in VS Code SecretStorage, outside source, logs and the panel.

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

The thin panel opens a validated current source reference using the native editor. Only the prepared single local NovaDesk folder is supported. It rejects unknown IDs, unsaved source/requirement buffers, escaping symlinks and stale references. Refresh the context after relevant edits; regenerate graph references when source changes. API coaching follows in S5.

## Requirement and checkpoints (S3)

Read the requirement in the panel and confirm its displayed revision, then **Save source checkpoint**. Exact allowed source contents, hashes and timestamps are saved atomically in VS Code workspace extension storage; no earlier history is inferred. Restart restores confirmed identity. Refresh after requirement edits and confirm the new revision. Unsaved prepared buffers block actions. Limits: 20 requirement revisions and 20 checkpoints; session-clearing/recovery UI and concurrent hosts are later evidence work.

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

Open only `novadesk` in the Extension Development Host; confirm its requirement, extract source relationships, confirm the proposed mapping and use the source buttons. `npm run test:host` uses the installed macOS VS Code and the isolated `/tmp/vadhyar-host-profile`; trust this prepared folder when prompted. Packaging the Graphify runtime is deferred to S12.

</details>
