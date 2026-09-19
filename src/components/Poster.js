import { useState } from 'react';
import Icon from './Icons';
import { imageUrl } from '../lib/tmdb';

export default function Poster({ path, title, size = 'w342', alt = '', className = '' }) {
  const [failed, setFailed] = useState(false);
  if (!path || failed) {
    return (
      <div className={`poster poster--empty ${className}`} role={alt ? 'img' : undefined} aria-label={alt || undefined}>
        <Icon name="film" size={28} />
        <span>{title}</span>
      </div>
    );
  }
  return (
    <img
      className={`poster ${className}`}
      src={imageUrl(path, size)}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
