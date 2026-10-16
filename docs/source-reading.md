# Bounded source reading — P07

This post-event slice extends the [implemented backend](backend-knowledge.md) and [browser reuse](browser-reuse.md). It supports one learner-selected real feature through one to five captured source ranges. Source intelligence remains local and deterministic; the learner supplies their question and interpretation.

## Source contract

Use `npm start -- --project /absolute/path/to/a/trusted/project` from the source checkout, or follow the [portable installation guide](browser-installation.md). Keep the browser and host from matching source/build inputs. `npm test` builds assets and runs browser unit/service/policy checks; it does not establish learner comprehension. Preserve another active session by using an isolated checkout and unused port.

New browsing requests 200 lines explicitly. Omitted range lengths retain the legacy 160-line default. A capture is still limited to 40,000 characters and carries project/file identity, full-file SHA-256, path, actual start/end lines, truncation, byte count and capture time. Complete-declaration navigation requests its exact line count. Walkthrough, knowledge, observation/refresh and teacher consent must reread that same captured range; they must not silently widen an older saved lesson.

`GET /api/projects/:projectId/knowledge?selection=<JSON>` accepts one to five strict `{ fileId, sourceHash, startLine, lines?, focus? }` pins. `lines` is an integer from 1 through 200; `focus` is a captured `concept-N` identity. Duplicate requested ranges and mixed hashes for the same file are refused before reads. Distinct requests that collapse to the same actual short-file span are refused after capture.

Knowledge `analysisVersion: 2` adds a `contextId` for each actual project/file/hash/start/end/truncation identity. The ordered response preserves file IDs for navigation; module-edge endpoints and reading order use context IDs. Several ranges of one physical file are supported without being treated as several competing module paths. Each response includes every selected context once, entry first. Changing focus changes the analysis identity when its reading order changes; recapture time alone does not change it.

The existing authenticated Host/Origin/session guards, one in-flight batch, 12-second response deadline, sequential source capture/rechecks, private-source exclusions, cancellation and redacted development diagnostics remain. No reading action runs a project script, changes lesson state or sends source to a model.

## Complete declarations and honest partial captures

The installed TypeScript compiler analyses only captured text in memory. A visible catalogue includes up to 100 named declarations, including nested named functions and function-valued variables, with name, kind, captured scope, source lines and completeness. The local graph remains capped at five selected concepts; a complete catalogue declaration can become its starting concept. Further declarations are counted as omitted.

When a bounded capture cuts an enclosing function, individually syntax-valid nested declaration slices remain readable. Incomplete parents remain labelled partial. Every local call/type edge is suppressed when the enclosing capture has syntax errors; this recovery does not turn incomplete source into verified behaviour. A malformed complete file stays invalid. Scope outside a later source range stays unknown.

Individually syntax-valid static relative import/re-export declarations can connect selected contexts, including a partial source capture. Resolution consults only selected paths. Multiple captures of one target file use a readable range beginning at line 1 when available, otherwise its first readable selected range. Different competing physical candidates stay unresolved. These links establish file imports; imported symbol availability, callbacks, HTTP routing, storage handoffs and runtime execution still require reading their cited source or independent observation.

## Reading bundle

The mounted `SourceReadingBundle` component adds displayed captures explicitly, preserves them while browsing files in the same project view, allows removal/replacement/entry selection and exports their source plus current analysis. It keeps different saved versions available for local inspection/export but blocks analysis until ranges of each file use one consistent hash. Reopening a saved range recaptures current source; replacing the retained capture is explicit.

The bundle displays proposed reading order, static module links with source-line anchors, complete/partial declaration anchors, unresolved coverage and four comprehension prompts: action entry, selected-file handoff, deciding condition/side effects and unknowns. “Find in captured source” searches only retained text, with at most 30 matching lines. It does not search or upload the whole repository.

Captures live only in the current project view. They are not durably restored across leaving/reloading the page; export before leaving. Analysis failure or cancellation preserves the local captures and export. The existing project-keyed workspace mounts the reader with exact-range navigation. Its [independent mounted-reader receipt](https://github.com/sabari-nath17/vadhyar/blob/92e118d542ab7332a6d6821929a870cc25187516/docs/logic-evidence/persona-real-reader-acceptance.json) is distinct from this source component's build and unit tests.

## Concrete acceptance task

Use the actual Vadhyar source to explain **Record observation** while the provider is disconnected. Select useful captured ranges from `ProjectLesson.tsx`, `project-api.ts`, `Workspace.tsx` and `project-learning.ts`; use the complete `observe`/`act` catalogue entries and local text anchors when larger parent functions are partial. Explain the user action, the baseline-hash gate, the observation transition and how the browser record is saved. Separate a static import from a callback/HTTP/storage flow claim. Recapture changed source and show that older captures remain inspectable without being accepted as fresh evidence.

Product Quality completed this bounded maintainer/persona journey at integration checkpoint `88a8d69`, using five retained ranges across four actual code files. The [source-cited explanation](https://github.com/sabari-nath17/vadhyar/blob/92e118d542ab7332a6d6821929a870cc25187516/docs/logic-evidence/persona-real-feature-explanation.md) and [acceptance receipt](https://github.com/sabari-nath17/vadhyar/blob/92e118d542ab7332a6d6821929a870cc25187516/docs/logic-evidence/persona-real-reader-acceptance.json) record exact anchors, export hashes, keyboard focus, range-failure preservation and a separate genuine stale-source/explicit-replacement probe. At that reviewed closeout, all twelve source/built fingerprints matched the receipt and the sixteen source-owned fingerprints were unchanged from `5bb7708`; these are historical identities, not a claim about a later checkout.

This is a qualitative maintainer/product acceptance journey, not proof of human learning improvement. No automatic grading, generated curriculum, runtime instrumentation, whole-repository completeness, provider quality or mastery is established by this slice. The [published installer receipts](browser-release-verification.md) and later source changes retain their own gates.

## Attribution and verification

[Source mapping and modifications](source-reading-provenance.json) retain the original PocketFlow MIT notice and prior Learn Claude Code/React Flow adoption records. No new dependency, upstream fetch or repository clone is needed. [Execution evidence](source-reading-evidence.json) distinguishes focused/full checks, source fingerprints, actual-app acceptance and pending limits. Earlier version-1 backend receipts remain historical.
