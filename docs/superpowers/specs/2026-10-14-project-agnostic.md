# Project-independent prototype refinement

Latest user steering: remove the prepared project as a product restriction; support small, medium and very large projects with scalable handling. The earlier prepared mock is checkpointed at `636eb73`; this is an authorized refinement, not permission to claim unlimited scale or requirement verification for arbitrary code.

## Slice

The default product opens a real host-approved local project. NovaDesk remains an optional clearly labelled walkthrough. Project names, files, requirements, predictions, observations and learning records come from data rather than ownership-specific constants. Preserve the prepared records under their existing key; generic records use a separate validated key.

The local launcher approves one root (CLI `--project` or its current folder). Browser requests cannot supply arbitrary roots, paths or commands. Metadata indexing streams into a local disk index; paginated query returns at most 100 files. Load a source excerpt only after selection, with a full-file content identity and explicit excerpt coverage. Indexing/partial/errors/exclusions remain visible. No whole-project model upload. Optional OpenAI teaching uses separately approved selected excerpts.

Selected source plus a user-confirmed requirement drives the generic loop. Prediction is free text and retained before a self-reported observation. Saved source refresh produces an actual changed/unchanged record; do not require an invented bug. An approved project script can run with exact command/manifest/source consent and bounded output/time; generic exit status remains separate from requirement satisfaction. Without an available runner, manual verification is labelled self-report. Reflection and a learner-defined separate case preserve assistance/coverage limits.

## Shared host contract

Runtime response contracts are in `prototype/src/project-types.ts`; all IDs/hashes are lowercase SHA-256 hex. A source snapshot contains excerpt text and full-file hash, not the whole repository.

- `POST /api/session`: strict same-origin bootstrap; sets a fresh HttpOnly SameSite cookie. No credential printed or persisted in source. Static server must verify exact Host; every API checks session and browser origin/site, with bounded bodies and no permissive CORS.
- `GET /api/projects/current`: ProjectInfo.
- `GET /api/projects/:id/files?q=&cursor=&limit=50`: filesPage; stable keyset cursor; max 100; indexing may still be partial.
- `GET /api/projects/:id/source?fileId=&start=1&lines=160`: SourceSnapshot; max 200 lines/40k characters, bounded streaming/hash, no symlink or binary/private-file access.
- `GET /api/projects/:id/scripts`: scriptsSchema; root package scripts only in this first execution adapter, no auto-install or implicit hooks.
- `POST /api/projects/:id/runs`: strict `{scriptId, fileId, sourceHash, manifestHash, approved:true}`; validates fresh source/manifest after explicit consent; returns ProjectRun. Concurrent execution rejected. Retrying POST is unsafe and must not be automatic.
- `GET /api/projects/:id/runs/:runId`: ProjectRun; fixed trusted-repository execution, sanitized environment, bounded output, timeout, and source/manifest recheck before pass.

No backend process can make a generic script pass mean “requirement satisfied.” Root selection authorizes trusted-repository access/execution only after per-operation consent; this is not a hostile-code sandbox. Other language/tool execution adapters remain explicit future work; source indexing/excerpt inspection is language independent for readable text.

## Ownership and acceptance

Backend worker owns only project-service module/tests. Domain/provider worker owns generic project-learning and teaching-service modules/tests. Parent owns shared contracts, launcher integration, UI and docs. Protect all preexisting src/tests/assets and dirty records. No new dependency from this slice or push; the separately owned reuse chat adds its adapter dependency.

Test separate roots, exclusion/path/symlink/session/Origin/command boundaries, source changes and malformed reports. Measure actual indexing/query/source behavior with small fixtures and a larger synthetic index; state observed counts/timings. Final UI opens the actual project, supports paginated search/source selection and user-defined learning records at desktop and narrow widths. Distinguish benchmarked scale, implementation architecture and untested sizes; no “any size guaranteed” claim.

## Companion architecture refinement

Later user steering defines an installable companion alongside the original coding tool. This slice supplies the source-checkout local launcher, native saved-file recorder, durable metadata and selected hash/range history, local website and optional OpenAI adapter. The user chose OpenAI for the first connection. Source versions are host-owned; learning records and bounded generated interpretations are browser-owned. Neither recording nor inspection requires the provider.

GET changes/versions routes expose the latest retained metadata events and selected contexts; ProjectInfo includes capture revision, watching and a redacted watch error. All delegated teaching routes execute only after session and exact mutation-origin checks. Model setup checks available models using explicit credentials; keys live only in host memory. Explain requires exact context consent, store:false, no ambient credentials/retries/fallback/tools, structured line-bounded output and source recheck. Generated interpretation is assistance rather than an executed check.

XP rewards recorded prediction, observation, verification, reflection and a separate case, with duplicate historical evidence deduplicated. Source saves earn nothing. Learner profiles, chapter generation, review scheduling, a standalone installer, extension shared-recorder bridge, tool hooks, Ollama/ChatGPT sign-in and GitHub remain separate planned slices. Larger-repository claims are bounded by the actual10,001-file scan and selected-source benchmark; native watchers, depth, disk and source limits remain visible. The latest user assigns UI/UX to the separate design chat; this chat finishes feature correctness and handoff.
