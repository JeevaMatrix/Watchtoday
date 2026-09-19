import Icon from './Icons';
import { STATUSES, STATUS_LABEL } from '../lib/storage';

const ICONS = { want: 'bookmark', watching: 'play', watched: 'check' };

export default function StatusControl({ value, onChange, label = 'Status' }) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {STATUSES.map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={value === s}
          className={`segmented__btn segmented__btn--${s}`}
          onClick={() => onChange(s)}
        >
          <Icon name={ICONS[s]} size={16} />
          {STATUS_LABEL[s]}
        </button>
      ))}
    </div>
  );
}
