# Selected-source knowledge backend

This page records the original version-1 backend milestone. The current P07 version-2 range, catalogue, focus and reading-bundle contracts are documented in [bounded source reading](source-reading.md), with a separate [execution receipt](source-reading-evidence.json). Earlier counts and single-file-only UI limits below describe that milestone rather than the current interface.

14 October 2026, post-event development. Authorized: build Vadhyar's backend from the reviewed codebase-knowledge work, in parallel with the existing feature, UI and logic owners. This adds a real local API to the existing companion; source recording, teaching-provider credentials and learning records retain their current owners.

## Implemented scope

The protected host captures one to five explicitly selected saved excerpts, runs the existing PocketFlow concept/relationship/order port for each, connects selected files through captured relative import and re-export declarations, and proposes an entry-first reading path. Concepts remain scoped to their file, with at most five named top-level concepts per excerpt. File links are separate from the existing local call/type links.

No new package, framework, database or repository clone is needed. The existing TypeScript compiler parses captured text in memory; it reads no project configuration, package metadata, imported files or library source. The [Compiler API documentation](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) informed the AST usage; the implementation uses the installed compiler and is tested against it.

This is a backend capability with a validated client helper. A new multi-file picker, whole-project course and multi-file model explanation are not implemented by this slice. The existing source viewer/manual controls/React Flow map retain their single-source contract.

## API and caller

`GET /api/projects/:projectId/knowledge?selection=<URL-encoded JSON array>`

`selection` contains one to five strict `{ fileId, sourceHash, startLine }` objects. Identities are host-issued 64-character lowercase SHA-256 strings; `startLine` is a positive integer up to 999999999. Each file appears once. The first selected file is the reading entry. The only query field is `selection`, bounded to 4096 decoded characters. Unknown/repeated query fields, request bodies, duplicate files, extra properties and other methods are rejected before source reads.

Use [getSelectedKnowledge](../prototype/src/knowledge-api.ts) after the existing local-session handshake and a successful source capture. It sends only these pins through a same-origin GET, validates the DTO and matching project/ordered file/hash/start identities, and rejects a response arriving after its supplied abort signal. The UI caller still owns its originating view, question and request identity.

The [DTO](../prototype/src/knowledge-types.ts) returns:

- `projectId`, stable `knowledgeId`, `analysisVersion: 1` and `generatedAt`.
- `files`: the existing validated walkthrough plus relative path, capture time, full-file byte count, truncation and unresolved static module-reference count. No source text is included in the knowledge response.
- `relationships`: file-level `{ from, to, kind: 'imports' | 're-exports', line }`, with captured endpoint and source-line validation.
- `order`: every selected file exactly once, entry first; cycles and disconnected files remain inspectable. Each file retains its own complete concept order and omitted count.
- Explicit `limits` distinguishing selected static evidence from runtime, requirements and learning outcomes.

`knowledgeId` hashes the project, extraction version, ordered selected file identities, relative paths, full-file hashes, captured ranges and truncation. It excludes recapture/generation timestamps. It is a captured-input identity, not a current-source guarantee or a persisted lesson identity.

## Authority, freshness and recovery

[Launcher wiring](../prototype/serve.mjs) mounts the handler inside the existing Host/Origin/session gates. The feature-owned host validates the approved project before delegating project routes; a foreign project causes zero knowledge source reads. Browser requests cannot select filesystem paths, roots, commands or providers.

The [handler](../prototype/knowledge-service.mjs) reads each selected pin sequentially through `readSource(fileId, startLine, 160)`, preserving the existing exclusions, symlink checks, private-content withholding, full-file hashing and range limits. Any expected-hash or source-identity mismatch rejects the whole batch. Before returning, it rereads each selected source and checks project/file/path/hash/range/text/truncation/bytes again. Failed analysis does not advance a lesson, overwrite a prediction or execute source.

One batch runs at a time. A second gets `429 knowledge_busy`. A fixed 12-second response deadline returns `408 knowledge_timeout` before the client helper's existing 15-second GET deadline. Disconnect or deadline stops subsequent captures, analysis and rechecks. An already-running host read finishes under its existing 30-second guard; the batch retains its busy guard until that read settles. A timeout cannot undo a host capture that already happened. Failed or stale work can be explicitly retried after recapture; no request is automatically retried.

Development diagnostics contain only an operation UUID, duration, outcome category and file count; production mode suppresses them. No source, filenames, pins, queries, keys or raw exception text are logged. Common failures stay typed and redacted: invalid selection/body/method, unknown project/file, excluded source, stale source, timeout and busy state.

These are sequential captures and rechecks, not an atomic whole-project snapshot. A source can change after its last check. Unsaved buffers, unselected/excluded files, runtime/environment inputs and deployed code are outside coverage. Existing host-selected source-history retention still applies; knowledge itself adds no durable store or cache.

## Reuse and modifications

[Pinned mapping and retained notice](backend-knowledge-provenance.json) extends the implemented [browser reuse](browser-reuse.md); the original research register under `docs/research/2026-10-13-browser-rebuild/` remains historical and unchanged.

PocketFlow `nodes.py` supplies the identify → relationships → complete order workflow. Vadhyar reuses its already-tested deterministic TypeScript port, widens order-helper parameter types to the fields actually consumed, and applies the same order validation to selected file IDs. PocketFlow `flow.py` supplies the staged workflow precedent; Vadhyar uses a bounded authenticated GET, source-pin validation, host capture and freshness rechecks instead of its Python framework, repository ingestion or model-generated chapters. The existing MIT notice is retained unchanged.

Only uniquely matching selected relative paths create module links. Exact paths, JavaScript-to-TypeScript candidates, extensionless JS/TS paths and selected directory indexes are considered. Competing candidates remain unresolved even if one fails parsing. Unsupported or malformed sources produce explicit per-file states. External/configured aliases, unselected files, dynamic/require calls and namespace/member dispatch stay outside this knowledge graph. A missing edge is unknown, not evidence of no dependency.

Graphify remains integrated through the existing extension adapter. Learn Claude Code and React Flow remain browser components. This backend does not import those runtimes, introduce another provider, send source to a model, create AI-session intent, reward XP, confirm a requirement or establish mastery.

## Verification

The independent parser and protected-host test lanes own [source knowledge tests](../prototype/source-knowledge.test.ts) and [knowledge integration tests](../prototype/knowledge-service.test.mjs). [Client tests](../prototype/knowledge-api.test.ts) exercise source-bound response validation, cancellation and explicit stale errors. The feature-owned prototype check script includes the new real host tests. Actual final receipts are recorded in [backend evidence](backend-knowledge-evidence.json); written scope is not execution evidence.
