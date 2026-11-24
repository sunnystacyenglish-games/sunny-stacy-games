# Bridges automatic assessment — 2.25.2

After Reveal Answer, each placed option is compared with the authored answer. Correct gaps are green; incorrect gaps are red and have accessible result labels. Duplicate options with identical authored text are accepted. Placements remain locked after reveal.

Reveal does not advance the turn. Done / Continue applies the automatic result: any incorrect gap prevents movement in Board Race (Race and Endless) and prevents tooth selection in CHOMP. Correct answers retain the usual flow. Author content and storage formats are unchanged.

Validation completed:
- Task model, graded Board Race and CHOMP engine tests.
- Eight browser assessment scenarios: correct/incorrect, Race/Endless, duplicate options, double continuation and 390px layouts.
- Cross-game browser regression: Tic-Tac-Toe content tasks and Board Race pre-movement assessment; author documents unchanged.
- CHOMP browser regression: eight themes, full rounds, replay, Blur, decks, Bridges, responsive and long-task layouts.
- Manual inspection of mixed correct/incorrect gap highlighting in CHOMP.

Physical touch devices and Safari were not tested. GitHub Pages deployment completion is not part of this verification.
