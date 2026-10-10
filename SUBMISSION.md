# Vadhyar — project submission

## Project

- **Project name:** Vadhyar
- **Short description:** A VS Code learning prototype that connects a requirement to AI-built code and helps a beginner understand, change, and verify one feature themselves.
- **Code repository URL:** https://github.com/sabari-nath17/vadhyar
- **Final submitted implementation commit SHA:** Pending implementation and final submission.
- **Working demo URL or local demo steps:** Verified Gate A and Gate B ownership-loop development-host steps are in README. The complete follow-up demo is later scope.
- **Demo access requirements:** Trusted prepared NovaDesk, installed pinned Graphify and user API key entered only in VS Code SecretStorage; never include credentials.

## Participants

| Participant name | GitHub handle | Contribution |
| --- | --- | --- |
| To be confirmed | sabari-nath17 | Repository owner; project contributions will be recorded during development |

Final team membership is not yet recorded. Maximum team size: four.

## Run and demonstrate

- **Prerequisites and versions:** Node 26.7.0/npm 11.19.0, VS Code 1.140.0 arm64, Python 3.13.15 with isolated graphifyy 0.9.84 verified.
- **Install and start commands:** Install/check and Extension Development Host commands are in [README](README.md).
- **Required configuration:** No credentials for fixture/AST extraction or trusted runner/diff; masked SecretStorage key setup is implemented. Live Explain and first hint succeeded with configured gpt-6-astra; other account/model access is unverified.
- **Demo walkthrough:** Requirement, source walkthrough, prediction, ownership counterexample, learner fix, actual checks, archived-milestone challenge, evidence summary.
- **Checks performed and results:** S7 typecheck/lint/build and 36 product tests passed, including five separate Snake tests and real seed/correct/deny-all/error/20-second timeout runs. Gate B used a saved development prediction, real failed counterexample, one validated configured-model hint (5,423 ms; 1,134 tokens), user-performed source edit, inspected native diff and user-triggered full runner (3/3; exit 0; 455 ms). Exact persisted source/diff/prediction hashes match. Prior S4/S5 acceptance established real Graphify, SecretStorage persistence and a validated explanation (8,732 ms; 1,850 tokens), including all three citations. The isolated S5 automated host retry stopped at trust; it was not rerun in S7. Native automation returned stale tab views during S7, so the user clicked the final rerun; its actual panel and stored output were inspected.
- **Known limitations:** Gate A and Gate B passed; this is a guided development acceptance, not evidence of independent understanding. Role-only repository seed is intentionally defective. One live hint level was exercised; all three progression levels have product tests. The S6 counterexample checks one case; the S7 rerun checks the three ownership cases. S8 restart/resume, S9 broader integrity checks, archived transfer/reflection, semantic hint-quality evaluation, complete demo, VSIX and cross-platform behavior remain pending. The S7 checkpoint was verified separately from newer concurrent working-tree changes.
- **Libraries and APIs:** Actual pins and remaining reuse/distribution boundaries in [source decisions](docs/reuse-sources.md).
- **AI usage:** [AI_USAGE.md](AI_USAGE.md)
- **Development record:** [CHANGELOG.md](CHANGELOG.md)

## Submission checklist

- [ ] The project implementation started from scratch at the event.
- [ ] Participation was solo or in a team of no more than four.
- [ ] Codex development usage is documented.
- [ ] The code repository, short description and working demo are supplied.
- [ ] README setup and demo instructions match the submitted code.
- [ ] Actual checks and known limitations are documented.
- [ ] Meaningful changes are documented and committed throughout development.
- [ ] Final implementation is committed and pushed, and its SHA is recorded.
- [ ] No credentials or private data are included.
- [ ] The organizers' submission method and timing have been followed.

Event reference: [DevDay Exchange Community: Kochi](https://luma.com/z10nz8gp). Wrap-up is **11 October 2026, by 10:00 AM IST**.
