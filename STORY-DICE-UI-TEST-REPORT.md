# Story Dice UI — 2.7.1

## Changes

The play area no longer scrolls. A measured layout evaluates possible column counts using the actual viewport space and rendered label/category heights. It chooses the largest fitting die faces, centres each row, and preserves readable vocabulary text independently of image size. All 10 Story/Concept dice or 18 Sentence dice remain on the same screen at the tested dimensions.

Existing dice transition between positions and sizes over 320 ms. New dice enter from the lower table while retaining the roll animation. Settling no longer replaces the positioned element. Labels use the application's standard Trebuchet MS / Segoe UI body stack at 15 px desktop, 13 px portrait phone, and 12 px short landscape; these sizes do not decrease as dice are added.

Remove disables that die's controls, plays a 290 ms filtered-noise whoosh when Sound is ON, and performs a 320 ms upward/diagonal rotation, shrink and fade. Only then is the die removed from the model/layout and its category capacity released. Clear and mode changes cancel pending animation timers. Reduced-motion settings suppress transitions and remove immediately.

## Files

- Added: games/story-dice/layout.js.
- Modified: games/story-dice/game.js, game.css, sound.js.
- Tests: tests/dice-layout.html, dice-layout.js; existing story-dice-browser.js now waits for the exit animation before checking removal.
- Release/documentation: package.json, README.md, this report.

## Preservation

Byte comparison with work/pre-dice-ui-2.7.0 confirms every file in games/dobble, games/tic-tac-toe and games/wordly is unchanged. Story Dice engine.js, pools.js and index.html are also byte-identical. Modes, content, grammar matrix, bags, labels, limits and navigation were preserved. Theme definitions and shared modules were not edited.

## Verification

All 12 Node suites passed. Browser layout checks passed at:

390×844, 412×915, 844×390, 915×412, 820×1180, 1024×768, 1366×768, 1920×1080.

At each size, both maximum Story (10) and maximum Sentence (18) tables were checked for:

- No play-area scrollbar, hidden overflow content or horizontal page overflow.
- Every die, label, category and per-die control inside the table bounds.
- No overlapping die regions; bottom controls fully accessible.
- Smaller faces after adding dice; fitting/growing layout after removal.
- Unscaled readable body-font labels, including three copies of the longest built-in Time prompt.
- Delayed removal with an active exit class; exactly one whoosh and no roll notes on remove; no whoosh with Sound OFF.

The existing Story Dice browser suite also passed: isolated reroll, Story/Concept limits, exact Content Set and uploaded pictures, no set mutation, all Sentence category limits, grammar preservation, current-filter Time reroll, Clear, eight theme previews and missing-set handling. Browser console checks found no errors or warnings in the new layout suite.

Visual inspection confirmed the full 18-die table at 390×844 and after rotating to 844×390. The viewport override was reset afterward.

## Manual check

Run `node serve.mjs` from the extracted sunny-stacy-games folder, then open http://127.0.0.1:4173/games/story-dice/.

Choose Sentence, add three of each category, and resize/rotate the viewport. All 18 dice should stay visible. Remove one using ×: its exit finishes before the others expand/reflow. Switch Sound OFF and repeat to verify silent removal. Reroll Time after changing grammar to confirm the existing rules still apply.

Tests use browser viewport simulation; physical classroom devices and speaker sound quality remain a useful manual check. Historical 2.7.0 reports describe the earlier scrolling table and are superseded by this report for layout behavior.
