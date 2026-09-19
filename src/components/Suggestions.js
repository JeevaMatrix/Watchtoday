import { useMemo } from 'react';
import TitleCard from './TitleCard';
import useAsync from '../hooks/useAsync';
import { getDetails, hasApiKey } from '../lib/tmdb';
import { useLibrary } from '../state/LibraryContext';
import { useToast } from '../state/ToastContext';

// "Because you liked ..." built from TMDB's own recommendations for titles you rated or finished.
export default function Suggestions() {
  const { items, byKey, add, remove } = useLibrary();
  const { toast } = useToast();

  const seeds = useMemo(() => {
    const done = items.filter((i) => i.status === 'watched');
    const pool = done.length >= 1 ? done : items;
    return [...pool]
      .sort((a, b) => (b.myRating - a.myRating) || ((b.watchedAt || b.addedAt) - (a.watchedAt || a.addedAt)))
      .slice(0, 4);
  }, [items]);
  const seedKey = seeds.map((s) => s.key).join('|');

  const { data, loading } = useAsync(async () => {
    if (!hasApiKey || !seeds.length) return [];
    const results = await Promise.allSettled(seeds.map((s) => getDetails(s.type, s.id)));
    const score = new Map();
    results.forEach((r) => {
      if (r.status !== 'fulfilled') return;
      r.value.recommendations.forEach((rec, idx) => {
        const cur = score.get(rec.key) || { rec, score: 0 };
        cur.score += 2 + rec.rating / 10 - idx * 0.02;
        score.set(rec.key, cur);
      });
    });
    return [...score.values()].sort((a, b) => b.score - a.score).map((x) => x.rec);
  }, [seedKey]);

  if (!hasApiKey || !seeds.length) return null;
  const list = (data || []).filter((r) => !byKey.has(r.key)).slice(0, 12);
  if (!loading && !list.length) return null;

  const names = seeds.slice(0, 2).map((s) => s.title).join(' and ');

  const quickAdd = (item) => ({
    icon: 'plus',
    label: `Add ${item.title} to want to watch`,
    onClick: () => {
      add(item, 'want');
      toast(`Added ${item.title}`, { action: { label: 'Undo', onClick: () => remove(item.key) } });
    },
  });

  return (
    <section className="block" aria-labelledby="sugg-h">
      <div className="block__head">
        <h2 id="sugg-h">Not feeling your list?</h2>
      </div>
      <p className="muted">Because of {names}, TMDB suggests these.</p>
      <div className="shelf">
        {loading && !list.length
          ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="shelf__item"><div className="skel skel--poster" /></div>)
          : list.map((item) => (
            <div key={item.key} className="shelf__item">
              <TitleCard item={item} compact quick={quickAdd(item)} />
            </div>
          ))}
      </div>
    </section>
  );
}
