# Browser reuse implementation

Authorized 14 October 2026: finish the pending Learn Claude Code, PocketFlow and React Flow browser adaptations. This is post-event development. Preserve the existing mixed checkout and all historical research boundaries; no push or submission.

## Bounded slice

The local source explorer gains a manually requested walkthrough of at most five concepts from its selected JS/TS excerpt. The host identifies declarations and bound static calls/type references with the already installed TypeScript compiler, orders entry points before supporting concepts, and returns validated source anchors. Learn Claude Code's viewer and manual controls navigate that captured source. React Flow renders the same relationships as the ordered text path. Navigation cannot advance a prediction, reveal, verification or other learning gate.

Scope: new source-concept schema/parser/tests and viewer/control/map components; existing ProjectSource callers (ProjectExplorer and ProjectLesson); local service endpoint and launcher/tests; the root dependency lock, browser CSS/build notice assets, README, selective-reuse and third-party notices, CHANGELOG, AI_USAGE and slice handoff. Existing extension providers, Graphify, scripts, fixtures, privacy exclusions and learner records keep their authority.

## Acceptance

- Verify pinned donor blobs against the existing research register; retain exact MIT notices and an upstream-file to local-file mapping with modifications.
- Test the actual identify → relationships → order pipeline, exact source spans, cycles/disconnected concepts, shadowed/external calls, unsupported/invalid/partial excerpts and strict order/reference validation.
- Exercise the authenticated local endpoint, stale hash rejection, invalid inputs, source exclusions and trusted-root boundaries.
- Run prototype and root typecheck/lint, focused then complete suites, and browser build. Inspect the diff after each batch.
- In a real browser, select saved project source, load the walkthrough, navigate by text, map and manual controls; preserve learning gates, reject stale data, inspect desktop/narrow layouts and console state.
- Record actual outcomes and checkpoint only owned changes. Keep source parsing separate from runtime behavior, confirmed requirements and teaching efficacy.

## Implemented adoption

Eight selected upstream source/license/manifest files were fetched at the existing pinned commits and checked against the register's Git blob IDs. No repository was cloned. The original 12-repository/57-file research register remains historical and unchanged. Exact refs, mapping, license hashes and npm integrity are in [the adoption register](browser-reuse-provenance.json).

| Upstream file at pinned commit | Vadhyar implementation | Adaptation and modifications |
| --- | --- | --- |
| [Learn Claude Code source-viewer.tsx](https://github.com/shareAI-lab/learn-claude-code/blob/ce8f9f186058939da54c9d6fead78dfb5d0fd6c3/web/src/components/code/source-viewer.tsx) | [SourceViewer](../prototype/src/SourceViewer.tsx) | Ported line splitting, safe span token coloring and numbered source presentation. Added JS/TS tokens, actual excerpt offsets/full-file identity, selected concept spans and keyboard-scrollable source. House styling replaces Tailwind. Coloring remains approximate for multiline syntax. |
| [Learn Claude Code step-controls.tsx](https://github.com/shareAI-lab/learn-claude-code/blob/ce8f9f186058939da54c9d6fead78dfb5d0fd6c3/web/src/components/visualizations/shared/step-controls.tsx) | [StepControls](../prototype/src/StepControls.tsx) | Adapted annotation, previous/next/restart bounds and step count. Reused Vadhyar's accessible Control. Omitted autoplay and icon dependencies; these controls navigate captured source only. |
| [PocketFlow nodes.py](https://github.com/The-Pocket/PocketFlow-Tutorial-Codebase-Knowledge/blob/05b24cbbb0fe409c5e23c9791f0342f07524ffdc/nodes.py) | [source-concepts](../prototype/src/source-concepts.ts), [validated contracts](../prototype/src/walkthrough-types.ts) | Adapted IdentifyAbstractions → AnalyzeRelationships → OrderChapters and ported complete/unique order validation. Source IDs/spans replace YAML indices. A bounded in-memory TypeScript compiler resolves declarations, direct calls, construction and type references. It handles shadowing and merged type/value names without reading imports or config. Entry points precede supporting concepts; cycles and disconnected concepts remain inspectable. |
| [PocketFlow flow.py](https://github.com/The-Pocket/PocketFlow-Tutorial-Codebase-Knowledge/blob/05b24cbbb0fe409c5e23c9791f0342f07524ffdc/flow.py) | [source-concepts](../prototype/src/source-concepts.ts), [walkthrough-service](../prototype/walkthrough-service.mjs), [SourceWalkthrough](../prototype/src/SourceWalkthrough.tsx) | Ported source → concepts → relationships → ordered explanation into one host function and rendered chapters. Approved source reads replace crawling; structural concepts replace generated abstractions. No Python framework, upstream provider, retry loop or tutorial writer is imported. Vadhyar's provider stays separate with its own sharing consent. |
| [React Flow package](https://github.com/xyflow/xyflow/blob/3d35b57317576b0916c0bfeaaedd573aaacc2839/packages/react/package.json) | [SourceWalkthrough](../prototype/src/SourceWalkthrough.tsx), [map styles](../prototype/src/walkthrough.css), root manifest/lock | Published `@xyflow/react@12.12.0`, with locked `@xyflow/system@0.0.83`, installed as a browser build dependency. Actual ReactFlow nodes, directed static edges, viewport controls and keyboard-operable node buttons render the same bounded text path. No dragging, connecting, reconnecting or deletion authority. Default library attribution remains visible. |

Exact MIT notices: [Learn Claude Code](third-party/learn-claude-code-LICENSE.txt), [PocketFlow](third-party/pocketflow-LICENSE.txt), [xyflow](third-party/xyflow-LICENSE.txt). The build emits `THIRD_PARTY_NOTICES.txt` containing adapted-source notices and original license text for every package actually bundled, including transitive packages. The server serves that named notice artifact. Installed package license files remain unchanged.

## Use

Build and launch against a trusted local project with the existing browser launcher. In Project, select a JS/TS file and choose **Explore source concepts**. Use the ordered list, manual controls or map buttons to highlight captured source. At most five complete top-level concepts are shown; extra declarations are counted as omitted. Other languages remain readable and explicitly report unsupported extraction. An incomplete excerpt reports a parsing limitation without invented relationships.

Authenticated `GET /api/projects/:id/walkthrough` requires file ID, full-file source hash and excerpt start. It uses the existing protected readSource seam; the browser cannot supply paths or roots. A changed file rejects the old hash with 409 and clears the map; reload the excerpt to recover. Concepts are derived captured-source views, separate from durable predictions and verification. A walkthrough triggers no model call, source edit or project command.

## Verification and limits

- Focused adaptation tests **11/11**. Real protected endpoint **1/1**, including session/Host/Origin checks, invalid/repeated parameters, method restrictions, another project identity, changed source and escaping symlinks.
- Prototype unit suite **53/53**; root suite **134/134 in 29 files**. Root typecheck/lint/build passed. Prototype typecheck/build and adapter lint passed; final combined lint and Node suites are in [the execution evidence](browser-reuse-evidence.json).
- Real IAB browser used a disposable copy of NovaDesk's **disclosed role-only ownership bug**, three declarations and two static type references. Text/control/keyboard-map selection highlighted exact spans without advancing the prediction gate. The saved prediction preceded observation, survived a disk edit, and remained unchanged when the stale map cleared. Source refresh recovered the map with a new hash.
- Observed CSS widths **1440**, **320** and **391** pixels had no document overflow. Source text scrolls inside its pane. QA corrected contrast/line-number wrapping, routed edges around intervening nodes and reserved fit-view space for edge labels.
- Console inspection found no app errors or warnings. Screenshots are outside source control. This is developer integration QA, not a learner trial.
- Extraction covers complete named top-level declarations in one approved excerpt. Imported files, member/dynamic dispatch, runtime execution, whole-project requirements and instructional quality are outside this map. No live OpenAI, Graphify upgrade/extraction, native extension/CodeTour playback, learning-effectiveness study, deployment or push ran for this slice.

Concurrent recorder/provider and design-planning work is preserved under its own records and is not attributed to this adaptation.

### Logic-board follow-up

The independent logic board reproduced an empty/reversed source-range presentation issue. The reuse correction shows **Empty file** or **No source in this range**, without fabricated numbered source, and disables concept exploration without captured text. A new regression and real browser checks pass. Incomplete TS and unsupported Python excerpts remain distinct, with no inferred concepts.

An isolated handler delayed a walkthrough by1.5s; changing the selected file while it was pending aborted the old view. After the delayed response, the empty selected file still had zero concept nodes, zero walkthroughs and zero source line anchors. No app console error was observed. The client additionally fences aborted responses after await, validates project/file/hash/range identity and remounts on those source identities.

Widths in this record are desktop-browser CSS widths. Physical phone access is unsupported by the current127.0.0.1 service; no LAN hosting or access-control weakening was added. Host range rejection, preventing empty lessons and other dynamic-learning corrections belong to the feature owner and the independent board's acceptance. The independently owned logic-board chat retains acceptance for those shared corrections.

The exact staged snapshot was exported and independently passed prototype typecheck/lint,53unit cases, build/license collection and2actual endpoint/static-server tests. Other-owner code and record hunks remain excluded from this milestone.
