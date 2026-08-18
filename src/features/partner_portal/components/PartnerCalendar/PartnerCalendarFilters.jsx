/**
 * Navix Partner Portal — PartnerCalendarFilters (PROMPT 076)
 * ─────────────────────────────────────────────────────────
 * Filtres pour le calendrier : type + recherche.
 */
import { EVENT_TYPES, EVENT_TYPE_CONFIG } from '../../services/partnerCalendarService';

const TYPE_OPTIONS = [
  { value: 'all', label: 'Tous les types', icon: 'bi-grid-3x3-gap' },
  ...Object.values(EVENT_TYPES).map((type) => ({
    value: type,
    label: EVENT_TYPE_CONFIG[type].label,
    icon: EVENT_TYPE_CONFIG[type].icon,
  })),
];

const PartnerCalendarFilters = ({ type, onTypeChange, search, onSearchChange }) => {
  return (
    <div className="partner-calendar-filters">
      <div className="partner-calendar-filters__types">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`partner-calendar-filters__type ${type === opt.value ? 'partner-calendar-filters__type--active' : ''}`}
            onClick={() => onTypeChange(opt.value)}
            aria-pressed={type === opt.value}
          >
            <i className={`bi ${opt.icon}`} aria-hidden="true" />
            <span className="partner-calendar-filters__type-label">{opt.label}</span>
          </button>
        ))}
      </div>
      <div className="partner-calendar-filters__search">
        <i className="bi bi-search" aria-hidden="true" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Rechercher un événement"
        />
      </div>
    </div>
  );
};

export default PartnerCalendarFilters;
