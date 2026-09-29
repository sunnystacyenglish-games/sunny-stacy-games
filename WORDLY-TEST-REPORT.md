# Wordly Spelling — 2.6.0

Completed 2026-09-30.

## Delivered

Wordly is available from Games and the shared My Sets → Play chooser. Its pre-game dialog selects the content set, word length, theme and sound. Words must contain 3–8 English letters and have a usable image. The original content set is never altered.

Physical and optional on-screen keyboards share the same input state. Duplicate letters use exact matches first, then remaining letter counts. Green positions stay locked in future rows. Hints reveal one position without consuming an attempt. Success medals depend on submitted attempts, with no medal on the final allowed attempt. Solving entirely with hints uses the honest message “You spelled it with hints!” and the zero-attempt gold result. Failure reveals the answer without celebration.

## Files

New: games/wordly/{index.html,game.css,game.js,engine.js,eligibility.js,settings.js}; shared/celebration.{js,css}; tests/wordly.test.mjs; tests/wordly.html; tests/wordly-browser.js; tests/wordly-session.html; tests/wordly-session.js; this report.

Modified: index.html, shared/home.css, shared/game-chooser.js, games/tic-tac-toe/celebration.js, package.json and README.md.

The complete Dobble directory remains byte-identical to the 2.5.2 checkpoint. Tic-Tac-Toe's approved celebration implementation was copied unchanged into the shared module; its old entry point now re-exports that module. Other Tic-Tac-Toe game files were preserved.

## Validation

All 11 Node suites passed: logic, motion, content, rotation, adaptive, configuration, composition, Tic-Tac-Toe, gameplay polish, Tic-Tac-Toe polish 2 and Wordly. Wordly includes 10,000 seeded duplicate-letter cases, locked letters, protected Backspace, hints, final-attempt medals, failure and bag rotation.

Browser suites passed:

- wordly.html: physical/on-screen input, double-submit guards, locks, hints, success/failure, sound and celebration cleanup, all themes, unavailable pools, exact set selection, shared chooser and uploaded images.
- wordly-session.html: repeated bag cycles, double Next protection, reset, theme Cancel/Done, persisted preferences and keyboard toggling.
- celebration.html: existing Tic-Tac-Toe centering and victory regression.
- pregame.html: existing Dobble setup and launch regression.
- polish.html: Hub and Dobble responsive/navigation regression.

Wordly's 8×8 grid was checked with the keyboard open and closed at 390×844, 412×915, 844×390, 915×412, 820×1180, 1024×768, 1366×768 and 1920×1080. Every active row and the final result remained usable. Browser console checks found no warnings or errors in the tested Wordly flow.

## Storage and limits

Content and images use the existing shared repositories; no new content database or image storage was introduced. Wordly preferences use a separate localStorage key, sunny-stacy.wordly.settings.v1. Query parameters can select the set, length, theme and sound.

Sets still require five valid concepts overall. Wordly may use a smaller eligible subset; a one-word subset necessarily repeats that word. Only single ASCII English words of 3–8 letters are supported. Small-height screens scroll inside the grid. Content remains local to this browser; cloud synchronization is not included. Viewport tests simulate screen sizes and do not replace a live ClassIn session or acoustic listening test on a child's speakers.

## Run and manually check

1. Extract the archive and open a terminal in sunny-stacy-games.
2. Run `node serve.mjs` with Node.js installed.
3. Open http://127.0.0.1:4173/.
4. Choose My Sets → Play → Wordly Spelling, or use the Wordly card on Games.
5. Select Animals 1, a word length, theme and sound; press Play.
6. Enter a guess using your keyboard. Check that green letters remain fixed, Backspace cannot erase them, and Hint fills one position without spending a try.
7. Open the on-screen keyboard and continue. Open Settings, preview a theme, then Cancel; the current round should remain unchanged.
8. Finish a word and select Next word. Try a saved set containing an uploaded picture and refresh to verify its image remains available.

Run automated logic suites with `npm test`; open the browser test pages listed above through the same local server for browser checks.
