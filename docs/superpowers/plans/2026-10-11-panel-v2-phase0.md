# Vadhyar panel v2 Phase 0 implementation plan

> Execute sequentially in this chat. Preserve the pre-UI checkpoint; do not dispatch implementation writers.

**Goal:** A bundled, accessible component library and development `/gallery`, verified at 320/360/720px in light/dark/high-contrast.

**Architecture:** Keep the existing App, ProjectPanel, PanelAction and ProjectAction contracts. Mount the gallery before acquiring the VS Code API; its interactions are local previews. Scope new tokens and styles to `.vd-v2`, leaving the live panels unchanged.

**Tech stack:** Existing React, TypeScript, CSS, esbuild, Vitest and native HTML dialog. Hand-authored SVG; existing local WOFF2 fonts.

**Spec:** [design-v2.md](../../../design-v2.md), [DESIGN.md](../../../DESIGN.md), [attached simplification plan](../../panel-v2/simplification-plan.md).

## Constraints

- Consent, storage, validation, requirement/mapping approvals and runners stay host-owned and unchanged.
- No new runtime network calls or font fetch; no new dependency.
- Retain all existing features, Project Guide data and protected learner sessions.
- Historical developer evidence is labelled; no authorship or mastery claim.
- Assets precede screens, per the user's ordering override.

## Review focus

- Missing/stale evidence cannot earn stickers or current verification.
- Disabled buttons stay keyboard reachable, explain their prerequisite and cannot submit.
- Sheets move focus, trap it natively, close on Escape and restore it.
- Theme tints/borders/text and long labels remain legible without horizontal overflow.
- Loading/cancellation previews never imply an actual request; gallery never contacts the host.

## Batch 1 — assets and specification

Files: `media/{brand,guide,path,stickers,gates}/*.svg`, asset provenance; this plan, `design-v2.md`, feature inventory.

- [ ] Generate all 26 self-contained SVGs with the required dimensions/groups; preserve original wordmark.
- [ ] Validate SVG structure, absence of executable/external content, sizes and inventory.
- [ ] Review every asset at 32px and 360px in the gallery asset view.

## Batch 2 — tokens and components

Files: `src/panel/v2/{tokens,components}.css`, `components.tsx`, `feedback.tsx`, `evidence.ts`; `fonts.css`, `assets.d.ts`; `tests/panel-v2.test.ts`.

Consumes: existing `Control`, `PanelState`, workflow `steps`, `availableSteps`, `completedSteps`, `currentRun`.

Produces: `StickerButton`, `ActionBar`, `ProgressSegments`, `AnswerCard`, `FeedbackSheet`, `PathNode`, `Chip`, `Banner`, `RequirementFrame`, `Guide`, `ProofSticker`, `Disclosure`. Evidence guards derive earned displays from existing records.

- [ ] Add focused evidence/structure/accessibility tests; label the intentional red run.
- [ ] Implement components and theme-scoped semantic tokens with no host action changes.
- [ ] Inspect the diff; run typecheck, lint and focused tests.

## Batch 3 — gallery and verification

Files: `src/panel/v2/{gallery.tsx,gallery.css,gallery-evidence.json,route.ts}`, UI-only App mount guard; `scripts/gallery.mjs`, one package script, build SVG loader; gallery evidence/docs.

- [ ] `/gallery` and `#/gallery` mount without acquiring or posting to VS Code; normal mount remains unchanged.
- [ ] Local-only server serves built assets and gallery, with no workspace or session exposure.
- [ ] Rehearse radio, disabled, cancellation, sheet Escape/focus and disclosure interactions.
- [ ] Capture and inspect the requested nine width/theme combinations; compute contrast and overflow from rendered elements. Also test HC light.
- [ ] Run focused/full tests, typecheck, lint, build and offline coach validators; confirm host/protected-data hashes unchanged.
- [ ] Update task record and design evidence with observed results and limitations. Stop at Phase 0.

## Direction contract

THESIS: A readable component specimen prepares one-decision lessons without modifying today's workflows.
OWN-WORLD: Supplied parchment/charcoal, ochre go, teal recorded matches, terracotta broken rule; rounded sticker controls and manuscript requirement.
STORY: Inspect a component, interact with its state, inspect the recorded provenance.
FIRST VIEWPORT: Original wordmark, gallery title/disclosure, theme/view controls, compact registry, requirement and Guide; one sticky primary at the bottom.
FORM: Precisely specified component gallery, code-led; seed not applicable.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
