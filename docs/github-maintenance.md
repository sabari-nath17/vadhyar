# GitHub maintenance and release checks

## Automated checks

[CI](../.github/workflows/ci.yml) runs on pull requests to `main`, pushes to `main` and `codex/**`, and manual dispatch. Quality targets Linux/Node 24, macOS/Node 24 and macOS/Node 26. Each runs browser typecheck, lint, unit/service/policy tests (with the pretest build) and fresh portable installer checks. A workflow definition is not evidence a particular source revision passed. Windows remains unverified until an actual Windows receipt exists.

The **Dependency risk triage** job runs the [strict gate](dependency-risk.md): native full-tree and production audits must both have zero findings. It preserves raw JSON, rejects unavailable/malformed reports and uploads reports even when the gate fails. There is no current exception policy. Gate regression tests run with `npm test` in the Quality matrix. Pull requests also receive GitHub dependency review for runtime, development and unknown scopes.

Actions are pinned to official release commits. [Dependabot](../.github/dependabot.yml) proposes npm and Actions updates weekly without automatic merging. Review upstream changes, lockfile/action identities, notices and actual checks. Tokens have `contents: read`; checkout does not retain credentials; ordinary `pull_request` runs do not use provider/deployment secrets.

Successful Quality and risk-triage jobs can produce a seven-day portable CI archive on `main` or manual dispatch. Missing files fail upload. This is a build artifact, not automatic release publication or installed-browser acceptance. There is no tag-triggered publishing job. CI pins npm 11.19.0 and installs with `npm ci --ignore-scripts`; investigate missing platform binaries before changing lifecycle-script policy.

## Publish a browser prerelease

1. Record the exact source commit. Run the full current checks, inspect both native audit reports and resolve every finding. Review notices and archive/checksum identities.
2. Run `npm run browser:check`, then independently install/start the archive in a clean disposable location. Verify authenticated source/knowledge reads, assets and an explicitly approved synthetic existing check.
3. Inspect the actual desktop Path/Project/Notebook journey, source capture/analysis/export, setup instructions and platform claims. Record omitted checks and pending human review.
4. Publish the reviewed archive and checksum manually under a distinct browser tag. Preserve existing tags/assets; never silently replace a release because a filename matches.
5. Download the published bytes again, verify exact digests and fresh installation. A successful upload alone is insufficient.

The existing `browser-v0.1.0` remains tied to its [original verified source/archive](browser-release-verification.md), including its historical development-audit decision. A later source cleanup is not another tested release.

## Repository settings

Settings were verified at **2026-10-15T02:02:10+05:30**: `main` required all three Quality matrix jobs, Dependency risk triage and Dependency review from GitHub Actions, with up-to-date checks, administrator enforcement and conversation resolution. Force pushes and branch deletion were disabled. Dependency review runs on pull requests; pushes may show its skipped check. The [settings receipt](browser-release-evidence/github-settings.json) is dated evidence; recheck live settings before later enforcement claims.

Private vulnerability reporting, dependency alerts/security updates and existing secret scanning/push protection were also verified then. No support SLA is promised. Push a working branch, wait for checks and merge or fast-forward main normally; do not bypass protections.

See [contributing](../CONTRIBUTING.md), [security](../SECURITY.md) and [history](history.md). Automated checks do not establish live provider quality, learning efficacy or universal platform support.
