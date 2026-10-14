# Security policy

## Report a suspected vulnerability

Use GitHub's [private vulnerability report](https://github.com/sabari-nath17/vadhyar/security/advisories/new). Include the affected version or commit, operating system, a minimal synthetic reproduction, expected security boundary and observed impact. Do not publish working exploit details in an ordinary issue or include API keys, private project source, personal records or credentials.

Maintainers will assess reports and coordinate any correction and disclosure through the private report. No response-time, fix-time or independent security-audit guarantee is made.

## Scope and expectations

Report current-source and browser-prerelease problems with their exact identities. The older VS Code installer is a separate historical artifact; identify it explicitly if affected. This project does not promise ongoing backports to every earlier release.

The browser companion approves one trusted local folder and binds its API to loopback on the same computer. It validates project/session/origin, eligible paths, bounded source and explicit existing-command consent. These checks do not make trusted repository execution a hostile-code sandbox. Source exclusions are not comprehensive secret classification; review the exact excerpt before approving optional provider sharing.

The host retains metadata/source history locally; browser learning records belong to the current profile and address. Local records are editable, and simultaneous-tab writes are not an institutional assessment ledger. See [setup and storage limits](prototype/README.md) and the [behavior contract](docs/product-logic-contract.md).

CI preserves native full-tree and production npm audit reports, enforces a scoped dependency risk policy, and reviews changed dependencies on pull requests. The full audit currently retains three high-severity findings in the pinned development-only Promptfoo → jks-js → node-forge chain for [GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv). There is no published patch identified by the advisory. The temporary policy expires on 29 October 2026 and rejects new, runtime, unknown, malformed or expired findings. Browser packaging excludes these development tools; that limit does not certify every developer use of them as safe.

Passing the risk gate means its exact conditions were met, not that the native full audit had zero findings or that a human security review occurred. Human review remains pending in the [risk decision](docs/dependency-risk.md). An unavailable security check is a failure. Neither automated checks nor a release label certify the absence of vulnerabilities. See [maintenance guidance](docs/github-maintenance.md) for publication conditions.
