# CHOMP! — v2.25.0 implementation and validation

## Implementation
- New `games/chomp/`: engine, task controller, settings, shared activity definition, character renderer, CSS, HTML, character manifest and asset mapping.
- Eight characters use the supplied chomp-snap showcase and authored PowerPoint layers. `CHOMP basic.pptx` was used to check the initial teeth. Ten teeth per creature start extended. Six shortened source teeth were restored from matching authored layers. The bear's authored smile arc and inward tooth shadows are restored in closed frames.
- All image files are local, transparent lossless WebP. Closed SVG compositions were rendered at 1600 × 900; no white slide background is included. Original intermediates are retained locally under `work/chomp-source-assets`, outside the deployment.
- No missing character replacements or emoji substitutes. Original supplied `freesound_community-carrotnom-92106.mp3` is bundled as `assets/audio/chomp.mp3`, with unchanged volume.
- Explicit task, resolving, tooth-selection, pressing, CHOMP-transition and complete states guard input. One dangerous tooth is selected at round creation and remains fixed. No more than ten valid presses can occur; repeated/locked input cannot consume additional turns.
- Correct/Incorrect for Concepts and Sentence Correction; Done / Continue for Card Decks and Bridges. Reveal never advances. Bridges lock after reveal. Incorrect selects another task and advances the player (or keeps the solo player).
- Mastery selection prioritises unseen, delayed failed, then completed tasks. IDs remain scoped to source and deck, and eligible decks receive balanced turns. Replay retains coverage and rotates the starting player.
- Shared content repositories, task presenter, concept blur, deck blur, setup menus, themes and audio are reused. No stored author content is mutated. Settings persist locally; explicit set links override remembered deck mode.
- Mobile character occupies a stable square above the task panel. Its size does not change between answering and tooth selection. Desktop uses side-by-side panels. Long tasks can scroll. Transparent tooth targets have no rectangular focus outline; keyboard focus highlights the tooth itself.
- Replay restores teeth, frame, count and dangerous-tooth choice. Theme changes start a new round; unchanged setup preserves the current task.

## Integration changes
`shared/activity/catalog.js`, `shared/game-catalog.js`, `shared/game-chooser.js`, `shared/library-games.js`, `shared/audio.js`, `games/board-race/deck-selection.js`, `package.json`, `updates.json`.
The deck-selection extension has defaults preserving Board Race's existing validation and colours. CHOMP is the seventh Hub game and is available from compatible My Content items.

## Verification
- All 37 package test suites passed. Includes existing Dobble movement/composition, Tic-Tac-Toe, Wordly, Story Dice, I Spy, Board Race routes/boosts/deck bags, editors, library compatibility and update-feed tests.
- CHOMP engine: 3,200 rounds covering all characters and 1–4 players; fixed dangerous tooth, incorrect/double/invalid input, finite rounds and ordinals; mastery coverage, retries, singleton content and independent deck fairness.
- Browser fixture on isolated port 4180: full rounds and replay with all eight characters; Concepts, Card Decks, Bridges and Sentence Correction; per-deck blur including absent target components; repeated incorrect answers; source immutability; unchanged settings and theme restart; 390×844, 740×390, 820×1180; long-task controls at desktop and mobile sizes.
- Browser deck presentation regression: all nine text/image/mixed and Blur combinations, stable reveal geometry, single return, long text and unchanged authored data passed. Updated its obsolete pool assertion to verify the existing shuffle bag is not rewound.
- Visual checks: all open/closed characters, restored smile, shadows, transparency, and absence of rectangular focus frames. Keyboard Tab and Enter exercised in the actual game. Browser console checked.
- Shared audio tests verify CHOMP disabled playback, original volume and stop/reset. Reduced-motion CSS disables tooth transitions and burst animation; OS-level reduced-motion and physical-device touch/audio are not independently verified.

## Run and manually check
Run `node serve.mjs` from the project folder, then open `/games/chomp/`. Choose content, theme, 1–4 players and Play. Incorrect must not unlock teeth. Correct or a completed task must unlock exactly one press. Press teeth until CHOMP, then Play Again and verify all teeth return. Check Word/Picture Blur and use the keyboard to choose a tooth. On mobile, the character must remain the same size above the task panel.
Run the package's `test` script with npm, or execute its listed Node test files directly. Browser fixtures `tests/chomp-browser.html` write only isolated test records on port 4180; `tests/chomp-characters.html` displays the character gallery.

## Publication
Prepared for GitHub main with no forced update. The CHOMP What's New entry remains a verified draft until deployment is confirmed; the roadmap accurately states publication verification is pending. Existing release history and known issues are preserved.

## Limits
Settings and teaching content use the existing browser-local storage; shared URLs do not transfer private sets between devices. Full-round state is not resumed after browser reload. This release has no cloud backend, no score/ranking and no automatic judging. Safari and real-device audio/touch testing are not claimed.
