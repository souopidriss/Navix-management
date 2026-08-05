/**
 * Navix Notifications — Store du module Notifications & Alertes (Zustand)
 * --------------------------------------------------------------------------
 * État : notifications, selectedNotification, unreadCount, stats, alerts,
 * search, filters (status, type, category, severity, resourceType, companyId,
 * dateFrom, dateTo, showUnread), sort, pagination (page, pageSize),
 * isLoading, isSaving, isGenerating, error.
 *
 * Actions : fetchNotifications, fetchNotification, fetchUnreadCount,
 * fetchStatistics, markAsRead, markAsUnread, markAllAsRead, archive, dismiss,
 * remove, generateAlerts, setSearch, setFilter, resetFilters, setSort,
 * setPage, setPageSize, clearError, reset.
 *
 * Non persisté : les données proviennent du service mocké (mémoire de session).
 * La liste affichée (filtre + tri + pagination) est dérivée par le hook
 * `useNotificationListData` — le store ne stocke que l'état source et les
 * critères.
 */
import { create } from 'zustand';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { notificationService, alertService } from '../services';

const toErrorMessage = (error, fallback) => error?.message || fallback;

const initialState = {
  notifications: [],
  selectedNotification: null,
  unreadCount: 0,
  stats: null,
  alerts: [],
  search: '',
  filters: {
    status: '',
    type: '',
    category: '',
    severity: '',
    resourceType: '',
    companyId: '',
    dateFrom: '',
    dateTo: '',
    showUnread: false,
  },
  sort: {
    by: 'createdAt',
    direction: 'desc',
  },
  pagination: {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  },
  isLoading: false,
  isSaving: false,
  isGenerating: false,
  error: null,
};

const upsertNotification = (list, updated) =>
  list.some((item) => item.id === updated.id)
    ? list.map((item) => (item.id === updated.id ? updated : item))
    : [updated, ...list];

const useNotificationsStore = create((set) => ({
  ...initialState,

  /**
   * Charge la liste des notifications et le compteur de non-lues.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchNotifications: async () => {
    set({ isLoading: true, error: null });

    try {
      const [notifications, unreadResult, stats] = await Promise.all([
        notificationService.getAll(),
        notificationService.getUnreadCount(),
        notificationService.getStatistics(),
      ]);
      set({
        notifications,
        unreadCount: unreadResult?.count ?? 0,
        stats,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les notifications.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Charge le détail d'une notification (et la marque comme lue).
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchNotification: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const notification = await notificationService.getById(id);
      if (!notification) {
        const message = 'Notification introuvable.';
        set({ isLoading: false, error: message });
        return { success: false, error: message };
      }

      let unreadCount = useNotificationsStore.getState().unreadCount;
      let current = notification;
      if (notification.status === 'unread') {
        current = await notificationService.markAsRead(id);
        unreadCount = Math.max(0, unreadCount - 1);
      }

      set((state) => ({
        selectedNotification: current,
        notifications: upsertNotification(state.notifications, current),
        unreadCount,
        isLoading: false,
      }));
      return { success: true, data: current };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger la notification.');
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Recharge uniquement le compteur de non-lues.
   * @returns {Promise<{ success: boolean, count?: number }>}
   */
  fetchUnreadCount: async () => {
    try {
      const { count } = await notificationService.getUnreadCount();
      set({ unreadCount: count ?? 0 });
      return { success: true, count: count ?? 0 };
    } catch (error) {
      return { success: false, error: toErrorMessage(error, 'Compteur indisponible.') };
    }
  },

  /**
   * Recharge les indicateurs de la page Notifications.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchStatistics: async () => {
    try {
      const stats = await notificationService.getStatistics();
      set({ stats });
      return { success: true };
    } catch (error) {
      return { success: false, error: toErrorMessage(error, 'Statistiques indisponibles.') };
    }
  },

  /**
   * Marque une notification comme lue.
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  markAsRead: async (id) => {
    set({ isSaving: true, error: null });

    try {
      const notification = await notificationService.markAsRead(id);
      set((state) => {
        const wasUnread = state.notifications.find((item) => item.id === id)?.status === 'unread';
        return {
          notifications: upsertNotification(state.notifications, notification),
          selectedNotification:
            state.selectedNotification?.id === id ? notification : state.selectedNotification,
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          isSaving: false,
        };
      });
      return { success: true, data: notification };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de marquer la notification comme lue.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Marque une notification comme non lue.
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  markAsUnread: async (id) => {
    set({ isSaving: true, error: null });

    try {
      const notification = await notificationService.markAsUnread(id);
      set((state) => ({
        notifications: upsertNotification(state.notifications, notification),
        selectedNotification:
          state.selectedNotification?.id === id ? notification : state.selectedNotification,
        unreadCount: state.unreadCount + 1,
        isSaving: false,
      }));
      return { success: true, data: notification };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de marquer la notification comme non lue.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Marque toutes les notifications comme lues.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  markAllAsRead: async () => {
    set({ isSaving: true, error: null });

    try {
      await notificationService.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((item) =>
          item.status === 'unread'
            ? { ...item, status: 'read', isRead: true, readAt: new Date().toISOString() }
            : item,
        ),
        selectedNotification:
          state.selectedNotification?.status === 'unread'
            ? { ...state.selectedNotification, status: 'read', isRead: true }
            : state.selectedNotification,
        unreadCount: 0,
        isSaving: false,
      }));
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de tout marquer comme lu.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Archive une notification.
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  archive: async (id) => {
    set({ isSaving: true, error: null });

    try {
      const notification = await notificationService.archive(id);
      set((state) => ({
        notifications: upsertNotification(state.notifications, notification),
        selectedNotification:
          state.selectedNotification?.id === id ? notification : state.selectedNotification,
        unreadCount:
          state.notifications.find((item) => item.id === id)?.status === 'unread'
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
        isSaving: false,
      }));
      return { success: true, data: notification };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible d’archiver la notification.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Ignore une notification (retirée des vues par défaut).
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  dismiss: async (id) => {
    set({ isSaving: true, error: null });

    try {
      const notification = await notificationService.dismiss(id);
      set((state) => ({
        notifications: upsertNotification(state.notifications, notification),
        selectedNotification:
          state.selectedNotification?.id === id ? notification : state.selectedNotification,
        unreadCount:
          state.notifications.find((item) => item.id === id)?.status === 'unread'
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
        isSaving: false,
      }));
      return { success: true, data: notification };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible d’ignorer la notification.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Suppression définitive (simulée).
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  remove: async (id) => {
    set({ isSaving: true, error: null });

    try {
      await notificationService.remove(id);
      set((state) => ({
        notifications: state.notifications.filter((item) => item.id !== id),
        selectedNotification:
          state.selectedNotification?.id === id ? null : state.selectedNotification,
        unreadCount:
          state.notifications.find((item) => item.id === id)?.status === 'unread'
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
        isSaving: false,
      }));
      return { success: true };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de supprimer la notification.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Génère les alertes automatiques simulées (AlertService).
   * @returns {Promise<{ success: boolean, count: number, error?: string }>}
   */
  generateAlerts: async () => {
    set({ isGenerating: true, error: null });

    try {
      const alerts = await alertService.generateAlerts();
      set((state) => ({
        alerts: [...alerts, ...state.alerts].slice(0, 20),
        notifications: alerts.length > 0 ? [...alerts, ...state.notifications] : state.notifications,
        unreadCount: state.unreadCount + alerts.length,
        isGenerating: false,
      }));
      return { success: true, count: alerts.length };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de générer les alertes.');
      set({ isGenerating: false, error: message });
      return { success: false, count: 0, error: message };
    }
  },

  /** Recherche instantanée (réinitialise la page courante). */
  setSearch: (search) =>
    set((state) => ({ search, pagination: { ...state.pagination, page: 1 } })),

  /** Applique un filtre (réinitialise la page courante). */
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      pagination: { ...state.pagination, page: 1 },
    })),

  /** Réinitialise la recherche et les filtres. */
  resetFilters: () =>
    set((state) => ({
      search: '',
      filters: initialState.filters,
      pagination: { ...state.pagination, page: 1 },
    })),

  /** Applique le tri (réinitialise la page courante). */
  setSort: (by, direction) =>
    set((state) => ({ sort: { by, direction }, pagination: { ...state.pagination, page: 1 } })),

  /** Change de page. */
  setPage: (page) => set((state) => ({ pagination: { ...state.pagination, page } })),

  /** Change la taille de page. */
  setPageSize: (pageSize) => set({ pagination: { page: 1, pageSize } }),

  /** Efface l'erreur courante. */
  clearError: () => set({ error: null }),

  /** Réinitialise entièrement le store. */
  reset: () => set({ ...initialState }),
}));

export default useNotificationsStore;
