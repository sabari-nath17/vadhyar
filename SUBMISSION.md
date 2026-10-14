# Vadhyar — historical hackathon submission record

This archive preserves the original event handoff and its recorded verification limits. It is not the current product release checklist; historical deadlines and eligibility conditions do not apply to ongoing development.

Prepared repository/release handoff following the organizer template. GitHub publication does not by itself confirm organizer receipt.

## Project

- **Project name:** Vadhyar — Understand what you build.
- **Team name:** Vadhyar.
- **Short description:** A local VS Code learning companion that connects confirmed intentions to code, records a prediction before execution, guides a developer-performed change, and preserves actual check evidence.
- **Code repository URL:** https://github.com/sabari-nath17/vadhyar
- **Final submitted implementation commit SHA:** [`4f36cedcb93940e526165fbf94d6681542f54066`](https://github.com/sabari-nath17/vadhyar/tree/4f36cedcb93940e526165fbf94d6681542f54066) — immutable tag `v0.1.1`; prepared for organizer submission, receipt pending.
- **Working demo URL or local demo steps:** [Frozen release v0.1.1](https://github.com/sabari-nath17/vadhyar/releases/tag/v0.1.1), [installation](docs/installation.md), [NovaDesk demo/reset](docs/demo.md), [second-project demo](docs/strengthen-demo.md).
- **Demo access requirements:** macOS Apple Silicon, VS Code 1.140.0+, pinned external Graphify, trusted disposable folder. Live coaching requires account/model access and a key entered only in the masked SecretStorage prompt. No credential is supplied.

## Participants

Team names and roles below were supplied and confirmed by the user. Aravind’s supplied handle does not resolve as a public GitHub profile; the user explicitly asked to retain it as unverified.

| Participant name | GitHub handle | Contribution |
| --- | --- | --- |
| SabariNath S A | [sabari-nath17](https://github.com/sabari-nath17) | Vibecoding management, project logic and vision |
| Aravind | `aravindksubash17` (unverified) | Research, presentation deck and design assistance |

## Run and demonstrate

- **Prerequisites and versions:** Node 26.7.0/npm 11.19.0 verified; supported Node ^22.22.0 / ^24 / >=26; VS Code 1.140.0 arm64; Python 3.10+ (3.13.15 recorded) and graphifyy 0.9.84.
- **Install command:** `code --install-extension /absolute/path/to/vadhyar-0.1.1-darwin-arm64.vsix`. Use separate user-data/extensions-dir options to preserve an ongoing demo.
- **Required environment variable names:** None for the installed local workflow. API key is in SecretStorage; vadhyar.graphifyPath and vadhyar.model are application settings. Separate development live evaluation requires OPENAI_API_KEY and VADHYAR_EVAL_MODEL; it is unrun in this release.
- **Start command:** `node scripts/prepare-demo.mjs /absolute/new/NovaDesk-demo-001`, then `code --new-window /absolute/new/NovaDesk-demo-001` and **Vadhyar: Understand this change**.
- **Demo walkthrough:** Confirm intention → validated source → save prediction → execute disclosed ownership counterexample → grounded hint → developer edit/save → native diff → actual three-case rerun → archived follow-up/four cases → inspect/resume evidence. Experimental Project Guide uses a distinct supporting SeatCheck fixture, reviewed real source and a selected/confirmed existing project test.
- **Checks performed and results:** Typecheck/lint/build exit 0; 38/38 focused checks, 134/134 full tests (29 files, 33.87 s), 6/6 offline validators; production audit zero vulnerabilities. Clean-profile CLI install and eight installed file hashes passed. The installed fixed harnesses/dependencies executed the disclosed ownership failure and corrected three/four-case passes through the checked runner functions, outside VS Code. [Fresh evidence](docs/submission-evidence/verification.json); prior S13/H1/T1 native/live acceptance is separately dated historical evidence.
- **Known limitations or incomplete features:** macOS-arm64 only; prepared NovaDesk and one unrelated fixture are not universal support; script success is not complete PRD compliance; live teaching quality, connected capture and native CodeTour playback are unverified. Panel-v2 and the ongoing video are excluded. Fresh native acceptance of the safety patch remains separate from automated/package checks. No mastery/authorship claims.
- **Libraries, APIs, and public datasets used:** [Source register](docs/reuse-sources.md), [selective reuse](docs/selective-reuse.md), [third-party notices](THIRD_PARTY_NOTICES.md). Graphify, Vitest, OpenAI SDK/Responses, React, Zod and esbuild; CodeTour safe format/schema and OpenSpec convention; development-only Promptfoo.
- **AI usage record:** [AI_USAGE.md](AI_USAGE.md).
- **Development change log:** [CHANGELOG.md](CHANGELOG.md).

## Submission checklist

- [ ] Event-start/eligibility attestation confirmed by participants.
- [x] Team list has two supplied participants, within the maximum of four.
- [x] Codex usage is documented.
- [x] Repository, description and reproducible local demo instructions are supplied.
- [x] Final README/setup, installer and exact checkpoint verified together; four downloaded release assets match local checksums and GitHub digests.
- [x] Fresh release checks and known limits recorded.
- [x] Meaningful changes have dated development records and checkpoints.
- [x] Final implementation committed/pushed with normal Git pushes and exact SHA recorded; earlier published history is preserved.
- [x] Limited credential-pattern/package scan completed; two credential-shaped rejection-test fixtures were identified, with no matches outside those tests. This is not an exhaustive secret audit.
- [ ] Organizers' announced submission method and timing completed. The user reports submission opens after 08:00 AM IST. No form/link or receipt has been supplied; no organizer submission is being made during preparation.

Event reference: [DevDay Exchange Community: Kochi](https://luma.com/z10nz8gp); organizer template records wrap-up by **10:00 AM IST, 11 October 2026**. The user reports submission opens after **08:00 AM IST**. The release was frozen/published before that opening; organizer hand-in remains pending. No completed organizer submission or on-time claim is made without receipt.

## Frozen release identity

- Implementation: `4f36cedcb93940e526165fbf94d6681542f54066` / `v0.1.1`. Main-branch follow-up changes are documentation only.
- [Matching macOS-arm64 installer](https://github.com/sabari-nath17/vadhyar/releases/download/v0.1.1/vadhyar-0.1.1-darwin-arm64.vsix).
- [Matching source ZIP](https://github.com/sabari-nath17/vadhyar/releases/download/v0.1.1/vadhyar-0.1.1-source.zip), [manifest](https://github.com/sabari-nath17/vadhyar/releases/download/v0.1.1/release-manifest.json) and [SHA256SUMS](https://github.com/sabari-nath17/vadhyar/releases/download/v0.1.1/SHA256SUMS).
- [Post-freeze submission packet](https://github.com/sabari-nath17/vadhyar/releases/download/v0.1.1/submission-v0.1.1.md) carries the full implementation SHA; the in-commit template cannot contain its own future commit ID.
- [All 51 requested features and evidence boundaries](docs/feature-coverage.md) and [publication proof](docs/submission-evidence/publication.json).
- Organizer form/eligibility/receipt remain separate and unchecked. No submission has been attempted.
