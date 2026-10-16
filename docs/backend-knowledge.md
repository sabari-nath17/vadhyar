# Selected-source knowledge backend

The protected local API analyzes one to five explicitly selected saved ranges using the existing deterministic concept/relationship/order port. Current analysis version 2 supports multiple ranges per file, declaration focus and context identities; [bounded source reading](source-reading.md) gives exact range/catalogue/UI behavior. The [original version-1 milestone](https://github.com/sabari-nath17/vadhyar/blob/92e118d542ab7332a6d6821929a870cc25187516/docs/backend-knowledge.md) remains historical.

## API and data

`GET /api/projects/:projectId/knowledge?selection=<URL-encoded JSON array>` accepts strict `{ fileId, sourceHash, startLine, lines?, focus? }` pins. IDs/hashes are host-issued lowercase SHA-256 identities, start lines are positive, optional lengths are 1–200 and focus identifies a captured declaration. Selection is bounded to five ranges and 4096 decoded query characters. Unknown/repeated query fields, extra properties, duplicate actual ranges and mixed hashes for one file are refused.

[The client](../prototype/src/knowledge-api.ts) uses the same-origin session and validates project/pin/response identity and cancellation. [DTO validation](../prototype/src/knowledge-types.ts) requires every selected context exactly once, entry first. Responses contain per-capture walkthrough/catalogue metadata, selected static module links, proposed reading order and explicit limits; no source text is added to the knowledge response.

`contextId` identifies project/file/hash/actual range/truncation. `knowledgeId` also binds extraction/focus/order inputs. Capture/generation timestamps are metadata, not semantic identity. These are captured-input identities, not continued freshness or lesson identities.

## Authority and freshness

[Host routing](../prototype/serve.mjs) validates Host, Origin, session and the approved project before [the handler](../prototype/knowledge-service.mjs) reads source. Foreign project IDs cause zero delegated source reads. The browser cannot choose paths, roots, providers or commands.

Each selected range is captured sequentially through the existing bounded source seam, then reread and checked for exact identity/hash/range/text/truncation/bytes before returning. Existing exclusions, symlink/private-content checks and hashing guards remain authoritative. Drift rejects the batch; failure does not mutate predictions or execute source.

Only one batch runs at a time (`429 knowledge_busy`). Its fixed 12-second response deadline precedes the client's 15-second GET deadline (`408 knowledge_timeout`). Disconnect/timeout stops subsequent reads and discards late output. An active host read finishes under its existing guard and retains the busy slot until settled. A timed-out request cannot undo a capture already made. Retry requires an explicit action, with recapture when stale.

Sequential capture/recheck is optimistic, not an atomic project snapshot. Source may change after its final check. Unsaved buffers, unselected/excluded files, environment/deployment/runtime and unlimited history are outside coverage. Knowledge adds no durable cache/store.

## Interpretation and reuse

The TypeScript compiler parses captured text in memory without project config, dependency ingestion or imported-file reads. Only uniquely matching selected relative import/re-export paths create module links. Competing candidates stay unresolved; external/configured aliases, dynamic/require calls, namespace/member dispatch and runtime edges are outside scope. A missing link is unknown, not proof of independence.

The [PocketFlow mapping](backend-knowledge-provenance.json) extends [browser reuse](browser-reuse.md). The identify → relationships → complete-order workflow and staged pipeline are adapted into bounded authenticated capture/analysis/recheck. The original MIT notice remains; no Python framework, upstream provider, generated chapters or repository crawler is imported.

Development diagnostics contain an operation UUID, timing, outcome category and count; production suppresses them. Source, filenames, pins, queries, keys and raw exceptions are not logged. No model request, lesson mutation, XP, requirement verdict or mastery claim is produced.

## Checks and evidence

[Parser tests](../prototype/source-knowledge.test.ts), [protected-host tests](../prototype/knowledge-service.test.mjs) and [client tests](../prototype/knowledge-api.test.ts) cover bounded validation, authority, freshness and cancellation. The normal browser test commands include these cases.

The [backend receipt](backend-knowledge-evidence.json) preserves the original version-1 execution counts and fingerprints. [P07 evidence](source-reading-evidence.json) and [installed-browser verification](browser-release-verification.md) record later separate source scopes. Historical test counts and pending labels are not assertions about a later checkout or human learning efficacy.
