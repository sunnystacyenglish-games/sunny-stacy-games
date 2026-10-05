# Content Editors & Explicit Limits — 2.11.0

2026-10-05. Authoring foundation only; existing games are unchanged.

## Where to open

My Sets → Content Studio, or http://127.0.0.1:4173/activities/.
Choose Concept Set, Bridge, Scene, Sentence Correction or Card Deck. New structured editors share Content / Themes / Gameplay. Gameplay currently explains that the compatible games are not implemented. Save activity stores validated authoring content; the Studio list provides Edit and Export JSON. Import creates a separate activity and does not overwrite existing records.

Concept Sets still open their existing reusable editor and remain playable in existing games. The new structured activities are not exposed as playable games.

## Centralized limits

`shared/activity/limits.js` is the single source for UI and authoring validation:

| Content | Capacity |
| --- | --- |
| Concept Set | 50 concepts |
| Bridge | 20 bridges, 5 gaps per bridge |
| Scene | 50 instances, 20 targets |
| Sentence Correction | 30 sentence pairs |
| Card Deck | 6 decks, 30 cards per deck, 100 total |

Counters/limits are shown before reaching capacity. Add/duplicate actions disable at the relevant boundary; their handlers also check capacity. Scene counts instances, not assets. Deck Add Card distinguishes per-deck and activity-wide limits.

Backward compatibility: existing Concept Sets and legacy v1 exports containing 51–500 concepts remain loadable, editable, exportable and playable. They are not truncated. Add is disabled and the counter shows e.g. 70 / 50. An update cannot increase the previously stored count; newly authored sets cannot exceed 50. Legacy import/duplicate deliberately preserve old content. Existing corruption/format limits still apply.

## Editor behavior

**Bridge:** editable wrapping bricks; arrows reorder without changing IDs. Select gap toggles gap state, capped at five. Panels exist only for selected gaps. Correct answers are read from the referenced brick. A gap references an answer-group ID; group colors and distractors are shared. Changing brick text updates the displayed derived answer. No runtime answer sequence is saved.

**Scene:** guided background upload, then scene + reusable asset palette + targets. Dragging an asset creates a new instance with a new ID. Objects can be moved, resized with the corner handle, duplicated and deleted. Numeric percentages provide precise adjustment. Coordinates/dimensions are fractions of the background canvas. Replacing/removing background does not delete existing objects. Removing an object explicitly removes its target references; affected targets must be repaired before save if no answers remain. Targets refer to object IDs, support one or many objects through the same selection interaction, show thumbnails and highlight associated objects. Scatter is an indicated future extension, not implemented.

**Sentence Correction:** Incorrect + Correct fields, live token-based red/green diff including multiple corrections, unchanged tokens normal. Equal completed sentences are rejected. Diff is derived editor feedback and is not persisted as student-facing hints.

**Card Deck:** vertically stacked full-width named/colored decks; cards use text plus optional uploaded image. Image can be added/replaced/removed directly. Up/down actions reorder stable card IDs. Runtime session creation still produces detached content, preserving saved order.

## Architecture and persistence

- `shared/editors/bridge.js`, `scene.js`, `sentences.js`, `decks.js`: separate editor components.
- `shared/editors/common.js`, `editors.css`: shared capacity UI, controls, lifecycle and intentional responsive styles.
- `shared/editors/models.js`: per-type validation, empty authoring models, editor-only diff.
- `shared/editors/register.js`: content/editor descriptors. Authoring-only descriptors use `authoring-<contentType>` gameType; no future game mechanics or playable game entries are introduced.
- `shared/activity/catalog.js`: registers these additional editor/content types.
- `shared/activity/limits.js`: capacity constants and checks.
- `shared/activity/repository.js`: activity repository, local asset provider and portable JSON bundles.
- `activities/index.html`, `index.js`: Studio/library and shared configuration shell integration.

The existing IndexedDB database advances from version 2 to 3 by adding `activities` and `activityAssets` stores. Existing sets/folders/setFolders remain unchanged. Uploaded images are Blob records referenced by asset IDs. The existing upload processor accepts PNG/JPEG/WEBP, validates file size and resizes to 512 px. No filesystem image paths or large image localStorage values are used.

ActivityDefinition and each new content schema remain version 1. Portable export wrapper is `sunny-stacy-activity-bundle`, version 1: definition + referenced image data. Import validates content, references and decoded images, then gives the imported activity/new assets new IDs while preserving IDs and relationships inside the authoring content. Existing Concept Set import/export format is unchanged.

Runtime/current-answer/selection/drag state is not part of saved content. New editor drafts are detached copies; Save writes validated author content. Unsaved changes warn on close/navigation. A delayed close event from a previous editor cannot reset a newly opened draft.

## Changed existing files

`package.json`, `README.md`, `sets/editor.html`, `sets/editor.js`, `sets/index.html`, `shared/database.js`, `shared/sets.js`, `shared/transfer.js`, `shared/setup-menu.js`, `shared/activity/catalog.js`.

New production modules are listed above. New tests: `editors.test.mjs`, `editors.html`, `editors-browser.js`, `editors-limits.html/js`, `editors-responsive.html`, `editor-demo.html`, `concept-capacity.html`.

## Verification

- All 17 Node suites passed, including existing game logic/motion/audio suites and new editor model tests.
- `tests/editors.html`: all four editor workflows, grouping, identical-sentence rejection, card ordering, scene upload/drag/duplicate/targets, portable JSON images, refresh/reopen — PASS.
- `tests/editors-limits.html`: 20/5 Bridge, 30 Sentence, 6/30/100 Deck, 50/20 Scene; disabled Add/duplicate actions and instance counting — PASS.
- `tests/editors-responsive.html`: actual 390px iframe layouts for all four editors; stacked sentence fields and palette below scene — PASS.
- `tests/concept-capacity.html`: fresh >50 rejected, old 70-item JSON imported and edited without loss, disabled Add, growth rejected — PASS.
- `tests/setup-menu.html`: existing Dobble, Wordly, Tic-Tac-Toe and Story Dice workflows — PASS.
- `tests/browser.html`: existing persistence, image uploads, portable Concept Set import/export and built-ins — PASS.
- Actual pointer drag from palette changed scene count 3→4; resizing changed dimensions 15%→19%/21%; dragging changed coordinates 36%/9%→28%/14%.
- Final successful browser runs had no console warnings/errors. An initial lifecycle race was found and fixed, then the workflow was rerun successfully.
- Every existing file under `games/` is byte-identical to archive 2.10.0.

## Limits of this stage

No future gameplay, Assignments, cloud storage, accounts, statistics, TTS, advanced scene layers, Odd One Out or Story Builder editor. Scatter is not active. Mobile layouts were checked in resized browser frames, not on a physical touchscreen. Assets from cancelled uploads or replaced images may remain in local storage; automatic orphan cleanup is deferred. Studio currently provides Save/Edit/Import/Export, not a full activity-management product.

## Run / manually check

Run `node serve.mjs` in the unpacked sunny-stacy-games folder, then open http://127.0.0.1:4173/activities/ (Node.js 18+, no install required). `npm test` runs the 17 suites.

1. Bridge: add bricks, select a gap, change its original text, add a distractor, assign two gaps to one group, Save and reopen.
2. Scene: upload a background and an asset, drag it twice onto the canvas, move/resize one instance, add two targets sharing an object, Save, export/import and reload.
3. Sentence: enter an incorrect/correct pair with two changes; check red/green diff. Identical fields cannot be saved.
4. Deck: create named/colored decks, text-only and image/text cards, reorder, Save and reopen.
5. Concept Set: verify Max. 50 and count, normal existing gameplay and old JSON import.
