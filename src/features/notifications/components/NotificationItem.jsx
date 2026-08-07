/**
 * Navix Notifications — NotificationItem
 * --------------------------------------------------------------------------
 * Élément de liste d'une notification : icône sémantique, titre, message,
 * entreprise, date relative, point de non-lue et actions contextuelles
 * (détail, lu / non lu, archiver, supprimer). Utilisé par NotificationList,
 * le centre de notifications et la page.
 *
 * Props :
 *   notification : notification métier
 *   companyName  : nom de l'entreprise (optionnel)
 *   actions      : { onView?, onMarkAsRead?, onMarkAsUnread?, onArchive?, onDelete? }
 *   loading      : désactive les actions
 */
import { getNotificationKind, getNotificationType, formatNotificationRelative, formatNotificationDateTime } from '../constants';
import NotificationIcon from './NotificationIcon';
import './NotificationItem.css';

const NotificationItem = ({ notification, companyName, actions = {}, loading = false }) => {
  const kind = getNotificationKind(notification.kind);
  const isUnread = notification.status === 'unread';

  return (
    <article
      className={`navix-notif-item ${isUnread ? 'is-unread' : ''}`}
      data-notification-id={notification.id}
    >
      <div className="navix-notif-item__icon">
        <NotificationIcon
          variant={getNotificationType(notification.type).variant}
          icon={kind.icon}
          size="sm"
        />
      </div>

      <div className="navix-notif-item__body">
        <h4 className="navix-notif-item__title">{notification.title}</h4>
        <p className="navix-notif-item__message">{notification.message}</p>
        <div className="navix-notif-item__meta">
          {companyName && <span className="navix-notif-item__company">{companyName}</span>}
          <time
            dateTime={notification.createdAt}
            title={formatNotificationDateTime(notification.createdAt)}
          >
            {formatNotificationRelative(notification.createdAt)}
          </time>
        </div>
      </div>

      {actions.onView && (
        <button
          type="button"
          className="navix-notif-item__action navix-notif-item__action--view"
          title="Voir le détail"
          aria-label={`Voir le détail de ${notification.title}`}
          disabled={loading}
          onClick={() => actions.onView(notification)}
        >
          <i className="bi bi-arrow-right" aria-hidden="true" />
        </button>
      )}

      {isUnread && actions.onMarkAsRead && (
        <button
          type="button"
          className="navix-notif-item__action"
          title="Marquer comme lue"
          aria-label={`Marquer comme lue : ${notification.title}`}
          disabled={loading}
          onClick={() => actions.onMarkAsRead(notification.id)}
        >
          <i className="bi bi-check2" aria-hidden="true" />
        </button>
      )}

      {!isUnread && actions.onMarkAsUnread && (
        <button
          type="button"
          className="navix-notif-item__action"
          title="Marquer comme non lue"
          aria-label={`Marquer comme non lue : ${notification.title}`}
          disabled={loading}
          onClick={() => actions.onMarkAsUnread(notification.id)}
        >
          <i className="bi bi-envelope" aria-hidden="true" />
        </button>
      )}

      {actions.onArchive && notification.status !== 'archived' && (
        <button
          type="button"
          className="navix-notif-item__action"
          title="Archiver"
          aria-label={`Archiver : ${notification.title}`}
          disabled={loading}
          onClick={() => actions.onArchive(notification.id)}
        >
          <i className="bi bi-archive" aria-hidden="true" />
        </button>
      )}

      {actions.onDelete && (
        <button
          type="button"
          className="navix-notif-item__action navix-notif-item__action--danger"
          title="Supprimer"
          aria-label={`Supprimer : ${notification.title}`}
          disabled={loading}
          onClick={() => actions.onDelete(notification)}
        >
          <i className="bi bi-trash" aria-hidden="true" />
        </button>
      )}
    </article>
  );
};

export default NotificationItem;
