import { imageUrl } from '../lib/tmdb';
import { regionName } from '../lib/format';
import { JUSTWATCH_URL } from '../config';
import { useSettings } from '../state/SettingsContext';
import RegionSelect from './RegionSelect';
import Icon from './Icons';

const GROUPS = [
  ['flatrate', 'Stream'],
  ['free', 'Free'],
  ['ads', 'Free with ads'],
  ['rent', 'Rent'],
  ['buy', 'Buy'],
];

export function JustWatchCredit() {
  return (
    <p className="attrib">
      Streaming data from{' '}
      <a href={JUSTWATCH_URL} target="_blank" rel="noopener noreferrer">JustWatch</a>, via TMDB.
    </p>
  );
}

function ProviderChip({ p }) {
  return (
    <li className="provider">
      {p.logo_path ? <img src={imageUrl(p.logo_path, 'w92')} alt="" width="28" height="28" loading="lazy" /> : null}
      <span>{p.provider_name}</span>
    </li>
  );
}

// Full block used on the details page.
export default function Providers({ providers }) {
  const { region, setRegion } = useSettings();
  const here = providers && providers[region];
  const groups = here ? GROUPS.filter(([k]) => here[k] && here[k].length) : [];
  const elsewhere = Object.keys(providers || {}).filter((c) => c !== region).slice(0, 10);

  return (
    <section className="block" aria-labelledby="where-h">
      <div className="block__head">
        <h2 id="where-h">Where to watch</h2>
        <RegionSelect id="region-details" />
      </div>

      {groups.length > 0 ? (
        <div className="provider-groups">
          {groups.map(([k, label]) => (
            <div key={k} className="provider-group">
              <h3>{label}</h3>
              <ul className="provider-list">
                {here[k].map((p) => <ProviderChip key={p.provider_id} p={p} />)}
              </ul>
            </div>
          ))}
          {here.link && (
            <a className="btn btn--ghost btn--sm" href={here.link} target="_blank" rel="noopener noreferrer">
              See all options <Icon name="external" size={15} />
            </a>
          )}
        </div>
      ) : (
        <div className="provider-none">
          <p>Not available to stream, rent or buy in {regionName(region)} right now.</p>
          {elsewhere.length > 0 && (
            <p className="muted">
              Listed in:{' '}
              {elsewhere.map((c) => (
                <button key={c} type="button" className="linklike" onClick={() => setRegion(c)}>{regionName(c)}</button>
              ))}
            </p>
          )}
        </div>
      )}
      <JustWatchCredit />
    </section>
  );
}

// One-line version used on the Tonight ticket.
export function ProviderLine({ providers, loading }) {
  const { region } = useSettings();
  if (loading) return <div className="skel skel--line skel--wide" aria-hidden="true" />;
  const here = providers && providers[region];
  const list = here ? (here.flatrate || here.free || here.ads || []) : [];
  const other = here ? [...(here.rent || []), ...(here.buy || [])] : [];
  const shown = list.length ? list : other;
  return (
    <div className="ticket__where">
      {shown.length ? (
        <>
          <span className="ticket__label">{list.length ? 'Streaming on' : 'Rent or buy on'}</span>
          <ul className="provider-list provider-list--tight">
            {shown.slice(0, 5).map((p) => <ProviderChip key={p.provider_id} p={p} />)}
          </ul>
        </>
      ) : (
        <span className="ticket__label">Not streaming in {regionName(region)} right now</span>
      )}
      <JustWatchCredit />
    </div>
  );
}
