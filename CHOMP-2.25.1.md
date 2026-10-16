# v2.25.1 — CHOMP Blur and shared Bridges drag-and-drop

- Fixed the shared blur selector so CHOMP Concepts and Cards / Decks receive the same visual blur as existing task containers. Reveal removes blur without advancing the task.
- Added pointer-based dragging of available Bridges options into compatible gaps in the shared presenter used by CHOMP and Board Race. Options from other groups cannot be dropped into a gap. Replacing an answer returns the previous option to the list. All unused options remain visible so successive gaps can be completed by dragging.
- Existing gap-then-option clicks and keyboard activation remain available. Reveal locks both interaction methods. Cancelling or dropping outside a compatible gap preserves the answer; presenter cleanup removes drag previews.
- No author content, IDs, storage schema, grading rules or supported game/content combinations changed.

Validation: CHOMP browser regression includes computed visual blur before and after Reveal; all eight themes, four content types, replay and responsive controls passed. Real pointer drags checked valid and wrong-group drops, successive gaps, keyboard replacement and reveal locking. Cross-game browser regression passed Tic-Tac-Toe Cards / Decks and Sentence Correction plus Board Race Bridges and Sentence Correction in Race and Endless. Node task-model, CHOMP engine, graded movement and gameplay-polish suites passed. Physical touch-device testing is not claimed.
