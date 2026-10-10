# Coach quality and reliability

S11 verifies response boundaries and error handling. It does not measure teaching quality or learning gains. [Current evidence](s11-evidence/coach-quality.json).

Run `npm run eval:coach -- --offline` for six synthetic validator cases: invented citations, code fixes, explicit unsupported verdicts, incomplete output, skipped hint levels and an accepted conceptual-hint control. No OpenAI request is made. `npm run test -- tests/coach-reliability.test.ts tests/coach-eval.test.ts` covers actual request builders with explicit mock HTTP failures.

The full set has six further live coach cases: grounding, conceptual guidance, progressive tracing, full-fix requests, injection and unsupported verification. Run `npm run eval:coach` only with separately configured process environment credentials/model. It does not read VS Code SecretStorage or `.env` files. Those prerequisites were absent, so the live cases are unrun. Reports stay ignored under `dist/evals/`; no caching, telemetry, automatic retries or fallback.

Human review is pending. Inspect each accepted live response against its exact supplied source, requirement, observed source hash and previous hints. Check that citations support the text, guidance progresses without a completed fix, historical results stay historical, injections stay inert and no unsupported verification/authorship/mastery claim appears. Record relevant, unclear and answer-leaking examples separately from automated pass/error counts.

Strict schemas and citation identity checks reject malformed/executable fields. Recognizable code and explicit positive verdict patterns are limited detectors: natural-language answer leakage and inaccurate reasoning can evade them. A matching reference ID is not proof of correct reasoning. A provider error is an evaluation error, never a fabricated coaching pass. Historical live S5/S7 observations do not certify this updated coach.
