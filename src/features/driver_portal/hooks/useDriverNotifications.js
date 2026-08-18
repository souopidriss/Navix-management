/**
 * Navix Management — useDriverNotifications
 * --------------------------------------------------------------------------
 * Chargement des notifications du chauffeur et actions locales
 * (marquer comme lue / archiver / tout marquer comme lu) en mode mock.
 */
import { useState, useEffect, useCallback } from 'react';
import { driverPortalService } from '../services/driverPortalService';
import { useDriverResource } from './useDriverResource';

export const useDriverNotifications = () => {
  const fetcher = useCallback(() => driverPortalService.getNotifications(), []);
  const { data, isLoading, error, refetch } = useDriverResource(fetcher);

  const [notifications, setNotifications] = useState([]);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (data) setNotifications(data);
  }, [data]);

  const markAsRead = useCallback(async (id) => {
    setBusyId(id);
    try {
      await driverPortalService.markNotificationAsRead(id);
      setNotifications((items) => items.map((item) => (item.id === id ? { ...item, status: 'read' } : item)));
    } finally {
      setBusyId(null);
    }
  }, []);

  const archive = useCallback(async (id) => {
    setBusyId(id);
    try {
      await driverPortalService.archiveNotification(id);
      setNotifications((items) => items.map((item) => (item.id === id ? { ...item, status: 'archived' } : item)));
    } finally {
      setBusyId(null);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((item) => item.status === 'unread');
    await Promise.all(unread.map((item) => driverPortalService.markNotificationAsRead(item.id)));
    setNotifications((items) => items.map((item) => ({ ...item, status: 'read' })));
  }, [notifications]);

  return {
    notifications,
    unreadCount: notifications.filter((item) => item.status === 'unread').length,
    isLoading,
    error,
    refetch,
    busyId,
    markAsRead,
    archive,
    markAllAsRead,
  };
};
