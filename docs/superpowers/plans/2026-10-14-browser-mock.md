# Browser Mock Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans sequentially. Preserve the existing mixed checkout; no implementation writers.

**Goal:** A polished, working browser-local Vadhyar mock with six destinations, one complete prepared lesson and a connected website.

**Architecture:** Isolated prototype React app, explicit prepared data and small domain/persistence helpers; static loopback server serves only built assets. No repository service or remote coaching.

**Tech Stack:** Existing React, TypeScript, Zod, esbuild, Vitest; Node static HTTP; bundled assets.

**Spec:** [browser mock design](../specs/2026-10-14-browser-mock-design.md).

## Global constraints

- User-authorized working mock only; all simulated behavior labelled.
- Six destinations and six lesson stages; browser-local storage only.
- No new dependency, secret access, source edit, external AI call, push or publication.
- Existing fonts/brand; flat parchment surfaces; one dominant action; keyboard/narrow layouts.

## Review focus

- Predictions and verification cannot skip real prototype prerequisites.
- Saved evidence binds to a prepared source revision and survives refresh.
- Storage corruption/failure preserves data and cannot claim a successful save.
- Stale evidence remains inspectable, never displayed as a current mock pass.
- Static server cannot expose repository files or accept non-loopback Host/methods.

## Task 1: Prepared learning model and persistence

Files: prototype/src/model.ts, prototype/model.test.ts, prototype/tsconfig.json.

Consumes: prepared ownership rule and stage order. Produces: newState, transition, restoreState, read/write browser storage and Markdown export.

- [x] Write focused failing tests for gated prediction, role/ownership/archive behavior, stale history, corruption and save failure.
- [x] Implement bounded records and transitions using existing Zod and pure data; rerun tests and strict typecheck.

## Task 2: Coherent interactive surface

Files: prototype/src/{App,Lesson,Pages,Website}.tsx, prototype/src/style.css, prototype/index.html, prototype/build.mjs, prototype/serve.mjs, prototype/README.md.

Consumes: Task 1 state/transitions. Produces: six working destinations, full lesson, source/diff, Notebook/search/export, Website and built assets.

- [x] Generate the master visual reference; carry the agreed design tokens and exact navigation into code.
- [x] Implement focused components with existing house controls/assets; keep App as routing/state composition.
- [x] Check the diff; run isolated typecheck, lint, focused tests and build.
- [x] Verify static-server path/Host/method boundaries with a self-check.

## Task 3: Rendered acceptance and checkpoint

Consumes: built prototype. Produces: actual interaction/screenshots and truthful records.

- [x] Verify all destinations and the complete lesson, reload, stale history, Notebook/export and responsive widths.
- [x] Inspect rendered screenshot against visual reference; repair concrete typography/layout/interaction issues.
- [x] Run root typecheck/lint/full tests without rebuilding the protected extension bundle.
- [x] Validate preservation hashes and local links; append actual IST timestamp/outcomes to root records.
- [x] Stage only owned paths/record additions, inspect staged diff and commit; no push.

## Execution ruling

Native sequential implementation follows the user's explicit build authorization. No new design approval gate is inferred from routine implementation choices. A headless browser may verify privately without opening a user-facing preview; user controls when to open the result.

## Actual outcomes

Research and independent critiques shaped the mock and its declared limits. Domain tests: 13/13; server boundary test: 1/1. Strict prototype checks/build and root typecheck/lint/full suite passed (134 tests, 29 files). IAB tested the full local flow; its narrow viewport clamped at 520px, so separate existing headless Chromium contexts verified all six pages plus failed verification and Website at 1440/390/320px. Completed automated contexts had no app console errors, external requests or document overflow. Additional keyboard, corrupt-storage and actual sequential-tab checks passed. New core/model logic was rerun after each correction.

Protected source/tests/fixtures/media/website hashes remain identical to the initial mixed checkout. No dependency, package/lockfile, source, extension bundle, push or deployment change. Authenticated repository integration and learner efficacy remain separate next-slice/evaluation work.
