# Landing website and 0.1.0 release acceptance

Recorded 2026-10-11T04:49:13+05:30. This publication task was explicitly authorized in a separate side conversation. It publishes the completed S7 source checkpoint (`21fdcc9`) with a packaging-only runtime dependency correction. Parent development files, index and branch remain untouched by release commits.

## Delivered scope

- Static, responsive landing page adapted from the supplied design-v2.md. Local fonts and original supplied logo, authored lotus Guide, light/dark themes, native FAQ, keyboard controls and reduced motion. No new framework, analytics, login or API requests on the website.
- Six-step website interaction is permanently labelled illustrative. It does not execute checks or establish learning outcomes.
- GitHub-distributed, prerelease 0.1.0 VSIX: macOS Apple Silicon, VS Code 1.140.0+. Includes S7 learning flow and pinned Vitest 5.0.3 runtime/trusted fixtures. Python 3.10+ and separately installed Graphify 0.9.84 are prerequisites. OpenAI credentials remain user-supplied SecretStorage data.
- Clear [installation guide](installation.md), package allowlist, versioned source and checksum asset. Later Project Guide, transfer, resume and redesigned extension work are not included.
- Public hosting: https://vadhyar-website.vercel.app. Deployment uses the authenticated Vercel CLI in team `team_9Ie7VKvyhyETWt50Cu90gQAy`, project `vadhyar-website`. The connector rejected creation; the CLI succeeded in that same team. No custom-domain purchase or account creation.

## Executed acceptance

- Clean isolated source install; typecheck, lint and build passed. Full S7 product suite passed 36/36 tests across nine files, including the real timeout case.
- Website contract passed: download URL, labelled example, prerequisites, local assets, internal anchors and reduced-motion rules.
- Isolated Chrome/Playwright browser checks passed at 320, 360, 768 and 1440 pixels, both themes: no horizontal overflow, local logo/fonts load, walkthrough buttons and keyboard activation work, FAQ opens, install anchor and download target are correct, reduced motion disables transitions/smooth scrolling; no page errors or failed requests. Semantic text/ochre button contrast checked at >=4.5:1 in both themes. This is a targeted check, not a complete WCAG certification.
- VSIX installed successfully through the real VS Code CLI using a disposable user profile and extension directory. The installed runner executed the single ownership counterexample and all three ownership cases. The seeded bug correctly fails the requirement; passing source baseline tests does not establish correctness of that rule.
- Graphify 0.9.84 was installed into the actual installed extension path in the isolated profile and produced four validated source references and three relationships.
- Packager secret scan passed; ZIP contents exclude environment files and development sources. The initial deployment's source file tree was inspected: no environment or credential files. Vercel's link-generated local environment file was removed and future deployments exclude `.env*` and `.vercel/`.

## Limits and ownership

The installed package is about 26 MB because the real test runner is included. Windows, Linux, Intel Mac and web VS Code are unverified. No new OpenAI request, full installed native learning-loop replay or human learning study was performed in this side task. Historical S5/S7 live/native evidence remains recorded separately and is not relabelled as a new package test.

Browser Use could not connect because Chrome's DevToolsActivePort was blocked by the operating system. UI checks used an isolated headless Chrome process with Playwright instead; normal browser state was not changed. No sub-agents were used: builder/reviewer/publisher passes were sequential. Human review remains pending.

No blanket project license was invented. The VSIX packager's missing-license warning was explicitly acknowledged with `--skip-license`; third-party attribution and OFL font notices are retained. No parent uncommitted extension code is published by this task.

Publication commit and final live/download acceptance are recorded in the local handoff and GitHub release. Future website updates: review `website/PLAN.md`, run `node website/check.mjs`, serve the static directory and exercise it, then deploy the `website` directory to the same project using the Vercel CLI. Keep local `.vercel/` and `.env*` out of source and deployments.
