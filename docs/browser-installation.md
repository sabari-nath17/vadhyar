# Install the Vadhyar browser companion

This portable release runs beside your editor on the same computer. It includes the built browser UI and protected local service. No npm download, API key or build is required to install or start it. The earlier `.vsix` is the separate legacy VS Code product.

## Prerequisite

Install **[Node.js 24 LTS](https://nodejs.org/en/download)** and check `node --version`. The release requires Node 24 or newer. A browser and one trusted local project folder are enough to start. macOS fresh installation is verified; Linux CI verification is separate. Windows installation and project-check execution have not been verified.

## Download and install

Download `vadhyar-browser-0.1.0.tar.gz` and its `.sha256` file from the **[browser-v0.1.0 GitHub release](https://github.com/sabari-nath17/vadhyar/releases/tag/browser-v0.1.0)** into the same folder. Verify the download before running its installer:

```sh
# macOS
shasum -a 256 -c vadhyar-browser-0.1.0.tar.gz.sha256

# Linux alternative
sha256sum -c vadhyar-browser-0.1.0.tar.gz.sha256
```

Extract it and install into a new directory you own:

```sh
tar -xzf vadhyar-browser-0.1.0.tar.gz
cd vadhyar-browser-0.1.0
node install.mjs --to "$HOME/vadhyar-browser-0.1.0"
```

The installer checks the release's file hashes, refuses root/sudo and refuses any existing destination. It does not replace your source or learning records. The archive and checksum are not a code signature; download both from the official repository release.

## Open your project

Replace the example folder with your trusted project's absolute path:

```sh
node "$HOME/vadhyar-browser-0.1.0/start.mjs" --project "/absolute/path/to/project"
```

You should see `Vadhyar companion: http://127.0.0.1:4173`. Open that address in your browser. Keep the terminal running; press **Ctrl+C** to stop. Select a file in **Project**, inspect its captured source and confirm one rule and case. Start your prediction before recording an observation.

If another local Vadhyar instance already uses 4173, choose a different port without stopping it:

```sh
node "$HOME/vadhyar-browser-0.1.0/start.mjs" --project "/absolute/path/to/project" --port 4188
```

Open the address printed by that process. Browser learning storage is specific to the browser/profile/address/port, so changing the port does not move previous browser records.

## Updates and removal

Export visible and saved learning records before switching versions, ports or browsers. Install updates into a **different new directory** and stop only the old instance you intend to replace. Existing destinations are never overwritten automatically.

To remove the app, stop its terminal process and delete only its installation directory. Recorder data remains under your user's Vadhyar application-data folder; browser learning records remain in browser storage. Removing the app does not erase either. Use the app's explicit record reset only after exporting what you need.

## Trust and limits

- The service listens only on `127.0.0.1`, with Host, Origin and browser-session checks. Phone/LAN access is unsupported.
- Local recording and source reading work without OpenAI. Teaching is optional and requires an explicit session key, model choice and context approval; no provider call happens merely by installing or launching.
- Existing project checks require explicit command consent. They execute trusted repository code and are not sandboxed. Node/npm must be available for npm-based project checks; other language runners are not connected.
- Reading order and selected static relationships are scoped source evidence. Saved files, captured excerpts and executed checks do not prove whole-project correctness, runtime coverage, authorship or mastery.
- The archive contains the application, bundled locked dependencies, notices and build/file identities. It excludes source repositories, API credentials, recordings, local caches, development tools and the Node runtime itself.
- This is a portable Node application, not a signed/notarized native installer or an npm-published package. Broader OS, accessibility and human learning-effectiveness acceptance remain separate.

## Troubleshooting

**The destination exists:** choose another new installation directory. Back up the existing app before removing it yourself.

**The server cannot start:** check Node 24+, an existing trusted project folder and an unused port. The app reports a setup error rather than silently choosing another project or port.

**Checksum mismatch:** stop and download both files again from the official release. Do not bypass integrity verification.

See the [project overview](https://github.com/sabari-nath17/vadhyar#readme), [source-reading contract](https://github.com/sabari-nath17/vadhyar/blob/main/docs/source-reading.md) and [current feature contract](https://github.com/sabari-nath17/vadhyar/blob/main/prototype/feature-contract.md) for the workflow and evidence boundaries.
