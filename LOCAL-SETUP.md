# Local preview

Requires Node.js. No dependency installation is needed.

Run `npm start` (or `node scripts/serve.cjs`) from this folder, then open http://localhost:3000.
Stop the server with Ctrl+C. Set the PORT environment variable to use another port.

The public news listing and article viewer read `data/news.json`. The local newsroom saves drafts and published snapshots in `.local/news-workspace.json` and generates both public news JSON files automatically.

The legacy PHP pages are unavailable in this preview. Use `/news-manager.html` for the private local newsroom, or double-click **Start Newsroom.cmd**. See [guide.md](guide.md) for the daily publishing workflow, backups and one-time GitHub Pages setup. No dependency installation is needed.

## Public news archive

Open `/trade-intelligence.html` for all published updates, newest first, nine per page. Keyword search includes title, summary, source, category, and article content. Category and inclusive from/to date filters can be combined. Filters and page number persist in the URL. Undated entries appear last and are excluded by date filters.

Click a card or its Read update link for the short popup. Escape, Close, or clicking the backdrop dismisses it; keyboard focus returns to the original card. Full update links remain available for sharing.

The homepage Latest News carousel uses the six newest published updates and the same popup. It advances every five seconds while visible, pauses on hover/focus and while a popup is open, and includes manual arrows, touch scrolling, and a pause button. Reduced-motion preferences disable autoplay by default. The New badge covers today and the previous six calendar days in Asia/Kolkata; undated or future-dated items are not tagged.

Run `npm test` for sorting, filtering, draft exclusion, and pagination checks. For browser checks with 22 synthetic dated updates, run `node tests/preview-server.cjs` and open `http://localhost:3001/trade-intelligence.html`. This never changes production news data. Stop that test server with Ctrl+C.
