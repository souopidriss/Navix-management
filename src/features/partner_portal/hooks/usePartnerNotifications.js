/**
 * Navix Partner Portal — usePartnerNotifications (PROMPT 067)
 * --------------------------------------------------------------------------
 * Hook d'accès aux notifications et activités de l'Espace Partenaire (isolées
 * multi-tenant par companyId + userId partenaire). Réutilise le moteur de
 * notifications existant. Actions : lues / non lues (simple et en masse), tout
 * marquer lu, archiver (simple et en masse), supprimer (simple et en masse).
 *
 * PROMPT 067 : ajout du search, des filtres (statut, type, priorité, période),
 * du tri, de la pagination et des activités récentes.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { partnerNotificationService } from '../services/partnerNotificationService';

const usePartnerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [activities, setActivities] = useState([]);
  const [statistics, setStatistics] = useState({ total: 0, unread: 0, read: 0, important: 0, today: 0, archived: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const mountedRef = useRef(true);

  const [search, setSearch] = useState('');
  const [filters, setFiltersState] = useState({
    status: '',
    type: '',
    severity: '',
    period: '',
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [items, stats, act] = await Promise.all([
        partnerNotificationService.getAll(),
        partnerNotificationService.getStatistics(),
        partnerNotificationService.getActivities(),
      ]);
      if (!mountedRef.current) return;
      setNotifications(items);
      setStatistics(stats);
      setActivities(act);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err?.message || 'Impossible de charger les notifications.');
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const markAsRead = useCallback(async (id) => {
    const result = await partnerNotificationService.markAsRead(id);
    return result;
  }, []);

  const markManyAsRead = useCallback(async (ids) => {
    const result = await partnerNotificationService.markManyAsRead(ids);
    return result;
  }, []);

  const markManyAsUnread = useCallback(async (ids) => {
    const result = await partnerNotificationService.markManyAsUnread(ids);
    return result;
  }, []);

  const markAllAsRead = useCallback(async () => {
    const result = await partnerNotificationService.markAllAsRead();
    return result;
  }, []);

  const archive = useCallback(async (id) => {
    const result = await partnerNotificationService.archive(id);
    return result;
  }, []);

  const archiveMany = useCallback(async (ids) => {
    const result = await partnerNotificationService.archiveMany(ids);
    return result;
  }, []);

  const deleteNotification = useCallback(async (id) => {
    const result = await partnerNotificationService.deleteOne(id);
    return result;
  }, []);

  const deleteMany = useCallback(async (ids) => {
    const result = await partnerNotificationService.deleteMany(ids);
    return result;
  }, []);

  const isWithinDays = useCallback((dateStr, days) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return false;
    const now = Date.now();
    return now - date.getTime() <= days * 86_400_000;
  }, []);

  const isTodayDate = useCallback((dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return false;
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }, []);

  const filteredNotifications = useMemo(() => {
    const term = search.trim().toLowerCase();
    return notifications.filter((notification) => {
      if (notification.archived) return false;
      if (filters.status === 'unread' && notification.isRead) return false;
      if (filters.status === 'read' && !notification.isRead) return false;
      if (filters.type && notification.type !== filters.type) return false;
      if (filters.severity && notification.severity !== filters.severity) return false;
      if (filters.period === 'today' && !isTodayDate(notification.createdAt)) return false;
      if (filters.period === 'last7' && !isWithinDays(notification.createdAt, 7)) return false;
      if (filters.period === 'last30' && !isWithinDays(notification.createdAt, 30)) return false;
      if (term) {
        const haystack = `${notification.title || ''} ${notification.message || ''} ${notification.type || ''} ${notification.kind || ''}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [notifications, search, filters, isWithinDays, isTodayDate]);

  const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredNotifications.slice(start, start + pageSize);
  }, [filteredNotifications, safePage, pageSize]);

  const unreadCount = statistics.unread ?? 0;
  const hasActiveFilters = Boolean(search || filters.status || filters.type || filters.severity || filters.period);

  const resetFilters = useCallback(() => {
    setSearch('');
    setFiltersState({ status: '', type: '', severity: '', period: '' });
    setPage(1);
  }, []);

  return {
    notifications,
    filteredNotifications,
    activities,
    unreadCount,
    statistics,
    isLoading,
    error,
    refetch,
    search,
    setSearch,
    filters,
    setFilters: (patch) => {
      setFiltersState((prev) => (typeof patch === 'function' ? patch(prev) : { ...prev, ...patch }));
      setPage(1);
    },
    hasActiveFilters,
    resetFilters,
    page: safePage,
    setPage,
    pageSize,
    setPageSize: (size) => { setPageSize(size); setPage(1); },
    totalPages,
    totalItems: filteredNotifications.length,
    pageItems,
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

export default usePartnerNotifications;
