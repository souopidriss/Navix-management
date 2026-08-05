/**
 * Navix Notifications — Alertes automatiques (simulées)
 * --------------------------------------------------------------------------
 * Expose la génération d'alertes (AlertService), l'état de génération et les
 * dernières alertes générées en session. S'abonne au canal temps réel simulé
 * (NotificationRealtimeService) pour les notifications entrantes.
 */
import { useEffect } from 'react';
import { useNotificationsStore } from '../store';
import { notificationRealtimeService } from '../services';

export const useAlerts = () => {
  const alerts = useNotificationsStore((state) => state.alerts);
  const isGenerating = useNotificationsStore((state) => state.isGenerating);
  const generateAlerts = useNotificationsStore((state) => state.generateAlerts);
  const fetchUnreadCount = useNotificationsStore((state) => state.fetchUnreadCount);
  const fetchNotifications = useNotificationsStore((state) => state.fetchNotifications);

  useEffect(() => {
    notificationRealtimeService.connect();

    const unsubscribe = notificationRealtimeService.onNotification(() => {
      fetchUnreadCount();
      fetchNotifications();
    });

    return () => {
      unsubscribe();
      notificationRealtimeService.disconnect();
    };
  }, [fetchUnreadCount, fetchNotifications]);

  return { alerts, isGenerating, generateAlerts };
};
