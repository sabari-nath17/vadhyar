# Dependency audits

Current source uses a strict gate with **zero findings required in both the full dependency tree and production tree**. The removed optional evaluation tool and its expiring exception are no longer part of the current source setup. There is no current exception policy.

## Reproduce the gate

Use the pinned package manager and lockfile:

```sh
npm ci --ignore-scripts
node --test scripts/dependency-audit.test.mjs
node scripts/dependency-audit.mjs --output dist/security
```

The command runs native `npm audit --json` and `npm audit --json --omit=dev`, preserving their output as `full-audit.json` and `production-audit.json`. Success writes `triage.json` with `nativeAuditClean: true` and both native exit codes. Findings in either tree, inconsistent counts/status, malformed JSON or unavailable audits fail. CI attempts raw-report upload even after a failure. Inspect the reports; an absent report is not a clean result.

The [regressions](../scripts/dependency-audit.test.mjs) cover clean reports and refusal of production/development findings and malformed counts. Actual source/release checks belong to their exact execution receipts. This guide defines the gate and does not assert that an unexecuted checkout has passed it.

The 15 October browser-only dependency prune installed 160 packages and returned native exit 0 with zero findings for both full and production audits. That observed dependency-tree result does not replace the final source, browser or installer gates.

## Immutable browser 0.1.0 decision

The earlier preview was built with a different development tree. Its native full audit retained **three high findings** in `promptfoo 0.124.1 → jks-js 1.1.7 → node-forge 1.4.0` for GHSA-86w9-cpqp-85rv, with zero production findings and an exact temporary policy expiring 29 October 2026. Its browser archive excluded those tools. The [original decision](https://github.com/sabari-nath17/vadhyar/blob/92e118d542ab7332a6d6821929a870cc25187516/docs/dependency-risk.md), [policy](https://github.com/sabari-nath17/vadhyar/blob/92e118d542ab7332a6d6821929a870cc25187516/docs/security/dependency-exceptions.json) and [release receipt](browser-release-evidence.json) preserve the actual evidence and pending human review.

Removing the evaluator from current source does not change that published archive or retroactively make its full audit clean. See [history](history.md) for recovery and [maintenance](github-maintenance.md) for publication checks.
