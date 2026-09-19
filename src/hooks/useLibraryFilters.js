import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { STATUSES } from '../lib/storage';
import { DEFAULT_FILTERS, SORTS, applyFilters, genreCounts } from '../lib/filter';

const oneOf = (v, list, fallback) => (list.includes(v) ? v : fallback);

function parse(params) {
  return {
    q: params.get('q') || '',
    status: oneOf(params.get('s'), ['all', ...STATUSES], 'all'),
    type: oneOf(params.get('t'), ['all', 'movie', 'tv'], 'all'),
    genres: (params.get('g') || '').split(',').filter(Boolean),
    sort: oneOf(params.get('o'), SORTS.map((s) => s.id), DEFAULT_FILTERS.sort),
  };
}

function serialize(f) {
  const p = new URLSearchParams();
  if (f.q) p.set('q', f.q);
  if (f.status !== 'all') p.set('s', f.status);
  if (f.type !== 'all') p.set('t', f.type);
  if (f.genres.length) p.set('g', f.genres.join(','));
  if (f.sort !== DEFAULT_FILTERS.sort) p.set('o', f.sort);
  return p;
}

// urlSync=true keeps filters in the query string so Back returns to the same view.
// The share page passes false because setSearchParams would drop the #data part of its link.
export default function useLibraryFilters(items, { urlSync = true } = {}) {
  const [params, setParams] = useSearchParams();
  const [local, setLocal] = useState(DEFAULT_FILTERS);
  const filters = urlSync ? parse(params) : local;

  const update = useCallback((patch) => {
    const next = { ...filters, ...patch };
    if (urlSync) setParams(serialize(next), { replace: true });
    else setLocal(next);
  }, [filters, urlSync, setParams]);

  const clear = useCallback(() => update({ ...DEFAULT_FILTERS, sort: filters.sort }), [update, filters.sort]);

  const toggleGenre = useCallback((name) => {
    update({ genres: filters.genres.includes(name) ? filters.genres.filter((g) => g !== name) : [...filters.genres, name] });
  }, [update, filters.genres]);

  const filtered = useMemo(() => applyFilters(items, filters), [items, filters]);

  const counts = useMemo(() => {
    const base = applyFilters(items, { ...filters, status: 'all' });
    const c = { all: base.length, want: 0, watching: 0, watched: 0 };
    base.forEach((i) => { c[i.status] += 1; });
    return c;
  }, [items, filters]);

  const genres = useMemo(() => genreCounts(items, filters.genres), [items, filters.genres]);
  const active = Boolean(filters.q || filters.status !== 'all' || filters.type !== 'all' || filters.genres.length);

  return { filters, update, clear, toggleGenre, filtered, counts, genres, active };
}
