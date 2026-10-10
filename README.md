# Vadhyar

**Understand the feature AI built. Make your next change yourself.**

Vadhyar is a planned VS Code extension for beginners and students building personal projects with AI. It connects one requirement to the relevant code, guides a prediction and debugging exercise, and records the learner's edit alongside executed checks.

**Repository:** https://github.com/sabari-nath17/vadhyar-devday-kochi

Created from the [DevDay Kochi hackathon template](https://github.com/anima-regem/devday-kochi-hackathon-template). Read [event rules](RULES.md) and [agent guidance](AGENTS.md). Build project implementation from scratch at the event.

## Current progress

| Area | Status |
| --- | --- |
| Template and repository | Created |
| Product direction and implementation plan | Documented; see [the plan](docs/implementation-plan.md) |
| VS Code extension and NovaDesk fixture | Not implemented |
| Graphify integration and OpenAI runtime coaching | Planned; not runtime-verified |
| Run scripts and dependency versions | Pending implementation |
| Working demo and screenshots | Pending implementation |

## Planned demo

The first version targets NovaDesk, a small milestone application with simulated actors. The requirement is: **only the owning client may approve a milestone**. A disclosed seeded bug omits the ownership check.

Requirement → source walkthrough → learner prediction → observed behavior → learner edit → executed checks → archived-milestone follow-up challenge.

The proposed stack is TypeScript, React, VS Code APIs, Graphify, OpenAI Responses API, and Vitest. These are design choices, not claims of installed or working integrations. See [reuse decisions](docs/reuse-sources.md).

## Repository layout

- `src/` — project implementation, to be added during development.
- `scripts/` — reproducible setup, run and packaging scripts as they become available.
- `screenshots/` — images captured from the actual project as it progresses.
- `docs/` — implementation plan and reuse/source decisions.
- [CHANGELOG.md](CHANGELOG.md) — meaningful development milestones and actual checks.
- [AI_USAGE.md](AI_USAGE.md) — actual Codex contributions.
- [SUBMISSION.md](SUBMISSION.md) — submission details and readiness checklist.

## Run the project

Application run commands are not available yet. No project code, package manifest, or runtime scripts have been added in this setup milestone.

```sh
git clone https://github.com/sabari-nath17/vadhyar-devday-kochi.git
cd vadhyar-devday-kochi
```

When implementation begins, add the exact prerequisites, install/build/run/check commands and sanitized configuration examples here. Keep API credentials out of source control; the planned extension stores the OpenAI key in VS Code SecretStorage.

## Development workflow

Keep all project code in this repository. After each meaningful milestone, update the changelog and AI usage record, commit the coherent change, and push progress. Add screenshots only when they represent actual implemented behavior. The template suggests a meaningful checkpoint about every 30 minutes while actively building.

GitHub account: [sabari-nath17](https://github.com/sabari-nath17). Participant names and final team membership remain to be confirmed.

## Event

[DevDay Exchange Community: Kochi](https://luma.com/z10nz8gp), 10–11 October 2026. Event details and organizer rules remain in [RULES.md](RULES.md).
