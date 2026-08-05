/**
 * Navix Notifications — NotificationCard
 * --------------------------------------------------------------------------
 * Carte compacte d'une notification (vue mobile / tablette) : icône sémantique,
 * titre, message, entreprise, badges (type, sévérité, statut) et date relative.
 *
 * Props :
 *   notification : notification métier
 *   company      : entreprise liée (ou null)
 *   onView       : (notification) => void
 */
import { Button, Card } from '@/components/ui';
import { getNotificationKind, getNotificationType, formatNotificationRelative, formatNotificationDateTime } from '../constants';
import NotificationIcon from './NotificationIcon';
import NotificationTypeBadge from './NotificationTypeBadge';
import NotificationSeverityBadge from './NotificationSeverityBadge';
import NotificationStatusBadge from './NotificationStatusBadge';
import './NotificationCard.css';

const NotificationCard = ({ notification, company, onView }) => {
  const kind = getNotificationKind(notification.kind);

  return (
    <Card className={`navix-notif-card ${notification.status === 'unread' ? 'is-unread' : ''}`} padding="md">
      <div className="navix-notif-card__head">
        <div className="navix-notif-card__identity">
          <NotificationIcon variant={getNotificationType(notification.type).variant} icon={kind.icon} />
          <div className="min-w-0">
            <h3 className="navix-notif-card__title mb-0">{notification.title}</h3>
            <p className="navix-notif-card__company mb-0">{company?.name ?? '—'}</p>
          </div>
        </div>
        <NotificationStatusBadge status={notification.status} size="sm" />
      </div>

      <p className="navix-notif-card__message mb-0">{notification.message}</p>

      <div className="navix-notif-card__badges">
        <NotificationTypeBadge type={notification.type} size="sm" />
        <NotificationSeverityBadge severity={notification.severity} size="sm" />
      </div>

      <div className="navix-notif-card__meta">
        <time dateTime={notification.createdAt} title={formatNotificationDateTime(notification.createdAt)}>
          {formatNotificationRelative(notification.createdAt)}
        </time>
      </div>

      <div className="navix-notif-card__actions">
        <Button variant="outline" size="sm" icon="bi-eye" fullWidth onClick={() => onView?.(notification)}>
          Détails
        </Button>
      </div>
    </Card>
  );
};

export default NotificationCard;
