# Vadhyar

**Understand the feature AI built. Make your next change yourself.**

Vadhyar is a planned VS Code extension for beginners and students building personal projects with AI. It connects one requirement to the relevant code, guides a prediction and debugging exercise, and records the learner's edit alongside executed checks.

**Repository:** https://github.com/sabari-nath17/vadhyar

Created from the [DevDay Kochi hackathon template](https://github.com/anima-regem/devday-kochi-hackathon-template). Read [event rules](RULES.md) and [agent guidance](AGENTS.md). Build project implementation from scratch at the event.

## Current progress

| Area | Status |
| --- | --- |
| Template and repository | Created |
| Product direction and implementation plan | Documented; see [the plan](docs/implementation-plan.md) |
| Slice status and development instructions | [Task record](tasks/todo.md), [AGENTS.md](AGENTS.md) and [.customrules](.customrules); S0b complete |
| NovaDesk fixture | S1a implemented and baseline-tested; disclosed ownership bug retained |
| VS Code extension | Not implemented |
| Graphify integration and OpenAI runtime coaching | Planned; not runtime-verified |
| Run scripts and dependency versions | Typecheck, lint and non-watch baseline tests available; versions pinned |
| Working demo and screenshots | Pending implementation |

## Planned demo

The first version targets NovaDesk, a small milestone application with simulated actors. The requirement is: **only the owning client may approve a milestone**. A disclosed seeded bug omits the ownership check.

Requirement → source walkthrough → learner prediction → observed behavior → learner edit → executed checks → archived-milestone follow-up challenge.

The proposed stack is TypeScript, React, VS Code APIs, Graphify, OpenAI Responses API, and Vitest. These are design choices, not claims of installed or working integrations. See [reuse decisions](docs/reuse-sources.md).

## Repository layout

- `src/` — project implementation, to be added during development.
- `novadesk/src/approval.ts` — pure seeded permission decision.
- `tests/fixture-baseline.test.ts` — three baseline cases, including the disclosed bug.
- `scripts/` — reproducible setup, run and packaging scripts as they become available.
- `screenshots/` — images captured from the actual project as it progresses.
- `docs/` — implementation plan and reuse/source decisions.
- [CHANGELOG.md](CHANGELOG.md) — meaningful development milestones and actual checks.
- [AI_USAGE.md](AI_USAGE.md) — actual Codex contributions.
- [SUBMISSION.md](SUBMISSION.md) — submission details and readiness checklist.

## Run the project

S1a is a testable domain fixture, not a running extension or web application. Use a checkout containing this slice and run commands from its root. Node must satisfy `^22.13.0 || ^24.0.0 || >=26.0.0`; this slice was verified with Node 26.7.0 and npm 11.19.0.

```sh
npm ci
npm run typecheck
npm run lint
npm run test
# Focused, non-watch baseline:
npm run test -- tests/fixture-baseline.test.ts
```

The pure contract is `canApproveMilestone(actor, milestone): boolean`. Actors have an ID and client/freelancer role; milestones have an owning-client ID and active/archived status. The seed checks role only: owner allowed, **different client also allowed (the intentional bug)**, freelancer denied. Baseline tests assert these observations and exercise frozen inputs; green does not mean the ownership requirement is satisfied. Ownership-policy checks arrive in S1b, and archived rejection is a later transfer exercise.

No API key is needed for this slice. Build/package scripts, extension UI, Graphify and OpenAI integration are not implemented. The eventual extension stores its API key in VS Code SecretStorage.

Development tools are TypeScript, ESLint/typescript-eslint and Vitest, with exact versions in package.json and the npm lockfile. TypeScript 6.0.3 stays inside the installed parser's supported range. On the verified npm version, clean installation warns that the optional `fsevents` install script is not approved; non-watch checks succeed without approving it.

## Development workflow

Keep all project code in this repository. After each meaningful milestone, update the changelog and AI usage record and commit the coherent change. Push only when authorized. Add screenshots only when they represent actual implemented behavior. The template suggests a meaningful checkpoint about every 30 minutes while actively building.

GitHub account: [sabari-nath17](https://github.com/sabari-nath17). Participant names and final team membership remain to be confirmed.

## Event

[DevDay Exchange Community: Kochi](https://luma.com/z10nz8gp), 10–11 October 2026. Event details and organizer rules remain in [RULES.md](RULES.md).
