---
name: Vadhyar
description: Understand what you build — a manuscript margin beside native source.
version: 1.1.3
colors:
  charcoal: "#1E2022"
  parchment: "#F4EFE6"
  ink: "#2C3539"
  terracotta: "#A7413A"
  teal: "#6A8A82"
  ochre: "#D9A05B"
  dark-sunken: "#17191B"
  dark-border: "#747671"
  dark-muted: "#B9B2A5"
  dark-fail-text: "#E39A93"
  dark-pass-text: "#8FB0A7"
  dark-frame: "#CD786F"
  light-sunken: "#FFFFFF"
  light-border: "#8B8273"
  light-muted: "#4E5659"
  light-link: "#8A302A"
  light-pass-text: "#3F5F57"
  light-stale-text: "#725023"
  dark-disabled-bg: "#2A2D30"
  dark-disabled-text: "#9A9488"
  light-disabled-bg: "#E6DFD0"
  light-disabled-text: "#5F676B"
typography:
  scale:
    legacy-label: "11px"
    metadata: "12px"
    form-label: "13px"
    body: "14px"
    teaching: "16px"
    comparison-symbol: "20px"
  title:
    fontFamily: "Inter, var(--vscode-font-family, system-ui), system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Inter, var(--vscode-font-family, system-ui), system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  teaching:
    fontFamily: "'Playfair Display', Georgia, serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.5
  reasoning:
    fontFamily: "'Playfair Display', Georgia, serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'JetBrains Mono', var(--vscode-editor-font-family, monospace), monospace"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: ".06em"
rounded:
  manuscript: "2px"
  control: "6px"
  card: "8px"
spacing:
  4: "4px"
  8: "8px"
  12: "12px"
  16: "16px"
  24: "24px"
  32: "32px"
components:
  primary-button:
    backgroundColor: "{colors.ochre}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
    width: "100%"
  task-card:
    rounded: "{rounded.card}"
    padding: "16px"
  requirement-frame:
    rounded: "{rounded.manuscript}"
    padding: "16px 24px"
---

# Vadhyar Design System

| | |
|---|---|
| **Version** | 1.1.3 (semantic: MAJOR = principle or token-name change, MINOR = new component/state/step, PATCH = clarification) |
| **Scope** | The Vadhyar VS Code extension webview panel and its editor decorations |
| **Status** | Binding source of truth for visual and interaction design; implementation and acceptance limits are reconciled in §17. Keep it in the repo root. |
| **Maintenance rule** | Any PR that changes UI MUST update this file in the same PR (see §14 and §15). |

## 0. How to read this file

This file is self-contained. It assumes no prior conversation, no private mockups and no knowledge of the current app state. Read it fully before touching UI.

- **MUST / MUST NOT** = hard rule. **SHOULD** = default; deviate only with a Decision Log entry (§16). **MAY** = optional.
- **Precedence when rules conflict:** (1) host and VS Code security, validation, consent and accessibility requirements; (2) the MUST rules here; (3) existing code; (4) examples. Examples (including the milestone-approval demo) are illustrative. Never hard-code their content.
- **Stable vs volatile.** §1–§5 and §11–§12 are stable. §6–§8 and §17 change as the app grows; §19 is temporary. If the app and this file disagree, follow §15.

## 1. Identity and principles (stable)

**Product:** Vadhyar. **Tagline:** Understand what you build. **Promise:** turn features AI builds into features the learner understands and can change. **Voice:** patient, clear, precise, approachable; short sentences; name the real operation ("Finding relevant source…"), never "Loading…".

**Concept: the Digital Manuscript.** The panel is a manuscript *margin* beside the real code: a place for translation, annotation and guidance.

The learner must always see three things: **(1) what rule am I working on, (2) what am I investigating now, (3) what should I do next.**

| # | Principle | Rule |
|---|---|---|
| P1 | The code is sacred | Source, line numbers and editor decorations stay native VS Code. No brand fonts or colors on code. MUST NOT embed a second code editor in the panel. |
| P2 | One primary action | Exactly one Ochre primary button per screen. Everything else is quieter. |
| P3 | Explanation is not evidence | Explanations are visually distinct (neutral/dashed) from executed results (solid, semantic color). |
| P4 | Honest state | Never claim more than was executed. "Checks passed" only for executed results tied to the current code. Say "Source-linked explanation", never "Validated explanation". |
| P5 | Heritage is reserved | Playfair, Terracotta frames and ornaments appear only on teacher elements: requirement, hints, reasoning quotes, result summaries. |
| P6 | Progressive disclosure | Technical detail (IDs, hashes, payloads, diagnostics) lives in collapsed sections. |
| P7 | Never color alone | Status = icon + text + semantic color. |
| P8 | Respect the host | Never bypass host validation, consent or sharing approvals when reorganizing UI. |
| P9 | Commit before reveal | A learner's prediction locks before its case runs. Future tasks MUST NOT expose withheld answers. No invented or percentage progress. |

## 2. Tokens (stable names; values may be tuned via §16)

Components MUST consume **semantic** tokens (`--vd-text`, `--vd-border`…), never brand hexes directly. Brand colors are for fills, borders, progress and tints. Terracotta and Teal fail 4.5:1 as small text, so text uses the `*-text` variants. The current text variants were checked by contrast arithmetic: changed text pairs meet 4.5:1, including pass/fail text on the 8% overlays; changed standard-theme UI borders/frames meet 3:1. Native host rendering is a separate acceptance item (§17).

```css
:root {                      /* brand: fixed */
  --vd-charcoal:#1E2022; --vd-parchment:#F4EFE6; --vd-ink:#2C3539;
  --vd-terracotta:#A7413A;   /* error, failed observation, manuscript frame */
  --vd-teal:#6A8A82;         /* verified, done */
  --vd-ochre:#D9A05B;        /* next action, hint, stale */
}
body.vscode-dark, :root { --vd-bg:#1E2022; --vd-sunken:#17191B; --vd-border:#747671;
  --vd-text:#F4EFE6; --vd-muted:#B9B2A5; --vd-link:#D9A05B;
  --vd-fail-text:#E39A93; --vd-pass-text:#8FB0A7; --vd-on-ochre:#1E2022;
  --vd-frame:#CD786F; --vd-primary:var(--vd-ochre); --vd-stale-text:var(--vd-ochre); }
body.vscode-light { --vd-bg:#F4EFE6; --vd-sunken:#FFFFFF; --vd-border:#8B8273;
  --vd-text:#2C3539; --vd-muted:#4E5659; --vd-link:#8A302A;
  --vd-fail-text:#A7413A; --vd-pass-text:#3F5F57; --vd-on-ochre:#1E2022;
  --vd-frame:var(--vd-terracotta); --vd-stale-text:#725023; }
```

- **Theme mapping:** `src/panel/tokens.css` supplies dark defaults on `:root`, light overrides on `body.vscode-light`, and both host high-contrast body classes. For `vscode-high-contrast` and `vscode-high-contrast-light`, **drop brand colors** and use `--vscode-foreground`, `--vscode-editor-background`, `--vscode-contrastBorder`, `--vscode-focusBorder`, `--vscode-button-*`. Layout, icons and labels stay identical.
- **Semantic fills:** `--vd-fail-fill` / `--vd-pass-fill` mix Terracotta / Teal at 8% with `--vd-bg`; `--vd-stale-fill` mixes Ochre at 28%; `--vd-selected` mixes text at 6%. High contrast uses the host background. Requirement frames use `--vd-frame`; executed cards override the frame with their semantic text variant. The six brand values are unchanged.
- **Adding a color:** add a semantic token with dark, light and high-contrast values and a stated contrast ratio. Never use a raw hex in a component.
- **Disabled tokens** (implemented; target ≥3:1 for unavailable controls): dark `--vd-disabled-bg:#2A2D30; --vd-disabled-text:#9A9488;` light `--vd-disabled-bg:#E6DFD0; --vd-disabled-text:#5F676B;`. High-contrast: `--vscode-disabledForeground` (fallback `--vscode-foreground`) with the normal border and host background. Native appearance remains an acceptance item.
- **Spacing** (only): `4 8 12 16 24 32`. Panel padding 16, section gap 12. **Radii:** 2 manuscript frames, 6 controls and banners, 8 cards. **Depth:** flat; no shadows, gradients or glow.
- **Texture:** paper grain only in empty states and presentations, never in the working panel, never behind code.

## 3. Typography (stable)

| Role | Font | Use |
|---|---|---|
| Heritage | Playfair Display 500/600; italic 400 | Requirement text, reasoning quotes, hints, success summaries (15–18px) |
| Interface | Inter 400/500/600 | Titles 16/600, body 13–14, helper 12 |
| Code & labels | JetBrains Mono 400/500 | File refs (`file.ts:8`), results, section labels (11px, uppercase, tracking .06em) |

- Prefer weight over size for hierarchy; max three text levels per screen; line-height 1.4–1.5.
- Code snippets inside the panel use `--vscode-editor-font-family` and editor colors.
- **Implemented font coverage:** eight locally bundled Latin-subset WOFF2 faces: Inter 400/500/600, JetBrains Mono 400/500, Playfair Display 500/600 and italic 400. Teaching prose and reasoning use 16px. Other scripts use the declared platform/Georgia fallback; complete multilingual coverage is not claimed. Each family’s SIL OFL and provenance are in [media/README.md](media/README.md).
- **Implemented size roles:** NovaDesk metadata uses 12px, form labels 13px, body text 14px, teaching/heading text 16px and the comparison symbol 20px. Project Guide retains its existing 11px technical labels. These explicit roles reconcile the existing stylesheet; they do not authorize arbitrary intermediate sizes.
- **Fonts MUST be bundled** (woff2 in the extension, loaded via `webview.asWebviewUri`, CSP `font-src ${webview.cspSource}`). No runtime web-font fetch. Fallbacks: `Georgia, serif` / `var(--vscode-font-family), system-ui, sans-serif` / `var(--vscode-editor-font-family), monospace`. Ship each font's license file.

## 4. Layout contract (stable)

The panel is divided into **slots**. New features fit into an existing slot; a new top-level slot needs a Decision Log entry.

```text
┌──────────────────────────────────────┐
│ [logo]            status        ⚙    │  HEADER
│ ─────────── ◆ ◆ ◆ ───────────        │  DIVIDER (optional)
│ ╔══════════════════════════════════╗ │
│ ║ REQUIREMENT                      ║ │  REQUIREMENT (always visible, compact)
│ ║ Rule in plain prose              ║ │
│ ╚══════════════════════════════════╝ │
│ Step 3 of 6 · Predict  ▮▮▮▯▯▯       │  STEP
│ ┌──────────────────────────────────┐ │
│ │ Current task: one concrete ask   │ │  TASK (current only)
│ │ [ input ]                        │ │
│ │ [  Primary action (Ochre)  ]     │ │  PRIMARY
│ └──────────────────────────────────┘ │
│ + Evidence so far                    │  DETAILS (collapsed)
│ + Technical details                  │
└──────────────────────────────────────┘
```

- Design width **360px**; fluid from **320px** upward. Below 320, stack and wrap; wide content scrolls inside its own `overflow-x:auto` box. The page body never scrolls sideways.
- **Width cap:** when the panel is wider than 680px (for example opened as an editor-area tab), the content column MUST be `max-width:680px; margin-inline:auto` with 16px side padding. Text measure 60–75 characters. Inputs fill the column and never stretch past it. Prefer opening the panel beside the code editor.
- **Implemented registry:** `src/panel/workflow.ts` now has six entries: Confirm, Understand, Predict, Observe, Change and Verify. Before host confirmation only Confirm is available. Completion comes from real confirmation, explanation, saved prediction, completed observation, current diff and current passing full run; never from a preceding index. Transfer and Review are absent.
- **Implemented header:** logo plate and settings icon share a row, with the live status directly below. Settings stays hidden until its icon opens it. The prepared demo visibly states: “NovaDesk’s original teaching seed deliberately omits ownership. Simulated actors are not authentication.”
- **Gating:** the current task is expanded; completed tasks collapse to a one-line summary and stay revisitable; future tasks show only a title and a reason (see Disabled control), never withheld content.
- One vertical scroll surface. Earlier sections stay revisitable. The implementation sets `.vd-panel` to `max-width:680px` including its 16px side padding; frames reduce to 16px all around below 360px.
- **Captured history:** snapshot counts come from the host; earlier authorship and history remain unknown. A snapshot establishes captured code, not who wrote it.
- Hierarchy: requirement → step → task → primary action → evidence/details.

## 5. Components (stable recipes; add via §14)

Use a `vd-` class prefix. Interactive controls: min 44px height/width.

| Component | Rules |
|---|---|
| **Requirement frame** | Manuscript double line: `border:2px solid var(--vd-frame); outline:1px solid var(--vd-frame); outline-offset:-7px; border-radius:2px; padding:16px 24px` (16px all around below 360px). Mono label, Playfair text. Acceptance cases in a disclosure. |
| **Step indicator** | Label `Step N of M · Name` plus M segments. Done = Teal, current = Ochre, locked = `--vd-border`. **N and M MUST be derived from the step registry (§7), never hard-coded.** No percentages. |
| **Task card** | `1px solid var(--vd-border)`, radius 8, padding 16. One title (Inter 600/16), one concrete question, source link in mono. |
| **Option (radio)** | Real `<input type=radio>` + `<label>`, radius 6, neutral border, selected = text-color border + 6% tint. `accent-color: var(--vd-primary)`. |
| **Textarea** | Sunken bg, neutral border, 2 rows, visible label. |
| **Primary button** | Full width, min 44px, `--vd-primary` (Ochre in standard themes) fill, `--vd-on-ochre` text, Inter 600/14. One per screen. Never Terracotta. |
| **Disclosure** | Quiet 44px text button, `+`/`−`, hairlines. Holds IDs, hashes, diagnostics, exact payload. |
| **Prediction card** | Dashed border, label "You predicted · locked", Playfair-italic quote of reasoning. |
| **Executed card** | Manuscript double border. Fail = `--vd-fail-text` border + 8% Terracotta fill; pass = `--vd-pass-text` border + 8% Teal fill. High contrast uses host borders/background. Currentness requires both current source hash and requirement revision. Label carries code version, e.g. "Executed · code v3 · breaks rule". |
| **Disagreement note** | Ochre 28% fill, radius 6, `≠` + one sentence. |
| **Case row** | `✓ Matches rule` (pass-text) / `✗ Breaks rule` (fail-text) with icon, text and word. |
| **Banner** | Radius 6, icon + text + action. Stale/hint = Ochre, failed/error = Terracotta, verified = Teal. |
| **Icon button** | 44×44 hit area, `aria-label` required, stroke icons only, no emoji. |
| **Divider** | Hairline + three small `--vd-frame` diamonds, `aria-hidden`. Use sparingly. |
| **Disabled control** | Use `aria-disabled="true"` (not the `disabled` attribute) so it stays focusable and its reason is readable. Same size; `--vd-disabled-*` colors; never Ochre; never the primary button. MUST show a reason line directly beneath (12px, muted, linked by `aria-describedby`): "Available after …". Prefer hiding actions irrelevant to the current step. Max one disabled control per task card. |
| **Busy control** | While an operation runs: `aria-busy="true"`, label becomes the real operation ("Preparing your explanation…"), a quiet **Cancel** appears, learner input is preserved. |
| **Outcome input** | Up to 4 short choices → radios. More, or long labels → a styled native `<select>` with a visible label and a placeholder ("Choose an outcome"). Show limits as text ("up to 1,000 characters"). |
| **Break** | Optional self-contained extra (currently a small game). Rules in §5.2. |

**Implemented unavailable-control behavior:** `Control` renders a focusable button with `aria-disabled` and a directly following 12px reason linked by a generated `aria-describedby` ID. It prevents unavailable clicks/submission. An unavailable task action replaces `vd-primary` with quiet `vd-unavailable`, so an unavailable control does not stay Ochre. Task-level `aria-busy` and operation-specific status identify running work. The max-one rule and concurrent nested controls remain subject to the reconciliation notes in §17.

### 5.1 Plain language (proposed; validate against host behavior before adopting)

Learner-facing labels use plain words; the exact host term lives in Technical details. Confirm each meaning with whoever owns the host behavior, and never relabel an action in a way that changes what it promises. If "validated" means the host verified the link, keep it ("Verified code locations").

| Current term | Proposed label |
|---|---|
| Refresh current context | Refresh |
| Save source checkpoint | Save a snapshot of this code |
| Captured checkpoints: 0. Tracking begins at capture; earlier history is unknown. | No snapshots yet. History starts from your first one. |
| validated source reference(s) | Linked code locations |
| Refresh source relationships | Update code connections |
| Preview context for Explain | Review what will be shared |
| counterexample | the case that broke the rule |
| Set API key securely | Connect OpenAI (then under Settings) |

### 5.2 Break component

**Implemented:** the collapsed disclosure does not mount `SnakeBoard`; opening mounts it, closing unmounts it and cleans its timers/listeners. The board pauses on blur or document visibility loss. Ticks are 200ms normally and 600ms for reduced motion. Neutral cells and a CSS food shape replace colored status treatments and glyphs; direction controls use stroke SVG. Conditional game actions hide irrelevant controls. Board width is `min(100%,352px)`, within the 360px maximum. The score remains separate from learning evidence.

- A collapsed disclosure labeled "Take a short break", at the end of the panel below Details. MUST NOT auto-start, auto-expand, or sit in the primary slot.
- Inert while collapsed: no timers, listeners or rendering.
- No API calls, no network, no learner data. Its score MUST NOT appear in or affect learning progress, evidence or review; state this in one line of text.
- Neutral palette only (`--vd-sunken`, `--vd-border`, `--vd-text`, `--vd-muted`): no Ochre, Teal or Terracotta, so it is never read as status. Quiet buttons only; no primary. Stroke SVG icons; no emoji.
- Keyboard: board focusable with a visible focus ring; arrows/WASD act only while it has focus; **Escape pauses**; Tab always leaves (never trap focus). 44px direction buttons give a non-keyboard path.
- Auto-pause when the panel is hidden or focus leaves the board. Under reduced motion: no animated transitions; slow the tick or advance on input.
- Announce only state changes (start, pause, game over, score on collect) via `aria-live="polite"`, never every tick. Board scales within the column, max 360px.

## 6. State catalog (volatile; copy is default wording)

| State | Visual | Default copy / recovery |
|---|---|---|
| Predict | Neutral borders | **Save prediction and run case**; "Your prediction locks before the case runs." |
| Observe, disagreement | Terracotta executed card + Ochre note | **Investigate this result** |
| Checks passed | Teal | "Checks passed" only for executed, current-code results |
| Stale code | Ochre banner | "This explanation describes an earlier version." **Refresh explanation** |
| Unsaved changes | Ochre banner | "Save your changes before running checks." |
| No key | Quiet card | "Connect OpenAI to get explanations." **Connect OpenAI** |
| Extracting | Inline status | "Finding relevant source…" |
| API running | Inline status + **Cancel** | "Preparing your explanation…" |
| API error | Terracotta banner | Preserve learner's answer; **Retry** |
| Runner failed | Terracotta banner | "Checks could not run." Distinct from a failed assertion |
| Returning session | Summary | Saved progress + whether evidence is current |
| Confirm | Requirement frame, acceptance cases expanded | Primary: **Confirm this requirement** |
| Gated (prerequisite missing) | Disabled control + reason line | "Available after you confirm the requirement." Never a silent greyed button |

Every new async or failure path MUST define: visual, copy, recovery action, and whether learner input is preserved.

## 7. Step registry (volatile; data, not layout)

Steps are defined as data. The UI renders whatever the registry holds. Counts, names and current index are read from the real six-entry registry; availability and completed styling derive from the host evidence described in §4. Unavailable future navigation exposes a label and linked reason, not its task contents.

| Order | Step | Purpose | Primary action (default) | Withheld until reached |
|---|---|---|---|---|
| 1 | Confirm | Requirement in readable prose; acceptance cases beneath | Confirm this requirement | Everything after |
| 2 | Understand | Short explanation + up to five source links | Continue to prediction | Prediction answers |
| 3 | Predict | One concrete question, choice + short reasoning | Save prediction and run case | Actual outcome |
| 4 | Observe | Prediction beside actual; name the disagreement | Investigate this result | Fix hints |
| 5 | Change | Relevant source link, progressively clearer hints | Run checks on my changes | Solution |
| 6 | Verify | Per-case expected/actual, baseline/current diff | Try the next rule | — |
| (planned) | Transfer, Review | Unassisted attempt; review of edit, assistance used, results | Check my change / Finish session | — |

**Current host action sequence:** **Save prediction and run case** is one learner-facing action backed by two serialized host operations. The panel sends `savePrediction`, waits for the host-published prediction matching the pending source hash and requirement revision, then sends `runCounterexample` with the saved prediction ID. Host persistence and trusted runner checks remain authoritative.

Each explanation answers: **Purpose** (what this code decides), **Logic** (how inputs affect it), **Consequence** (what behavior depends on it), **Source** (clickable link to the real implementation). Keep the first explanation short; extra detail behind **Explain further**.

## 8. Editor integration (volatile mechanics, stable rule: native look)

- CodeLens above the active line, Inter 12/500, e.g. "Vadhyar · Case 2 passes through this line".
- Focus line: Ochre tint `rgba(217,160,91,.16)`, line number in Ochre.
- Executed path: fail `rgba(167,65,58,.12)`, pass Teal tint, via `TextEditorDecorationType` with theme-aware values. Syntax colors untouched.
- Source links trigger native editor navigation immediately, with no animation.

**Implementation boundary:** current source buttons send host-issued IDs for validation and native navigation; native before/after diff remains host-owned. The CodeLens, focus-line and executed-path recipes above are planned. They must not be presented as an implemented runtime trace. P1 requires native editor/CodeLens typography, superseding the Inter 12/500 proposal. A real execution-to-source mapping is required before executed-path decorations ship.

The current-identity walkthrough and escaped CodeTour export controls are preserved in **Explain further and walk through code**. Native dialogs and CodeTour playback are not certified by this visual overhaul.

## 9. Setup and consent (host-owned; preserve)

- Credentials live under **Settings** after setup; use the existing secure native key entry.
- Before any transmission show the selected requirement, files and model; exact payload expandable; button **Send this context for an explanation**.
- Preserve explicit requirement, mapping and sharing approvals when moving controls.
- **Current sharing summary:** selected requirement and both actual filenames come from the exact payload, with model and expandable instructions/context before Send. Malformed or unavailable summaries prevent transmission. Key entry remains native; key presence is not a credential audit.
- **Concurrent import scope:** requirement selection/history controls remain in a disclosure. Imported requirements without trusted checks remain source-exploration only. Native requirement dialogs and concurrent walkthrough/import work are not independently certified by this overhaul.

## 10. Logo and assets

| Asset | File | Status |
|---|---|---|
| Wordmark, transparent background | `media/vadhyar-logo.png` (595×250) | Original user asset; 595×250 dimensions and copied bytes verified. **The only logo variant used in the UI.** Native pixel/theme acceptance remains open. |
| Symbol (lotus + teaching mudra) | — | Pending; use placeholder |
| Activity-bar icon (16×16, geometric 'V' + bindu dots) | — | Pending; use placeholder |

- The wordmark's letters are dark. Light theme: place on Parchment. Dark theme: place on a **Parchment plate** (`background:var(--vd-parchment); border-radius:6px; padding:4px 12px`). Never on charcoal.
- Height 48px in the header (plate 56px), aspect ratio preserved, `alt="Vadhyar — understand what you build"`.
- Provenance: [media/README.md](media/README.md). The wordmark is the supplied transparent raster, not generated or redrawn. Local font bundles include each family’s OFL.
- **Updating a logo file:** replace the asset, keep these placement rules, re-check contrast in all themes, bump PATCH.

## 11. Motion (stable)

| Element | Motion |
|---|---|
| Button press | `scale(.98)`, ~80ms |
| New explanation | 160ms opacity, ease-out |
| Expanded detail | 180ms reveal, ease-out |
| Stage transition | 180ms opacity, ease-out; preserve focus with normal viewport reveal |
| Check result | 160ms status reveal |
| Source navigation | Immediate |

Implemented timing tokens are `--vd-press:80ms`, `--vd-reveal:160ms` and `--vd-stage:180ms`. Reveal opacity moves from .4 to 1 with ease-out; task focus uses normal scrolling to reveal the current task.

Keep requirement, code and inputs stationary. No typewriter text, bounce, staggered cards or fake progress. Under `prefers-reduced-motion`, remove transforms and delays; keep visible status changes.

## 12. Accessibility (stable)

Text 4.5:1 (3:1 at ≥24px); non-text UI 3:1. Real `<button>`, `<a href>`, `<input>` + `<label>`; never `role`/`onclick` on div or span. Visible focus: 2px `--vscode-focusBorder`, 2px offset. Tab order matches visual order. Async status in `aria-live="polite"`. Decorative SVG `aria-hidden="true"`; informative SVG `role="img"` + `aria-label`.

## 13. Don't

No neon, gradients or glow. No Terracotta primary button. No brand colors or brand fonts in code or editor decorations. No heritage styling on dense technical content. No emoji icons. No generic loading text. No invented stats or progress. No runtime font fetch. No raw hex in components. No hard-coded step counts. No silent disabled buttons (always give a reason). No content wider than the 680px column. No emoji or decorative glyph icons, including in optional extras.

## 14. Extending safely (recipes)

- **New screen/step:** add a registry row (§7); fit content into existing slots (§4); reuse §5 components; define states (§6); update §7.
- **New component:** only if no §5 component fits. Define rules, states, keyboard and a11y behavior; add a row to §5; MINOR bump.
- **New state:** add to §6 with visual, copy, recovery, input-preservation.
- **New color/theme:** semantic token with all theme values + contrast (§2); Decision Log entry.
- **Copy change:** allowed freely if P4 wording rules hold ("Source-linked explanation", "Checks passed" semantics).

**Before merging UI work:** check at 320, 360 and a wide panel; light, dark and high-contrast themes; keyboard-only flow; reduced motion; contrast of every changed text pair; no raw hex outside the token file (`grep -rE "#[0-9a-fA-F]{3,6}" src/panel --exclude=tokens.css`); fonts load offline. Run one batched review, one correction batch, one confirmation pass.

## 15. Reconciling drift

When the app and this file disagree, do not silently pick one:

1. **App is wrong** (bug, missed rule) → fix the app.
2. **App is a deliberate improvement** → update this file in the same PR, add a Decision Log entry, bump the version.
3. **Unsure** → keep the app unchanged, add an entry to §17 Open items.

## 16. Decision log (the "why", so future changes are informed)

| ID | Decision | Reason |
|---|---|---|
| D-001 | Design at 360px, fluid from 320 | VS Code side panels are narrow and sit beside a syntax-highlighted editor |
| D-002 | `*-text` variants for Terracotta/Teal | Brand values fail 4.5:1 as small text; brand values kept for fills and borders |
| D-003 | Bundle fonts locally | Webview CSP blocks runtime web fonts; offline reliability |
| D-004 | High-contrast themes drop brand colors | Users who need HC expect host colors; meaning is carried by icons and text |
| D-005 | Parchment plate behind logo on dark | The transparent wordmark has dark letters that vanish on charcoal |
| D-006 | Ochre is the primary-action color; Terracotta is never a button | Terracotta signals failure; the primary action must read as "next", not "error" |
| D-007 | Segmented step indicator, no percentages | Progress is derived from real steps; percentages would be invented |
| D-008 | Editor decorations use native/theme-aware tints | P1: the code is sacred |
| D-009 | Heritage styling only on teacher elements; no grain in panel | Keeps dense technical content legible |
| D-010 | "Source-linked explanation" naming | An explanation is not verified evidence (P3, P4) |
| D-011 | Predictions lock before the case runs | Learning depends on committing before seeing the result |
| D-012 | Disabled controls stay focusable and explain themselves | Observed: several greyed buttons gave no reason, leaving beginners stuck |
| D-013 | 680px content column cap | Observed: inputs stretched to ~830px hurt scanning; keeps 60–75 character measure |
| D-014 | Confirm is a first-class step | Prediction was gated on "confirm the requirement" with no obvious control; confirmation is the learner's first commitment |
| D-015 | API key moves to Settings; sharing is reviewed in a send sheet | Recurring setup does not belong in the lesson; the existing sharing statement is preserved |
| D-016 | Break component is neutral-only, collapsed, inert, non-trapping | Extras must not compete with the primary action, read as status, or trap keyboard focus |
| D-017 | Plain-language labels; technical terms in Technical details | Beginners cannot act on "counterexample" or "source checkpoint" |
| D-018 | Reconcile the user-supplied v1.1.0, preserving sections 0–20 | The complete binding brief takes precedence over a generic eight-section format |
| D-019 | Borders dark #747671 / light #8B8273; dark requirement frame #CD786F; semantic executed frames | Keep brand values fixed while meeting 3:1 UI contrast; changed text meets 4.5:1 including 8% overlays |
| D-020 | Frame padding 16px 24px, card 16px, logo plate 4px 12px; teaching text 16px | Use the supplied spacing scale and readable reserved heritage type |
| D-021 | State fills and local Latin coverage are explicit | Document actual 8%/28%/6% composites and fallback behavior without inventing coverage |
| D-022 | Runtime CodeLens/executed-path tracing remains proposed; source navigation stays native | Navigating a source link or passing a check does not establish an executed path |
| D-023 | New native host JSON supersedes the earlier trust-blocked mechanics statement only within its asserted scope | Keep native activation/navigation/graph/checkpoint evidence separate from logo/font/theme visual acceptance |
| D-024 | Six actual registry entries begin with Confirm; done styling derives from host evidence | The authoritative v1.1 brief adds an explicit first commitment without invented progress |
| D-025 | One learner action saves first, then runs after matching host acknowledgement | Preserve prediction-before-reveal while reusing existing serialized host operations |
| D-026 | Unavailable task actions become quiet focusable controls with linked reasons | Preserve keyboard discoverability without a disabled Ochre primary |
| D-027 | Break mounts only when opened, uses neutral/SVG presentation, pauses on blur/hidden | Preserve the optional game while meeting the updated inert/non-trapping contract |
| D-028 | PATCH 1.1.1 records actual token values and implementation reconciliation; original release history retained | No new principle or registry stage beyond the supplied v1.1.0 brief is introduced |

## 17. Open items and implementation reconciliation

The current product remains the prepared NovaDesk ownership learning scenario with a disclosed seeded bug. Explanations/hints are model interpretations; executed results are trusted-runner evidence scoped to recorded source and requirement identities. Transfer, Review and general Build Guide remain planned. This design release does not certify broader product completion.

| Item | Evidence / current boundary | Remaining acceptance |
|---|---|---|
| Standard-theme contrast | Changed text pairs ≥4.5:1, including pass/fail 8% overlays; changed UI borders/frames ≥3:1 by arithmetic | Native rendering and themes remain separate checks |
| Native host mechanics | [host-acceptance.json](.impeccable/review/host-acceptance.json), 2026-10-10T19:10:17.587Z: VS Code 1.140.0 activation/panel opening, current `src/approval.ts` line-12 navigation, invalid-ID rejection, requirement/checkpoint restoration, concurrent writes and real Graphify mapping assertions passed | Does not inspect logo pixels, fonts or theme appearance |
| Synthetic finish review | [verdict.md](.impeccable/review/verdict.md): 17 refreshed captures across simulated host themes, 320/360/900px, Observe/Verify, sharing and walkthrough; the recorded correction list passes | Captures use synthetic host messages/development data, not native runner/API/navigation evidence. Its earlier trust-blocked mechanics statement is superseded only by the newer host JSON assertions; the refreshed six-stage/Control/Break changes need their own confirmation |
| Logo / fonts / themes | Original 595×250 wordmark bytes, eight Latin WOFF2 faces and bundled OFL provenance verified; host-issued resource base/CSP permits local assets | Revised native logo/font/light/dark/high-contrast visual acceptance remains unverified. A temporary native visual launch failed; automated host mechanics still passed |
| Native sizing / keyboard / reduced motion | Corresponding CSS/focus behavior exists | Trusted native viewport, keyboard/focus and offline font appearance remain open |
| Transfer and Review | Unavailable and unregistered | Define once corresponding host capabilities exist |
| Editor decorations | Native navigation and diff exist; CodeLens/focus/path recipes remain proposed | Implement with real execution mapping and theme acceptance before claiming them |
| Requirement import / walkthrough | Concurrent controls retained in disclosures; unmapped imports do not acquire trusted prepared checks; current-identity and escaped export guards preserved | Native dialogs, walkthrough/export and CodeTour playback not independently certified here |
| Symbol / activity-bar icon | Pending placeholders | Supply approved assets; do not invent wordmark variants |
| Unavailable-control density / concurrent controls | Busy source lists may expose several unavailable controls; concurrent import/walkthrough disclosures still contained native disabled buttons at the inspected snapshot | Confirm max-one unavailable control per task card and the updated nested controls before certifying full v1.1 conformity |
| Confirm acceptance disclosure | Requirement confirmation is first-class; its acceptance disclosure was collapsed at the inspected snapshot | Confirm the acceptance-cases-expanded state required by §6 |
| Human evaluation / failures | Existing trust boundaries and error handling retained | No human learning/usability study or revised native fault-injection acceptance is established by finish captures |

The authoritative v1.1 Confirm/control/Break migration is implemented as described in §§4–7. The implementation owner reported typecheck, lint, focused 9-test verification and build passing after these edits; the final full-suite result and refreshed synthetic finish confirmation were pending when this record was written. The documenter inspected source and existing evidence, and did not rerun those checks. Earlier authorship and history remain unknown; snapshots count captured code states only.

## 18. Illustrative example (do not hard-code)

The host's prepared fixture is NovaDesk (roles `client-owner`, `client-other`); names below are illustrative. Demo used during design: rule "Only the owning client may approve this milestone." Predict question: "Can Meera approve Arun's milestone?" Observe shows "You predicted · locked: Rejected" beside "Executed · code v3 · breaks rule: Approved", an Ochre disagreement note, a three-case list, and the primary button **Investigate this result**.

## 19. Migration map (temporary; delete rows as they ship, delete the section when empty)

**Reconciliation status:** the logo/header, visible seeded-bug sentence, six gated stages, 680px cap, exact sharing filenames, radios/reasoning and neutral collapsed Break are implemented. Snapshot and import actions remain together in **Acceptance cases and checkpoint**, rather than the proposed Technical details location; preserving concurrent controls avoids an unreviewed host-flow move. “Save prediction and run case” correctly reflects the acknowledged two-operation host sequence. The plain-label examples remain proposals except observed Refresh, Save a snapshot of this code and Update code connections. Unavailable-control density and confirmation disclosure details are tracked in §17.

Baseline: one screenshot of the earlier panel: a single scrolling page of headings and equal-weight buttons, everything visible at once, a Snake game at the bottom. Host behavior and consent rules are unchanged by this migration. Items not visible in the screenshot are marked unseen.

| Current element | Target | Note |
|---|---|---|
| Title "Understand this change" + "prepared fixture with a disclosed ownership bug" | HEADER logo; Requirement frame label "Requirement · prepared demo"; keep the fixture/bug sentence visible | The disclosure MUST NOT be hidden |
| Requirement buttons "Refresh current context" (primary-styled), "Save source checkpoint" | Rule shown as prose; Refresh becomes a quiet action in the frame; checkpoint action moves to Details › Technical details | Primary slot belongs to **Confirm this requirement** |
| "Captured checkpoints: 0…", "0 validated source reference(s)" | Details › Evidence so far, in plain words (§5.1); keep the sentence that earlier history is unknown | P4 |
| "Current source" + "Refresh source relationships" | Understand step: up to five source links + quiet refresh; status "Finding relevant source…" | |
| "Explain current source" + "Set API key securely" | Key → Settings; No-key card when missing | §9 |
| "Preview context for Explain" + sharing paragraph | Send sheet: requirement, files, model, expandable payload; primary **Send this context for an explanation** | Keep the full statement, including that hints also share the saved prediction, observed counterexample and earlier hints |
| "Predict and observe" + "Confirm the requirement above to start." | Confirm → Predict → Observe as separate gated tasks; gated message uses Disabled control | Unseen: the confirm control and the Explain trigger |
| Outcome dropdown, reasoning field, "Save prediction" | Outcome input (radios if ≤4); primary **Save prediction** (or **Save prediction and run case** if the host does both in one action) | Host decides the split; the prediction MUST lock before the run |
| Snake game | Break component (§5.2), collapsed, last | Score stays separate from progress |
| Equal-weight blue buttons | One Ochre primary per screen; the rest quiet | P2 |

## 20. Changelog

- **1.0.0**: first self-contained release (principles, tokens, layout slots, components, states, step registry, editor integration, consent, logo rules, extension recipes, decision log).
- **1.1.0**: added Disabled and Busy controls, 680px width cap and gating, Confirm step, Outcome input rule, Break component, plain-language labels, migration map from the earlier UI, decisions D-012–D-017.
- **1.1.0 implementation reconciliation** (2026-10-11T00:47:28+05:30): adopted the authoritative supplied 0–20 document; added real token frontmatter and sidecar; recorded measured contrast/scale tuning, original wordmark/local-font provenance, sharing payload filenames, native mechanics evidence and explicit remaining visual/runtime boundaries. The supplied v1.1 migration is reconciled below; final verification limits remain in §17.

- **1.1.1** (2026-10-11T00:48:49+05:30): reconciled the implemented six-stage Confirm-first registry, 680px column, focusable unavailable controls, saved-prediction host acknowledgement and neutral inert Break with the authoritative v1.1 brief; recorded actual disabled tokens and retained original sections 0–20, release history and remaining native/concurrent acceptance limits.

## Project Guide integration note

Project Guide adds a separate ordinary-workspace flow while retaining the prepared six-stage teaching demonstration. It reuses the semantic tokens, original wordmark/fonts, 680px column, shared focusable controls, expandable sharing sheet and neutral Snake break. The sequence is snapshot → evolving intention → relevant source/change review → reviewed explanation or build prompt → learner edits → selected project check. This guide does not display the prepared ownership prediction as a universal exercise.

New UI is `src/panel/project.tsx`, with bounded input/file-list styles in the existing stylesheet. Source/intent drift labels old guidance historical; unknown groups cannot confirm intention; sharing lists the exact selected filenames. Synthetic rendered checks cover four themes and 320/360/900px widths, one sharing primary, reviewed send/copy actions, stale source/PRD and reduced motion. [Capture](docs/project-guide-evidence/project-guide-360.png) is a synthetic-host illustration. Fresh native sizing/navigation, teaching review and full unavailable-control density conformity remain unverified; this note does not certify a new complete design-system release. [Usage and acceptance boundaries](docs/project-guide.md).

## S8 Operate integration note — 2026-10-11T02:17:43+05:30

NovaDesk resumes the saved learning stage only when its host prerequisites exist. Earlier source/check results retain neutral “Result needs a refresh” treatment. Verify adds a collapsed **Reflection · saved locally** disclosure using the existing labelled textarea/quiet control, 2,000-character limit and explicit unsaved-draft boundary. Save acknowledgement clears only the acknowledged draft; save failure retains it. The existing checks action stays the single primary. One NovaDesk-only light-theme rule recomputes the historical-result fill against the current background; existing Project Guide/dark/high-contrast tokens remain unchanged. No motion or design-system release change.

[Capture](docs/s8-evidence/s8-operate.png) shows the actual React bundle with synthetic host responses. Four theme classes × three widths passed panel overflow/control/primary checks; trimmed acknowledgement, failed-save keyboard retry and stage reopen were exercised. Actual isolated native restart acceptance verifies controller/storage lifecycle; it does not certify fresh native visual/keyboard acceptance. The final mechanical detector reported eight existing font-size advisories (12/13/20px outside the frontmatter ramp), exit 2; S8 changed no font size. Those design-record discrepancies remain for the planned design review. [Evidence and limits](docs/s8-evidence/resume.json).

## S9 Operate integration note — 2026-10-11T03:10:40+05:30

NovaDesk retains the existing stages, tokens, theme behavior and Settings disclosure. Quiet **Show memory location** and **Clear NovaDesk session** controls state the local scope and native-confirmation boundary; clearing is separate from credential sign-out. Historical explanation/relationships/source links and results use explicit stale labels and disabled current actions. Dirty source blocks prediction; a failed clear preserves the typed draft, while only a successful host acknowledgement resets it. No CSS, motion, general Project Guide or design-system rebuild.

[Capture](docs/s9-evidence/s9-controls.png) shows the actual React bundle with **synthetic** host responses. Four theme classes × requested 320/360/900px rendered at 320/360/680px; recorded overflow/primary/stale-link checks passed. Final keyboard memory/clear, failure preservation and successful-acknowledgement draft checks passed. No filesystem/runner/API/credentials are connected in this review. Changed-target mechanical detector exit 0 with no findings; unchanged CSS was not rescanned and the eight earlier typography advisories remain. Final native confirmation/Trash and visual/keyboard acceptance remain unverified because the disposable host was restricted and automation selected an older window. [Evidence and limits](docs/s9-evidence/session-controls.json).


## S10 Operate integration note — 2026-10-11T03:52:35+05:30

The archived challenge uses the same six stages and current VS Code theme. Predict asks about the owning client and an archived milestone; Observe keeps unexpected approval visibly a broken rule. Verify lists all four cases, actual recorded hint use and unknown external assistance. The existing Evidence disclosure now contains only persisted chronological records, current/historical labels and a quiet native Markdown export. Original code/source links and native diff are retained; no CSS or motion added.

Current changed-target detector returned no findings. Actual native prediction, observation, source/diff, four-case verification, timeline/export and panel reopen were exercised in a disposable host. The test code edit was explicitly delegated to Codex, so no learner-authorship claim. Broader native themes/width/focus/projector acceptance remains S12; previous synthetic captures do not certify it. [S10 evidence](docs/s10-evidence/transfer.json).

## S12 Operate refinement — completed, bounded acceptance

NovaDesk alone uses 12px minimum metadata labels for source names, case IDs, steps and hashes; Project Guide retains its current typography. The existing Settings disclosure reports its expanded state, identifies its controlled section, and returns focus to its toggle when closed or escaped. Seed disclosure describes the original version rather than claiming every subsequent learner edit still contains the bug. No host protocol, layout rebuild, new feature or motion. Theme composites resolve on the body that owns VS Code theme overrides, fixing unreadable light-theme result fills. Reopening the existing NovaDesk panel keeps its editor column. The explicit typography scale reconciles existing form/metadata/comparison roles.

Actual native requirement import, source navigation, Graphify, live explanation/hint, prediction, failed observation, delegated saved edit, diff, three passing checks, reflection and host restart were exercised. Settings reports expansion and Escape returns focus. Four native host themes were inspected; the final light-theme result is readable. The actual bundle also passed four simulated theme classes × 320/360/900px, capped at 680px, without overflow. Reduced-motion CSS removes transitions/reveals; native OS preference and physical projector hardware were not toggled/tested. All 104 tests pass; final changed-target detector returned no findings after documenting the existing size roles. [S12 evidence](docs/s12-evidence/ui-acceptance.json).

## H1 Operate correction — 2026-10-11T05:34:55+05:30

The unrelated-project native rehearsal found that a guide created in an empty editor group was hidden by source navigation. Reuse the existing native source/diff and webview: show native files/diffs in column one, reveal an initially colocated guide in column two while preserving editor focus, and retain the current guide column on repeated Open. No new UI component, token, protocol or motion. Runtime native acceptance and limits are recorded in the strengthening evidence. This is a scoped editor-mechanics correction; existing theme/keyboard rules remain.


## T1 Operate update — 2026-10-11T06:36:39+05:30

Reuse Project Guide's existing text roles, native source controls and disclosures. Each proposal exposes requirement, one exact decision, rationale, static references and coverage; confirming a topic collapses the proposals and keeps one saved decision visible. A fresh focused explanation remains the primary action. Historical decisions retain their text but disable source/caller targets and route back to reviewing current topics. No CSS, token, theme, layout system or motion change.

React rendering tests cover the five disclosures, escaped source, unavailable relationships and historical controls. Native acceptance covers clarification, decision/caller navigation, reopen/restart and stale source. The updated panel was observed in the existing dark editor theme; no new four-theme/width or keyboard matrix is claimed. Mechanical detector reported no findings.
