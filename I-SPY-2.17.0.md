# I Spy / Scene Editor — 2.17.0

## Implementation

- The 2× round magnifier renders an inert DOM copy of the original background and placed objects. It uses the original image URLs, without canvas screenshots, thumbnails, CORS pixel reads or separate gameplay state. IDs/focus are removed from the copy. Scene changes refresh its appearance.
- First click/tap positions the lens. A click outside moves it; a click inside confirms its current source region. No double-click timing is used. Object keyboard activation also follows two steps.
- The visible lens radius is divided by magnification before intersecting normalized answer rectangles. Distances are measured in scene pixels so portrait/landscape aspect ratios remain accurate. Off-scene object portions are excluded.
- Only the nearest eligible answer for the current target is confirmed; equal distances preserve authored order. Found answers are skipped; if only an already-found region remains, confirmation is neutral. One action never completes multiple answers.
- Exact answer IDs enter the existing session completion path, avoiding ambiguity between overlapping hotspots. Existing target order, counters, transitions, audio and victory remain intact.
- Lens position is normalized and survives resize. At edges the lens is clipped by the scene rather than shifting its sampling center away from the selected point. The handle is non-interactive and remains inside the scene clipping boundary.
- Scene Editor has 100–400% fit-relative zoom, zoom in/out, Fit to view, Reset view and a separate Pan mode. Background replacement resets the view. Zoom/pan live in editor memory, never in saved content or dirty tracking.
- Canvas size and position are computed separately from authoring coordinates. Dragging, resizing, drawing regions and palette placement continue to map the actual canvas rectangle back into normalized coordinates. Pan intercepts pointer actions before object editing.
- The left workspace and right independently scrolling Targets panel remain. View state survives target changes and editor redraws. Narrow screens stack the two areas. Saved scenes, image storage and content limits remain unchanged.

## Verification

- Full package test suite: passed, including new coordinate and selection tests.
- `scene-view.test.mjs`: 216 inverse coordinate/lens cases, portrait/landscape, zoom, pan limits, letterboxing and invalid input.
- `lens-selection.test.mjs`: nearest answer, stable ties, found filtering, decoy rejection, true source radius, tiny hotspots, transition/completion locks, immutable content.
- Existing I Spy browser regression: passed, with interactions updated to the required two-step selection. Counters, sound calls, replay, missing assets, malformed scenes and unchanged source were checked.
- Existing content/hotspot browser regression: passed. Background-only and hybrid scenes, original image resolution, linked answers, off-scene objects, upload, export/import, 50 palette elements and compact targets were checked.
- New Delta 5 browser fixture: portrait and landscape gameplay at 1000×800, 390×740, 760×420 and 768×1024; relocation, no first-click scoring, nearby hotspots, decoy, repeat, edge, resize and victory. Editor checks include zoom/pan, inverse object drag, hotspot creation while zoomed, target switching, fit/reset, save/reopen and narrow bounds.
- Existing responsive editor checks passed at 390px for Scene, Bridge, Sentence Correction and Card Decks.
- Native mouse clicks confirmed first-click inspection and second-click selection; native drag confirmed Pan. Console inspected for runtime errors.

## Limits of verification

Browser tests ran in the desktop embedded Chromium browser, including narrow viewport simulations. Physical tablet/phone touch, Safari and ClassIn itself were not tested. Test backgrounds are deterministic detailed synthetic images; lesson-specific artwork still benefits from teacher review. Zoom is fit-relative, not a promise that low-resolution source artwork gains detail.

## Run and review

Run `node serve.mjs` from this project and open http://127.0.0.1:4173/.
In My Content, open a Scene, zoom and pan, draw/move a hotspot, save and reopen. Play I Spy: click a detail once to inspect and click inside the lens to confirm. Click elsewhere to move it.

Browser checks: `/tests/spy-delta5.html`, `/tests/i-spy.html`, `/tests/content-scene.html`, `/tests/editors-responsive.html`.
Node checks: `npm test` (or execute the Node commands in package.json).

This local release does not migrate browser data and has not been published to GitHub by this Delta 5 task.
