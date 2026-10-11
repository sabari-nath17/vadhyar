# Vadhyar Build Guide — original plan and implementation boundary

Current implementation: [Project Guide](project-guide.md) now supplies workspace snapshots, evolving intentions, reviewed source selection/grouping, structured explanations and copyable build prompts, with explicit existing-check execution. The original roadmap below remains context; it is not a claim that arbitrary-project teaching scenarios or live acceptance have shipped.

## Job

Help a beginner turn one feature idea into a clear requirement, a small build plan and a focused prompt, then understand the code that results. The user chooses whether to send the prompt to their coding agent. Vadhyar provides guidance and records evidence; it has no code-editing authority.

This extends the post-build handover. Recorded S5/S7 acceptance covers the prepared NovaDesk learning loop. General workspace guidance, Markdown intention import and prompt generation are now implemented with product and synthetic UI checks; fresh live API/native acceptance for that mode remains separate.

## Smallest useful flow

1. **Describe one feature.** Paste a short idea or selected PRD paragraph. Ask only for missing information needed to define its behavior.
2. **Confirm intent.** Save the user's edited requirement, acceptance cases and constraints. Clearly label assumptions.
3. **Plan one slice.** State the next result, relevant source locations when known, scope and evidence needed. New files are proposals, not claims that they already exist.
4. **Prepare a focused prompt.** OpenAI drafts a copyable coding-agent prompt for this slice using approved intent and bounded current context. The user reviews and copies it; no automatic send or execution.
5. **Capture the change.** Save a baseline before coding, then explicitly refresh after the agent works. Tie explanation and diff to current source. Tracking begins at capture; earlier authorship/history is unknown.
6. **Hand over understanding.** Reuse Vadhyar's explain → predict → investigate → learner edit → checks flow where a supported verification scenario exists.

Suggested panel sections: **Build Guide** and **Understand a Change**. Start with one feature rather than a whole-product planning wizard. Both refer to the same confirmed intent and source evidence.

## Prompt output

One structured response supplies: next-step title, reason, proposed scope, copyable prompt, acceptance checks, evidence needed and open questions. Existing source references must use validated host IDs. Render text safely. A generated instruction to run a check is a proposal; only executed results establish what happened.

Example prompt shape:

> Implement only the confirmed feature slice. Inspect the selected current files and follow their existing patterns. Preserve the recorded constraints and unrelated work. Show the change scope, make a small reviewable diff, run the agreed checks and return the actual results plus remaining uncertainty.

Use the existing API client and output validation for a separate Guide operation when implemented. Preview its context and obtain the existing sharing consent before transmission. Guide requests have no edit, shell or dispatch tools. Missing evidence produces a question or an explicitly tentative plan rather than an invented answer.

## Prerequisites and ordered slices

| Slice | Work | Completion evidence |
|---|---|---|
| G0: bounded portability | Replace NovaDesk-only requirement/source assumptions with user-confirmed text, selected files and an entrypoint; keep path, source-reference and size validation | A second small TypeScript project can be explained with current source links; unsupported verification is explicitly unavailable |
| G1: intent and prompt | Confirm a feature requirement; generate and copy one slice prompt through a live Guide operation | Actual output reflects the approved rule, constraints and selected context; invalid references and missing information are handled |
| G2: before/after handover | Connect the pre-build checkpoint, changed source and existing learning flow | Source changes invalidate stale advice; baseline and refreshed source can be inspected |
| G3: resume | Extend the versioned local session with guide stage, approved intent, prompts and observed outcomes | Old records survive migration; reopen restores progress without falsely marking planned checks as passed |

Do not enable arbitrary workspace test execution as a side effect of G0. Keep prepared verification working; broader check configuration is a separate trusted boundary. Current Graphify validation is tailored to the approval fixture, so generalization needs adapter/schema work, not a name replacement.

## Memory

Keep guide records and source snapshots in workspace extension storage. Store credentials separately in SecretStorage. Keep a bounded recent task summary with pointers to original records, source hashes and actual checks. Summaries cannot convert proposals into verified outcomes. OAuth does not synchronize these records.

## Acceptance and demo

Use two small, disclosed examples to avoid presenting a prepared workflow as general onboarding. Show approved intent → one generated prompt → baseline → changed source → learner explanation/edit → actual supported checks. Verify live output accuracy and source references, failure/cancel states, persistence, migration and keyboard/copy behavior. A successful rehearsal is not proof of learning gains.

Complete the original learning loop before expanding this mode. No database, vector store, automatic prompt sending, whole-PRD auditor, mastery score or automatic repair is required for this first version.

## Game side feature

The user selected Snake as the first Easter egg. It uses local panel state, requires explicit play, supports keyboard/direction buttons and pauses when focus leaves the game, the egg closes or the page is hidden. Its score and state are separate from learning/session evidence. It does not use OpenAI or access project files. Reloading the panel starts a new game.
