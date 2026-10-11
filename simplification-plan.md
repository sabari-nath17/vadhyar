# Vadhyar UI Simplification Plan (zero feature loss)

| | |
|---|---|
| **Version** | 1.0.0 |
| **Audience** | Codex or an engineer implementing `design-v2.md` against the current panel |
| **Relationship** | Constrains *how* v2 is implemented. Layout density and feature-placement rules here win over `design-v2.md` §6 if they conflict. Everything else is inherited. |
| **Evidence base** | Three screenshots of the current panel (before v2) in a light, a parchment and a high-contrast dark theme, plus the earlier first-screen screenshot and the product feature inventory. |

## 1. The rule

> **Move, don't remove.** Every feature that exists today keeps a home. Simplification comes from showing less at once, not from having less.

- **R1.** No host action, approval, disclosure or evidence item is deleted.
- **R2.** Any feature is reachable in **2 interactions or fewer** from a lesson screen (3 from the path home).
- **R3.** One task per screen. Default view shows only: rule, progress, current task, primary action.
- **R4.** Max **two nesting levels** (page → card). No cards inside cards inside cards.
- **R5.** Context stays pinned: header, rule and progress at top; the primary action at the bottom. Only the task scrolls.
- **R6.** Technical terms and diagnostics live behind Details, never in the default view.
- **R7.** Every component is legible in light, dark and high-contrast themes (see §6).
- **R8.** Consent, validation, storage and check behavior are untouched.

## 2. What the screenshots show

| # | Finding | Evidence | Fix |
|---|---|---|---|
| F1 | The step grid uses about a fifth of the visible panel | Six large numbered cells in a 3×2 grid, plus a locked reason line ("After inspecting saved changes.") | One compact segmented bar (8px) with `Observe · 4 of 6`. Locked reason appears when a locked segment is tapped |
| F2 | Boxes nest three deep | Outer task card → dashed prediction card → double-frame executed card, then a note, then the button | Flat ledger: predicted / code did / rule says as rows inside one card; the result opens in a sheet |
| F3 | The executed card is unreadable in one theme | Dark terracotta fill with near-invisible label and body text | Tint fill at low alpha; text uses `--fail-text` or the foreground color; contrast test in the gallery |
| F4 | The primary action disappears in the high-contrast dark theme | "Investigate this result" has no fill or border | High-contrast themes use `--vscode-button-*` plus a 2px `--vscode-contrastBorder` |
| F5 | Primary styling differs per theme with no system | Blue in one theme, ochre in another, bare text in a third | One primary component with explicit light/dark/HC variants (design.md §2) |
| F6 | Context scrolls away | The header and requirement are cut off at the top | Sticky top region (≤ 136px) and sticky bottom action bar; scroll resets to the task on step change |
| F7 | Three equal-weight rows at the bottom | "Evidence so far", "Technical details", "Take a short break" | Evidence and Details move into one **Evidence sheet** (tabs); the break moves to the menu and the path |
| F8 | Setup and requirement admin sit in the lesson | Refresh, Save checkpoint, API key, Preview context in the earlier screen | Header menu (⋯) and the expandable rule bar (see §4) |
| F9 | Jargon | "checkpoints", "source relationships", "skipped", "validated source reference" | Plain labels in the default view; the exact terms stay in Details |
| F10 | Seed text leaks into the demo | Prediction reasoning starts "Developer rehearsal:" | Demo mode prefills plain learner-style text or leaves it empty |
| F11 | Source highlight selects the whole file (lines 1–15) | The editor selects 1–15, and the Copilot chat shows an `approval.ts:1-15` context pill | Highlight only the decision lines (decorations plus reveal range). **Verify with the host owner first**: native selection may be intentional |
| F12 | The wide panel wastes space | The panel is about 760px wide, with content stretched across it | Wide mode: 480px lesson column plus Guide art (design-v2 §4) |

## 3. Target anatomy

```text
360px (docked)                       760px (editor tab)
┌───────────────────────────┐        ┌──────────────────────────────────────────┐
│ logo        chip     ⋯    │ pinned │ logo                  chip         ⋯     │
│ rule bar (1–2 lines)  ▾   │ ≤136px │ rule bar                                 │
│ Observe · 4 of 6  ▮▮▮▮▯▯  │        │ Observe · 4 of 6  ▮▮▮▮▯▯                 │
├───────────────────────────┤        ├─────────────────────────┬────────────────┤
│                           │        │ task (max 480px)        │  Guide art     │
│  ONE TASK (scrolls)       │        │                         │  (sticky)      │
│                           │        │                         │                │
├───────────────────────────┤        ├─────────────────────────┴────────────────┤
│ [ Primary action ]  quiet │ pinned │ [ Primary action ]  quiet                │
└───────────────────────────┘        └──────────────────────────────────────────┘
```

- **Header chip:** `Current code` / `Earlier code` (replaces "Confirmed for this session · 0 checkpoints" in the default view; the full text lives in the expanded rule bar).
- **⋯ menu:** Settings. Connect or replace API key, Refresh context, Requirement options (import, prepared exercise), Export walkthrough (when one exists), Take a short break, Demo mode, Sound.
- **Rule bar:** the requirement in 1–2 lines. Tap to expand: acceptance cases, capability label, checkpoint status, Save a snapshot, Requirement options.
- **Evidence sheet:** opened from a header chip. Tabs: *Timeline and handover* | *Technical details*.
- **Progress bar:** segments are buttons. Tap a done segment to revisit; tap a locked one to see why it is locked.

## 4. Feature parity matrix

"Taps" counts interactions from a lesson screen. All 28 inventory items remain.

| # | Feature | New home | Taps |
|---|---|---|---|
| 1 | Open Vadhyar (command) | Unchanged. Opens the path or resumes the last step | 0 |
| 2 | Secure API setup | Understand gate when no key, and ⋯ › Connect OpenAI | 0 / 2 |
| 3 | Current requirement | Rule bar, always visible | 0 |
| 4 | Requirement confirmation | Step 1 Confirm, primary action | 0 |
| 5 | Requirement import | Rule bar › Requirement options | 2 |
| 6 | Prepared requirement selection | Rule bar › Requirement options | 2 |
| 7 | Acceptance scenarios | Rule bar (expanded) and Confirm step | 1 |
| 8 | Source checkpoint | Rule bar › Save a snapshot of this code | 2 |
| 9 | Source relationships | Runs on entering Understand; "Update code connections" quiet action; diagnostics in Details | 0 / 1 |
| 10 | Mapping confirmation | Understand gate "Review these links" (before sharing) | 0 |
| 11 | Source navigation | Source chips (native editor opens immediately) | 1 |
| 12 | Context preview | Share review gate with expandable payload, before any send | 0 |
| 13 | AI explanation | Understand content | 0 |
| 14 | Ordered walkthrough | Understand › Explain further | 1 |
| 15 | Walkthrough export | Export button in the walkthrough header, also in ⋯ | 2 |
| 16 | Prediction | Step 3 Predict | 0 |
| 17 | Prediction locking | Predict primary action | 0 |
| 18 | Counterexample | Runs after prediction save; result in Observe | 0 |
| 19 | Prediction comparison | Observe ledger | 0 |
| 20 | Progressive hints | Change › Hint button (3 tiers) | 1 |
| 21 | Learner edit | Native editor (focus chip in Change) | 1 |
| 22 | Native diff | Change › See my change | 1 |
| 23 | Full verification | Step 6 Verify | 0 |
| 24 | Evidence summary | Evidence sheet and Completion screen | 1 |
| 25 | Technical details | Evidence sheet › Technical details | 2 |
| 26 | Refresh controls | ⋯ › Refresh context; contextual "Refresh" on stale banners | 2 / 1 |
| 27 | Snake break | ⋯ › Take a short break; path node | 2 |
| 28 | Prepared-exercise and imported-requirement disclosures | Rule bar chip (always) and Confirm step | 0 |

Rows 5, 6, 8, 25 are the "admin" features; they are still two taps away and appear in the Evidence sheet or rule bar, never removed.

## 5. Before → after, by element

| Current | After |
|---|---|
| "Understand this change" page title and description | Header wordmark plus rule bar; the description moves into the Start sheet |
| Section headings (Requirement, Current source, Explain current source, Predict and observe) as one long page | Steps, one per screen |
| Buttons of equal weight (Refresh, Save checkpoint, Refresh relationships, Preview context…) | One primary per screen; admin actions in ⋯ or rule bar |
| Step grid | Segmented bar |
| Nested Observe cards | Ledger and `bad` sheet |
| "An observed result does not establish understanding." | Caption under the sheet, in one short sentence (proposed rewrite: "A result shows what happened, not why. Next, find why.") |
| "One case executed; 2 skipped." | "This case ran. The other two run in Verify." (confirm the host meaning first) |
| Evidence / Technical / Break rows | Evidence sheet and ⋯ menu |
| API key block mid-lesson | Gate only when needed; otherwise ⋯ |

## 6. Theme and contrast rules (fixes F3–F5)

- Every colored fill uses a **low-alpha tint**; text on it uses the semantic text token, never a brand fill color.
- Never place dark text on a dark fill. The gallery MUST compute contrast for each component, in each theme, and fail below 4.5:1 (3:1 for large text and UI borders).
- High-contrast themes: drop brand colors; use `--vscode-foreground`, `--vscode-editor-background`, `--vscode-button-*`, `--vscode-contrastBorder`, `--vscode-focusBorder`. Buttons keep a visible 2px border and a visible label.
- One primary component with four variants: light, dark, HC dark, HC light.

## 7. Space budget (acceptance numbers)

| Region | Budget at 360×640 |
|---|---|
| Pinned top (header + rule bar + progress) | ≤ 136px |
| Action bar | ≤ 88px |
| Task area | ≥ 416px; the primary action visible without scrolling on every step |

At 760px wide the task column is 480px max, and nothing stretches edge to edge.

## 8. Copy fixes (proposals; confirm meanings with the host owner)

- Replace "checkpoint" in default views with "snapshot of this code". Keep "checkpoint" in Details.
- Replace "source relationships" with "code connections".
- Replace "validated source reference(s)" with "linked code locations" (keep "verified" if the host verified them).
- Remove seed prefixes like "Developer rehearsal:" from anything shown to a learner.
- Keep every honesty statement; shorten, don't delete.

## 9. Feature parity test

1. Create `feature-parity.json`: one entry per row in §4 with `id`, `hostAction`, `route` (the interaction path) and `maxTaps`.
2. A script drives the gallery or the panel, follows each route, and asserts the control exists and is enabled when its preconditions hold (disabled controls show their reason).
3. CI fails if any entry is unreachable or exceeds `maxTaps`.
4. Add a manual checklist of the 28 features to the PR template.

## 10. Order of work for Codex

1. Read `design.md`, `design-v2.md`, `PRODUCT.md`, then this file.
2. Build `feature-parity.json` from the current panel **before changing any UI**; commit it.
3. Implement the pinned top region, compact progress and ActionBar; move admin controls to ⋯ and the rule bar.
4. Collapse each step to one task; flatten nesting (R4).
5. Build the Evidence sheet; move Evidence, Technical details and the break.
6. Fix theme variants (§6) and add the contrast test.
7. Apply the copy fixes after confirming meanings.
8. Run the parity test, then screenshots at 360, 760 in light, dark and high-contrast. Report any deviation.

## 11. Prompt for Codex

```text
Simplify the Vadhyar panel as described in simplification-plan.md, using
design-v2.md for the visual language. Do not remove or change any host action,
approval, disclosure or evidence item. Start by writing feature-parity.json
from the current panel, then simplify. Every feature must stay reachable in
two taps or fewer. Fix the contrast issues in §6 and add the automated
contrast and parity tests. Report before/after screenshots for 360px and
760px in light, dark and high-contrast themes.
```

## 12. Open items

- Confirm the meaning of "skipped", "checkpoint" and "validated source reference" before rewording (§8).
- Confirm whether source highlighting by editor selection is intentional (F11).
- Choose the default entry: path home on first run, resume on later runs (recommended).
- Nothing here has been built or tested yet.

## 13. Implementation rulings for this branch

- The frozen host and contracts at `29db3ef` win over automatic-extraction proposals. Code connections are refreshed on the existing explicit action.
- The existing combined Save-and-check flow waits for the host prediction acknowledgement before checking. A restored prediction retains the explicit Run saved check action. No new automatic execution is added.
- Checkpoint means a captured source snapshot, not recovered author history. Skipped cases are not executed; show the recorded count and retain the exact runner details. Source references are validated locations, not proof of behavior.
- Preserve actual prediction/reflection text and provenance; never disguise a developer rehearsal record as a learner response. New input starts empty.
- Native source selection stays unchanged. Decision-line-only decoration needs a separately authorized host change.
- First entry remains path home with a visible resume action. The host stage remains authoritative.
- Project Guide remains a separate native editor command; this panel cannot launch it through an unsupported message or command URI.
- The parity inventory includes the newer transfer, reflection, memory and Project Guide controls omitted by the supplied 28-row list. Routes count panel interactions to reach or invoke the feature after its declared preconditions; typing and native confirmation are separate.
- CI component-route checks and recorded browser interaction checks are complementary. Neither establishes a native Extension Development Host pass.
