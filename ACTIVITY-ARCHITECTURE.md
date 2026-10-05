# Extensible Activity Content — 2.10.0

2026-10-05. Architectural preparation; no new game or assignment workflow.

## Boundaries

Concept Sets remain independent reusable assets in the existing repository. The editor, image storage and v1 Concept Set JSON importer/exporter are unchanged by this delta. Existing URLs and game engines continue using their established launch paths.

An ActivityDefinition is a separate versioned JSON document containing author intent. `content.type` chooses a registered content adapter and editor. `conceptSet` stores `{setId}` rather than a copy of the set; a new runtime session resolves the current set via an injected repository. Existing Story Dice prompt modes also have a `builtInPrompts` adapter, describing the existing built-in library only.

A RuntimeSession contains a frozen validated definition snapshot, detached resolved content, a mutable gameplay-config copy, state and events. Shuffling, retries and temporary selections belong here. No runtime object is exported as saved author data. The existing setup menu now returns deep copies of session-selected sets as well.

## Files and contracts

- `shared/activity/contracts.js`: portable JSON boundary, stable UUIDs, duplicate-ID/reference checks, normalized rectangle helper, immutable snapshots and one-version-at-a-time migration runner.
- `shared/activity/registry.js`: separate content/game/editor registries, capability metadata and game-specific config normalization. No global switch over future game names.
- `shared/activity/catalog.js`: the four current games and the two existing content sources.
- `games/{dobble,wordly,tic-tac-toe,story-dice}/activity.js`: each game's own content support, config defaults/normalizer, editor and runtime reference, capabilities.
- `shared/activity/definition.js`: create, validate, update, export/import, runtime-session factory and optional result contract.
- `shared/activity/media.js`: HTTPS or provider-neutral asset ID references, injected asset resolver. Existing concept images continue through `shared/images.js`; there is no storage migration.
- `shared/setup-menu.js`: resolves content editor while retaining the existing Content / Themes / Gameplay shell. Existing games explicitly identify themselves at their mount call; Dobble retains the legacy default.
- `shared/game-chooser.js`: reusable-set availability is checked through capability metadata.

Modified existing files: `package.json`, `README.md`, `shared/setup-menu.js`, `shared/game-chooser.js`, and the single setup-call argument in `games/wordly/game.js`, `games/tic-tac-toe/game.js`, `games/story-dice/game.js`.
New tests: `tests/activity.test.mjs`, `tests/activity-editor.html`. New document: this file.

## Usage

```js
import {activityRegistry} from './shared/activity/catalog.js';
import {createActivity, createRuntimeSession, exportActivity,
        importActivity, updateActivity, activityResult} from './shared/activity/definition.js';
import {setRepository} from './shared/sets.js';

const activity = createActivity({
  name: 'Animals practice', gameType: 'wordly',
  content: {type: 'conceptSet', version: 1, data: {setId: 'animals-1'}},
  themeConfig: {theme: 'ocean', sound: true},
  gameplayConfig: {length: 'any', selection: 'mastery'}
}, activityRegistry);
const session = await createRuntimeSession(activity, activityRegistry, {sets: setRepository});
// Mutate session.state/session.content, never activity.
const text = exportActivity(activity, activityRegistry);
const restored = importActivity(text, activityRegistry);
const renamed = updateActivity(restored, {name: 'New name'}, activityRegistry);
// update keeps ID, game type and original createdAt.
const result = activityResult(session, {completed: true, details: {responses: []}});
```

Results have duration in milliseconds, optional completion timestamp, summary, game-specific details and events. They do not require a numeric score. Assignment capabilities remain false because assignments are not implemented. Capability flags describe available functionality, not a promise of a working future service.

## Adding a future content model

1. Register a content descriptor `{type, version, migrations?, validate(data), resolve(data, services), editor}`. Validation throws a readable error on invalid data; resolution may be asynchronous. Keep model-specific validation here, including relationship checks and media requirements.
2. Register a game descriptor with supportedContentTypes, defaultGameplayConfig, normalizeGameplay, editors, runtime and capabilities. Normalize only that game's settings. Reject unsupported combinations in the game's validation/launch adapter.
3. Register a synchronous editor mount function. It receives `{host, activity, onChange}`; `activity` is a detached JSON draft. Render only inside host, use textContent for imported text, and return `{read, sync?, begin?, commit?, cancel?, destroy?}`. `read()` returns content data; it must be portable JSON. Editor owns draft rollback/cleanup. It must call onChange when validation/availability could change.
4. Call mountSetupMenu with `{activity, registry?, dialog, form, title, themeSelect, sound, gameplay, footer, committedTheme, onContentChange?}`. Game type is derived from activity; an explicitly mismatched type is rejected. Custom content does not require setSelect/getSets/setSets. Themes and Gameplay remain common shell panels. Use controller.readContent() and validateActivity before save/launch.
5. Build the actual game-specific launch adapter separately. Current runtimes are intentionally not rewritten around ActivityDefinition. Registering metadata does not implement a new game.

Stable entity IDs survive reordering. `entityIndex` plus `validateReferences` can validate many-to-many ID arrays; there is no universal question/answer model or graph engine. `normalizedRect` describes top-left fractions in [0,1] with bounds inside the container. Other layout models may be defined by their content adapter.

## Schema and media evolution

Activity schema and content schema are independently versioned. Add a migration at its source version, returning the next exact version; unknown newer versions and missing steps fail explicitly. Schema v1 has no invented migrations. Tests use v1→v2→v3 fixtures to verify infrastructure. Imported activity JSON rejects unsafe keys, invalid numbers, non-JSON values and excessive nesting.

Activity export format: `{format:'sunny-stacy-activity', schemaVersion:1, activity:{...}}`. Only author fields are projected. Existing `sunny-stacy-content-set` files continue through the unchanged set importer. Referenced sets/assets are not bundled into Activity JSON: the destination needs that referenced content. Current portable Concept Set export still embeds uploaded images as before. Missing set/media providers produce explicit errors; no cloud provider is added.

## Verification

- All 16 Node suites passed, including the existing motion, game logic, content and audio suites.
- New contract suite: JSON round trip, stable IDs on rename, future-version rejection, sequential/missing migration checks, many-to-many references, malicious/nonportable JSON, media references, independent concurrent runtime sessions, mutation isolation, config isolation and optional nonscoring result.
- Browser `tests/activity-editor.html`: test-only non-Concept-Set editor mounts in the shared three-tab shell; draft survives tab changes, saved author data stays unchanged, cleanup works.
- Browser `tests/setup-menu.html`: all four current games pass folder filtering, exclusions/minimum-five, tabs, theme preview, launch and set-ID preservation.
- Browser `tests/browser.html`: old set import/export, portable uploads, persistence, duplicate independence and protected built-ins pass.
- Console warnings/errors in these three runs: none.

The workspace already included changes after the 2.9.0 archive. Therefore that archive is not a clean baseline for all current files. Those pre-existing changes are retained. No existing engine, movement, collision, sound or storage file was edited by this delta.

## Running

Run `node serve.mjs` from the project directory, then open http://127.0.0.1:4173/. Node.js 18+; no install step. `npm test` runs the 16 suites. Browser checks above each provide a Run button. The test-only editor is not linked from the teacher Hub.

This stage adds extension points and serialization APIs, not an Activities library/save UI, backend, cloud assets, assignment runner or any future game's mechanics.
