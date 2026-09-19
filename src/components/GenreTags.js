export default function GenreTags({ genres, max = 3, size = 'sm' }) {
  if (!genres || !genres.length) return null;
  const shown = genres.slice(0, max);
  const extra = genres.length - shown.length;
  return (
    <ul className={`tags tags--${size}`} aria-label="Genres">
      {shown.map((g) => <li key={g} className="tag">{g}</li>)}
      {extra > 0 && <li className="tag tag--more" title={genres.slice(max).join(', ')}>+{extra}</li>}
    </ul>
  );
}
