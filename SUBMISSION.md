# Vadhyar — project submission

## Project

- **Project name:** Vadhyar
- **Short description:** A VS Code learning prototype that connects a requirement to AI-built code and helps a beginner understand, change, and verify one feature themselves.
- **Code repository URL:** https://github.com/sabari-nath17/vadhyar
- **Final submitted implementation commit SHA:** Not submitted. Local checkpoint `21fdcc9` does not contain the mixed S8–S13 working tree. A reviewed clean checkpoint and authorized publication remain outstanding.
- **Working demo URL or local demo steps:** [Local candidate setup](docs/release.md), [complete demo/reset](docs/demo.md), [installed NovaDesk evidence](docs/s13-evidence/release.json), [second-project rehearsal](docs/strengthen-demo.md). The public website/S7 installer has the narrower scope recorded in [landing release](docs/landing-release.md).
- **Demo access requirements:** Trusted prepared NovaDesk, installed pinned Graphify and user API key entered only in VS Code SecretStorage; never include credentials.

## Participants

| Participant name | GitHub handle | Contribution |
| --- | --- | --- |
| To be confirmed | sabari-nath17 | Repository owner; project contributions will be recorded during development |

Final team membership is not yet recorded. Maximum team size: four.

## Run and demonstrate

- **Prerequisites and versions:** Node 26.7.0/npm 11.19.0, VS Code 1.140.0 arm64, Python 3.13.15 with isolated graphifyy 0.9.84 verified.
- **Install and start commands:** Install `dist/vadhyar-0.1.0-darwin-arm64.vsix`; configure the external Graphify executable; prepare a new folder with `npm run demo:prepare -- /absolute/new/NovaDesk-demo-001`; open it and run **Vadhyar: Understand this change**. See [setup](docs/release.md).
- **Required configuration:** No credentials for fixture/AST extraction or trusted runner/diff; masked SecretStorage key setup is implemented. Live Explain and first hint succeeded with configured gpt-6-astra; other account/model access is unverified.
- **Demo walkthrough:** Requirement, source walkthrough, prediction, ownership counterexample, learner fix, actual checks, archived-milestone challenge, evidence summary.
- **Checks performed and results:** Latest combined tree: typecheck/lint/build, 111/111 tests (24 files, 26.20 s), 31 focused checks and 6/6 offline coach cases passed. S13 installed-profile real Graphify produced four references/three relationships; live explanation/hint validated. Delegated developer edits changed failed ownership/archive counterexamples into actual three/four-case passes. Native diff, reflection, 14-row timeline, exact export and window/extension-host resume verified. H1 added one disclosed unrelated JavaScript project's imported intention, selected source, live grounded explanation, real failed/passed reviewed script, diff and resume; installed VSIX rerun passed its three cases. [Core evidence](docs/s13-evidence/release.json), [latest acceptance](docs/strengthen-evidence/acceptance.json).
- **Known limitations:** macOS-arm64/VS Code 1.140.0 only. Graphify and paid account/model access are prerequisites. Existing named-profile SecretStorage presence was used without copying the key; fully isolated user-data native playback was unavailable. Human teaching-quality/learning claims, separate live evaluation, CodeTour playback, connected capture, live Project Guide grouping/build-plan operations and other repository types remain unverified. H2–H5 optional additions are deferred. Seven high development-tool advisories remain; production audit is zero. Backup is explicitly an edited still-frame NovaDesk native recap, not continuous/live recording or the H1 demonstration. Mixed work remains uncommitted.
- **Libraries and APIs:** Actual pins and remaining reuse/distribution boundaries in [source decisions](docs/reuse-sources.md).
- **AI usage:** [AI_USAGE.md](AI_USAGE.md)
- **Development record:** [CHANGELOG.md](CHANGELOG.md)

## Submission checklist

- [ ] The project implementation started from scratch at the event.
- [ ] Participation was solo or in a team of no more than four.
- [x] Codex development usage is documented.
- [ ] The code repository, short description and working demo are supplied.
- [ ] README setup and demo instructions match the submitted code.
- [x] Actual checks and known limitations are documented.
- [ ] Meaningful changes are documented and committed throughout development.
- [ ] Final implementation is committed and pushed, and its SHA is recorded.
- [ ] No credentials or private data are included.
- [ ] The organizers' submission method and timing have been followed.

The strengthening brief's submission cutoff is **11 October 2026, 06:00 AM IST**. Event reference: [DevDay Exchange Community: Kochi](https://luma.com/z10nz8gp); its separately recorded wrap-up is **10:00 AM IST**. Local readiness is not organizer-confirmed submission.
