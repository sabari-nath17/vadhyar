# Change log

Record each meaningful project change during the event, newest first. Update this file in the same commit as the change. Use a real timestamp with timezone, for example `YYYY-MM-DDTHH:MM:SS+05:30`.

## Event build log

## 2026-10-10T21:53:27.000+05:30 — S1a: testable NovaDesk seeded fixture

- Changed: Added package.json/lockfile, ESLint configuration, the pure actor/milestone approval contract and three labeled baseline cases. Updated README, task/AI records and SUBMISSION's canonical repository URL and fixture/check status.
- Why: Establish a small executable fixture for the next ownership learning slice while keeping its intentional bug visible.
- Validation: Observed deny-all test-first red (2 failed, 1 passed); final focused/full baseline green (3 passed); strict typecheck and lint passed; clean npm ci and dependency tree passed; unmatched test selection correctly exited 1. Install audit reported 0 vulnerabilities.
- Limitations: Role-only seed intentionally allows another client; baseline green is not ownership-policy success. npm warns about the unapproved optional fsevents install script, but non-watch checks work. No editor/UI, Graphify/OpenAI, packaging, archived checks or demo verification. Human review pending; local checkpoint only, no push.

## 2026-10-10T21:46:01.000+05:30 — S0b: reconcile canonical history and project instructions

- Changed: Adopted the existing canonical Vadhyar history in the local checkout; adapted AGENTS.md, added .customrules, merged local/remote .gitignore entries, corrected README repository links and preserved/extended tasks/todo.md.
- Why: Establish the current project's rules and safe file boundary before the authorized seeded fixture slice.
- Validation: Read both remote commits and canonical instructions; checked affected local Markdown links, instruction line limits, five ignore probes, protected .ignore/local .gitignore content and Git whitespace.
- Limitations: Documentation only; no application scripts/checks yet. Human file review pending. No force-push, history rewrite, second repository or push.

## 2026-10-10T20:30:35+05:30 — Initialize Vadhyar repository

- Changed: Created this repository from the organizer's template; named the project Vadhyar; customized README, submission details and AI usage; added the implementation plan, source decisions and code/script/screenshot locations.
- Why: Establish the project's source and progress record for the hackathon.
- Validation: Confirmed GitHub template metadata and generated repository; checked local Markdown references and Git diff whitespace before this commit. Remote commit verification follows the push.
- Limitations: Documentation setup only. No application code, runnable scripts, screenshots, working demo or application test results are included yet. Earlier design documentation is identified as planning, not event implementation.

## Template setup — 10 October 2026

- Changed: Added the event README, rules, agent guide, change log, AI usage record, submission checklist, Git ignore rules, and pull request checklist.
- Why: Give participants a consistent starting point for event rules, basic coding patterns, documented changes, and regular commits.
- Validation: Checked local Markdown links, event detail consistency, required documents, and diff whitespace before publishing.
- Limitations: Documentation scaffolding only; no participant project, application, or working demo is included. GitHub publication and template status are verified separately after creation.
