# Vadhyar browser design

## Current direction — approved and implemented 14 October 2026

A **desktop-first learning companion beside the learner’s existing coding tool**. The main target is a full desktop window at 1440px or 1024px, with a practical 700–900px coding panel. Smaller widths are resilience checks for desktop windows and zoom. The local host remains on the same computer’s loopback address; no phone, LAN, tunnel or pairing flow is implemented.

The [approved design](../docs/design/2026-10-14-duolingo-minimal/DESIGN.md) and [implementation acceptance](../docs/design/2026-10-14-duolingo-minimal/implementation.md) are the current browser references. The static PNG/SVG concepts remain reference artifacts. The user requested implementation; the final diff and rendered result await human review.

Four inspected references informed this direction:

- [Duolingo learning path](https://blog.duolingo.com/new-duolingo-home-screen-design/#quick-overview-what-are-the-big-changes): one next activity, labeled nodes and readable earlier records.
- [Duolingo core tabs](https://blog.duolingo.com/core-tabs-redesign/#4-flat-minimal-layout-with-heavy-white-space): flat surfaces, generous space and a restrained type system.
- [Component Gallery progress indicators](https://component.gallery/components/progress-indicator/): completed, current, upcoming and historical labels.
- [Motion Primitives transition panel](https://motion-primitives.com/docs/transition-panel): keep the task in place during explicit advancement. Its code/dependency was not imported; reference timing/performance was not measured.

## Tokens and layout

Parchment #F4EFE6, ink #2C3539, ochre #D9A05B with #725023 outline and bottom lip, recorded-activity teal #6A8A82, muted #4E5659 and outline #8B8273. Use the bundled Inter 400/500/600 for interface/body, Playfair 600 for confirmed rules and JetBrains Mono for source at 13px or larger. Keep the original wordmark and its aspect ratio. The small original lotus is a vector icon; the main app has no large books illustration.

The connected shell has **Path, Project, Notebook**. The desktop sidebar is 216px. The focused lesson removes global navigation, keeps a six-part progress indicator and close action, and places the task beside captured source at wide desktop sizes. At 700–1099px, the source disclosure follows the task. Native scrolling and a bounded action footer retain access to long questions and evidence. Smaller windows reflow the same desktop journey.

## Components, data and states

Path derives Predict → Observe → Change → Verify → Reflect → Separate case from validated attempt state. Reflection alone does not complete the separate case. Earlier nodes read captured records; later nodes explain prerequisites. Guided/Review is an in-memory presentation choice, without gate bypass or ability inference.

Project retains bounded search/pages, source ranges, the reused source walkthrough/map, captured versions and confirmed rule/case setup. The15October reader integration adds a view-local set of up to five explicit captured ranges, a bounded declaration catalogue, retained-text search, explicit fresh recapture/replacement and static module links. It keeps captures across file/range loading and failures. Reading cannot advance a lesson or send source to a model. [Integrated reader acceptance](../docs/logic-evidence/persona-real-reader-acceptance.json) covers one real feature across four files; it does not establish whole-project runtime behavior or learning efficacy. Notebook consolidates question history and reflections, search and complete export. The optional prepared example remains separately labeled, with its existing saved pages, modes and authored notes; its application/data are not merged or reset.

Generic predictions remain free text plus reasoning. The static SeatCheck radio choices are example-specific and are not inferred from arbitrary project prose. Every observation is labeled self-reported. Command status, available host freshness and the human requirement verdict remain separate. Uncertain and unmet verdicts stay visible through reflection, completion and Path.

Captured source has identity/range/time. A direct source-state read supplies selected-file drift; a short event feed cannot prove freshness. Project-status failure/reconnect makes recording and receipt coverage unknown immediately. Explicit refresh preserves original prediction and archives accepted prior evidence. Every async lesson save is fenced to the originating view, attempt and source.

A check intent is persisted before POST. Reload resumes acknowledged GET status only; lost starts/jobs require explicit clear and never replay automatically. New command verification rereads its host receipt. Failed checks and honest error/timeout coverage can lead to scoped uncertain/unmet reflection. Source sharing and execution retain separate exact review dialogs. Teaching cancellation, failed retention and individual export remain visible. A non-retained teacher response joins the lesson’s guarded export state, stays visible outside the disclosure and cannot be silently replaced by a new generation. Check discovery distinguishes loading, read failure and confirmed empty, with retry/manual fallback.

Drafts have Keep working / explicit discard / export, including same-page no-op navigation. Browser write failures keep valid work in this tab and change save labels accordingly; backups and visible exports remain distinct. No autosave, sync, mastery, unlimited scale or whole-project/runtime correctness is implied.

## Accessibility and motion

Native labels, buttons/selects/textareas, skip link, visible focus and dialogs with Escape/focus return. Targets are at least 48px; the principal action is 56–60px. Source scrolls within its own keyboard-focusable region. State has text/shape as well as color.

Pointer press uses an 80ms bottom-lip contraction; explicit pointer stage advancement uses 180ms opacity. Keyboard advancement is immediate. Source/map navigation is immediate. Actual result arrival may fade for 160ms. Reduced-motion CSS removes transitions and animations. No ambient loops, fabricated check sequence or sound was added.

## Verification and history

The [acceptance receipt](../docs/design/2026-10-14-duolingo-minimal/implementation.md) distinguishes actual browser probes from domain/service checks and unverified hardware/assistive-technology states. Final desktop concepts and current rendered screenshots were inspected together; 900px coding-panel, 1024px desktop and minimum-window checks supplement that comparison.

The 19:22:29 IST proposal was planning-only. The 19:56:45 IST correction clarified captured context, browser-local learning storage and same-computer access. Those original static artifacts and [static receipt](../docs/design/2026-10-14-duolingo-minimal/validation.json) remain historical evidence. Files named *-mobile are legacy narrow-window illustrations; their names do not establish a phone product target. The approved implementation now supersedes the earlier proposal status.
