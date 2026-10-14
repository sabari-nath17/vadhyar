# Specialist-assisted project learning

14 October 2026, IST. **Decision: accept the learning logic as an optional next-slice proposal.** This document evaluates the user's pasted idea; it does not install specialists, connect a coding host or implement new controls. The current [browser plan](superpowers/plans/2026-10-14-project-agnostic.md), [behavior contract](product-logic-contract.md) and [feature contract](../prototype/feature-contract.md) remain authoritative for implemented behavior.

Vadhyar helps someone understand and independently change one consequential part of their own project. A specialist can help with the application; Vadhyar connects that work to the confirmed requirement, captured source, learner reasoning and scoped evidence. Teaching should survive a change of tools: explain the permission rule, form state or interaction principle, rather than merely teaching plugin operation.

## What to keep, change and defer

| Proposal | Decision and reason |
| --- | --- |
| Recommend useful specialist help for a concrete task | Keep as optional capability advice. Explain the missing capability and prefer the user's existing tools; recommending no addition is valid. |
| Teach around actual changes and results | Keep. Reuse the existing captured-source learning loop and evidence records. Advice alone adds little to that goal. |
| Keep application and learning outcomes separate | Keep the existing richer contract: command outcome, freshness/coverage, learner requirement verdict, assistance and recorded activity remain distinct. Two success badges would lose those distinctions. |
| VS Code tutor with five new product surfaces | Adapt to the current same-computer browser companion beside the user's editor/terminal. Retain Path, Project and Notebook. Confirm/Understand are setup; persisted stages remain predict → observe → change → verify → reflect → complete, with a separate case after reflection. |
| Two mandatory NovaDesk/UI journeys | Narrow to one task in the learner's actual supported project. NovaDesk remains an optional disclosed ownership-bug fixture with simulated actors, not the product's onboarding requirement. |
| A catalog covering design, security, databases and motion | Defer until an observed task needs an entry. Verify official documentation, compatibility, permissions and costs for that entry at selection time; do not copy a broad provider list into the product. |
| Automatic invocation, result import and coding-host hooks | Defer to separate bounded integrations. The current browser recorder observes eligible saved-file changes, not which assistant/plugin ran. The extension's optional intent-capture bridge is a separate surface, not a connected browser tool bridge. |
| Bundled copied skills, automatic installation or prompts after every save | Exclude from this addition. These expand maintenance or interrupt the learner without establishing the proposed learning value. |

## Assumptions: rank, flip and test

| Assumption | Load | If false | Cheapest useful check |
| --- | --- | --- | --- |
| Linking specialist work to a learning checkpoint helps enough to justify another step | High; main product-value risk | Vadhyar adds paperwork to an adequate editor workflow | Compare the same task, specialist, allowed assistance and checks with a short mentor worksheet. Assess the next unfamiliar change and time burden separately. |
| A useful capability gap can be identified from the confirmed task and inspected source | High | Advice becomes generic or unnecessary installation | Review one real task: can the learner explain what the existing tools lack? If not, recommend no addition or ask one task-specific question. |
| Vadhyar can observe the specialist's result | High for automatic integration; low for a manual handoff | Saved-file changes are mistaken for proof of a tool run | First use an explicit handoff and labelled learner report. Require a tested host adapter before claiming authenticated tool output. |
| A correct assisted change demonstrates understanding | High | A generated fix receives an unjustified competence label | Review a different case under declared assistance conditions, with an independent reviewer where available. Record uncertainty; the current separate-case self-report does not certify independence. |
| Another checkpoint has acceptable interruption cost | Medium | Learners defer or abandon it | Offer advice once at an explicit task/change boundary, permit defer/decline, and measure burden against the worksheet. Never trigger a lesson from every save. |

The riskiest assumption is that this connection improves the learner's next decision enough to justify its burden. The first check needs no adapter, catalog or new dependency: run a bounded manual comparison using the existing source/prediction/evidence/reflection workflow. No interviews or such evaluation were performed for this decision.

## Smallest proposed workflow

1. **Confirm the task and inspect relevant source.** Establish one rule/case and a captured source identity using the existing setup. Installed packages alone do not prove a library is used in the selected feature or that a specialist is available.
2. **Offer optional advice.** State the capability, its relevance, why existing tools may suffice, one transferable concept and the intended check. If compatibility or task relevance is unknown, say so. The learner can decline or defer without losing work or blocking the lesson.
3. **Save reasoning before revealing the outcome.** Follow the existing Predict and Observe prerequisites. If specialist work happened before capture, record that starting point honestly; do not reconstruct an earlier prediction or invent an earlier baseline.
4. **Hand off during Change when useful.** The learner uses their own coding environment and its permissions. Vadhyar neither dispatches the prompt nor installs/runs the specialist in this slice. A no-change review is a valid outcome; do not manufacture a bug or require an edit to complete the investigation.
5. **Return to captured evidence and Verify.** Inspect eligible saved changes and use the existing explicit refresh/new-attempt rules. Record actual scoped checks or a declared manual observation, the learner's assessment/reason, assistance and reflection. A different case remains a separate recorded answer, not an automatic mastery award.

Advice is optional guidance within the existing surfaces, not another mandatory stage. It must not advance progress, run checks, send source to a provider or rewrite the task. Use the current house controls and persistence/recovery behavior if this later becomes UI. Do not add a provider registry, schema fields or abstraction before the chosen slice needs them.

## Evidence and failure rules

| Evidence origin | Allowed meaning |
| --- | --- |
| Host-observed source/save | Eligible saved text changed at a captured identity; author, tool execution and runtime behavior remain unknown. |
| Learner-reported tool/result/contribution | The learner reports using a tool or doing a piece of work. Label the report; a diff does not certify authorship or unaided work. |
| Future authenticated adapter output | A configured adapter returned a bounded result with its project/task/source/operation identity. Origin does not establish finding correctness or whole-project coverage. This route is unimplemented. |
| Generated interpretation | A suggestion or explanation to investigate; not execution evidence or a requirement verdict. |

- Bind future advice/results to the originating project, confirmed task/attempt and captured source. A late response for one question must never attach to another, even when both use the same file.
- If a specialist edits source before baseline Observe, preserve the original prediction and use the existing new-attempt rule. After observation, use the existing Change/refresh semantics; do not silently relabel evidence for A as evidence for B. Dependency/config/check drift retains its existing coverage limits.
- Unavailable tools, unknown compatibility, declined installation, unchanged code or failed handoff keep the current attempt available. No error should invent a successful connection or replay a consequential action.
- A scanner finding starts investigation; scanner silence cannot establish authorization correctness. NovaDesk's seeded ownership omission must remain disclosed and testable without scanner discovery.
- Installation, source sharing and external execution each follow the coding host's explicit user authorization. A learning prompt or accepted recommendation grants none of these. Never collect private assistant conversations or transmit source automatically.
- Any future result importer must validate bounds, safe text rendering, source locations, project/attempt identity and provenance. Tool output is untrusted input, not instructions or permission to run commands. Do not implement an importer in the manual slice.

## Acceptance examples for a later UI slice

These are proposed probes, not tests executed in this review.

| ID | Case | Required outcome |
| --- | --- | --- |
| S01 | Login form already has appropriate components | Recommend using existing tools; investigate keeping entered values after a submission error with a scoped check. No extra plugin is required. |
| S02 | Capability or provider support is unknown | Explain the uncertainty, allow manual handoff or no recommendation, and keep the attempt intact. Do not show a connected or available integration. |
| S03 | Scanner is silent or reports an issue | Treat the result as scoped reported evidence; actual allowed/forbidden behavior needs relevant cases. No safety verdict from scanner silence. |
| S04 | Tool edits A to B before observation | Preserve prediction A; require the existing new attempt on B. Do not retrofit the prediction to the tool's result. |
| S05 | Tool edits source during Change; later check passes | Refresh explicitly, retain historical evidence and current coverage distinctions; exit zero does not establish every requirement or learner understanding. |
| S06 | Learner declines, defers, encounters an error or makes no edit | Continue the existing learning workflow without a forced specialist, stage reward or fabricated change. |
| S07 | Late advice/result for Q1 arrives while Q2 uses the same file | Discard/retain only under Q1's own identity; no mutation of Q2. Reuse existing operation guards. |
| S08 | A separate case uses specialist help | Retain declared assistance and recorded reasoning; no independent-transfer claim from completion or a different case label. |
| S09 | Source contains private-looking data; external result contains commands | Existing context review/exclusion remains in force. No automatic upload, executable rendering or command authority. |

## Research boundary and next decision

Official sources checked on 14 October 2026 support feasibility and overlap, not Vadhyar integration or learning efficacy:

- [MCP architecture](https://modelcontextprotocol.io/specification/2026-07-28/architecture) assigns context and permissions to the host and isolates server contexts. **Inference:** an independent Vadhyar application needs an explicit evidence channel; MCP is not a universal activity monitor.
- [Claude Code hooks](https://code.claude.com/docs/en/hooks) document tool lifecycle events. They are a candidate for a future host-specific adapter; none was configured or tested here.
- [Claude Code Setup](https://raw.githubusercontent.com/anthropics/claude-plugins-official/main/plugins/claude-code-setup/README.md) already recommends project-relevant integrations, and current [Learning output style](https://code.claude.com/docs/en/output-styles) already asks for selected learner contributions. The proposed connection to retained project evidence must earn its value; recommendations and pauses alone are not a novelty claim.
- [Anthropic's coding-skills study](https://www.anthropic.com/research/AI-assistance-coding-skills) examines immediate learning with a small sample; usage-pattern findings are observational. It does not validate this workflow, Vadhyar or long-term retention.

Reuse the [existing evaluation plan](research/2026-10-14-industry-learning/decisions.md): hold task/content/assistance/checks comparable, assess the unfamiliar change, report hint dependence and learner/mentor burden, and use a later unfamiliar task before making retention claims. No pilot, demand, willingness-to-pay or learning improvement is established by this review.

**Next slice:** one manually facilitated task using the existing companion and tools. If that exposes a recurring capability/handoff problem worth solving, separately scope optional advice UI and exercise S01–S09. Only then select one verified provider/host integration with exact ownership, permissions, evidence and checks. This proposal does not expand the currently implemented prototype scope.
