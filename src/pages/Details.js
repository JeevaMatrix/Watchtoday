import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import Icon from '../components/Icons';
import Poster from '../components/Poster';
import GenreTags from '../components/GenreTags';
import StatusControl from '../components/StatusControl';
import StarRating from '../components/StarRating';
import Providers from '../components/Providers';
import TitleCard from '../components/TitleCard';
import TrailerModal from '../components/TrailerModal';
import EmptyState from '../components/EmptyState';
import SetupNotice from '../components/SetupNotice';
import NotFound from './NotFound';
import useAsync from '../hooks/useAsync';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useLibrary } from '../state/LibraryContext';
import { useToast } from '../state/ToastContext';
import { describeError, getDetails, imageUrl, toStorable } from '../lib/tmdb';
import { STATUS_LABEL } from '../lib/storage';
import { formatDate, formatRuntime, plural } from '../lib/format';

const initials = (name) => name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

function DetailsInner({ type, id }) {
  const key = `${type}-${id}`;
  const navigate = useNavigate();
  const lib = useLibrary();
  const { toast } = useToast();
  const saved = lib.get(key);
  const [attempt, setAttempt] = useState(0);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [note, setNote] = useState(saved ? saved.note : '');

  const { data: d, error, loading } = useAsync(() => getDetails(type, id), [type, id, attempt]);
  const base = d || saved;
  useDocumentTitle(base ? base.title : 'Title');

  const savedNote = saved ? saved.note : '';
  useEffect(() => { setNote(savedNote); }, [savedNote]);

  const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate('/'));

  if (!base) {
    return (
      <div className="wrap page">
        {error ? (
          <>
            {error.code === 'missing-key' && <SetupNotice />}
            <EmptyState
              title="Couldn’t load this title"
              actions={(
                <>
                  <button type="button" className="btn btn--primary" onClick={() => setAttempt((a) => a + 1)}>Try again</button>
                  <Link className="btn btn--ghost" to="/">Back to library</Link>
                </>
              )}
            >
              {describeError(error)}
            </EmptyState>
          </>
        ) : (
          <div className="detail__grid" aria-busy="true">
            <div className="skel skel--poster detail__poster" />
            <div className="detail__info">
              <div className="skel skel--title" />
              <div className="skel skel--line" />
              <div className="skel skel--line skel--wide" />
            </div>
          </div>
        )}
      </div>
    );
  }

  const addWith = (status) => {
    lib.add(toStorable(d), status);
    toast(`Added ${d.title} to ${STATUS_LABEL[status]}`, { action: { label: 'Undo', onClick: () => lib.remove(key) } });
  };
  const removeIt = () => {
    const removed = lib.remove(key);
    toast(`Removed ${base.title}`, { action: { label: 'Undo', onClick: () => lib.restore(removed) } });
  };

  const runtime = base.runtime || (d && d.runtime);
  const seasons = d && d.seasons;

  return (
    <article className="detail">
      <div
        className="detail__bg"
        style={base.backdrop ? { backgroundImage: `url(${imageUrl(base.backdrop, 'w1280')})` } : undefined}
        aria-hidden="true"
      />
      <div className="wrap detail__inner">
        <button type="button" className="btn btn--quiet btn--sm back" onClick={goBack}>
          <Icon name="arrowLeft" size={16} /> Back
        </button>

        <div className="detail__grid">
          <div className="detail__poster">
            <Poster path={base.poster} title={base.title} size="w500" alt={`Poster for ${base.title}`} />
          </div>

          <div className="detail__info">
            <h1 className="detail__title">{base.title}</h1>
            {d && d.tagline && <p className="detail__tagline">{d.tagline}</p>}
            <p className="detail__meta">
              {base.year && <span>{base.year}</span>}
              <span>{type === 'tv' ? 'Series' : 'Movie'}</span>
              {runtime ? <span><Icon name="clock" size={15} /> {formatRuntime(runtime)}{type === 'tv' ? ' per episode' : ''}</span> : null}
              {type === 'tv' && seasons ? <span>{plural(seasons, 'season')}</span> : null}
              {base.rating > 0 && (
                <span title={d && d.votes ? `${d.votes.toLocaleString()} votes on TMDB` : 'TMDB user score'}>
                  <Icon name="star" size={15} /> {base.rating.toFixed(1)}
                </span>
              )}
            </p>
            <GenreTags genres={base.genres} max={8} size="lg" />
            {d && d.directors.length > 0 && (
              <p className="detail__credit">{type === 'tv' ? 'Created by' : 'Directed by'} {d.directors.join(', ')}</p>
            )}
            <p className="detail__overview">{base.overview || 'No synopsis available yet.'}</p>
            {d && d.trailer && (
              <button type="button" className="btn btn--ghost" onClick={() => setTrailerOpen(true)}>
                <Icon name="play" size={16} /> Watch trailer
              </button>
            )}
          </div>
        </div>

        <section className="panel" aria-labelledby="mine-h">
          {saved ? (
            <>
              <h2 id="mine-h">In your list</h2>
              <StatusControl value={saved.status} onChange={(s) => lib.setStatus(key, s)} />
              <div className="panel__row">
                <div>
                  <p className="panel__label">Your rating</p>
                  <StarRating value={saved.myRating} onChange={(n) => lib.setMyRating(key, n)} />
                </div>
                <button type="button" className="btn btn--danger btn--sm" onClick={removeIt}>
                  <Icon name="trash" size={16} /> Remove
                </button>
              </div>
              <label className="field">
                <span>Notes for yourself</span>
                <textarea
                  rows={3}
                  maxLength={600}
                  value={note}
                  placeholder="Who recommended it, who to watch it with…"
                  onChange={(e) => setNote(e.target.value)}
                  onBlur={() => { if (note !== saved.note) lib.setNote(key, note); }}
                />
              </label>
              {saved.status === 'watched' && saved.watchedAt && (
                <p className="muted small">Marked watched on {formatDate(saved.watchedAt)}.</p>
              )}
            </>
          ) : (
            <>
              <h2 id="mine-h">Save it</h2>
              <div className="row">
                <button type="button" className="btn btn--primary" disabled={!d} onClick={() => addWith('want')}>
                  <Icon name="plus" size={18} /> Add to want to watch
                </button>
                <button type="button" className="btn btn--ghost" disabled={!d} onClick={() => addWith('watched')}>
                  <Icon name="check" size={18} /> Already watched
                </button>
              </div>
            </>
          )}
        </section>

        {d ? <Providers providers={d.providers} /> : error ? (
          <div className="notice" role="status">
            <p>{describeError(error)}</p>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setAttempt((a) => a + 1)}>Try again</button>
          </div>
        ) : loading ? <div className="skel skel--block" aria-hidden="true" /> : null}

        {d && d.cast.length > 0 && (
          <section className="block" aria-labelledby="cast-h">
            <div className="block__head"><h2 id="cast-h">Cast</h2></div>
            <ul className="cast">
              {d.cast.map((p) => (
                <li key={p.id} className="cast__item">
                  {p.photo
                    ? <img src={imageUrl(p.photo, 'w185')} alt="" loading="lazy" decoding="async" width="92" height="138" />
                    : <div className="cast__blank" aria-hidden="true">{initials(p.name)}</div>}
                  <strong>{p.name}</strong>
                  {p.role && <span>{p.role}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {d && d.recommendations.length > 0 && (
          <section className="block" aria-labelledby="more-h">
            <div className="block__head"><h2 id="more-h">More like this</h2></div>
            <div className="shelf">
              {d.recommendations.map((r) => {
                const inList = lib.has(r.key);
                return (
                  <div key={r.key} className="shelf__item">
                    <TitleCard
                      item={r}
                      compact
                      badge={inList ? 'In your list' : undefined}
                      quick={inList ? undefined : {
                        icon: 'plus',
                        label: `Add ${r.title} to want to watch`,
                        onClick: () => {
                          lib.add(r, 'want');
                          toast(`Added ${r.title}`, { action: { label: 'Undo', onClick: () => lib.remove(r.key) } });
                        },
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
      {trailerOpen && d && d.trailer && <TrailerModal trailer={d.trailer} title={d.title} onClose={() => setTrailerOpen(false)} />}
    </article>
  );
}

export default function Details() {
  const { type, id } = useParams();
  if (!(type === 'movie' || type === 'tv') || !/^\d+$/.test(id || '')) return <NotFound />;
  return <DetailsInner key={`${type}-${id}`} type={type} id={Number(id)} />;
}

// Bookmarks from the previous version of the site used /<movieId>.
export function LegacyRedirect() {
  const { id } = useParams();
  return /^\d+$/.test(id || '') ? <Navigate to={`/title/movie/${id}`} replace /> : <NotFound />;
}
