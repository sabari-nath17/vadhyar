# Vadhyar 0.1.1 — complete feature inventory

Implementation checkpoint: [`4f36cedcb93940e526165fbf94d6681542f54066`](https://github.com/sabari-nath17/vadhyar/tree/4f36cedcb93940e526165fbf94d6681542f54066). Matching [installer/source/manifest](https://github.com/sabari-nath17/vadhyar/releases/tag/v0.1.1). The older 0.1.0 installer is the earlier S7 feature set.

Every item below is present in this frozen implementation. Source presence, automated tests, historical native/live acceptance and current package checks are different forms of evidence. The release’s fresh gate passed typecheck/lint/build, 134 tests, six **offline synthetic** validators and isolated CLI installation; it made no API call. Row-specific native/live records are separately dated historical evidence, not a new native run of this safety-patched installer.

Current native CodeTour playback, connected agent capture, live build-plan acceptance and human teaching-quality review remain **unverified**. The redesigned panel is preserved separately and excluded at the user’s 07:50 IST cutoff.

## NovaDesk — prepared learning workflow

| Feature | Existing implementation | Verification and limits |
| --- | --- | --- |
| Six stages: Confirm → Understand → Predict → Observe → Change → Verify | [shared.ts](../src/shared.ts) — `learningStage / availableSteps` | [Evidence](s12-evidence/ui-acceptance.json). Historical native flow; current suite checks contracts. |
| Requirement and acceptance-case review with explicit confirmation | [extension.ts](../src/extension/extension.ts) — `confirmRequirement` | [Evidence](s12-evidence/ui-acceptance.json). Requirement confirmation is separate from execution. |
| Markdown import and return to the prepared requirement | [requirements.ts](../src/extension/requirements.ts) — `importRequirement / usePreparedRequirement` | [Evidence](s12-evidence/ui-acceptance.json). Imported scenarios are descriptive; no automatic trusted-check mapping. |
| Source checkpoints and requirement revision history | [session.ts](../src/extension/session.ts) — `requirements / checkpoints` | [Evidence](s13-evidence/release.json). Earlier valid records are retained. |
| Real Graphify extraction and learner-confirmed source mapping | [graphify.ts](../src/extension/graphify.ts) — `refreshGraph / confirmMapping` | [Evidence](s13-evidence/release.json). Prepared NovaDesk adapter; external Graphify 0.9.84 required. |
| AI explanations grounded in validated source references | [coach.ts](../src/extension/coach.ts) — `previewExplain / explain` | [Evidence](s13-evidence/release.json). Model interpretation; historical live evidence, no new release API call. |
| Native source navigation and highlighting | [source.ts](../src/extension/source.ts) — `openSource / walkthroughStep` | [Evidence](s12-evidence/ui-acceptance.json). Current identities and validated paths/lines required. |
| Previous/Next walkthrough and CodeTour-compatible export | [walkthrough.ts](../src/extension/walkthrough.ts) — `walkthroughStep / exportWalkthrough` | [Evidence](../tests/reuse.test.ts). Safe-format/schema checks; native CodeTour playback remains UNVERIFIED. |
| Prediction and reasoning saved before the counterexample | [extension.ts](../src/extension/extension.ts) — `savePrediction → runCounterexample` | [Evidence](s13-evidence/release.json). Real ordering recorded; developer rehearsal is not learner mastery. |
| Actual trusted ownership counterexample execution | [checks.ts](../src/extension/checks.ts) — `runOwnership` | [Evidence](submission-evidence/verification.json). Fresh packaged runner observed approval and a failed requirement; outside VS Code. |
| Compare predicted, observed and required behavior | [app.tsx](../src/panel/app.tsx) — `Observation` | [Evidence](s13-evidence/release.json). Actual outcome retained; no fabricated success. |
| Three levels of progressive hints | [coach.ts](../src/extension/coach.ts) — `previewHint / requestHint; hintSchema levels 1–3` | [Evidence](../tests/hints.test.ts). Automated validators and historical live hints; teaching quality remains unreviewed. |
| Learner editor responsibility, saved refresh and native before/after diff | [extension.ts](../src/extension/extension.ts) — `openDiff` | [Evidence](s12-evidence/ui-acceptance.json). Host does not repair source; recorded acceptance edits were explicitly developer-assisted. |
| Full owner, different-client and freelancer rerun | [checks.ts](../src/extension/checks.ts) — `runFullOwnership / ownership suite` | [Evidence](submission-evidence/verification.json). Fresh actual packaged seed 2/3; developer ownership correction 3/3. |
| Archived-milestone follow-up with four checks | [transfer.test.ts](../fixtures/novadesk/transfer.test.ts) — `startTransfer / transfer suite` | [Evidence](submission-evidence/verification.json). Fresh developer correction 4/4; preserves ownership cases. |
| Hint use recorded; execution problems separate from requirement failure | [shared.ts](../src/shared.ts) — `HintEvidence / RunnerOutcome` | [Evidence](../tests/ownership-runner.test.ts). Execution errors/timeouts are not learner answers. |
| Saved learner reflections | [session.ts](../src/extension/session.ts) — `ReflectionEvidence / saveReflection` | [Evidence](s13-evidence/release.json). Local authored text; no mastery score. |
| Evidence journey: requirements, checkpoints, explanations, predictions, hints, changes and results | [handover.ts](../src/extension/handover.ts) — `sessionEvidence` | [Evidence](s13-evidence/release.json). Saved identities determine current versus historical status. |
| Markdown evidence handover export | [handover.ts](../src/extension/handover.ts) — `handoverReport / exportHandover` | [Evidence](s13-evidence/release.json). Inert snapshot with native save/overwrite review. |
| Restore after reopening the panel or restarting the extension | [session.ts](../src/extension/session.ts) — `loadSession / saved current stage` | [Evidence](s13-evidence/release.json). Historical native restart; fresh automated resume/preservation checks. |
| Stale evidence after source, requirement or trusted-check changes | [extension.ts](../src/extension/extension.ts) — `revalidate / currentRun` | [Evidence](../tests/session-controls.test.ts). Stale links/results cannot be presented as current verification. |

## Project Guide — experimental ordinary-project workflow

| Feature | Existing implementation | Verification and limits |
| --- | --- | --- |
| Start tracking from a captured project baseline | [model.ts](../src/project/model.ts) — `captureProject / projectStart` | [Evidence](strengthen-evidence/acceptance.json). Historical native unrelated SeatCheck fixture; bounded context. |
| Track additions, modifications and deletions across files | [model.ts](../src/project/model.ts) — `changes / snapshots` | [Evidence](../tests/project-model.test.ts). Captured eligible files only; omissions disclosed. |
| Manual feature intentions and Markdown specification import | [controller.ts](../src/project/controller.ts) — `projectAddIntent / projectImportIntent` | [Evidence](../tests/project-controller.test.ts). Imported text remains unconfirmed until reviewed. |
| Confirm expected behavior and preserve earlier intention revisions | [model.ts](../src/project/model.ts) — `intents / supersedes / confirmation history` | [Evidence](../tests/project-controller.test.ts). PRD changes require reimport and fresh confirmation. |
| Switch among saved feature intentions | [controller.ts](../src/project/controller.ts) — `projectSelectIntent` | [Evidence](../tests/project-controller.test.ts). Restores associated guidance; freshness still checked. |
| Suggest relevant files; learner confirms selected context | [controller.ts](../src/project/controller.ts) — `projectSuggestFiles / projectUseGroup / projectSelectFiles` | [Evidence](learning-topics-evidence/README.md). Model groups are proposals, not discovered requirement proof. |
| Native tracked-source diffs | [controller.ts](../src/project/controller.ts) — `projectOpenDiff` | [Evidence](strengthen-evidence/acceptance.json). Snapshot-bound source; historical native diff. |
| Source-linked explanation of purpose, logic and consequence | [coach.ts](../src/project/coach.ts) — `projectPreview explain / requestProject` | [Evidence](strengthen-evidence/acceptance.json). Historical live unrelated-project explanation; validated references. |
| Proposed build plans and reviewable/copyable coding prompts | [controller.ts](../src/project/controller.ts) — `projectPreview plan / projectCopyPrompt` | [Evidence](../tests/project-coach.test.ts). Implemented and simulated/tested; live build-plan acceptance remains UNVERIFIED. |
| Focused learning topics tied to a function or condition | [topics.ts](../src/project/topics.ts) — `decisionChange / confirmed LearningTopic` | [Evidence](learning-topics-evidence/README.md). Historical T1 native grouping and focused explanation. |
| Topic requirement, selection rationale, dependencies and review coverage | [project.tsx](../src/panel/project.tsx) — `related requirement / exact decision / rationale / callers / omissions` | [Evidence](learning-topics-evidence/README.md). Five disclosures; unreviewed content is not represented as reviewed. |
| Clarify an ambiguous requirement connection | [controller.ts](../src/project/controller.ts) — `projectUseGroup native requirement picker` | [Evidence](learning-topics-evidence/README.md). Explicit confirmation required; no matching requirement leaves it unconfirmed. |
| Bounded static Graphify calls/imports | [topics.ts](../src/project/topics.ts) — `extractProjectRelationships` | [Evidence](learning-topics-evidence/README.md). Separate T1 project adapter; not a complete graph or runtime trace. |
| Select and explicitly approve an existing project check | [checks.ts](../src/project/checks.ts) — `projectSelectCheck / projectRunCheck` | [Evidence](strengthen-evidence/acceptance.json). Fixed npm args; fresh source/manifest review; implicit pre/post hooks disabled. |
| Actual check outcomes tied to source and intention | [shared.ts](../src/project/shared.ts) — `CheckResult snapshot / intentRevision / packageHash` | [Evidence](strengthen-evidence/acceptance.json). Script success is not complete PRD compliance. |
| Historical guidance after project changes | [controller.ts](../src/project/controller.ts) — `selectedGuide / snapshot and revision guards` | [Evidence](learning-topics-evidence/README.md). Stale topic/navigation disabled; earlier records preserved. |
| Restore intentions, source history, guidance and check records | [model.ts](../src/project/model.ts) — `project.json / snapshot references / guides / checkRuns` | [Evidence](strengthen-evidence/acceptance.json). Historical native restart; previews/raw check output are intentionally not restored. |
| Optional agent-intent command/event-file capture bridge | [capture-intent.mjs](../scripts/capture-intent.mjs) — `vadhyar.captureIntent / intent-events.json` | [Evidence](project-guide.md). Bridge implemented; connected capture remains UNVERIFIED. Helper is in source ZIP; installed host accepts the command/event file. |

## Shared controls and editor experience

| Feature | Existing implementation | Verification and limits |
| --- | --- | --- |
| OpenAI masked native connection and VS Code SecretStorage | [extension.ts](../src/extension/extension.ts) — `setupKey` | [Evidence](s13-evidence/release.json). No credential value read or copied during release preparation. |
| Exact context preview and explicit consent before sharing | [coach.ts](../src/extension/coach.ts) — `previewContext / previewHint / context identities` | [Evidence](../tests/source-boundary.test.ts). Project Guide uses its separate exact projectPreview; no automatic API call. |
| Configurable coaching model | [package.json](../package.json) — `vadhyar.model` | [Evidence](../tests/coach.test.ts). Configured model reused; no automatic routing. |
| Cancellation, timeouts and visible errors | [checks.ts](../src/project/checks.ts) — `AbortController / request timeout / process timeout` | [Evidence](../tests/red-team-check-process.test.ts). Cancellation/start/timeout/abnormal exit remain execution problems. |
| Validated references, model responses and panel messages | [shared.ts](../src/shared.ts) — `strict Zod panelAction and response schemas` | [Evidence](../tests/coach-reliability.test.ts). Guardrails tested; semantic teaching quality remains human-review pending. |
| Workspace Trust and bounded execution controls | [extension.ts](../src/extension/extension.ts) — `trusted workspace / prepared runner / selected project script` | [Evidence](../tests/red-team-checks.test.ts). Trust is not a sandbox; approved project code may modify files. |
| Atomic local persistence and recovery safeguards | [session.ts](../src/extension/session.ts) — `atomic temporary write/rename; versioned migration` | [Evidence](../tests/session-resume.test.ts). Project model also atomically writes its separate record; failed writes preserve valid history. |
| Show memory location | [extension.ts](../src/extension/extension.ts) — `showMemoryLocation` | [Evidence](../tests/session-controls.test.ts). Reveals Vadhyar’s workspace-local storage only. |
| Confirmed Clear NovaDesk session preserving other data | [session.ts](../src/extension/session.ts) — `clearNovaDeskSession` | [Evidence](../tests/session-controls.test.ts). Native modal; preserves credentials, Project Guide and workspace source. |
| Light/dark/high-contrast, bundled fonts and keyboard controls | [tokens.css](../src/panel/tokens.css) — `native theme tokens / fonts.css / focus-visible` | [Evidence](s12-evidence/ui-acceptance.json). Historical native themes/keyboard plus simulated width matrix; redesigned UI excluded. |
| Local Snake break separate from learning evidence | [snake-game.tsx](../src/panel/snake-game.tsx) — `SnakeGame / local game state` | [Evidence](../tests/snake.test.ts). Game score is not learning progress. |
| VSIX packaging and installation/setup documentation | [package.json](../package.json) — `package:vsix / production allowlist` | [Evidence](submission-evidence/verification.json). Fresh official CLI install and eight core hashes; macOS-arm64 only. |
