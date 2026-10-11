# Judge setup — frozen Vadhyar 0.1.1

**Verified installation target: macOS Apple Silicon. The judge's platform is unknown. Windows, Linux and Intel Mac have not passed this setup gate.** Do not promise that this installer works on every computer. For an unsupported machine, use the already supported presentation machine and recorded evidence while separate compatibility work is arranged.

## Install the prerequisites

- [VS Code](https://code.visualstudio.com/download), **1.140.0+**, in `/Applications` or with its official `code` command available.
- [Node.js](https://nodejs.org/en/download), **22.22+, 24.x or 26+**. Node 23/25 and earlier versions are outside this package's declared range.
- [Python](https://www.python.org/downloads/), **3.10+**, available as `python3`. **Python 3.14.7** is the fresh setup test version; the entire allowed range has not been tested. Prior native Graphify acceptance used Python 3.13.15.
- Git for the checkout below, and Internet access to GitHub/PyPI. Node/Python/VS Code are not silently installed or upgraded by Vadhyar.

## One setup command

Use a new checkout and a setup folder that does not exist. The helper uses Node's standard library; **`npm ci` is not needed for this installation**.

```sh
git clone --depth 1 https://github.com/sabari-nath17/vadhyar.git vadhyar-judge-source
cd vadhyar-judge-source
node scripts/setup-judge.mjs --check
node scripts/setup-judge.mjs --install "$HOME/Vadhyar-judge-001"
```

The helper:

1. Checks the supported OS/CPU and Node/Python/VS Code versions before installing.
2. Creates a new isolated Python environment and installs **`graphifyy==0.9.84`**, checks dependencies and verifies `graphify 0.9.84`.
3. Downloads the unchanged **0.1.1 darwin-arm64 VSIX** and checks its exact size and SHA-256 before installation.
4. Installs into separate VS Code user-data/extensions directories, prepares a fresh disclosed NovaDesk folder and sets `vadhyar.graphifyPath` in that profile.
5. Runs real code-only Graphify extraction with network denied, and checks the packaged ownership runner's expected seeded behavior.
6. Writes `setup-evidence.json` only after these gates pass, then prints the exact command to open that isolated demo.

**The seeded runner diagnostic intentionally reports two passes and one failed ownership requirement:** another client is incorrectly allowed. This is a disclosed bug, not an installation failure, successful requirement, prediction or learner attempt. Run it through the learning workflow after opening the panel to create learner evidence.

Graphify is required for the real source-relationship view and is **not bundled in the VSIX**. The helper installs it separately. Vitest and other production JavaScript dependencies are bundled; judge demo checks do not require installing the development dependency tree. Graphify's checked extraction uses no model tokens and is not a runtime trace.

## Open and connect

Copy the launch command printed by setup. Trust **only the fresh NovaDesk folder** when VS Code asks. Use **Vadhyar: Understand this change**, confirm the requirement, checkpoint source, refresh relationships and confirm the mapping. Follow [the NovaDesk walkthrough](demo.md).

Local source/diff, predictions, trusted checks and session memory do not require an API key. Live coaching requires Internet access, an OpenAI API account with usable credit and access to the selected Responses model. Set application-level `vadhyar.model` to that account's supported model; there is no automatic fallback. Use **Vadhyar: Set OpenAI API key securely** and enter the key only in the native masked prompt. The isolated profile has its own SecretStorage. Never copy credential databases or put a key in chat, source, `.env`, logs or setup commands. Review the exact context before sharing.

Setup does **not** exercise the native panel or make a live OpenAI request. Installation success is not complete product acceptance or proof of learner mastery. Those remaining gates must be demonstrated explicitly on the presentation machine.

## Recovery and a clean repeat

- Unsupported system or old prerequisite: stop, install a supported prerequisite or use the supported presentation machine. Do not bypass the platform check.
- Download/pip/network/timeout error: setup exits nonzero and keeps its partial new folder for inspection; no success evidence is written. Retry with another **new** folder after resolving the stated operation. No existing folder is reset.
- Existing destination: use `Vadhyar-judge-002`, for example. Saved code/session records, Project Guide records and the active development profile are not cleanup targets.
- Python dependencies: use a supported Python; the fresh setup used 3.14.7 and checks the new environment with `pip check`.
- Model/account rejection: check account credit and the selected model through the normal account controls. Do not interpret a rejected request as a successful explanation.

For a repeatable reset, create another fresh setup folder and use its printed launch command. Do not clear or reload an active learner session. [Manual installation](installation.md) remains available; [frozen identities](submission-release.md) and [setup evidence](judge-setup-evidence.json) distinguish prior native acceptance from this new installation test.

## Bounded slice and gates

Goal: make the supported judge setup copyable and diagnostic without changing the frozen runtime, credentials or learner data. Scope: one standard-library helper, tests, instructions and evidence. No new dependencies, platform claims, model routing or extension behavior.

Order: prerequisite/data-preservation tests → fresh isolated installation/Graphify/runner gate → full source checks/offline validators → reviewed documentation. Publish only with explicit authorization. New native panel acceptance and live model/account validation remain separate gates.
