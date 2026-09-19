import { Link } from 'react-router-dom';
import Icon from './Icons';
import Poster from './Poster';
import GenreTags from './GenreTags';
import { STATUS_SHORT } from '../lib/storage';
import { formatRuntime } from '../lib/format';

// quick = { icon, label, onClick } renders the round button on the poster.
export default function TitleCard({ item, showStatus = false, quick, badge, compact = false }) {
  return (
    <article className={`card${compact ? ' card--compact' : ''}`}>
      <Link to={`/title/${item.type}/${item.id}`} className="card__link">
        <div className="card__art">
          <Poster path={item.poster} title={item.title} />
          {item.rating > 0 && (
            <span className="card__rating" title="TMDB user score">
              <Icon name="star" size={12} />
              {item.rating.toFixed(1)}
            </span>
          )}
          {showStatus && <span className={`status status--${item.status}`}>{STATUS_SHORT[item.status]}</span>}
          {badge && <span className="card__badge">{badge}</span>}
        </div>
        <h3 className="card__title">{item.title}</h3>
        <p className="card__meta">
          {item.year && <span>{item.year}</span>}
          {item.type === 'tv' && <span className="card__kind">Series</span>}
          {item.runtime ? (
            <span className="card__time" title={item.type === 'tv' ? 'Per episode' : 'Runtime'}>
              <Icon name="clock" size={13} />
              {formatRuntime(item.runtime)}{item.type === 'tv' ? '/ep' : ''}
            </span>
          ) : null}
        </p>
        <GenreTags genres={item.genres} max={compact ? 2 : 3} />
      </Link>
      {quick && (
        <button type="button" className="card__quick" aria-label={quick.label} title={quick.label} onClick={quick.onClick}>
          <Icon name={quick.icon} size={18} />
        </button>
      )}
    </article>
  );
}

export function CardSkeleton() {
  return (
    <div className="card card--skeleton" aria-hidden="true">
      <div className="skel skel--poster" />
      <div className="skel skel--line" />
      <div className="skel skel--line skel--short" />
    </div>
  );
}
