# GitHub maintenance and release checks

## Automated checks

[CI](../.github/workflows/ci.yml) runs on pull requests to `main`, pushes to `main` and `codex/**`, and manual dispatch. It checks the root application, browser companion and fresh portable installer on Linux/Node 24, macOS/Node 24 and macOS/Node 26. These are CI targets; a workflow definition is not evidence that those runners have passed. Windows installation remains unverified until an actual Windows receipt exists.

The Dependency risk triage job runs `node scripts/dependency-audit.mjs --output dist/security`. It preserves the unmodified native full-tree and production reports, including a nonzero native audit result. The temporary policy accepts only the pinned development-only Promptfoo 0.124.1 → jks-js 1.1.7 → node-forge 1.4.0 chain for [GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv), with review expiry on 29 October 2026. The native full audit still has three high findings; a passed triage job is not a clean audit or completed human security review. Browser packaging excludes this chain. New/changed advisories, runtime/unknown scope, malformed/unavailable reports, package/chain drift or expiry fail; the production audit must have zero findings. The pinned basic-ftp 6.2.3 override addresses the separate earlier FTP advisory.

The job runs `node --test scripts/dependency-audit.test.mjs`; test failure blocks it even if triage later accepts the known findings. Native audit collection and JSON upload are attempted even after a failed regression or gate. Pull requests also run strict GitHub dependency review for runtime, development and unknown scopes; the temporary policy does not waive new PR findings. Keep the dependency graph available for that review. An unavailable report or review needs investigation.

Actions are pinned to official release commit identities. [Dependabot](../.github/dependabot.yml) proposes individual npm and GitHub Actions updates weekly; it does not auto-merge them. Review changelogs, the lockfile or action SHA diff, licenses and the actual checks before merging. Workflow tokens have `contents: read`, checkout does not retain credentials, and fork pull requests use ordinary `pull_request` events without provider or deployment secrets.

Successful quality and risk-triage jobs can produce a seven-day CI archive on `main` or manual dispatch. Missing files fail artifact upload. This is a build artifact, not a GitHub release, installed-runtime receipt or automatic publication. The workflow has no tag-triggered release or write token. CI pins npm 11.19.0 and dependency installation uses `npm ci --ignore-scripts`; investigate missing platform binaries instead of blanket-approving package scripts.

## Before publishing a browser prerelease

1. Record the exact commit, run the full source checks and review both native security reports. Confirm every temporary deferral's exact reachability, package/chain identity and unexpired policy; resolve anything outside it. Disclose the remaining development-tool advisory and any pending human review. Inspect the archive/checksum and retained third-party notices.
2. Run `npm run browser:check`, then independently install and start the archive in a clean disposable location. Exercise actual authenticated source/knowledge reads, assets and a consented synthetic existing check; retain exact artifact identities and limits.
3. Review the final desktop flow, setup instructions, screenshots, release notes and platform claims. Preserve the separate legacy VSIX and historical evidence.
4. Publish the reviewed browser archive and checksum manually under the browser tag, starting with `browser-v0.1.0`. Mark it a prerelease while its stated release scope remains experimental. Do not attach another build merely because its filename matches.
5. Verify the published commit, downloadable asset identity and installation instructions. A created release or a successful upload does not prove a fresh install.

Branch protection, required checks, private vulnerability reporting and security settings are repository settings. Verify their actual state through GitHub before claiming enforcement. Suggested required checks are all three Quality matrix jobs, Dependency risk triage and Dependency review; the latter applies to pull requests. This file does not configure branch rules or promise a support SLA.

Use [CONTRIBUTING.md](../CONTRIBUTING.md) for source changes and [SECURITY.md](../SECURITY.md) for private reports. Keep release and test evidence scoped to its actual artifact; live provider quality, human learning efficacy and untested platforms remain separate.
