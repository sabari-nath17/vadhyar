# Security policy

## Report a suspected vulnerability

Use GitHub's [private vulnerability report](https://github.com/sabari-nath17/vadhyar/security/advisories/new). Include the affected version or commit, operating system, a minimal synthetic reproduction, expected boundary and observed impact. Keep exploit details, API keys, private source and personal records out of public issues.

Maintainers assess reports and coordinate corrections/disclosure through the private report. No response-time, fix-time or independent audit guarantee is made. Identify historical releases explicitly; ongoing backports to every release are not promised.

## Trust boundaries

The browser companion approves one trusted local folder and binds to loopback on the same computer. The host validates project/session/origin, eligible paths, bounded source and explicit existing-command consent. Project commands execute trusted code without a hostile-code sandbox. Exclusions are not comprehensive secret classification; review the exact excerpt before optional provider sharing.

The host retains metadata and selected source history locally. Browser learning records belong to the current profile/address; use one tab for writing. Local records are editable and are not an institutional assessment ledger. See [storage and recovery](prototype/README.md) and the [behavior contract](docs/product-logic-contract.md).

## Dependency checks

Current CI preserves native full-tree and production npm audit JSON and requires zero findings in both. New findings, malformed reports or unavailable audits fail the gate. Pull requests also receive dependency review. There is no current development-dependency exception. See the [strict audit guide](docs/dependency-risk.md).

The immutable `browser-v0.1.0` preview was built before the browser-only source cleanup. Its exact development-tool risk decision remains disclosed in [release verification](docs/browser-release-verification.md) and [historical evidence](docs/history.md); current source changes do not alter that archive or its original audit result.

Passing checks does not establish absence of vulnerabilities or completed human security review. Human review, live teaching quality and untested platform claims remain separately scoped. [Maintenance guidance](docs/github-maintenance.md) states publication conditions.
