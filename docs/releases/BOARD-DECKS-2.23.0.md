# Board Race Cards / Decks — 2.23.0

## Implementation

- Tiny piles came from fixed triangular positions and a capped card width. `deckComposition` now evaluates column counts against the existing geometry's safe centre, chooses the largest portrait cards, reserves gaps and shadow/focus clearance, and centres incomplete rows. Active-pile changes only toggle a class; viewport changes do not regenerate gameplay.
- Labels scale from the rendered card width (13–32 px), wrap at spaces, and retain authored names. A keyboard/touch-accessible **Deck names** disclosure provides full names when four-line truncation is necessary. Card text colour is selected from the deck fill's contrast.
- `deck-blur.js` normalizes the `deckBlur` preference map. Keys are existing stable `[documentId, deckId]` identities, not list positions. The user explicitly chose persistence between games, overriding the original UX document's session-only rule. Missing preferences default to Nothing. Existing settings storage and game links carry the map; authored decks and image storage are unchanged.
- Setup groups decks by their source document, with an independent Word Blur / Picture Blur / Nothing selector on each selected deck. Mobile selectors sit below the deck name. Concept Blur is only shown for Concepts.
- Opened cards conceal the specified existing component. Missing components need no reveal and do not rewrite the preference. Existing image-load failures remain errors. Concealed content is inert, hidden from assistive technology, and not selectable. Shared `revealTask` restores it. Reveal does not advance the turn; Done stays disabled until the required reveal and animation finish. The Reveal row becomes a noninteractive Revealed status with reserved width and height.
- The modal uses content-dependent height, the authored deck colour, white border, and a small deck heading. Only the task body scrolls; actions remain visible. Wide, low viewports can place image and text side by side. The animated back is removed from layout after travel: previously its scaled footprint could create an invisible outer scroll area and shift a long card. Safe alignment keeps the start of long content reachable.
- Dark-theme fields inherited light text while using the light `--card` surface. Board Race controls now pair that existing surface with dark foreground text, native light colour-scheme, readable options/placeholders, and a two-tone focus outline.
- Revealed boost selectors previously overrode the computed tile paint with the dark `--soft` theme surface. They now retain the existing valid `--space-fill` / contrast ink and add a contrasting revealed outline. Existing deck-distinct palette selection, hidden boosts, probabilities, effects and pawn logic are unchanged.

## Verification

- All 34 Node test scripts passed, including geometry, motion, settings, content, boosts, graded movement, deck lifecycle and the new deterministic layout/Blur matrix.
- Browser `tests/board-decks.html`: 1–5 piles; four viewport sizes; correct/wrong deck, double draw, return, click interception and resize during draw.
- Browser `tests/deck-polish.html`: all nine content/Blur combinations, required Reveal, accessibility attributes, no outer scroll, exact modal/footer stability, repeated draws, pool return, immutable fixtures and long mixed content. Desktop, 390×844 and 740×390 were exercised. The reduced-motion JavaScript branch was tested using a simulated media preference, not an OS preference change.
- Browser `tests/deck-theme.html`: all eight themes; actual tabs, controls and focus; normal text contrast >= 4.5:1; hidden-to-revealed boosts; alternating Concepts/Decks; setup reopen, deselect/reselect and saved Blur; authored data unchanged.
- Existing browser boost suite passed all eight decision/continuation scenarios: Switch, Shuffle, Shield, Pass, Lucky Roll, Reverse, Team Up and Steal.
- Real local Hobbies - how often: three independent modes, draw/Reveal/Done, new-page preference restoration. Real CVC: five selected decks at mobile width. No authored content was edited.
- Long mobile card and orientation change retained its revealed state; keyboard Done completed the card. Browser errors were checked on the completed game/theme/regression runs.

## Run / manual check

Run `npm start` in this folder, then open the printed local URL. Open Board Race, select Cards / Decks, select 1–5 decks, assign their Blur modes, and Play. Roll, click the highlighted deck, Reveal if required, then Done / Continue. Reload and reopen setup to verify remembered Blur. Repeat at narrow and low window sizes. Tests with fixture data should run on an isolated origin (for example a second local port), not the browser origin containing teacher data.

## Limits

Storage remains local to the browser. This does not add cloud sets or synchronize preferences between devices. Native select popup styling depends on the browser. Mobile checks used browser viewport emulation; physical touchscreen/ClassIn hardware was not available. Very long names use the approved full-name disclosure; long tasks scroll inside the card. Screenshots were captured during testing before the final version bump.
