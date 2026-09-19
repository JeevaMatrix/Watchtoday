import { useEffect, useRef, useState } from 'react';
import { useLibrary } from '../state/LibraryContext';
import { enrichPatch, getBasic, hasApiKey } from '../lib/tmdb';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Fills in runtime and genres for saved titles that don't have them yet (old-site imports,
// for example). One request at a time, so it stays well inside TMDB's rate limits.
export default function Enricher() {
  const { items, patch } = useLibrary();
  const busy = useRef(false);
  const alive = useRef(true);
  const failed = useRef(new Set());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  useEffect(() => {
    if (!hasApiKey || busy.current) return;
    const next = items.find((i) => !i.enriched && !failed.current.has(i.key));
    if (!next) return;
    busy.current = true;
    (async () => {
      try {
        const d = await getBasic(next.type, next.id);
        if (alive.current) patch(next.key, enrichPatch(d));
      } catch (e) {
        failed.current.add(next.key);
        if (e && e.code === 'not-found' && alive.current) patch(next.key, { enriched: true });
      }
      await wait(200);
      busy.current = false;
      if (alive.current) setTick((t) => t + 1);
    })();
  }, [items, patch, tick]);

  return null;
}
