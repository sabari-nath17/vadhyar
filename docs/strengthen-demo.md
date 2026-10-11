# Second-project demonstration — SeatCheck

This is an explicitly prepared JavaScript fixture unrelated to NovaDesk. Its seed incorrectly permits a reservation at zero capacity. The specification and test were prepared for this acceptance; they are not discovered test coverage. The native demonstration used one live, validated explanation, a delegated developer edit, a native diff and actual npm-script execution. It is not a learner-authorship or teaching-quality study.

## Start without touching an existing session

Use the local macOS-arm64 VSIX and [release prerequisites](release.md). From the source checkout, create a fresh copy:

```sh
VADHYAR_SEAT_DEMO="$(mktemp -d /tmp/vadhyar-seat-demo.XXXXXX)"
cp -R fixtures/seat-check "$VADHYAR_SEAT_DEMO/SeatCheck"
code --new-window "$VADHYAR_SEAT_DEMO/SeatCheck"
```

The installed extension also ships `fixtures/seat-check` beneath its extension folder. Copy that directory to a new disposable location when using only the VSIX. No npm install is needed for this fixture: its check uses Node's built-in test runner. Trust only the copied folder through VS Code's normal Workspace Trust prompt.

1. Run **Vadhyar: Open Project Guide**, then **Start tracking this project**.
2. Import `feature.md`, choose **Reserve only an available seat**, then confirm its intention and three scenarios.
3. Select only `src/reservation.js`. Review the exact source/context before sending an explanation request through the configured `vadhyar.model`. Existing SecretStorage credentials stay in their secure path; if absent, use only the product's masked prompt.
4. Inspect the explanation and open its source citation. In **Project checks**, choose the existing `test` script. Review the native execution confirmation. The seed's actual result is exit 1: two passing cases and the zero-seat failure. The model explanation is source reasoning, not test evidence.
5. Edit/save the source yourself so the boundary matches the intention. Refresh saved changes, inspect the native tracked diff, and run the same selected script after native confirmation. The recorded developer acceptance yielded exit 0 with three passing cases. Old guidance/result become historical after the source edit.
6. Close/reopen the panel or reload this disposable window. Confirm the intention, saved source identity, historical guidance and current exit result return. Raw command output is deliberately not restored. Do not reload someone else's active learning window.

Reset by making another fresh copy. Keep prior attempts; do not delete workspace storage or credentials. Existing **Clear NovaDesk session** concerns only the prepared NovaDesk workflow and is not a Project Guide reset.

## Evidence and support boundary

[Acceptance record](strengthen-evidence/acceptance.json), [saved project record](strengthen-evidence/project-record.json), [native comparison/result](strengthen-evidence/native-passed-and-diff.png), [native resume](strengthen-evidence/native-resumed.png). Product checks: typecheck/lint/build, 111 tests in 24 files and offline coach validators 6/6. Offline evaluation does not measure teaching quality.

This proves one local JavaScript/npm fixture through explicitly selected source and an existing reviewed check. Other languages/frameworks, live grouping/build-plan operations, connected capture, CodeTour playback and human independent learning remain unverified. NovaDesk retains the complete mapped prediction/counterexample/follow-up loop; Project Guide does not invent that mapping for arbitrary repositories. No runtime trace or universal support claim.
