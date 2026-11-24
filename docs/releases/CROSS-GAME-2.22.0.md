# Delta 9 — Cross-game content and task modals · 2.22.0

## Implemented

- Tic-Tac-Toe: Concepts retained; Card Decks and Sentence Correction added.
- Board Race: Concepts and animated Card Decks retained; Sentence Correction and Bridges added.
- Setup lists compatible types and existing authored documents, regardless of folder. Card Decks in Tic-Tac-Toe require explicit selection of an authored subdeck; decks are not merged.
- Selection is remembered and included in game links through contentMode, contentId and, for Tic-Tac-Toe cards, taskDeckId. Missing or invalid content blocks Play. Changing only theme/sound preserves the active session.
- Registry reflects actual support. No storage migration, conversion, copies of saved documents or schema changes.

## Shared components

`shared/tasks/model.js`: detached task snapshots, shuffled non-repeating task bag, Bridge option identity and reveal state. A singleton task can repeat; alternatives avoid immediate repetition. Group links are preserved; equal-text options remain independent instances. Replacement returns the previous instance to its group. After reveal, learner choices are locked and retained.

`shared/tasks/selection.js`: shared authored-content selector wrapping existing Concepts UI. Loads current documents and validates image availability before launching.

`shared/tasks/presenter.js` and `presenter.css`: common sentence/Bridge rendering. Reveal never grades. Sentence and Bridge grading remains disabled until reveal; Bridges require every gap to be filled. Answer fragments are highlighted green, without modifying original text. Reduced motion suppresses option movement. Long content scrolls above persistent teacher controls.

`shared/tasks/card.js`: shared text/image card body used by Tic-Tac-Toe and the existing Board Race deck animation. No invented card answer or Reveal action.

## Game rules

Tic-Tac-Toe keeps its existing engine transitions, Steal ON/OFF, win/draw and alternating replay starter. A supplied task bag enables authored tasks without relaxing Concept validation. Steal uses another task when available. Correct/Incorrect resolve only once.

Board Race's new `GradedRace` controller gates the rolled movement before moving. Correct permits that movement; Incorrect leaves the pawn in place and advances resolution. Existing special-tile effects retain their own resolution. Concepts and Card Decks still use the original BoostRace controller.

Approved Team Up rule: each player receives a task and moves only for their own Correct, active player first, partner second. Both reaching Finish yields joint victory. Existing special movement, Reverse and turn bookkeeping are reused.

Task dialogs have no close icon and cannot be dismissed through Escape or backdrop. Only teacher evaluation resolves new graded tasks. Existing Board Race Card Decks retain Done / Continue and their return animation.

## Verification

- All 31 previously configured Node test scripts passed.
- Added `tasks.test.mjs`: snapshots, single-task sets, shuffled repetition, deck identity, duplicate option instances, group boundaries, replacement, reveal lock, immutable authors and long-answer highlighting.
- Added `graded-race.test.mjs`: pre-movement gate, Incorrect, repeated result guard, individual Team Up decisions, joint Finish, Reverse and forward special effect.
- Browser `tests/cross-game.html` on isolated port 4180: all four combinations; text/image/both card variants using uploaded IndexedDB media; alternative task on steal; sentence and Bridge grading locks; Race/Endless; source records unchanged.
- Browser turn checks: Sentence Correction win/draw/replay, alternating starter and Steal OFF. Existing Concepts checked separately in both games.
- Long text checks at 390×844 and 740×390 for both games: no horizontal overflow, dialog and teacher controls within viewport, controls receive pointer hits, content scrolls.
- Existing `tests/board-decks.html`: 1–5 decks, required/wrong deck, double-click locks, authored face, return animation, responsive pile positions. First run stopped at a test-frame load timeout; complete rerun passed all five counts.
- Manual Board Race Correct moved by the die value; Incorrect kept the pawn on Start. Manual Bridges: reverse gap order, replacement, reveal lock, preserved learner answer; Escape did not dismiss. Console checks for inspected game pages were clean.

## Run and limitations

Run `node serve.mjs` from this folder, then open http://127.0.0.1:4173/. Choose a game, select a compatible authored material in Content, then Play. Existing browser-local material is retained; this release does not add cloud sharing. On another device, import the material before using its link.

`npm test` runs 33 Node scripts. Browser cross-game fixtures must be run on a separate server/origin at port 4180; the harness refuses fixture writes on the normal 4173 origin. It retains clearly named `Delta 9` test materials on that isolated origin for manual inspection.

Remote image URLs still depend on the source server. Team Up and other boost combinations are covered at engine level; not every combination has an individual manual visual playthrough. Actual ClassIn embedding was not available; responsive browser viewports were checked instead.
