# Vadhyar post-event research

Research date: 13 October 2026, IST. Scope: developer pain points, alternatives, learning design, local browser architecture and concrete open-source reuse. This is a bounded desk-research synthesis and candidate product direction, not an implemented rebuild or proof of demand.

**Recommendation: build a local browser companion that helps people reason about consequential rules in their own evolving AI-assisted application. Map supported source broadly; teach and check one decision at a time.**

The user confirmed two audiences with separate paths: beginners who need scaffolding, and working developers who need concise change-impact reasoning. The later request permits using existing open-source repositories and asks which code is worth building on. Keep the existing extension as an optional launch/navigation surface rather than the only application runtime.

Read the [candidate browser direction](rebuild-direction.md), [upstream reuse assessment](reuse-candidates.md), and [source register](sources.md). Historical [implementation plan](../../implementation-plan.md) and [slice record](../../../tasks/todo.md) describe the event-era extension; this research does not overwrite them.

## 1. What the evidence supports

| Pain / evidence | Research finding | Boundary | Product implication to test |
| --- | --- | --- | --- |
| Verification friction | In the 2025 Stack Overflow frustration question, 66% reported nearly correct output and 45.2% more time-consuming debugging; 16.3% specifically reported difficulty understanding how/why it works | Multi-select, self-reported responses; n=31,476 for that item. Not a representative demand estimate | Connect a specific rule to source, edge cases and actual checks rather than offering another generic explanation. [Survey](https://survey.stackoverflow.co/2025/ai), [methodology](https://survey.stackoverflow.co/2025/methodology) |
| Completion versus comprehension | A randomized study of 52 developers learning unfamiliar Trio found significantly lower immediate quiz scores with AI assistance; no significant task-time difference | Corrected paper includes 29 people with 7+ years of coding experience. Immediate library learning, not novice prevalence or long-term decline | Record independent predictions and transfer separately from task completion. [Original paper v2](https://arxiv.org/html/2601.20245v2) |
| Illusion of competence | A qualitative study of 21 CS1 students found 20 finished the AI-assisted problem while researchers identified substantial difficulties among some participants | One institution/task, no contemporary randomized control; not a rate for all beginners | Evaluate explanation and a new change independently of “the app runs.” [The Widening Gap](https://arxiv.org/html/2405.17739v1) |
| Repair requires understanding | A small study of nine participants repairing prepared AI-generated Java errors classified most time as understanding and navigation rather than editing | Seeded errors, old tools, tiny sample; behavior classification is not successful comprehension | Make source navigation and caller reasoning easy. [PLATEAU paper](https://kilthub.cmu.edu/articles/conference_contribution/An_Empirical_Study_of_Developer_Behaviors_for_Validating_and_Repairing_AI-Generated_Code/22223533/1/files/39505942.pdf) |
| Perceived productivity needs calibration | METR's early-2025 RCT found a slowdown in familiar mature repos despite perceived benefit; METR now marks that result outdated and its 2026 follow-up has major selection/measurement limits | Productivity is a different outcome from understanding; neither study proves Vadhyar demand | Measure observed reasoning/change outcomes alongside satisfaction. Avoid “AI always slows developers” positioning. [Historical RCT](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/), [2026 correction](https://metr.org/blog/2026-02-24-uplift-update/) |
| Ownership is an existing practitioner concern | Simon Willison describes reviewing, testing and being able to explain AI-assisted code before committing it | One experienced practitioner's workflow, not a market-size estimate | Frame developer value around taking responsibility for a change. [First-hand practice](https://simonwillison.net/2025/Mar/19/vibe-coding/) |

### Important corrections and contrary evidence

Do not say 66% of developers cannot understand AI code: that number refers to almost-correct output, while the comprehension frustration item is 16.3%. Survey trust, debugging, comprehension and confidence are distinct outcomes.

The Anthropic blog summarizes quiz means as 50% versus 67%, and describes participants as mostly junior. Its [corrected original paper](https://arxiv.org/html/2601.20245v2#S4.T1) reports substantial experience. The paper also states a 4.15-point mean difference on a 27-point quiz while describing a 17% gap; 4.15/27 is about 15.4 percentage points. Preserve this discrepancy rather than combining it into an unqualified precise claim. The significant lower-score result and lack of significant time difference are the stable findings. [Blog summary](https://www.anthropic.com/research/AI-assistance-coding-skills).

AI use was not uniformly associated with weak understanding: observed explanation/conceptual-question patterns did better than delegation patterns in that study. These interaction patterns were not randomized; they do not prove that requesting explanations causes better learning. Some novices in The Widening Gap also used AI effectively alongside their own plan. Vadhyar should assist useful AI workflows rather than assume every user is helpless.

## 2. Proposed pain-to-solution mapping

| User's situation | Small proposed intervention | Evidence to retain | Failure to avoid |
| --- | --- | --- | --- |
| “I don't know where this feature lives” | Entry → validation → domain rule → data/state effect path, with a small map | Current source references and relationship provenance | Giant dependency graph without a starting question |
| “It looks correct but I can't explain it” | Predict a new case, explain why, then reveal grounded feedback | Prediction before reveal, reasoning and assistance | Answer-first quiz that rewards recognition |
| “I don't know why this condition exists” | Separate implemented behavior from a confirmed requirement or maintainer rationale | Requirement revision and source identity | Inventing business intent from code |
| “The AI changed many files” | Diff-first impact view and one prioritized rule to revisit | Baseline/current identities, impacted caller/source set and omissions | Regenerating a whole course after every save |
| “Yesterday's lesson no longer matches” | Mark affected evidence historical and offer a short changed-rule check | Previous attempts preserved plus fresh revision | Erasing history or presenting stale citations as current |
| “I need this on my real project” | Standalone local service/browser; optional editor launcher; preview remote sharing | Explicit project approval, coverage and actual transmitted context | Calling a localhost UI fully offline |

These interventions are hypotheses; no interview or Vadhyar efficacy experiment was conducted during this research.

## 3. Alternatives and competitive pressure

Reviewed original documentation/repositories, not installed products. “Not established” means not verified in this review, not absent. Licenses here describe the reviewed repositories, not every hosted product or dependency.

| Alternative | Verified documented overlap | Local / source status | Implication |
| --- | --- | --- | --- |
| [Tour de Code AI](https://github.com/Tour-de-Code-AI/Tour-de-Code-AI), [CodeTour](https://github.com/microsoft/codetour) | Generated entry/core/integration tours and file/line checkpoints; editable tours; CodeTour has anchors and drift detection | MIT repositories; local-model endpoints documented by Tour de Code | Close direct substitute. Generated tours alone are weak differentiation |
| [GitDiagram](https://github.com/ahmedkhaleel2004/gitdiagram) | Interactive diagrams, code links and Mermaid/PNG exports | MIT; local UI setup includes cloud storage/services/model configuration | Maps are useful orientation, not proof of learning or offline processing |
| [DeepWiki-Open / Grok-Wiki](https://github.com/AsyncFuncAI/deepwiki-open) | Repo documentation, diagrams and current README's guided codemaps | MIT; separate [Ollama guide](https://github.com/AsyncFuncAI/deepwiki-open/blob/main/Ollama-instruction.md) documents local configuration | Local repository explanation already exists; version compatibility untested |
| [CodeRabbit CLI](https://docs.coderabbit.ai/cli) | Committed/uncommitted review, logic findings and incremental review state | Client/service route; complete-product OSS/offline status not established | Competes for experienced developers' post-change attention |
| [Cursor](https://cursor.com/learn/understanding-your-codebase) | Search/references, error-flow explanation and architecture/dataflow diagrams | Product with [service processing policy](https://cursor.com/privacy); no complete-product OSS/offline claim verified | Existing coding interface can absorb much of this workflow |
| [Copilot](https://docs.github.com/en/copilot/tutorials/explore-a-codebase) | Architecture, entrypoints, algorithms, data flow, symbol and commit explanation | Reviewed GitHub.com route is public preview; offline status not established | Source-linked explanation already available |
| [PocketFlow Codebase Knowledge](https://github.com/The-Pocket/PocketFlow-Tutorial-Codebase-Knowledge) | Local/GitHub inputs and generated tutorials about core abstractions/interactions | MIT; Python/Docker and local-model route documented | Close beginner-path substitute; use as a pipeline reference |
| [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) | Local JS/TS module dependencies, rule checking and graph exports | MIT local CLI/library | Reusable module evidence, not business intent or runtime call proof |

Vadhyar's proposed distinction is **grounded understanding that gets checked and stays tied to later revisions**. This is a positioning hypothesis, not a claim of uniqueness. The standalone browser adds a workflow step; it must earn that step through independent reasoning or change outcomes.

## 4. Learning design supported by research

| Mechanism | What the original evidence supports | Application to Vadhyar / limit |
| --- | --- | --- |
| Retrieval practice | Testing improved delayed retention compared with restudying prose in two experiments | Ask for the rule after closing the explanation; code application is an inference. [Roediger & Karpicke, 2006](https://www.psychologicalscience.org/journals/psychological-science/j.1467-9280.2006.01693.x/) |
| Explicit self-explanation instruction | Strategy training improved novice students' strategy use and problem solving in a small controlled study | Demonstrate a good “why” answer and then ask for one; a textbox alone is not the intervention. Publisher abstract reviewed. [Bielaczyc et al., 1995](https://doi.org/10.1207/s1532690xci1302_3) |
| Prediction before investigation | PRIMM's school study found stronger posttest performance | Use prediction → run/investigate → modify as a design precedent; adult self-guided repos differ. [PRIMM, 2019](https://primmportal.com/wp-content/uploads/2020/10/teaching-computer-programming-with-primm-a-sociocultural-perspective.pdf) |
| Parsons-style ordering | Studies reported faster practice with similar pre/post gains | Optional arrange-the-flow exercise for beginners, not a final competence test. Dissertation abstract reviewed. [Ericson, 2018](https://repository.gatech.edu/handle/1853/59890) |
| Fading worked examples plus why prompts | Two experiments supported near/far transfer with the combined approach | Move from traced example to missing step to independent case; repo transfer untested. University abstract reviewed. [Atkinson et al., 2003](https://asu.elsevierpure.com/en/publications/transitioning-from-studying-examples-to-solving-problems-effects-/) |
| Gamification | Meta-analysis found positive averages, but heterogeneous results and less stable motivation/behavior effects | Game elements are hypotheses, not a Vadhyar effect size. [Sailer & Homner, 2019/2020](https://link.springer.com/article/10.1007/s10648-019-09498-w) |
| Points versus learning | Annotation experiment increased activity without significant intrinsic-motivation/competence gains | Separate participation rewards from evidence of understanding. University abstract reviewed. [Mekler et al., 2017](https://research.aalto.fi/en/publications/towards-understanding-the-effects-of-individual-gamification-elem/) |

A first lesson should fit one consequential rule: inspect a short path, predict an unseen case, explain why, compare the answer with evidence, edit independently, and attempt a fresh case. A 5–10 minute duration is a proposal. Guided and developer paths use the same evidence but different amounts of scaffolding. Preserve text navigation and accessible alternatives to visual maps and games.

## 5. Test demand and learning separately

### Discovery before a large rebuild

Observe five beginners and five working developers reviewing a recent AI-generated change in an actual consented or sanitized repo. Ask them to locate a rule, predict an edge case, explain the decisive condition and plan a small change. Capture where they get stuck, what they currently use and whether they return after their next coding session. Ten interviews are a design-discovery starting point, not a market estimate.

### Controlled pilot after one working browser lesson

Propose about 48 participants, stratified by audience, randomized within each audience into grounded explanation alone versus the same facts/time budget through the interactive lesson. This is a feasibility/effect-estimation pilot; final sample planning depends on the chosen outcome and expected uncertainty. Disable rewards or hold rewards identical between arms so the learning loop is not confounded with XP.

Freeze reviewed repo snapshots and pre-author held-out cases. Primary outcome: unassisted fresh-case transfer scored by blinded human reviewers using a fixed rubric for prediction, decisive-source identification and reasoning. Tests confirm behavior when available. Secondary outcomes: two- and seven-day recall, independent edit success, assistance, confidence calibration, completion, time and perceived pressure. Follow-up intervals are design choices, not optimized spacing.

Report audience-specific effects and uncertainty, missing follow-ups and unsuccessful attempts. Engagement, model grading and passing existing tests cannot substitute for demonstrated understanding. Interview participants' adoption preferences are separate from measured learning outcomes.

## 6. Current checkout and implications

Current source inspection: branch `codex/panel-v2-phase0`, HEAD `102a1ecce30f8bd512f4ba46bbcbac181438ae9a`, canonical origin `https://github.com/sabari-nath17/vadhyar.git`. The checkout contains source and mixed uncommitted work; the earlier memory's empty-repository snapshot is historical.

Existing assets include bounded local source snapshots, saved intents/requirements, source-linked guidance, static relationship validation, predictions/check evidence, stale handling and React UI. `createProjectController` is coupled to VS Code trust, storage, native pickers/navigation and watchers. `model.ts` and related primitives already rely largely on Node APIs. The Graphify adapter's file-level relation and platform restrictions must remain visible.

The root package is marked `private: true`, `UNLICENSED`, and a tracked public contribution/security/license foundation is missing. A future OSS release needs an owner-selected license and a maintained setup/support/CI policy. [Open Source Guides](https://opensource.guide/legal/). This research does not relicense code or change runtime setup.

### Reuse conclusion

The [12-repository assessment](reuse-candidates.md) recommends retaining Vadhyar's bounded snapshot/privacy/history core and Graphify adapter, adding React Flow for a focused browser map, and selectively adapting safe CodeTour anchors, Learn Claude Code teaching UI and PocketFlow concept ordering. Compare function-level coverage using the already-installed TypeScript compiler before adding another analysis dependency. Memvid, a Langfuse server and Repomix are deferred until a demonstrated need; RAG_Techniques code is excluded because its reviewed license restricts commercial use.

This is module composition around the learning loop. Forking a complete wiki or coding agent would still require rebuilding its intent, prediction, consent and revision-evidence boundaries. Exact pinned source, licenses, defaults that should not be inherited and adoption checks are in the assessment.

Existing test/native/release evidence was read as historical evidence. No product test, installed-extension acceptance, model coaching, browser service or user-study run happened in this phase. Current source/config identities are checked for preservation by the research handoff.

## 7. Research process and limits

Skill Router refreshed 1,663 readable entries with six unrelated metadata errors. Three isolated read-only agents covered pain, alternatives and learning; the main agent inspected source, reconciled claims and proposed the architecture. Follow-up repository/critic agents reached the account usage limit. The main agent completed a pinned review of 12 repositories / 57 paths and a bounded self-review. No agent modified application source.

Applied: Skill Router routing/recovery; Run an Agent Team decomposition/context isolation; Search's evidence-quality and synthesis approach; Firecrawl search/page retrieval; Competitive Analysis; Superpowers brainstorming; Absolute Mode. The Search skill's Exa connector and requested Haiku model were unavailable; Exa calls were zero and available agents retained their supported model. Firecrawl had partial HTTP 429/transport failures; successful original-page reads and primary-source web fallbacks are distinguished in the source register.

The competitive scan is not exhaustive. No upstream dependency was installed, no benchmark or runtime trial was conducted, and no source code was imported into Vadhyar. Product demand, lesson efficacy, privacy implementation, cross-platform portability and maintainability still need direct validation.
