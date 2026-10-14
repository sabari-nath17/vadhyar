# Upstream reuse assessment

Reviewed 13 October 2026, IST. Twelve public repositories were inspected through original GitHub metadata, pinned default-branch commits, license files, manifests and selected source. These are candidates, not installed dependencies or imported code. Exact refs, inspected paths and blob identities are in [upstream-provenance.json](upstream-provenance.json).

**Recommendation: compose a small browser application around Vadhyar's existing snapshot, privacy and learning-record code. Retain the Graphify adapter as the analysis baseline, use React Flow when the map is needed, and borrow selected teaching/navigation patterns. Avoid a wholesale fork of an agent, wiki or memory platform.**

## 1. Ranked choices

Priority describes fit for this product, not popularity or general quality.

| Repository | Useful contribution | License at inspected ref | Decision |
| --- | --- | --- | --- |
| [Graphify](https://github.com/Graphify-Labs/graphify) | Local code extraction and relationship graph; already integrated | Apache-2.0 plus retained MIT notice for earlier portions | **Retain adapter; verify version/schema before upgrade.** Current Vadhyar accepts 0.9.84; inspected upstream manifest is 0.9.89 |
| [React Flow / xyflow](https://github.com/xyflow/xyflow) | Interactive browser nodes/edges, viewport and keyboard support | MIT repository/library | **Use published package for a small read-only feature map**, after the text path works |
| [CodeTour](https://github.com/microsoft/codetour) | Portable ordered source checkpoints and anchor ideas | MIT | **Adapt a restricted data format**, with Vadhyar's hashes/provenance; keep the existing optional editor integration |
| [Learn Claude Code](https://github.com/shareAI-lab/learn-claude-code) | Readable code presentation, step controls and teaching visualizations | MIT | **Select a few component patterns/content structures** if they beat current house components; do not adopt its executing agent |
| [PocketFlow Codebase Knowledge](https://github.com/The-Pocket/PocketFlow-Tutorial-Codebase-Knowledge) | Identify core abstractions, order explanations, connect chapters | MIT | **Adapt topic-ordering ideas or selected prompts**, keeping Vadhyar's provider and evidence validation |
| [ts-morph](https://github.com/dsherret/ts-morph) | JS/TS compiler wrapper for symbols, types and references | MIT | **Conditional**: first try the already-installed TypeScript compiler on one selected feature; avoid adding a wrapper without repeated need |
| [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) | JS/TS module relationships, cycles and rule checks | MIT | **Conditional alternative for module evidence** if the existing extractor misses a demonstrated need; not a function/runtime graph |
| [Repomix](https://github.com/yamadashy/repomix) | Repository packing, exclusions, token accounting and suspicious-content filtering | MIT | **Defer**: Vadhyar already has bounded capture. Revisit only if larger project selection cannot be handled by it |
| [Tour de Code AI](https://github.com/Tour-de-Code-AI/Tour-de-Code-AI) | LLM-generated tours and staged source explanation | MIT, Microsoft and contributor notices | **Study navigation/order**, not the extension runtime or its permissive capture defaults |
| [Memvid](https://github.com/memvid/memvid) | Portable searchable memory archive and versioned memory cards | Apache-2.0 | **Defer** until a measured cross-session search problem exceeds the existing local records |
| [Langfuse](https://github.com/langfuse/langfuse) | Model traces, evaluation and observability | MIT outside listed enterprise directories; separate enterprise license | **Optional development integration later**; use redacted existing logs/evaluation for the first browser slice |
| [RAG_Techniques](https://github.com/NirDiamant/RAG_Techniques) | Retrieval experiments and educational examples | Custom non-commercial license | **Research reference only; exclude its code from the planned OSS foundation** |

An OSS project should permit downstream commercial use under its chosen open-source license. RAG_Techniques' commercial restriction is materially different from MIT/Apache reuse; public visibility alone is insufficient. [Pinned license](https://github.com/NirDiamant/RAG_Techniques/blob/cbf9e528206bbb5cd23970ff612d12c1074e02dc/LICENSE), [Open Source Definition](https://opensource.org/osd).

## 2. The five screenshot repositories

### Graphify: useful analysis baseline, not the whole learning product

Inspected ref `e8eb76e797bed4f324bf0e1c262984a525aaab3e`, default branch `v8`. The manifest requires Python 3.10+ and Tree-sitter language parsers. Code-only extraction is documented separately from optional semantic/model processing. Reviewed files: `pyproject.toml`, `graphify/extractors/models.py`, `graphify/extract.py`, README, LICENSE, NOTICE and LICENSE-MIT.

The extractor models preserve declarations, imports/aliases/exports and uses, including type-only information. This is useful structure, but Vadhyar's current adapter accepts file-level extracted call/import edges; it does not yet prove an exact runtime function chain. The large extraction implementation is a poor module to transplant into TypeScript. Keep Graphify behind the existing subprocess/validation boundary rather than fork its entire CLI and semantic stack. [Extractor models](https://github.com/Graphify-Labs/graphify/blob/e8eb76e797bed4f324bf0e1c262984a525aaab3e/graphify/extractors/models.py), [manifest](https://github.com/Graphify-Labs/graphify/blob/e8eb76e797bed4f324bf0e1c262984a525aaab3e/pyproject.toml).

Before adoption: run the current 0.9.84 and candidate 0.9.89 on the same sanitized fixtures, validate schema/provenance and source spans, and preserve unknown/dynamic relationships. Do not silently change the accepted version. Preserve Apache license/NOTICE and the retained MIT notice when distributing covered portions. [NOTICE](https://github.com/Graphify-Labs/graphify/blob/e8eb76e797bed4f324bf0e1c262984a525aaab3e/NOTICE).

### Memvid: potential archive, unnecessary first-loop infrastructure

Inspected ref `e6bd9f7b9c38cd8d5370fa0fc936ac1dcd751813`. Rust crate 2.0.140 requires Rust 1.85+. Reviewed Cargo manifest, memory-card types and memory insertion. Cards include source identifiers, time/version and confidence fields, so a future searchable explanation/history archive is plausible. README performance claims were not reproduced. [Cargo manifest](https://github.com/memvid/memvid/blob/e6bd9f7b9c38cd8d5370fa0fc936ac1dcd751813/Cargo.toml), [memory-card types](https://github.com/memvid/memvid/blob/e6bd9f7b9c38cd8d5370fa0fc936ac1dcd751813/src/types/memory_card.rs).

The reviewed insertion API accepts invalid cards with warnings in its default non-strict schema mode; warning fields include the card value. Its documentation says inserted changes persist when the file is sealed. Those semantics need review before storing sensitive, source-bound learner evidence. Keep Vadhyar's existing validated atomic records as the authority. No Node SDK/API compatibility or archive recovery was tested. [Memory implementation](https://github.com/memvid/memvid/blob/e6bd9f7b9c38cd8d5370fa0fc936ac1dcd751813/src/memvid/memory.rs).

Revisit only after users need useful search across a substantial history. Then measure real recall, file growth, corruption/recovery, deletion and private-content handling. Apache-2.0 reuse remains subject to its notices; this assessment does not import the crate.

### RAG_Techniques: valuable reading, restricted code

Inspected ref `cbf9e528206bbb5cd23970ff612d12c1074e02dc`. This is a collection of retrieval notebooks/scripts rather than a maintained application backend. The license permits non-commercial uses subject to conditions and requires written permission for commercial use; it also imposes contribution/redistribution terms. GitHub metadata reports NOASSERTION. [README](https://github.com/NirDiamant/RAG_Techniques/blob/cbf9e528206bbb5cd23970ff612d12c1074e02dc/README.md), [license](https://github.com/NirDiamant/RAG_Techniques/blob/cbf9e528206bbb5cd23970ff612d12c1074e02dc/LICENSE).

Do not copy its notebooks, scripts or prompts into the proposed permissive OSS product. Read it to identify retrieval questions, then research permissively licensed primary implementations or independently implement a justified technique. Start with deterministic source selection and validated relationships; a vector database or elaborate RAG stack is not required to teach one rule. No retrieval benchmark or example script was executed.

### Langfuse: optional observability, disproportionate full fork

Inspected ref `65fdd26b9eca61eba5bd69e8706a5e63508fcbb8`. The root license grants MIT outside `ee/`, `web/src/ee/` and `worker/src/ee/`, which use the enterprise license; third-party components retain their own terms. This is not a blanket MIT license for the whole tree. [Root license](https://github.com/langfuse/langfuse/blob/65fdd26b9eca61eba5bd69e8706a5e63508fcbb8/LICENSE), [enterprise license](https://github.com/langfuse/langfuse/blob/65fdd26b9eca61eba5bd69e8706a5e63508fcbb8/ee/LICENSE).

The reviewed Compose setup includes web/worker, Postgres, ClickHouse, Redis and MinIO. That is unnecessary infrastructure for a single-user local browser learning loop. Trace schema accepts input/output/metadata, so sending full prompts or source into traces creates another data boundary. Keep existing redacted operation logs and offline evaluation initially. [Compose](https://github.com/langfuse/langfuse/blob/65fdd26b9eca61eba5bd69e8706a5e63508fcbb8/docker-compose.yml), [trace schema](https://github.com/langfuse/langfuse/blob/65fdd26b9eca61eba5bd69e8706a5e63508fcbb8/packages/shared/src/domain/traces.ts).

Later use an optional SDK integration rather than fork the application. Inspect the exact SDK's license/version separately, make tracing opt-in, test redaction and deletion, and keep model quality separate from learner outcomes. The SDK and self-hosted runtime were not installed in this review.

### Learn Claude Code: teaching UI donor, not command authority

Inspected ref `ce8f9f186058939da54c9d6fead78dfb5d0fd6c3`. Its web manifest uses Next/React; useful small files include `web/src/components/code/source-viewer.tsx` and `web/src/components/visualizations/shared/step-controls.tsx`. The latter separates explanation text from previous/next/reset/playback controls. The source viewer uses Python-oriented highlighting, so it cannot be assumed to cover Vadhyar's JS/TS code. [Source viewer](https://github.com/shareAI-lab/learn-claude-code/blob/ce8f9f186058939da54c9d6fead78dfb5d0fd6c3/web/src/components/code/source-viewer.tsx), [step controls](https://github.com/shareAI-lab/learn-claude-code/blob/ce8f9f186058939da54c9d6fead78dfb5d0fd6c3/web/src/components/visualizations/shared/step-controls.tsx).

Adapt selected patterns using existing Vadhyar controls/styling where possible. Preserve MIT notices for copied substantial code. Check keyboard labels, focus, pause/reduced-motion behavior and a text equivalent for animation before use; no rendered component was tested here.

The first agent lesson is intentionally simple: the model can repeatedly invoke a shell runner with a small substring denylist and `shell=True`. That is educational code, not an appropriate execution boundary for a learning companion. Do not transplant it or give the coach command/edit authority. Teach the agent mechanism as a read-only simulation if useful. [Agent loop](https://github.com/shareAI-lab/learn-claude-code/blob/ce8f9f186058939da54c9d6fead78dfb5d0fd6c3/s01_agent_loop/code.py).

## 3. Additional foundations worth considering

### React Flow: use the library, not the canvas source

Inspected `@xyflow/react` manifest version 12.12.0, MIT, with React peer support declared at 17+. This includes Vadhyar's React major by declaration, but runtime compatibility was not tested. Reviewed public exports and the ReactFlow container, including keyboard/accessibility and viewport options. [Manifest](https://github.com/xyflow/xyflow/blob/3d35b57317576b0916c0bfeaaedd573aaacc2839/packages/react/package.json), [container](https://github.com/xyflow/xyflow/blob/3d35b57317576b0916c0bfeaaedd573aaacc2839/packages/react/src/container/ReactFlow/index.tsx).

Render only a focused feature path first, with source navigation and edge provenance. Keep graph editing disabled. Provide the same path as an ordered text list; library accessibility features do not establish accessibility of Vadhyar's composed interface. Pro examples/services were not inspected and are not part of the MIT reuse recommendation.

### CodeTour and Tour de Code AI: adapt safe checkpoints and ordering

CodeTour's schema includes source files/lines/selections, references and descriptions. It also permits command URIs and a JavaScript-evaluated visibility condition. A browser importer should whitelist inert descriptions and validated source anchors, reject commands/evaluated conditions, and add immutable content identities. Current Vadhyar already has an optional tour integration; a second tour engine is unnecessary. [Pinned schema](https://github.com/microsoft/codetour/blob/29955a004445d3fd2ad5df35dd00f9cc0400ba7d/schema.json).

Tour de Code AI's generator is tightly coupled to VS Code and produces proposed tours from summarized context. Its local Repomix-style service defaults to a 50 MB per-file ceiling, security checks off, excludes tests/config/type declarations, and writes a source-containing debug XML file in the workspace. These are observations at the pinned ref, not a claim about every configuration/version. They conflict with Vadhyar's bounded context, check evidence and redacted diagnostics. Adapt presentation ideas rather than these capture defaults. [Generator](https://github.com/Tour-de-Code-AI/Tour-de-Code-AI/blob/85f5718629d63083f2bdb83a2072a223be8a6a02/src/generator/tour-generator.ts), [capture service](https://github.com/Tour-de-Code-AI/Tour-de-Code-AI/blob/85f5718629d63083f2bdb83a2072a223be8a6a02/src/repomix/repomix-service.ts).

CodeTour's inspected default-branch commit dates to August 2025; Tour de Code AI's to January 2026. This is a maintenance signal to investigate, not proof either is abandoned. Avoid forking their whole extension unless a demonstrated gap cannot be solved through a safe format.

### PocketFlow: ordering helps; generated relationships are proposals

The reviewed flow fetches a repo, identifies abstractions, analyzes relationships, orders chapters, writes and combines a tutorial. Selected node code concatenates file context and asks a model for relationships. File indices/citations and ordered concepts are useful ideas; model-generated relationships must not become extracted evidence in Vadhyar. [Flow](https://github.com/The-Pocket/PocketFlow-Tutorial-Codebase-Knowledge/blob/05b24cbbb0fe409c5e23c9791f0342f07524ffdc/flow.py), [nodes](https://github.com/The-Pocket/PocketFlow-Tutorial-Codebase-Knowledge/blob/05b24cbbb0fe409c5e23c9791f0342f07524ffdc/nodes.py).

Adapt selective concept-ordering/prompt patterns within current context limits and provider validation. Do not add the Python/PocketFlow framework just to reproduce an already existing source-to-topic action. A generated chapter is an explanation artifact; Vadhyar still needs independent prediction, transfer and revision-linked history.

### ts-morph and dependency-cruiser: solve different evidence gaps

ts-morph's Project loads compiler/config state, source files and dependencies unless relevant options disable them; its CallExpression exposes compiler-derived type information. Prefer a bounded read-only compiler experiment before using a full repo-loading wrapper. Do not let config/dependency resolution escape the approved source boundary, and do not use source mutation APIs in a coach. [Project](https://github.com/dsherret/ts-morph/blob/f288183ddb496adc6f4c5b6929830b5b73437185/packages/ts-morph/src/Project.ts), [CallExpression](https://github.com/dsherret/ts-morph/blob/f288183ddb496adc6f4c5b6929830b5b73437185/packages/ts-morph/src/compiler/ast/expression/CallExpression.ts).

dependency-cruiser 18.6.0 declares Node 22/24/26+ compatibility aligned with Vadhyar and provides a programmatic cruise API. It can support module import/cycle evidence. Its cache validates freshness, but this is not Vadhyar's source/requirement identity system and it does not prove function execution. [Manifest](https://github.com/sverweij/dependency-cruiser/blob/59606f7133843b190aa328c95d5c676631ca45f1/package.json), [API](https://github.com/sverweij/dependency-cruiser/blob/59606f7133843b190aa328c95d5c676631ca45f1/doc/api.md), [implementation](https://github.com/sverweij/dependency-cruiser/blob/59606f7133843b190aa328c95d5c676631ca45f1/src/main/cruise.mjs).

Do a comparison outside the production path, then select the smallest extractor sufficient for supported repos. Do not run Graphify, ts-morph and dependency-cruiser together by default. Even compiler-resolved calls need limits for dynamic dispatch and framework wiring.

### Repomix: optional bounded ingestion aid

Reviewed file search, security-check orchestration and filtering. Suspicious file results are filtered out of the raw-file list; security checks also accept Git diff/log content. This provides useful ingestion ideas, but passing a secret detector does not establish permission to share private business logic. [Security check](https://github.com/yamadashy/repomix/blob/55c6de6aebde4c38877fbcaf005c4cc396bf6e2d/src/core/security/securityCheck.ts), [filter](https://github.com/yamadashy/repomix/blob/55c6de6aebde4c38877fbcaf005c4cc396bf6e2d/src/core/security/filterOutUntrustedFiles.ts).

Vadhyar already limits file count, per-file size and total capture, excludes private-looking content and previews selected context. Preserve that authority. Add repository packing only for a measured context-selection problem; never automatically send an entire packed repo or persist a raw debug copy.

## 4. Adoption gates and ownership

| Candidate action | Small acceptance task before implementation commitment | Why it matters |
| --- | --- | --- |
| Keep/upgrade Graphify | Frozen tiny fixtures: direct call, alias/import, type-only import, callback, unsupported dynamic case; compare old/new validated output and platform launch | Exact source/provenance and honest coverage |
| Try installed TypeScript compiler | Same fixtures, bounded in-memory source, source spans and unresolved cases; select one approach before B2 | Function-level evidence without speculative graph infrastructure |
| Add React Flow | Three-to-five-node path, keyboard/text navigation, real React/browser render and zero graph-edit authority | Useful orientation and accessible interaction |
| Adapt teaching UI/tour data | One prediction before reveal; reject command/evaluated/escaping tour fields; no raw HTML/unsafe Markdown | Learning value with safe source navigation |
| Adapt concept ordering | Three proposed topics anchored to current spans; explicit inferred rationale; no full-repo/model auto-send | Useful prioritization without invented certainty |
| Optional memory/tracing later | Representative history search or trace diagnosis, storage/privacy/recovery checks and exact package licenses | Prove necessity before adding a subsystem |

No acceptance task above was executed during this research. Pin the chosen package release/commit and record the actual test result when implementation starts.

For substantial copied code, record upstream URL, commit, path, license, preserved notices, local modifications and owner in a third-party attribution file. MIT notice preservation and Apache license/NOTICE/change obligations follow the specific source license; dependencies and optional commercial/enterprise components require separate review. Do not assume screenshots, README claims, GitHub license badges or a public repository grant identical rights to every file.

## 5. What Vadhyar still needs to own

The differentiating work remains small but essential:

- Confirmed product intent distinct from inferred explanation.
- Consequential-rule selection and honest caller/coverage evidence.
- Predictions before answer reveal, graded assistance and a fresh transfer case.
- Source/requirement-bound attempts, conservative invalidation and durable history.
- Protected local service, explicit source-sharing/check consent and browser lifecycle.
- Separate beginner/developer experiences measured on the same underlying evidence.

Neither a dependency map, generated wiki nor a memory archive supplies that complete loop. Keep it in the current TypeScript/React codebase; upstream modules should support it rather than determine the product.

## 6. Bounded critic pass

| Challenge | Revised decision / unresolved proof |
| --- | --- |
| “Open source” seed has commercial restrictions | Exclude RAG_Techniques code; retain concepts as research leads |
| Fresh README promises exact logic | Require source spans, edge provenance and unresolved cases; README is not execution evidence |
| More graph engines imply better understanding | Compare one bounded feature; select one production analysis path |
| Games create false mastery | Keep participation separate from independent transfer; no measured efficacy claim |
| Browser independence adds risky local authority | First specification must include protected API, approved roots and no automatic test/model execution |
| Full forks seem faster | Existing core + selected library/pattern reuse minimizes migration and support burden; actual integration effort remains unmeasured |

Three initial research agents completed their work. Follow-up repository/critic agents hit the account usage limit; the primary agent completed the pinned source/license review and this bounded self-review. This is not an independent security audit or a runtime acceptance.
