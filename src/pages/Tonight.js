import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icons';
import Poster from '../components/Poster';
import Ticket from '../components/Ticket';
import Suggestions from '../components/Suggestions';
import EmptyState from '../components/EmptyState';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useLibrary } from '../state/LibraryContext';
import { useToast } from '../state/ToastContext';
import { KINDS, MOODS, TIMES, candidates, reasonFor, shuffleWeighted } from '../lib/pick';
import { plural } from '../lib/format';

function Options({ label, value, onChange, options }) {
  return (
    <fieldset className="pickgroup">
      <legend>{label}</legend>
      <div className="chips">
        {options.map((o) => (
          <button key={o.id} type="button" className="chip" aria-pressed={value === o.id} onClick={() => onChange(o.id)}>
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function Tonight() {
  useDocumentTitle('Pick for tonight');
  const { items, byKey, setStatus } = useLibrary();
  const { toast } = useToast();
  const [mood, setMood] = useState('any');
  const [time, setTime] = useState('any');
  const [kind, setKind] = useState('any');
  const [order, setOrder] = useState([]);
  const [pos, setPos] = useState(0);
  const [phase, setPhase] = useState('idle'); // idle | spinning | shown
  const [reel, setReel] = useState(0);
  const timer = useRef(null);

  const pool = useMemo(() => candidates(items, { mood, time, kind }), [items, mood, time, kind]);
  const open = items.filter((i) => i.status !== 'watched');
  const unknownRuntime = time !== 'any' ? open.filter((i) => i.runtime == null).length : 0;

  useEffect(() => { setPhase('idle'); setOrder([]); setPos(0); }, [mood, time, kind]);
  useEffect(() => () => clearInterval(timer.current), []);

  const spin = () => {
    if (!pool.length) return;
    const list = shuffleWeighted(pool).map((i) => i.key);
    setOrder(list);
    setPos(0);
    clearInterval(timer.current);
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || list.length === 1) { setPhase('shown'); return; }
    setPhase('spinning');
    let n = 0;
    timer.current = setInterval(() => {
      n += 1;
      setReel((r) => (r + 1) % list.length);
      if (n >= 10) { clearInterval(timer.current); setPhase('shown'); }
    }, 90);
  };

  const next = () => {
    if (pos + 1 < order.length) { setPos(pos + 1); return; }
    toast('That was everything that fits. Reshuffled.');
    spin();
  };

  const current = phase === 'shown' ? byKey.get(order[pos]) : null;
  const reelItem = phase === 'spinning' ? byKey.get(order[reel % (order.length || 1)]) : null;
  const runnersUp = phase === 'shown'
    ? [pos + 1, pos + 2].filter((i) => i < order.length).map((i) => ({ i, item: byKey.get(order[i]) })).filter((x) => x.item)
    : [];

  const start = () => {
    if (!current) return;
    const previous = current.status;
    setStatus(current.key, 'watching');
    toast(`Enjoy ${current.title}.`, { action: { label: 'Undo', onClick: () => setStatus(current.key, previous) } });
  };

  return (
    <div className="wrap page page--narrow">
      <header className="page__head page__head--stack">
        <h1 className="h-page">Pick for tonight</h1>
        <p className="muted">Tell us the mood and how long you have. We choose from what’s already on your list.</p>
      </header>

      {open.length === 0 ? (
        <EmptyState
          title="Nothing to pick from yet"
          actions={<Link className="btn btn--primary" to="/add"><Icon name="plus" size={18} /> Add a title</Link>}
        >
          Save a few movies or shows you haven’t watched and come back.
        </EmptyState>
      ) : (
        <>
          <div className="pickform">
            <Options label="Mood" value={mood} onChange={setMood} options={MOODS} />
            <Options label="Time you have" value={time} onChange={setTime} options={TIMES} />
            <Options label="Type" value={kind} onChange={setKind} options={KINDS} />
          </div>

          <div className="pickbar">
            <button type="button" className="btn btn--primary btn--lg" onClick={spin} disabled={!pool.length || phase === 'spinning'}>
              <Icon name="dice" size={20} /> {phase === 'shown' ? 'Shuffle again' : 'Pick for me'}
            </button>
            <span className="muted" aria-live="polite">
              {pool.length ? `${plural(pool.length, 'title')} fit${pool.length === 1 ? 's' : ''}` : 'Nothing fits these choices'}
              {unknownRuntime > 0 && `, ${unknownRuntime} still loading runtimes`}
            </span>
          </div>

          {!pool.length && (
            <p className="muted">Loosen the mood or the time limit, or add more titles.</p>
          )}

          {phase === 'spinning' && reelItem && (
            <div className="reel" aria-hidden="true">
              <Poster path={reelItem.poster} title={reelItem.title} size="w342" />
            </div>
          )}

          {current && (
            <div key={current.key}>
              <Ticket item={current} reason={reasonFor(current)} onNext={next} onStart={start} />
              {runnersUp.length > 0 && (
                <section className="runners" aria-label="Runners-up">
                  <h2 className="h-section">Or maybe</h2>
                  <ul>
                    {runnersUp.map(({ i, item }) => (
                      <li key={item.key}>
                        <button type="button" className="runner" onClick={() => setPos(i)}>
                          <span className="runner__poster"><Poster path={item.poster} title={item.title} size="w154" /></span>
                          <span className="runner__text">
                            <strong>{item.title}</strong>
                            <span className="muted small">{item.genres.slice(0, 2).join(', ')}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </>
      )}

      <Suggestions />
    </div>
  );
}
