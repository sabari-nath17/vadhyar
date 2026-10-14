# Campus needs and programming-learning evidence register

Research date: 14 October 2026, IST. Status: research only; annotated bibliography and source-verification handoff (academic-research-suite Phase 2). This is a bounded evidence search, not a systematic review, institutional endorsement, product evaluation, or completed research-paper pipeline. No Vadhyar learning, retention, authorship, placement, or industry-readiness outcome was measured.

## Reading this register

“Learning” below means the particular outcome and time horizon tested. Assisted exercise scores, unaided comprehension, novel code construction, delayed retention, persistence, and employment are different outcomes. A nonsignificant difference does not establish equivalence. A randomized tool assignment does not make observed prompting habits causal. Institutional guidance establishes local expectations, not educational efficacy.

Evidence levels describe design, not an automatic quality score: II = randomized experiment; III = quasi-experiment; VI = descriptive survey; VII = institutional policy/guidance or committee judgment. The five AI papers and two older programming-pedagogy papers below contain heterogeneous populations, interventions, and assessments; pooling their effect sizes would be inappropriate here.

## Programming-focused empirical sources

### E1 — AI access can impair immediate unaided understanding in a bounded professional task

**Shen, J. H., & Tamkin, A. (2026). _How AI impacts skill formation_.** [Version 2 full text](https://arxiv.org/html/2601.20245v2); [version history](https://arxiv.org/abs/2601.20245). Preprint, v2 submitted 1 February 2026. **Level II.**

- **Population/design:** 52 analyzed participants, 26 per randomized arm; experienced Python users unfamiliar with Trio. GPT-4o chat versus no AI; up to 35 minutes for two asynchronous-programming tasks. This is new-library learning, not beginners learning programming.
- **Outcome/horizon:** Immediate unaided 14-question, 27-point conceptual/read/debug quiz. AI access reduced scores by 4.15 points, reported Cohen’s d = 0.738, p = .010. Task-speed difference was nonsignificant. No delayed retention or novel code-writing test.
- **Verification caveat:** The paper calls 4.15/27 approximately 17%; direct arithmetic is 15.37 percentage points. Retain the raw difference instead. Six interaction patterns are exploratory observations, not randomized learning mechanisms.
- **Limits/interests:** Small, brief experiment; no campus or employment outcome. Authors are affiliated with Anthropic/Anthropic Fellows while testing GPT-4o. Peer review was not established.
- **Read locators:** §§4.1–4.3, 5.2, 6, 7.1; Table 1; Figure 6. The HTML body date differs from arXiv version-history metadata; the version identifier above controls this citation.

### E2 — Structured novice instruction did not show the same learning penalty

**Kazemitabaar, M., et al. (2023). _Studying the effect of AI code generators on supporting novice learners in introductory programming_. CHI.** [Author full text](https://terpconnect.umd.edu/~weintrop/papers/Kazemitabaar_et_al_CHI_2023.pdf); [DOI](https://doi.org/10.1145/3544548.3580919). **Level II.**

- **Population/design:** 90 started; 69 completed: 33 Codex, 36 control. Ages 10–17 in Canadian coding camps. Learners were matched on a Scratch pretest and randomized within pairs. Three weeks, ten sessions, seven training sessions; authoring tasks followed by manual modifications, with instructor feedback.
- **Outcome/horizon:** Assisted authoring completion and correctness improved; manual modification showed no decrement. Overall immediate and one-week retention differences were nonsignificant. Retention multiple-choice means were 44.1% versus 34.6%, p = .129. Evaluation disallowed AI, documentation, and feedback.
- **Limits/interests:** Approximately 23% attrition, selected children, structured exercises, older Codex model, and human support limit generalization. Absence of a significant penalty is neither equivalence nor proven learning benefit. Prior-knowledge subgroup findings warrant caution. Authors evaluated their intervention; no separate financial competing-interest declaration was located.
- **Read locators:** §4 methods; §5 learning/retention outcomes; §7 limitations; acknowledgments. The DOI endpoint was blocked; title/authors/DOI were checked against the author PDF.

### E3 — Requiring cognitive activity carries costs; learning gains remain unproven

**Kazemitabaar, M., et al. (2024). _Exploring the design space of cognitive engagement techniques with AI-generated code for enhanced learning_.** [Read preprint v1](https://arxiv.org/html/2410.08922v1); [IUI 2025 publication DOI](https://doi.org/10.1145/3708359.3712104). **Level II; conclusions here concern the read preprint, not verified final-version parity.**

- **Population/design:** Study 1 randomized 82 undergraduate data-structures students among eight interfaces during a two-hour session. Study 2 counterbalanced three interfaces within 42 students during a 2.5-hour session. Techniques included explanation, puzzles, verification, Lead-and-Reveal, and Trace-and-Predict.
- **Reporting ambiguity:** §6.1.1 says 42 recruited; §6.4 reports N=30 for the completion-time Friedman test. The retrieved text does not explain the discrepancy. These numbers must not be treated as the same analyzed sample or as confirmed attrition.
- **Outcome/horizon:** Unaided isomorphic tasks in Study 1 did not establish corrected-significance learning improvements. Study 2’s unaided fill-in assessments also showed no significant difference, p = .150. Trace-and-Predict took 1,251 seconds versus 471 for baseline and increased workload.
- **Limits/interests:** Small groups, algorithm-heavy tasks, short exposure, and no delayed assessment. Interaction or calibration correlations do not establish a mechanism; one significant correlation and another nonsignificant correlation do not prove they differ. Authors designed the interfaces; a formal competing-interest declaration was not located.
- **Read locators:** §§4.3, 6.3–6.5 and limitations. Publication metadata was found; ACM full text was inaccessible. Treat forced prediction as a prototype hypothesis, not an established treatment.

### E4 — Better classroom exercise scores can coexist with unchanged measured learning

**Bassner, P., et al. (2026). _Less stress, better scores, same learning: The dissociation of performance and learning in AI-supported programming education_. Computers and Education: Artificial Intelligence, 10, 100537.** [Publisher full text](https://www.sciencedirect.com/science/article/pii/S2666920X25001778); [DOI](https://doi.org/10.1016/j.caeai.2025.100537). Online 24 December 2025; June 2026 issue. **Level II.**

- **Population/design:** TUM introductory programming for management students; randomized GPT, contextual hint tutor Iris, or no-AI conditions. Of 452 participants, 275 remained after exclusions (39.2%): 88/91/96. One supervised 90-minute Java-concurrency session.
- **Outcome/horizon:** Exercise scores were 71.84%, 57.50%, and 29.85%. Six-item knowledge-test gains showed no group-by-time interaction, p = .773; three-item comprehension differences were nonsignificant, p = .136. No delayed or unaided novel-program construction test.
- **Limits/interests:** Substantial exclusions, coarse assessments, short exposure, and management-student population. Iris supplied contextual scaffolding; generic GPT could supply full answers, so multiple design differences were bundled. Nonsignificance does not prove equal learning. Authors declared no financial/personal competing interests; they also developed/studied Iris.
- **Read locators:** §§4–5, Tables 2–6, limitations and declaration. Full publisher article recovered through Firecrawl after direct access failed; publication date checked against publisher metadata.

### E5 — Compiler feedback improved some persistence measures, with limited carryover

**Zhou, Y., Pankiewicz, M., Paquette, L., & Baker, R. S. (2025). _Impact of LLM feedback on learner persistence in programming_. ICCE.** [Publisher record](https://library.apsce.net/index.php/ICCE/article/view/5957); [full paper](https://library.apsce.net/index.php/ICCE/article/download/5957/5887); [DOI](https://doi.org/10.58459/icce.2025.5957). Published 1 December 2025. **Level II.**

- **Population/design:** 257 first-semester CS1 students at a European university; 129 feedback/128 control. C#, fourteen typically weekly modules, 141 optional problems: GPT-4 compiler-error feedback on 72 first-half problems, then 69 problems without it. Analysis used 43,795 submissions.
- **Outcome/horizon:** Enabled feedback improved final-submission scores (b = .029, p = .041) and reduced wheel-spinning (b = −.025, p = .032); solved-proportion p = .061. Corresponding disabled-phase outcomes were nonsignificant (.402/.196/.324). One difficult-problem persistence outcome did improve afterward (p = .028), preventing a blanket “no carryover” conclusion.
- **Limits/interests:** Optional-task logs, small effects, multiple outcomes, and compiler errors in fewer than 10% of submissions. Withdrawal of feedback occurred within modules; this was not a delayed retention examination. No demonstrated independent mastery or employment gain. Authors evaluated their feedback system; a formal competing-interest declaration was not located.
- **Read locators:** §§3–5, Tables 1–2; full PDF recovered through Firecrawl.

### E6 — PRIMM supports a pedagogical rationale, with nonrandomized school evidence

**Sentance, S., Waite, J., & Kallia, M. (2019). _Teaching computer programming with PRIMM: A sociocultural perspective_. Computer Science Education.** [Author/project full text](https://primmportal.com/wp-content/uploads/2020/10/teaching-computer-programming-with-primm-a-sociocultural-perspective.pdf); [DOI](https://doi.org/10.1080/08993408.2019.1608781). Published 26 April 2019. **Level III.**

- **Population/design:** 493 intervention learners aged 11–14 in 13 English schools, alongside 180 controls. Eight to twelve weeks. Predict, Run, Investigate, Modify, Make combined code reading, discussion, editing, and creation; classes were not randomized, and controls had different teachers.
- **Outcome/horizon:** Intervention learners performed better on the immediate post-test; reported effect r = .13 was small. Teacher interviews reported classroom benefits. The paper’s interpretation of r as percentage variance should not be repeated.
- **Limits/interests:** Volunteer teachers, nonrepresentative sampling, no validated test instrument, limited demographic information, and uncontrolled teacher/curriculum differences. The design does not isolate individual stages or establish AI, university, delayed-transfer, or workplace effects. Authors developed PRIMM; they declared no potential conflict of interest.
- **Read locators:** Methods; §6.1/Table 4; §8.3; disclosure. DOI access failed, but the full author/project PDF supplied title, metadata, methods, and results. Use as a design precedent, not proof of Vadhyar’s sequence.

### E7 — Worked-example scaffolding helped quizzes without a clear mean-exam advantage

**Margulieux, L. E., Morrison, B. B., & Decker, A. (2020). _Reducing withdrawal and failure rates in introductory programming with subgoal labeled worked examples_. International Journal of STEM Education, 7, 19.** [Publisher full text and DOI](https://doi.org/10.1186/s40594-020-00222-7). Published 11 May 2020. **Level III.**

- **Population/design:** 265 analyzed students from 307 enrolled at the University of Nebraska Omaha; 120 subgoal/145 comparison students across five sections. Fifteen-week course, with intervention across five weeks introducing procedures; nonrandom assignment and one online comparison section.
- **Outcome/horizon:** Quiz averages 48% versus 41%, d = .44, p = .001. Mean exam scores 75% versus 72% were not significantly different, p = .24. Withdrawal/failure and accumulated exam-credit outcomes need distinction from mean exam performance.
- **Limits/interests:** Instructor/delivery/section differences constrain causality. Explanation-quality associations do not establish causation. No AI, employment, or distant-transfer measure. NSF-funded; no competing interests declared. An author taught intervention sections.
- **Read locators:** Methods/participants; quiz/exam and explanation-quality results; limitations; funding; competing interests. DOI resolved to the matching publisher article. Test scaffolding with its eventual removal explicitly evaluated.

## Institutional expectations and constraints

### P1 — IIT Delhi: assessment design, equitable access, and faculty capability

**IIT Delhi committee (30 October 2024), _On use of GenAI at IIT Delhi_.** [Official seven-page report](https://academics.iitd.ac.in/wp-content/uploads/2025/09/IITD-AI-Guidelines.pdf). **Level VI survey / VII recommendations.** The 2025 upload directory is not the report’s date.

Read the survey summary and §3 recommendations, pp. 5–7. Responses from 427 students and 88 faculty identify widespread use and concerns about understanding, fair evaluation, and faculty preparation; respondent selection prevents prevalence estimates for Indian higher education. Recommendations include disclosure and verification, protecting confidential information, equitable tool access, faculty workshops, updated learning outcomes, and course-specific policies. This is a committee report with preliminary recommendations, not evidence of national rules or a purchased solution. A campus concept should therefore support teacher-defined assessment and training, but no institutional budget, procurement intent, or willingness to pay has been established.

### P2 — IIT Bombay HSS: permission, records, privacy, and human judgment

**IIT Bombay Department of Humanities and Social Sciences, _AI Policy for Teaching, Research and Administration_.** [Official policy PDF](https://www.hss.iitb.ac.in/sites/default/files/2026-03/HSS%20AI%20Policy%20-%20FINAL.pdf). **Level VII.** No printed approval date was identified; the path indicates a March 2026 upload only.

Read clauses 3, 5–6, 11–12, and 14–15. Scope is this department, not all IIT Bombay or computer-science courses. The policy requires prior instructor/supervisor permission outside specified exceptions, disclosure of tools/prompts and AI contributions, production of interactions when required, and human verification. It restricts uploading sensitive/nonpublic material. It provides for AI-use/non-use declarations and rejects AI detection alone as sufficient disciplinary evidence without human verification. These rules support an instructor-controlled assistance policy and learner-reviewed disclosure export; they do not authorize indiscriminate surveillance, misconduct inference, or automatic grading. Full text was recovered through Firecrawl after direct retrieval failed.

### P3 — CS50: a course can permit its tutor while prohibiting external answer tools

**CS50x 2026, _Academic Honesty_.** [Official live course policy](https://cs50.harvard.edu/x/honesty/). **Level VII.** Checked 14 October 2026; the year-specific URL redirected to this page.

Read the reasonable/unreasonable examples. The course permits its own CS50 Duck and prohibits external AI that suggests or completes answers or code, naming common assistants. This is a course rule, not a Harvard-wide ban. A helpful instructional interface cannot assume permission simply because it calls itself a tutor. A Vadhyar campus pilot needs an explicit course policy for allowed assistance and assessment conditions. The page establishes authorization boundaries, not comparative tutor effectiveness or proof of student understanding.

### P4 — Oxford: explain and defend work, verify outputs, follow local assessment rules

**University of Oxford, _Generative AI tools_.** [Official student guidance](https://www.ox.ac.uk/students/life/it/genai-tools). **Level VII.** Live page checked 14 October 2026; no revision date established.

Read the ten guidance points, especially 3, 6, 9, and 10. Students should follow assessment-specific rules, protect confidential information, verify outputs, and be able to explain and defend submitted work. Tutor, supervisor, and department instructions remain relevant. The university also describes approved institutional tools and associated protections; third-party tools do not inherit these arrangements. This supports collecting reviewable evidence of reasoning under declared conditions. It does not establish that an explanation, oral defense, or automated rubric by itself proves authorship or durable skill.

## Handoff questions for a prototype and later evaluation

These are proposed measurement and workflow choices, not findings of a Vadhyar trial or a completed product recommendation. They should be evaluated with the main research synthesis and the existing repository constraints.

| Candidate activity | What a prototype may record | What remains to be tested |
| --- | --- | --- |
| Explain | Learner’s account of a requirement and source evidence, with assistance disclosed | Correctness, independent reasoning, and whether scoring is reliable across reviewers |
| Predict | A saved prediction before revealing execution evidence | Whether the extra step changes understanding sufficiently to justify time and workload (E3) |
| Change | A learner edit on a bounded repository task | Independent code construction versus copying, and behavior on an unfamiliar variation |
| Verify | Actual check results linked to the tested code revision | Whether the learner understands why the checks pass and can identify missing cases |
| Transfer | A fresh task completed under explicitly recorded assistance conditions | Near transfer immediately and retention after a delay; neither should become an unqualified mastery label |
| Campus review | Course policy, attempt history, chosen disclosure export, teacher review status | Faculty workload, learner accessibility, privacy acceptability, grading consistency, and authorized use (P1–P4) |

For a later pilot, predefine one independent primary outcome, baseline programming knowledge, task equivalence, permitted assistance, scoring rubric, sample-size rationale, exclusions, and analysis. Keep assisted completion, immediate understanding, delayed performance, and confidence separate. Report attrition, uncertainty, implementation fidelity, and teacher time. Freeze model/version and record assistance exposure. Use human-reviewed scoring and blinded raters where feasible. A mock interface can show how these records work; simulated records cannot validate the measurement or claim employment readiness.

Open evidence gaps: no Indian programming-learning experiment is included; no included study establishes Vadhyar efficacy, production-repository transfer, hiring success, or placement improvement. Institutional documents establish concerns and constraints, not customer discovery. Faculty and student interviews, course approval, representative repository tasks, and a real pilot are still required before those claims.

## Search and verification log

- **Scope/date:** English-language public primary sources, searched 14 October 2026. AI-programming studies from 2023 onward, with two directly relevant pre-AI pedagogy studies; current official Indian and international institutional guidance. Discovery used live web search, then publisher, author, arXiv, or institutional originals. Backward/forward citation searches followed relevant papers. No arbitrary paper quota or claim of exhaustive coverage.
- **Representative actual queries:** `"How AI Impacts Skill Formation" 2601.20245`; `generative AI novice programming randomized controlled learning retention Kazemitabaar 2023 2024`; `"Kazemitabaar" "69" "retention"`; `"AI" "programming" "randomized" "learning" "2025"`; `"Less stress, better scores, same learning" pdf`; `"PRIMM" "493" study PDF`; `"subgoal" "programming" "2020" "265"`; `site.ac.in generative AI policy students assessment programming`; `site.ox.ac.uk generative AI teaching assessment oral examinations students guidance`; `"AI Policy for Teaching, Research and Administration" "HSS"`; `"Exploring the Design Space of Cognitive Engagement" DOI`.
- **Source identity:** Matched titles/authors and DOI/arXiv identifiers against available originals. Semantic Scholar API access was unavailable: `[S2-API-UNAVAILABLE]`; none is labeled S2-verified. Deduplication used title/DOI/arXiv identity. Exact query result counts were not available and no PRISMA flow was fabricated.
- **Full-text coverage:** Methods, supporting results, limitations, and declarations were read where located, not just abstracts. Firecrawl recovered E4, E5, and P2 after direct retrieval failed. E2/E6 rely on author/project PDFs. E3 uses the explicitly versioned preprint; the publication’s final body was not inspected. Margulieux’s DOI successfully resolved. Several other DOI endpoints returned access failures; that is not evidence of invalidity.
- **Rendering limit:** PDF text extraction was inspected. Screenshot requests did not provide viewable page pixels in this session; no visual table-layout verification is claimed. Ambiguous extraction was avoided when reporting numbers. Neither raw study datasets nor analysis code were reanalyzed, apart from the stated E1 percentage calculation. No replication or independent outcome validation occurred.
- **Interests/retractions:** Funding and competing-interest statements were recorded when found; absence of a located statement is not absence of a conflict. Intervention developers’ involvement is disclosed separately from formal financial declarations. Dedicated retraction/Cabell/Beall checks were not performed; no assertion that all sources are free of corrections or retractions is made.
- **Coverage skew:** Seven empirical papers: five AI experiments and two older quasi-experiments. Programming specificity was prioritized over quantity. Samples are overseas, generally selected, early-course, or short-task populations. E1 alone studies experienced programmers. Many endpoints are immediate and narrow; the included papers cannot justify a generalized industry-readiness effect.

### Discovery items excluded from evidentiary claims

- [_The Conversational Exam: A Scalable Assessment Design for the AI Era_](https://arxiv.org/abs/2601.10691): abstract-level discovery only; no empirical-effect claim imported.
- “AI adaptive programming tutor nearly doubles…”: secondary Evidoria discovery; underlying full study not verified, so the headline and sample/effect claims were excluded.
- [LLM collaborative-programming article, DOI 10.1057/s41599-025-04471-1](https://doi.org/10.1057/s41599-025-04471-1): discovery metadata/abstract only; methods not inspected, therefore excluded from effect claims.
- Physics, mathematics, economics, and general tutoring results: excluded as direct support for programming transfer. They may motivate later research but do not resolve this question.
- Reddit, blogs, and ResearchGate snippets: discovery aids only, not evidence for reported effects or institutional rules.

## Completion boundary

This file is the only artifact created by this delegated research slice. No source code, root records, raw vault sources, credentials, external messages, commits, or pushes were changed. Current project context and relevant prior learning-loop notes were consulted to preserve evidence boundaries. The next owner should synthesize this register with industry research, then label any mock prototype and seeded learner records clearly.
