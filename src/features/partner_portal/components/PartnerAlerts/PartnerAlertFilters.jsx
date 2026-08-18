/**
 * Navix Partner Portal — PartnerAlertFilters (PROMPT 075)
 * ───────────────────────────────────────────────────────
 * Filtres et recherche pour les alertes.
 */
import {
  ALERT_SEVERITY_OPTIONS,
  ALERT_STATUS_OPTIONS,
  ALERT_TYPE_OPTIONS,
} from '../../schemas/partnerAlerts.schema';

const PartnerAlertFilters = ({ filters, onFilterChange }) => {
  const handleChange = (key, value) => {
    onFilterChange({ [key]: value, page: 1 });
  };

  return (
    <div className="partner-alerts-filters">
      <div className="partner-alerts-search">
        <i className="bi bi-search" />
        <input
          type="text"
          placeholder="Rechercher une alerte..."
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
        />
      </div>

      <select
        className="partner-alerts-filter-select"
        value={filters.severity}
        onChange={(e) => handleChange('severity', e.target.value)}
      >
        {ALERT_SEVERITY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        className="partner-alerts-filter-select"
        value={filters.status}
        onChange={(e) => handleChange('status', e.target.value)}
      >
        {ALERT_STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        className="partner-alerts-filter-select"
        value={filters.type}
        onChange={(e) => handleChange('type', e.target.value)}
      >
        {ALERT_TYPE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PartnerAlertFilters;
