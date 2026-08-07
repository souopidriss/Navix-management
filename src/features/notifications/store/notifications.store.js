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
import {
  emitNotificationAuditLog,
  emitNotificationPreferencesAuditLog,
} from '../services';

const toErrorMessage = (error, fallback) => error?.message || fallback;

const initialState = {
  notifications: [],
  selectedNotification: null,
  unreadCount: 0,
  stats: null,
  alerts: [],
  preferences: null,
  selectedIds: [],
  search: '',
  filters: {
    status: '',
    type: '',
    category: '',
    severity: '',
    resourceType: '',
    companyId: '',
    period: '',
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
      emitNotificationAuditLog({
        action: 'ARCHIVE',
        ids: [id],
        titles: notification.title,
      });
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
      const state = useNotificationsStore.getState();
      const target = state.notifications.find((item) => item.id === id);
      await notificationService.remove(id);
      set({
        notifications: state.notifications.filter((item) => item.id !== id),
        selectedNotification:
          state.selectedNotification?.id === id ? null : state.selectedNotification,
        unreadCount:
          state.notifications.find((item) => item.id === id)?.status === 'unread'
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
        selectedIds: state.selectedIds.filter((selectedId) => selectedId !== id),
        isSaving: false,
      });
      emitNotificationAuditLog({
        action: 'DELETE',
        ids: [id],
        titles: target?.title,
      });
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

  /* ------------------------------------------------------------------------
     Sélection multiple
     ------------------------------------------------------------------------ */

  /** Sélectionne / désélectionne une notification. */
  toggleSelect: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((selectedId) => selectedId !== id)
        : [...state.selectedIds, id],
    })),

  /** Sélectionne / désélectionne un lot (souvent la page courante). */
  toggleSelectAll: (ids) =>
    set((state) => {
      const selected = new Set(state.selectedIds);
      const allSelected = ids.length > 0 && ids.every((id) => selected.has(id));
      if (allSelected) {
        ids.forEach((id) => selected.delete(id));
      } else {
        ids.forEach((id) => selected.add(id));
      }
      return { selectedIds: Array.from(selected) };
    }),

  /** Vide la sélection. */
  clearSelection: () => set({ selectedIds: [] }),

  /* ------------------------------------------------------------------------
     Actions groupées (bulk)
     ------------------------------------------------------------------------ */

  /**
   * Marque la sélection courante comme lue.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  markSelectedAsRead: async () => {
    const ids = useNotificationsStore.getState().selectedIds;
    if (ids.length === 0) return { success: true };
    set({ isSaving: true, error: null });

    try {
      const result = await notificationService.markManyAsRead(ids);
      set((state) => ({
        notifications: state.notifications.map((item) =>
          ids.includes(item.id) && item.status === 'unread'
            ? { ...item, status: 'read', isRead: true, readAt: new Date().toISOString() }
            : item,
        ),
        unreadCount: Math.max(0, state.unreadCount - (result.count ?? ids.length)),
        selectedIds: [],
        isSaving: false,
      }));
      return { success: true, count: result.count ?? ids.length };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de marquer la sélection comme lue.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Marque la sélection courante comme non lue.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  markSelectedAsUnread: async () => {
    const ids = useNotificationsStore.getState().selectedIds;
    if (ids.length === 0) return { success: true };
    set({ isSaving: true, error: null });

    try {
      const result = await notificationService.markManyAsUnread(ids);
      set((state) => ({
        notifications: state.notifications.map((item) =>
          ids.includes(item.id) && item.status === 'read'
            ? { ...item, status: 'unread', isRead: false, readAt: null }
            : item,
        ),
        unreadCount: state.unreadCount + (result.count ?? ids.length),
        selectedIds: [],
        isSaving: false,
      }));
      return { success: true, count: result.count ?? ids.length };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de marquer la sélection comme non lue.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Archive la sélection courante.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  archiveSelected: async () => {
    const ids = useNotificationsStore.getState().selectedIds;
    if (ids.length === 0) return { success: true };
    set({ isSaving: true, error: null });

    try {
      const result = await notificationService.archiveMany(ids);
      set((state) => {
        const selectedUnread = state.notifications.filter(
          (item) => ids.includes(item.id) && item.status === 'unread',
        ).length;
        return {
          notifications: state.notifications.map((item) =>
            ids.includes(item.id)
              ? { ...item, status: 'archived', isRead: true, readAt: item.readAt ?? new Date().toISOString() }
              : item,
          ),
          unreadCount: Math.max(0, state.unreadCount - selectedUnread),
          selectedIds: [],
          isSaving: false,
        };
      });
      const titles = useNotificationsStore
        .getState()
        .notifications.filter((item) => ids.includes(item.id))
        .map((item) => item.title);
      emitNotificationAuditLog({ action: 'ARCHIVE', ids, titles });
      return { success: true, count: result.count ?? ids.length };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible d’archiver la sélection.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Supprime définitivement la sélection courante (simulée).
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  deleteSelected: async () => {
    const ids = useNotificationsStore.getState().selectedIds;
    if (ids.length === 0) return { success: true };
    set({ isSaving: true, error: null });

    try {
      const state = useNotificationsStore.getState();
      const titles = state.notifications
        .filter((item) => ids.includes(item.id))
        .map((item) => item.title);
      const selectedUnread = state.notifications.filter(
        (item) => ids.includes(item.id) && item.status === 'unread',
      ).length;

      const result = await notificationService.deleteMany(ids);
      set({
        notifications: state.notifications.filter((item) => !ids.includes(item.id)),
        selectedNotification:
          state.selectedNotification && ids.includes(state.selectedNotification.id)
            ? null
            : state.selectedNotification,
        unreadCount: Math.max(0, state.unreadCount - selectedUnread),
        selectedIds: [],
        isSaving: false,
      });
      emitNotificationAuditLog({ action: 'DELETE', ids, titles });
      return { success: true, count: result.count ?? ids.length };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de supprimer la sélection.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

  /* ------------------------------------------------------------------------
     Préférences de notification (source unique : Settings)
     ------------------------------------------------------------------------ */

  /**
   * Charge les préférences de notification (délégué aux Settings).
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  fetchPreferences: async () => {
    set({ error: null });

    try {
      const preferences = await notificationService.getPreferences();
      set({ preferences });
      return { success: true, data: preferences };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de charger les préférences.');
      set({ error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Met à jour les préférences de notification (délégué aux Settings).
   * @param {object} values
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  updatePreferences: async (values) => {
    set({ isSaving: true, error: null });

    try {
      const previous = useNotificationsStore.getState().preferences;
      const preferences = await notificationService.updatePreferences(values);
      set({ preferences, isSaving: false });
      emitNotificationPreferencesAuditLog({ oldValues: previous, newValues: preferences });
      return { success: true, data: preferences };
    } catch (error) {
      const message = toErrorMessage(error, 'Impossible de mettre à jour les préférences.');
      set({ isSaving: false, error: message });
      return { success: false, error: message };
    }
  },

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
