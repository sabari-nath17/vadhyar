# Specialist-learning manual pilot — first protocol

Prepared 14 October 2026, IST. Owner: **CEO / Product Strategy — Vadhyar**. Status: **revised session protocol for manager review; no participant trial or developer rehearsal executed; P07 readiness open**.

First outcome: in a **15–20 minute product-feasibility pass**, can an unfamiliar learner find and explain one real T1 flow plus one variation with acceptable navigation cost? The later question is whether optional capability advice, an existing-tool handoff and retained evidence improve the next unfamiliar decision enough to justify learner/mentor burden. The matched mentor worksheet remains a credible later comparator. Existing tools being sufficient, declining help and making no change are valid outcomes.

This first artifact uses the [reviewed specialist proposal](specialist-learning-plan.md), [active-comparator decision](research/2026-10-14-industry-learning/decisions.md), [current roles](workflow-management.md), [feature contract](../prototype/feature-contract.md), [behavior contract](product-logic-contract.md) and [P07 finding](persona-logic-audit.md#actual-repository-understanding-task--p07-open). Historical prepared examples are not the trial project.

## 1. Named audience, project and task

**Audience:** campus project builders who know basic JS/TS, React event handlers and promises, and have used AI on a small feature. The first participant must be unfamiliar with this flow. Vadhyar maintainers cannot stand in for this learner population. Prior familiarity and course permission are unknown until an actual participant is supplied.

**Real project:** the existing Vadhyar browser companion in this checkout, studied as an application with source, local host and browser storage. This is a supported project target according to [current setup](../prototype/README.md). It is not a NovaDesk/SeatCheck lesson. It remains a product-owned task, so later evaluation on the learner's own independent project is necessary.

### Learner-facing T1 card — distribute only this card

**Task T1 — “What does Record observation actually do?”**

Intended requirement: keep a trustworthy record of my investigation, make clear which source it concerns, and preserve earlier work when saved code changes.

Starting case A: you have saved a prediction, the selected file is unchanged and you are still on the same question. Find the action in the real companion and inspect its source. Before using the button, explain what you expect it to do. Discover and cite the guard, the handoff between files, where the report goes and what the available evidence does or does not establish. Do not assume a button label describes the implementation.

### Learner-facing B card — hold until A has been explained

Variation B: the selected file is saved with a change after prediction, before Record observation. What does the app actually do now, what work remains and what would you keep, change or investigate? A justified **no change** decision is valid.

**Facilitator-only distribution rule:** do not hand the learner this full protocol, the source-role table, test oracles, scoring key or U1 material. Give only the T1/A card initially, the actual app and permitted source access; hand over B at step 4. The learner discovers the implementation; the facilitator must not supply scored behaviors through a requirement or explanation. Section 5 is the private reviewer key. U1 is reserved for a later method-reviewed stage and stays hidden throughout the first pass and until T1 has ended in that later stage.

## 2. Inspected source identity and proposed reading pins

Observed at **2026-10-14T23:06:43+05:30**, branch `codex/panel-v2-phase0`, HEAD `606657e3646a094d6e6cf79b1df55e8cc71a1246`. These SHA-256 values identify the actual working bytes inspected, including mixed uncommitted work; HEAD alone does not identify them. This is an observation record, **not a frozen trial artifact or host capture**.

| Inspected file | Lines at capture | Full-file SHA-256 |
| --- | --- | --- |
| `prototype/src/ProjectLesson.tsx` | 189 | `a43a0228908ab4c0dbe22536a261a1bf6620fdec979c2660e535b3a1bd650afe` |
| `prototype/src/Workspace.tsx` | 146 | `6a19e46e9a1de2c4beac513b757c8e41dda8276722c44d37bb0d0bc4093a890b` |
| `prototype/src/project-learning.ts` | 248 | `60c49f6a0d4187d7ce95895a9e4421b586f8a7897440c45296c424d6b3833019` |
| `prototype/src/project-api.ts` | 26 | `be3d1ab59419f37ee7a15cc29a0fa748a018bbfbd2fe0b1db5a0e883a5570759` |
| `prototype/project-service.mjs` | 443 | `7f730c15a51f63e1420f465f2c40f648b0b0a8d21fb012e207c8be0470662adf` |
| `prototype/src/project-types.ts` | 25 | `e2e141e9afb02c212a702fb3834c562bba0423d5ac5adfacab662660d5a35cde` |
| `prototype/project-learning.test.ts` | 81 | `b5805ffc07be62e4db72c63440613060290c65fe6922a399c943f6b4878a0fee` |

ProjectLesson and project-api changed after this capture, detected in subsequent fingerprint comparisons during active owner work. Retain this observation rather than silently treating it as the latest baseline. The 189-line/160-line facts below describe the inspected snapshot, not the later edits. All pins must be recaptured together after owner changes and Engineering's final artifact. Host-issued project/file IDs, capture/range metadata, attempt ID and browser address are **not collected yet**.

Five proposed reading selections, entry first, within the existing 1–5-file knowledge boundary:

| Selection | Inspected anchor / role | Proposed reading window, pending aligned capture |
| --- | --- | --- |
| [ProjectLesson](../prototype/src/ProjectLesson.tsx) | `current`, `observe`, button/stage rendering; action entry and origin fence | Start 1; cover the complete current component using the supported bound, or explicit additional range navigation |
| [project-api](../prototype/src/project-api.ts) | `getSource` and `projectRequest`; authenticated local GET and validated response | 1–26 at inspected version |
| [project-service](../prototype/project-service.mjs) | `source` and source route; full-file hash, bounded excerpt and host source history | Proposed start 243 / up to 200 lines; explicit fragment/omission labels |
| [project-learning](../prototype/src/project-learning.ts) | `sameSelection`, `projectTransition`, persistence and export; domain guard and browser record | Proposed start 80 / up to 200 lines; explicit fragment/omission labels |
| [Workspace](../prototype/src/Workspace.tsx) | `storage`, `act` and unsaved handling; browser persistence/render handoff | 1–146 at inspected version |

These windows are proposed, not proven parseable bundles. Source intelligence and UI own range/anchor alignment and a readable path; import order does not prove execution. Types and existing tests are reviewer oracles, not hidden extra teaching content. If learners need them, revise the matched material/bounds **before** a trial and give both conditions the same content.

### P07 readiness gate — do not start the trial yet

The [earlier actual-app receipt](logic-evidence/persona-real-lesson-before.txt) recorded a 186-line component clipped by the default 160-line excerpt. This inspection found 189 lines and `getSource` still requesting 160; the file then changed during active owner work. No later reading/comprehension acceptance was performed here.

Require all of the following:

- Source Intelligence + UI supply complete decisive ranges, responsibilities and useful anchors through the actual companion; recapture consumers agree on range/hash identities.
- Product Quality independently answers P07's four distinctions using source accessible **in the app**, without outside code search supplying missing answers: entry/action; file/data handoff; condition/storage/side effects; coverage/uncertainty.
- Engineering provides the exact combined artifact, current file hashes and scoped verification receipt. Prior 98 unit/66 service/134 root results are manager-reported snapshot checks, not this protocol's trial readiness or comprehension proof.
- For the later comparison, a facilitator can retrieve the same five-file material for the worksheet. No screenshots/mentor answer sheet substitute for disconnected app reading in the first pass.
- Owner-approved disposable project/profile/storage and execution bounds are agreed before a rehearsal. Never edit the shared source while active owners work.

If any gate fails, record **not ready — source-reading prerequisite**. That is a product-readiness finding, not learner failure. Continue documentation review; do not compensate by giving the companion condition more mentor hints.

## 3. Assumptions and the later comparison — Stage 2

| Assumption | Load | If false / decision |
| --- | --- | --- |
| Retained context improves the next unfamiliar decision enough to justify time | High | Use the worksheet or remove the extra compulsory checkpoint |
| A real capability gap exists | High | Recommend existing source navigation; no additional specialist |
| App source is readable and connected enough for T1 | High | P07 blocks the trial; navigation difficulty cannot be relabelled learning benefit |
| A recorded explanation reflects independent reasoning | High | Score the separate case and declared assistance; no mastery/authorship claim |
| Mentor preparation/review is affordable | Medium | Narrow or simplify the process, even if learners like it |
| Users want to return or pay | Unestablished, separate | Ask about actual behavior/decision context later; this protocol cannot establish demand or willingness to pay |

**Later comparison estimand:** incremental usefulness and burden of the companion's retained workflow versus a short worksheet, under matched task/source/advice/help/checks. Allocation, comparative learning evaluation and held-out U1 require a later Product Quality/method review; they are not part of the first 15–20 minute pass. This does not isolate the effect of specialist recommendations, a particular provider or gamification.

| Condition | Material and assistance | Recording |
| --- | --- | --- |
| C — mentor worksheet | Same frozen T1/source ranges, standard advice card, existing editor/navigation and help rules | Worksheet below, prediction recorded before outcome discussion |
| V — existing companion | Same material, advice, editor/navigation, help and checks | Existing Confirm/setup and Predict → Observe → Change → Verify → Reflect; separate case recorded separately |

No advice UI is required. Use this optional manual advice in the first pass; read identical advice in both later comparison conditions:

> Capability needed: investigate this event handler and follow its source. Existing source navigation may be enough; no additional tool is recommended. If you want help, ask your reviewer for a location cue or a question to guide investigation, without an answer or patch. Decline or defer freely.

The named existing local Graft tool was available for protocol authoring, but learner access to Graft/editor references is **unknown**. Do not require it or count the author's external code search as learning from the companion. Select one actually available navigation tool with the participant before the trial and match it in both conditions. No provider/account call, installation or special tool result import is needed.

For a future comparison, give each learner one condition on T1; decide allocation and prerequisites before recruiting. Do not make one learner repeat this same task in both interfaces and call the second unfamiliar-case result independent. A developer may rehearse both for feasibility after readiness, but that repetition reveals no causal learning advantage.

No participants, sample size, baseline score, minimum detectable effect or statistical plan are invented here. A real comparison's design/size and institutional requirements need Product Quality/method review. The first facilitated run is product-feasibility evidence, not a comparative learning evaluation.

## 4. First product-feasibility pass — proposed 15–20 minutes

First question: **can a novice find and explain the real flow with acceptable navigation cost?** Use the companion for T1 plus variation B only. Do not run U1, allocate learners to conditions or require completion of the full learning path in this pass. Record actual time, confusion and interruptions; the budget is a proposed feasibility bound, not an efficacy threshold or imposed deadline.

1. **Preparation outside learner time:** close P07/stable-pin gates; agree permissions/consent/disposable setup; freeze the learner card and private T1 key. Prepare facilitator logging from existing exports. Count this preparation as mentor burden. No participant supplied, recruitment or contact authorized.
2. **Orient, about 2 minutes:** confirm prerequisites/familiarity and give the learner-facing card. Let the learner use the actual companion; do not supply the source-role/key tables. Optional advice can be declined.
3. **Find and explain A, about 8 minutes:** record expectation before outcome. Observe how the learner locates source and follows the action/data path. Use existing Predict/Observe records where relevant; do not force later stages for this exercise. Facilitator records navigation time, dead ends and location/question hints. A rescue answer or external source lookup marks a reading failure/help event, not successful discovery through the app.
4. **One variation B, about 4 minutes:** reveal only the changed-file situation. Ask what happens and why; inspect the existing behavior in the agreed safe setup or explicitly record analysis/unknown execution. Decide keep/change/investigate. No manufactured defect, automatic check or mandatory edit.
5. **Explain back and debrief, about 2 minutes:** learner gives the discovered source path, deciding condition, report destination and coverage limits. Facilitator extracts identities/evidence from existing exports and completes the log; the learner does not fill eleven metadata rows. Ask which navigation step cost most and what should be simpler.

This leaves up to four minutes for navigation/recovery within a 20-minute pass. Stop on request or at that bound and record what remained unresolved. No further exercises to turn an incomplete flow into a completed path. Technical failures remain product findings, not learner deficits.

**Later Stage 2 only:** after Product Quality/method review, use the matched C/V material and allowed assistance above. Freeze allocation, rubric, outcome-reveal timing and actual session budget before recruitment. Only then reveal the separately held U1 prompt after T1, close explanations/advice and allow identical source access without mentor/assistant hints by default. Label any help as assisted. A learner repeating T1 in both conditions cannot supply an independent comparison.

### Allowed help and checks

- During the first T1 pass, prefer in-app read-only source navigation. H0 no help; H1 location cue; H2 investigative question. H3 explanatory answer is a logged rescue/contamination, not successful independent explanation. Match the permitted script/help in the later comparison. Never reveal or rehearse U1's scenario/answer through hints; ordinary learner discovery of actual source is allowed.
- Existing test or app observations require explicit operator approval and the agreed disposable environment. No automatic runs from source selection or advice. No source/code edit is performed by this protocol author.
- Predetermined code oracles: the existing tests named **“rejects missing or changed source between prediction and observation without rewriting the prediction”** and **“accepts a newly captured unchanged source before a self-reported observation”**, at [test source](../prototype/project-learning.test.ts). Engineering supplies/reviews the exact existing runner/filter at freeze time; no arbitrary browser command or new test definition.
- Match both conditions' available checks and outcome-reveal timing. Test success means those cases passed at the recorded identity, not all UI/storage/requirement cases.
- Unavailable check, source drift, failed read or unsaved record: retain prediction/draft, state coverage unknown and stop/repair readiness. No negative learner score for infrastructure failure; still report the burden/failure.
- Any future meaningful edit belongs only to an approved disposable copy after separate scope approval. Do not seed a bug in the shared app to force a change.

## 5. Facilitator-only scoring/key — never distribute with the learner card

### T1 reasoning — four dimensions, each 0/1/2

Freeze this key before a pass and do not read its solutions to the learner. First record whether the learner could find the relevant source, where navigation failed and how much help/time it cost. Then use these dimensions to describe the explanation: 0 = absent or materially wrong; 1 = partly correct, weak source/coverage connection; 2 = correct, anchored to decisive source and explicit about limits. No total mastery cut-off or first-pass learning-effect claim.

| Dimension | Expected reviewer oracle at inspected source |
| --- | --- |
| Action versus execution | `observe` freshly calls `getSource`; the source GET is not a case/check execution. The learner observation remains self-reported |
| Data responsibility/handoff | UI → API → host source snapshot, then action → domain → Workspace/browser storage. Host source history differs from browser observation records |
| Decisive rule and consequence | UI origin/hash fence plus domain matching selection/hash/text/end range; mismatch refuses continuation, preserves A and offers a fresh B question |
| Coverage and persistence | Saved source is bounded; unsaved buffers/runtime/deployment and whole-app correctness are not proven. A storage failure can leave valid work in-tab with an unsaved warning, not durable success |

Scoring source: [observe/origin guard](../prototype/src/ProjectLesson.tsx), [domain/persistence](../prototype/src/project-learning.ts), [Workspace](../prototype/src/Workspace.tsx), [source API](../prototype/src/project-api.ts) and [host](../prototype/project-service.mjs). These are inspected logic oracles; no actual learner answer exists.

### U1 — held separately for later Stage 2, not the first pass

Do not include U1 in the learner's T1 materials. After later method review and T1's end, distribute only this neutral U1 prompt; keep the expected decision and score table private:

> Q1's source-read response is delayed. The learner explicitly starts Q2 in the same file with the same hash but a different confirmed question. Then Q1's response arrives. What should happen, and what does the inspected implementation do? Cite the deciding source and relevant identity, decide whether a change is needed, and describe a scoped repair/check if you find a gap. Do not execute a patch.

Expected decision: the old Q1 response must not mutate Q2. The inspected `current(origin)` checks active attempt ID, current source hash, stage and mounted state before applying the observation; identity is broader than a shared file/hash. Domain attempt guards complement originating-action validation. A currently adequate guard warrants no change. This is a new asynchronous-identity decision, not a repeated “hash changed” question.

| U1 dimension | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Outcome | Accepts Q1 into Q2 / no answer | Rejects without explaining whose work survives | Rejects old response; Q2 and historical Q1 remain distinct |
| Source/identity reasoning | Hash alone establishes permission | Mentions another question without decisive guard | Cites origin attempt guard and explains equal hash is insufficient |
| Change/review decision | Removes validation or fabricates a need to edit | Vague fix/investigation | Justifies no change, or names a minimal attempt-bound fence if absent |
| Check/limits | Claims mastery/all callbacks safe from completion | Suggests a general test without origin expectations | Proposes delayed-Q1/Q2 same-hash probe with no Q2 mutation; states execution/support not observed |

This counterfactual probe is **proposed, not executed**. No adapter response is claimed. U1 uses an existing source-response race to assess a related decision; S07's future specialist-result race remains an additional negative card.

Product Quality owns independent scoring/P07 acceptance. Freeze the reviewer key before outcomes; remove condition names/badges from scoring packets where possible and record residual unblinding. Report assisted attempts separately. No long-term transfer/retention claim without a later unfamiliar task; no code-construction claim from this reasoning exercise.

## 6. Facilitator evidence log — not eleven learner-entered rows

The learner only supplies expectation/reasoning, explanation of A/B and a keep/change/investigate decision through the existing interaction and a short explain-back. The facilitator derives technical identities and retained evidence from available existing exports, records hints/time while observing, and asks only for missing context. No new form, importer or mandatory metadata transcription. Missing fields stay unknown; a missing readiness identity blocks the pass rather than becoming a learner task. Leave outcomes blank until a real authorized session. Do not collect private chats, credentials, raw provider responses or unrelated source.

| Field | To record |
| --- | --- |
| Session/protocol | Facilitator: pseudonymous ID; Stage 1 feasibility or later C/V; protocol revision; consent/policy reference or **not supplied** |
| Starting identity | Artifact/working manifest; project/file IDs from host; selected ranges/full hashes; attempt ID; address/port/profile; readiness receipt |
| Learner context | Prerequisites, source/task familiarity, permitted existing tool; no invented baseline score |
| Before outcome | Confirmed rule/case; prediction; reasoning; timestamp/source identity |
| Advice/handoff | Offered/declined/deferred/unavailable/existing-tools-enough; tool actually used; learner-reported origin; exact hint tier/content/time |
| Evidence | Method; actual observed outcome or unknown; source before/after; run ID/status/output scope if one exists; human verdict/reason separately |
| Decision | Keep/change/investigate; saved diff or no-change reason; what remains unchecked |
| U1 — later only | Not collected in Stage 1; later verbatim reasoning/decision, anchors, help/deviations, rubric and reviewer uncertainty |
| Burden | Learner active time, interruption/wait time, abandonment; mentor preparation/hints/review time; recovery costs separately |
| Post-session | Usability/confusion; stated return preference; demand and willingness-to-pay **not assessed** unless separately designed |
| Retention | Saved/unsaved/exported/requested-download distinctions; agreed destination/access/deletion plan; missing evidence |

Local records are editable and not tamper-evident. A declared “no assistance” is a report, not proof of authorship. Source capture observes eligible saved files, not an authenticated specialist run. Data destination/access/deletion and any recording consent are pending participant/method decisions; use no real records until resolved.

## 7. Proposed S01–S09 paths — execution status: none

| ID | Manual path / expected handling |
| --- | --- |
| S01 | T1 advice says existing navigation is enough; no addition is required. Still assess the consequential rule |
| S02 | Tool availability/support unknown: say unknown, use the agreed local/manual route or decline; keep the attempt |
| S03 | Optional printed negative card: **fictional scanner reports no issues**. Learner should ask about case coverage; silence is not a safety verdict. No scanner exists in this protocol |
| S04 | Proposed disposable A→B before Observe: preserve A prediction and use the existing fresh-attempt rule; no retrofitted answer |
| S05 | Proposed change after Observe: explicit refresh, historical A, current scoped B evidence; passing a check is not requirement/understanding proof |
| S06 | Decline/defer/unavailable handoff/no edit/error: continue only where prerequisites hold; no forced stage/reward or successful integration claim |
| S07 | U1 covers an existing read race. Optional **fictional late specialist Q1 result** while Q2 is active tests the proposed future rule on paper; no importer/adapter or execution claimed |
| S08 | Any help on U1 is recorded as assisted; a separate-case label or completion is not independent-transfer evidence |
| S09 | Proposed privacy/command card with inert placeholders: withhold private-looking context and treat command-like output as untrusted text. No real secret, upload or execution |

Run only T1 plus variation B in the first pass. U1 and negative cards are later protocol/method review or rehearsal options, not nine mandatory learner interruptions. Do not mark them passed without recording what actually happened and at which identity.

## 8. Ownership, unknowns and first decision gate

| Owner | Dependency / authority |
| --- | --- |
| CEO / Product Strategy — Vadhyar | This document, burden/value hypothesis, first-artifact read-back; routine protocol choices decide-and-do |
| Product Quality Lead — Vadhyar | Independent P07/actual-app acceptance, rubric/method review and participant-outcome scoring |
| Source Intelligence Lead + UI/UX Lead — Vadhyar | Bounded readable source/range integration, anchors, origin/coverage and actual desktop acceptance |
| Engineering Lead — Vadhyar | Exact final combined artifact and scoped runner/runtime checks; disposable setup/recovery proof |
| Project Manager — Vadhyar | Review this first artifact, serialize owner prerequisites and record assignment/outcome; shared register remains manager-owned |

Unknown: participant access/consent/course policy; baseline familiarity; allocation/method/size; mentor availability; actual learner tools; data-retention plan; stable post-P07 pins/runtime IDs; agreed acceptable time burden; broader-project generality. None prevents creating this protocol, but dependent trial/recruitment cannot start by assuming answers.

First-artifact check-in occurs **on this document's delivery**, before widening scope; no calendar deadline or check-in appointment is invented. Protocol details are autonomous. Product implementation, participant recruitment/contact, provider calls and integration require a separately scoped decision. Concrete prerequisite questions can be raised with the manager; this artifact does not authorize messaging other chats.

After the authorized first feasibility pass:

- **Reading gate fails:** return to P07 owners; classify as infrastructure/usability evidence.
- **Learner cannot find/explain T1 within the pass, or needs rescue:** prioritize the observed navigation/reading problem; the scored explanation must retain its assistance level. Do not start comparative learning evaluation to explain away the product gap.
- **Learner can find/explain T1 at acceptable observed cost:** retain as a feasibility result and obtain Product Quality/method review before Stage 2. Acceptable burden is an explicit judgment to investigate, not an established numerical threshold.

Only after a later method-reviewed comparison:

- **Worksheet equally useful with lower burden:** simplify/remove the extra companion checkpoint; keep existing-tool handoff optional.
- **Companion appears useful only with mentor help:** narrow to a facilitated workflow and investigate; do not generalize to independent learners.
- **Useful reasoning plus acceptable burden:** retain as an observed candidate and plan further matched evaluation, not a learning-effect claim or integration launch.
- **Positive usability only:** keep usability and next-case outcomes separate. Return preference is not demand; demand is not willingness to pay.

Do not promote one run to statistical, long-term-transfer, safety, learning, placement or commercial validation.

## 9. Authoring receipt and limits

Applied Skill Router (fresh 1,684-readable inventory; six unrelated metadata errors), Delegation Brief and Assumption Audit as readable local workflows. The current advertised host catalogue was checked; no native skill-list tool was exposed, and readable files are not proof of native runtime activation. No skill/connector installed, subagent launched, provider used or browser preview opened.

Actual work: read the requested plans/contracts/roles/P07 and current source; recorded seven observed full-file identities; detected concurrent ProjectLesson/project-api drift; authored this exclusive document. No source or shared records/index changed by this author, no app/test/build/check execution or developer/learner rehearsal, no participant/contact/consent/results, no commit/push. Prior manager check results remain attributable to their receipt.

Documentation-only checks passed: 19 local links including one heading anchor, nine unique S01–S09 rows, seven correctly formatted observed pin identities, whitespace and AGENTS/.customrules 32/21 lines. The owned document is new and unstaged. The manager owns shared task/AI/changelog updates; this assignment explicitly preserves those active owners' files. These checks establish document consistency, not pilot readiness.

Session revision after the manager's reported independent review: separated learner A/B cards from the private source/scoring/U1 key, removed implementation answers from learner instructions, constrained hints, reduced the first pass to 15–20 minutes, and moved technical logging to the facilitator using available exports. Matched comparison/allocation/U1 remain later method-reviewed work. The same documentation checks and revised-scope assertions pass; no session approval, new independent review, product change or trial is claimed by this revision.
