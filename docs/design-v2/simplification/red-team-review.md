# Vadhyar UI red-team review

Reviewed 2026-10-11 08:10:40 IST. Scope: the isolated panel, frozen host contracts at `29db3ef`, feature inventory, browser captures and executed checks. The six lenses below are review perspectives, not separate reviewers or real user interviews.

## Verdict

The earlier presentation required too many nested reveals and gave the prepared exercise more prominence than the real-project entry. The current panel can present the implemented feature set with a pinned rule, one current task, direct source controls and short administrative routes. Learning impact and beginner usability still require observation.

**Most dangerous assumption:** making controls reachable in two interactions means a beginner will know which one to use. Reachability is established within declared preconditions; comprehension is not.

## Six challenges

| Lens | Challenge | Question that must survive the demo |
|---|---|---|
| Beginner | The native Project Guide command adds a discovery step; the prepared practice remains the main lesson action. | Can I identify how to use my own project without help? |
| Staff engineer | Hidden controls need current-state guards, not just a feature list. | Does every route invoke its original action with valid current evidence? |
| Security reviewer | Cleaner copy can accidentally obscure sharing or execution approvals. | Is the exact payload or selected script visible before the existing approval? |
| Data realist | Executed cases and hints do not prove independent understanding. | Which statements are observed behavior, and which are interpretations? |
| Competing product | An explanation panel alone is easy to reproduce. | Is the connection between my rule, prediction, edit and result clear? |
| Product owner | Practice and experimental project guidance have different guarantees. | Can the learner distinguish prepared checks from an arbitrary successful project script? |

## Ranked risks

Qualitative likelihood/impact judgments, not measured probabilities.

| Rank | Risk | Likelihood × impact | Treatment |
|---|---|---|---|
| 1 | Beginners miss the separate real-project entry | Medium × high | Real-project purpose and exact command precede practice; native entry remains a host-scope limit. |
| 2 | A clean screen hides a needed feature or approval | Medium × high | Inventory retained; browser controls/messages recorded; source-hash guard prevents silent stale parity evidence. |
| 3 | “Current code” is mistaken for “all rules pass” | Medium × high | Badge opens evidence; results name actual cases/currentness; project script success explicitly makes no rule-coverage verdict. |
| 4 | Error/loading states consume the narrow task area | Medium × medium | Notices moved into the task; 88 state/theme measurements meet the layout budget. |
| 5 | A rehearsed fixture is presented as learning validation | Medium × high | Seed, specimen guidance and experimental scope remain disclosed; no mastery score or learning-gain claim. |

## Pre-mortems

1. **After launch, a new builder opens practice and assumes the product only handles NovaDesk.** The real-project description helps, but the native command still needs a first-run usability check.
2. **A changed project passes its selected script and the user assumes the PRD is satisfied.** The UI reports the actual script result and explicitly withholds a rule-coverage verdict. Observe whether users understand that distinction.
3. **A later UI refactor hides import, memory or cancellation again.** The parity test rejects changed renderer hashes until browser evidence is rerecorded; review the new route and its disabled-state reason.

## Before commit versus after launch

**Fixed before commit:** dense nesting; buried prompt/source/idea actions; repeated resume acknowledgement; draft loss on Evidence close; oversized error/footer states; missing high-contrast-light preview; incomplete current route evidence. Host and fixture bytes remain unchanged.

**Monitor after launch:** beginner discovery of Project Guide; ability to choose the next step unaided; interpretation of currentness and check scope; independent follow-up changes; native keyboard/screen-reader behavior. No real five-year-old or beginner session, live API request or native editor installation was run during this UI review.
