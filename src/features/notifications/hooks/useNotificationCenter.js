/**
 * Navix Notifications — Centre de notifications (navbar / dashboard)
 * --------------------------------------------------------------------------
 * Facade du centre de notifications réutilisable : dernières notifications
 * non lues, compteur, actions (marquer lu / tout lu / archive / suppression /
 * ignorée) et connexion au flux temps réel simulé. Ne manipule jamais le
 * service de données directement ; seul le temps réel (sans état store) est
 * délégué au NotificationRealtimeService.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { notificationRealtimeService } from '../services';
import { useUnreadNotifications } from './useUnreadNotifications';
import { useNotificationActions } from './useNotificationActions';

export const useNotificationCenter = (options = {}) => {
  const { limit = 6 } = options;

  const { unread, count, unreadCount, hasUnread } = useUnreadNotifications(limit);
  const { actions, isSaving } = useNotificationActions();

  const [isConnected, setIsConnected] = useState(() =>
    notificationRealtimeService.isConnected(),
  );

  useEffect(() => {
    const unsubscribe = notificationRealtimeService.subscribe(
      'connection',
      (event) => setIsConnected(Boolean(event?.connected)),
    );
    return unsubscribe;
  }, []);

  const toggleRealtime = useCallback(() => {
    if (notificationRealtimeService.isConnected()) {
      notificationRealtimeService.disconnect();
    } else {
      notificationRealtimeService.connect();
    }
  }, []);

  return useMemo(
    () => ({
      notifications: unread,
      count,
      unreadCount,
      hasUnread,
      isConnected,
      toggleRealtime,
      actions,
      isSaving,
    }),
    [unread, count, unreadCount, hasUnread, isConnected, toggleRealtime, actions, isSaving],
  );
};
