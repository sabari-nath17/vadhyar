# Install Vadhyar 0.1.0

**Early NovaDesk demo for macOS on Apple Silicon.** Requires VS Code 1.140.0 or newer and Python 3.10+. This release packages the completed S7 source checkpoint. Later Project Guide, transfer, resume and design-v2 extension work are not part of this installer. The landing page follows design-v2 visually; its walkthrough is an illustration.

## 1. Download and install

Download `vadhyar-0.1.0.vsix` from [the GitHub release](https://github.com/sabari-nath17/vadhyar/releases/tag/v0.1.0).

In VS Code, open **Extensions**, choose the **⋯** menu, then **Install from VSIX…** and select the file. If requested, reload VS Code. This is a GitHub-distributed VSIX, not a Marketplace listing. Installation does not automatically configure Graphify or an API key.

Optional CLI installation, when `code` is on PATH:

```sh
code --install-extension ~/Downloads/vadhyar-0.1.0.vsix
```

## 2. Get the prepared project

Clone the versioned source, then open only the prepared folder:

```sh
git clone --branch v0.1.0 --depth 1 https://github.com/sabari-nath17/vadhyar.git
cd vadhyar
code novadesk
```

You may instead download the release source ZIP and open its `novadesk` folder. Trust it only after inspecting the source. The actors are simulated; this is not an authentication system. The ownership bug is deliberately seeded.

The VSIX includes the pinned Vitest 5.0.3 runtime and trusted harness, so the installer does not require `npm ci` for its checks.

## 3. Set up Graphify

This release expects Graphify at the installed extension's `.venv-graphify/bin/graphify`. With the default macOS extension folder:

```sh
python3 -m venv "$HOME/.vscode/extensions/sabari-nath17.vadhyar-0.1.0/.venv-graphify"
"$HOME/.vscode/extensions/sabari-nath17.vadhyar-0.1.0/.venv-graphify/bin/pip" install 'graphifyy==0.9.84'
"$HOME/.vscode/extensions/sabari-nath17.vadhyar-0.1.0/.venv-graphify/bin/graphify" --version
```

Expected: `graphify 0.9.84`. If your VS Code uses a custom extension directory, replace the extension path above with its actual installed folder. Updates reinstalling the extension may require recreating this environment. Do not place this environment in the sample project's folder; extraction uses the extension-owned executable.

## 4. Open and configure Vadhyar

Open the Command Palette (**Cmd+Shift+P**) and run **Vadhyar: Understand this change**.

1. Review and confirm the prepared requirement.
2. Save a source checkpoint; refresh source relationships and confirm their mapping.
3. For explanations and hints, run **Vadhyar: Set OpenAI API key securely**. Enter your own key in the native masked prompt. It is stored in VS Code SecretStorage.
4. Set `vadhyar.model` to a Responses API model available to your OpenAI account. The release's initial default is `gpt-6-astra`; model access is account-dependent. No automatic model fallback occurs.
5. Preview the exact context before sending an explanation or hint request. API usage is charged separately by OpenAI; a ChatGPT subscription does not supply API credentials.
6. Save a prediction, run the prepared different-client case, inspect the result and make your own source edit. Save, open the native diff and run all three ownership cases.

A failed ownership case is expected on the original seed. Passing the baseline test suite does not prove that the ownership rule is correct.

## Data and privacy

Code checkpoints, predictions, hints, diffs and run records use workspace-scoped VS Code extension storage. The API key uses SecretStorage. Coaching sends the selected preview context to OpenAI after approval. The landing website has no login, analytics, form backend or AI requests. Snapshots start when captured; they do not recover earlier AI conversations or establish authorship.

## Troubleshooting

| Symptom | Action |
|---|---|
| VS Code refuses installation | Check Help → About. The manifest requires 1.140.0+, macOS Apple Silicon. Do not force installation on an older editor. |
| Command not visible | Confirm the installed extension is enabled, then reload VS Code. Open the prepared `novadesk` folder in a trusted local window. |
| Graphify extraction fails | Verify the installed extension path, isolated executable and `graphify 0.9.84`; inspect the actionable panel message. |
| Runner cannot produce a result | Reinstall the original VSIX and preserve its trusted fixtures; inspect the prepared source for exceptions. Do not treat execution errors as a passing case. |
| API model/key error | Check your API account, billing and accessible model; enter the key only in the native masked prompt. |
| Source is stale or unsaved | Save the file, refresh context, then review the current diff and rerun. |

## Build from source

The source build needs Node `^22.13.0 || ^24.0.0 || >=26.0.0` and the locked dependencies:

```sh
npm ci
npm run typecheck
npm run lint
npm run test
npm run build
npx @vscode/vsce@4.0.0 package --target darwin-arm64 --out vadhyar-0.1.0.vsix --skip-license
```

`--skip-license` records that no project-wide license has been selected; it does not license third-party material or bypass the packager's secret scan. Third-party notices remain in the source. Do not assume the public repository grants a blanket reuse license.

Windows, Linux, Intel Mac and browser-based VS Code installation are unverified and are not distributed by this release. Runtime API and human learning quality are separate from packaging checks.
