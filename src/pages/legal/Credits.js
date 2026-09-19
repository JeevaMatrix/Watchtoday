import LegalPage from './LegalPage';
import { JUSTWATCH_URL, SITE, TMDB_LOGO_SRC, TMDB_NOTICE, TMDB_SITE } from '../../config';

export default function Credits() {
  return (
    <LegalPage title="Credits and disclaimer">
      <h2>TMDB</h2>
      {TMDB_LOGO_SRC && (
        <p>
          <a href={TMDB_SITE} target="_blank" rel="noopener noreferrer">
            <img src={TMDB_LOGO_SRC} alt="TMDB" height="18" />
          </a>
        </p>
      )}
      <p>{TMDB_NOTICE}</p>
      <p>
        Movie and series information, posters, backdrops, cast photos, ratings and recommendations are provided by{' '}
        <a href={TMDB_SITE} target="_blank" rel="noopener noreferrer">The Movie Database (TMDB)</a> and remain the
        property of TMDB and its contributors.
      </p>

      <h2>JustWatch</h2>
      <p>
        Streaming, rental and purchase availability is provided by{' '}
        <a href={JUSTWATCH_URL} target="_blank" rel="noopener noreferrer">JustWatch</a> through the TMDB API. Availability
        differs by country and changes often, so confirm on the service itself.
      </p>

      <h2>Video</h2>
      <p>Trailers are embedded from YouTube and belong to their uploaders.</p>

      <h2>Type and software</h2>
      <p>
        Headings use Bricolage Grotesque and text uses Instrument Sans, both distributed under the SIL Open Font
        License through Google Fonts. The site is built with React.
      </p>

      <h2>Disclaimer</h2>
      <ul>
        <li>{SITE.name} is an independent project. It is not affiliated with, sponsored by or endorsed by TMDB, JustWatch, YouTube or any streaming service, studio or distributor.</li>
        <li>We do not host, stream, download or link to pirated copies of any film or show.</li>
        <li>All titles, logos, posters and trademarks belong to their respective owners and appear only to identify the works.</li>
        <li>Information can be incomplete or out of date. Do not rely on it for purchase or subscription decisions without checking the source.</li>
      </ul>

      <h2>Copyright concerns</h2>
      <p>
        If you believe something on the site infringes your rights, write to{' '}
        <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a> with the page address and details. Most content
        is served by TMDB, so you may also need to contact them.
      </p>
    </LegalPage>
  );
}
