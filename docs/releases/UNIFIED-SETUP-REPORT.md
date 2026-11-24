# Unified Game Setup Menu

Implemented on 2026-10-01 in the current Sunny & Stacy Games project, including the earlier Wordly visual and coloured-folder deltas.

## Delivered

All four games use a shared, bounded configuration surface with Content, Themes and Gameplay tabs. The same menu opens before play and from in-game Settings. Tab changes only switch visibility and retain the draft selections.

Content provides folder filtering (including folder colours), set selection, a scrollable concept list, compact include checkboxes, included-count feedback, and Edit links. Excluded concepts remain visible and muted. Exclusions are held in memory by set/item ID and are passed as filtered copies to the existing engines; no saved set is rewritten. Cancel restores committed exclusions; reloading starts with the original complete set. Existing minimum-content and compatibility checks continue to apply.

Edit opens the existing editor in a new tab at the chosen concept. Saving and returning refreshes the setup list while retaining its draft theme and exclusions. Built-in sets retain their established edit-as-copy behaviour, explained in the menu. Selecting a set does not create a copy.

Themes provides the eight existing themes in the requested Light/Dark groups. Cards reuse `shared/themes.js` colours and actual local theme assets, with a check/border selected state. Preview applies immediately. Sound is a switch beneath the cards.

Gameplay controls:

| Game | Controls |
| --- | --- |
| Dobble | Number of cards and content type wheels; Movement switch with the existing speed choices in a wheel; Auto next turn switch |
| Wordly | Word-length wheel; Random / No Repeats–Mastery segmented control |
| Tic-Tac-Toe | Picture Blur / Word Blur segmented control; Steal switch |
| Story Dice | Story / Concept / Sentence wheel |

Dobble no longer exposes answer delay and uses the existing Normal value (600 ms) when configuration is applied. Tic-Tac-Toe setup no longer contains player-name fields; names remain editable on the game board. Story/Sentence modes continue using their built-in prompts, with a note explaining that selected sets are used in Concept mode.

Theme/sound-only changes preserve the active game. Content or structural gameplay changes start a newly configured game. Tic-Tac-Toe task presentation can still change for the next task while preserving the board. Dobble theme preview retains the previous card geometry protection.

## Shared implementation

- `shared/setup-menu.js`: tabs, folder/set browser, temporary exclusions, theme previews, switches, segmented controls, and adapters for existing gameplay inputs.
- `shared/setup-menu.css`: shared desktop/mobile layout, bounded scrolling, persistent tabs/footer and selected/disabled states.
- `shared/wheel-picker.js`: existing wheel extended to remain stable across hidden tabs, with mouse, touch and keyboard operation.
- `shared/selection-controls.js`: skips controls owned by the shared menu.
- Game page scripts/HTML and the Dobble setup builder in `shared/ui.js` connect existing options and session launch paths to the shared components.
- `sets/editor.js`: honours the concept ID in an Edit link and focuses that row.

No database migration, cloud service, authentication or backend was introduced. The previous local folder data model and saved set IDs are unchanged.

## Validation

- All 15 existing Node suites passed.
- Browser acceptance across all four games: folders, stable tabs, temporary exclusions, filtered engine pools, theme/sound, gameplay selection, Cancel rollback, reload restoration, unchanged saved set data and IDs.
- 24 game/viewport combinations, each across all three tabs: 1366×768, 1024×560, 820×1180, 390×844, 320×568 and 844×390. No horizontal overflow; Play and tabs remain within the viewport.
- Mouse wheel, mouse dragging and native touch scrolling tested on the custom picker; keyboard navigation skips disabled choices.
- Actual local preview assets loaded and all eight themes preview/cancel/commit without resetting game state.
- 200-concept list at 320×568; Edit opens the correct row, saves the actual concept, and refreshes setup without losing draft exclusions/theme or changing the set ID.
- Updated browser harnesses passed: shared setup, pregame, shared systems, existing set-link/import delta, Wordly session, Story Dice and gameplay polish. They cover TTT reveal/steal/name behaviour, Dobble static/slow/medium/fast geometry, unchanged rounds during theme preview and existing game links.
- Byte comparison: 17 protected gameplay/data/library/previous-visual files remain identical, including game engines, Dobble layout/render/motion, local database/folders/set repository, theme definitions, My Sets library and the earlier Wordly CSS.
- New repeatable browser harness: `tests/setup-menu.html`. Existing affected browser tests were updated for the unified controls.

Browser validation used Edge (Chromium), including touch emulation and constrained embedded-style windows. Actual ClassIn was not available for direct testing.

## GitHub update

The accompanying ZIP is the full current project. Extract it and upload the contents of its `sunny-stacy-games` folder into the existing repository root, replacing matching files. Keep assets/data and other existing project folders. Do not add an extra nested `sunny-stacy-games` directory. The archive contains application files, not the browser's locally saved teacher sets.
