# Story Dice + Wordly polish — 2.7.0

Completed: 2026-09-30.

## What changed

Wordly now uses `min(wordLength, 5)` attempts. Its existing case-insensitive comparison and uppercase input display are retained and explicitly tested. The grid measures columns and rows independently; tiles, letter text, feedback marks and gaps scale together. Desktop maximum tile sizes are 112/102/92/84/78/72 px for 3/4/5/6/7/8 letters. Available width and height constrain these maxima. The clue image size was preserved. Medal logic continues to omit a medal on the final allowed attempt.

Story Dice adds one shared rolling/rendering system for Story, Concept and Sentence modes. Story uses 100 built-in familiar emoji concepts. Concept uses the selected shared Content Set, including uploaded images. Both allow 10 dice. Sentence allows three dice per category, up to 18 total. Actions stay in base form; Where prompts contain prepositions. No sentences are generated or evaluated.

Time and Aspect filters are on the game screen. All 16 filter combinations are supported. A grammar bag balances aggregate selections; separate expression bags supply 25 contexts for each of the nine tense/aspect combinations (225 total). Filter changes leave existing dice intact. Individual Time rerolls use the current filters. Clear preserves grammar, mode, set and theme.

Dice have an animated blurred tumble and readable settled face, a vocabulary label, reroll and remove controls. A short five-tap synthesized roll sound obeys Sound. Reduced motion skips the tumble. The table scrolls vertically when needed; controls remain outside its scrolling area.

## Changed files

New game files: `games/story-dice/index.html`, `game.js`, `game.css`, `engine.js`, `pools.js`, `sound.js`.

Wordly updates: `games/wordly/engine.js`, `game.js`, `game.css`.

Integration: `index.html`, `shared/game-chooser.js`, `package.json`, `README.md`.

Tests: new `tests/story-dice.test.mjs`, `story-dice.html`, `story-dice-browser.js`, `wordly-sizing.html`, `wordly-sizing.js`; updated `tests/wordly.test.mjs` and `wordly-browser.js`.

## Architecture and preservation

Content Sets and image repositories were reused without modification. Story/Sentence pools are structured data in pools.js. DiceTable owns die identity, category, visual content, grammar metadata and roll state; rendering does not infer rules from DOM text. The approved ConceptBag implementation is reused via its existing pure module. Game preferences have a separate localStorage key: `sunny-stacy.story-dice.settings.v1`. URLs include mode, theme, sound and, for Concept, set ID. The existing semantic theme renderer, sidebar and settings-preview transaction are reused.

Byte comparison against `work/pre-story-2.6.0` found **zero changed files in games/dobble and games/tic-tac-toe**. Neither approved game's gameplay was changed. Version 2.7.0 is defined only in package.json and displayed through the existing shared version module.

## Test results

All 12 Node suites passed: logic, motion, content, rotation, adaptive, configuration, composition, Tic-Tac-Toe, gameplay polish, Tic-Tac-Toe polish 2, Wordly, Story Dice.

Story Dice tests cover all 16 grammar combinations over repeated cycles, grammar and expression uniqueness before exhaustion, all 225 expressions, category limits, Story/Concept limit 10, isolated reroll/remove, current-filter Time reroll, immutable source content and Clear preserving filters.

Browser results:

- `story-dice.html`: all checks passed. Story starts empty; double-click adds one die; individual reroll preserves others; Sound ON emits five short notes and OFF emits none; Concept loads the exact set and uploaded images; Sentence allows 18 dice, prevents a fourth in each category and re-enables after removal; grammar changes preserve old results; themes preserve dice; missing sets cannot silently launch Concept.
- `wordly.html`: all checks passed. Physical/on-screen input, repeat/double-submit guards, duplicate letters, locked greens, Hint, medals, victory/failure, themes, exact set selection, uploaded images and all five rows of the 8×5 grid.
- `wordly-sizing.html`: all 48 length/viewport combinations passed, each with keyboard closed and open. Rows are 3/4/5/5/5/5. At 1366×768 the measured tiles were 112/102/92/84/78/72 px; at 1024×768, 112/102/92/84/78/69 px.
- `wordly-session.html`: all checks passed for repeated bag cycles, round resets, safe settings and keyboard toggle.
- `polish.html`: Hub and all 32 Dobble viewport/card-count checks passed.
- `pregame.html`: existing My Sets → Dobble setup/Cancel/Play checks passed.
- `ttt-polish2.html`: all manual reveal, Steal OFF, existing game chooser and saved editor checks passed.

Viewport matrix: 390×844, 412×915, 844×390, 915×412, 820×1180, 1024×768, 1366×768, 1920×1080. Story Dice was tested with 18 dice at each size. No horizontal page/table overflow or clipped fixed controls was found. Wordly's active row remained visible with the on-screen keyboard open.

Manual browser verification also confirmed My Sets → Animals 1 → Play → Story Dice — Concept Mode opens with `mode=concept&set=animals-1`, Concept selected and Animals 1 selected. Mixed physical keyboard input `eLePzzzz` displayed uppercase and evaluated correctly in Wordly. Browser console checks for the new game and Wordly suites reported no warnings or errors.

## Run / manual workflow

1. Extract the complete archive. Open a terminal in `sunny-stacy-games` and run `node serve.mjs` (Node.js required).
2. Open http://127.0.0.1:4173/ and select Story Dice.
3. Choose Story → Play → +1. Add several dice, reroll one, remove one, then Clear.
4. Change mode → Sentence → Play. Add Subject, Action, Where and Time. Change Time to Past and Aspect to Continuous; existing prompts must remain. Reroll the Time die and verify its new PAST CONTINUOUS target.
5. Add three dice of a category; the fourth is disabled. Remove one to re-enable it.
6. Open My Sets, choose your saved set → Play → Story Dice — Concept Mode. Verify the selected words and images appear on dice.
7. Open Wordly with an eight-letter word. Confirm five rows and “Try 1 of 5 · 8 letters”. Type mixed-case input, use Hint and toggle the keyboard. Confirm uppercase letters and protected greens.

Automated commands/pages: `npm test`, and the browser test URLs listed above under `/tests/`.

## Known limits

Content remains local to the browser; custom sets must be imported on another device. Dice/session progress is not persisted. Story and Sentence pools are built in. Time expressions are prompts with an explicit target tense, not a grammar checker; some include a short context to clarify the intended tense. Emoji rendering varies by platform. The roll uses a CSS illusion, not physical 3D simulation. Responsive tests use browser viewport sizes, not a live ClassIn session. Audio scheduling was tested, but perceived sound quality on classroom speakers still benefits from a listening check.
