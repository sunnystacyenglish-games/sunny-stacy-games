# UI/UX polish 2.4.2 — 2026-09-29

PASS: all 7 Node test modules (10078 logic checks; 648000 motion frames; 20000 rotation rounds; 7743 adaptive rounds; 180 measured compositions; content/config validation).

PASS: Hub at 8 required viewports; Dobble at all 8 × 4 card counts (32 cases). No horizontal overflow; full card bounds inside viewport. Hover opens, 400 ms grace closes, reentry cancels, touch-event open/outside close, keyboard focus retains, Escape closes. Cards/items geometry, IDs, angles, scales, score identical before/after drawer interactions.

Two-card diameters: 390×844 = 346; 412×915 = 368; 844×390 = 275; 915×412 = 297; 820×1180 = 364; 1024×768 = 466; 1366×768 = 625; 1920×1080 = 914 px. Previous implementation capped diameter at 520 px.

PASS: existing viewport suite (10 dimensions × 1/2 cards × 3 representations), small sets 5/6/7/9/13/19, resize preserves answer/score/scales.
PASS: delta acceptance exact IDs, missing IDs, matching/different JSON import, explicit replacement, copied URLs, obligatory pre-game, mobile bounds.
PASS: storage/image uploads PNG/JPEG/WEBP, persistence, independent duplicate, portable JSON, corrupted record handling; editor drop/paste/semantic/minimum validation; pre-game; version; 15 existing responsive routes; rendered collision/movement combinations 2–10 items, images/words/mixed, Off/Slow/Medium/Fast.
PASS: active fast movement continues with the same nodes, IDs, angles/scales and score while drawer opens/closes. The first test incorrectly clicked a correct answer (which intentionally stops movement); corrected test exercises an unanswered round.

Visual inspection: Hub and Dobble desktop; mobile 390×844 embedded previews; open drawer and keyboard focus. Hub/Dobble browser console error/warning logs empty after fixes. Reduced-motion transition override verified in stylesheet; actual OS reduced-motion mode and physical ClassIn/touch device were not available for live testing. Pointer/touch handlers were exercised with browser PointerEvents.

Protected gameplay, composition, physics, sound, config, URL, set repository and theme modules: 20 files byte-identical to pre-polish backup.

Changed: index.html; shared/app.js; games/dobble/index.html, dobble.css, viewport.js; sets/index.html, editor.html (favicon only); package.json; tests/version.html, layout.html; README.md.
Added: shared/game-shell.js, game-shell.css, home.js, home.css, site-content.js, brand-mark.svg, brand-mark.png; tests/polish.html, polish.js, shell-motion.html, regression.html, mobile-preview.html; this report.

Limitations: social URLs intentionally empty; simple replaceable brand mark; local browser storage remains local; no new games or cloud services.
