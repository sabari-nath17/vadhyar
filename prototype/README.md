# Vadhyar local project companion prototype

A local launcher and learning website for the learner's own saved code. Real projects are the default; NovaDesk is an optional labelled example with separate records. Keep building in the usual editor or coding tool: the running recorder follows eligible saved files automatically.

## Run

Use the installed repository dependencies and a supported Node.js runtime (tested on Node26.7.0/macOS):

```sh
npm run prototype:start -- --project /absolute/path/to/a/trusted/project
```

Run `npm run prototype:start` from the Vadhyar repository to study the Vadhyar folder itself. Without `--project`, the launcher uses the current folder. It builds only the prototype and binds to [127.0.0.1:4173](http://127.0.0.1:4173). `VADHYAR_MOCK_PORT` selects another local port. Stop with the terminal interrupt action. This is the source-checkout installation path; a standalone installer and shared VS Code/plugin connection remain future work. Root extension bundles are unaffected.

## Complete a question

Choose a source file in Project, confirm a requirement and a concrete case, then save a prediction before the observation. Observe in your own editor/running application and report the outcome. Recording that observation freshly checks the saved source against your prediction; a changed file needs an explicit fresh attempt and retains the original answer. The observed runtime/build is still self-reported. Save any edit in the original tool; the website reports the new recorded version automatically. Explicitly refresh the active question to compare changed or unchanged source. Its original prediction stays immutable.

Verify with manual evidence or an explicitly approved existing root-package check. Command status and the human requirement verdict are separate. Failed or uncertain verdicts can still produce useful reflection. Save a reflection, record a separate case, review Path/Notebook and export the complete record. XP counts learning activities; saves and generated code do not earn rewards, and XP is not an ability score.

OpenAI is the first teaching adapter. Enter your own key in the local website, select an available model and approve the exact source excerpt before requesting an explanation. Keys stay only in protected host memory for the running session, never in browser/history storage. Restart requires reconnecting. A successful model listing does not prove every model supports Responses/structured output. Explanations retain source identity and coverage; earlier ones become historical. No live API access or teaching quality was verified in this build; provider tests/browser QA use an injected fixture transport. Recording works without a provider and after provider failure.

## Recording and storage

- File metadata is streamed into a disk SQLite index. Browser pages contain at most100 files (default50); selected source reads contain at most200 lines/40,000characters plus a full-file hash. No whole-repository model upload.
- Native recursive watching updates eligible saved additions, modifications and deletions. Initial metadata capture is a baseline, separate from later development events. AI-session completion and successful build/check status remain distinct, and AI-tool hooks are not connected.
- Hidden, vendor, generated, binary, symlink and common private-file/content patterns are excluded. Counts represent encountered entries, including excluded folders without scanning their descendants. This is not comprehensive secret classification; review an excerpt before sharing.
- Durable data defaults to `~/Library/Application Support/Vadhyar/prototype/<project-id>/files.sqlite` on macOS (`~/.local/share/Vadhyar/prototype` on Linux; LOCALAPPDATA on Windows). Directory700/database600. Metadata events retain the latest10,000; selected source retains the latest20 distinct hash/range contexts per file. Content history begins when a file is selected, not for every file in the baseline.
- Watchers can coalesce rapid saves; not every keystroke/intermediate version is guaranteed. Depth64, device/OS watch limits and disk capacity bound coverage. Watch errors are visible; metadata/source history survives restart, including reconciliation of changes made while stopped. No global history byte quota is configured.
- Learning records use browser storage under `vadhyar.project.v1.<project-id>`; the prepared example retains `vadhyar.mock.v1`. Up to20 earlier attempts,20 refreshes per attempt,5 teaching interpretations per attempt and3,000,000 serialized JSON code units per project record. Export before an explicit project-only reset. Reset atomically saves a new record identity so an earlier serial-zero tab cannot restore deleted progress. Source history is retained separately.
- Corrupt records remain untouched. Storage failures keep validated work in the tab with export/retry; sequential conflicts/reset generations are detected. Simultaneous cross-tab writes are not atomic: use one tab. Local records are editable and not an institutional assessment ledger.

## Execution boundary

Only existing root `package.json` scripts with test/check/lint/typecheck names are exposed by this adapter. The user approves the exact command and current source/manifest identities. No installs, arbitrary browser commands or npm pre/post hooks. Jobs have bounded output and a30-second budget; recorded eligible source/dependency/config/check changes during execution, or incomplete watch coverage, produce stale evidence. Queued saves settle before the exact approved source/manifest is revalidated. Freshness covers observed eligible files, not all excluded files or runtime inputs. Execution is trusted repository code on this computer, not a hostile-code sandbox. Other language runners remain pending; source browsing and manual learning are language independent for readable text.

The accepted check pointer and its latest receipt are saved with the question. Browser reload resumes GET status reads only. A lost start response or restarted host produces an explicit unknown result; clear it deliberately before another command, preserving it in history. A starting pointer must be saved before execution is requested. Transient status reads retry without repeating execution. Permanently lost check status can be cleared explicitly; its outcome stays unknown. Changed-source refresh asks before discarding unsaved text. Accepted verification is archived before changed-source refresh, including at the reflection stage; copied historical predictions/activities count once. Old saved observations have not been retroactively validated. Completed command status remains its execution fact. Before a new script verdict, the host rechecks observed context; later dependency/config/manifest changes make coverage stale or unknown. Passed/failed results need current coverage; error/timeout with unknown coverage can support only an uncertain or not-satisfied assessment. Generated interpretations survive navigation/reload and are labelled assistance, not checks; cancelling a request cannot undo usage already incurred.

## Verification

Run `npm run prototype:check` for the prototype typecheck, lint, learning tests, build and local-service tests. It uses disposable test projects and injected teaching clients; browser and live-provider acceptance remain separate. `npm run prototype:build` builds the browser bundle alone. Individual checks remain available:

```sh
npx tsc -p prototype/tsconfig.json
npx eslint prototype/src prototype/*.ts prototype/*.mjs
npx vitest run --config prototype/vitest.config.ts
node prototype/build.mjs
node --test prototype/project-service.test.mjs prototype/teaching-service.test.mjs prototype/server.test.mjs
```

[Product behavior contract](../docs/product-logic-contract.md) and [feature contract and handoff](feature-contract.md) record the implemented boundaries and pending adapters. [Project-independent specification](../docs/superpowers/specs/2026-10-14-project-agnostic.md) and [plan](../docs/superpowers/plans/2026-10-14-project-agnostic.md) describe this slice. [Research](../docs/research/2026-10-14-industry-learning/README.md), [roasted findings](../docs/research/2026-10-14-industry-learning/decisions.md), [logic contract](logic-contract.md), [design references](DESIGN.md) and [original UI review](ui-review.md) retain provenance. The separate Duolingo UI chat owns the next visual proposal; this checkpoint's later changes fix feature behavior.

Original wordmark, generated lotus/books illustration and repository fonts/OFL notices are retained. House Control, React, Zod, OpenAI SDK, esbuild and Vitest reuse the installed stack. Research establishes design hypotheses, not product demand or learning benefit. The optional prepared lesson still discloses its seeded ownership bug; it cannot be mistaken for recorded source or actual project execution.

## Implemented browser reuse — 14 October 2026

For a real approved project, choose a JS/TS source file and **Explore source concepts**. The adapted viewer, manual controls and React Flow map share exact captured line spans. The local PocketFlow workflow port identifies and orders at most five structural concepts using a bounded compiler host; it makes no model request. Other languages and incomplete excerpts show explicit coverage limits. Reload the saved excerpt after a changed-source rejection.

The exact library is pinned in the root lockfile. Node's TypeScript stripping runs the host adapter; `allowImportingTsExtensions` permits its shared validated contracts in the no-emit prototype typecheck. The build writes and the server serves `THIRD_PARTY_NOTICES.txt`, retaining the donor and all bundled dependency license texts. [Upstream mapping, modifications and actual checks](../docs/browser-reuse.md), [provenance](../docs/browser-reuse-provenance.json), [integration evidence](../docs/browser-reuse-evidence.json). The original committed mock's no-import statement is historical; these post-event adaptations are now implemented.

## Selected-source knowledge API

The launcher mounts `GET /api/projects/:projectId/knowledge?selection=<JSON array>` after its existing approved-project, Host/Origin and session checks. Use `getSelectedKnowledge` with one to five captured `{fileId, sourceHash, startLine}` pins; it validates source-bound output and cancellation. Local analysis returns per-file concepts, selected static import/re-export file links and an entry-first reading path, with explicit limits and a12-second batch response budget. The existing browser viewer/map stays single-source. [Backend contract, retained source mapping and checks](../docs/backend-knowledge.md).
