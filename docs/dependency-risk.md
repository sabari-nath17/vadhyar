# Dependency risk decision

**Preview release with conditions. The full development audit is not clean.** The browser installer excludes the affected development tool. Human review and live teaching-quality evaluation remain pending.

On 15 October 2026 the native npm audit reported seven high-severity development-tree findings. A targeted `get-uri` override updates only `basic-ftp` from 5.3.1 to 6.2.3, beyond the [published fix](https://github.com/advisories/GHSA-c475-qrg2-pj4r). The lockfile preserves all other package versions.

Three high findings remain in `promptfoo 0.124.1 → jks-js 1.1.7 → node-forge 1.4.0`. The [upstream signature-verification advisory](https://github.com/advisories/GHSA-86w9-cpqp-85rv) has no published patched version. Forcing npm's suggested Promptfoo downgrade would change the evaluation tool without resolving this chain through a supported patch.

## Scope and conditions

- All three packages are development-only in the root lockfile. The browser distribution bundles the protected host and its runtime dependencies; it excludes Promptfoo, JKS and node-forge. Its dependency/build receipt is included in the archive.
- Promptfoo is used only by the separate coach-evaluation command. Owned evaluation fixtures use trusted local configurations; the inspected JKS integration converts keys/certificates and does not call the affected RSA signature verifier. This inspection is a reachability bound, not a complete upstream security assurance. Do not import untrusted certificate stores or evaluation configurations.
- The native production audit must have no findings. The unmodified full and production JSON reports are preserved by CI and locally under `dist/security`.
- The temporary [exception](security/dependency-exceptions.json) expires **29 October 2026 at 23:59:59 IST**. It accepts only this advisory and the exact three locked development packages/chain. New or changed advisories, runtime scope, version/chain drift, an unavailable/malformed audit or expiry block the gate.
- The gate is named **dependency risk triage**, not a clean audit. Its output explicitly reports the three accepted findings. Remove the exception when an upstream supported fix is verified, or isolate/replace the optional evaluator in a separately reviewed change.

Run `node scripts/dependency-audit.mjs --output dist/security` to reproduce the native audits and decision. `node --test scripts/dependency-audit.test.mjs` checks refusal cases. The complete release record states actual results; no blanket `continue-on-error`, forced update or audit omission is used.
