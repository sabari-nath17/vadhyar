# Local release candidate

V1 is the prepared NovaDesk learning loop. Project Guide remains separately experimental. This local artifact is built from the current mixed, uncommitted tree, not from the older `21fdcc9` checkpoint. Nothing is committed, pushed or published by this release pass.

The first supported artifact targets **macOS Apple silicon (`darwin-arm64`) and VS Code 1.140.0+**. Its trusted Vitest runner is shipped with its pinned production dependencies and native bindings. Other platforms require a separate package and acceptance run; this is not a universal VSIX.

## Install and prepare

1. Install `dist/vadhyar-0.1.0-darwin-arm64.vsix` with **Extensions: Install from VSIX…**, or `code --install-extension /absolute/path/to/vadhyar-0.1.0-darwin-arm64.vsix`. Reload only the intended demo window if VS Code asks. No Marketplace account is required.
2. Install the separate pinned Graphify prerequisite using Python 3.10+ (3.13 verified). Choose a new environment location; do not relocate an existing virtual environment.

```sh
python3 -m venv "$HOME/.local/share/vadhyar-graphify-0.9.84"
"$HOME/.local/share/vadhyar-graphify-0.9.84/bin/pip" install 'graphifyy==0.9.84'
"$HOME/.local/share/vadhyar-graphify-0.9.84/bin/pip" check
GRAPHIFY_NO_AUTO_REFRESH=1 "$HOME/.local/share/vadhyar-graphify-0.9.84/bin/graphify" --version
```

3. In VS Code **User Settings**, set `vadhyar.graphifyPath` to that environment's absolute `bin/graphify` path. It is an application setting; workspace files and the panel cannot choose an executable. Expected version: `graphify 0.9.84`. Empty uses the source checkout's `.venv-graphify` development fallback, which is not included in the VSIX. Paths cannot include command arguments.
4. From the source delivery folder, with a supported Node version, prepare a **new** disposable folder:

```sh
npm run demo:prepare -- /absolute/new/NovaDesk-demo-001
code --new-window /absolute/new/NovaDesk-demo-001
```

The preparation command needs no dependency installation. It refuses existing destinations. A fresh run uses another new folder; it never resets a saved attempt. The VSIX also contains `novadesk` and `scripts/prepare-demo.mjs` if only the installed extension is available.

5. Trust only this prepared folder using VS Code's normal Workspace Trust prompt. Open **Vadhyar: Understand this change**. Confirm the rule, save a snapshot, refresh relationships, confirm the displayed mapping and follow the native source links.
6. Local prediction, checks, diff, transfer, reflection and memory work without an API key. Explanations/hints need API access: **Vadhyar: Set OpenAI API key securely** opens a masked native prompt and stores only in VS Code SecretStorage. Never put a key in source, Settings JSON, chat or logs. Configure `vadhyar.model` if needed; the currently verified account used `gpt-6-astra`. No automatic model fallback or sign-in is provided in V1.

## Build and verify

Development requires `^22.22.0 || ^24.0.0 || >=26.0.0`; this build used Node 26.7.0 and npm 11.19.0. Keep the locked versions and native optional dependencies.

```sh
npm ci
npm run typecheck
npm run lint
npm run test
npm run build
npm run eval:coach -- --offline
npm run package:vsix
```

VSCE 4.0.0 packages the explicit file allowlist and production dependencies. Development tests/evaluations, Python environments, Graft caches, keys and host-test bundles are excluded. The local candidate has `UNLICENSED` project status; `--skip-license` acknowledges that status, while third-party notices remain included. Secret scanning stays enabled. Do not use `--no-dependencies`, remove the lockfile, or run `npm audit fix --force` to create this candidate.

`npm run test:host` is an older macOS **development-host** check, not clean installed-VSIX acceptance. Its result is distinct from [S13's installed acceptance record](s13-evidence/release.json). Native provenance belongs to that record. Final VSIX/source/backup hashes are in the separate `dist/release-manifest.json` delivered alongside the artifacts. [Rehearsal instructions](demo.md) separate live coaching from local execution and recorded backup evidence.

## Limits

Separate live Promptfoo evaluation credentials are not configured; no live quality evaluation is claimed. Offline response validation is not human teaching-quality review. Active S7 data is protected, general Project Guide native/capture acceptance is separate, and recorded native coaching is not a learner mastery/authorship claim. The initially empty named profile contained only Vadhyar. Named profiles share the existing application SecretStorage entry; only key presence was checked, never its value. A separate isolated user-data install succeeded but native automation could not bind that process. The full rehearsal was therefore performed in the empty named profile. Closing/reopening its window created a new extension-host process and restored byte-identical records; the main Code process was left running to protect S7.

Production dependency audit reported zero vulnerabilities. The full development audit reported seven high advisories in Promptfoo/proxy dependencies; they are excluded from the VSIX and remain a development-tooling limitation. No forced dependency update was applied.
