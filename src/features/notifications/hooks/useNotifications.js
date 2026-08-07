/**
 * Navix Notifications — Facade de données du module
 * --------------------------------------------------------------------------
 * Point d'accès unique au store de notifications pour les composants : liste,
 * compteur, statistiques, alertes, état de chargement et actions de chargement
 * (init + refresh). Les composants ne manipulent jamais le service directement.
 */
import { useCallback, useMemo } from 'react';
import { useNotificationsStore } from '../store';

export const useNotifications = () => {
  const notifications = useNotificationsStore((state) => state.notifications);
  const selectedNotification = useNotificationsStore((state) => state.selectedNotification);
  const unreadCount = useNotificationsStore((state) => state.unreadCount);
  const stats = useNotificationsStore((state) => state.stats);
  const alerts = useNotificationsStore((state) => state.alerts);
  const isLoading = useNotificationsStore((state) => state.isLoading);
  const isSaving = useNotificationsStore((state) => state.isSaving);
  const isGenerating = useNotificationsStore((state) => state.isGenerating);
  const error = useNotificationsStore((state) => state.error);

  const fetchNotifications = useNotificationsStore((state) => state.fetchNotifications);
  const fetchUnreadCount = useNotificationsStore((state) => state.fetchUnreadCount);
  const fetchStatistics = useNotificationsStore((state) => state.fetchStatistics);
  const fetchNotification = useNotificationsStore((state) => state.fetchNotification);
  const generateAlerts = useNotificationsStore((state) => state.generateAlerts);
  const clearError = useNotificationsStore((state) => state.clearError);

  const initialize = useCallback(async () => {
    await Promise.all([fetchNotifications(), fetchUnreadCount(), fetchStatistics()]);
  }, [fetchNotifications, fetchUnreadCount, fetchStatistics]);

  const refresh = useCallback(async () => {
    await Promise.all([fetchNotifications(), fetchUnreadCount()]);
  }, [fetchNotifications, fetchUnreadCount]);

  return useMemo(
    () => ({
      notifications,
      selectedNotification,
      unreadCount,
      stats,
      alerts,
      isLoading,
      isSaving,
      isGenerating,
      error,
      initialize,
      refresh,
      fetchNotifications,
      fetchUnreadCount,
      fetchStatistics,
      fetchNotification,
      generateAlerts,
      clearError,
    }),
    [
      notifications,
      selectedNotification,
      unreadCount,
      stats,
      alerts,
      isLoading,
      isSaving,
      isGenerating,
      error,
      initialize,
      refresh,
      fetchNotifications,
      fetchUnreadCount,
      fetchStatistics,
      fetchNotification,
      generateAlerts,
      clearError,
    ],
  );
};
