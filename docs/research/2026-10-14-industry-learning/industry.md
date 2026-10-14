# Industry evidence register — Vadhyar

Research date: **14 October 2026 (IST)**. Scope: demonstrated needs in code understanding, onboarding, review/debugging, maintainability, and hiring; contradictory evidence included. This is an annotated source register and verification report for the parent research task, not a systematic review or a product efficacy assessment.

ARS-Codex 3.22.0 bibliography and source-verification role contracts were applied within Phase 2. Sources were read through live primary web pages, HTML papers and web-extracted PDFs. No external model review, bibliographic API clients, credentials, participant recruitment, or human-read attestation was used. No source originals were saved locally: formal ARS `source_acquired` and `source_verified_against_original` attestations remain false; this document records the narrower passage checks actually performed.

## Annotated evidence register

### I01 — Current developer survey: verification is an existing workflow

**Stack Overflow. (2026). _Developer Survey 2026: AI data; methodology_.** [AI data](https://survey.stackoverflow.co/2026/ai/data), [methodology](https://survey.stackoverflow.co/2026/methodology), [release dated 6 October](https://stackoverflow.co/company/press/archive/stack-overflow-annual-developer-survey-ai-trust-conditional).

- **Design/sample:** Voluntary survey, 30,903 valid responses/39,266 recorded rows, 169 countries, fielded 23 June–5 August 2026. Promoted through Stack Overflow channels. Item denominators differ substantially from the full sample.
- **Read locators:** AI §2.2, “Trust in AI tools,” “Next steps after receiving an AI prompt response”; methodology “Survey fielding” and “Valid responses.”
- **Finding:** 6,872/14,304 (48.0%) selected trust when output is easily verifiable; 949/14,304 (6.6%) trusted important decisions. Before use, 10,067/13,162 (76.5%) reported running answers locally and 8,411/13,162 (63.9%) comparing codebase context. These are reported behaviors, not observed verification quality.
- **Limits/COI:** Self-selection, nonresponse and vendor framing; Stack Overflow sells knowledge products. The methodology explicitly permits a substantive-response recovery path independent of the bot flag; its effect was not reanalysed. Trust wording differs from 2025, preventing a clean year-to-year trust comparison.
- **Grade/verdict:** VI, descriptive self-report; primary passages support the scoped claims. Useful verification behaviors are reported; Vadhyar demand or benefits remain untested.

### I02 — Current developer survey: context gaps are directly reported

**Stack Overflow. (2026). _Developer Survey 2026: Knowledge data_.** [Full data](https://survey.stackoverflow.co/2026/knowledge/data).

- **Design/sample:** Same survey as I01, not an independent sample. Context importance question: n=12,678, up to five choices. Context barriers: n=12,374, multiple choices.
- **Read locators:** §5.1 “Important project context,” “Barriers to finding context,” and “Discovering context too late”; question wording and count tables inspected.
- **Finding:** Goals/requirements selected by 10,806/12,678 (85.2%); code/repositories/technical documentation by 9,297/12,678 (73.3%). Barriers included incomplete information, 7,825/12,374 (63.2%), and outdated information, 6,989/12,374 (56.5%). For late discovery, “very often” plus “often” is 4,503/12,687 = **35.5%**; the larger 78.6% total also includes “sometimes.”
- **Limits/COI:** The context question concerns what **people** need for their work, not specifically what AI agents need. Self-report does not quantify preventable delay. Commercial knowledge-platform interest; no Vadhyar or India-only estimates.
- **Grade/verdict:** VI. Supports testing source-linked, current requirement/context presentation. Does not establish that a graph, tutor, or new tool would resolve the gap.

### I03 — Historical developer survey: AI frustrations, with correct denominators

**Stack Overflow. (2025). _Developer Survey 2025: AI; methodology_.** [AI](https://survey.stackoverflow.co/2025/ai), [methodology](https://survey.stackoverflow.co/2025/methodology).

- **Design/sample:** 49,009 retained responses from 177 countries, fielded 29 May–23 June 2025; recruitment primarily via owned channels.
- **Read locators:** §3.2 “AI tool frustrations” and “Accuracy of AI tools”; methodology §6.1.
- **Finding:** Among n=31,476 answering the multiple-choice frustration item, rounded shares were 66% for nearly correct solutions and 45% for more time-consuming debugging. Trust item n=33,244: rounded 46% distrust versus 33% trust.
- **Limits/COI:** Historical self-report and commercial survey, not measured debugging time, current prevalence, or a causal effect. The 66% and 45% items are distinct and must not be swapped. The newer 2026 survey is I01–I02.
- **Grade/verdict:** VI. Suitable historical corroboration of verification friction; unsuitable for claiming “AI slows most developers” or an unchanged trust trajectory.

### I04 — Workplace experiments: assistance can improve output

**Cui, K. Z., Demirer, M., Jaffe, S., Musolff, L., Peng, S., & Salz, T. (2025). _The effects of generative AI on high-skilled work: Evidence from three field experiments with software developers_ [June working paper].** [Author PDF](https://www.mertdemirer.com/Papers/Demirer_AI_productivity.pdf). [Management Science publication metadata, 27 February 2026](https://doi.org/10.1287/mnsc.2025.00535).

- **Design/sample:** Randomized Copilot access at Microsoft, Accenture and one anonymous company, during 2022–2023. Cleaned analysis samples: 1,521 + 316 + 3,030 = **4,867**; original assignment counts differ.
- **Read locators:** PDF pp.1–3, §2.2, §4.1–4.2/Table 3, Appendix A p.24. Read version remains June 2025; final publisher text was unavailable.
- **Finding:** Preferred weighted instrumental-variable estimate: 26.08% more weekly completed pull requests, SE 10.3 percentage points. This estimates an adoption-complier effect, not the average effect of merely offering access or retained learning.
- **Limits/COI:** Imperfect uptake, noisy outcomes, only three firms, business-run/post-registered experiments, older completion tooling. Microsoft-affiliated authors; MIT GenAI funding disclosed. Output quantity is not independent competence or long-term maintainability.
- **Grade/verdict:** II with stated estimand limits. Positive counterevidence to universal harm; no Vadhyar efficacy inference.

### I05 — Experienced maintainers: perceived and measured speed can diverge

**Becker, J., Rush, N., Barnes, E., & Rein, D. (2025). _Measuring the impact of early-2025 AI on experienced open-source developer productivity_ (arXiv:2507.09089v2).** [Version metadata](https://arxiv.org/abs/2507.09089v2), [full HTML](https://arxiv.org/html/2507.09089v2).

- **Design/sample:** Task-randomized experiment, 16 developers, 246 real tasks in familiar mature repositories; mean repository experience five years. February–June 2025 tools, principally Cursor with Claude 3.5/3.7 Sonnet; revised 25 July 2025.
- **Read locators:** Abstract; §1 and §3; introduction’s timing/forecast comparison. Follow-up I06 reports the confidence interval.
- **Finding:** Tasks took 19% longer with AI permitted; developers afterwards believed AI had reduced completion time by 20%. The reported slowdown interval was +2% to +39%.
- **Limits/COI:** Small, selected expert-maintainer population; old tools, familiar repositories, and task-specific outcome. Not evidence about all developers, novices, or present tools. METR-authored research; funding independence was not separately audited.
- **Grade/verdict:** II, setting-bounded preprint. Supports measuring outcomes rather than relying on perceived speed. Must travel with I06 when describing current evidence.

### I06 — METR update: the old slowdown cannot be treated as today's effect

**Becker, J., Rush, N., Cunningham, T., Rein, D., & Mahamud, K. (2026, February 24). _We are changing our developer productivity experiment design_. METR.** [Original update](https://metr.org/blog/2026-02-24-uplift-update/).

- **Design/sample:** Follow-up starting August 2025: 57 developers (10 returning, 47 new), 143 repositories, 800+ tasks; task randomization retained, pay reduced from $150 to $50/hour.
- **Read locators:** Opening results; “Wider adoption…”; “Details of the productivity study.”
- **Finding:** Raw time effects: returning developers −18% (interval −38% to +9%); new developers −4% (−15% to +9%). Authors explicitly describe these as unreliable current productivity estimates because recruitment, task selection, completion and concurrent-agent time measurement changed.
- **Limits/COI:** Author report with serious selection limitations; confidence intervals include no effect. Belief that current tools help more is distinct from a reliable magnitude estimate. Same organization and some returning participants as I05; not independent replication.
- **Grade/verdict:** II design, seriously limited realized evidence. Neither “AI still slows developers 19%” nor “AI now proves an 18% gain” is justified by this pair.

### I07 — Maintainability: a direct null result challenges blanket degradation claims

**Borg, M., Hewett, D., Hagatulah, N., Couderc, N., Söderberg, E., Graham, D., Kini, U., & Farley, D. (2026). Echoes of AI: Investigating the downstream effects of AI assistants on software maintainability. _Empirical Software Engineering, 31_, Article 161.** [Publisher full text](https://link.springer.com/article/10.1007/s10664-026-10889-1).

- **Design/sample:** Preregistered two-phase study conducted late 2024; 151 valid solutions, 95.4% professionals. Phase 2 randomly assigned prior code to new developers: **75/225 assigned participants** completed valid solutions.
- **Read locators:** §§3.1, 4.1.2, 6, 7; Conflict of Interest declaration.
- **Finding:** No significant downstream differences in completion time or code quality were detected. The 30.7% Phase-1 median time reduction is **observational**, because AI-use groups reflected preferences; it is not the randomized result.
- **Limits/COI:** Attrition, small Java application, short evolution task; no long-term architecture, security or team outcome. Absence of detected difference is not equivalence. CodeScene employee/metric involvement and AI-delivery consultants are explicitly disclosed.
- **Grade/verdict:** II for downstream experiment; III for Phase 1. Counters categorical claims that AI-produced code is necessarily less maintainable; does not test developer learning or Vadhyar.

### I08 — Onboarding: code, business context and people are coupled

**Ju, A., Sajnani, H., Kelly, S., & Herzig, K. (2021). _A case study of onboarding in software teams: Tasks and strategies_ (arXiv:2103.05055v1).** [Metadata](https://arxiv.org/abs/2103.05055), [full PDF](https://arxiv.org/pdf/2103.05055).

- **Design/sample:** Microsoft US, two divisions. Interviews with 32 developers and 15 managers; subsequent surveys received **189/1,629 developer** and **37/754 manager** responses. Interview sampling targeted team arrivals in April–July 2019. Preprint posted 8 March 2021.
- **Read locators:** §II.A–C, §III.A “Learning,” and source page 5 discussion of documentation/team support; table-derived agreement percentages are not used here.
- **Finding:** Tasks supported learning about code, business/customer goals, tools and team responsibilities. Participants described documentation and team support as knowledge channels; unavailable or unfindable documentation caused frustration. Mentors also connected newcomers to other people.
- **Limits/COI:** Single-company qualitative/self-report work, low survey response, pre-generative-AI setting; not an intervention trial. Three authors were Microsoft-affiliated. Institutional perspective may affect framing.
- **Grade/verdict:** VI. A task-linked guide is a plausible research target; replacing mentoring or promising a faster ramp-up is unsupported.

### I09 — Hiring: platform activity is distinct from employability and causes

**HackerRank. (2025). _2025 developer skills report_.** [Original report](https://www.hackerrank.com/reports/developer-skills-report-2025/).

- **Design/sample:** Proprietary platform activity plus voluntary survey of 13,732 developers, managers, recruiters, executives and students across 102 countries, Q4 2024/early 2025.
- **Read locators:** “Methodology,” “Hiring recovery favors senior talent,” and causal caveat immediately below.
- **Finding:** Reported year-over-year hiring-activity growth: lead +22%, senior +19%, junior +9%, entry-level +7%. Activity includes test invitations; it is not a count of people actually hired.
- **Limits/COI:** Role-specific activity denominators were not exposed in the read text. Report itself says it cannot identify a single cause of slower junior growth. HackerRank sells assessment/upskilling products; its contextual-tutoring claims are marketing interpretations, not learning experiments.
- **Grade/verdict:** VI, proprietary observational signal with incomplete denominators. Supports examining practical skill demonstration; it cannot prove AI displaced juniors or that Vadhyar improves job prospects. No later report was found in the bounded search; this is historical evidence, not a claim of exhaustive currency.

### I10 — India employer expectations: a bounded skills-first signal

**World Economic Forum. (2025). _The future of jobs report 2025_.** [India discussion, chapter 5](https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/5-region-economy-and-industry-insights/), [methodology appendix](https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/appendix-6d9e5fce68/).

- **Design/sample:** 1,043 unique company responses, representing 14.1 million employees, 22 industry clusters/55 economies; collected May–September 2024. Focus on substantial employers, target threshold 500 employees; small enterprises/informal sector excluded.
- **Read locators:** Appendix “Survey design”/“Representativeness”; chapter 5 “Central Asia and Southern Asia.”
- **Finding:** 30% of surveyed employers operating in India expected removing degree requirements to help meet talent needs, versus 19% globally. This is expectation about a strategy, not the share that actually removed requirements.
- **Limits/COI:** India-specific respondent count is not given in the read passage, so no precise Indian population estimate or uncertainty interval is claimed. Broad sectors, executive projections, large-employer network; not a coding-skills experiment. WEF employer/policy perspective.
- **Grade/verdict:** VI survey, limited for local product demand. No evidence that employers accept a Vadhyar certificate or intend to buy learning software.

### I11 — Direct India-facing employer signal: coding performance still matters

**Infosys. (2026). _HackWithInfy 2026_.** [Official careers page](https://www.infosys.com/careers/hackwithinfy.html).

- **Type/read locators:** Official program description; “Qualifiers,” “Pre-Placement Opportunities,” “Preparatory Guidance”; checked 14 October 2026.
- **Observation:** The program invites engineering students graduating in 2027, describes virtual and face-to-face coding rounds, and offers possible pre-placement interviews for Specialist Programmer and other specialized roles.
- **Limits/COI:** One employer’s recruiting program, not an industry survey, employment outcome study, guaranteed offer, or proof that explanation portfolios influence hiring. No participant denominator or intervention effect applies. Recruitment marketing.
- **Grade/verdict:** VII employer declaration. Establishes an actual performance-assessment pathway; Vadhyar should not imply endorsement, preparation efficacy or placement partnerships.

## Verification dispositions and unresolved claims

All included items have a live primary-source identity and a read supporting passage. “Supported” above means the source reports the stated scoped result; raw data were not reproduced. I01/I02 are one survey; I05/I06 overlap; institutional pages and summaries of a paper are not counted as independent studies.

| Claim considered | Disposition and reason |
|---|---|
| Developers lack usable current project context | Supported as self-report by I02; related older onboarding observations in I08. These methods do not establish a causal remedy. |
| Verification is an observed need | I01 supports **reported verification practices**, I03 historical frustration. Actual checking quality remains unmeasured here. |
| AI universally helps or harms productivity | Rejected as an inference: I04–I06 differ in tasks, tools, populations, estimands and measurement. |
| AI code is inherently harder to maintain | Unsupported generalization; I07 supplies relevant counterevidence within a bounded task. |
| AI use causes skill atrophy for all developers | Not established by this register. Academic-learning evidence belongs to the parallel research branch. |
| Juniors are hired less because they cannot code without AI | Unsupported causal claim. I09 explicitly labels possible causes as speculation. |
| India employers will buy Vadhyar or recognize its score | No supporting primary buyer evidence found. I10/I11 cannot substitute for discovery interviews. |

Important exclusions/corrections:

- **Stack Overflow 2026 headlines:** Avoid longitudinal trust claims across changed categories; retain I02's exact question and frequency distinctions. [Question tables](https://survey.stackoverflow.co/2026/knowledge/data).
- **DORA 2025:** Official report index and questionnaire were located, but the download route presented a contact form. No form was submitted and no full-report effect was promoted from marketing copy. [Official index](https://dora.dev/research/2025/dora-report/), [questionnaire](https://dora.dev/research/2025/questions/).
- **TCS NQT 2024–2026 hiring:** Official page located, but subsequent content retrieval failed; no test-duration or score claim retained. [Candidate page](https://www.tcs.com/careers/india/tcs-all-india-nqt-hiring).
- **“More Code, Less Understanding?”** IEEE result located, but full text was not available through the attempted page; the −12.5% headline is excluded from evidence conclusions here. [Publisher record](https://ieeexplore.ieee.org/document/11458664/).
- **NASSCOM talent totals, news summaries, Reddit reports, generic “comprehension debt” claims:** Not retained as direct evidence of this workflow. Search snippets and advocacy terms are not sufficient causal evidence.
- **Registered report versus completed study:** The 2024 “Does Co-Development…” plan is superseded for findings by I07; no planned outcome was counted as a measured one.

## Search strategy and actual search log

Question: Where do original industry observations, workplace experiments and employer declarations establish a need to understand and verify code, and what evidence contradicts a simple AI-harm narrative?

Included: original developer/employer surveys with methods, controlled professional-developer studies, relevant older onboarding fieldwork, current official employer assessment descriptions, and explicit methodological updates. Excluded from evidence conclusions: unattributed statistics, secondary news claims without originals, isolated community anecdotes, marketing efficacy claims, and abstract-only effect sizes. English-language search, with global evidence and a targeted India employer pass. No arbitrary source quota or meta-analysis was used.

All searches below ran on 14 October 2026 through live web search. Follow-up opened primary links and used in-document searches for sample, timing, estimates, limitations and conflicts. The interface did not provide reproducible full hit totals; no PRISMA counts are invented.

```text
site.survey.stackoverflow.co 2025 AI trust almost right frustrating 66% methodology
site.metr.org 2025 early experienced open source developer productivity randomized 2026 update
site.microsoft.com research three field experiments software developers AI 26.08 2025
site.weforum.org Future of Jobs Report 2025 India employers analytical thinking AI skills
site.dora.dev 2025 report AI documentation code review knowledge 5000 methodology
site.microsoft.com research generative AI onboarding software developers newcomers study
site.hackerrank.com 2025 developer skills report hiring early career methodology
site.nasscom.in 2025 2026 AI talent skills demand India report methodology
"The Effects of Generative AI on High-Skilled Work" pdf Cui 2025
site.weforum.org "Future of Jobs" "1,043" "2025"
site.survey.stackoverflow.co/2026 methodology
site.hackerrank.com "2026 Developer Skills Report"
"Cui" "Demirer" "4867" pdf
site.mertdemirer.com "generative" "pdf"
software developers AI code comprehension maintainability controlled study 2025 2026 primary experiment
site.anthropic.com research AI assistance coding skills 2026 developers
site.tcs.com careers fresher hiring 2026 advanced coding skill test NQT
site.infosys.com graduate careers coding assessment 2026 problem solving
```

Coverage advisory: this is an English, primary-web register with substantial US/large-technology-company and vendor representation. It includes one India employer program and an India employer-survey excerpt, not representative Indian SME, Kerala campus-to-work, or buyer research. Publication-date concentration is intentional for rapidly changing tools; older I08 is retained only for task/social onboarding context. No journal-vendor blacklist, formal risk-of-bias instrument, retraction database or bibliographic cross-index audit was run; no clean-corpus certificate is implied. The verified publisher identity of I07 and official author/organization surfaces establish existence, not absence of every publication-integrity issue.

Read integrity: web PDF extraction supplied page mappings for I04 and I08. A screenshot request for the I08 table returned a text-only receipt to this runtime, so visual table inspection is **not** claimed. Retained counts/findings have prose support; table-only agreement percentages were omitted. Numerical additions were independently recomputed. I04's DOI landing retrieval failed; its annotation remains tied to the dated author version, with later publication metadata established by publisher search.

## Tentative need statements for later synthesis

These are product hypotheses, not findings about Vadhyar:

- **Review/debugging:** Test whether one current requirement, the changed source and the relevant check result help a developer explain a consequential decision and identify a missing case. I01–I03 justify investigating the work; they do not validate this solution.
- **Onboarding:** Test a mentor-selected first change that connects business intent to source and preserves unanswered questions for the mentor. I08 warns that documentation alone does not cover team knowledge or social integration.
- **Skills demonstration:** Preserve a learner's prediction, evidence, assistance used and an independently attempted change as inspectable records. Employer acceptance, learning transfer, reviewer time savings and willingness to pay all require direct testing; no score should certify mastery.

No code, dependencies, root records, commits, pushes or previews were changed by this research worker. Only this file is owned by the worker. Remaining risks: survey inference, tool/version drift, weak India-specific coverage, and no direct customer or learning-efficacy validation.
