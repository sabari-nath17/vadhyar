# Alternatives checked on 14 October 2026

Primary documentation review by Codex. These are described capabilities, not hands-on benchmarks, pricing comparisons or evidence of learning efficacy. Search families: `Copilot code review responsible use limitations human review`, `Cursor codebase understanding`, `CodeGrade AI assistant`, `GitHub Classroom autograding`. Current original pages were opened; comparison is restricted to their supported claims.

| Alternative | Supported workflow | Consequence for Vadhyar | Source and passage |
|---|---|---|---|
| Cursor | Search and explain a codebase, trace references and generate architectural diagrams; guidance encourages understanding existing patterns before changes. | A code explanation or generated graph alone is weak differentiation. Test a structured learner decision with retained evidence. | [Understanding your codebase](https://cursor.com/learn/understanding-your-codebase), sections Agentic search, Architectural diagrams, Common failure pattern. |
| GitHub Copilot review | Feedback and suggested changes on diffs; custom review instructions. Its application card calls for human review and testing because problems can be missed and suggestions can be wrong. | Keep learner reasoning and human review visible. A passing prepared case must never become a merge approval or security guarantee. | [Application card](https://docs.github.com/en/copilot/responsible-use/agents), sections 3, 4 and 7. The older code-review URL redirects here. |
| CodeGrade | Learning, feedback and coding assistants; instructor configuration of allowed context/guardrails; students and instructors can inspect conversations. The retrieved documentation labels access beta. | “Hints instead of solutions” already exists. A campus use case needs inspectable assistance and student work, not merely a tutor chat. Status statements are page-specific; availability was not tested. | [AI Assistant](https://help.codegrade.com/setup-assignment/other-features/ai-assistant), Types, Viewing chats, Configuring assistants. |
| GitHub Classroom (historical) | Repository assignments and push-triggered autograding were documented. The official retirement notice says the service retired on 28 August 2026; existing repositories are unaffected. It points to Codio and Classroom 50. | Do not design around a live Classroom integration or assume existing repository tests disappear. Current alternatives require their own review before integration. | [Retirement notice](https://github.com/orgs/community/discussions/205975), dated 27 August 2026, retirement/partner sections; [historical autograding docs](https://docs.github.com/en/education/manage-coursework-with-github-classroom/teach-with-github-classroom/use-autograding), warning and About autograding. |

## Bounded proposed position

The closest research workflow precedent is the E3 authors' [cognitive engagement techniques repository](https://github.com/MajeedKazemi/code-engagement-techniques/), linked from their paper. It implements the study interfaces, including prediction/reveal techniques. Its current usability, maintenance and feature parity were not tested, and no code was imported. This further limits any novelty claim about Vadhyar's lesson stages.

Inference from the comparison: test Vadhyar as a companion for **reasoning about a consequential code change**, with a requirement, exact prepared source, prediction captured before reveal, observed case, learner-selected change, explicit check scope and an independent answer. Use an exported record for a mentor discussion. This is a proposed workflow distinction, not proof of uniqueness, customer demand or defensibility. A competitor could implement it.

A whole LMS, assignment distribution service, coding agent, universal graph explorer or automated recruiter would duplicate mature adjacent workflows and dilute the first test. Do not build those for the mock.

## Evidence limits

No accounts, paid plans, latency, usability, language coverage or procurement requirements were tested. Search results about CodeGrade marketing, third-party reviews and GitHub feature pages were screened but not used to infer educational effects. The historical Classroom documentation must be interpreted alongside the retirement notice. No assertion that another product lacks a feature is made from absence in these pages.
