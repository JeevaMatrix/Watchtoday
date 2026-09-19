import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { LIB_KEY, loadLibrary, saveLibrary, sanitizeItem } from '../lib/storage';
import { plural } from '../lib/format';
import { useToast } from './ToastContext';

const Ctx = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'replace':
      return action.items;
    case 'add':
    case 'restore':
      return state.some((i) => i.key === action.item.key) ? state : [...state, action.item];
    case 'remove':
      return state.filter((i) => i.key !== action.key);
    case 'update':
      return state.map((i) => (i.key === action.key ? { ...i, ...action.patch } : i));
    case 'status':
      return state.map((i) => (i.key === action.key
        ? { ...i, status: action.status, watchedAt: action.status === 'watched' ? i.watchedAt || action.now : null }
        : i));
    case 'merge': {
      const have = new Set(state.map((i) => i.key));
      const fresh = action.items.filter((i) => !have.has(i.key));
      return fresh.length ? [...state, ...fresh] : state;
    }
    default:
      return state;
  }
}

export function LibraryProvider({ children }) {
  const [initial] = useState(loadLibrary);
  const [items, dispatch] = useReducer(reducer, initial.items);
  const { toast } = useToast();
  const ref = useRef(items);
  ref.current = items;
  const announced = useRef(false);

  useEffect(() => { saveLibrary(items); }, [items]);

  useEffect(() => {
    if (initial.migrated > 0 && !announced.current) {
      announced.current = true;
      toast(`Moved ${plural(initial.migrated, 'title')} over from your old list.`);
    }
  }, [initial.migrated, toast]);

  // Keep several open tabs in sync.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== LIB_KEY || !e.newValue) return;
      try {
        dispatch({ type: 'replace', items: JSON.parse(e.newValue).map(sanitizeItem).filter(Boolean) });
      } catch (err) { /* ignore */ }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const byKey = useMemo(() => new Map(items.map((i) => [i.key, i])), [items]);

  const add = useCallback((item, status = 'want') => {
    const now = Date.now();
    const full = sanitizeItem({ ...item, status, addedAt: now, watchedAt: status === 'watched' ? now : null });
    if (full) dispatch({ type: 'add', item: full });
    return full;
  }, []);

  const addMany = useCallback((list, status = 'want') => {
    const have = new Set(ref.current.map((i) => i.key));
    const base = Date.now();
    const fresh = list
      .filter((i) => !have.has(i.key))
      .map((i, idx) => sanitizeItem({ ...i, status, addedAt: base + idx, watchedAt: null }))
      .filter(Boolean);
    if (fresh.length) dispatch({ type: 'merge', items: fresh });
    return fresh.length;
  }, []);

  const remove = useCallback((key) => {
    const removed = ref.current.find((i) => i.key === key) || null;
    dispatch({ type: 'remove', key });
    return removed;
  }, []);

  const restore = useCallback((item) => item && dispatch({ type: 'restore', item }), []);
  const setStatus = useCallback((key, status) => dispatch({ type: 'status', key, status, now: Date.now() }), []);
  const patch = useCallback((key, p) => dispatch({ type: 'update', key, patch: p }), []);
  const setMyRating = useCallback((key, n) => patch(key, { myRating: n }), [patch]);
  const setNote = useCallback((key, note) => patch(key, { note: String(note).slice(0, 600) }), [patch]);

  const importItems = useCallback((list, mode = 'merge') => {
    const have = new Set(ref.current.map((i) => i.key));
    const added = list.filter((i) => !have.has(i.key)).length;
    dispatch(mode === 'replace' ? { type: 'replace', items: list } : { type: 'merge', items: list });
    return added;
  }, []);

  const clearAll = useCallback(() => dispatch({ type: 'replace', items: [] }), []);

  const value = useMemo(() => ({
    items, byKey, get: (key) => byKey.get(key), has: (key) => byKey.has(key),
    add, addMany, remove, restore, setStatus, patch, setMyRating, setNote, importItems, clearAll,
  }), [items, byKey, add, addMany, remove, restore, setStatus, patch, setMyRating, setNote, importItems, clearAll]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useLibrary = () => useContext(Ctx);
