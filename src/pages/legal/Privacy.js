import { Link } from 'react-router-dom';
import LegalPage from './LegalPage';
import { SITE } from '../../config';

export default function Privacy() {
  return (
    <LegalPage title="Privacy policy">
      <p>
        This policy explains what {SITE.name} (“we”, “the site”, at {SITE.url}) does with information when you use it.
        The short version: there are no accounts, no ads and no analytics. The titles you save stay in your browser.
      </p>

      <h2>1. What we collect</h2>
      <p>
        We do not collect, store or receive your watchlist, ratings, notes, searches or share links on any server that
        we operate. We do not ask for your name, email address or any other personal details to use the site.
      </p>

      <h2>2. What is stored on your device</h2>
      <p>
        To work, the site saves your list, your country choice and the name of your share list in your browser’s local
        storage. This data never leaves your device unless you export it or share a link yourself. You can delete it
        at any time from <Link to="/settings">Settings and data</Link> or by clearing your browser’s site data. See{' '}
        <Link to="/cookies">cookies and storage</Link> for the full list.
      </p>

      <h2>3. Services your browser contacts</h2>
      <p>
        The site is a static app, so your browser talks directly to a few services. Each receives technical details
        that any web request includes, such as your IP address and browser type, and each has its own privacy policy.
      </p>
      <ul>
        <li>
          <strong>Netlify</strong>, which hosts the site, may keep standard server logs of requests to it.
        </li>
        <li>
          <strong>TMDB</strong> (The Movie Database). When you search, open a title or view a shared list, your browser
          sends the search words or title IDs to <code>api.themoviedb.org</code> and loads posters and photos from{' '}
          <code>image.tmdb.org</code>. Streaming availability is supplied by JustWatch through TMDB. We do not contact
          JustWatch directly.
        </li>
        <li>
          <strong>Google Fonts</strong> serves the typefaces used by the site, which involves a request to Google’s font
          servers.
        </li>
        <li>
          <strong>YouTube</strong> is contacted only if you press “Watch trailer”. The video then loads in
          privacy-enhanced mode from <code>youtube-nocookie.com</code> and YouTube’s policies apply while it plays.
        </li>
      </ul>

      <h2>4. Share links</h2>
      <p>
        A share link contains your list name and the TMDB IDs and watch status of the titles you chose, encoded in the
        part of the address after the # sign. Browsers do not send that part to the server, but anyone you give the
        link to can read it, and apps you paste it into may store it. Only share a link with people you are happy to
        see your list. When someone opens it, their browser requests the title details from TMDB as described above.
      </p>

      <h2>5. Analytics and advertising</h2>
      <p>
        We do not use analytics, advertising or tracking tools at the time of writing. If that changes, we will update
        this policy first and ask for consent where the law requires it.
      </p>

      <h2>6. Your choices and rights</h2>
      <p>
        Because your data lives on your device, you already hold it: export it, edit it or delete it from{' '}
        <Link to="/settings">Settings</Link>. If you are in a region with data protection rights, such as the EU, the
        UK or India, you can also write to us about any personal information you think we hold. We expect the answer to
        be that we hold none, and we will say so.
      </p>

      <h2>7. Children</h2>
      <p>
        The site is not aimed at children under 13, and we do not knowingly collect information from them. Titles
        listed by TMDB can include mature content, and adult titles are excluded from search.
      </p>

      <h2>8. Security</h2>
      <p>
        The site is served over HTTPS. Since we hold no accounts or databases, there is nothing on our side to breach,
        but anyone with access to your device or browser profile can see your saved list.
      </p>

      <h2>9. International processing</h2>
      <p>
        The services listed above may process requests in countries other than yours.
      </p>

      <h2>10. Changes to this policy</h2>
      <p>
        We may update this policy as the site changes. The date at the top shows the latest version.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about this policy: <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
      </p>
    </LegalPage>
  );
}
