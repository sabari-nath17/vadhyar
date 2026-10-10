# Vadhyar — project submission

## Project

- **Project name:** Vadhyar
- **Short description:** A VS Code learning prototype that connects a requirement to AI-built code and helps a beginner understand, change, and verify one feature themselves.
- **Code repository URL:** https://github.com/sabari-nath17/vadhyar
- **Final submitted implementation commit SHA:** Pending implementation and final submission.
- **Working demo URL or local demo steps:** Verified Gate A development-host steps are in README. Full learning-loop demo is later scope.
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
- **Checks performed and results:** Clean install, typecheck/lint/build and 14 product tests passed. S4 real host and S5 manual live acceptance verified source/Graphify navigation, SecretStorage persistence, exact preview and one validated OpenAI response (8,732 ms; 1,850 tokens), including all three native citation buttons. The isolated S5 automated host retry stopped at trust without fresh acceptance evidence. The seed intentionally fails only the different-client ownership case; correct disposable source passes all three trusted cases.
- **Known limitations:** Gate A passed; the complete learning loop is pending. Role-only seed is intentionally defective; S6 prediction/runner onward, complete demo, VSIX and cross-platform behavior remain pending.
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
