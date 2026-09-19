import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icons';
import TitleCard from '../components/TitleCard';
import LibraryToolbar from '../components/LibraryToolbar';
import ShareDialog from '../components/ShareDialog';
import EmptyState from '../components/EmptyState';
import useLibraryFilters from '../hooks/useLibraryFilters';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useLibrary } from '../state/LibraryContext';
import { useToast } from '../state/ToastContext';
import { libraryStats, plural } from '../lib/format';

export default function Home() {
  useDocumentTitle('Your library');
  const { items, setStatus } = useLibrary();
  const { toast } = useToast();
  const f = useLibraryFilters(items);
  const [sharing, setSharing] = useState(false);
  const stats = useMemo(() => libraryStats(items), [items]);

  const markWatched = (item) => {
    const previous = item.status;
    setStatus(item.key, 'watched');
    toast(`Marked ${item.title} as watched`, { action: { label: 'Undo', onClick: () => setStatus(item.key, previous) } });
  };

  const left = stats.want + stats.watching;
  const hours = Math.round(stats.backlogMin / 60);
  const summary = stats.total === 0
    ? 'Nothing saved yet.'
    : `${plural(stats.total, 'title')} saved, ${left} still to watch${hours >= 1 ? `, about ${plural(hours, 'hour')} of viewing` : ''}.`;

  return (
    <div className="wrap page">
      <header className="page__head">
        <div>
          <h1 className="h-page">Your library</h1>
          <p className="muted">{summary}</p>
        </div>
        <div className="page__actions">
          <Link className="btn btn--ghost" to="/tonight"><Icon name="dice" size={18} /> Pick for tonight</Link>
          <button type="button" className="btn btn--ghost" onClick={() => setSharing(true)} disabled={!items.length}>
            <Icon name="share" size={18} /> Share
          </button>
          <Link className="btn btn--primary" to="/add"><Icon name="plus" size={18} /> Add title</Link>
        </div>
      </header>

      {items.length === 0 ? (
        <EmptyState
          title="Your list is waiting for its first title"
          actions={(
            <>
              <Link className="btn btn--primary" to="/add"><Icon name="search" size={18} /> Find a movie or show</Link>
              <Link className="btn btn--ghost" to="/settings">Import a backup</Link>
            </>
          )}
        >
          Search for something you want to watch. It will show up here with its genres, runtime and where to stream it.
        </EmptyState>
      ) : (
        <>
          <LibraryToolbar f={f} showing={f.filtered.length} total={items.length} />
          {f.filtered.length === 0 ? (
            <EmptyState
              title="Nothing matches these filters"
              actions={<button type="button" className="btn btn--ghost" onClick={f.clear}>Clear filters</button>}
            >
              Try removing a genre or switching the status tab.
            </EmptyState>
          ) : (
            <div className="grid">
              {f.filtered.map((item) => (
                <TitleCard
                  key={item.key}
                  item={item}
                  showStatus
                  quick={item.status !== 'watched'
                    ? { icon: 'check', label: `Mark ${item.title} as watched`, onClick: () => markWatched(item) }
                    : undefined}
                />
              ))}
            </div>
          )}
        </>
      )}
      {sharing && <ShareDialog onClose={() => setSharing(false)} />}
    </div>
  );
}
