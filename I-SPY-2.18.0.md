# I Spy / Spot It — Delta 5.1 · 2.18.0

## Result
Two-stage Scene Editor and draggable magnifier. Scope is I Spy and its Scene Editor; other editors and games retain their existing behavior.

## Root causes and implementation
- The magnifier previously handled clicks only. Pointer capture now tracks mouse/touch movement from the initial grab offset, batches visual updates per animation frame and suppresses the click following a drag/cancel. A later deliberate click still confirms one eligible answer.
- The old editor fitted the entire scene into a height-limited panel beside a permanent palette/task list. Stage 1 now fits the background to its column width; Stage 2 fits it to the full workspace width and scrolls taller artwork.
- Scene coordinates remain normalized. Lens movement divides screen deltas by the current scene rectangle; zoomed editor movement and rectangular hotspot drawing use the current canvas rectangle. Scrolling/zoom are view state only.

## Editor and navigation
1. Prepare Content: background, up to 20 Prompts, direct clipboard/drop/file/URL images, thumbnail preview with Delete/Replace/Close. Images staged under a Prompt are not automatically positioned or linked.
2. Arrange & Link: full-width scene, Prompt dropdown, per-Prompt counts, turquoise dashed available objects and yellow linked targets, transient placement tray, drag/resize, rectangular hotspots, scrolling and right-button/touch panning.
3. Preview runs the actual I Spy game from a cloned unsaved draft using a same-origin, source-window/token-checked message exchange. Closing it preserves editor state. Done uses existing save validation.
4. I Spy setup offers direct Create Scene / Edit Scene links and existing scene choices. Saving from I Spy exposes Return to I Spy, with the saved scene selected in setup (no automatic game launch).

## Compatibility/storage
Existing scene v2 arrays, entity IDs and answer relationships are retained. Existing v1 scenes use the established non-destructive upgrade adapter. Optional asset promptId records only the preparation context; answer links remain in targets[].answers. One physical object can answer multiple Prompts independently. Blobs continue in IndexedDB through activityAssets; there is no new backend or storage model. Limits remain 50 assets, 50 objects, 100 hotspots and 20 Prompts.

## Verification
- All 28 existing Node test programs passed (including other games, content validation, scene mappings and lens answer selection).
- tests/content-scene.html passed: original upload, hotspot-only scene, save/reopen, export/import, hybrid/distractor behavior, 50 assets, old scene compatibility and responsive gameplay.
- tests/spy-delta5.html passed for portrait/landscape scenes at desktop/tablet/mobile portrait/mobile landscape sizes: gameplay, nearby targets, resize, zoom, right-drag pan, normalized object movement, hotspot drawing, save/reopen, width fit and 20 Prompts.
- tests/editors-responsive.html passed at 390px for Scene, Bridges, Sentence Correction and Card Decks.
- tests/spy-pointer.html passed mouse/touch PointerEvent streams: continuous offset, drag suppression, deliberate confirmation and cancellation.
- tests/scene-workflow51.html passed file/paste/drop/URL inputs, two Prompt contexts, shared-object links, touch pan/move, ratio-preserving resize, unsaved actual-game preview, Done, coordinate round trip and direct navigation.
- Manual browser interaction: uploaded the supplied playground reference, created a hotspot with mouse drag, opened actual-game preview, dragged the magnifier and verified progress stayed 0 / 1. Inspected both editor stages. Reference artwork was used locally for verification, not bundled as a game asset.
- Successful final workflow browser run had no console errors.

## Limits of verification
Touch interactions were checked using browser PointerEvent streams, not a physical phone. Image URL imports still depend on the remote site's CORS policy; errors leave the editor usable. No cloud/GitHub publication is included in this local build.

## Run and manual check
With Node.js installed, open a terminal in this folder and run `node serve.mjs`. Open http://127.0.0.1:4173/ (keep the same browser/origin to retain local content).

I Spy → Create Scene → enter name/background/Prompts/images → Next → Select Elements / Add Hotspot → Preview → Close preview → Done → Return to I Spy → Play. Reopen the saved scene from My Content to check persistence. Mouse-wheel or right-button drag scrolls large scenes; on touch, swipe the background, tap an object to select it, then drag it.

Do not open the HTML directly via file://: the app uses ES modules and browser storage.
