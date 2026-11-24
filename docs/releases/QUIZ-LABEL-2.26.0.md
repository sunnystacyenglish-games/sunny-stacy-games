# 2.26.0 — Quiz and Label It!

Quiz supports single choice, multiple choice and True / False in Tic-Tac-Toe, Board Race and CHOMP. Done / Continue checks the answer before completing the task. Answer images appear above text; ordinary words remain whole.

Label It! adds image zones, accepted answer variants, Check All and Instant Check. Revealed zones remain visible until restart.

Verification: Quiz/Label model, library routing, task and updates tests passed. Browser checks covered game integration, reveal/retry, editor save/reload, duplicate/export/import, zones and responsive layouts. Physical touch and mobile keyboard behaviour were not verified.

Repository cleanup: historical documents now live in docs/releases and docs/guides. Root test copies were removed in favour of tests/. The obsolete wordly implementation was replaced by a redirect preserving query parameters and fragment. Repeated CHOMP tooth images retain their layer-specific filenames because the character loader uses those identities.

High Stakes is excluded from this release.
