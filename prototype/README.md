# Browser source and local service

This folder contains Vadhyar's current browser interface, local host, source recorder and tests. The launcher opens one trusted local project; build in your usual editor and use Vadhyar to investigate saved source and retain your reasoning.

## Run from source

From the repository root, use Node.js 24 LTS or 26 and the locked dependencies:

```sh
npm ci --ignore-scripts
npm start -- --project "/absolute/path/to/a/trusted/project"
```

Without `--project`, the launcher studies the current working directory. Open its printed address, normally `http://127.0.0.1:4173`. `VADHYAR_MOCK_PORT` selects another unused local port; stop only your instance with Ctrl+C. The host uses loopback on this computer. Narrow-window/zoom checks do not establish phone/LAN access.

For the prebuilt app, follow [portable installation](../docs/browser-installation.md). The published preview and current checkout have separate source identities; see [release verification](../docs/browser-release-verification.md).

## Investigate a question

Choose saved source in Project, confirm one requirement and concrete case, and save a prediction before observing. Observe in your own tool and record what happened. Vadhyar rereads the selected source before accepting that self-report; changed source requires an explicit fresh attempt with the original prediction retained.

Save edits in the original editor if needed, or explain why the existing source already meets the requirement. Explicitly refresh the question's source before verification. Use manual evidence or separately approve an eligible existing project check. Command status, coverage and your requirement verdict stay separate. Reflect, answer a distinct case, review Path/Notebook and export. Activity rewards do not measure ability or independent authorship.

Add up to five captured ranges to the Project reading bundle. Inspect exact retained versions, declaration anchors, text search and selected static links. Failed reads preserve captures; mixed file versions cannot be analyzed together. **Export before leaving Project**: the reading bundle is view-local. See [bounded source reading](../docs/source-reading.md).

## Storage and recovery

- The host keeps metadata in SQLite and follows eligible saved additions, changes and deletions. Initial baseline metadata is distinct from later development events. AI-session completion/build status is not inferred from a file save.
- File pages contain at most 100 entries (default 50). Selected source is capped at 200 lines and 40,000 characters, with a full-file SHA-256 identity. Hidden/vendor/generated/binary/symlink and common private patterns are excluded; exclusions are not comprehensive secret detection.
- Recorder storage defaults to `~/Library/Application Support/Vadhyar/prototype/<project-id>/files.sqlite` on macOS, `~/.local/share/Vadhyar/prototype` on Linux and LOCALAPPDATA on Windows. Directory/database permissions are 700/600 where supported. Latest 10,000 metadata events and 20 distinct hash/range contexts per file are retained. Selected-content history starts when a file is read.
- Watchers may coalesce rapid saves. Depth 64, device/OS watch limits, exclusions and disk capacity bound coverage. Watch failures are visible; restart reconciliation preserves retained history. No global history-byte quota is configured.
- Learning records use `vadhyar.project.v1.<project-id>` in browser storage for this profile/origin. Limits include 20 earlier attempts, 20 refreshes per attempt, five retained teaching interpretations per attempt and 3,000,000 serialized JSON code units per project record.
- Corrupt saved bytes remain available for backup. Failed writes preserve validated work in the tab with export/retry. Sequential conflicts/reset generations are checked; simultaneous cross-tab writes are not atomic, so use one tab.
- Explicit project reset writes a new record identity before clearing the view; older tabs cannot restore that prior generation. Host source history remains separate. Export before reset, changing versions/ports or clearing browser data. Local records are editable, not assessment certificates.

## Teaching and command consent

Optional OpenAI teaching requires a session key, selected model and approval of the source excerpt, rule and case. Keys stay in host memory for the running session, outside browser/history storage; restart needs reconnection. A model listing does not prove generation compatibility. No ambient authentication, silent fallback or automatic generation retry is used. Source-bound interpretations are assistance; live teaching quality remains unverified. Provider tests use injected transport.

Only eligible existing root-package scripts are offered for checks. Approval binds the exact command, source and manifest. There are no implicit installs, arbitrary browser commands or npm pre/post hooks. Jobs have bounded output and a 30-second budget. Recorded dependency/config/check/source drift, incomplete watch coverage or a lost host job makes evidence stale/unknown. Execution runs trusted repository code without a sandbox.

Check intent is saved before POST. Reload resumes acknowledged GET status only; lost starts/jobs require explicit clear, preserving the unknown outcome. New command verification rereads its receipt. Passed/failed verdicts need current coverage; error/timeout with unknown coverage supports only uncertain/unmet assessment. Sharing and execution use separate consent. Cancellation cannot undo already incurred provider usage.

## Source architecture and checks

[Feature contract](feature-contract.md), [behavior contract](../docs/product-logic-contract.md), [design](DESIGN.md), [browser reuse](../docs/browser-reuse.md) and [knowledge backend](../docs/backend-knowledge.md) describe the maintained interfaces. The same-origin APIs retain project, Host/Origin and per-port HttpOnly session checks.

```sh
npm run typecheck
npm run lint
npm test
npm run browser:check
node scripts/dependency-audit.mjs --output dist/security
```

`npm test` builds browser assets through its pretest hook, then runs unit, service and policy cases. `npm run build` builds alone. Existing `prototype:start`, `prototype:build` and `prototype:check` aliases remain available. Run build/tests in an isolated copy when another session uses the served assets. Tests do not establish live provider quality, learning efficacy or untested OS behavior.

[History](../docs/history.md) preserves original mock reviews, native demos, research, designs and dated QA. Their counts and pending statuses describe their recorded source, not today's tree. Current source excludes the prepared-demo interface; existing user browser records and ignored local artifacts are not deleted by repository cleanup.
