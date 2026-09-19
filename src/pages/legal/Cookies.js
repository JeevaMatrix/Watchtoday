import { Link } from 'react-router-dom';
import LegalPage from './LegalPage';
import { SITE } from '../../config';

export default function Cookies() {
  return (
    <LegalPage title="Cookies and storage">
      <p>
        {SITE.name} does not set cookies of its own and has no tracking or advertising cookies. It uses your browser’s
        local storage to remember your list and choices. This is needed for the site to work, which is why there is no
        cookie banner.
      </p>

      <h2>What is saved in your browser</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th scope="col">Key</th><th scope="col">What it holds</th><th scope="col">How long</th></tr>
          </thead>
          <tbody>
            <tr><td><code>watchlist:v2</code></td><td>Your saved titles, statuses, ratings and notes</td><td>Until you delete it</td></tr>
            <tr><td><code>watchlist:settings</code></td><td>Your chosen country for “Where to watch”</td><td>Until you delete it</td></tr>
            <tr><td><code>watchlist:sharename</code></td><td>The name you gave your shared list</td><td>Until you delete it</td></tr>
            <tr><td><code>mylist</code></td><td>Your list from the previous version of the site, kept untouched as a safety copy</td><td>Until you delete it</td></tr>
          </tbody>
        </table>
      </div>

      <h2>Third-party cookies</h2>
      <p>
        If you press “Watch trailer”, the video is loaded from YouTube in privacy-enhanced mode. YouTube may store data
        on your device while the video plays. We do not control that, and it is described in Google’s policies. Nothing
        from YouTube is loaded until you press play.
      </p>

      <h2>How to remove it</h2>
      <p>
        Use “Delete everything on this device” in <Link to="/settings">Settings and data</Link>, or clear this site’s
        data in your browser settings. Export a backup first if you want to keep your list.
      </p>

      <p>
        More about how information is handled is in the <Link to="/privacy">privacy policy</Link>.
      </p>
    </LegalPage>
  );
}
