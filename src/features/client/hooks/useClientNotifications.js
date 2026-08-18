/**
 * Navix Client — Hook useClientNotifications
 * --------------------------------------------------------------------------
 * Charge les notifications du Client (isolées multi-tenant) via
 * `clientNotificationService` et expose les opérations : marquage lu /
 * non-lu (individuel ou en lot), tout marquer lu, archivage et suppression.
 */
import { useState, useEffect, useCallback } from 'react';
import { useClientStore } from '../store/client.store';
import { clientNotificationService } from '../services/clientNotificationService';

export const useClientNotifications = () => {
  const clientType = useClientStore((state) => state.clientType);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [list, count] = await Promise.all([
        clientNotificationService.getAll(clientType),
        clientNotificationService.getUnreadCount(clientType),
      ]);
      setNotifications(list);
      setUnreadCount(count);
    } catch (err) {
      setError(err?.message || 'Impossible de charger vos notifications.');
    } finally {
      setIsLoading(false);
    }
  }, [clientType]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const refreshCounts = useCallback(async () => {
    const count = await clientNotificationService.getUnreadCount(clientType);
    setUnreadCount(count);
  }, [clientType]);

  const markAsRead = useCallback(
    async (id, isRead = true) => {
      const result = await clientNotificationService.markAsRead(id, isRead);
      await refreshCounts();
      return result;
    },
    [refreshCounts],
  );

  const markManyAsRead = useCallback(
    async (ids) => {
      const result = await clientNotificationService.markManyAsRead(ids);
      await refreshCounts();
      return result;
    },
    [refreshCounts],
  );

  const markManyAsUnread = useCallback(
    async (ids) => {
      const result = await clientNotificationService.markManyAsUnread(ids);
      await refreshCounts();
      return result;
    },
    [refreshCounts],
  );

  const markAllAsRead = useCallback(async () => {
    const result = await clientNotificationService.markAllAsRead();
    await refreshCounts();
    return result;
  }, [refreshCounts]);

  const archive = useCallback((id) => clientNotificationService.archive(id), []);
  const archiveMany = useCallback((ids) => clientNotificationService.archiveMany(ids), []);
  const deleteNotification = useCallback((id) => clientNotificationService.remove(id), []);
  const deleteMany = useCallback((ids) => clientNotificationService.removeMany(ids), []);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markManyAsRead,
    markManyAsUnread,
    markAllAsRead,
    archive,
    archiveMany,
    deleteNotification,
    deleteMany,
  };
};

export default useClientNotifications;
