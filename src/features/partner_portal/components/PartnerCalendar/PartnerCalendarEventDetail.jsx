/**
 * Navix Partner Portal — PartnerCalendarEventDetail (PROMPT 076)
 * ──────────────────────────────────────────────────────────────
 * Popover affichant les détails d'un événement au clic.
 * Read-only : bouton "Voir le détail" navigue vers la source.
 */
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { EVENT_TYPE_CONFIG } from '../../services/partnerCalendarService';

const PartnerCalendarEventDetail = ({ event, position, onClose }) => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const config = EVENT_TYPE_CONFIG[event.type] || {};

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleOpenSource = () => {
    if (event.sourcePath) {
      navigate(event.sourcePath);
    }
    onClose();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      ref={ref}
      className="partner-calendar-popover"
      style={{ top: position.top, left: position.left }}
      role="dialog"
      aria-label={`Détail: ${event.title}`}
    >
      <div className="partner-calendar-popover__header">
        <span className="partner-calendar-popover__type" style={{ color: config.color }}>
          <i className={`bi ${config.icon}`} aria-hidden="true" />
          {' '}{config.label}
        </span>
        <button type="button" className="partner-calendar-popover__close" onClick={onClose} aria-label="Fermer">
          <i className="bi bi-x-lg" aria-hidden="true" />
        </button>
      </div>

      <h3 className="partner-calendar-popover__title">{event.title}</h3>

      <div className="partner-calendar-popover__meta">
        <div className="partner-calendar-popover__row">
          <i className="bi bi-calendar3" aria-hidden="true" />
          <span>{formatDate(event.start)}{event.end && event.end !== event.start ? ` — ${formatDate(event.end)}` : ''}</span>
        </div>
        <div className="partner-calendar-popover__row">
          <i className="bi bi-flag" aria-hidden="true" />
          <span className={`partner-calendar-popover__status partner-calendar-popover__status--${event.status?.variant || 'secondary'}`}>
            {event.status?.label || '—'}
          </span>
        </div>
        {event.metadata?.clientName && (
          <div className="partner-calendar-popover__row">
            <i className="bi bi-person" aria-hidden="true" />
            <span>{event.metadata.clientName}</span>
          </div>
        )}
        {event.metadata?.vehicleName && (
          <div className="partner-calendar-popover__row">
            <i className="bi bi-truck" aria-hidden="true" />
            <span>{event.metadata.vehicleName}</span>
          </div>
        )}
        {event.metadata?.amount > 0 && (
          <div className="partner-calendar-popover__row">
            <i className="bi bi-cash-stack" aria-hidden="true" />
            <span>{event.metadata.amount.toLocaleString('fr-FR')} FCFA</span>
          </div>
        )}
        {event.metadata?.registrationNumber && (
          <div className="partner-calendar-popover__row">
            <i className="bi bi-upc-scan" aria-hidden="true" />
            <span>{event.metadata.registrationNumber}</span>
          </div>
        )}
      </div>

      {event.description && (
        <p className="partner-calendar-popover__desc">{event.description}</p>
      )}

      {event.sourcePath && (
        <button
          type="button"
          className="partner-calendar-popover__action"
          onClick={handleOpenSource}
        >
          <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
          Voir le détail
        </button>
      )}
    </div>
  );
};

export default PartnerCalendarEventDetail;
