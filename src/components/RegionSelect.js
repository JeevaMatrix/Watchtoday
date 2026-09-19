import { REGIONS } from '../lib/regions';
import { regionName } from '../lib/format';
import { useSettings } from '../state/SettingsContext';

export default function RegionSelect({ id = 'region', label = 'Country' }) {
  const { region, setRegion } = useSettings();
  const list = REGIONS.includes(region) ? REGIONS : [region, ...REGIONS];
  const options = list
    .map((code) => ({ code, name: regionName(code) }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return (
    <label className="select" htmlFor={id}>
      <span className="visually-hidden">{label}</span>
      <select id={id} value={region} onChange={(e) => setRegion(e.target.value)}>
        {options.map((o) => <option key={o.code} value={o.code}>{o.name}</option>)}
      </select>
    </label>
  );
}
