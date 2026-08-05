/**
 * Navix Notifications — NotificationService
 * --------------------------------------------------------------------------
 * Description : centre de notifications de l'utilisateur connecté —
 * liste, détail, compteur de non-lues, marquage lu / non lu / tout lu,
 * archivage, suppression et génération d'alertes automatiques.
 * Responsabilité : fournir les données de notification aux vues et aux
 *                  stores. Mode mock : données simulées en mémoire, aucune
 *                  requête HTTP.
 *
 * Méthodes :
 *   getAll()              → liste des notifications (plus récentes d'abord)
 *   getById(id)           → détail d'une notification (404 si absente)
 *   getUnread()           → notifications non lues
 *   getUnreadCount()      → { count } non-lues
 *   markAsRead(id)        → marque une notification comme lue
 *   markAsUnread(id)      → marque une notification comme non lue
 *   markAllAsRead()       → marque toutes les notifications comme lues
 *   archive(id)           → archive une notification
 *   dismiss(id)           → ignore une notification (supprimée des vues par défaut)
 *   remove(id)            → suppression définitive (simulée)
 *   getAlertRules()       → règles d'alerte actives
 *   getStatistics()       → indicateurs dérivés de la liste
 *
 * Exemple d'utilisation :
 *   import { notificationService } from '../services';
 *   const { count } = await notificationService.getUnreadCount();
 */
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '@/services/client';
import { apiConfig } from '@/services/config';
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { MOCK_NOTIFICATIONS, MOCK_NOTIFICATIONS_BY_ID } from '../mocks';
import { ALERT_RULES, countUrgentNotifications } from '../constants';

let notificationsCache = null;

/**
 * Cache mémoire de session. Uniquement accessible au module (partagé avec
 * AlertService pour y injecter les alertes générées).
 * @returns {Array<object>}
 */
export const getNotificationsCache = () => {
  if (!notificationsCache) {
    notificationsCache = MOCK_NOTIFICATIONS.map((notification) => ({
      ...notification,
      metadata: { ...notification.metadata },
    }));
  }
  return notificationsCache;
};

/** Réinitialise le cache (utilisé par les tests et le reset du store). */
export const resetNotificationsCache = () => {
  notificationsCache = null;
  return getNotificationsCache();
};

const findNotification = (id) => getNotificationsCache().find((item) => item.id === id);

const now = () => new Date().toISOString();

const entityNotFound = (message = 'Notification introuvable.') =>
  mockResponse(null, { error: ApiError.notFound(message) });

export const notificationService = {
  /**
   * Liste de toutes les notifications (copie), triées de la plus récente à
   * la plus ancienne.
   * @returns {Promise<Array<object>>}
   */
  async getAll() {
    if (apiConfig.mock) {
      const list = [...getNotificationsCache()].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      );
      return mockResponse(list.map((item) => ({ ...item })));
    }

    const { data } = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST);
    return data;
  },

  /**
   * Détail d'une notification.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getById(id) {
    if (apiConfig.mock) {
      const notification = findNotification(id);
      if (!notification) return entityNotFound();
      return mockResponse({ ...notification });
    }

    const { data } = await apiClient.get(`${API_ENDPOINTS.NOTIFICATIONS.LIST}/${id}`);
    return data;
  },

  /**
   * Notifications non lues (utile pour le panneau du Header).
   * @returns {Promise<Array<object>>}
   */
  async getUnread() {
    if (apiConfig.mock) {
      const list = getNotificationsCache()
        .filter((notification) => notification.status === 'unread')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return mockResponse(list.map((item) => ({ ...item })));
    }

    const { data } = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
    return data;
  },

  /**
   * Nombre de notifications non lues.
   * @returns {Promise<{ count: number }>}
   */
  async getUnreadCount() {
    if (apiConfig.mock) {
      const count = getNotificationsCache().filter(
        (notification) => notification.status === 'unread',
      ).length;
      return mockResponse({ count });
    }

    const { data } = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
    return data;
  },

  /**
   * Marque une notification comme lue.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async markAsRead(id) {
    if (apiConfig.mock) {
      const notification = findNotification(id);
      if (!notification) return entityNotFound();
      if (notification.status !== 'read') {
        notification.status = 'read';
        notification.isRead = true;
        notification.readAt = notification.readAt ?? now();
        notification.updatedAt = now();
      }
      return mockResponse({ ...notification });
    }

    const { data } = await apiClient.patch(`${API_ENDPOINTS.NOTIFICATIONS.LIST}/${id}/read`);
    return data;
  },

  /**
   * Marque une notification comme non lue.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async markAsUnread(id) {
    if (apiConfig.mock) {
      const notification = findNotification(id);
      if (!notification) return entityNotFound();
      notification.status = 'unread';
      notification.isRead = false;
      notification.readAt = null;
      notification.updatedAt = now();
      return mockResponse({ ...notification });
    }

    const { data } = await apiClient.patch(`${API_ENDPOINTS.NOTIFICATIONS.LIST}/${id}/unread`);
    return data;
  },

  /**
   * Marque toutes les notifications comme lues.
   * @returns {Promise<{ count: number }>}
   */
  async markAllAsRead() {
    if (apiConfig.mock) {
      const stamp = now();
      const list = getNotificationsCache();
      list.forEach((notification) => {
        if (notification.status === 'unread') {
          notification.status = 'read';
          notification.isRead = true;
          notification.readAt = stamp;
          notification.updatedAt = stamp;
        }
      });
      return mockResponse({ count: list.length });
    }

    const { data } = await apiClient.post(`${API_ENDPOINTS.NOTIFICATIONS.LIST}/read-all`);
    return data;
  },

  /**
   * Archive une notification.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async archive(id) {
    if (apiConfig.mock) {
      const notification = findNotification(id);
      if (!notification) return entityNotFound();
      notification.status = 'archived';
      notification.isRead = true;
      notification.readAt = notification.readAt ?? now();
      notification.updatedAt = now();
      return mockResponse({ ...notification });
    }

    const { data } = await apiClient.patch(`${API_ENDPOINTS.NOTIFICATIONS.LIST}/${id}/archive`);
    return data;
  },

  /**
   * Ignore une notification : elle disparaît des vues par défaut (filtre
   * statut exclut 'dismissed').
   * @param {string} id
   * @returns {Promise<object>}
   */
  async dismiss(id) {
    if (apiConfig.mock) {
      const notification = findNotification(id);
      if (!notification) return entityNotFound();
      notification.status = 'dismissed';
      notification.isRead = true;
      notification.readAt = notification.readAt ?? now();
      notification.updatedAt = now();
      return mockResponse({ ...notification });
    }

    const { data } = await apiClient.patch(`${API_ENDPOINTS.NOTIFICATIONS.LIST}/${id}/dismiss`);
    return data;
  },

  /**
   * Suppression définitive (simulée).
   * @param {string} id
   * @returns {Promise<{ success: boolean }>}
   */
  async remove(id) {
    if (apiConfig.mock) {
      const notification = findNotification(id);
      if (!notification) return entityNotFound();
      const list = getNotificationsCache();
      list.splice(list.indexOf(notification), 1);
      return mockResponse({ success: true });
    }

    const { data } = await apiClient.delete(`${API_ENDPOINTS.NOTIFICATIONS.LIST}/${id}`);
    return data;
  },

  /**
   * Règles d'alerte automatiques (copie).
   * @returns {Promise<Array<object>>}
   */
  async getAlertRules() {
    if (apiConfig.mock) {
      return mockResponse(ALERT_RULES.map((rule) => ({ ...rule })));
    }

    const { data } = await apiClient.get('/notifications/alert-rules');
    return data;
  },

  /**
   * Indicateurs dérivés de la liste (cartes de la page Notifications).
   * @returns {Promise<object>}
   */
  async getStatistics() {
    if (apiConfig.mock) {
      const list = getNotificationsCache();
      const unread = list.filter((item) => item.status === 'unread');
      const stats = {
        total: list.length,
        unread: unread.length,
        read: list.filter((item) => item.status === 'read').length,
        archived: list.filter((item) => item.status === 'archived').length,
        dismissed: list.filter((item) => item.status === 'dismissed').length,
        urgent: countUrgentNotifications(list),
        byType: Object.fromEntries(
          Object.entries(
            list.reduce((acc, item) => {
              acc[item.type] = (acc[item.type] ?? 0) + 1;
              return acc;
            }, {}),
          ).sort((a, b) => b[1] - a[1]),
        ),
      };
      return mockResponse(stats);
    }

    const { data } = await apiClient.get('/notifications/statistics');
    return data;
  },
};
