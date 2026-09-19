import { genresFromIds } from './genres';

export const LIB_KEY = 'watchlist:v2';
export const OLD_KEY = 'mylist'; // the previous version of the site
export const SETTINGS_KEY = 'watchlist:settings';
export const SHARE_NAME_KEY = 'watchlist:sharename';

export const STATUSES = ['want', 'watching', 'watched'];
export const STATUS_LABEL = { want: 'Want to watch', watching: 'Watching', watched: 'Watched' };
export const STATUS_SHORT = { want: 'To watch', watching: 'Watching', watched: 'Watched' };

const num = (v) => (v !== null && v !== undefined && v !== '' && Number.isFinite(Number(v)) ? Number(v) : null);

// Accepts new records, old-site records (poster_path, genre_ids, boolean status) and TMDB objects.
export function sanitizeItem(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const id = Number(raw.id);
  if (!Number.isFinite(id) || id <= 0) return null;
  const type = raw.type === 'tv' || raw.media_type === 'tv' ? 'tv' : 'movie';
  const genres = Array.isArray(raw.genres)
    ? raw.genres.filter((g) => typeof g === 'string')
    : genresFromIds(raw.genre_ids || []);
  const status = STATUSES.includes(raw.status) ? raw.status : raw.status === true ? 'watched' : 'want';
  const addedAt = Number(raw.addedAt) || Date.now();
  const myRating = Math.max(0, Math.min(5, Math.round(Number(raw.myRating) || 0)));
  return {
    key: `${type}-${id}`,
    id,
    type,
    title: String(raw.title || raw.name || 'Untitled'),
    year: String(raw.year || (raw.release_date || raw.first_air_date || '').slice(0, 4) || ''),
    poster: raw.poster ?? raw.poster_path ?? null,
    backdrop: raw.backdrop ?? raw.backdrop_path ?? null,
    overview: String(raw.overview || ''),
    rating: Math.round((Number(raw.rating ?? raw.vote_average) || 0) * 10) / 10,
    genres,
    runtime: num(raw.runtime),
    episodes: num(raw.episodes),
    seasons: num(raw.seasons),
    status,
    myRating,
    note: String(raw.note || '').slice(0, 600),
    addedAt,
    watchedAt: status === 'watched' ? Number(raw.watchedAt) || addedAt : null,
    enriched: Boolean(raw.enriched),
  };
}

function parseList(text) {
  try {
    const data = JSON.parse(text);
    return Array.isArray(data) ? data : null;
  } catch (e) {
    return null;
  }
}

function dedupe(items) {
  const seen = new Set();
  return items.filter((i) => (seen.has(i.key) ? false : seen.add(i.key)));
}

// Old site stored movies with no timestamps: keep their order by spacing addedAt by a second.
function migrateLegacy(list) {
  const base = Date.now() - list.length * 1000;
  return dedupe(list.map((raw, idx) => sanitizeItem({ ...raw, addedAt: base + idx * 1000 })).filter(Boolean));
}

export function loadLibrary() {
  try {
    const current = parseList(localStorage.getItem(LIB_KEY));
    if (current) return { items: dedupe(current.map(sanitizeItem).filter(Boolean)), migrated: 0 };
    const old = parseList(localStorage.getItem(OLD_KEY));
    if (old && old.length) {
      const items = migrateLegacy(old);
      return { items, migrated: items.length };
    }
  } catch (e) {
    /* storage blocked */
  }
  return { items: [], migrated: 0 };
}

export function saveLibrary(items) {
  try {
    localStorage.setItem(LIB_KEY, JSON.stringify(items));
  } catch (e) {
    /* quota or blocked: the list keeps working for this session */
  }
}

export function readJSON(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    /* ignore */
  }
}

export function exportJSON(items) {
  return JSON.stringify({ app: 'watchlist', version: 2, exportedAt: new Date().toISOString(), items }, null, 2);
}

export function parseImport(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error('That file is not valid JSON.');
  }
  const list = Array.isArray(data) ? data : data && Array.isArray(data.items) ? data.items : null;
  if (!list) throw new Error('No list found in this file. Use a backup exported from WatchList.');
  const legacy = list.length > 0 && list.every((r) => r && typeof r.status === 'boolean');
  const items = legacy ? migrateLegacy(list) : dedupe(list.map(sanitizeItem).filter(Boolean));
  if (!items.length) throw new Error('The file has no titles we can read.');
  return items;
}

const csvCell = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function toCSV(items) {
  const head = ['Title', 'Type', 'Year', 'Status', 'Genres', 'Runtime (min)', 'TMDB rating', 'My rating', 'Added', 'Watched', 'Notes'];
  const rows = items.map((i) => [
    i.title, i.type === 'tv' ? 'Series' : 'Movie', i.year, STATUS_LABEL[i.status], i.genres.join('; '),
    i.runtime ?? '', i.rating || '', i.myRating || '',
    new Date(i.addedAt).toISOString().slice(0, 10), i.watchedAt ? new Date(i.watchedAt).toISOString().slice(0, 10) : '', i.note,
  ]);
  return [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\n');
}
