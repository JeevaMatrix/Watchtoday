const byNum = (get, dir) => (a, b) => {
  const x = get(a);
  const y = get(b);
  const xn = x === null || x === undefined || Number.isNaN(x);
  const yn = y === null || y === undefined || Number.isNaN(y);
  if (xn && yn) return 0;
  if (xn) return 1;
  if (yn) return -1;
  return dir === 'asc' ? x - y : y - x;
};

export const SORTS = [
  { id: 'added-desc', label: 'Recently added', fn: byNum((i) => i.addedAt, 'desc') },
  { id: 'added-asc', label: 'Oldest added', fn: byNum((i) => i.addedAt, 'asc') },
  { id: 'title-asc', label: 'Title A to Z', fn: (a, b) => a.title.localeCompare(b.title) },
  { id: 'year-desc', label: 'Newest release', fn: byNum((i) => Number(i.year) || null, 'desc') },
  { id: 'year-asc', label: 'Oldest release', fn: byNum((i) => Number(i.year) || null, 'asc') },
  { id: 'rating-desc', label: 'Highest rated', fn: byNum((i) => i.rating || null, 'desc') },
  { id: 'runtime-asc', label: 'Shortest first', fn: byNum((i) => i.runtime, 'asc') },
  { id: 'runtime-desc', label: 'Longest first', fn: byNum((i) => i.runtime, 'desc') },
  { id: 'mine-desc', label: 'My rating', fn: byNum((i) => i.myRating || null, 'desc') },
];

export const DEFAULT_FILTERS = { q: '', status: 'all', type: 'all', genres: [], sort: 'added-desc' };

export function applyFilters(items, { q, status, type, genres, sort }) {
  const needle = (q || '').trim().toLowerCase();
  const out = items.filter((i) => (
    (status === 'all' || i.status === status)
    && (type === 'all' || i.type === type)
    && genres.every((g) => i.genres.includes(g))
    && (!needle || i.title.toLowerCase().includes(needle) || i.genres.some((g) => g.toLowerCase().includes(needle)))
  ));
  const sorter = (SORTS.find((s) => s.id === sort) || SORTS[0]).fn;
  return out.sort(sorter);
}

export function genreCounts(items, selected = []) {
  const map = new Map();
  items.forEach((i) => i.genres.forEach((g) => map.set(g, (map.get(g) || 0) + 1)));
  selected.forEach((g) => { if (!map.has(g)) map.set(g, 0); });
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
