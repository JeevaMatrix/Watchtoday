export function formatRuntime(min) {
  const m = Math.round(Number(min));
  if (!m) return '';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
}

export const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export function daysSince(ts, now = Date.now()) {
  return Math.max(0, Math.floor((now - ts) / 86400000));
}

let regionNames;
export function regionName(code) {
  try {
    regionNames = regionNames || new Intl.DisplayNames(['en'], { type: 'region' });
    return regionNames.of(code) || code;
  } catch (e) {
    return code;
  }
}

export function formatDate(ts) {
  try {
    return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) {
    return '';
  }
}

export function libraryStats(items) {
  const s = { total: items.length, want: 0, watching: 0, watched: 0, backlogMin: 0 };
  for (const i of items) {
    s[i.status] += 1;
    if (i.status !== 'watched' && i.runtime) {
      s.backlogMin += i.type === 'tv' && i.episodes ? i.runtime * i.episodes : i.runtime;
    }
  }
  return s;
}
