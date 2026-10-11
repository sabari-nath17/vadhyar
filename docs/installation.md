# Install the frozen Vadhyar 0.1.1 demo

Supported target: **macOS Apple Silicon (`darwin-arm64`) and VS Code 1.140.0+**. Other platforms are unverified. This source tag and installer include NovaDesk S8–S13, H1/T1 Project Guide work and the reviewed safety patch. Panel-v2 is separate.

For the shortest supported setup, use [the judge setup helper](judge-setup.md) from the latest source checkout. It installs and checks pinned Graphify as well as the unchanged frozen 0.1.1 VSIX. The frozen tag predates the helper; use the latest source for that command. Manual steps follow.

## Download and install

Download [vadhyar-0.1.1-darwin-arm64.vsix](https://github.com/sabari-nath17/vadhyar/releases/download/v0.1.1/vadhyar-0.1.1-darwin-arm64.vsix). Verify its SHA-256 against the release's SHA256SUMS or release-manifest.json. Use **Extensions → ⋯ → Install from VSIX…**; reload only the intended demo window if requested.

```sh
code --install-extension /absolute/path/to/vadhyar-0.1.1-darwin-arm64.vsix
```

To protect ongoing development/learning windows, install into a separate user-data and extension directory:

```sh
code --user-data-dir /absolute/new/vadhyar-demo-profile --extensions-dir /absolute/new/vadhyar-demo-extensions --install-extension /absolute/path/to/vadhyar-0.1.1-darwin-arm64.vsix
```

The isolated profile has separate storage and may need native secure key entry for live coaching. Never copy credential databases or paste keys into chat/files. Existing user sessions are not a demo reset target.

## Prepare the disclosed sample

```sh
git clone --branch v0.1.1 --depth 1 https://github.com/sabari-nath17/vadhyar.git vadhyar-demo
cd vadhyar-demo
node scripts/prepare-demo.mjs /absolute/new/NovaDesk-demo-001
code --new-window /absolute/new/NovaDesk-demo-001
```

Use the same user-data/extensions-dir options when opening an isolated demo. The destination must not exist; another new folder repeats the original seed without overwriting a saved attempt. NovaDesk deliberately omits ownership in its starting function. Actors are simulated.

## Configure Graphify

Use a new separate Python environment; do not put it inside the learner project or relocate an existing environment.

```sh
python3 -m venv "$HOME/.local/share/vadhyar-graphify-0.9.84"
"$HOME/.local/share/vadhyar-graphify-0.9.84/bin/pip" install 'graphifyy==0.9.84'
"$HOME/.local/share/vadhyar-graphify-0.9.84/bin/pip" check
GRAPHIFY_NO_AUTO_REFRESH=1 "$HOME/.local/share/vadhyar-graphify-0.9.84/bin/graphify" --version
```

Expected version: **graphify 0.9.84**. Set VS Code User Settings `vadhyar.graphifyPath` to its absolute bin/graphify path. Empty uses the source checkout development environment, which is not bundled in the VSIX. No executable arguments may be placed in that setting.

## Open the learning workflow

Trust only the prepared folder. Run **Vadhyar: Understand this change**. Confirm the requirement, capture source, refresh real relationships and confirm the proposed mapping. Follow [the walkthrough](demo.md).

Local predictions, fixed checks, diff, transfer, reflection and memory need no API key. For live explanations/hints use **Vadhyar: Set OpenAI API key securely**; type only in the masked native prompt. SecretStorage keeps the key out of the panel and child processes. Review exact context before every required sharing action. Configure `vadhyar.model` to an account-supported Responses model; no automatic fallback. API charges are separate.

**Vadhyar: Open Project Guide** opens the experimental ordinary-project workflow. Choose and explicitly confirm an existing npm check; implicit npm pre/post hooks are disabled. A selected script may still modify files or run commands. Its successful exit is not full PRD verification.

## Preserve and reset safely

Close/reopen restores workspace-local evidence; relevant edits make earlier results historical. **Clear NovaDesk session** has a native confirmation and preserves source, Project Guide and credentials. It does not restore the seed. For a clean demo, use a new prepared folder. Do not clear/reload an active learner session.

[Exact frozen release](submission-release.md) · [Attribution](../THIRD_PARTY_NOTICES.md) · [Recorded historical native evidence](s13-evidence/release.json). The previous [0.1.0 installer](https://github.com/sabari-nath17/vadhyar/releases/tag/v0.1.0) remains available with its earlier S7 scope.
