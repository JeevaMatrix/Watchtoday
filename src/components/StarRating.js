import Icon from './Icons';

export default function StarRating({ value = 0, onChange, size = 24 }) {
  return (
    <div className="stars" role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className={`stars__btn${n <= value ? ' is-on' : ''}`}
          onClick={() => onChange(value === n ? 0 : n)}
        >
          <Icon name="star" size={size} />
        </button>
      ))}
    </div>
  );
}
