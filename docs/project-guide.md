# Vadhyar Project Guide

Project Guide implements the wider project workflow requested after the prepared NovaDesk demonstration. It reads the learner’s actual local workspace; it has no code-editing or prompt-dispatch authority.

## Open and use it

Build the extension with `npm run build`, launch the Extension Development Host with one trusted local project folder, and run **Vadhyar: Open Project Guide** from the Command Palette. **Vadhyar: Understand this change** routes ordinary workspaces here; a workspace carrying the prepared NovaDesk requirement ID retains its original demonstration. VSIX packaging is a separate delivery task.

1. **Start tracking this project** before the next coding session. Capture begins now; earlier history and authorship are unknown.
2. Add a feature request and its expected behavior, or import one requirement from workspace Markdown. Supported OpenSpec headings/scenarios are parsed; ordinary Markdown begins as an unconfirmed draft whose expected behavior the learner supplies.
3. **Confirm this feature intention.** Captured requests and imported text do not confirm themselves.
4. Inspect changes across files using native editor diffs. Use **Find relevant code** for keyword suggestions, or **Select relevant files** to confirm a bounded context. Suggestions do not prove relevance.
5. Optionally review source context for **feature grouping**. OpenAI proposes groups from the selected file excerpts and confirmed intentions. Review a group before using it; an unknown group clears the selected intention and requires adding/selecting one.
6. Review exact filenames, model, instructions and payload before sending an **explanation** or **build plan and prompt**. These are live runtime API operations, not hard-coded NovaDesk answers. No request occurs while preparing the preview.
7. Read the explanation’s purpose, logic and consequence. Source buttons open actual validated lines. Review/copy the proposed coding prompt and decide how to use it in your coding tool.
8. Make changes in the editor. Saved changes refresh local context; unsaved changes block sharing/checks. Earlier guidance remains historical. Select an existing project check, review the native execution confirmation and inspect its actual result.

An idea can be planned before source exists. Explanations require selected existing files. The coach cannot invent source locations for an unbuilt feature.

## A feature added halfway through

Add a new intention, for example “Send a reminder 24 hours before a milestone is due.” Keep the original approval intention. Confirm the new expected behavior and choose its relevant files. A file can support several features; groups are proposals, not exclusive ownership assignments.

**Revise this intention** creates a new unconfirmed revision with a link to its predecessor. The previous text and checkpoints remain. Selecting a feature restores its latest available guidance; a changed source version marks it historical. An imported intention retains its PRD path/hash when revised. If that document changes, reimport and confirm the current requirement before requesting guidance. Vadhyar does not silently rewrite user intent to fit the implementation.

## Connecting coding-request capture

The default is manual entry. **Enable agent capture bridge** enables two explicit integration surfaces. This does not connect a coding product or intercept its private chats.

### Another VS Code extension

After the learner enables capture, an integration can call:

```ts
await vscode.commands.executeCommand('vadhyar.captureIntent', {
  title: 'Email reminders',
  request: 'Add reminders for unfinished milestones',
  expected: 'Send once, 24 hours before due; completed milestones receive none'
});
```

The receiving host records the origin as `agent`; the expected field can be empty. Each command call creates a new unconfirmed intention. Integrations must avoid duplicate calls and send only the deliberately selected request, without credentials or unrelated conversation.

### A coding-agent hook or CLI

The supplied helper reads a JSON event from standard input and atomically appends it to the chosen workspace’s `.vadhyar/intent-events.json`:

```sh
node /absolute/path/to/vadhyar/scripts/capture-intent.mjs /absolute/path/to/learner-project < /path/to/selected-request.json
```

Example input:

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "title": "Email reminders",
  "request": "Add reminders for unfinished milestones",
  "expected": "Send once, 24 hours before due"
}
```

Configure your coding tool’s supported hook to supply that event before the coding request. No tool-specific hook has been installed by this change. Reusing an event ID deduplicates retries. The open guide watches the event file; **Refresh saved changes** also imports it. Events remain unconfirmed. Add `.vadhyar/` to your learner project’s ignore rules before publishing its repository; this implementation does not modify those rules automatically.

The helper uses restrictive local permissions, rejects symlink destinations and writes under an exclusive lock. It preserves existing data if the file is malformed/full or another writer holds the lock. A crashed writer can leave a lock; inspect the process and back up the local event history before manually removing a stale lock. The helper never uploads a prompt.

## OpenAI and checks

Project grouping, explanation and planning reuse the existing official SDK **Responses API** and Structured Outputs request implementation. The extension host holds the SecretStorage key; the webview does not receive it. The existing application model setting is used with no silent fallback. A native masked key dialog remains available through Settings.

All externally returned fields and citations are validated. Unknown paths, out-of-range lines, omitted group files, duplicate paths, refusals and incomplete responses cannot become accepted guidance. Source/model changes during a request reject its result. A valid citation/schema does not establish that an explanation is correct; content still needs review. Grouping uses excerpts and does not infer runtime behavior. [Official Structured Outputs documentation](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses).

The general guide uses saved source and keyword suggestions; the existing **Graphify adapter still targets the NovaDesk fixture**. This change does not claim a whole-project call graph or automatic PRD coverage.

Project checks are existing `package.json` test/check/lint/typecheck scripts. The learner picks a script and separately confirms each execution. The host rechecks the exact manifest, uses fixed process arguments, limits execution to 30 seconds and bounds output. Workspace Trust permits local execution; it does not sandbox project code. Scripts can modify files. Cancel/timeout/start failure and nonzero exit remain distinct from successful execution. Source, intention or manifest drift makes the previous result historical.

Check output is shown as escaped text for the current interaction, with recognizable private content withheld. It is neither persisted nor sent to OpenAI; recognition is not a complete secret detector. No API key is inherited by the check process. Exit zero establishes the selected script’s success, **not** that every requirement is satisfied. General-domain counterexample generation, acceptance-case mapping and learning assessment are not supplied by this guide. NovaDesk retains its separately pinned, executed ownership checks.

## Where memory lives

VS Code provides a workspace-specific `ExtensionContext.storageUri`. Inside it:

| File | Contents |
| --- | --- |
| `project.json` | Intent revisions, confirmation history, snapshot references, latest/history guidance, response metadata, selected check and actual check records |
| `project-sources/<content SHA-256>` | Private immutable source contents shared by snapshots instead of duplicating each file for every feature |
| Existing NovaDesk session files | Preserved separately; Project Guide does not overwrite prepared-demo evidence |

The extension creates private source storage with owner-only permissions on supported systems and atomically replaces metadata. Missing/corrupt history prevents loading and preserves the existing record instead of resetting it. Restart restores saved intentions, source history and guidance; check output and unsent sharing previews are not restored. This is local workspace memory, not cloud sync or OAuth memory.

Limits: 50 intentions, 20 retained guide results, 20 check runs and 20 intent/source checkpoint associations. Reaching a limit rejects the new write while retaining valid history; automatic pruning and a recovery/export interface are not implemented. Avoid parallel hosts writing the same workspace storage. Changing profiles/hosts can select different VS Code storage.

## Scope and coverage limits

- One trusted local workspace; no multi-root, remote or universal editor integration.
- Up to 300 supported source/text files, 100KB per file and 2MB per snapshot. Git discovery respects ignore rules for untracked files; non-Git folders use bounded traversal. Hidden paths, dependencies, generated output and detectable private content are excluded. Excluded eligible files are listed; these exclusions mean incomplete coverage.
- At most 30 selected files and 65KB of API context per request; use smaller feature groups for large changes. Grouping supplies the first 25 lines/1,800 characters per selected file and explicitly labels them as excerpts.
- The “changed span” line count covers the section between the first and last changed line, including unchanged lines inside that section. Native diffs provide the actual detailed comparison.
- Source snapshots are read from saved files and compared using hashes. They do not establish who authored changes, an atomic repository transaction, full dependency/runtime state or learning mastery.
- No automatic edits, command proposals from the model, prompt dispatch, whole-project PRD auditor, alternate-implementation generator or automatic repairs.

## Verification boundary

New Project Guide tests exercise temporary non-NovaDesk workspaces, real files/storage/Git/CLI/check processes, confirmation/revision/import/capture handling and stale guards. API response boundaries use synthetic responses; controller API calls use a mock. Typecheck, lint and build are recorded in the [slice record](../tasks/todo.md).

The rendered panel was exercised across four simulated themes and 320/360/900px widths, sharing consent, copy behavior, stale source/PRD, reduced motion and page errors. [Project Guide capture](project-guide-evidence/project-guide-360.png) uses a synthetic host state. This is not new native editor acceptance or live provider evidence. Existing S5/S7 live results belong to the prepared flow, not these newly added operations. Human usability/teaching review, fresh native Project Guide navigation and fresh live grouping/planning acceptance remain pending.
