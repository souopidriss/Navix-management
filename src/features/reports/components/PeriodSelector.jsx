/**
 * Navix Reports — PeriodSelector
 * --------------------------------------------------------------------------
 * Sélecteur de période d'analyse (aujourd'hui, 7 derniers jours, ce mois…).
 * Rend un `<select>` natif accessible, borné par les options fournies.
 *
 * Props :
 *   value    : période active (ex. 'thisMonth')
 *   onChange : (value: string) => void
 *   options  : [{ value, label }]          (défaut : [])
 *   disabled : booléen
 *   size     : 'sm' | 'md' | 'lg'          (défaut : 'sm')
 */
import './ReportComponents.css';

const PeriodSelector = ({ value, onChange, options = [], disabled = false, size = 'sm' }) => (
  <div className="navix-report-period">
    <span className="navix-report-period__icon" aria-hidden="true">
      <i className="bi bi-calendar-range" />
    </span>
    <label className="visually-hidden" htmlFor="navix-report-period">
      Période du rapport
    </label>
    <select
      id="navix-report-period"
      className={`form-select form-select-${size}`}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default PeriodSelector;
