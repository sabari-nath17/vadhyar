# V2 review and backup handoff

## What changed

The isolated `codex/design-v2-phase-0` branch implements the guided presentation in `src/panel/`: one task and one dominant next action, a home path, start/resume sheet, six existing lesson stages, recorded proof, clear recovery and optional local Snake/sound. Project Guide keeps its existing separate editor entrypoint and four simpler task views. The original wordmark is unchanged; fonts and 26 SVGs are bundled locally.

The current app was preserved at **29db3ef** before UI integration. The [snapshot](current-app-snapshot.json) pins all 23 host/shared/project/fixture files. Tests verify these bytes and all original UI actions stay intact. Earlier native milestones belong to that baseline and do not certify the new renderer. This branch has not been merged or pushed.

| Phase | Review |
|---|---|
| 0 · foundations and gallery | [Screenshots, component/state checks and contrast](phase-0/README.md) |
| 1 · generated asset review | [All required assets at all widths/themes](phase-1/README.md) |
| 2 · lesson shell and original actions | [Task layout, consent and action boundaries](phase-2/README.md) |
| 3 · path and proof | [Start, completion, history and honest stickers](phase-3/README.md) |
| 4 · recovery, motion and sound | [State matrix and interaction limits](phase-4/README.md) |
| 5 · final review | [Keyboard, screenshots, walkthrough and local package](phase-5/README.md) |

## Current build backup

Verified before UI integration, including uncommitted and untracked non-ignored source/UI files:

```text
/Users/sabarismac/Documents/ChatGPT/Vadhyar UI backups/before-design-v2-20261011-051642-IST/
  vadhyar-current-source-and-ui.zip
  manifest.json
  RESTORE.md
```

236 files; archive SHA-256:

```text
fa28f4f737daadbc8d626cdd91fc6ee8911c76a183661ab29b120952dfaee9e3
```

Consult `RESTORE.md` and extract into a **new empty folder**. Do not replace the active checkout. The snapshot excludes dependencies, ignored generated output, Git internals and credential filenames; it is a source/UI backup, not a credential or Git-history backup. Every archived file was verified against its manifest and the source was rechecked during capture.

## Review without sharing code

From this branch's isolated checkout:

```sh
npm run build
node scripts/panel-preview.mjs
npm run gallery -- --port 4187
```

Open `/gallery/` for the library or `/gallery/preview/index.html` for the real panel renderer. Every renderer preview is labelled **Recorded preview · no API or storage**. Its scene selector only changes presentation; host operations are recorded as messages and never executed. Real historical runner records and illustrative graph/model/error specimens are identified separately.

## Local installer and native acceptance

Build and package using the existing local dependencies:

```sh
npm exec -- vsce package --target darwin-arm64 --out dist/vadhyar-v2-review-darwin-arm64.vsix --skip-license --no-rewrite-relative-links
```

Use a separate named VS Code profile and a disposable trusted workspace to review it. The manifest still requires macOS Apple Silicon, VS Code 1.140.0+, Python 3.10+ and the pinned external Graphify prerequisite. This is a local review build, not a published release or a cross-platform installer.

For a fresh prepared exercise, use the existing command with an absolute **new** destination:

```sh
npm run demo:prepare -- /absolute/new/NovaDesk-review
```

It creates source and requirement files exclusively. An existing destination is refused; no existing workspace is reset. The seed intentionally omits ownership and uses simulated actors. API calls in the actual extension still require a user key and the existing exact context review.

Native follow-up: verify source links, mapping and requirement approval, save-before-check acknowledgement, live reviewed explanation/hints, editing/diff, three/four-case checks, resume/clear dialogs and Project Guide. Check light/dark/both native high-contrast themes, keyboard/screen reader, OS reduced motion and optional sound. These redesigned-panel native checks and human ease-of-use acceptance remain pending.

## Spec changes and limits

[design-v2.md §19](../../design-v2.md#19-implementation-rulings-and-simple-language) records every deviation. Demo reset and recorded-answer fallback remain visibly planned because adding them would change host behavior. A labelled GIF assembled from actual screen captures replaces continuous video because the available Computer Use controls expose no recorder. Neither is presented as live execution. No new network request, dependency, remote font, storage format or credential operation was introduced.
