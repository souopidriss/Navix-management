/**
 * Navix Notifications — NotificationList
 * --------------------------------------------------------------------------
 * Liste de notifications regroupées par période (Aujourd'hui, Hier, Cette
 * semaine, Plus anciennes). Chaque groupe affiche un en-tête et ses items
 * (NotificationItem). Affiche un état vide si aucune notification.
 *
 * Props :
 *   notifications : liste des notifications (déjà filtrées / triées)
 *   companyById   : carte { id → { name } }
 *   actions       : { onView?, onMarkAsRead?, onMarkAsUnread?, onArchive?, onDelete? }
 *   loading       : désactive les actions
 *   emptyTitle / emptyText / onEmptyAction / emptyActionLabel
 */
import { groupNotificationsByDate } from '../constants';
import NotificationItem from './NotificationItem';
import './NotificationList.css';

const NotificationList = ({
  notifications = [],
  companyById = {},
  actions = {},
  loading = false,
  emptyTitle = 'Aucune notification',
  emptyText = 'Aucune notification pour la période sélectionnée.',
  emptyActionLabel,
  onEmptyAction,
}) => {
  const groups = groupNotificationsByDate(notifications);

  if (groups.length === 0) {
    return (
      <div className="navix-notif-list__empty">
        <i className="bi bi-bell-slash navix-notif-list__empty-icon" aria-hidden="true" />
        <p className="navix-notif-list__empty-title">{emptyTitle}</p>
        <p className="navix-notif-list__empty-text">{emptyText}</p>
        {emptyActionLabel && onEmptyAction && (
          <button type="button" className="navix-notif-list__empty-action" onClick={onEmptyAction}>
            {emptyActionLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="navix-notif-list">
      {groups.map((group) => (
        <section key={group.key} className="navix-notif-list__group" aria-label={group.label}>
          <h3 className="navix-notif-list__group-title">
            {group.label}
            <span className="navix-notif-list__group-count">{group.items.length}</span>
          </h3>
          <div className="navix-notif-list__items">
            {group.items.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                companyName={companyById[notification.companyId]?.name}
                actions={actions}
                loading={loading}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default NotificationList;
