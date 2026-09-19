# WatchList v2

Movies and shows you want to watch, with genres on every card, where-to-watch, a "pick for tonight" ticket and share links.
React (CRA) + vanilla CSS. No backend: your list lives in the browser and TMDB is called directly.

## Run it

```bash
npm install
cp .env.example .env.local     # then paste your TMDB key
npm start
```

`REACT_APP_TMDB_API` accepts the v3 API key or the v4 read access token. It is the same variable name your old
site used, so your Netlify environment variable keeps working (redeploy after changing it).

## Before you deploy (5 minutes)

1. **`src/config.js`**: set `contactEmail` (shown on Privacy, Terms, About, Credits) and check the `github` URL.
2. **TMDB logo**: download the official logo from https://www.themoviedb.org/about/logos-attribution, save it as
   `public/tmdb-logo.svg` and set `TMDB_LOGO_SRC = '/tmdb-logo.svg'` in `src/config.js`. The text notice is already in the footer.
3. Read the legal pages once and edit anything that is not true for your setup (for example if you add analytics).
4. Netlify: build command `npm run build`, publish directory `build` (already in `netlify.toml`).

## What is where

| Feature | Files |
|---|---|
| Genre tags, filters, sorting | `components/TitleCard.js`, `LibraryToolbar.js`, `hooks/useLibraryFilters.js`, `lib/filter.js` |
| Details, cast, trailer, where to watch | `pages/Details.js`, `components/Providers.js`, `TrailerModal.js` |
| Pick for tonight (ticket) | `pages/Tonight.js`, `components/Ticket.js`, `Suggestions.js`, `lib/pick.js` |
| Share links and movie-night matches | `components/ShareDialog.js`, `pages/Share.js`, `lib/share.js` |
| Backup, restore, CSV, old-list migration | `pages/Settings.js`, `lib/storage.js` |
| Legal pages | `pages/legal/*`, `pages/About.js` |
| TMDB client (cache, v3/v4 key) | `lib/tmdb.js` |

## Notes

- Your old list (`mylist` in localStorage) is migrated automatically on first load and left untouched as a safety copy.
- Runtimes for older titles are filled in the background, one request at a time.
- Share links keep the list inside the URL after `#`, up to 150 titles. There is no server, so link previews cannot show the list.
- Tests: `npm test`.
- TMDB's free API is for non-commercial use. Ads, paid tiers or affiliate links need a commercial agreement with TMDB first.
