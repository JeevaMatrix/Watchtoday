import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icons';
import RegionSelect from '../components/RegionSelect';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useLibrary } from '../state/LibraryContext';
import { useToast } from '../state/ToastContext';
import { exportJSON, parseImport, toCSV } from '../lib/storage';
import { plural } from '../lib/format';

function download(name, text, mime) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const stamp = () => new Date().toISOString().slice(0, 10);

export default function Settings() {
  useDocumentTitle('Settings and data');
  const { items, importItems, clearAll } = useLibrary();
  const { toast } = useToast();
  const fileRef = useRef(null);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState('');

  const kb = Math.max(1, Math.round(new Blob([JSON.stringify(items)]).size / 1024));

  const onFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const list = parseImport(await file.text());
      const have = new Set(items.map((i) => i.key));
      setPending({ list, fresh: list.filter((i) => !have.has(i.key)).length, name: file.name });
      setError('');
    } catch (err) {
      setPending(null);
      setError(err.message || 'Could not read that file.');
    }
  };

  const merge = () => {
    const n = importItems(pending.list, 'merge');
    toast(`Imported ${plural(n, 'new title')}`);
    setPending(null);
  };
  const replace = () => {
    if (!window.confirm('Replace your current list with this backup?')) return;
    importItems(pending.list, 'replace');
    toast(`Your list now has ${plural(pending.list.length, 'title')}`);
    setPending(null);
  };
  const wipe = () => {
    if (!window.confirm('Delete every title saved on this device? Export a backup first if you want to keep them.')) return;
    clearAll();
    toast('Your list was cleared');
  };

  return (
    <div className="wrap page page--narrow">
      <header className="page__head page__head--stack">
        <h1 className="h-page">Settings and data</h1>
        <p className="muted">Everything here lives in this browser. Nothing is sent to a server we run.</p>
      </header>

      <section className="panel">
        <h2>Where you watch</h2>
        <p className="muted">Sets the country used for “Where to watch”.</p>
        <RegionSelect id="region-settings" />
      </section>

      <section className="panel">
        <h2>Back up and restore</h2>
        <p className="muted">
          {plural(items.length, 'title')} saved on this device, about {kb} KB. Clearing your browser data removes them, so export now and then.
        </p>
        <div className="row">
          <button type="button" className="btn btn--primary" disabled={!items.length} onClick={() => download(`watchlist-${stamp()}.json`, exportJSON(items), 'application/json')}>
            <Icon name="download" size={18} /> Export backup (JSON)
          </button>
          <button type="button" className="btn btn--ghost" disabled={!items.length} onClick={() => download(`watchlist-${stamp()}.csv`, toCSV(items), 'text/csv')}>
            <Icon name="download" size={18} /> Export spreadsheet (CSV)
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => fileRef.current && fileRef.current.click()}>
            <Icon name="upload" size={18} /> Import backup
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onFile} />
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}
        {pending && (
          <div className="notice notice--soft" role="status">
            <p>
              <strong>{pending.name}</strong> has {plural(pending.list.length, 'title')}, {pending.fresh} of them new to this device.
            </p>
            <div className="row">
              <button type="button" className="btn btn--primary btn--sm" onClick={merge}>Add the new ones</button>
              <button type="button" className="btn btn--danger btn--sm" onClick={replace}>Replace my list</button>
              <button type="button" className="btn btn--quiet btn--sm" onClick={() => setPending(null)}>Cancel</button>
            </div>
          </div>
        )}
      </section>

      <section className="panel">
        <h2>Delete my data</h2>
        <p className="muted">Removes your saved titles, ratings and notes from this browser.</p>
        <button type="button" className="btn btn--danger" disabled={!items.length} onClick={wipe}>
          <Icon name="trash" size={18} /> Delete everything on this device
        </button>
      </section>

      <p className="muted small">
        Read how your data is handled in the <Link to="/privacy">privacy policy</Link> and <Link to="/cookies">cookies and storage</Link> pages.
      </p>
    </div>
  );
}
