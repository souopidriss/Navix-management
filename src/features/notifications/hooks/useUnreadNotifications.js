/**
 * Navix Notifications — Notifications non lues (dropdown du Header)
 * --------------------------------------------------------------------------
 * Dérive les dernières notifications non lues pour le centre de notifications
 * du Header et le compteur affiché sur la cloche. Reste agnostique des filtres
 * de la page : seules les non lues « actives » (non archivées / ignorées)
 * sont prises en compte.
 */
import { useMemo } from 'react';
import { useNotificationsStore } from '../store';

const isActiveUnread = (notification) =>
  notification.status === 'unread' && !['archived', 'dismissed'].includes(notification.status);

const byNewest = (a, b) => (b.createdAt || '').localeCompare(a.createdAt || '');

/**
 * Dernières notifications non lues, triées par date décroissante.
 * @param {number} [limit] — nombre maximum renvoyé
 */
export const useUnreadNotifications = (limit = 6) => {
  const notifications = useNotificationsStore((state) => state.notifications);
  const unreadCount = useNotificationsStore((state) => state.unreadCount);

  return useMemo(() => {
    const unread = notifications.filter(isActiveUnread).sort(byNewest);
    return {
      unread: unread.slice(0, limit),
      count: unread.length,
      unreadCount,
      hasUnread: unreadCount > 0,
    };
  }, [notifications, unreadCount, limit]);
};
