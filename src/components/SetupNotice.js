import { hasApiKey } from '../lib/tmdb';

export default function SetupNotice() {
  if (hasApiKey) return null;
  return (
    <div className="notice" role="status">
      <h2>Add your TMDB key to switch search on</h2>
      <p>
        Create a <code>.env.local</code> file next to <code>package.json</code> with
        {' '}<code>REACT_APP_TMDB_API=your_key</code>, then restart <code>npm start</code>.
        On Netlify, add the same variable under Site settings, then redeploy.
      </p>
    </div>
  );
}
