import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { SITE } from '../config';

export default function About() {
  useDocumentTitle('About');
  return (
    <div className="wrap page page--narrow legal">
      <h1 className="h-page">About Watch Today</h1>
      <p>
        WatchList is a small tool for keeping track of movies and shows you want to see. It began as a first
        web-development project by {SITE.owner} ({SITE.ownerHandle}) and was rebuilt to solve a real annoyance: a list of
        titles tells you nothing about what to watch tonight.
      </p>

      <h2>What it does</h2>
      <p>
        Every title shows its genres, runtime and rating on the card. You can filter and sort, see where a title
        streams in your country, watch the trailer, and let the Tonight page choose based on your mood and the time
        you have. A share link sends your list to a friend and shows what you both still want to watch.
      </p>

      <h2>How your data is handled</h2>
      <p>
        There are no accounts. Your list is saved in your browser and nowhere else, so it is private by default. The
        flip side is that it does not sync between devices. Use <Link to="/settings">Export backup</Link> to move it.
        Details are in the <Link to="/privacy">privacy policy</Link>.
      </p>

      <h2>Where the data comes from</h2>
      <p>
        Titles, posters, cast and ratings come from TMDB. Streaming availability comes from JustWatch through TMDB.
        See <Link to="/credits">credits and disclaimer</Link>.
      </p>

      <h2>Contact</h2>
      <p>
        Found a bug or have an idea? Write to <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a> or open an
        issue on <a href={SITE.github} target="_blank" rel="noopener noreferrer">GitHub</a>.
      </p>
    </div>
  );
}
