import { Link } from 'react-router-dom';
import LegalPage from './LegalPage';
import { SITE } from '../../config';

export default function Terms() {
  return (
    <LegalPage title="Terms and conditions">
      <p>
        By using {SITE.name} at {SITE.url} you agree to these terms. If you do not agree, please do not use the site.
      </p>

      <h2>1. The service</h2>
      <p>
        {SITE.name} is a free, personal-project tool for saving and organising movies and shows. It is provided by{' '}
        {SITE.owner} on an “as is” and “as available” basis and may change, pause or stop at any time.
      </p>

      <h2>2. Using the site</h2>
      <p>You agree not to:</p>
      <ul>
        <li>use the site for anything unlawful or to harm others;</li>
        <li>try to disrupt it, overload it or the services it relies on, or bypass any limits;</li>
        <li>scrape it or send automated traffic to it, or copy its code or design to pass off as your own;</li>
        <li>put content into your list name or notes that is abusive, infringing or unlawful, especially in links you share.</li>
      </ul>

      <h2>3. Your list and your responsibility</h2>
      <p>
        Your list is stored in your browser, not by us. It can be lost if you clear your browser data, change device or
        the browser fails, and we cannot recover it. You are responsible for exporting backups from{' '}
        <Link to="/settings">Settings</Link>. You are also responsible for what you share and with whom.
      </p>

      <h2>4. Third-party content and services</h2>
      <p>
        Film and TV information, images and cast details come from TMDB, and streaming availability from JustWatch via
        TMDB. Videos come from YouTube. This content belongs to its respective owners and is subject to their terms. We
        do not host or stream any films, shows or videos, and we are not affiliated with any streaming service. See{' '}
        <Link to="/credits">credits and disclaimer</Link>.
      </p>

      <h2>5. Accuracy</h2>
      <p>
        Availability, prices, ratings, runtimes and release details change often and may be wrong or out of date.
        Check the streaming service before you subscribe or pay for anything. Recommendations and “tonight” picks are
        suggestions only.
      </p>

      <h2>6. Intellectual property</h2>
      <p>
        The site’s code, design and original text belong to {SITE.owner}. Trademarks, posters, titles and other
        third-party materials belong to their owners and are shown to identify the works they relate to.
      </p>

      <h2>7. No warranty</h2>
      <p>
        To the fullest extent permitted by law, we give no warranty of any kind, including that the site will be
        uninterrupted, error-free or fit for a particular purpose.
      </p>

      <h2>8. Limit of liability</h2>
      <p>
        To the fullest extent permitted by law, we are not liable for any loss or damage arising from your use of the
        site, including loss of your saved list, or from third-party services it depends on.
      </p>

      <h2>9. Changes</h2>
      <p>
        We may update these terms. Continuing to use the site after a change means you accept the updated terms. The
        date at the top shows the latest version.
      </p>

      <h2>10. Governing law</h2>
      <p>These terms are governed by the laws of {SITE.governingLaw}.</p>

      <h2>11. Contact</h2>
      <p>
        Questions about these terms: <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
      </p>
    </LegalPage>
  );
}
