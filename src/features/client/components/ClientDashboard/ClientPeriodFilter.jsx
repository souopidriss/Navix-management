/**
 * Navix Client Dashboard — ClientPeriodFilter
 * --------------------------------------------------------------------------
 * Sélecteur de période de type pill-tabs, cohérent avec le Dashboard Master.
 */
import { useState } from 'react';
import { CLIENT_PERIOD_OPTIONS } from '../../mocks/clientDashboard.mock';
import './ClientDashboard.css';

const ClientPeriodFilter = ({ value = 'month', onChange }) => {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (val) => {
    setLocalValue(val);
    if (onChange) onChange(val);
  };

  return (
    <div className="navix-client-period-bar" role="group" aria-label="Sélecteur de période">
      {CLIENT_PERIOD_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`navix-client-period-btn ${localValue === opt.value ? 'navix-client-period-btn--active' : ''}`}
          onClick={() => handleChange(opt.value)}
          aria-pressed={localValue === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default ClientPeriodFilter;
