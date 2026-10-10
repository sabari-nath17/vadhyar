# Vadhyar — project submission

## Project

- **Project name:** Vadhyar
- **Short description:** A VS Code learning prototype that connects a requirement to AI-built code and helps a beginner understand, change, and verify one feature themselves.
- **Code repository URL:** https://github.com/sabari-nath17/vadhyar
- **Final submitted implementation commit SHA:** Pending implementation and final submission.
- **Working demo URL or local demo steps:** Verified Gate A and S6 prediction/counterexample development-host steps are in README. Full learning-loop demo is later scope.
- **Demo access requirements:** Trusted prepared NovaDesk, installed pinned Graphify and user API key entered only in VS Code SecretStorage; never include credentials.

## Participants

| Participant name | GitHub handle | Contribution |
| --- | --- | --- |
| To be confirmed | sabari-nath17 | Repository owner; project contributions will be recorded during development |

Final team membership is not yet recorded. Maximum team size: four.

## Run and demonstrate

- **Prerequisites and versions:** Node 26.7.0/npm 11.19.0, VS Code 1.140.0 arm64, Python 3.13.15 with isolated graphifyy 0.9.84 verified.
- **Install and start commands:** Install/check and Extension Development Host commands are in [README](README.md).
- **Required configuration:** No credentials for fixture/AST extraction; masked SecretStorage key setup is implemented. One live gpt-6-astra request succeeded; other account/model access is unverified.
- **Demo walkthrough:** Requirement, source walkthrough, prediction, ownership counterexample, learner fix, actual checks, archived-milestone challenge, evidence summary.
- **Checks performed and results:** S6 typecheck/lint/build and 21 product tests passed, including actual seed/correct/error/20-second timeout runs. Native S6 acceptance saved a prediction before running the fixed different-client case, showed the expected requirement failure (one executed/two skipped; exit 1; 484 ms), and verified keyboard focus and native source selection. Prior S4/S5 acceptance established real Graphify, SecretStorage persistence and one validated OpenAI response (8,732 ms; 1,850 tokens), including all three citations. The isolated S5 automated host retry stopped at trust; it was not rerun in S6. Correct disposable source passes all three trusted ownership cases in the existing contract test.
- **Known limitations:** Gate A and S6 passed; the complete learning loop is pending. Role-only seed is intentionally defective. The S6 counterexample checks one case, not the entire ownership policy. S7 learner edits/full rerun, S8 result persistence/resume, complete demo, VSIX and cross-platform behavior remain pending. Replacement-key status for later API work was not verified in S6.
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
