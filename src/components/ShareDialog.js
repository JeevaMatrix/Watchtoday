import { useMemo, useState } from 'react';
import Modal from './Modal';
import Icon from './Icons';
import { useLibrary } from '../state/LibraryContext';
import { useToast } from '../state/ToastContext';
import { MAX_SHARE_ITEMS, buildShareUrl } from '../lib/share';
import { SHARE_NAME_KEY, STATUS_LABEL, STATUSES, readJSON, writeJSON } from '../lib/storage';
import { plural } from '../lib/format';

export default function ShareDialog({ onClose }) {
  const { items } = useLibrary();
  const { toast } = useToast();
  const [name, setName] = useState(() => readJSON(SHARE_NAME_KEY, 'My watchlist'));
  const [include, setInclude] = useState({ want: true, watching: true, watched: false });

  const chosen = useMemo(
    () => items.filter((i) => include[i.status]).sort((a, b) => b.addedAt - a.addedAt),
    [items, include],
  );
  const shared = chosen.slice(0, MAX_SHARE_ITEMS);
  const url = useMemo(() => (shared.length ? buildShareUrl({ name, items: shared }) : ''), [shared, name]);

  const changeName = (v) => { setName(v); writeJSON(SHARE_NAME_KEY, v); };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast('Link copied. Paste it anywhere.');
    } catch (e) {
      toast('Copy failed. Select the link and copy it by hand.');
    }
  };

  const nativeShare = async () => {
    try { await navigator.share({ title: name || 'My watchlist', text: `${name || 'My watchlist'} on WatchList`, url }); } catch (e) { /* cancelled */ }
  };

  return (
    <Modal title="Share your list" onClose={onClose}>
      <div className="stack">
        <label className="field">
          <span>List name</span>
          <input type="text" value={name} maxLength={40} onChange={(e) => changeName(e.target.value)} data-autofocus />
        </label>

        <fieldset className="checks">
          <legend>Include</legend>
          {STATUSES.map((s) => (
            <label key={s} className="check">
              <input type="checkbox" checked={include[s]} onChange={(e) => setInclude({ ...include, [s]: e.target.checked })} />
              <span>{STATUS_LABEL[s]}</span>
            </label>
          ))}
        </fieldset>

        {shared.length === 0 ? (
          <p className="muted">Nothing to share with these choices. Tick at least one status that has titles.</p>
        ) : (
          <>
            <label className="field">
              <span>Your link</span>
              <input type="text" readOnly value={url} onFocus={(e) => e.target.select()} />
            </label>
            <p className="muted small">
              {plural(shared.length, 'title')} in this link
              {chosen.length > shared.length && `, the ${MAX_SHARE_ITEMS} most recent (the link can hold that many)`}.
              The list lives inside the link itself. Nothing is uploaded, and anyone who has the link can see it.
            </p>
            <div className="row">
              <button type="button" className="btn btn--primary" onClick={copy}><Icon name="copy" size={18} /> Copy link</button>
              {typeof navigator !== 'undefined' && navigator.share && (
                <button type="button" className="btn btn--ghost" onClick={nativeShare}><Icon name="share" size={18} /> Share</button>
              )}
              <a className="btn btn--quiet" href={url} target="_blank" rel="noopener noreferrer">Preview <Icon name="external" size={15} /></a>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
