# Vadhyar Design System v2: The Guided Lesson Experience

| | |
|---|---|
| **Version** | 2.8.0 |
| **Scope** | The Vadhyar VS Code panel (React): path home, lessons, feedback, completion, evidence, states, assets |
| **Audience** | Codex or any engineer building the UI. You MAY generate images, SVG, sounds and scaffolding. You MUST NOT change host behavior. |
| **Relationship to `design.md` 1.1.0** | v2 **adds an experience layer** on top of it. Where they conflict, v2 wins (see §15). Everything not mentioned here (consent, state catalog, accessibility, editor integration, logo placement) is inherited unchanged. §4 repeats the essentials so this file works alone. |
| **Maintenance** | Any PR that changes UI updates this file in the same PR. Version rules as in `design.md`. |

## 0. How to read this file

- **MUST / SHOULD / MAY** as usual. Examples are illustrative; never hard-code them.
- **Reference note:** the three Duolingo files describe Duolingo's *marketing site style* (flat sticker fills, thick rounded borders, mascot beside text, one saturated accent, generous white space). They do not describe the lesson flow. The lesson mechanics below are well-known learning-app patterns, reimagined for Vadhyar. **Do not copy Duolingo's mascot, name, fonts (Feather, duolingo-sans), exact green, illustrations or copy.** Borrow the feel, not the assets.
- **Honesty overrides delight.** If a delight feature would claim more than the evidence shows, drop it.

## 1. North star

> **Duolingo's momentum, Vadhyar's honesty.** Every moment is one small, clear task with instant, kind feedback, and every number on screen comes from something that actually happened.

| Borrow | Reinterpret as | Do not borrow |
|---|---|---|
| Learning path of nodes | Path of rules/exercises; planned ones clearly labelled | Fake locked content that implies features exist |
| One task per screen, close X, progress bar | Six-step lesson with a segmented bar from the step registry | Hearts, lives, loss framing |
| Bottom action bar, Check/Continue | Sticky bar with the single Ochre primary | Auto-advance that skips reading |
| Instant feedback sheet (green/red) | Teal/Terracotta sheet that judges the **code**, never the learner | "Wrong!", "Incorrect", scolding copy |
| Mascot with speech bubble | **The Guide** (lotus + teaching hand) | Any owl, any lookalike |
| XP, streaks, leaderboards | **Proof stickers** earned only from recorded evidence | XP, streaks, ranks, percent mastery (until backed by real capability) |
| Celebration screen | Lotus bloom + real evidence summary | Confetti storms, "You mastered it!" |
| Sticker-style pills and 12px rounded buttons | Same shape language in our palette | Feather font, Duolingo green/blue |

## 2. Principles

| # | Principle | Rule |
|---|---|---|
| E1 | One task per screen | A lesson screen asks one question or offers one action. |
| E2 | Kind, specific feedback | Feedback names what the **code** did and what the rule says. Mistakes are discoveries. |
| E3 | Evidence-only numbers | Counts, stickers and summaries derive from recorded evidence. No decorative scores. |
| E4 | One Ochre primary | One dominant action per screen, in the sticky bottom bar. |
| E5 | The code stays native | Code, editor highlights and diffs keep native VS Code styling. Illustration never touches code. |
| E6 | Delight is brief and skippable | Max 1 celebratory moment per lesson; reduced motion removes it; sound is off by default. |
| E7 | Honest scope | Planned = visibly planned. Imported requirements = "Explanation only". |
| E8 | Host first | Consent, validation, approvals and state rules from `design.md` §6, §9 are untouched. |

(P1–P9 from `design.md` still apply. In particular: predictions lock before the case runs; future steps never expose withheld answers; "Checks passed" only for executed results on current code.)

## 3. Experience map

```text
PATH HOME ──tap current node──▶ START SHEET ──Start──▶ LESSON
   │                                                   1 Confirm
   │ settings, break node                              2 Understand   (gates: no key, share review, loading)
   │                                                   3 Predict      ──Save──▶ sheet
   │                                                   4 Observe      (feedback sheet)
   │                                                   5 Change       (native editor, hints)
   │                                                   6 Verify       (cases run, result sheet)
   ◀── Back to path ◀── COMPLETION ◀──────────────────┘
                          └─▶ EVIDENCE REVIEW
```

- Closing a lesson (X) saves progress locally and returns to the path. Reaching a state from stored records follows `design.md` §6 "Returning session".
- The path shows what exists today: **Rule 1 (prepared NovaDesk exercise)** is playable. **Transfer challenge** and **Build Guide** nodes are dashed with a "Planned" tag and are not tappable. **Take a break** (Snake) is an optional node.

## 4. Visual language

### Tokens (extends `design.md` §2; brand hexes unchanged)

```css
:root{--terra:#A7413A;--teal:#6A8A82;--ochre:#D9A05B;--charcoal:#1E2022;--parchment:#F4EFE6;--ink:#2C3539;
  --sp-1:4px;--sp-2:8px;--sp-3:12px;--sp-4:16px;--sp-6:24px;--sp-8:32px;--sp-10:40px;--sp-12:48px;
  --r-ctl:12px;--r-card:12px;--r-sheet:16px;--r-frame:2px;--bd:2px;}
.vd-theme-light{--canvas:#F4EFE6;--card:#FFFFFF;--border:#82786B;--text:#2C3539;--muted:#4E5659;
  --lip-ochre:#976622;--lip-teal:#4E6B63;--lip-terra:#7F302B;
  --sheet-ok:#DCE8E4;--sheet-bad:#F2D9D6;--sheet-hint:#F6E5CC;--fail-text:#963730;--pass-text:#3F5F57;--link:#8A302A;}
.vd-theme-dark{--canvas:#1E2022;--card:#262A2D;--border:#7B7F79;--text:#F4EFE6;--muted:#B9B2A5;
  --lip-ochre:#976622;--lip-teal:#4E6B63;--lip-terra:#7F302B;
  --sheet-ok:#24312E;--sheet-bad:#3A2523;--sheet-hint:#3A3022;--fail-text:#E39A93;--pass-text:#8FB0A7;--link:#D9A05B;}
```
Sheet tints and lip colors are proposals. Verify every text/background pair (4.5:1) before shipping. High-contrast themes drop brand colors and use `--vscode-*` values; layout and icons stay.

### Color roles (Duolingo's "one saturated color means go", in our palette)

| Role | Color | Rule |
|---|---|---|
| Next action / go | Ochre | Primary button, current path node, hint tint |
| Correct / verified | Teal | Verified rows, ok sheet, done nodes |
| Rule broken | Terracotta | Failed observation, manuscript frame, bad sheet |
| Body and headings | `--text` / `--muted` | Mid-tone body so colored elements lead; no colored body paragraphs |
| Links | `--link` | Links and outlined secondary actions only |

Ochre is never text on Parchment. Terracotta is never a primary button.

### Shape and surface

- **Sticker style:** flat fills, **2px solid borders**, **12px radius** on buttons, cards, chips and path nodes (circle). Sheets: 16px top corners. Manuscript frame stays 2px radius with the double line (see `design.md` §5).
- **Primary button lip:** 2px border all round with a **4px darker bottom edge** (`--lip-*`). Pressed: move down 2px and drop the lip to 2px (no transform under reduced motion; shift color instead). This is a border, not a shadow.
- **No shadows, gradients or glass anywhere.** Depth comes from borders and flat tints only.
- Canvas is `--canvas`; cards are `--card` with a 2px `--border`. Spacing is roomier than v1: **24px between major blocks, 12px between related elements, 16px panel padding**.

### Type (panel scale, 360px)

| Role | Font | Size / line | Notes |
|---|---|---|---|
| Display | Playfair Display 600 | 28 / 1.15 | −0.02em. Path title, completion, requirement |
| Heading | Inter 700 | 22 / 1.25 | −0.01em. Task question |
| Subhead | Inter 700 | 17 / 1.3 | Card titles |
| Body | Inter 500 | 15 / 1.45 | Mid-gray `--muted` for secondary |
| Caption | Inter 500 | 13 / 1.3 | Min size |
| Label | JetBrains Mono 500 | 12 / 1.4 | Sentence case; file refs, step label |
| Button | Inter 700 | 15 | Sentence case |
| Node tag | Inter 700 | 12, uppercase, +0.05em | Only "START" and "PLANNED" |

**Wide mode (panel ≥ 720px):** scale Heading 28, Body 17, Display 40; lesson column max 480px; the Guide illustration sits to the right, sticky (editorial text-left / art-right, as in the reference). Single column below 720. Usable down to 320px.

Fonts are bundled woff2 (design.md §3). Feather/duolingo-sans are not used.

### Imagery
Flat 2D illustration, rounded geometric shapes, **3px `--ink` outlines**, restrained block-print (Kalamkari-style) motifs. Illustration may use extra warm tints around the brand palette; **UI chrome never uses them**. Icons are stroke-only (Lucide family), 2px, no emoji.

## 5. Components

| Component | Spec |
|---|---|
| **StickerButton** | Variants: `primary` (Ochre, lip), `secondary` (transparent, 2px `--border`, `--link` text), `quiet` (text). Min height **48px**. Disabled = `aria-disabled`, neutral fill, **reason line beneath** (design.md Disabled control). Busy = operation label + Cancel. |
| **ActionBar** | Sticky bottom of the panel, canvas-colored, 2px top border, 16px padding. Holds the one primary (+ optional secondary). Becomes the FeedbackSheet's footer after a check. |
| **ProgressSegments** | One segment per step from the step registry; 8px high, 4px gap, radius 4. Done Teal, current Ochre, locked `--border`. Close X at left (44px). Segments are buttons to revisit done steps. Fill animates 240ms. |
| **AnswerCard** | Selectable choice, min height 56px, 2px border, 12px radius, number badge (1/2) and keyboard shortcut. Selected: Ochre border + 10% Ochre tint + check bubble. Real radio input underneath. |
| **FeedbackSheet** | Slides up inside the panel over the ActionBar, 16px top radius, 2px top border. `ok` (Teal tint), `bad` (Terracotta tint), `hint` (Ochre tint). Icon + title + one sentence + primary. Focus moves to the title; `aria-live="polite"`. |
| **PathNode** | 64px circle, 2px border. `current` Ochre fill with a "START" tag bubble above; `done` Teal with check; `locked` neutral with lock; `planned` dashed outline + "PLANNED" tag, not focusable as an action; `break` neutral with lotus-pot icon. Label below in Subhead. |
| **Chip** | Sticker tag: 12px radius, 2px border, Caption/Label text, icon + text. Used for status ("Current code", "Hints used: 1"). |
| **Banner** | Icon + text + action, tinted `--sheet-*`, 12px radius. Stale/hint = Ochre, error = Terracotta, verified = Teal. |
| **Requirement frame** | Manuscript double border (design.md §5). Display or Heading text. Always visible; collapses to one line in lessons after Confirm. |
| **Guide** | See §7. Sizes 96px (panel), 160px (completion, gates, wide mode). |
| **ProofSticker** | 96px flat sticker with 3px outline; shown only when earned; label beneath. |
| **Disclosure** | Unchanged: Evidence so far, Technical details. |

## 6. Screens

### 6.1 Path home
Header: wordmark (transparent logo; Parchment plate on dark), Settings icon (44px). Title (Display): "Your path" (copy may vary). Chip: "Saved locally in this workspace". Below: vertical path with a gentle ±40px zigzag: **Rule 1** (current) → **Transfer challenge** (planned) → **Take a break** (optional) → **Build Guide** (planned). Current node carries the START bubble and a calm ring pulse (3 cycles, then still). Planned nodes are inert, with their explanation in the caption. They are not focusable actions. Nothing on this screen implies working features that are not built.

### 6.2 Start sheet
Bottom sheet over the path: Guide (welcome), rule title, one-line promise, a row of the six step names as small chips, primary **Start**, quiet **Not now**. Shows the exercise label "Prepared exercise · NovaDesk · intentional ownership bug" and a disclosure for the longer explanation. Resuming shows "Continue" and the last saved step with whether its evidence is current.

### 6.3 Lesson shell
Top: ProgressSegments + close X. Middle: scrollable task area (one task). Bottom: ActionBar. A lesson screen MUST fit its primary action without scrolling at 360×640. Step label (Label) shows `Step N of M · Name` derived from the registry.

### 6.4 Steps

| Step | Screen | Primary | Feedback |
|---|---|---|---|
| **1 Confirm** | Requirement frame (Display), three acceptance cases as rows (Allow/Deny), Guide small | Confirm this requirement | none |
| **2 Understand** | Gates first if needed: **No key** (Guide + Connect OpenAI), **Share review** (requirement, files, model, expandable payload), **Loading** (Guide thinking, skeleton, Cancel). Then explanation: Purpose / Logic / Result as three stacked cards, source chips opening the native editor, "Explain further" disclosure | Continue to prediction | none |
| **3 Predict** | Question (Heading), two AnswerCards, reasoning field with counter, disabled-reason line | Save prediction and run case | After save: prediction locks, case runs, sheet opens |
| **4 Observe** | Three-fact ledger (You predicted / The code did / The requirement says) and two verdict chips | Investigate this result (in sheet) | `bad` sheet: "The code allowed it." + "The rule says it shouldn’t." Guide: curious |
| **5 Change** | Task card, source chip, **Hint button** (lightbulb, 3 tiers: Concept, Source attention, Debugging action; each reveals one Ochre hint card; "Hints used: n" chip), saved/unsaved chip, mini diff after save | Run checks on my changes (disabled until saved, with reason) | Runner failed = Banner, separate from failed assertion |
| **6 Verify** | Cases use the actual runner records; rows show a Teal tick or Terracotta cross. Do not animate a sequence that implies an unrecorded execution order with `required → actual` | Rerun checks / Back to the code | `ok` sheet: "All three ownership cases match for your saved code." or `bad` sheet with failing count |

Rules: wrong or surprising outcomes use code-centered language. The sheet never shows "Wrong". After a **correct prediction of broken behavior**, say so: the code still breaks the rule. Stale results show the Ochre banner with Rerun. Imported requirements show "Explanation only" and skip steps 3–6.

### 6.5 Completion
Guide celebrating inside the **lotus bloom** (one 900ms SVG animation, once). Display title: honest summary (for example "You changed it, and three cases now match"). Stats row, all real: **Predicted first**, **Hints used: n**, **Cases matched: x of 3**. **Proof stickers** earned from evidence only. Caption: "These cases establish this behavior. They do not measure mastery." Primary: **Back to path**. Secondary: **Review evidence**.

### 6.6 Evidence review
A vertical timeline (Intent, Interpretation, Prediction, Observation, Change, Verification), each item with its code version and a "Current code / Earlier code" chip. Collapsed technical details. Keeps the evidence model from `design.md` (categories visibly distinct).

### 6.7 Gates and states
Every state in `design.md` §6 appears in v2 with the Guide where it helps (no key, loading, stale, runner failed, API error, empty path). Copy and recovery are unchanged; presentation uses Banner/Sheet and a small Guide pose. Errors never apologize and never stay vague.

## 7. The Guide and proof stickers

**The Guide:** a friendly character built from the logo symbol: a lotus with one raised hand in a simple teaching gesture (palm out, thumb touching index fingertip; keep it abstract and respectful). Calm, curious, patient. Two dot eyes, no mouth detail beyond a small curve. Palette: brand colors plus warm tints; 3px `--ink` outline. The Guide never appears over code or technical details.

**Poses (SVG):** `welcome`, `thinking`, `pointing`, `curious`, `aha`, `celebrate` (with bloom), `resting` (break), `key` (no key). Eyes, hand and petals are separate groups with ids so CSS can animate them.

**Proof stickers (earned only if the evidence exists):**

| Sticker | Earned when |
|---|---|
| Predicted first | The prediction was locked before the case ran |
| Found the bug | The learner opened the source after Observe and the prior case broke the rule |
| Fixed it yourself | A saved learner edit made all three cases match |
| All cases match | Verification on current code passed 3 of 3 |
| No hints | Verified with zero hints used |

No XP, streaks, levels or percentages. A streak or return reminder is **planned** and MUST wait for real session-resume support.

## 8. Motion and sound

| Element | Motion |
|---|---|
| Button press | Down 2px, lip to 2px, 80ms |
| AnswerCard select | Border/tint 120ms, check pop 140ms |
| FeedbackSheet | Slide up 220ms ease-out; focus handoff |
| Progress fill | 240ms |
| Verify rows | 140ms apart, in execution order |
| Lotus bloom | 900ms, once, on completion only |
| Current path node | Ring pulse, 3 cycles, then still |
| Source navigation | Immediate |

Keep inputs and the requirement stationary. No confetti, bounce, typewriter text or looping idle animations. `prefers-reduced-motion`: remove transforms, pulse and bloom; keep visible state changes.

**Sound:** three short WebAudio tones (tap, reveal, verified). **Off by default**, toggle in Settings, never on load, never for errors.

## 9. Voice and microcopy

Warm, curious, specific, sentence case, active voice. One idea per line. Praise is rare and specific ("Your prediction was locked before the case ran"), never generic ("Great job!"). Feedback talks about the **code**. Errors say what happened and what to do, in the interface's voice, without apologizing.

| Moment | Default copy |
|---|---|
| Path title | Your path |
| Current node tag | START |
| Start primary | Start |
| Predict primary | Save prediction and run case |
| Observe sheet | The code allowed it. The rule says it shouldn’t. |
| Verify success | All three ownership cases match for your saved code. |
| Honest caption | These cases establish this behavior. They do not measure mastery. |
| Planned node | Planned. This will let you plan your next feature. (adjust per node) |

Keep product terms consistent with the app: Requirement, Predict, Observe, Change, Verify.

## 10. Asset generation brief (Codex: generate these)

Prefer **hand-built SVG** (crisp, animatable). Raster only for the pitch deck hero. Store under `media/`.

| Asset | Files | Spec |
|---|---|---|
| Brand symbol | `media/brand/symbol.svg`, `symbol-mono.svg`, `activity-bar.svg` | Square emblem: structural V, lotus base, descending hand. Activity bar: 16×16, geometric V + bindu dots only |
| Guide | `media/guide/{welcome,thinking,pointing,curious,aha,celebrate,resting,key}.svg` | viewBox 240×240, transparent, 3px `#2C3539` outline, flat fills |
| Bloom | `media/guide/bloom.svg` | Petals as ids for CSS animation |
| Path nodes | `media/path/{start,done,locked,planned,break}.svg` | 64×64, 2px stroke |
| Stickers | `media/stickers/*.svg` | 96×96, one per §7 row |
| Gate art | `media/gates/{no-key,loading,stale,runner-failed}.svg` | 160×120, uses the Guide |

**Style prompt (for any image tool):** "Flat 2D vector illustration of a friendly lotus character with one raised hand in a simple teaching gesture, rounded geometric shapes, thick dark slate outlines (#2C3539, 3px), warm earthy palette (terracotta #A7413A, muted teal #6A8A82, ochre #D9A05B, parchment #F4EFE6), subtle block-print pattern on petals, transparent background, no text, no owl, no existing characters, calm and patient expression."

Review every asset at 360px and 32px; outlines consistent; no text baked in; no resemblance to Duolingo's characters.

## 11. Demo mode and hackathon polish

- **Planned demo mode:** a Settings toggle could reset a prepared state and use a clearly labelled recorded response. The current host has neither action, so this UI revision keeps both visibly planned in Settings. Rehearsal uses the existing fresh-workspace preparation command and separate labelled developer preview; API errors remain errors.
- **Golden path (about 90 seconds):** path home → tap START → confirm → explanation → predict → the Observe sheet reveal → hint → edit and save → verify rows tick Teal → completion bloom and honest summary → Evidence review.
- The first 10 seconds MUST look finished: wordmark, Guide, path with a single glowing START.
- Keyboard: `1`/`2` choose answers, `Enter` triggers the primary, `Esc` closes sheets.
- Include a dev route `/gallery` that renders every component and state at 320, 360 and 720px in light, dark and high-contrast.

## 12. Build plan for Codex

| Phase | Work | Done when |
|---|---|---|
| 0 | Tokens, bundled fonts, theme mapping, component library (§5), `/gallery` | Gallery renders all components in 3 themes at 3 widths |
| 1 | Generate assets (§10) | All files exist and pass the asset review |
| 2 | Lesson shell: ProgressSegments, ActionBar, FeedbackSheet; wire steps to **existing host actions unchanged** | Each step works at 360×640 without scrolling the primary |
| 3 | Path home, Start sheet, Completion, Evidence review | Full golden path runs end to end |
| 4 | Gates and states, motion, sound toggle, reduced motion | Every `design.md` §6 state appears and recovers |
| 5 | Demo preparation, accessibility pass, screenshots (320/360/720 × 3 themes), labelled screen-capture walkthrough | Presentation QA is recorded; native QA gaps stay explicit; demo reset/fallback remain planned |

Constraints: do not change consent, validation or storage behavior; no new network calls; no runtime font fetch; keep the panel inside its slots; update this file with any deviation.

## 13. QA checklist

- 6 steps render from the registry; counts derived, never hard-coded.
- One Ochre primary per screen; disabled controls give reasons.
- Feedback never uses "Wrong", "Incorrect" or "Failed" about the learner.
- Every number and sticker traces to recorded evidence; planned items are labelled.
- Text-safe contrast verified for all tints; high-contrast themes use host colors.
- Keyboard-only run of the golden path; visible focus; focus handoff on sheets.
- Reduced motion removes pulse, bloom and transforms.
- Sound is off by default.
- No shadows, gradients, emoji or Duolingo marks.
- Screenshots at 320, 360 and 720 in light, dark and high-contrast.

## 14. Don't

No owl or lookalike. No Feather or duolingo-sans. No hearts, XP, streak, rank or percent mastery. No scolding copy. No shadows, gradients, glass. No illustration over code. No colored body text. No Terracotta primary. No auto-advance past feedback. No hidden "Planned" features that look playable. No new sharing without the review step.

## 15. Where v2 overrides `design.md` 1.1.0

| Topic | v1.1 | v2 |
|---|---|---|
| Radii | 2 / 6 / 8 | 12 for controls and cards, 16 sheets, 2 manuscript frame |
| Borders | 1px hairlines | 2px sticker borders; primary buttons get a 4px bottom lip |
| Targets | ≥ 44px | ≥ 48px for primary and answer cards, 44px otherwise |
| Spacing | 12 gaps | 24 between blocks, 12 between related items, 16 padding |
| Heritage styling | Teacher elements only | Also Guide, path and completion art (never code or technical content) |
| Layout | Panel with all sections visible | Path + one-task lesson shell with sticky ActionBar |
| Break | Disclosure at the end | Optional path node |
| Step indicator | Label + segments | Segments + close X, with progress fill |

## 16. Decision log

| ID | Decision | Reason |
|---|---|---|
| V-001 | Keep our palette and fonts; borrow Duolingo's structure | The brand is the identity; the feel is the goal |
| V-002 | Ochre is "go" (Duolingo's single saturated color) | Terracotta signals broken, Teal verified |
| V-003 | Proof stickers, not XP or streaks | The product's rule: no score unless evidence |
| V-004 | Feedback sheets judge the code | Learner stays curious, not scolded |
| V-005 | Primary lip is a border, not a shadow | The reference bans shadows; the lip adds tactile feel |
| V-006 | Sentence-case buttons | Long labels at 360px; uppercase only for START / PLANNED |
| V-007 | Planned nodes visible but inert | Shows the roadmap without implying features |
| V-008 | Demo mode with labelled recorded response | Reliability on stage without faking live results |
| V-009 | Guide built from the logo symbol | Ownable character, no lookalike risk |
| V-010 | Sound off by default | VS Code is a work environment |

## 17. Open items

- Name for the Guide (team decision; optional).
- Confirm sheet tint and lip colors pass 4.5:1 in the real panel.
- Decide when streaks or return reminders become real (needs session resume).
- Path content beyond Rule 1 depends on Transfer and Build Guide support.
- Phases 0–5 presentation work, the §10 vector set and lesson shell are implemented in an isolated checkout. Browser checks and a local review VSIX are recorded; native acceptance of this renderer and human usability remain unverified. Demo reset and recorded-response fallback are planned.

## 18. Changelog

- **2.4.1**: upfront own-project purpose/entrypoint and explicitly labelled guided practice; clearer Project Guide start copy. Existing actions and feature capabilities are unchanged.

- **2.4.0**: guarded Enter navigation, immediate optional Snake break, theme-safe character ink, final width/theme review, labelled capture walkthrough and local package. Demo reset/fallback remain visibly planned to preserve host behavior.

- **2.3.0**: actual examples, explicit recovery, optional local sound, settings focus and one brief SVG bloom.

- **2.2.0**: path, native start sheet, evidence-bounded completion, proof review and simpler existing Project Guide.

- **2.1.0**: six-step lesson shell and real action wiring; plain task copy, fixed prediction form fit, local SVG packaging; current host capabilities preserved.
- **2.0.1**: Phase 0/1 implementation and accessibility adjustments; plain-language labels; inert planned nodes; no invented execution order or authorship statistics. Assets generated before screens as explicitly requested.
- **2.0.0**: first release of the guided-lesson experience layer.

## 19. Implementation rulings and simple language

The user's latest direction is one plain question and one clear next action, while keeping every existing feature accessible. Visible step names are **Your rule / How it works / Your guess / What happened / Try a change / Check it**. Host stage IDs and approval semantics remain unchanged. Use **Show proof** for recorded evidence and **More detail** for identities and diagnostics. Consent reviews must still name OpenAI, the operation, files, model and exact payload.

Project names, requirements, source locations, explanation content, predictions, hints and results must come from the host's current records. A missing field stays missing with a recovery action; it never falls back to a convincing demo result. Prepared exercise labels remain visible for prepared exercises only. A developer component gallery may use clearly labelled specimens and recorded developer checks. It must not look like a live learner session.

### Accessibility changes to proposed tokens

The brand hex values stay fixed. Semantic values were adjusted after measured failures: light border `#82786B`, dark border `#7B7F79`, light failure text `#963730`, light disabled text `#4E5659`, ochre button lip `#976622`, light selected border `#8F6027` and dark requirement border `#CD786F`. Text has a 4.5:1 floor; control boundaries have a 3:1 floor. The selected-card surface mix is defined separately inside dark theme after its card surface changes. Native high-contrast tokens take priority; browser fallback is black/white/yellow.

### Evidence and feature availability

- “Found the bug” and “Fixed it yourself” remain unearned until the host records source-open history and independent authorship. Current records cannot prove either.
- Counts come from the actual case array, correlated prediction and recorded hints. Unknown hints are not zero. Earlier/incomplete results cannot earn current success stickers.
- Case rows do not imply an execution sequence. Changes and passed checks do not prove learning mastery.
- The initial brief predates current Project Guide and archived-milestone support. Before Phase 2, inventory the current primary checkout and preserve those existing actions. A feature that already works must not become “Planned” just because this brief is older.
- Phase 0 added a developer-only gallery. The original panel entrypoint and all host files are unchanged in this milestone. Phase 2 must use the current app's contracts.

### Phase ordering and review

The user explicitly required §10 SVGs **before screens**, so asset creation precedes the Phase 0 gallery. The separate Phase 1 gate is asset review. The 26 SVGs were inspected at 32px and 360px; full screenshot matrices are saved per phase. No new runtime dependency, font fetch or external request is introduced.

No subagents are allowed in this side conversation. Code review uses the Superpowers review checklist in-thread; it is not an independent reviewer or human acceptance.

### Phase 2 rulings

- The visible step registry uses the same host IDs and availability rules. Task content scrolls independently of the ActionBar. Prediction omits the Guide to fit choices and the reason field together at 320/360; the assets remain available in other tasks.
- The current Explain contract supplies `summary` and source-linked `steps`, not separately classified Purpose/Logic/Result fields. Show those actual fields and preserve walkthrough navigation; do not fabricate categories or measured consequences.
- Existing Project Guide stays available through the editor's existing command; the NovaDesk panel has no action for opening it. Phase 3 must explain that entrypoint rather than invent a working host message.
- Browser previews are labelled recorded/developer specimens. No live API/storage/runner behavior is inferred from them. Native host/theme acceptance is still required before a native QA claim.

### Phase 3 rulings

- Existing transfer and Project Guide predate this UI change: transfer is locked by its actual prerequisite, not labelled Planned; the separate guide uses the current editor command. No new roadmap feature is invented to fill a path.
- Home and screen navigation are local presentation state. Saved stage/records retain the existing host storage. Closing a lesson retains the draft while the panel remains open; it does not newly persist unsaved text.
- Completion requires the host trusted-current flag, matching inputs and the complete recorded ownership/transfer case set. Unknown hints stay unknown. No independent-authorship or source-open sticker is inferred.
- The initial sample has no title field; the path reads its actual Markdown heading. User rule titles take precedence.
- Project Guide has four local tasks while keeping all existing actions, reviewed sharing, native check confirmation and original state guards.

### Phase 4 rulings

- Existing contextStale covers dirty/stale input, but the panel contract exposes no separate dirty flag. Show “Save any edits, then refresh”; never invent a claim that unsaved edits were detected.
- Example rows preserve the actual requirement/scenario wording and stay labelled expected, not executed. They are expanded in Confirm; no natural-language verdict parser is added.
- Key connection remains separate from reviewed Send for both explanation and hints. Source IDs, exact context and host-owned approvals are unchanged.
- Sound is off by default, local to the open panel and never fetched/persisted. Bloom recombines the generated SVG part IDs, once per current passed record while this panel is open; opening saved history does not emit sound.
- API cancellation uses the original action; extraction has no invented cancel control. Runner errors never become failed learner answers or passing results.
- Reduced-motion CSS is implemented; OS/media and audible hardware acceptance remain unverified. Browser review cannot establish those native preferences.

### Phase 5 rulings and deviations

- Resetting a workspace and replacing API results require host actions that do not exist. Under the user's host-preservation rule, neither is added. Settings labels them planned. The existing `demo:prepare` command creates a fresh folder exclusively; it never resets an existing folder.
- Available Computer Use controls do not record continuous video. A 35-second GIF assembled from actual screen captures replaces the short screen recording. It is labelled a **screen-capture walkthrough**, uses recorded developer results and presentation specimens, and does not establish live API, runner or native editor behavior.
- Enter invokes the current primary from headings/answer choices. Editable fields, native controls, modified keys and the Snake board retain their own behavior. Submission guards match disabled primary guards; saving never implies a host acknowledgement.
- Completion uses one generated character in the task artwork slot. Its fixed slate ink matches the generated SVGs, preserving face detail over the light petals in dark/high-contrast themes. Snake's inherited color aliases resolve on the theme-owning body.
- Final review package stays local and platform-specific. Existing pre-v2 native evidence is historical; it is not reused as acceptance of this renderer. Keyboard with real host acknowledgements, native theme/OS motion/audio/screen-reader behavior and human ease-of-use acceptance remain pending.

### Feature communication follow-up

The user asked whether the experience communicates the product and its features. The first screen now states the outcome, then prominently explains **Your own project** before the separate **Guided practice** path. Practice buttons explicitly say practice; imported explanation-only rules retain their actual rule label. Project Guide's opening copy names understanding, a build plan and a copyable prompt. These are existing capabilities, not new promises of general requirement verification.

The existing host exposes Project Guide through a separate editor command and does not enable command links in the prepared panel. Show the actual command as instructions; do not invent an interactive switch. A one-click mode launcher remains outside this host-preserving UI change. The [feature map](docs/design-v2/phase-5/features.md) distinguishes available controls, scopes and planned capabilities. Native/human ease-of-use acceptance still remains pending.


## UI simplification follow-up

The supplied [simplification plan](simplification-plan.md) wins for density and feature placement. The [committed inventory](feature-parity.json) preserves all supplied entries and newer features.

- Pin wordmark, recorded code status, rule preview and compact progress above the scrollable task. At 360px, the top including its inset is 136px.
- Put rule administration and snapshots in the rule sheet, and setup/refresh/memory/requirement/export/break controls in More options. Controls keep their existing host action and guard.
- Locked progress segments are interactive help buttons; they explain the prerequisite without changing the host stage.
- Preserve exact recorded prediction text. Rehearsal provenance is not rewritten into a learner claim.
- Runtime extraction remains explicit; the existing combined prediction-save/check flow still waits for host acknowledgement. No native source-selection or host changes are authorized.
- The developer screenshot toolbar is 24px outside the app viewport. Browser captures use a 640px app area plus that labelled toolbar.
- Claude Superpowers is applied to the already authorized written plan and existing `codex/` branch. The user already requested execution, so a second plan-approval prompt is not introduced. No Claude-specific configuration is installed. Reviews are in-thread; independent review remains pending.

Evidence: [shell phase](docs/design-v2/simplification/shell/README.md) and [task/evidence phase](docs/design-v2/simplification/tasks/README.md).

### Flat tasks and saved-record sheet

- Observe uses one definition-list ledger: Predicted / Code did / Rule says. The expected binary outcome is derived from the runner's observed approval and match verdict, not from an invented test result. Execution counts and original prediction text remain recorded evidence.
- The result card opens on request as a native dialog; the task keeps one pinned action. This replaces the automatic nested feedback footer to meet the supplied density plan.
- The global code-status control opens the saved-record sheet over the current task. Timeline and handover contains saved events, export and reflection; Technical details contains all existing identities, provenance and operation metadata. Arrow keys switch tabs. Closing the sheet restores focus and the same lesson.
- Reflection drafts survive switching tabs and closing/reopening the sheet in this panel lifetime. They are not persisted or sent to the coach; saved notes still require the existing host gate and acknowledgement. Panel reload discards unsaved drafts.
- Hint review is a direct button. All sharing consent and existing validation remain unchanged.
- Deviation from §7's narrow 96px Guide: lesson art is 64px beside the question below 720px, preserving task space. Wide art remains 160px; the welcome and completion artwork remain their specified sizes. Administrative and evidence sheets omit decorative art.
- Project Guide route simplification, four-theme contrast and automated route parity remain the next gates. Native acceptance and human beginner usability remain pending.

### Project Guide feature placement

Project Guide now uses the same pinned wordmark/code/idea shell and a compact four-step navigation. Its task alone scrolls, including notices and errors; changing steps returns focus and scroll to the question. Saved ideas and selected source files are flat lists in their own steps. Copy prompt is a direct control; its full proposed text remains inspectable. Existing guidance is shown before re-generation controls and uses flat purpose/logic/consequence content. General checks retain native confirmation and never claim requirement coverage. Cancel is also reachable from More options during an operation. All existing request, revision, selection and stale guards remain intact.

The project-preview record uses actual disposable controller capture/intent/change/script operations with mocked VS Code dialogs and explicitly mocked guidance. The zero-exit sample script establishes no approval-rule coverage. No real OpenAI call is implied. [Project phase](docs/design-v2/simplification/project/README.md). Four-theme contrast, final parity and native/human acceptance remain open.

## Simplification completion and verification rulings (2.8.0)

- Saved, confirmed lessons resume directly from the path. The Start sheet is retained for an unconfirmed first introduction. This removes a repeated acknowledgement while preserving the host requirement approval.
- Errors and notices live inside the scrolling task. At a 640px panel height, the top occupies 136px including its inset, a blocked-action footer uses at most 86px, and the task retains at least 416px at 360px width. Measurements are in `docs/design-v2/simplification/gates/`.
- Both high-contrast variants use VS Code theme variables, with explicit dark/light preview fallbacks. Fonts and assets remain bundled.
- The existing action for running a project check is labelled “Run this check”; its actual selected script is shown in the task. Send/Cancel labels are shortened; full sharing details, model, consent and original messages are preserved.
- A reflection draft survives switching Evidence tabs and closing the sheet; a deliberate session-clear notification or change of exercise clears it. Unsaved text is still not durable storage.
- Feature parity uses real browser route recordings, rendered component tests and a source-hash guard in CI. CI fails missing, over-budget, invalid or stale evidence; it does not automatically rerun a desktop browser. This is a deliberate deviation from a browser runner inside CI, avoiding a new browser dependency. Recordings use labelled renderer specimens; native commands are checked against the manifest. Host outcomes remain covered separately.
- Required 320/360/720 captures are retained, with high-contrast light added. These are browser renderer captures, not an Extension Development Host or beginner usability acceptance.
- Publication is authorized only to the separate `codex/updaeted-ui` branch. The primary checkout and main branch remain outside this change.
