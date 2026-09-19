import Icon from './Icons';
import { SORTS } from '../lib/filter';
import { STATUS_LABEL } from '../lib/storage';

const STATUS_TABS = [['all', 'All'], ['want', STATUS_LABEL.want], ['watching', STATUS_LABEL.watching], ['watched', STATUS_LABEL.watched]];

export default function LibraryToolbar({ f, showing, total }) {
  const { filters, update, clear, toggleGenre, counts, genres, active } = f;
  return (
    <section className="toolbar" aria-label="Filter and sort">
      <div className="toolbar__row">
        <label className="search">
          <Icon name="search" size={18} />
          <span className="visually-hidden">Search your list</span>
          <input
            type="search"
            placeholder="Search by title or genre"
            value={filters.q}
            onChange={(e) => update({ q: e.target.value })}
          />
        </label>
        <div className="toolbar__pickers">
          <div className="segmented segmented--small" role="radiogroup" aria-label="Type">
            {[['all', 'All'], ['movie', 'Movies'], ['tv', 'Shows']].map(([v, label]) => (
              <button key={v} type="button" role="radio" aria-checked={filters.type === v} className="segmented__btn" onClick={() => update({ type: v })}>
                {label}
              </button>
            ))}
          </div>
          <label className="select">
            <span className="visually-hidden">Sort by</span>
            <select value={filters.sort} onChange={(e) => update({ sort: e.target.value })}>
              {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="tabs" role="tablist" aria-label="Status">
        {STATUS_TABS.map(([v, label]) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={filters.status === v}
            className={`tab${filters.status === v ? ' is-active' : ''}`}
            onClick={() => update({ status: v })}
          >
            {label}
            <span className="tab__count">{counts[v]}</span>
          </button>
        ))}
      </div>

      {genres.length > 0 && (
        <div className="chips" role="group" aria-label="Genres">
          {genres.map((g) => (
            <button
              key={g.name}
              type="button"
              className="chip"
              aria-pressed={filters.genres.includes(g.name)}
              onClick={() => toggleGenre(g.name)}
            >
              {g.name}
              <span className="chip__count">{g.count}</span>
            </button>
          ))}
        </div>
      )}

      <p className="toolbar__result" aria-live="polite">
        Showing {showing} of {total}
        {active && (
          <button type="button" className="linklike" onClick={clear}>Clear filters</button>
        )}
      </p>
    </section>
  );
}
