/**
 * Navix Notifications — NotificationDropdown
 * --------------------------------------------------------------------------
 * Centre de notifications du Header global : cloche avec badge de non-lues,
 * panneau déroulant (dernières notifications, marquer tout lu, lien vers la
 * page Notifications). Consommé par le Navbar existant
 * (`src/components/layout/Navbar/NotificationDropdown.jsx`).
 *
 * Accessibilité : bouton (aria-expanded / aria-haspopup / aria-controls),
 * navigation clavier (Échap pour fermer, restitution du focus), fermeture au
 * clic extérieur, `aria-live` sur le badge. Utilisable sur mobile (panneau
 * contraint en largeur par le Header).
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES, notificationDetailPath } from '@/routes/route.constants';
import { useNotificationsStore } from '../store';
import { useUnreadNotifications } from '../hooks';
import { getNotificationKind, getNotificationType, formatNotificationRelative, formatNotificationDateTime } from '../constants';
import NotificationIcon from './NotificationIcon';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);

  const fetchNotifications = useNotificationsStore((state) => state.fetchNotifications);
  const fetchUnreadCount = useNotificationsStore((state) => state.fetchUnreadCount);
  const markAsRead = useNotificationsStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead);

  const { unread, unreadCount } = useUnreadNotifications(5);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (open) fetchUnreadCount();
  }, [open, fetchUnreadCount]);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleOpen = () => setOpen((current) => !current);

  const handleOpenKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
    }
  };

  const openNotification = async (notification) => {
    setOpen(false);
    if (notification.status === 'unread') await markAsRead(notification.id);
    navigate(notificationDetailPath(notification.id));
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    fetchUnreadCount();
  };

  const goToAll = () => {
    setOpen(false);
    navigate(ROUTES.NOTIFICATIONS);
  };

  const badgeLabel = unreadCount > 99 ? '99+' : String(unreadCount);

  return (
    <div className="dropdown navix-notif-dropdown" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="navix-topbar__icon-btn"
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="navix-notif-dropdown-panel"
        onClick={handleOpen}
        onKeyDown={handleOpenKeyDown}
      >
        <i className="bi bi-bell" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="navix-notif-dropdown__badge" aria-live="polite">
            {badgeLabel}
          </span>
        )}
      </button>

      {open && (
        <div
          id="navix-notif-dropdown-panel"
          className="dropdown-menu dropdown-menu-end show navix-topbar__notif navix-notif-dropdown__panel"
          role="menu"
          aria-label="Notifications récentes"
        >
          <div className="navix-topbar__notif-header">
            <span className="navix-topbar__notif-title">
              Notifications
              {unreadCount > 0 && <span className="navix-notif-dropdown__count">{unreadCount}</span>}
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                className="navix-notif-dropdown__mark-all"
                onClick={handleMarkAllRead}
              >
                Tout marquer lu
              </button>
            )}
          </div>

          {unread.length === 0 ? (
            <div className="navix-topbar__notif-body">
              <i className="bi bi-bell-slash navix-topbar__notif-empty-icon" aria-hidden="true" />
              <p className="navix-topbar__notif-empty-text">Aucune notification pour le moment.</p>
            </div>
          ) : (
            <ul className="navix-notif-dropdown__list">
              {unread.map((notification) => {
                const kind = getNotificationKind(notification.kind);
                return (
                  <li key={notification.id}>
                    <button
                      type="button"
                      className="navix-notif-dropdown__item"
                      role="menuitem"
                      onClick={() => openNotification(notification)}
                    >
                      <NotificationIcon
                        variant={getNotificationType(notification.type).variant}
                        icon={kind.icon}
                        size="sm"
                      />
                      <span className="navix-notif-dropdown__item-body">
                        <span className="navix-notif-dropdown__item-title">{notification.title}</span>
                        <span className="navix-notif-dropdown__item-message">{notification.message}</span>
                        <time
                          className="navix-notif-dropdown__item-time"
                          dateTime={notification.createdAt}
                          title={formatNotificationDateTime(notification.createdAt)}
                        >
                          {formatNotificationRelative(notification.createdAt)}
                        </time>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="navix-notif-dropdown__footer">
            <button type="button" className="navix-notif-dropdown__all" onClick={goToAll}>
              <i className="bi bi-inbox me-2" aria-hidden="true" />
              Voir toutes les notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
