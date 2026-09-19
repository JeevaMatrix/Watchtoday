import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../components/Icons';
import TitleCard, { CardSkeleton } from '../components/TitleCard';
import LibraryToolbar from '../components/LibraryToolbar';
import EmptyState from '../components/EmptyState';
import SetupNotice from '../components/SetupNotice';
import useLibraryFilters from '../hooks/useLibraryFilters';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useLibrary } from '../state/LibraryContext';
import { useToast } from '../state/ToastContext';
import { decodeShare } from '../lib/share';
import { getBasic, hasApiKey } from '../lib/tmdb';
import { plural } from '../lib/format';

const CONCURRENCY = 6;

export default function SharePage() {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const payload = useMemo(() => decodeShare(hash), [hash]);
  useDocumentTitle(payload ? payload.name || 'Shared list' : 'Shared list');
  const lib = useLibrary();
  const { toast } = useToast();
  const [meta, setMeta] = useState({});
  const [failed, setFailed] = useState(0);
  const [view, setView] = useState('all');

  useEffect(() => {
    if (!payload || !hasApiKey) return undefined;
    let cancelled = false;
    setMeta({});
    setFailed(0);
    setView('all');
    const queue = [...payload.items];
    const worker = async () => {
      while (queue.length && !cancelled) {
        const entry = queue.shift();
        try {
          const d = await getBasic(entry.type, entry.id);
          if (!cancelled) setMeta((m) => ({ ...m, [entry.key]: d }));
        } catch (e) {
          if (!cancelled) setFailed((n) => n + 1);
        }
      }
    };
    for (let i = 0; i < CONCURRENCY; i += 1) worker();
    return () => { cancelled = true; };
  }, [payload]);

  const shared = useMemo(() => (payload
    ? payload.items
      .map((e, idx) => (meta[e.key] ? { ...meta[e.key], status: e.status, addedAt: payload.items.length - idx, myRating: 0 } : null))
      .filter(Boolean)
    : []), [payload, meta]);

  // Titles both of you still want to see.
  const matches = useMemo(() => shared.filter((i) => {
    const mine = lib.get(i.key);
    return mine && mine.status !== 'watched' && i.status !== 'watched';
  }), [shared, lib]);

  const visible = view === 'matches' ? matches : shared;
  const f = useLibraryFilters(visible, { urlSync: false });

  if (!payload) {
    return (
      <div className="wrap page">
        <EmptyState
          title="This link doesn’t hold a list"
          actions={<Link className="btn btn--primary" to="/">Go to your library</Link>}
        >
          It may have been cut off when it was copied. Ask for the link again.
        </EmptyState>
      </div>
    );
  }

  const total = payload.items.length;
  const pending = Math.max(0, total - shared.length - failed);
  const missing = shared.filter((i) => !lib.has(i.key));

  const addAll = () => {
    const n = lib.addMany(missing, 'want');
    toast(n ? `Added ${plural(n, 'title')} to your list` : 'Everything here is already in your list');
  };
  const surprise = () => {
    if (!matches.length) return;
    const pick = matches[Math.floor(Math.random() * matches.length)];
    navigate(`/title/${pick.type}/${pick.id}`);
  };

  return (
    <div className="wrap page">
      <header className="page__head">
        <div>
          <h1 className="h-page">{payload.name || 'Shared list'}</h1>
          <p className="muted">
            A list shared with you, {plural(total, 'title')}. The status on each poster is theirs.
          </p>
        </div>
        <div className="page__actions">
          <button type="button" className="btn btn--primary" onClick={addAll} disabled={pending > 0 || missing.length === 0}>
            <Icon name="plus" size={18} /> Add all to my list
          </button>
        </div>
      </header>

      <SetupNotice />

      {hasApiKey && (
        <>
          <div className="tabs" role="tablist" aria-label="View">
            <button type="button" role="tab" aria-selected={view === 'all'} className={`tab${view === 'all' ? ' is-active' : ''}`} onClick={() => setView('all')}>
              Their list <span className="tab__count">{total}</span>
            </button>
            <button type="button" role="tab" aria-selected={view === 'matches'} className={`tab${view === 'matches' ? ' is-active' : ''}`} onClick={() => setView('matches')}>
              <Icon name="users" size={16} /> Movie night matches <span className="tab__count">{matches.length}</span>
            </button>
          </div>

          {view === 'matches' && (
            <div className="notice notice--soft">
              <p>Titles that are on both lists and that neither of you has watched yet.</p>
              {matches.length > 0 && (
                <button type="button" className="btn btn--ghost btn--sm" onClick={surprise}>
                  <Icon name="dice" size={16} /> Surprise us
                </button>
              )}
            </div>
          )}

          {pending > 0 && <p className="muted" aria-live="polite">Loading titles, {shared.length} of {total}…</p>}
          {failed > 0 && pending === 0 && <p className="muted">{plural(failed, 'title')} could not be loaded.</p>}

          {visible.length > 0 && <LibraryToolbar f={f} showing={f.filtered.length} total={visible.length} />}

          {view === 'matches' && matches.length === 0 && pending === 0 ? (
            <EmptyState title="No matches yet">Nothing on this list is also unwatched on yours. Add a few of their picks and check again.</EmptyState>
          ) : (
            <div className="grid">
              {f.filtered.map((item) => {
                const mine = lib.get(item.key);
                return (
                  <TitleCard
                    key={item.key}
                    item={item}
                    showStatus
                    badge={mine ? 'In your list' : undefined}
                    quick={mine ? undefined : {
                      icon: 'plus',
                      label: `Add ${item.title} to my list`,
                      onClick: () => {
                        lib.add(item, 'want');
                        toast(`Added ${item.title}`, { action: { label: 'Undo', onClick: () => lib.remove(item.key) } });
                      },
                    }}
                  />
                );
              })}
              {view === 'all' && Array.from({ length: Math.min(pending, 12) }).map((_, i) => <CardSkeleton key={`s${i}`} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
