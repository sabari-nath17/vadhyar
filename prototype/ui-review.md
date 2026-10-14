# UI/UX roast and the revised version

14 October 2026. Review basis: generated concept, actual in-app browser walkthrough and separate fresh Chromium test contexts. This is an expert/Codex critique and functional QA, not user-tested usability or an accessibility certification.

## The roast

1. **A handsome hero can still hide the job.** The initial phone layout gave a decorative illustration too much space. It looked calm while making the learner scroll further to begin. At small phone widths the illustration is now removed; the question and Start action lead. Desktop retains the illustration as a supporting element.
2. **Tiny “premium” labels are still tiny labels.** The initial utility text was too small, and the gold label on the lesson surface had approximately 3.69:1 contrast. Essential mobile labels were enlarged; gold was darkened to approximately 4.62:1 on that surface. This spot check does not certify every state.
3. **A mode switch must earn its place.** Developer initially changed little beyond a heading. It now gives a concise current-guard/missing-invariant explanation and an illustrative condition change; guided copy explains the same decision. This remains presentation, not a separate production developer workflow. Both paths preserve prediction prerequisites.
4. **Preferences without visible consequences are decoration.** The selected goal now appears in Today’s framing. The choice remains reversible and never becomes a placement or ability score.
5. **Confirmation is part of the design.** Browser confirmation stalled during in-app QA. Confirmations now use labelled in-product native HTML dialogs for revision changes, draft navigation, question changes, note cancellation and reset. Escape/Keep working retain the draft.
6. **“Saved” is a promise about data.** Review found that failed storage froze progress, serial reuse after reset could overwrite another tab's records, and contradictory stored checks could render as passes. Storage failure now retains validated work in memory with a warning/retry/export; generation identity prevents the reset conflict; inconsistent records fail restoration.
7. **A historical attempt should not invite a current edit.** Historical inputs are disabled/read-only and source context stays attached to the original prediction. Stale checks remain explicitly part of an earlier attempt. The learning overview avoids presenting an old selected condition as current.
8. **Polish cannot compensate for vague evidence.** “Separate prepared answer” replaces uncontrolled-independence wording. The export retains question, input, rule, original source, hints, selected condition, scoped results and declared reasoning; it never certifies competence.

## Best current version

A calm project workspace with one dominant action, a consequential question and evidence close enough to compare. Today introduces the task; Learn carries one bounded investigation; Practice offers separate questions; Project makes the prepared source/change boundary visible; Progress preserves actual records; Notebook turns the learner's words into review material. The website tells the same story without fabricated testimonials, badges or partnerships.

The first usability question is whether learners can find the next task, compare intention with source/result, recover after a failed check and explain what changed. The efficacy question remains separate: does this beat an existing editor plus worksheet on a fresh unaided task, at acceptable learner/mentor effort?

## Rendered checks and evidence

| Check | Actual outcome |
|---|---|
| Page identity/content | Correct title and meaningful screens; all six destinations plus Website opened |
| Main lesson | Prediction gate → reveal → failed case → optional hint → condition selection → three passing browser cases → reflection → separate answer → inspectable export |
| Resume and freshness | Reload resumed saved prediction/results; simulated later source retained historical evidence and required a fresh attempt |
| Draft and notes | Declined navigation retained text; saved/searchable note and empty search rendered; focus returned to Add note after save |
| Keyboard and conflict recovery | Enter/arrow controls and disabled prerequisite exercised; Escape retained draft; actual sequential tab conflict retained the newer note after reload; corrupt data stayed intact |
| Storage failure | Separate test fixture denied writes; navigation/note continued in memory; retry/reload recovered that record |
| Screen sizes | 1440, 390 and 320 CSS pixels; all six pages, failed verification and website had no horizontal document overflow |
| Runtime/network | No application console errors or external requests in the completed automated contexts |
| Source/model/server | Focused domain and server checks pass; prototype strict typecheck/lint/build pass |

The in-app browser verified the native user flow and initial desktop/narrow screenshots, but its viewport override reported a minimum actual width of 520px. The separately installed Build Web Apps testing skill classifies the Browser plugin as absent (no `browser` skill in the session). Regular Playwright with an already-installed headless Chromium executable supplied exact 390/320px fixture testing; no dependency or browser download was added. Initial launch attempted a missing expected browser revision, then used the verified installed revision. The temporary script and screenshots are outside the repository under `/tmp/vadhyar-prototype-qa`.

The generated reference was compared against actual desktop rendering: six-destination sidebar, editorial heading, warm lesson panel, one main action and unequal supporting areas are retained. Intentional deviations: original wordmark, accurate empty records, real interactive controls and reduced mobile decoration. The concept was a design reference, not a user-approved screen.

Limits: no real learners, mentor review, formal screen-reader audit, Safari/Firefox run, production repository connection or controlled learning trial. Sequential storage conflicts are checked; truly simultaneous cross-tab transactions remain a local-storage limitation. Unload prompts remain browser-dependent. Functioning controls and a polished render are evidence of a mock, not product-market fit.
