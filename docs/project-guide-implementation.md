# Project Guide — authorized implementation

## Mini-PRD

Audience: beginner building a personal local project with a coding agent.
Pain: the agent changes many files; the learner loses the connection between their evolving intention, implementation and next safe change.
Outcome: capture and confirm one feature intention, snapshot the project, inspect grouped changes, confirm relevant source, obtain a source-linked explanation or build prompt, and run explicitly selected existing checks.

Flow: open Project Guide → start a local snapshot → add/import/capture intent → confirm its acceptance cases → inspect changes → review suggested file groups → confirm relevant files → preview approved context → request explanation or plan/prompt → learner edits → refresh → run selected existing check → inspect actual result.

Slices:
1. Bounded project snapshots, evolving intents, versioned private storage and strict messages.
2. Controller/native UI integration, file links/diffs, local change watcher and explicit agent capture API.
3. Structured OpenAI grouping/explanation/build guidance with exact sharing approval and stale-result rejection.
4. Existing-check selection/execution, restart/recovery, documentation and focused/full checks.

Acceptance: works outside NovaDesk; additions/deletions/multi-file changes captured; saved intent revisions survive; unknown intention remains unconfirmed; changed source invalidates guidance; model references resolve only to supplied files; no implicit API transmission; generated prompts never execute; existing checks cannot be called before user choice; task success does not claim requirement satisfaction; prepared demo stays intact.

Prompt capture boundary: external extensions may call the documented capture command; a connected workspace event file supports CLI/hooks. Vadhyar cannot intercept private chats in arbitrary products. Captured requests remain unconfirmed until the learner supplies expected behavior.

Limits are explicit: bounded source/text sizes and context selections; no native execution sandbox; no automatic repair, automatic prompt sending, authorship attribution or mastery score. Project Guide uses a separate private record so existing NovaDesk evidence is preserved. No push. Shared working tree has concurrent changes; staging them is outside this slice.

## Implemented slices and review

All four code slices are implemented in `src/project/`, `src/panel/project.tsx`, the existing host/panel bundle and `scripts/capture-intent.mjs`. No new dependency was installed for Project Guide. Reused the existing official SDK/Responses client, Zod, native VS Code file selection/navigation/diffs, shared panel controls, theme tokens and Snake component. General source suggestions use keywords; Graphify's prepared adapter is not silently generalized.

Logical corrections: intention is never inferred as fact from code; unknown groups clear the active intention; new/revised features retain old requirements; imported PRD provenance survives revision and document drift blocks coaching; citations/group membership are constrained to approved source; sharing requires an exact preview; saved edits invalidate guidance; checks retain actual outcomes without implying PRD coverage; output is ephemeral; content-addressed source history prevents repeated file duplication; missing history never resets valid memory; connected capture is explicit and file events are deduplicated.

Focused checks: 19/19 Project Guide tests passed with typecheck/lint/build. Real temporary files/Git/storage/CLI/check processes ran. The official SDK request and structured formats ran through mock HTTP. Synthetic rendered UI passed 12 theme/size combinations, reviewed sharing, copy, stale source/PRD, reduced motion and page-error checks. Final combined-suite results are in `tasks/todo.md`.

Final regression boundary — 2026-10-11T01:35:23.000+05:30: UTF-8 byte bounds and decoded CLI input corrected. Typecheck/lint/build, focused 20/20 and combined 68/68 passed (22.46 s). Prior 19/19 results remain historical; final tests include non-English source.

Run an Agent Team was evaluated after the user's conditional request: keep one implementation/review pass because remaining work is sequential and tracked files overlap concurrent work. No agents spawned. This side conversation also prohibits agent delegation. Fresh native editor and live Project Guide API acceptance are pending; prepared-demo evidence is not relabelled.

Working-tree baseline: `21fdcc9`. Changes overlap existing UI/selective-reuse work. No mixed-work commit or push was made; preserve the shared index and integrate these exact files into the main thread's next reviewed milestone. See [the usage guide](project-guide.md) for the operational boundaries.
