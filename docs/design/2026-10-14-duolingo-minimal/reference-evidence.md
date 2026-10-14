# Reference and context evidence — 14 October 2026

Scope: focused visual/interaction research and planning, not implementation or a benchmark. Four selected public reference pages, inspected using the in-app browser and supported search tools. Page content was treated as reference material only.

| Page | Inspected material | What the evidence supports | Limit |
| --- | --- | --- | --- |
| [Duolingo learning path](https://blog.duolingo.com/new-duolingo-home-screen-design/#quick-overview-what-are-the-big-changes) | Article and actual old-tree/new-path illustration; visible next-step and small units. | Historical path layout and Duolingo's stated rationale. | Published 6 May 2022, with a November 2022 launch note; no authenticated current lesson was tested. The embedded video was not played. |
| [Duolingo core-tabs redesign](https://blog.duolingo.com/core-tabs-redesign/#4-flat-minimal-layout-with-heavy-white-space) | Actual flat-direction mobile screenshots, before/after images and visible 4 February 2026 date. | Consistent hierarchy, fewer unnecessary containers, purposeful artwork. | The pictured flat direction is an exploration, not proof that every final Duolingo screen uses it. Animated exploration frames were not used as timing evidence. |
| [Component Gallery progress indicator](https://component.gallery/components/progress-indicator/) | Actual gallery diagram and visible component screenshots, including labeled steps. | Current/completed/upcoming step distinctions to adapt. | Gallery examples are references; no code or accessibility guarantee was imported. |
| [Motion Primitives transition panel](https://motion-primitives.com/docs/transition-panel) | Live Aesthetics → Art selection, Brand → Product card Next action and visible Previous control; screenshots of resulting content. | Deliberate changes in a focused content region and manual return navigation. | No frame recording, duration measurement, accessibility certification or performance benchmark. Search fetch returned 403 for this page, but its actual browser UI was accessible. |

AppShot Gallery was identified by name as `https://www.appshot.gallery/` through search; no AppShot design is used. Other collection sites and ambiguous effects were not pursued because the four references already answer this task. The attempted legacy Duolingo typography address redirects to its design blog; no current proprietary font documentation claim is made.

## Current project grounding

- Canonical remote was observed as `https://github.com/sabari-nath17/vadhyar.git`; checkout `codex/panel-v2-phase0`, initial observed HEAD `636eb73` and substantial mixed changes. The two named active chats are continuing work in this checkout. This is not a frozen application baseline.
- Read applicable rules, current implementation/slice records, root and v2 brand sections, [prototype design](../../../prototype/DESIGN.md), [browser reuse scope](../../browser-reuse.md), and current project contracts. Graft located the browser integration and summarized `Workspace.tsx`.
- The existing Today and Project views at `http://127.0.0.1:4173/` were visually inspected. They showed a real local project, six global destinations, a large introduction/illustration, bounded source paging, a saved-file ledger and explicit scope notes. Navigation to Project was inspected; no check, teaching transmission, reset, learner prediction or repository edit was performed.
- The seeded [SeatCheck source](../../learning-topics-evidence/fixture/src/reserve.js) and [caller](../../learning-topics-evidence/fixture/src/checkout.js) were read. Zero seats are deliberately accepted by the starting condition. The static board labels this as example content; it contains no fresh learner execution evidence.
- Obsidian README/Home/rules and filing guidance were consulted; a targeted Vadhyar search in its project/index areas found no matching project note. No vault note, raw source or credential was changed or retrieved.
- Memory supplied the previous browser-first boundary and separate beginner/developer needs; current source and the named live chats were checked before using those as planning context. No memory update was made.

## Parallel coordination

The user's request to work with **Complete browser code reuse** and **Plan Vadhyar rebuild workflow** authorized concise coordination messages. Both chats were found by their actual titles; no duplicate chat was created. Ownership of this new design directory and additive proposed-design records was communicated. The feature-workflow chat's visible update assigns UI/UX to this chat and keeps its feature work separate. A compact reuse snapshot reported source/text/map navigation and remaining presentation checks; that update is not treated as final acceptance.

## Assets, cost and compatibility

The board embeds the original user wordmark unchanged and uses simple original vector shapes. Existing Inter, Playfair Display and JetBrains Mono fonts remain the proposed implementation fonts; bundled OFL files and provenance remain in the repository. Export rasterization may use platform fallbacks. No paid resource, new dependency, donor implementation, Duolingo asset or external font request is introduced. Existing React/house controls/CSS and the parallel lane's supported source viewer/map are the implementation candidates. Library/runner access does not itself prove current acceptance. The narrow artifacts describe the desktop browser at 390px, not a connected phone.

## Logic review: verified source boundaries

- [Host launcher](../../../prototype/serve.mjs): explicit bind to `127.0.0.1`; a different Host is rejected. [Project service](../../../prototype/project-service.mjs) requires the fixed loopback origin and authenticated session. This does not provide phone connectivity or cross-device access.
- The current project service implements a native recursive watcher, queues/debounces eligible changes and exposes `watching`/`watchError`. [Status UI](../../../prototype/src/CompanionStatus.tsx) distinguishes recording availability from a selected-source change and instructs explicit lesson refresh. This supersedes the review's initial explicit-recording-only assumption, which the logic board corrected.
- [Feature contract](../../../prototype/feature-contract.md) and [connected workspace](../../../prototype/src/Workspace.tsx) separate durable host source/event storage from browser-local learning state. The corrected design labels learning records “Saved in this browser”; a different profile/address/port does not inherit them automatically.
- [Project transitions](../../../prototype/src/project-learning.ts) start at Predict from valid source/requirement/case. Confirm/Understand are setup/exploration, not persisted evidence of understanding. Prediction and declared observation reference baseline; lesson source refresh is explicit. The design requires older affected outcomes to be historical and preserved even after accepted verification while awaiting reflection.
- The [independently maintained logic board](../../logic-board.md) reported accepted-result archival and imported-file freshness regressions and assigned fixes to the feature owner. This design lane has not run those regressions or certified their repairs; the board maintains current correction status. This correction makes their acceptance requirements and non-green historical presentation explicit; no code or shared logic-board register was edited.

Source inspection is evidence of implementation structure, not a fresh watcher/runner test. Phone transport/pairing, per-device authorization/persistence and physical-device acceptance remain outside this design slice. No server bind or Host/Origin protection was changed.

## Observable result

The proposed [design handoff](DESIGN.md), editable SVGs and exported static screens are local artifacts. [Validation](validation.json) records actual artifact checks. Human design approval, UI implementation, same-computer keyboard/screen-reader/touch acceptance, learning efficacy and animation performance remain unverified. Phone use is unsupported by the current loopback host; future phone acceptance is conditional on a separate connection contract.
