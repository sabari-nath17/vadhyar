# Vadhyar working browser mock

A local, interactive prototype for reasoning about one consequential code decision. Six destinations: Today, Learn, Practice, Project, Progress and Notebook. “About Vadhyar” opens the website view and returns to the same learning space.

## Run

From the repository root, use the existing installed dependencies:

```sh
node prototype/build.mjs
node prototype/serve.mjs
```

Open [the local prototype](http://127.0.0.1:4173). The server binds to `127.0.0.1` and serves only its compiled assets. `VADHYAR_MOCK_PORT` may select another local port. Stop the server with the terminal's interrupt action. Root extension bundles are unaffected.

## Try the complete slice

Start the prepared NovaDesk ownership lesson. Confirm the rule, inspect its condition, record a prediction and reasoning, then reveal the prepared different-client result. Run mock checks before selecting the ownership condition to see the disclosed failure. Select the condition, rerun the three browser cases, save a reflection and answer the separate archived-state question. Review the exact original prediction in Progress; search/export reflections and personal notes in Notebook.

Project can simulate a later revision. The earlier attempt stays historical and cannot continue against the new source. Start a fresh lesson to investigate that revision. Guided/developer choices adjust explanatory presentation; both keep the same evidence prerequisites. Preferences change the displayed goal; they do not infer ability.

## Limits that matter

- Prepared excerpts and simulated actors only. No repository access, file editing, actual project test scripts, authentication or AI API integration.
- Selecting the condition evaluates a fixed browser rule on three active-milestone cases. The archived answer is recorded separately; no learner-authored archived guard is executed.
- No grade, mastery, authorship, hiring signal, learning gain or institution approval is established. Practice supplies no in-app hints; outside assistance is self-declared and unverified.
- Records use this browser's local storage under `vadhyar.mock.v1`. Use one tab for recording. Optimistic identity/version checks detect sequential conflicts, including resets, but simultaneous cross-tab read/write transactions are not atomic.
- Malformed data is retained and blocks overwriting. Genuine storage failures keep validated work in the current tab with a warning, export and retry. Closing/reloading unsaved work can lose it; browser unload prompts depend on the browser.
- Reset removes only this prototype's key after an in-product confirmation. Export first. Notes are plain user text, not a tamper-proof institutional assessment record.
- Development diagnostics disclose operation categories only. This mock makes no model requests and has no credentials. No analytics or external fonts are loaded.

## Checks

```sh
npx tsc -p prototype/tsconfig.json
npx eslint prototype/src prototype/*.ts prototype/*.mjs
npx vitest run --config prototype/vitest.config.ts
node prototype/build.mjs
node --test prototype/server.test.mjs
```

Domain tests cover gating, immutable source context, corrupted/inconsistent restores, historical revisions, storage failure/recovery, reset/tab conflicts and review export. The server test covers asset serving, Host/method/path restrictions and escaping symlinks. Root checks remain separate. Browser QA and limitations are recorded in the root project records.

## Design and source credits

- [Evidence review and research limitations](../docs/research/2026-10-14-industry-learning/README.md)
- [Roasted findings and revised product decisions](../docs/research/2026-10-14-industry-learning/decisions.md)
- [Mock specification](../docs/superpowers/specs/2026-10-14-browser-mock-design.md)
- [Implementation plan](../docs/superpowers/plans/2026-10-14-browser-mock.md)
- [UI critique and corrections](ui-review.md)
- [Product logic and real-browser acceptance](logic-contract.md)

The original wordmark comes from `website/assets/vadhyar-logo.png`. Inter, Playfair Display and JetBrains Mono fonts are reused from the repository with their OFL notices in `assets/`. React, Zod, TypeScript, esbuild and Vitest reuse existing dependencies. `Control` reuses the existing panel button and unavailable-reason pattern; existing panel source is unchanged. The visual concept and lotus/books illustration were generated using Codex's built-in image generation; the illustration is an asset, not a screenshot substituted for functioning UI. No upstream product or research implementation code was copied.
