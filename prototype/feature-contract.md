# Browser feature contract

Current scope: one host-approved local project on the same computer as a desktop browser. The maintained destinations are Path, Project and Notebook. Source implementation is under this folder; [product behavior](../docs/product-logic-contract.md), [design](DESIGN.md) and [release evidence](../docs/browser-release-verification.md) keep behavior and verification separate.

## Host and source

- `project-service.mjs` owns approved-root identity, the authenticated loopback API, SQLite metadata index, eligible save/add/delete watching, source history and explicitly consented existing-script jobs.
- `project-types.ts` validates runtime DTOs. File pages are capped at 100; source at 200 lines/40,000 characters with full-file hash, exact range and capture time. Delegated project routes validate the approved project before reading source.
- `source-state` returns selected-file availability/hash without source text or history mutation. Failure means currentness is unknown. Absence in the short event feed cannot establish unchanged source.
- Saved-file watching is bounded by exclusions, depth, OS limits and capacity. It may coalesce saves; source history records selected ranges, not every file's full history.
- Each loopback port uses its own HttpOnly, SameSite=Strict session cookie. Host/Origin/project checks remain independent of cookie isolation.

## Source interpretation

The single-capture walkthrough uses adapted viewer/manual controls and React Flow to inspect bounded local concepts. The knowledge API accepts one to five explicit captured range pins, checks their identity/freshness and returns local static relationships/order. The reading bundle adds retained captures, declaration anchors, text search, explicit replacement and export; it is view-local.

These actions do not send source to a model, edit files, execute commands, advance a lesson or prove runtime flow. See [source reading](../docs/source-reading.md), [backend details](../docs/backend-knowledge.md) and [donor provenance](../docs/browser-reuse-provenance.json).

## Learning and persistence

`project-learning.ts` starts from selected source, requirement and case. The confirmed baseline/prediction remain immutable. Recording an observation rereads that range; a mismatch refuses the operation and preserves work. Observations remain self-reported.

Refresh archives dependent prior evidence when source changes. Verification records manual or actual command evidence alongside an independent satisfied/unmet/uncertain verdict and assistance. Failed/uncertain outcomes can lead to reflection. A separate case must differ after normalization; it records reasoning, not an automatically observed outcome.

Concise factual case/outcome/assistance fields accept nonblank text up to 2,000 characters; explanatory fields retain their minimum lengths and requirements accept 8–4,000 characters. Validate using the shared domain, not UI-only assumptions.

Attempts/history use browser storage under `vadhyar.project.v1.<project-id>`. Reset atomically writes a new record identity; rejected saves preserve existing records. Failed persistence keeps valid work visibly unsaved with export/retry. Corrupt raw bytes remain untouched. Simultaneous-tab writes are unsupported. Host source history remains independent of browser record reset.

## Commands and optional teaching

A command's starting intent is persisted before POST. Acknowledged jobs resume through GET after reload; a lost start/host job stays unknown until explicit clear. Command status is distinct from source coverage and the human verdict. Manifest/source changes before execution invalidate approval; eligible changes during/after execution make coverage stale/unknown while preserving the process fact. Trusted repository execution has no sandbox.

`teaching-service.mjs` requires an explicit in-memory session key, model choice and exact excerpt consent. It uses the official fixed endpoint, bounded structured output, `store:false`, source/citation/freshness validation and no automatic retry/fallback. Recording works through provider failure. At most five interpretations are retained per attempt; a valid response refused by retention remains individually exportable and labelled unsaved. Cancel/leave cannot reverse provider usage already incurred.

## UI recovery

All asynchronous saves/reads belong to the originating project, view, attempt, selection and operation. Older responses cannot write into a replacement question. Search/pagination and file/version reads keep request identity. Errors retry their own operation and preserve valid query/source/draft state.

Same-page navigation is a no-op. Leaving/replacing with drafts or pending work requires Keep working or explicit discard/export. Changed-source refresh archives accepted evidence; unchanged refresh preserves drafts. Teacher/check blockers remain visible outside collapsed disclosures. Status failure labels recording/freshness unknown immediately.

## Distribution and limits

Current npm defaults build, check and start the browser product. The portable Node installer has its own [setup guide](../docs/browser-installation.md) and exact [published-preview receipts](../docs/browser-release-verification.md). A source checkout is not the same artifact as that immutable download.

Phone/LAN access, cloud sync/accounts, editor bridges, automatic AI-session intent, Git-history import, all-language runners, automatic curricula/mastery grading and real learner efficacy are not established. Live provider quality, Windows execution, native signing and comprehensive assistive-technology/device acceptance remain unverified.

Historical owner plans, tests/counts and prepared-demo specifications remain in [immutable history](../docs/history.md); they are not current feature availability claims. Repository cleanup preserves existing user storage and local recordings.
