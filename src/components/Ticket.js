import { Link } from 'react-router-dom';
import Icon from './Icons';
import Poster from './Poster';
import GenreTags from './GenreTags';
import { ProviderLine } from './Providers';
import useAsync from '../hooks/useAsync';
import { getDetails, hasApiKey } from '../lib/tmdb';
import { formatRuntime } from '../lib/format';

const today = () => {
  try { return new Date().toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }); } catch (e) { return ''; }
};

// The one loud thing in the app: tonight's pick, printed as a ticket stub.
export default function Ticket({ item, reason, onNext, onStart, nextLabel = 'Not this one' }) {
  const { data, loading } = useAsync(
    () => (hasApiKey ? getDetails(item.type, item.id) : Promise.resolve(null)),
    [item.key],
  );
  const watching = item.status === 'watching';

  return (
    <div className="ticket-wrap">
      <article className="ticket" aria-label={`Tonight's pick: ${item.title}`}>
        <div className="ticket__main">
          <p className="ticket__reason">{reason}</p>
          <h2 className="ticket__title">{item.title}</h2>
          <p className="ticket__meta">
            {item.year && <span>{item.year}</span>}
            {item.type === 'tv' && <span>Series</span>}
            {item.runtime ? <span><Icon name="clock" size={14} /> {formatRuntime(item.runtime)}{item.type === 'tv' ? ' per episode' : ''}</span> : null}
            {item.rating > 0 && <span><Icon name="star" size={14} /> {item.rating.toFixed(1)}</span>}
          </p>
          <GenreTags genres={item.genres} max={4} size="lg" />
          {item.overview && <p className="ticket__overview">{item.overview}</p>}
          {hasApiKey && <ProviderLine providers={data && data.providers} loading={loading} />}
          <div className="ticket__actions">
            <button type="button" className="btn btn--ink" onClick={onStart} disabled={watching}>
              <Icon name="play" size={16} /> {watching ? 'Already watching' : 'Watch this tonight'}
            </button>
            <button type="button" className="btn btn--outline-ink" onClick={onNext}>
              <Icon name="refresh" size={16} /> {nextLabel}
            </button>
            <Link className="btn btn--text-ink" to={`/title/${item.type}/${item.id}`}>Details</Link>
          </div>
        </div>
        <aside className="ticket__stub" aria-hidden="true">
          <div className="ticket__poster"><Poster path={item.poster} title={item.title} size="w342" /></div>
          <div className="ticket__stubtext">
            <span className="ticket__admit">Admit one</span>
            <span className="ticket__date">{today()}</span>
            <span className="barcode" />
          </div>
        </aside>
      </article>
    </div>
  );
}
