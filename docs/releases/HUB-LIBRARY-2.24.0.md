# Hub and My Content — 2.24.0

## Changes

- Hub uses one ordered game catalog: three columns on desktop and two on phones. Existing illustrations, game URLs, typography and theme are retained.
- Compact own-content banner, three user-benefit updates, combined contacts/footer. Detailed history/issues/roadmap remain on Updates; old home hashes redirect there.
- My Content cards expose Edit / Edit a copy and Use in game. Only compatible games are offered; all open existing setup before Play.
- Card Decks → Board Race selects every source deck when there are 1–5. Legacy materials with more than five retain manual selection. Tic-Tac-Toe selects the material and asks for a deck.
- Global search spans folders and displays locations. Clearing search/type returns to the previous folder and retains sorting. Mobile Filters preserves values when collapsed.
- Export explanation and five readable Create options. Repository, stored records, IDs and media architecture unchanged.
- `updates.json` supports optional `homeSummary` for short Hub copy; full titles/descriptions and publication rules remain intact. Existing remote history was preserved.

## Verification performed

- All 35 Node test suites listed in package.json passed (including new compatibility, launch URL and global-search tests). The feed regression previously assumed exactly one update; it now verifies the actual curated feed against the existing publication/default rules while retaining draft/status/malformed-data cases.
- Browser `tests/hub-library.html`: 6/7/8/9 cards at 1180/768/390/320px, 3/2 columns, left-aligned incomplete rows, long game names, no horizontal overflow.
- Browser: global folder search, type/sort combination, empty-state reset to folder, export help, five Create routes, mobile filter retention and responsive library.
- Real Board Race setup received exactly both source decks. Real Tic-Tac-Toe setup received the source material, with Choose a deck and disabled Play until selection.
- Export with image assets and the real Import JSON handler produced an independent record, preserving the source record. Test copy removed only on isolated port 4180.
- Mobile bottom-sheet game chooser, keyboard Escape/focus return and visible keyboard focus inspected. Final mobile search is 16px and 42px high. Browser warning/error log was empty on the final regression run.
- Screenshots: companion `hub-library-24` output folder. Desktop and mobile were rendered in Chromium; physical touch devices/ClassIn were not tested.

## Run and manually check

Unzip the complete archive, open a terminal in `sunny-stacy-games`, run `node serve.mjs`, then visit http://127.0.0.1:4173/ . No npm dependencies are required. Run `npm test` where npm is installed, or run the Node commands listed in package.json directly.

1. Open Hub; inspect the six games and compact footer links.
2. Open My Content. Search for a material stored in another folder; combine type/sort; clear and confirm the previous folder returns.
3. Choose Use in game on a Card Deck document with up to five decks → Board Race. Confirm all source decks are checked in setup; press Play only when ready.
4. Open mobile-width My Content; expand/collapse Filters, open Create and the export explanation, and open the bottom-sheet game picker.

Browser regression uses the existing `library8-*` fixtures on isolated port 4180. It must never be run against teacher data on port 4173. Storage remains browser-local; exporting/importing is still required to move material between origins/devices.
