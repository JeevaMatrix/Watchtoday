import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icons';
import Poster from '../components/Poster';
import GenreTags from '../components/GenreTags';
import EmptyState from '../components/EmptyState';
import SetupNotice from '../components/SetupNotice';
import useAsync from '../hooks/useAsync';
import useDebounce from '../hooks/useDebounce';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useLibrary } from '../state/LibraryContext';
import { useToast } from '../state/ToastContext';
import { describeError, getTrending, hasApiKey, searchMulti } from '../lib/tmdb';
import { STATUS_LABEL, STATUS_SHORT } from '../lib/storage';

function ResultRow({ item, saved, onAdd }) {
  const to = `/title/${item.type}/${item.id}`;
  return (
    <li className="result">
      <Link to={to} className="result__poster" tabIndex={-1} aria-hidden="true">
        <Poster path={item.poster} title={item.title} />
      </Link>
      <div className="result__body">
        <h3 className="result__title"><Link to={to}>{item.title}</Link></h3>
        <p className="card__meta">
          {item.year && <span>{item.year}</span>}
          <span className="card__kind">{item.type === 'tv' ? 'Series' : 'Movie'}</span>
          {item.rating > 0 && <span className="card__time"><Icon name="star" size={13} />{item.rating.toFixed(1)}</span>}
        </p>
        <GenreTags genres={item.genres} max={4} />
        {item.overview && <p className="result__overview">{item.overview}</p>}
        <div className="result__actions">
          {saved ? (
            <>
              <span className={`status status--inline status--${saved.status}`}>In your list: {STATUS_SHORT[saved.status]}</span>
              <Link className="btn btn--quiet btn--sm" to={to}>Open</Link>
            </>
          ) : (
            <>
              <button type="button" className="btn btn--primary btn--sm" onClick={() => onAdd(item, 'want')}>
                <Icon name="plus" size={16} /> Want to watch
              </button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => onAdd(item, 'watched')}>
                <Icon name="check" size={16} /> Already watched
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}

function ResultSkeleton() {
  return (
    <li className="result result--skeleton" aria-hidden="true">
      <div className="skel skel--thumb" />
      <div className="result__body">
        <div className="skel skel--line" />
        <div className="skel skel--line skel--short" />
        <div className="skel skel--line skel--wide" />
      </div>
    </li>
  );
}

export default function Add() {
  useDocumentTitle('Add a title');
  const { byKey, add, remove } = useLibrary();
  const { toast } = useToast();
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [attempt, setAttempt] = useState(0);
  const term = useDebounce(q.trim(), 350);
  const searching = term.length >= 2;

  const { data, error, loading } = useAsync(
    () => (!hasApiKey ? Promise.resolve([]) : searching ? searchMulti(term) : getTrending()),
    [searching ? term : '', attempt],
  );

  const list = (data || []).filter((t) => type === 'all' || t.type === type);

  const onAdd = (item, status) => {
    add(item, status);
    toast(`Added ${item.title} to ${STATUS_LABEL[status]}`, { action: { label: 'Undo', onClick: () => remove(item.key) } });
  };

  return (
    <div className="wrap page page--narrow">
      <header className="page__head page__head--stack">
        <h1 className="h-page">Add a title</h1>
        <p className="muted">Movies and series. Search by the name you know it by.</p>
      </header>

      <SetupNotice />

      <div className="searchbar">
        <label className="search search--big">
          <Icon name="search" size={20} />
          <span className="visually-hidden">Search movies and shows</span>
          <input
            type="search"
            placeholder="Try Interstellar or Money Heist"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
            autoComplete="off"
          />
        </label>
        <div className="segmented segmented--small" role="radiogroup" aria-label="Type">
          {[['all', 'All'], ['movie', 'Movies'], ['tv', 'Shows']].map(([v, label]) => (
            <button key={v} type="button" role="radio" aria-checked={type === v} className="segmented__btn" onClick={() => setType(v)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {hasApiKey && (
        <section aria-live="polite">
          <h2 className="h-section">{searching ? `Results for “${term}”` : q.trim().length === 1 ? 'Keep typing' : 'Trending this week'}</h2>
          {error ? (
            <EmptyState
              title="Couldn’t load titles"
              actions={<button type="button" className="btn btn--ghost" onClick={() => setAttempt((a) => a + 1)}>Try again</button>}
            >
              {describeError(error)}
            </EmptyState>
          ) : loading && !list.length ? (
            <ul className="results">{Array.from({ length: 5 }).map((_, i) => <ResultSkeleton key={i} />)}</ul>
          ) : list.length === 0 ? (
            <EmptyState title="No matches">Check the spelling, or search the original title instead.</EmptyState>
          ) : (
            <ul className="results">
              {list.map((item) => (
                <ResultRow key={item.key} item={item} saved={byKey.get(item.key)} onAdd={onAdd} />
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
