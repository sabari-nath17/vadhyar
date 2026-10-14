# Vadhyar V1 — revised implementation plan

Prepared 10 October 2026. This is the original VS Code extension build plan; its repository-setup status is historical. Actual extension gates and the separate browser companion work are recorded in [the slice ledger](../tasks/todo.md) and [the browser prototype plan](superpowers/plans/2026-10-14-project-agnostic.md).

## 1. Outcome and scope

**Vadhyar helps a beginner understand and independently change one feature in their own AI-built project.**

Entry point: after an AI coding session, the learner selects **Understand this change**. Vadhyar connects the requirement to the current implementation, asks for a prediction, demonstrates behavior, provides hints, and records the learner's change and verification.

V1 supports the prepared NovaDesk project in one local desktop VS Code workspace. Its reusable modules are real, but this version does not claim arbitrary repository onboarding or automatic whole-PRD mapping.

Success is an inspectable chain: requirement → current code → prediction → observed behavior → learner edit → checks → follow-up challenge. The final report states what happened and how much assistance was used. It makes no mastery or learning-gain claim.

## 2. Reuse decisions

| Component | V1 decision | Why |
|---|---|---|
| Graphify | Direct local CLI dependency; read its JSON | Reuse code relationships while keeping the coach's context bounded |
| CodeTour | Adapt the ordered navigation model and safe field subset; native VS Code navigation | Obtain the useful walkthrough interaction without another extension's runtime and command surface |
| Tour de Code AI | Reference only | Its context-to-tour pipeline overlaps the coach; adopting it alongside CodeTour duplicates infrastructure |
| Cline | Reference only; no source transplant initially | V1 only needs snapshots and comparisons, which platform primitives can supply |
| OpenSpec | Borrow requirement/scenario conventions; no CLI dependency | Preserve intent and acceptance cases without adding a proposal-management workflow |
| Vitest | Direct development dependency and fixed scenario runner | Reuse actual execution and machine-readable outcomes |
| Promptfoo | Development-only coach evaluation after the first working loop | Exercise response quality separately from product behavior |
| StrykerJS | Deferred | Mutation selection and educational value would add another product problem |

The [source register](reuse-sources.md) records inspection boundaries. No external implementation code was imported during repository setup.

## 3. Architecture and storage

### Small stack

Use TypeScript throughout, React for the panel and NovaDesk preview, CSS with VS Code theme variables, esbuild for extension/webview bundles, Vite for the preview, Zod for external message/model validation, the official OpenAI SDK, and Vitest. Use one npm lockfile for the Vadhyar workspace. Keep the Graphify Python CLI separately pinned.

The extension host owns context collection, Graphify invocation, snapshots, API calls, verification, and storage. A single webview renders state and sends validated action messages. No Vadhyar web server, database, vector store, agent framework, or cloud account system is required.

Use native VS Code source navigation and a read-only virtual-document provider with `vscode.diff` for baseline/current comparison. Do not embed a second code editor. Source explanations appear in the Vadhyar panel beside the user's editor.

### Ownership of data

| Data | Location / owner |
|---|---|
| Requirement and scenarios | A short versionable Markdown file in the NovaDesk project |
| Approved scenario manifest | Vadhyar-owned fixture asset containing entrypoint, source allowlist, case IDs and check fingerprints |
| Graph artifacts | Graphify output directory, generated locally and excluded from source control |
| Source checkpoints, session state, attempts and run records | Workspace-scoped extension storage, with atomic writes |
| OpenAI key | VS Code SecretStorage |
| Redacted development diagnostics | VS Code output channel |

A requirement file has a stable ID, requirement text, and Given/When/Then scenarios. Vadhyar imports that specific prepared file and asks the learner to confirm the text. Changes create a new requirement version. Do not require a general Markdown/PRD interpreter.

The initial snapshot is the source available when the learner starts a session. Earlier history exists only if Vadhyar captured it; do not imply it recovered the original AI session. A Save checkpoint action supports starting tracking earlier without monitoring every keystroke or capturing unrelated prompts.

### Minimal contracts

| Record | Required meaning |
|---|---|
| Requirement | Stable ID, revision, confirmed text and scenario IDs |
| Checkpoint | File manifest, exact source contents, content hash, capture time |
| SourceRef | Host-issued ID, relative path, 1-based line span, symbol, checkpoint identity |
| TourStep | Title, description, SourceRef ID; no executable fields |
| LearningSession | Requirement/checkpoint IDs, current stage, predictions, attempts, hints and learner reflections |
| CheckRun | Case IDs, individual outcomes, process status, bounded logs, timestamps and input fingerprints |

Messages from the panel: start session, open source reference, submit prediction, request hint, run named checks, refresh context, submit reflection, open diff, clear Vadhyar session. Define a discriminated union and validate it in the host. The panel cannot choose arbitrary paths, commands, or tool names.

## 4. Runtime behavior

### Graphify and grounded walkthrough

Start with the previously inspected `graphifyy==0.9.84` candidate and Python 3.10+. Verify that release, installation, output shape, and local execution in the first integration slice; record the actual version used. The documented extraction command is `graphify extract ./src --code-only --no-cluster`, run from NovaDesk with argument arrays and a controlled executable.

Index source only. Validate graph schema/version, node locations, and edge provenance. Resolve the scenario's configured approval entrypoint and select at most five nearby relevant nodes. Graphify supplies relationships; the OpenAI operation orders and explains only host-validated source IDs. Label inferred links. The learner confirms the mapping to their requirement.

Refresh extraction explicitly after relevant source edits. Keep old evidence as history but disable stale source navigation until refreshed. Do not install Git hooks or silently use an old graph as current. A failed graph refresh is a visible setup/context error, not permission to invent a map.

CodeTour-inspired data is restricted to ordered textual steps and validated source locations. Exclude commands, JavaScript conditions, arbitrary URIs, raw HTML and command links. Preserve license notices if source/schema material is later adapted; the initial implementation can use native platform calls without transplanting CodeTour code.

### OpenAI coach

Use Responses API with Structured Outputs. The prior plan's initial model candidate is `gpt-6-astra`; confirm current official API documentation and account access before choosing it in the build. Keep the selected model ID in one user-level setting. Report an unavailable model rather than silently changing it.

Operations are **Explain**, **Hint**, and **Reflect**. Each receives only the selected requirement, relevant source excerpts/references, graph links and necessary session evidence. Reflection may also receive the current diff and actual check outcomes. Fixed host-controlled requests are sufficient; do not add an autonomous tool loop.

Hint progression: ask a conceptual question, direct attention to a relevant source location, then suggest a debugging action. Do not return replacement functions, patches, or a completed exercise. Record the hint level. A schema/prompt can limit output but cannot guarantee the absence of semantic answer leakage; include human review of coach samples.

Show the context-sharing preview before the first API transmission. Reconfirm if additional files outside the previously approved set would be sent. Cancel or retry API errors without losing attempts. Use a bounded request timeout, no unbounded retries, and visibly mark pending/error states. Record actual latency and token usage where available; no performance claim precedes measurements.

### Verification and stale-state rules

Use fixed NovaDesk check IDs and runner arguments. The host starts checks only when the learner asks. It reads process status and Vitest's structured results; the model cannot edit them or determine pass/fail.

Verification identity includes requirement revision, all allowed source files, expected check definitions, relevant build configuration and lockfile. Dirty buffers block execution. Hash before and after the run; a mismatch invalidates the result. Reject changes to fixture check definitions/configuration as an unsupported scenario change and offer a fresh demo copy. Do not reapprove modified tests automatically.

Represent outcomes separately: passed, failed, execution error, timeout, stale, and not run. Reducing test counts, missing expected case IDs, malformed reports or a process crash must not become a pass. The source code is not a hostile-code sandbox; support only the trusted prepared workspace and strip credentials from child-process environments.

## 5. Build as complete slices

Each slice produces an observable capability. Keep existing project task records; do not overwrite unfinished unrelated work. Approximate effort budgets below are planning allocations, not delivery promises.

| Slice | Work and skill use | Acceptance / gate | Budget |
|---|---|---|---|
| 0. Scope and contracts | Use project-architect, spec-driven-development, api-and-interface-design. Record source ownership, prepared scenario and message/record types. | Scope matches this plan; fixtures/checks are distinct from learner source. | 0.5 h |
| 1. Walking skeleton | Use incremental-implementation and openai-docs. Create tiny NovaDesk domain functions, panel shell, real Graphify extraction, and one live Explain request. | A real source link opens correctly and a validated API explanation appears. Missing dependencies fail clearly. **Gate A.** | 2 h |
| 2. First whole learning loop | Use test-driven-development and incremental-implementation. Capture requirement/prediction, execute ownership case, request a live hint, accept learner edit, rerun checks, show native diff. | Seeded failure becomes a real pass only after the learner's edit. Show requirement → source → result on one screen. **Gate B.** | 3 h |
| 3. Evidence and resume | Use api-and-interface-design, incremental-implementation and security-and-hardening. Add durable snapshots, fingerprints, context refresh and stale/error handling. | Reopen preserves progress; edits invalidate results; modified checks cannot produce a trusted pass. **Gate C.** | 2 h |
| 4. Transfer and coach checks | Use test-driven-development and openai-docs. Add archived-milestone exercise and small Promptfoo evaluation set. | Independent attempt is distinguished from coached attempt; refusal, invented references and answer leakage are evaluated. | 1.5 h |
| 5. Usability and review | Use frontend-ui-engineering, impeccable and code-review-and-quality. Complete panel states and exercise the real extension host. | Keyboard/focus/theme checks pass; stale/error states are understandable; actual editor run succeeds. | 1.5 h |
| 6. Package and rehearse | Use documentation-and-adrs, sales-demo-script, demo-readiness and shipping-and-launch. Package VSIX, document prerequisites/notices, rehearse reset, record backup. | Fresh demo copy installs and runs; live path and labelled backup are usable. **Gate D.** | 2 h |

Allow another 1–2 hours for integration problems if the development schedule permits. Reserve the final quarter of available time for verification, packaging and rehearsal; shrink visual polish first. Do not drop real API usage, actual execution, source evidence or the learner's edit to meet a deadline. If a mandatory integration fails, report the blocked gate and the actual reduced demo capability.

Use planning-and-task-breakdown throughout and debugging-and-error-recovery on observed failures. Companion skills are loaded by stage, not all at once. No additional agent or separate task is authorized by this plan.

## 6. Test and evaluation plan

These are planned checks; creating this document does not mean they ran. Follow the host's testing authorization before execution.

**NovaDesk:** same domain functions power its React preview and checks. Simulated actors and in-memory state keep the fixture small. Original rule: only the owning client can approve. The bug permits any client. Transfer rule adds an archived-milestone restriction while preserving ownership and role checks.

- Owner/client/active accepted; other client rejected; freelancer rejected.
- Owner/client/archived rejected only after the transfer requirement is added.
- Incorrect edits remain failures; original positive behavior must stay intact.
- Product CI separately tests that the intentionally broken fixture yields expected failures; do not interpret the fixture's deliberate red checks as a broken product suite.

**Integrity:** nonexistent source, invalid span, escaping path/symlink, stale graph, dirty buffer, concurrent edit, changed requirement, changed tests/config, missing case, timeout, corrupt stored record, API refusal and invalid structured output.

**Coach:** keep 8–12 cases covering grounded explanation, wrong prediction, useful first/second hint, request for the full answer, source prompt injection, nonexistent citation, stale input and insufficient evidence. Deterministic assertions cover shape and evidence IDs. Human review covers pedagogy and answer leakage. Store a small redacted evaluation report; model-based grading alone is not proof.

**Editor:** real Extension Development Host checks for key setup, context preview, source navigation, selection highlight, save/stale transitions, native diff, run results, restart/resume, focus and keyboard navigation. Browser checks cover NovaDesk's preview only. A mocked webview test cannot establish host integration.

**Release:** build/package commands, fresh VSIX install, Graphify/Node prerequisite diagnostics, dependency/license review and a complete rehearsal. Freeze dependency versions in the shipped lockfiles and setup notes once verified.

## 7. Three-minute story and demo recovery

| Time | Action | What it proves |
|---|---|---|
| 0:00–0:25 | Show requirement and happy-path owner approval. State that the sample has a seeded bug. | Intended rule and working surface are clear. |
| 0:25–0:55 | Open Vadhyar's short source walkthrough; record a prediction about another client. | Guidance uses this project's code and records the learner's reasoning. |
| 0:55–1:20 | Run the counterexample and inspect the unexpected approval. | The disagreement is observed in execution. |
| 1:20–2:00 | Request one hint, edit the ownership condition in VS Code, rerun all ownership cases. | Human changes the code and results follow that change. |
| 2:00–2:35 | Add the archived requirement; complete the small transfer edit without a supplied patch. | The workflow supports applying the same reasoning to another case. |
| 2:35–3:00 | Show requirement versions, before/after source, assistance and outcomes. | The final claim is inspectable. |

The presenter rehearses this sequence; do not describe the presenter as an independently evaluated novice. Invite a separate novice session after the demo to measure actual transfer, time and hint use. Claims about long-term learning remain unvalidated.

Reset by creating a fresh marked disposable NovaDesk copy and opening it; preserve the learner's old copy. Never use a broad Git reset on a user's working project. A backup recording must be labelled recorded, not presented as a live model response. API failure leaves source and prior evidence available but cannot claim new coaching happened.

## 8. Handoff and omissions

Deliver one source project, a VSIX, setup/prerequisite guide, third-party attribution record, brief architecture decisions, completed task/gate status, demo script and a verified backup recording. Do not publish to a marketplace or submit externally without applicable authorization.

Deferred: general repository imports, full PRD drift auditing, generic course generation, alternative implementation recommendations, automatic repairs, live Git hooks, all-editor support, cloud sync and mutation-generated exercises.

Material unresolved risks: Graphify installation/schema compatibility, API model access/latency, quality of hints, and beginner usability. The integration gate and pilot observations resolve different risks; neither substitutes for the other.

## 9. Later browser companion status — 14 October 2026

The local browser project companion is a separate, source-checkout prototype built after this extension plan. Its current path is a local Node recorder and browser learning workspace beside the learner's editor on the same computer. It supports the Vadhyar folder or another explicitly selected trusted project; it does not assume the NovaDesk fixture. Eligible saved-file metadata, source history, attempt records, feature concepts and approved check receipts are bound to their captured identities.

The bounded first slice is implemented: local setup, project selection, saved-change recording, Path/Project/Notebook, a six-activity learning sequence, source-linked concepts, manual or explicitly approved project checks, export/recovery, and an optional consented OpenAI teaching adapter. Recording and inspection continue without a provider. The browser path has its own [project-agnostic specification](superpowers/specs/2026-10-14-project-agnostic.md), [implementation plan](superpowers/plans/2026-10-14-project-agnostic.md), [setup and measured limits](../prototype/README.md), [UI acceptance receipt](../docs/design/2026-10-14-duolingo-minimal/implementation.md), and [cross-case contract](../docs/product-logic-contract.md).

Current verification is source-checkout typecheck, lint, unit/service tests, build and recorded same-computer browser journeys. A Node 26.7.0/macOS smoke also indexed and paged 100,000 synthetic JavaScript files and captured a saved change in 17.4 seconds; this verifies metadata handling on that host, not full-source analysis or a performance target. These results establish the checked local prototype only. Live API credentials/generation, screen-reader and physical-device acceptance, learning efficacy, complete C01–C25 permutation coverage, universal editor integrations, standalone installation and larger/cross-platform resource limits remain unverified or separate future work. Do not promote this prototype to a packaged release based on this plan alone.

## Browser feature corrections — P01/P06 — 2026-10-14

P01 permits concise, nonblank factual answers for a case, prediction, or assistance note (1–2,000 characters); reasoning and explanatory evidence retain their 8-character minimum. Blank answers and oversized values remain rejected. P06 gives each validated loopback port a distinct session-cookie name, preserving the HttpOnly, SameSite=Strict, Path=/api, exact Host/Origin, session-token and project-boundary checks.

Verification on the combined working tree: root typecheck, lint, build and 134 tests passed; `npm run prototype:check` passed typecheck, lint, build, 98 learning tests and 66 local-service tests. Focused checks passed 41 domain, 20 teaching-service and 34 project-service cases. The independent two-host browser repro on ports 4187/4189 confirmed both local projects could continue source reads and the first project's saved learning records remained intact.

P07 remains open: bounded reading support for the actual repository's longer, connected source. No live provider, learning-efficacy, phone or full C01–C25 claim follows from these checks.
