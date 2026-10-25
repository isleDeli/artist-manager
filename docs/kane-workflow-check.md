# Kane browser workflow verification

Executed 2026-10-24 Pacific (2026-10-25 04:44-04:49 UTC) against https://isledeli.github.io/artist-manager/ using Kane CLI 0.10.0-rc.3 and local Chrome.

## Result

Passed: one recorded workflow split into three sequential flows. 26 completed progress actions/checks. CLI reported 183.7 seconds of execution; evidence packaging finished later. Credits consumed: 73.8755675. No external funder submission or live AI generation requested.

## Verified

- Loaded Taylor demo portfolio and checked the demo banner and three credited artworks.
- Opened Discover and checked visible real opportunity cards and match percentages.
- Saved the Pollock-Krasner opportunity and opened its application workspace.
- Entered fictional application draft text and selected Ready to submit.
- Verified the listed status after the requested refresh and the exact draft after reopening.

The test checks the displayed result, not the correctness of every catalog record or matching formula. Live AI generation, other opportunities, error paths, responsive layouts and personal/demo restoration were not covered by this run. Formal requirement-linked coverage remains 0% for this run because it executed no assurance-designed tests; the existing extracted use cases are still unreviewed/stale.

## Artifacts (private, ignored)

Saved test: .testmuai/tests/artist-manager-workflow_test.md
Evidence pack: .testmuai/evidence/8d8819b7-8491-445f-a93b-a9116c89cb7c.evidence
Session: 9577edec-4fcb-4e46-8681-b47f9551e8d5
Local repository HEAD at run time: 2594e809220f997f77cc610fb61a2d21e0407e97. The deployed site was tested; the run did not independently verify its deployed commit SHA.

Replay with the recorded test through kane-cli testmd run. Evidence packs remain private and must not be committed or published.

## Earlier evidence correction

The local artist-manager-live-smoke Result.md records a passing 70.9-second run on 2026-10-25 at 00:58 UTC for Home, Discover and Portfolio navigation. Earlier conversational claims that no browser run had passed were incomplete: the event-reported errored KR-299 was distinct from this local passed smoke result.
