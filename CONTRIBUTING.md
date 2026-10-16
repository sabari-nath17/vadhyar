# Contributing to Vadhyar

Keep contributions focused on investigating one concrete decision in a trusted local project and preserving the learner's reasoning and evidence. For larger changes, open a [product improvement issue](https://github.com/sabari-nath17/vadhyar/issues/new/choose) with a concrete task and acceptance criteria.

## Start locally

Use Git, Node.js 24 LTS or 26, and npm 11.19.0:

```sh
git clone https://github.com/sabari-nath17/vadhyar.git
cd vadhyar
npm install --global npm@11.19.0 --ignore-scripts
npm ci --ignore-scripts
npm start -- --project "/absolute/path/to/your/trusted/project"
```

Open the printed local address, normally `http://127.0.0.1:4173`. Select source in Project and confirm one rule and case. No API key is needed for local reading or manual learning. Use another `VADHYAR_MOCK_PORT` if the port is occupied; preserve existing sessions. [Browser setup](prototype/README.md) explains storage, teaching and recovery.

## Make a reviewable change

- Use a focused branch; agent branches use `codex/`.
- Reuse existing controls, contracts and dependencies. Preserve error handling, captured identities, original predictions, consent and valid records.
- Add focused regressions for new logic or reproduced defects. Use disposable synthetic projects and injected provider transports.
- Preserve [notices](THIRD_PARTY_NOTICES.md), source mappings and historical evidence. Review dependency versions, lockfile changes and upstream release notes.
- State what is implemented, exercised and unverified. Activity, a static link or exit code 0 does not establish mastery or whole-project correctness.

## Verify

```sh
npm run typecheck
npm run lint
npm test
npm run browser:check
node scripts/dependency-audit.mjs --output dist/security
```

`npm test` builds browser assets through its pretest hook, then runs browser unit cases, local-service cases and dependency-gate regressions. `browser:check` builds and exercises a fresh portable install against a disposable project. Use an isolated checkout for builds/tests when another learner is using the shared served bundle. `prototype:start`, `prototype:build` and `prototype:check` remain compatibility aliases for browser development.

For UI changes, inspect the actual desktop and coding-panel journey. Documentation-only changes require valid links, parseable JSON, consistent claims and rule-file line limits. Record failures and omitted checks in the pull request. Update setup/behavior documentation, [CHANGELOG.md](CHANGELOG.md) and [AI_USAGE.md](AI_USAGE.md) when applicable.

Dependency installation uses `npm ci --ignore-scripts`. The locked esbuild platform package supplies its binary; investigate missing binaries rather than enabling all lifecycle scripts. The [strict dependency gate](docs/dependency-risk.md) preserves native full-tree and production JSON reports and rejects findings in either, malformed reports and unavailable audits. No current exception policy exists.

## Review and reporting

Open a pull request against `main` describing the problem, resulting behavior and actual checks. Resolve CI failures and review lockfile/license changes before merging. [Maintenance guidance](docs/github-maintenance.md) records required checks and publication gates; repository settings require separate verification.

Use [GitHub issues](https://github.com/sabari-nath17/vadhyar/issues/new/choose) for reproducible bugs and product proposals. Report vulnerabilities through the [private security process](SECURITY.md). Do not include credentials, private source or personal learning records.

Current source is [MIT licensed](LICENSE). Contributions must preserve applicable third-party copyright and license notices. Earlier native/demo/research work remains in [immutable history](docs/history.md).
