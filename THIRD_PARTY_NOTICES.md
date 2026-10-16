# Third-party notices

Vadhyar's current source is [MIT licensed](LICENSE). Retained libraries, source adaptations, fonts and artwork preserve their own copyright and license terms. The browser build emits `THIRD_PARTY_NOTICES.txt` from the original license files of packages actually bundled, plus the adapted-source notices below. The portable archive includes those notices and build identities.

## Browser libraries and tools

| Component | Current use | Retained notice |
| --- | --- | --- |
| OpenAI SDK 7.32.0 | Optional protected-host teaching adapter | [Apache-2.0](docs/third-party/openai-LICENSE.txt) |
| React / React DOM 19.3.0 | Browser interface | [React MIT](docs/third-party/react-LICENSE.txt), [React DOM MIT](docs/third-party/react-dom-LICENSE.txt) |
| Scheduler 0.28.0 | React runtime dependency | [MIT](docs/third-party/scheduler-LICENSE.txt) |
| Zod 4.6.5 | Runtime contracts | [MIT](docs/third-party/zod-LICENSE.txt) |
| React Flow 12.12.0 / xyflow system 0.0.83 | Bounded static source map | [xyflow MIT](docs/third-party/xyflow-LICENSE.txt) |
| TypeScript 6.0.3 | Local captured-text compiler analysis | Original installed-package notice included by the build |
| esbuild 0.28.2 | Development bundling | [MIT](docs/third-party/esbuild-LICENSE.txt) |
| Vitest, ESLint and development dependencies | Source verification | Original notices remain with locked installed packages; the portable app excludes development tools |

## Adapted source

- Learn Claude Code's pinned source viewer and manual step controls are adapted in `prototype/src/SourceViewer.tsx` and `prototype/src/StepControls.tsx`. Its [original MIT copyright/license](docs/third-party/learn-claude-code-LICENSE.txt) remains unchanged.
- PocketFlow Codebase Knowledge's pinned identify → relationships → complete-order workflow is ported to `prototype/src/source-concepts.ts`, then extended in `source-knowledge.ts` and the protected knowledge service. Its [original MIT copyright/license](docs/third-party/pocketflow-LICENSE.txt) remains unchanged. Vadhyar uses deterministic bounded compiler extraction, not the upstream Python framework/provider.
- P07 extends these ports with captured-range identities, nested declaration anchors and a view-local reading bundle. The published React Flow package is used without editing its implementation; default attribution remains visible.

Exact upstream commits, blob identities, local mappings and modifications are retained in [browser reuse](docs/browser-reuse.md), [backend provenance](docs/backend-knowledge-provenance.json) and [source-reading provenance](docs/source-reading-provenance.json). Historical mapping paths resolve through their recorded snapshot; removing old files does not erase their provenance.

## Fonts and artwork

The browser bundles Inter 400/500/600, JetBrains Mono 400 and Playfair Display 600. Their original SIL Open Font License texts remain beside the fonts: [Inter](prototype/assets/inter-OFL.txt), [JetBrains Mono](prototype/assets/jetbrainsmono-OFL.txt), [Playfair Display](prototype/assets/playfairdisplay-OFL.txt).

The original transparent wordmark was supplied by the user on 11 October 2026 and copied without generation or pixel changes. Its [original provenance](https://github.com/sabari-nath17/vadhyar/blob/92e118d542ab7332a6d6821929a870cc25187516/media/vadhyar-logo.png.json) and [font/source record](https://github.com/sabari-nath17/vadhyar/blob/92e118d542ab7332a6d6821929a870cc25187516/media/README.md) remain immutable. Current browser copies live in `prototype/assets/`. [Screenshot provenance](docs/assets/browser-image-provenance.json) distinguishes visible product captures from generated artwork and later installer evidence.

## Earlier distributions

Additional retained license texts describe dependencies of the immutable native releases. Their [complete original notices](https://github.com/sabari-nath17/vadhyar/blob/92e118d542ab7332a6d6821929a870cc25187516/THIRD_PARTY_NOTICES.md), source and release metadata remain in [project history](docs/history.md). They do not imply those tools remain dependencies of current source. Existing release archives keep their original license files and scope.
