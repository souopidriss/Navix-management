/**
 * Navix Partner Portal — PartnerNotificationFilters (PROMPT 067)
 * --------------------------------------------------------------------------
 * Barre de filtres des notifications partenaire : Statut, Type, Priorité,
 * Période + recherche instantanée. Tous les filtres fonctionnent ensemble.
 */
import {
  PARTNER_NOTIFICATION_STATUS_FILTERS,
  PARTNER_NOTIFICATION_STATUS_FILTER_VALUES,
  PARTNER_NOTIFICATION_TYPES,
  PARTNER_NOTIFICATION_TYPE_VALUES,
  PARTNER_NOTIFICATION_SEVERITIES,
  PARTNER_NOTIFICATION_SEVERITY_VALUES,
  PARTNER_NOTIFICATION_PERIOD_FILTERS,
  PARTNER_NOTIFICATION_PERIOD_FILTER_VALUES,
} from '../../constants/partner.constants';

const toSelectOptions = (values, meta, allLabel) => [
  { value: '', label: allLabel },
  ...values.map((value) => ({ value, label: meta[value]?.label ?? value })),
];

const STATUS_OPTIONS = toSelectOptions(PARTNER_NOTIFICATION_STATUS_FILTER_VALUES, PARTNER_NOTIFICATION_STATUS_FILTERS, 'Tous les statuts');
const TYPE_OPTIONS = toSelectOptions(PARTNER_NOTIFICATION_TYPE_VALUES, PARTNER_NOTIFICATION_TYPES, 'Tous les types');
const SEVERITY_OPTIONS = toSelectOptions(PARTNER_NOTIFICATION_SEVERITY_VALUES, PARTNER_NOTIFICATION_SEVERITIES, 'Toutes les priorités');
const PERIOD_OPTIONS = toSelectOptions(PARTNER_NOTIFICATION_PERIOD_FILTER_VALUES, PARTNER_NOTIFICATION_PERIOD_FILTERS, 'Toutes les périodes');

const PartnerNotificationFilters = ({
  search,
  onSearchChange,
  filters,
  onFilterChange,
  totalItems,
  hasActiveFilters,
  onResetFilters,
}) => (
  <div className="pn-filters mb-3">
    <div className="position-relative flex-grow-1" style={{ maxWidth: '280px' }}>
      <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" aria-hidden="true" />
      <input
        type="search"
        className="form-control form-control-sm ps-4"
        placeholder="Rechercher une notification..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        aria-label="Rechercher une notification"
      />
    </div>

    <select
      className="form-select form-select-sm"
      style={{ width: 'auto' }}
      value={filters.status}
      onChange={(event) => onFilterChange({ status: event.target.value })}
      aria-label="Filtrer par statut"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>

    <select
      className="form-select form-select-sm"
      style={{ width: 'auto' }}
      value={filters.type}
      onChange={(event) => onFilterChange({ type: event.target.value })}
      aria-label="Filtrer par type"
    >
      {TYPE_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>

    <select
      className="form-select form-select-sm"
      style={{ width: 'auto' }}
      value={filters.severity}
      onChange={(event) => onFilterChange({ severity: event.target.value })}
      aria-label="Filtrer par priorité"
    >
      {SEVERITY_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>

    <select
      className="form-select form-select-sm"
      style={{ width: 'auto' }}
      value={filters.period}
      onChange={(event) => onFilterChange({ period: event.target.value })}
      aria-label="Filtrer par période"
    >
      {PERIOD_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>

    {hasActiveFilters && (
      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onResetFilters}>
        <i className="bi bi-x-lg me-1" aria-hidden="true" />
        Réinitialiser
      </button>
    )}

    <span className="ms-auto text-secondary small tabular-nums">
      {totalItems} notification{totalItems > 1 ? 's' : ''}
    </span>
  </div>
);

export default PartnerNotificationFilters;
