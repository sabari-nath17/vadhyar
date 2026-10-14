# Contributing to Vadhyar

Vadhyar helps someone investigate one consequential decision in their own project and retain the reasoning and evidence. Keep contributions focused on that workflow. For a larger change, open a [product improvement issue](https://github.com/sabari-nath17/vadhyar/issues/new/choose) with a concrete task and acceptance criteria first.

## Start locally

Use Git, Node.js 24 LTS or 26, and npm 11.19.0 as pinned in `package.json`. The browser companion needs no API key for source inspection or manual learning. Work only with a trusted local project.

```sh
git clone https://github.com/sabari-nath17/vadhyar.git
cd vadhyar
npm install --global npm@11.19.0 --ignore-scripts
npm ci --ignore-scripts
npm run prototype:start
```

Open the printed local address, normally `http://127.0.0.1:4173`, choose a readable source file in Project and confirm one rule and case. Use another port if that address is already occupied; do not interrupt an existing learner session. See [browser setup and limits](prototype/README.md) for project selection, storage, optional teaching and recovery.

## Make a reviewable change

- Use a focused branch; `codex/` is the repository's agent branch convention.
- Reuse existing controls, contracts and installed dependencies. Preserve error handling, captured identities, original predictions and valid records.
- Add a focused regression for new logic or a reproduced bug. Use disposable synthetic projects; do not run unknown project scripts or use real credentials in tests.
- Preserve [third-party notices](THIRD_PARTY_NOTICES.md), donor mappings and historical evidence. Review any lockfile change and upstream release notes.
- Describe what is implemented, what was actually exercised and what remains unverified. A passed check, static source link or completed activity is not a mastery or whole-project correctness claim.

## Check the change

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run prototype:check
npm run browser:check
node --test scripts/dependency-audit.test.mjs
node scripts/dependency-audit.mjs --output dist/security
```

The prototype command includes its typecheck, lint, unit tests, build and local-service tests. The installer command builds and exercises a fresh portable install using a disposable project. Neither establishes live provider quality or human learning efficacy. For UI changes, also inspect the actual desktop and coding-panel journey. Documentation-only changes require working local links and truthful setup/capability wording.

Dependency installation disables package lifecycle scripts. The locked platform package supplies esbuild's binary; do not blanket-enable install scripts to bypass a setup failure. The dependency gate preserves the complete native audit and production audit in `dist/security`. Its temporary, exact development-tool risk policy does not make the full audit clean: the remaining node-forge advisory affects the pinned Promptfoo/JKS chain and expires on 29 October 2026. New, changed, runtime, unknown or expired findings fail the gate. Review the raw reports, [risk decision](docs/dependency-risk.md) and [maintenance guidance](docs/github-maintenance.md) before a release.

Record the relevant results in the pull request, including failures and omitted checks. Update setup/behavior documentation, [CHANGELOG.md](CHANGELOG.md) and [AI_USAGE.md](AI_USAGE.md) when applicable. Preserve other contributors' changes and stage only intended paths.

## Review and reporting

Open a pull request against `main` with the problem, resulting behavior and actual validation. Resolve CI failures before requesting merge; do not disable gates or automatically merge dependency updates. Repository branch protection is a separate setting, not something this guide or a workflow establishes.

Report ordinary bugs through the [issue form](https://github.com/sabari-nath17/vadhyar/issues/new/choose). Report suspected vulnerabilities using [SECURITY.md](SECURITY.md). Remove private project source, API keys, personal records and sensitive logs from public reports.

Project code is covered by the [MIT license](LICENSE). Third-party code, fonts and adapted material retain their own licenses and attribution. Contributions must be material you have permission to contribute; there is no additional contributor agreement required by this guide.
