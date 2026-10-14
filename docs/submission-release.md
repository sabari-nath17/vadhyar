# Frozen hackathon release — Vadhyar 0.1.1

Prepared 2026-10-11T07:29:55+05:30. This release preserves a working NovaDesk demo and experimental Project Guide while panel-v2 development continues separately.

## Mini-PRD
Audience: judges and builders who need a reproducible local demonstration. Outcome: an immutable GitHub source checkpoint, a matching macOS-arm64 VSIX, a checksum manifest and the organizer-template submission record. The release reuses checkpoint 102a1ec and the completed, hash-checked safety patch. No redesign or new product feature is included. Existing sessions, credentials, the main Git index, .ignore and Graft artifacts remain in their original checkout.

## Ordered gates
1. Reconcile canonical GitHub history in an isolated worktree; preserve both histories and published 0.1.0.
2. Confirm copied safety-file hashes; keep the current locked runtime; update only release version, docs and packaging allowlist.
3. Clean npm install; typecheck, lint, build, focused checks, full suite and six offline coach validators. No live API request.
4. Build the versioned VSIX; inspect its contents and match runtime/source/lock hashes; install into separate disposable user-data and extension directories.
5. Freeze the implementation commit/tag, create the source archive and manifest, and publish with normal Git pushes. Verify GitHub refs and downloaded artifact checksums.
6. Update the main-branch submission record with the exact implementation SHA and verified links. Organizer form submission remains distinct from publishing the repository.

## Reproduce the frozen demo
Use tag v0.1.1, not the moving redesign branch:

```sh
git clone --branch v0.1.1 --depth 1 https://github.com/sabari-nath17/vadhyar.git vadhyar-demo
cd vadhyar-demo
node scripts/prepare-demo.mjs /absolute/new/NovaDesk-demo-001
code --new-window /absolute/new/NovaDesk-demo-001
```

Install the matching VSIX from the v0.1.1 release. Trust only this fresh folder, configure the external Graphify 0.9.84 executable, and run Vadhyar: Understand this change. Enter an API key only in the native masked SecretStorage prompt if using live coaching. [Installation](installation.md) and [walkthrough/reset](demo.md).

The preparation script refuses existing destinations. Use another new folder to repeat the disclosed seed. Clear NovaDesk session preserves source and Project Guide data; it is not a source reset. Do not reload or clear the active learner session.

## Verification boundaries
S13/H1/T1 native and live coaching records are historical evidence for their own builds. This release receives fresh automated/package/install checks; fresh native playback and live coaching of the patched package are reported separately. Project Guide proves bounded selected-context workflows; it does not support every repository or infer complete PRD compliance. Connected capture, native CodeTour playback and human teaching quality remain unverified. The active video task and redesigned panel are excluded.

The exact checkpoint and artifacts are recorded in the published release-manifest.json. No credential value or private learner record belongs in this release.

Release preparation timestamp: 2026-10-11T07:29:55+05:30. The fresh gates below were executed before freezing/publication.

## Fresh release verification — 2026-10-11T07:38:58+05:30

- Clean `npm ci --no-audit --fund=false` succeeded: 717 packages. Node 26.7.0/npm 11.19.0. Existing pinned dependencies were preserved; only the root release version changed.
- `npm run typecheck`, `npm run lint`, `npm run build`: exit 0. Focused preservation/safety/release tests **38/38, 8 files**. `npm test -- --maxWorkers=1`: **134/134, 29 files, 33.87 seconds**. Six offline coach validators passed; zero OpenAI requests. Production audit: zero vulnerabilities.
- Preflight VSIX ZIP integrity, required trusted/runtime files, eight exact source/runtime/lock/notice hashes, eight bundled fonts and production-only exclusions passed. The final artifact checksum is external in the release manifest; preflight size/count are explicitly recorded separately.
- Official VS Code CLI installed 0.1.1 into new user-data/extensions directories containing only Vadhyar. Eight installed file hashes and a newly prepared seed matched. An initial verifier guessed a platform-suffixed directory; using the installed package identity corrected that verifier without changing the product.
- The production runner functions from checked source exercised the **actual installed** fixed fixtures and Vitest dependencies outside VS Code: saved prediction → seeded counterexample observed approval/failed requirement (exit 1); seed full suite 2/3; developer-provided ownership correction 3/3; archived correction 4/4. Source variants stayed in disposable runner copies; the prepared seed was preserved. This is not native panel acceptance or independent learner authorship.
- Local documentation links and 32/21-line instruction limits passed. A limited credential-pattern scan found only the two existing credential-shaped rejection-test fixtures; no matches outside those tests. No credentials, learner records, Graft cache, demo recordings or redesigned panel were included.
- Original checkout branch/HEAD/index and four protected session/source hashes remained unchanged. Upstream main publication history and its records are preserved in the merge, including the older public 0.1.0.
- Evidence: [fresh verification](submission-evidence/verification.json). Raw local verification logs stay outside Git. Current native panel playback/live coaching is not rerun; historical S13/H1/T1 records remain separately dated.

## Submission timing and roles

Team **Vadhyar**: SabariNath S A (`sabari-nath17`) — vibecoding management, project logic and vision; Aravind (`aravindksubash17`, user-supplied and explicitly unverified) — research, presentation deck and design assistance. These roles were confirmed by the user. Submission opens after **08:00 AM IST** according to the user; organizer form/receipt is not supplied and no organizer submission has been attempted.

- 2026-10-11T07:50:29+05:30: at the user’s 07:50 IST cutoff, the separate redesign was at 6c24897c474ded0c67f86a1fc3d8fd08439e5bdf with an ongoing test edit; its own ledger still required four-theme/all-state review, final parity, an updated package and native acceptance. Selected the verified original panel for v0.1.1, preserving all redesign work separately. Completed S8–S13, Project Guide/T1 and the reviewed safety patch are included. README now follows the exact supplied overview/run/status structure; no source behavior changed. Organizer submission remains pending until the announced window and method.

## Verified publication — 2026-10-11T07:59:52+05:30

- Frozen implementation/tag: [`4f36cedcb93940e526165fbf94d6681542f54066`](https://github.com/sabari-nath17/vadhyar/tree/4f36cedcb93940e526165fbf94d6681542f54066) / `v0.1.1`. Normal main/tag pushes preserved canonical history.
- [Published prerelease](https://github.com/sabari-nath17/vadhyar/releases/tag/v0.1.1): VSIX, exact Git source ZIP, manifest and SHA256SUMS. All four downloaded assets are byte-identical to local originals; both ZIPs pass integrity and GitHub digests match. Source archive matches 272 tracked files; eight installed core hashes remain unchanged.
- [Complete 51-feature inventory](feature-coverage.md) identifies source/actions and historical, automated or unverified evidence per item. The agent capture helper is source-distributed; installed host command/event-file support is present, connected capture unverified.
- [Current publication proof](submission-evidence/publication.json). Main-branch documentation records the frozen source identity; it does not move the code tag or replace the installer. The older 0.1.0 remains available.
- Organizer submission remains pending; no form/link/receipt or eligibility attestation supplied. No fresh native/live claim is added.
