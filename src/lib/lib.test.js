/* eslint-env jest */
import { decodeShare, encodeShare } from './share';
import { LIB_KEY, OLD_KEY, loadLibrary, parseImport, sanitizeItem, toCSV } from './storage';
import { applyFilters, genreCounts } from './filter';
import { candidates, shuffleWeighted } from './pick';
import { formatRuntime } from './format';
import { genresFromIds } from './genres';

const mk = (over) => sanitizeItem({ id: 1, type: 'movie', title: 'A', genres: [], status: 'want', addedAt: 1, ...over });

beforeEach(() => localStorage.clear());

test('share links round-trip, including unicode names', () => {
  const items = [mk({ id: 550, status: 'watched' }), mk({ id: 1396, type: 'tv', status: 'watching' }), mk({ id: 603 })];
  const hash = `#d=${encodeShare({ name: 'Jeeva’s picks ✨', items })}`;
  const out = decodeShare(hash);
  expect(out.name).toBe('Jeeva’s picks ✨');
  expect(out.items.map((i) => [i.key, i.status])).toEqual([
    ['movie-550', 'watched'], ['tv-1396', 'watching'], ['movie-603', 'want'],
  ]);
});

test('bad share links decode to null instead of throwing', () => {
  expect(decodeShare('')).toBeNull();
  expect(decodeShare('#d=%%%')).toBeNull();
  expect(decodeShare('#d=AAAA')).toBeNull();
});

test('old-site records are migrated with genres, status and order preserved', () => {
  localStorage.setItem(OLD_KEY, JSON.stringify([
    { id: 27205, title: 'Inception', release_date: '2010-07-15', poster_path: '/p.jpg', genre_ids: [28, 878, 12], status: true, overview: 'x' },
    { id: 157336, title: 'Interstellar', release_date: '2014-11-05', poster_path: '/q.jpg', genre_ids: [12, 18, 878], status: false },
  ]));
  const { items, migrated } = loadLibrary();
  expect(migrated).toBe(2);
  expect(items[0]).toMatchObject({ key: 'movie-27205', year: '2010', status: 'watched', genres: ['Action', 'Sci-Fi', 'Adventure'], poster: '/p.jpg' });
  expect(items[1].status).toBe('want');
  expect(items[1].addedAt).toBeGreaterThan(items[0].addedAt);
  expect(localStorage.getItem(OLD_KEY)).not.toBeNull(); // safety copy untouched
});

test('v2 data wins over the old key and is sanitised', () => {
  localStorage.setItem(OLD_KEY, JSON.stringify([{ id: 1, title: 'Old', status: false }]));
  localStorage.setItem(LIB_KEY, JSON.stringify([{ id: 9, type: 'tv', title: 'New', myRating: 99, status: 'nope' }]));
  const { items, migrated } = loadLibrary();
  expect(migrated).toBe(0);
  expect(items).toHaveLength(1);
  expect(items[0]).toMatchObject({ key: 'tv-9', myRating: 5, status: 'want' });
});

test('imports accept backups and old arrays and reject junk', () => {
  expect(parseImport(JSON.stringify({ items: [{ id: 5, title: 'X' }] }))[0].key).toBe('movie-5');
  expect(parseImport(JSON.stringify([{ id: 5, title: 'X', status: false }]))[0].status).toBe('want');
  expect(() => parseImport('nope')).toThrow(/valid JSON/);
  expect(() => parseImport('{"a":1}')).toThrow(/No list/);
});

test('genre filters narrow (AND) and null runtimes sort last', () => {
  const items = [
    mk({ id: 1, title: 'B', genres: ['Action', 'Sci-Fi'], runtime: 120 }),
    mk({ id: 2, title: 'A', genres: ['Action'], runtime: null }),
    mk({ id: 3, title: 'C', genres: ['Action', 'Sci-Fi'], runtime: 90 }),
  ];
  const f = { q: '', status: 'all', type: 'all', genres: ['Action', 'Sci-Fi'], sort: 'runtime-asc' };
  expect(applyFilters(items, f).map((i) => i.id)).toEqual([3, 1]);
  expect(applyFilters(items, { ...f, genres: ['Action'] }).map((i) => i.id)).toEqual([3, 1, 2]);
  expect(genreCounts(items)[0]).toEqual({ name: 'Action', count: 3 });
});

test('tonight candidates skip watched titles and respect time and mood', () => {
  const items = [
    mk({ id: 1, genres: ['Comedy'], runtime: 95 }),
    mk({ id: 2, genres: ['Comedy'], runtime: 130 }),
    mk({ id: 3, genres: ['Horror'], runtime: 90 }),
    mk({ id: 4, genres: ['Comedy'], runtime: 80, status: 'watched' }),
    mk({ id: 5, genres: ['Comedy'], runtime: null }),
  ];
  expect(candidates(items, { mood: 'laugh', time: 'short', kind: 'any' }).map((i) => i.id)).toEqual([1]);
  expect(candidates(items, { mood: 'laugh', time: 'any', kind: 'any' }).map((i) => i.id)).toEqual([1, 2, 5]);
  const shuffled = shuffleWeighted(items.slice(0, 3));
  expect(shuffled.map((i) => i.id).sort()).toEqual([1, 2, 3]);
});

test('formatting helpers', () => {
  expect(formatRuntime(95)).toBe('1h 35m');
  expect(formatRuntime(120)).toBe('2h');
  expect(formatRuntime(45)).toBe('45m');
  expect(genresFromIds([10759, 28])).toEqual(['Action', 'Adventure']);
});

test('CSV export quotes commas and quotes', () => {
  const csv = toCSV([mk({ title: 'Hello, "World"', genres: ['Drama', 'Crime'] })]);
  expect(csv.split('\n')[1]).toContain('"Hello, ""World"""');
  expect(csv).toContain('Drama; Crime');
});
