import { daysSince, plural } from './format';

export const MOODS = [
  { id: 'any', label: 'Surprise me', genres: [] },
  { id: 'laugh', label: 'Make me laugh', genres: ['Comedy'] },
  { id: 'edge', label: 'Keep me guessing', genres: ['Thriller', 'Mystery', 'Crime'] },
  { id: 'big', label: 'Go big', genres: ['Action', 'Adventure', 'Sci-Fi'] },
  { id: 'feels', label: 'Hit me in the feels', genres: ['Drama', 'Romance'] },
  { id: 'scare', label: 'Scare me', genres: ['Horror'] },
  { id: 'easy', label: 'Keep it easy', genres: ['Animation', 'Family', 'Romance', 'Comedy', 'Music'] },
  { id: 'wonder', label: 'Take me somewhere', genres: ['Fantasy', 'Sci-Fi', 'Adventure', 'History'] },
];

export const TIMES = [
  { id: 'any', label: 'Any length', max: Infinity },
  { id: 'short', label: 'Under 100 min', max: 100 },
  { id: 'mid', label: 'Up to 2h 30m', max: 150 },
];

export const KINDS = [
  { id: 'any', label: 'Movie or show' },
  { id: 'movie', label: 'Movie' },
  { id: 'tv', label: 'Show' },
];

export function candidates(items, { mood, time, kind }) {
  const m = MOODS.find((x) => x.id === mood) || MOODS[0];
  const t = TIMES.find((x) => x.id === time) || TIMES[0];
  return items.filter((i) => (
    i.status !== 'watched'
    && (kind === 'any' || i.type === kind)
    && (m.genres.length === 0 || i.genres.some((g) => m.genres.includes(g)))
    && (t.max === Infinity || (i.runtime != null && i.runtime <= t.max))
  ));
}

// Higher weight = more likely to come first. Started titles and long-neglected ones win more often.
export function weight(item, now = Date.now()) {
  let w = 1;
  if (item.status === 'watching') w += 2;
  w += Math.min(daysSince(item.addedAt, now) / 45, 2);
  if (item.rating >= 6) w += Math.min((item.rating - 6) * 0.5, 1.5);
  return w;
}

// Weighted shuffle without replacement (Efraimidis-Spirakis).
export function shuffleWeighted(list, rand = Math.random, now = Date.now()) {
  return list
    .map((item) => ({ item, k: Math.pow(rand(), 1 / weight(item, now)) }))
    .sort((a, b) => b.k - a.k)
    .map((x) => x.item);
}

export function reasonFor(item, now = Date.now()) {
  if (item.status === 'watching') return 'You already started this one. Finish it.';
  const days = daysSince(item.addedAt, now);
  if (days >= 60) return `It has waited ${plural(Math.round(days / 30), 'month')} on your list.`;
  if (days >= 14) return `It has waited ${plural(days, 'day')} on your list.`;
  if (item.rating >= 7.8) return 'Highly rated, and already on your list.';
  return 'Fresh from your list.';
}
