# Board Race Shuffle Bag + Magic School markers — 2.24.1

Date: 2026-10-15

## Changes

- Board Race Cards / Decks now keeps an independent queue of stable card IDs per selected deck, shuffled with the existing Fisher–Yates helper. Each card is consumed once per cycle. Author content is cloned and never mutated.
- On exhaustion only that deck is shuffled again. If its first ID equals its previous last ID and it has more than one card, the first is swapped with a randomly chosen later ID. Singletons repeat normally.
- A valid draw advances the cursor once. Existing WAIT_FOR_DRAW / CARD_DRAWING / WAIT_FOR_CONTINUE / CARD_RETURNING guards block repeated and wrong-deck clicks. Visual return and cancellation release the in-flight card without putting it back in the queue.
- Queues belong to DeckSession: retained across turns, rendering and theme-only settings updates; a genuine new game/replay creates a fresh session. Browser reload starts a new game; bags are not persisted to storage.
- Magic School X now displays 📖; O remains 🕯️. Marker sizing, layout, gameplay and all other theme mappings are unchanged.

## Files

Modified:
- games/board-race/decks.js
- games/tic-tac-toe/markers.js
- tests/gameplay-polish.test.mjs
- package.json (2.24.1 and new test registration)

Added:
- tests/deck-bags.test.mjs
- tests/deck-bags.html
- tests/deck-bags-browser.js
- tests/magic-markers.html
- tests/magic-markers-browser.js
- SHUFFLE-MARKERS-2.24.1.md

## Verification

- All 36 Node test suites passed, including existing game, content, storage and layout regressions.
- New deterministic tests: 100 complete cycles each for sizes 1, 2, 6 and 30; exact coverage, no premature/boundary repeat; independent decks; duplicate displayed text with separate IDs; wrong/double clicks; stale tokens; visual return; cancellation and new sessions.
- Existing browser test passed for 1–5 selected decks: manual matching-deck selection, wrong-deck feedback, double-click guards, authored card display, return and next turn. Responsive checks at 390×740, 760×420, 768×1024 and 760×720.
- New browser test passed seven draws from a six-card deck in both Race and Endless: complete first cycle and no immediate boundary repeat, including a theme change and viewport resize halfway through the cycle.
- Magic School browser tests passed: Picture Blur and Word Blur, manual reveal without evaluation, Incorrect, Steal ON/OFF, correct placement, win and replay. Book/candle visually inspected at mobile width 390px; other theme mappings and draw outcome covered by automated tests.
- Browser console checks: no errors in the completed deck and marker test runs.

## Limits

Windows 10-specific emoji rendering has not been verified. Native emoji appearance depends on the operating system/font. No SVG marker system was introduced. GitHub Pages deployment completion is intentionally not polled.

## Manual check

Start with `node serve.mjs` from the project folder. Open Board Race, select Cards / Decks with a six-card deck, and complete seven draws; the first six must be unique and draws six/seven different. Repeat in Endless. Open Tic-Tac-Toe with Magic School and place both player markers.

Browser fixtures must be run on isolated test origin port 4180, not the teacher-data origin on 4173.

