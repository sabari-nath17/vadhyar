# Research source register

Accessed 13 October 2026, IST. This register separates published evidence, current documentation and pinned repository inspection. It records desk research, not interviews, installed-product evaluation or learning-effect measurement.

## Evidence interpretation

- A survey identifies reported frustrations among its respondents; it does not estimate demand for Vadhyar.
- A controlled study supports an effect only for its participants/tasks/tools/outcomes. Interaction-style subgroup observations are not randomized interventions.
- An abstract supports only what the abstract reports; full methods were not assumed.
- Official product documentation supports documented behavior, not successful local execution.
- Public GitHub metadata/README is not the license authority or runtime proof. Pinned license/source files govern the repository assessment.
- Product architecture, prioritization, two-path lesson design and pilot proposals are our inferences from these sources and current code.

## 1. Pain and counterevidence

| Original source | Date / reviewed scope | Supported use and limits |
| --- | --- | --- |
| [Stack Overflow AI survey](https://survey.stackoverflow.co/2025/ai) and [methodology](https://survey.stackoverflow.co/2025/methodology) | 2025; original item results and methodology | Frustrations question n=31,476, multi-select: 66% almost-right output, 45.2% harder/time-consuming debugging, 16.3% difficulty understanding why/how. Voluntary self-report; different items have different sample sizes |
| [Shen & Tamkin: original paper v2](https://arxiv.org/html/2601.20245v2) | v1 28 Jan 2026; corrected v2 1 Feb 2026; original HTML methods/results inspected | 52 analyzed participants, randomized assistance while learning Trio; lower immediate quiz scores, no significant task-time difference. Experience table: 29 with 7+ years. Neither long-term learning loss nor all-beginner prevalence |
| [Anthropic research summary](https://www.anthropic.com/research/AI-assistance-coding-skills) | 29 Jan 2026; original organizational summary | Rounded 50%/67% scores and participant-description differences are explicitly reconciled with v2; do not treat its “mostly junior” wording as the corrected sample |
| [The Widening Gap](https://arxiv.org/html/2405.17739v1) | 28 May 2024; original preprint | 21 CS1 students, qualitative C++ task; 20 finished. Illustrates completion/understanding mismatch and effective uses; small context, not prevalence |
| [PLATEAU developer repair paper](https://kilthub.cmu.edu/articles/conference_contribution/An_Empirical_Study_of_Developer_Behaviors_for_Validating_and_Repairing_AI-Generated_Code/22223533/1/files/39505942.pdf) | 2023; original PDF | Nine participants, seeded Java errors; observed understanding/navigation/editing allocation. Not broad learning or modern-agent evidence |
| [METR early-2025 developer RCT](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) | 10 July 2025; original study report, now marked outdated | Historical 16 developers/246 tasks, 19% slowdown. Do not present as current universal AI effect |
| [METR follow-up](https://metr.org/blog/2026-02-24-uplift-update/) | 24 Feb 2026; original correction/update | 57 developers/143 repos/800+ tasks; speed estimates uncertain with selection/measurement limitations. Corrects one-sided productivity positioning |
| [Simon Willison on vibe coding](https://simonwillison.net/2025/Mar/19/vibe-coding/) | 19 Mar 2025; first-hand practitioner essay | Review/test/explain workflow as an ownership concern; not market research |

The corrected Trio paper's reported raw difference of 4.15/27 and its stated 17% gap do not match exactly. The research report preserves that discrepancy and leads with the significant directional result. Interaction-pattern comparisons are observational; Vadhyar efficacy remains untested.

## 2. Learning mechanisms

| Original source | Date / access boundary | Use / transfer limit |
| --- | --- | --- |
| [Roediger & Karpicke, Test-Enhanced Learning](https://www.psychologicalscience.org/journals/psychological-science/j.1467-9280.2006.01693.x/) | March 2006; original publisher abstract | Retrieval practice and delayed retention in prose experiments; applying it to repository reasoning is an inference |
| [Bielaczyc, Pirolli & Brown](https://doi.org/10.1207/s1532690xci1302_3) | 1995; publisher abstract | Explicit self-explanation strategy instruction in 24 novice university students; not evidence that any “why” textbox works |
| [Sentance, Waite & Kallia: PRIMM](https://primmportal.com/wp-content/uploads/2020/10/teaching-computer-programming-with-primm-a-sociocultural-perspective.pdf) | 2019; original paper PDF | School programming study, 493 pupils/13 schools. Adult self-guided product use differs |
| [Ericson dissertation](https://repository.gatech.edu/handle/1853/59890) | 9 Apr 2018; institutional abstract | Parsons-style practice efficiency; not a final independent-transfer assessment |
| [Atkinson, Renkl & Merrill](https://asu.elsevierpure.com/en/publications/transitioning-from-studying-examples-to-solving-problems-effects-/) | Dec 2003; institutional abstract | Fading worked examples combined with explanation prompts; repo transfer untested |
| [Sailer & Homner gamification meta-analysis](https://link.springer.com/article/10.1007/s10648-019-09498-w) | Published 15 Aug 2019; 2020 issue; original article | Positive heterogeneous average effects, less stable motivation/behavior evidence; not a Vadhyar effect size |
| [Mekler et al. gamification elements](https://research.aalto.fi/en/publications/towards-understanding-the-effects-of-individual-gamification-elem/) | 1 June 2017; institutional abstract | Activity increases without significant motivation/competence gains in annotation task; supports separating XP from learning |

No paper establishes an optimal Vadhyar session length, reminder schedule, mastery threshold or retention improvement. The proposed 5–10 minute sessions, delayed checks and pilot size are research design choices.

## 3. Competing workflows

Original pages reviewed; no products installed.

- [CodeTour](https://github.com/microsoft/codetour), [Tour de Code AI](https://github.com/Tour-de-Code-AI/Tour-de-Code-AI), [PocketFlow tutorial](https://github.com/The-Pocket/PocketFlow-Tutorial-Codebase-Knowledge) and [dependency-cruiser](https://github.com/sverweij/dependency-cruiser): documented workflows plus pinned source review in the upstream manifest.
- [GitDiagram](https://github.com/ahmedkhaleel2004/gitdiagram): diagram/local setup README and MIT license. Documented external-service requirements were not exercised.
- [DeepWiki-Open](https://github.com/AsyncFuncAI/deepwiki-open), [Ollama instructions](https://github.com/AsyncFuncAI/deepwiki-open/blob/main/Ollama-instruction.md): README currently uses Grok-Wiki naming. Compatibility and fully local processing were not executed.
- [CodeRabbit CLI](https://docs.coderabbit.ai/cli): official review/incremental behavior documentation. A guessed security page returned 404; no security claim is based on it.
- [Cursor codebase learning](https://cursor.com/learn/understanding-your-codebase), [privacy](https://cursor.com/privacy): official explanation/workflow/policy pages. No complete-product OSS or offline claim.
- [Copilot explore-a-codebase tutorial](https://docs.github.com/en/copilot/tutorials/explore-a-codebase): official GitHub.com public-preview workflow, not every editor integration.

“Not established” in the comparison means outside verified evidence, not proof that a competitor lacks a feature. This scan does not prove differentiation or exhaust the market.

## 4. Upstream reuse provenance

[Machine-readable pinned refs and 57 inspected paths](upstream-provenance.json) cover 12 repositories. [Reuse assessment](reuse-candidates.md) links important source/license files and records adoption gates. Commit dates are the reviewed default-branch commits; they are not latest package release dates or promises of support.

The five screenshot names/URLs were treated as research leads, not instructions or trustworthy claims. No attachment-origin command was followed. Public source was retrieved for review; no repository was cloned into Vadhyar, no code was imported and no upstream dependency was installed.

## 5. Platform and licensing sources

| Primary source | Use |
| --- | --- |
| [Node filesystem API](https://nodejs.org/api/fs.html#fswatchfilename-options-listener) | Watcher/platform caveats; content identities and explicit rescan are still needed |
| [VS Code API](https://code.visualstudio.com/api/references/vscode-api), [remote extension architecture](https://code.visualstudio.com/api/advanced-topics/remote-extensions) | Browser launch and remote URI/host lifecycle; remote support deferred pending acceptance |
| [Open Source Definition](https://opensource.org/osd) | Commercial-field restrictions differ from open-source rights |
| [Open Source Guides: legal](https://opensource.guide/legal/) | Public repository alone does not grant reuse rights; license and contribution groundwork |

Local API session authentication, Host/Origin validation, approved-root/path containment, source-sharing consent and redacted logs are proposed implementation requirements. They were not built or security-tested in this research.

## 6. Current Vadhyar evidence and process limits

Current checkout was inspected on `codex/panel-v2-phase0`, HEAD `102a1ecce30f8bd512f4ba46bbcbac181438ae9a`, canonical origin `https://github.com/sabari-nath17/vadhyar.git`. Source inspection included model/controller/check/graph/privacy boundaries, manifests and existing task/native/evaluation records. Historical demo acceptance was not rerun. The prepared NovaDesk ownership bug remains disclosed.

Tools used: Skill Router's local catalogue, Graft source/call inspection, three read-only research agents, Firecrawl search/page access, primary-source web fallbacks and GitHub metadata/file retrieval. The Search skill's Exa connector was unavailable: **zero Exa calls**. No installation of a missing connector/model/plugin was attempted. Agents used their available inherited model; no unavailable Haiku run is claimed.

Firecrawl encountered throttling and transport failures; primary-source fallbacks repaired important gaps. Original v2 paper and METR update corrected older summaries. After their initial completed research, follow-up repository/critic agents hit account limits; the primary agent performed the 12-repository pinned review and a bounded self-review. This is not a separate independent audit.

No participant interviews, learning trial, benchmark, browser-service execution, app tests, live coaching, upstream runtime or cross-platform acceptance ran in this phase. Documentation link/consistency checks and unchanged-source fingerprints are recorded in [the task handoff](../../../tasks/todo.md).
