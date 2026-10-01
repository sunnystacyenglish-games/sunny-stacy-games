# Wordly visual sizing and local Set Library folders

Date: 2026-10-01. Delta on the current 2.9.0 project.

## Delivered

- Wordly prompt emoji and images use an explicit, responsive footprint. Desktop and embedded-size windows target 250 px, constrained by available width and height. Images use `object-fit: contain`, including small intrinsic images. Narrow/mobile and very short windows retain compact sizing.
- Existing clue-panel width, grid tile sizes, attempt-label typography and control positions are preserved in the tested before/after configurations. No user-agent detection is used.
- My Sets supports one level of named folders, opening folders, breadcrumbs, creating/renaming/deleting folders, set-to-folder drag and drop, highlighted targets and a Move to… dialog on every set.
- Sets can return to My Sets or move to any other folder. Built-in sets can also be organised. Editing a saved set retains its folder; a duplicate starts in the source folder.
- Folder order can be changed by dragging a folder onto another: it is inserted before that folder. Order persists.
- Folder icons support eight colour presets and a custom native colour picker. Colour changes persist without changing the folder ID.
- Folder deletion always asks for confirmation and explains that its sets return to My Sets. Assignments are cleared and the folder is deleted in one transaction; set content is not deleted.

## Data compatibility

The existing `sunny-stacy-content` IndexedDB database upgrades from version 1 to 2. The existing `sets` object store is retained without rewriting old records. Two stores are added:

- `folders`: `{id, name, order, color}`
- `setFolders`: `{id: setId, folderId: string | null}`

Organisation is stored separately from vocabulary and uploaded image blobs. The set repository exposes `folderId` alongside the existing fields. Missing assignments mean root. There is no parent-folder field and no nesting. Game URLs continue using the same set IDs. Existing set JSON import/export remains content-only; it does not transfer folder organisation.

This is entirely local browser storage. No cloud, authentication or backend was added.

## Validation

- All 15 existing Node test suites passed, covering Dobble, Tic-Tac-Toe, Wordly, Story Dice, content/configuration and audio.
- Wordly sizing: 3–8 letters across eight viewport sizes, custom keyboard open/closed; seven short-viewport scenarios including simulated visual-viewport shrink to 320/340 px. All passed.
- Before/after comparison at 1366×768, 1024×560, 390×844 and 844×390: clue-panel width, tile size, attempt-label font size and control rectangles unchanged.
- Explicit image sizing: 32×32, 64×32 and 32×64 intrinsic images receive a 250×250 contain box in a 1024×560 window. Desktop and embedded-size emoji/image checks show no clipping or horizontal overflow.
- Real pointer-driven drag verified target highlighting, immediate moves and persistence after reload. Folder reorder, rename, cancel/delete confirmation, root moves and built-in set organisation passed.
- Fresh isolated browser profile seeded with the real version-1 schema: legacy set ID, item IDs, words, timestamp and uploaded image bytes preserved through upgrade, moves and folder deletion.
- All four game setup screens resolved the moved set through its unchanged URL ID.
- Touch-only 390×844 browser context completed create/move/return-to-root without drag and drop; no horizontal overflow.
- Colour presets, custom colour and persistence after reload passed.
- `tests/library-folders.html` provides a repeatable repository check using temporary records, including edit/copy retention and safe folder deletion.

Browser checks used Microsoft Edge (Chromium). Actual ClassIn was not available; its constrained-window layout was simulated. Emoji artwork still depends on installed fonts, while the visual box is explicitly sized.

## Changed application files

- `games/wordly/game.css`
- `games/wordly/game.js` (visual sizing properties only)
- `sets/index.html`
- `sets/library.js`
- `shared/database.js`
- `shared/folders.js` (new)
- `shared/sets.js`
- `shared/teacher.css`

Additional test/report files: `tests/library-folders.html` and this report.
