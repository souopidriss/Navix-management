/**
 * Navix Partner Portal — PartnerCalendarLegend (PROMPT 076)
 * ────────────────────────────────────────────────────────
 * Légende accessible du calendrier.
 * Icône + texte pour chaque type (pas uniquement couleur).
 */
import { EVENT_TYPES, EVENT_TYPE_CONFIG } from '../../services/partnerCalendarService';

const LEGEND_ITEMS = [
  EVENT_TYPES.MISSION,
  EVENT_TYPES.REQUEST,
  EVENT_TYPES.CONTRACT,
  EVENT_TYPES.DOCUMENT,
  EVENT_TYPES.INVOICE,
  EVENT_TYPES.MAINTENANCE,
  EVENT_TYPES.ALERT,
];

const PartnerCalendarLegend = ({ summary }) => {
  return (
    <div className="partner-calendar-legend" role="img" aria-label="Légende du calendrier">
      {LEGEND_ITEMS.map((type) => {
        const config = EVENT_TYPE_CONFIG[type];
        const count = summary?.byType?.[type] || 0;
        return (
          <div key={type} className="partner-calendar-legend__item">
            <span className={`partner-calendar-legend__dot partner-calendar-legend__dot--${type}`}>
              <i className={`bi ${config.icon}`} aria-hidden="true" />
            </span>
            <span className="partner-calendar-legend__label">{config.label}</span>
            {summary && (
              <span className="partner-calendar-legend__count">{count}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PartnerCalendarLegend;
