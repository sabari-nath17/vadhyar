# Selective reuse in Vadhyar

## What is implemented

- **CodeTour:** the existing explanation drives Previous / Next, first-step highlighting, and Export walkthrough. Export uses a native save dialog, explicit overwrite confirmation, current source/requirement identities and inert Markdown text. The file contains only `title`, `steps`, and each step's `title`, `file`, `line`, `description`. No CodeTour extension dependency, commands or JavaScript conditions.
- **OpenSpec:** Import requirement opens a workspace-local Markdown file and a native requirement picker. The selected requirement/scenarios and file revision persist with the session after confirmation. Earlier confirmed records remain. Changing or switching requirements clears current interpretation and run state. Use prepared requirement recovers even if an imported file was removed. Imported scenarios have no automatic executable mapping, and the host rejects NovaDesk ownership checks for them.
- **Promptfoo:** pinned development dependency `0.124.1`. Its custom provider calls the existing production `previewContext`/`explain` and `previewHint`/`requestHint` functions. Responses pass the same validators as the application. Six synthetic validator cases and six live-coach cases cover citation grounding, hint progression, full-fix requests, injection and unsupported verification claims.

Graphify, Vitest, the official OpenAI SDK, native source navigation and checkpoint/diff storage remain in place. The prepared NovaDesk source limitation remains: importing a specification does not enable arbitrary codebase onboarding.

## Use the controls

1. Open Vadhyar in the prepared NovaDesk workspace. Confirm the requirement, refresh relationships, confirm the mapping, preview context and request an explanation.
2. Use Previous / Next or Highlight current step; focus stays in the panel while the editor selection moves.
3. Export walkthrough to a `.tour` file. For CodeTour discovery, save it inside the workspace's `.tours` directory (create that directory if needed). Exports are snapshots; refresh explanations and export again after edits. Vadhyar rejects stale export/navigation; an exported file itself is not a live freshness monitor.
4. To explore another requirement, place a Markdown specification inside the workspace, click Import requirement, select one heading, then confirm it. Headings use `### Requirement: Name` and `#### Scenario: Name`. Fenced examples are ignored; duplicate requirement titles are rejected. Imports are limited to 20 KB, 20 requirements and 40 scenarios per requirement.
5. Imported scenarios display **Not verified**. Return to Use prepared requirement to use the trusted ownership checks.

## Evaluate the coach

Development requires Node 22.22+ (or a supported newer major), as required by Promptfoo.

- `npm run eval:coach -- --offline`: runs only six synthetic response-validation cases. No API key or network request is required by the provider. This does not evaluate teaching quality.
- `npm run eval:coach`: runs all twelve cases, including six live calls using synthetic code/requirements. Supply `OPENAI_API_KEY` and `VADHYAR_EVAL_MODEL` through your process environment. Never paste keys into source or chat. The runner does not read VS Code SecretStorage or `.env` files; missing settings cause a nonzero exit before requests.
- Reports are local ignored files under `dist/evals/`. Caching, telemetry, update checks and database writes are disabled for the command. No evaluation runs automatically with the extension.
- Automated failures remain failures. API rejection/invalid output is an evaluation error, never a fabricated pass. Regex checks are limited detectors, and human review of relevance, clarity and answer leakage is still required. `humanReview: pending` is separate from automated results.

## Provenance

| Upstream | Pinned source / version | Reuse and notices |
| --- | --- | --- |
| Microsoft CodeTour | `29955a004445d3fd2ad5df35dd00f9cc0400ba7d` | New local adapter targets its safe tour fields; unmodified schema copied to `tests/fixtures/codetour.schema.json` for compatibility checks. MIT notice: [CodeTour](third-party/codetour-LICENSE.txt). |
| Fission-AI/OpenSpec | `9111a7654d7800391459431fff4eaf66e33a3d2e` | Markdown requirement/scenario convention, implemented locally; no upstream parser or CLI copied. MIT notice: [OpenSpec](third-party/openspec-LICENSE.txt). |
| Promptfoo | npm `0.124.1`, exact lockfile integrity | Development dependency, no source modifications; MIT notice installed at `node_modules/promptfoo/LICENSE`. |

Cline and Tour de Code AI remain references. Stryker and unlicensed research candidates are not added.

## Evidence and limits

- Typecheck, lint and build passed. Full working-tree tests passed (48 tests), including mock VS Code dialog/navigation/persistence boundaries and mock HTTP calls through the production coach.
- Promptfoo offline validator evaluation passed 2/2. Live evaluation fails explicitly at preflight because no evaluation key/model is configured in this environment; no live quality result is claimed.
- A generated tour passed the pinned upstream CodeTour draft-04 JSON schema using the already installed Ajv validator. A schema check is not a native CodeTour playback test.
- Native CodeTour playback and the new controls in a real Extension Development Host have not been exercised in this task. Read-only inspection found an active S7 learner session; it was not reloaded or altered. Existing native acceptance records are not new acceptance for these additions.
- Existing and concurrently edited S7/UI work is preserved. These additions remain uncommitted; a mixed checkpoint would include work from other tasks. No push.

## Browser adaptation completed — 14 October 2026

Learn Claude Code's source viewer/manual step controls, a TypeScript adaptation of PocketFlow's concept → relationships → order workflow, and the published React Flow library are implemented in the local-project browser source explorer and lesson source view. These were pending during research and are now exercised as a bounded integration.

The adapter uses current protected source reads, strict source identities and an inert map; it does not import an agent runtime or replace Vadhyar's coach/validation. Original notices, exact upstream-file → Vadhyar-file mappings, local modifications, actual checks and remaining coverage limits: [browser reuse](browser-reuse.md), [adoption provenance](browser-reuse-provenance.json) and [integration evidence](browser-reuse-evidence.json). The prior research's no-import/no-execution statements describe that historical phase.
