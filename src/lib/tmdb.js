import { genresFromIds, genresFromDetails } from './genres';

const BASE = 'https://api.themoviedb.org/3';
const KEY = (process.env.REACT_APP_TMDB_API || process.env.REACT_APP_TMDB_KEY || '').trim();
export const hasApiKey = KEY.length > 0;
// v3 keys are 32 characters. v4 read tokens are long JWTs sent as a Bearer header.
const IS_TOKEN = KEY.length > 60;

export class TmdbError extends Error {
  constructor(code, status) {
    super(code);
    this.name = 'TmdbError';
    this.code = code;
    this.status = status;
  }
}

export function describeError(err) {
  switch (err && err.code) {
    case 'missing-key': return 'The TMDB API key is not set up yet.';
    case 'auth': return 'TMDB rejected the API key. Check REACT_APP_TMDB_API.';
    case 'not-found': return 'TMDB has no record of this title.';
    case 'rate': return 'TMDB is limiting requests right now. Wait a moment and retry.';
    case 'network': return 'Could not reach TMDB. Check your connection and retry.';
    default: return 'Something went wrong while talking to TMDB.';
  }
}

// Tiny in-memory cache that also de-duplicates requests that are already in flight.
const cache = new Map();
const TTL = 10 * 60 * 1000;

function request(path, params = {}) {
  if (!hasApiKey) return Promise.reject(new TmdbError('missing-key'));
  const url = new URL(BASE + path);
  const query = { language: 'en-US', ...params };
  if (!IS_TOKEN) query.api_key = KEY;
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  });
  const id = url.toString();
  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < TTL) return hit.promise;

  // No custom headers with a v3 key, so the browser skips the CORS preflight.
  const init = IS_TOKEN ? { headers: { Authorization: `Bearer ${KEY}`, accept: 'application/json' } } : undefined;
  const promise = fetch(id, init)
    .catch(() => { throw new TmdbError('network'); })
    .then((res) => {
      if (res.status === 401) throw new TmdbError('auth', 401);
      if (res.status === 404) throw new TmdbError('not-found', 404);
      if (res.status === 429) throw new TmdbError('rate', 429);
      if (!res.ok) throw new TmdbError('http', res.status);
      return res.json();
    });
  cache.set(id, { at: Date.now(), promise });
  promise.catch(() => cache.delete(id));
  return promise;
}

export const imageUrl = (path, size = 'w342') => (path ? `https://image.tmdb.org/t/p/${size}${path}` : '');

const yearOf = (d) => (d || '').slice(0, 4);
const round1 = (n) => Math.round((Number(n) || 0) * 10) / 10;

export function makeItem({ type, id, title, date, poster, backdrop, overview, rating, genres }) {
  return {
    key: `${type}-${id}`,
    id: Number(id),
    type,
    title: title || 'Untitled',
    year: yearOf(date),
    poster: poster || null,
    backdrop: backdrop || null,
    overview: overview || '',
    rating: round1(rating),
    genres: genres || [],
  };
}

export function fromSummary(raw, fallbackType = 'movie') {
  const type = raw.media_type === 'tv' || raw.media_type === 'movie' ? raw.media_type : fallbackType;
  return makeItem({
    type,
    id: raw.id,
    title: raw.title || raw.name,
    date: raw.release_date || raw.first_air_date,
    poster: raw.poster_path,
    backdrop: raw.backdrop_path,
    overview: raw.overview,
    rating: raw.vote_average,
    genres: genresFromIds(raw.genre_ids),
  });
}

function fromDetails(raw, type) {
  const base = makeItem({
    type,
    id: raw.id,
    title: raw.title || raw.name,
    date: raw.release_date || raw.first_air_date,
    poster: raw.poster_path,
    backdrop: raw.backdrop_path,
    overview: raw.overview,
    rating: raw.vote_average,
    genres: genresFromDetails(raw.genres),
  });
  const runtime = type === 'movie'
    ? raw.runtime
    : (raw.episode_run_time && raw.episode_run_time[0]) || (raw.last_episode_to_air && raw.last_episode_to_air.runtime) || null;
  return {
    ...base,
    runtime: runtime || null,
    episodes: raw.number_of_episodes || null,
    seasons: raw.number_of_seasons || null,
    tagline: raw.tagline || '',
    statusText: raw.status || '',
    votes: raw.vote_count || 0,
  };
}

function richParts(raw, type) {
  const credits = raw.credits || {};
  const cast = (credits.cast || []).slice(0, 14).map((p) => ({
    id: p.id, name: p.name, role: p.character || '', photo: p.profile_path || null,
  }));
  const directors = type === 'movie'
    ? (credits.crew || []).filter((c) => c.job === 'Director').map((c) => c.name)
    : (raw.created_by || []).map((c) => c.name);
  const vids = ((raw.videos && raw.videos.results) || []).filter((v) => v.site === 'YouTube');
  const vid = vids.find((v) => v.type === 'Trailer' && v.official)
    || vids.find((v) => v.type === 'Trailer')
    || vids.find((v) => v.type === 'Teaser')
    || null;
  return {
    cast,
    directors: [...new Set(directors)].slice(0, 3),
    trailer: vid ? { key: vid.key, name: vid.name } : null,
    providers: (raw['watch/providers'] && raw['watch/providers'].results) || {},
    recommendations: ((raw.recommendations && raw.recommendations.results) || [])
      .filter((r) => !r.media_type || r.media_type === 'movie' || r.media_type === 'tv')
      .slice(0, 14)
      .map((r) => fromSummary(r, type)),
  };
}

const onlyTitles = (results) => (results || [])
  .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
  .map((r) => fromSummary(r));

export async function searchMulti(query) {
  const data = await request('/search/multi', { query, include_adult: 'false' });
  return onlyTitles(data.results);
}

export async function getTrending() {
  const data = await request('/trending/all/week');
  return onlyTitles(data.results).slice(0, 14);
}

// Light call used for background enrichment and shared lists (runtime + genres).
export async function getBasic(type, id) {
  return fromDetails(await request(`/${type}/${id}`), type);
}

// Everything the details page needs in a single request.
export async function getDetails(type, id) {
  const raw = await request(`/${type}/${id}`, {
    append_to_response: 'credits,videos,watch/providers,recommendations',
    include_video_language: 'en,null',
  });
  return { ...fromDetails(raw, type), ...richParts(raw, type) };
}

// Fields we keep in the library (small on purpose).
export function toStorable(d) {
  const { key, id, type, title, year, poster, backdrop, overview, rating, genres, runtime, episodes, seasons } = d;
  return { key, id, type, title, year, poster, backdrop, overview, rating, genres, runtime, episodes, seasons, enriched: true };
}

export function enrichPatch(d) {
  const patch = { enriched: true, runtime: d.runtime, episodes: d.episodes, seasons: d.seasons };
  if (d.genres && d.genres.length) patch.genres = d.genres;
  if (d.backdrop) patch.backdrop = d.backdrop;
  if (d.poster) patch.poster = d.poster;
  return patch;
}
