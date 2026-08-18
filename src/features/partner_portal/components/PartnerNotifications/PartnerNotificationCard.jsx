/**
 * Navix Partner Portal — PartnerNotificationCard (PROMPT 067)
 * --------------------------------------------------------------------------
 * Carte de notification Premium. Affiche l'icône, le titre, la description,
 * l'entité concernée, la date et la priorité. Les notifications non lues
 * sont visuellement distinctes (bordure latérale + fond léger).
 */
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import { getNotificationKind, getNotificationSeverity, formatNotificationRelative } from '@/features/notifications/constants';
import { getPartnerNotificationType } from '../../constants/partner.constants';

const RESOURCE_ROUTES = {
  vehicle: () => ROUTES.PARTNER_VEHICLES,
  mission: () => ROUTES.PARTNER_MISSIONS,
  document: () => ROUTES.PARTNER_DOCUMENTS,
  client: () => ROUTES.PARTNER_CLIENTS,
  transaction: () => ROUTES.PARTNER_FINANCE_TRANSACTIONS,
  subscription: () => ROUTES.PARTNER_SETTINGS,
  contract: () => ROUTES.PARTNER_CONTRACTS,
  invoice: () => ROUTES.PARTNER_FINANCE_INVOICES,
  request: () => ROUTES.PARTNER_REQUESTS,
};

const PartnerNotificationCard = ({
  notification,
  isSelected,
  onSelect,
  onMarkAsRead,
  onMarkAsUnread,
  onArchive,
  onDelete,
}) => {
  const navigate = useNavigate();
  const kind = getNotificationKind(notification.kind);
  const severity = getNotificationSeverity(notification.severity);
  const notifType = getPartnerNotificationType(notification.type);
  const isUnread = !notification.isRead;

  const handleView = () => {
    if (isUnread && onMarkAsRead) onMarkAsRead(notification.id);
    if (notification.resourceType && RESOURCE_ROUTES[notification.resourceType]) {
      navigate(RESOURCE_ROUTES[notification.resourceType](notification.resourceId));
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleView();
    }
  };

  return (
    <div
      className={`pn-card ${isUnread ? 'pn-card--unread' : ''}`}
      role="button"
      tabIndex={0}
      onClick={handleView}
      onKeyDown={handleKeyDown}
    >
      <div className="form-check align-self-start pn-card__checkbox">
        <input
          className="form-check-input"
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect?.(notification.id)}
          onClick={(event) => event.stopPropagation()}
          aria-label={`Sélectionner ${notification.title || notification.id}`}
        />
      </div>

      <span className={`pn-card__icon bg-${severity.variant}-soft text-${severity.variant}`} aria-hidden="true">
        <i className={`bi ${kind.icon || severity.icon || 'bi-bell'}`} />
      </span>

      <div className="flex-grow-1 min-w-0">
        <div className="d-flex justify-content-between align-items-start gap-2">
          <p className="pn-card__title mb-1">{notification.title}</p>
          <span className="pn-card__time">{formatNotificationRelative(notification.createdAt)}</span>
        </div>
        <p className="pn-card__message mb-1">{notification.message}</p>
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <span className={`badge text-bg-${severity.variant}`}>{severity.label}</span>
          {notifType && (
            <span className="badge text-bg-light border">
              <i className={`bi ${notifType.icon} me-1`} aria-hidden="true" />
              {notifType.label}
            </span>
          )}
          {notification.resourceType && (
            <span className="pn-card__entity">
              <i className="bi bi-link-45deg me-1" aria-hidden="true" />
              {notification.resourceId}
            </span>
          )}
        </div>
        <div className="pn-card__actions">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={(event) => { event.stopPropagation(); handleView(); }}
          >
            <i className="bi bi-eye me-1" aria-hidden="true" />
            Voir
          </button>
          {isUnread ? (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={(event) => { event.stopPropagation(); onMarkAsRead?.(notification.id); }}
            >
              <i className="bi bi-envelope-open me-1" aria-hidden="true" />
              Marquer lu
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={(event) => { event.stopPropagation(); onMarkAsUnread?.(notification.id); }}
            >
              <i className="bi bi-envelope me-1" aria-hidden="true" />
              Non lu
            </button>
          )}
          <button
            type="button"
            className="btn btn-sm btn-outline-dark"
            onClick={(event) => { event.stopPropagation(); onArchive?.(notification.id); }}
          >
            <i className="bi bi-archive me-1" aria-hidden="true" />
            Archiver
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={(event) => { event.stopPropagation(); onDelete?.(notification.id); }}
          >
            <i className="bi bi-trash me-1" aria-hidden="true" />
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerNotificationCard;
