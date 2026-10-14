# Feature contract for the UI and adapter lanes

14 October 2026. Default data is a host-approved real local project. Prepared NovaDesk is an optional separate example. This document is the feature handoff; the user-approved Duolingo-inspired UI implementation remains owned by the design chat.

## Working service and record boundaries

- `project-service.mjs`: approved root; authenticated loopback API; disk metadata index; native save/add/delete watcher; durable baseline/event/selected-context storage with distinct hash/range deduplication and atomic rollback on failed context writes; bounded source/hash reads; consented existing-script jobs.
- `project-types.ts`: runtime DTO validation. ProjectInfo includes id/name/counts/capture revision/watch state and redacted errors. File pages max100. Source max200lines/40kcharacters with full-file identity. Script result binds exact project/file/source/manifest and recorded capture context; status is a command outcome only. Queued saves settle before consent is revalidated and the command starts. Eligible dependency/config/check changes during execution, or partial/unavailable watching, make the result stale while preserving its actual exit/output. Unobserved or excluded files are outside this freshness evidence.
- `project-learning.ts`: start from source/requirement/case; preserve prediction before self-reported observation; refresh actual saved source before verification; record script/manual evidence plus a separate human verdict/assistance; reflect and answer a distinct case. Accepted verification is archived at both Reflect and Complete before changed source invalidates the current verification. Recording an observation freshly reads the saved excerpt and rejects a mismatch with the immutable prediction source; the observation itself remains a self-report. Empty or out-of-file excerpts cannot start a lesson. Teaching wrappers remain source-labelled historical interpretations.
- `teaching-service.mjs`: explicit OpenAI session key, model check/selection, exact excerpt consent, fixed official endpoint, no ambient auth/automatic retry/fallback, store:false, bounded structured response, cited-range and source freshness validation. Failure leaves recording/records available. Keys are not durable and live access is unverified.
- `activity.ts`:10 XP prediction,5 observation,10 verification,10 reflection,15 separate case. Historical copies do not award twice or duplicate saved-prediction counts. These are activity rewards, not a competency or independence score.

## Frontend consumers to preserve

Project-only reset atomically saves a new record identity, rejecting stale serial-zero tabs; a failed reset preserves the saved record. Previously saved observations are not retroactively validated by the new fresh-read gate.

Workspace reconnect/polling continues after temporary errors, with a visible error and reconnect action. Source selection/search/pagination uses request identities so a slow older page cannot replace new search results. Explicit refresh preserves unchanged drafts and asks before changed-source draft loss. Fields match domain bounds.

ProjectLesson separates source-version state, AI-session signal, command status, current coverage and human verdict. The optional run freshness field is current/stale/unknown: later recorded dependency/config/manifest drift changes coverage without rewriting the execution result. New passed/failed verification needs current coverage; error/timeout with unknown coverage allows only uncertain/not-satisfied assessments. Status polling retries GET only; unknown_run/404 has an explicit clear action and unknown outcome. A new check always needs new consent. Completed field saves clear their draft; unchanged refresh does not. Unfinished runs/teaching requests participate in navigation protection.

TeachingPanel receives source, requirement, case, saved teaching wrappers, onResult and onBusy. A result is recorded through the validated action before later navigation. Capacity failures keep the returned interpretation visible and individually exportable. Leaving aborts the request; cancellation cannot reverse usage already incurred. Cap5 should prevent an unnecessary sixth paid request.

The UI can reorganize destinations and reveal support panels in context while preserving these actions/prerequisites, source coverage, history, unknown/error states and assistance labels. A file save or AI completion must not imply a working build, requirement satisfaction, earned XP or learning success. Do not synthesize populated lessons/maps/connection states before the relevant data exists.

## Measured and unverified

Observed one run on this Mac:10,001 actual synthetic files,3,647,780 indexed bytes; metadata scan599ms,100-file HTTPpage1ms,filename search2ms;3,388,890-byte Python file,lines100000–100159,2,238chars/fullhash25ms; external process save→second persisted context432ms. This is not a capacity guarantee or representative production benchmark. Exclusions, depth64, native watch limits/coalescing, history retention and disk capacity still apply.

Implemented tests cover source/session/Origin/path/symlink/body limits, independently named projects/languages, real synthetic script pass/fail/stale/timeout, watcher failure, restart/range retention, malformed records, stage gates, storage recovery, consent/cancellation/provider failure, source-linked output and historical interpretations. Browser fixture QA covers the entire generic loop, automatic external write, scoped script/manual evidence, declared uncertainty, saved interpretation, export/search/reload, transient and lost status, draft refresh, pending teaching and stale pagination at desktop/narrow sizes. Provider transport is injected, not live OpenAI.

Not implemented here: a standalone distributable installer, shared existing-extension recorder bridge, coding-tool intent/session hooks, Git history import, account/profile persistence, automatic feature chapters, spaced review queues, Ollama, ChatGPT sign-in or GitHub App. The separate reuse chat owns its source viewer/concept-map adapter and evidence. Demand, real learner outcomes and million-file repositories are unverified.


## Local completion contracts

`npm run prototype:start` builds and launches the current Vadhyar folder; `prototype:build` builds only, and `prototype:check` checks the local code/services without live provider credentials.

Authenticated `GET /api/projects/:id/source-state?fileId=opaqueId` returns `{fileId,status:available|unavailable,sourceHash:hash|null}` from a direct bounded full-file read. It returns no source text and does not alter history, selected ranges or revision. Unavailable/error means unknown currentness. This replaces inference from absence in the recent 20-event feed. Delegated project routes are checked against the approved project before any source read.

Old learning records default `pendingCheck` and `checkResult` to null. A new command stores an attempt/source/script/manifest-bound starting operation before POST. Accepted job IDs resume through GET after reload; a missing acknowledgement or lost host job stays unknown. Explicit clear archives the raw receipt/uncertain operation and creates a new active continuation. Changed-source refresh archives dependent command evidence before clearing it. These operations award no XP and cannot advance a learning stage. A known starting/running operation or unknown operation blocks a verdict until finished or explicitly cleared. Late responses must match the original attempt and operation.

The browser redesign and source-knowledge adapter have separate owners and verification receipts. Refer to [the behavior contract](../docs/product-logic-contract.md) for the combined UI acceptance journeys. A source-checkout prototype is not a standalone installer, phone server or installed editor bridge.
