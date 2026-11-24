# Tic-Tac-Toe 2.5.0 — 2026-09-29

PASS: all eight Node suites (the seven previous Dobble/content suites plus tictactoe.test.mjs). New suite covers index 0, normal correct, both steal outcomes, duplicate attempts, occupied cells, eight win lines, steal win, draw, random starter endpoints, alternating starter and 10000 shuffled-bag draws.

PASS: tests/tictactoe.html. Eight viewport sizes: 390×844, 412×915, 844×390, 915×412, 820×1180, 1024×768, 1366×768, 1920×1080. Full square board and task controls; exact long text; disabled background; opaque modal; double Correct/Incorrect; different steal concept; correct post-steal player; occupied cells. Eight themes: correct logical marker mapping, named winner, edit without reset, Play Again alternation. Row, column, both diagonals and draw UI; SVG line visibility; end layout; missing-set resolution; drawer geometry unchanged.

PASS: tests/tictactoe-extra.html. Steal win ends round, Sound OFF invokes no AudioContext, Sound ON invokes existing shared feedback (test spy), uploaded Blob image decoded, matching JSON preserves requested ID, different import waits for explicit replacement, bag continues across Play Again.

PASS: tests/tictactoe-responsive.html after task placement refinement. All eight required sizes; long task, visible controls and chosen central square unobscured by the opaque task window. Window chooses available space without moving the board. Content can scroll within the modal while response controls remain visible.

PASS: existing tests/regression.html: storage and image formats, editor paste/drop, semantic validation, pre-game, global version, 15 responsive routes, rendered collision/movement checks. Existing Node tests: 10078 logic checks, 648000 motion frames, 20000 rotation rounds, 7743 adaptive rounds, 180 measured compositions, content/config validations.

Existing Dobble folder and shared modules/assets (except shared/home.css for the new game card) byte-compared with work/pre-tictactoe-2.4.2 and unchanged.

Reduced motion: stylesheet disables animation/transition and leaves line/highlights visible; JS removes selection/placement/win delays. Physical ClassIn/touch hardware and OS reduced-motion setting were not available for live verification. Automated clicks and touch-sized controls verified in browser. No new sound synthesis/assets; actual perceived loudness remains subject to classroom testing.

New files: games/tic-tac-toe/{engine.js,markers.js,settings.js,game.js,game.css,index.html}; tests/tictactoe.test.mjs, tictactoe.html, tictactoe-browser.js, tictactoe-extra.html, tictactoe-extra.js, tictactoe-responsive.html; this report.
Modified: index.html (released game), shared/home.css (two game cards), sets/library.js (new game link), package.json (version/test), README.md. No changes to Dobble gameplay, content persistence, shared settings UI, themes or audio.

Limitations: local browser content, no multiplayer/AI/cloud; page refresh starts a new session; current shared text validation allows up to 120 characters; no match score. Eight approved themes and Magic School #C9A45C retained.
