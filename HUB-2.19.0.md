# Hub development updates — 2.19.0

## What changed
- `index.html`: development area below the catalog and content invitation; footer links to Updates and Known Issues. The six game cards and launch links are unchanged.
- `shared/development.js` and `shared/development.css`: compact accessible sections, homepage limits, full history, empty states, responsive layout.
- `updates/index.html`: direct, refreshable history route with a return to Games.
- `shared/development-data.js`: single manually maintained source for updates, knownIssues and roadmap. No backend, runtime GitHub requests, generated dates or automatic status changes.
- `shared/site-content.js` / `shared/home.js`: official social destinations and labelled icons in the existing social area.

## Exact links
Feedback: https://t.me/moreva_anastasia
Telegram channel: https://t.me/sunnystacyenglish
YouTube Shorts: https://www.youtube.com/@sunnystacy.english/shorts
Threads: https://www.threads.com/@sunnystacy.english
Feedback uses ordinary navigation. Social links preserve the existing new-tab behavior with noopener/noreferrer. No message is sent automatically.

## Publication policy
An update is displayed only when both `published` and `verified` are true. Set these manually after deployment and functional checks, not merely after a commit or successful deployment job. Valid dates sort newest first; missing/invalid dates are not replaced with invented dates. Unknown dates sort after dated records. Home shows at most three records; history shows all published records.

Active issue statuses: Known, In Progress, Fix Pending Verification. Fixed issues disappear from the active list. Marking Fixed does NOT generate a release note: add a separately verified, published update explicitly. Unknown statuses are omitted. Roadmap separates In Progress and Coming Next without inferred deadlines.

The initial public feed contains one verified 2.18.0 magnifier fix. Its pointer test was run successfully on the deployed GitHub Pages site. No speculative active bugs or roadmap promises were copied from the examples. Empty states do not claim that the platform is bug-free. This 2.19.0 Hub build is not itself announced as released before deployment.

## Maintainer examples (illustrative only)
Edit arrays in `shared/development-data.js`; no layout changes are needed.

```js
// Add a draft update. After deploying and checking it, fill the real publication
// date and set both flags to true. The ID remains stable.
updates: [{
  id: 'example-improvement', area: 'Hub', type: 'Improved',
  title: 'Short teacher-facing title', description: 'What became easier.',
  published: false, verified: false
}]

// Acknowledge a real reported problem:
knownIssues: [{
  id: 'example-bug', area: 'Affected game', title: 'Short problem title',
  description: 'What the teacher may encounter.', status: 'Known'
}]
// When a candidate fix is ready to check, change this same record:
// status: 'Fix Pending Verification'
// Only after deployment + verification: status: 'Fixed', plus an explicit update.
```

## Verification
All 29 Node test programs passed. Added tests cover publication gates, newest-first sorting, invalid/unknown dates, active issue statuses, explicit release history and roadmap categories.

Browser checks passed:
- Empty states, more than three records, full history, very long titles/descriptions and missing optional fields.
- Hub and Updates at 390, 768 and 1280px with no horizontal overflow.
- Six existing game cards, exact contact/social URLs and catalog priority.
- Hub → history → Games, keyboard Enter navigation and visible focus.
- Local GitHub Pages-style prefix `/sunny-stacy-games/`, history navigation and refresh.
- No console errors in the prefix/history check.
- Catalog markup compared byte-for-byte against 2.18.0: unchanged.

Uses existing light-theme text/links and focus palette. No dark-mode implementation is added. Screen-reader labels inspected through the browser accessibility tree; no physical screen-reader session was performed. External destinations were checked as exact links, not used to send messages or sign in.

## Run / delivery
`node serve.mjs` in this project folder, then http://127.0.0.1:4173/ . History: http://127.0.0.1:4173/updates/ . Standard static files remain compatible with GitHub Pages. This build is local; no new GitHub deployment was performed for Delta 6.
