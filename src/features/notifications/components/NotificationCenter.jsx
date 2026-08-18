/**
 * Navix Notifications — NotificationCenter
 * --------------------------------------------------------------------------
 * Centre de notifications réutilisable (navbar / dashboard) : en-tête avec
 * compteur de non-lues et « tout marquer lu », bascule temps réel (simulé),
 * liste des dernières notifications et pied renvoyant vers la page
 * Notifications. Le conteneur (panel du header, carte dashboard) est fourni
 * par l'appelant.
 *
 * Props :
 *   limit             : nombre de notifications affichées (défaut 5)
 *   showRealtimeToggle: affiche la bascule temps réel (défaut true)
 *   showFooter        : affiche le lien « Voir toutes » (défaut true)
 *   className         : classes additionnelles
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES, notificationDetailPath } from '@/routes/route.constants';
import { useAuthStore } from '@/features/auth';
import { useNotificationCenter } from '../hooks';
import { useNotificationsStore } from '../store';
import { useCompaniesStore } from '@/features/companies';
import NotificationList from './NotificationList';
import UnreadNotificationCount from './UnreadNotificationCount';
import './NotificationCenter.css';

const NotificationCenter = ({
  limit = 5,
  showRealtimeToggle = true,
  showFooter = true,
  className,
}) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isDriver = user?.role === 'driver';
  const { notifications, unreadCount, hasUnread, isConnected, toggleRealtime, actions, isSaving } =
    useNotificationCenter({ limit });

  const companies = useCompaniesStore((state) => state.companies);
  const companyById = Object.fromEntries(companies.map((company) => [company.id, company]));

  const fetchNotifications = useNotificationsStore((state) => state.fetchNotifications);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  useEffect(() => {
    fetchNotifications();
    fetchCompanies();
  }, [fetchNotifications, fetchCompanies]);

  const handleView = async (notification) => {
    if (notification.status === 'unread') await actions.markAsRead(notification.id);
    navigate(isDriver ? ROUTES.DRIVER_NOTIFICATIONS : notificationDetailPath(notification.id));
  };

  return (
    <div className={`navix-notif-center ${className ?? ''}`}>
      <div className="navix-notif-center__header">
        <span className="navix-notif-center__title">
          Notifications
          {unreadCount > 0 && <UnreadNotificationCount count={unreadCount} />}
        </span>
        <div className="navix-notif-center__header-actions">
          {showRealtimeToggle && (
            <button
              type="button"
              className="navix-notif-center__realtime"
              title={isConnected ? 'Déconnecter le flux temps réel' : 'Connecter le flux temps réel (simulation)'}
              aria-pressed={isConnected}
              onClick={toggleRealtime}
            >
              <span className={`navix-notif-center__dot ${isConnected ? 'is-online' : ''}`} aria-hidden="true" />
              {isConnected ? 'En direct' : 'Hors ligne'}
            </button>
          )}
          {hasUnread && (
            <button type="button" className="navix-notif-center__mark-all" onClick={actions.markAllAsRead}>
              Tout marquer lu
            </button>
          )}
        </div>
      </div>

      <div className="navix-notif-center__body">
        <NotificationList
          notifications={notifications}
          companyById={companyById}
          actions={{ onView: handleView }}
          loading={isSaving}
          emptyTitle="Aucune notification"
          emptyText="Aucune nouvelle notification pour le moment."
        />
      </div>

      {showFooter && (
        <div className="navix-notif-center__footer">
          <button
            type="button"
            className="navix-notif-center__all"
            onClick={() => navigate(isDriver ? ROUTES.DRIVER_NOTIFICATIONS : ROUTES.NOTIFICATIONS)}
          >
            <i className="bi bi-inbox me-2" aria-hidden="true" />
            Voir toutes les notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
