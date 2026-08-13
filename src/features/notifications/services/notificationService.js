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
 *   markManyAsRead(ids)   → marque une sélection comme lue
 *   markManyAsUnread(ids) → marque une sélection comme non lue
 *   archiveMany(ids)      → archive une sélection
 *   deleteMany(ids)       → suppression définitive d'une sélection
 *   getAlertRules()       → règles d'alerte actives
 *   getStatistics()       → indicateurs dérivés de la liste
 *   getPreferences(ctx)   → préférences de notification (Settings)
 *   updatePreferences(values, ctx) → met à jour les préférences (Settings)
 *
 * Multi-tenant : les notifications sont bornées à l'entreprise courante
 * (`getNotificationCompanyScopeId`) — sauf super_admin qui voit tout. Une
 * entreprise ne voit jamais les notifications d'une autre entreprise.
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
import { useAuthStore } from '@/features/auth';
import { getTenantScopeCompanyId } from '@/utils/tenantScope';
import { settingsService } from '@/features/settings/services';
import { MOCK_NOTIFICATIONS } from '../mocks';
import { ALERT_RULES, countUrgentNotifications } from '../constants';

let notificationsCache = null;

/* --------------------------------------------------------------------------
   Portée multi-tenant
   -------------------------------------------------------------------------- */

/** Entreprise du contexte courant (simulation tenant) — source canonique. */
export const getNotificationCompanyScopeId = () => getTenantScopeCompanyId();

/** Liste des notifications visibles par l'utilisateur courant. */
const scopedList = () => {
  const scope = getNotificationCompanyScopeId();
  const list = getNotificationsCache();
  return scope ? list.filter((notification) => notification.companyId === scope) : list;
};

/** Carte id → notification restreinte à la portée courante. */
const scopedById = (id) => {
  const scope = getNotificationCompanyScopeId();
  const notification = getNotificationsCache().find((item) => item.id === id);
  if (!notification) return null;
  if (scope && notification.companyId !== scope) return null;
  return notification;
};

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
      const list = scopedList().sort((a, b) =>
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
      const notification = scopedById(id);
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
      const list = scopedList()
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
      const count = scopedList().filter(
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
      const notification = scopedById(id);
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
      const notification = scopedById(id);
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
      const list = scopedList();
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
      const notification = scopedById(id);
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
      const notification = scopedById(id);
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
      const notification = scopedById(id);
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
      const list = scopedList();
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

  /* ------------------------------------------------------------------------
     Actions groupées (bulk) — sélection multiple
     ------------------------------------------------------------------------ */

  /**
   * Marque une sélection de notifications comme lues.
   * @param {string[]} ids
   * @returns {Promise<{ count: number }>}
   */
  async markManyAsRead(ids) {
    const list = getNotificationsCache();
    const stamp = now();
    const targets = list.filter((item) => ids.includes(item.id) && item.status !== 'read');
    targets.forEach((notification) => {
      notification.status = 'read';
      notification.isRead = true;
      notification.readAt = notification.readAt ?? stamp;
      notification.updatedAt = stamp;
    });
    return mockResponse({ count: targets.length });
  },

  /**
   * Marque une sélection de notifications comme non lues.
   * @param {string[]} ids
   * @returns {Promise<{ count: number }>}
   */
  async markManyAsUnread(ids) {
    const list = getNotificationsCache();
    const stamp = now();
    const targets = list.filter((item) => ids.includes(item.id) && item.status === 'read');
    targets.forEach((notification) => {
      notification.status = 'unread';
      notification.isRead = false;
      notification.readAt = null;
      notification.updatedAt = stamp;
    });
    return mockResponse({ count: targets.length });
  },

  /**
   * Archive une sélection de notifications.
   * @param {string[]} ids
   * @returns {Promise<{ count: number }>}
   */
  async archiveMany(ids) {
    const list = getNotificationsCache();
    const stamp = now();
    const targets = list.filter((item) => ids.includes(item.id) && item.status !== 'archived');
    targets.forEach((notification) => {
      notification.status = 'archived';
      notification.isRead = true;
      notification.readAt = notification.readAt ?? stamp;
      notification.updatedAt = stamp;
    });
    return mockResponse({ count: targets.length });
  },

  /**
   * Suppression définitive d'une sélection (simulée).
   * @param {string[]} ids
   * @returns {Promise<{ success: boolean, count: number }>}
   */
  async deleteMany(ids) {
    const list = getNotificationsCache();
    const before = list.length;
    for (let i = list.length - 1; i >= 0; i -= 1) {
      if (ids.includes(list[i].id)) list.splice(i, 1);
    }
    return mockResponse({ success: true, count: before - list.length });
  },

  /* ------------------------------------------------------------------------
     Préférences de notification (source unique : Settings)
     ------------------------------------------------------------------------ */

  /**
   * Portée de lecture des préférences (entreprise + utilisateur courants).
   */
  getPreferenceScope() {
    const { user } = useAuthStore.getState();
    return {
      companyScopeId: getTenantScopeCompanyId(),
      userId: user?.id ?? 'usr_001',
    };
  },

  /**
   * Préférences de notification (délégué à la section `notifications` des
   * Settings — pas de duplication de la source de vérité).
   * @returns {Promise<object>}
   */
  async getPreferences() {
    if (apiConfig.mock) {
      return mockResponse(settingsService.getNotificationSettings(this.getPreferenceScope()));
    }
    const { data } = await apiClient.get(API_ENDPOINTS.SETTINGS.NOTIFICATIONS);
    return data;
  },

  /**
   * Met à jour les préférences de notification (délégué aux Settings).
   * @param {object} values — préférences validées par le schéma
   * @returns {Promise<object>}
   */
  async updatePreferences(values) {
    if (apiConfig.mock) {
      return mockResponse(
        settingsService.updateNotificationSettings(values, this.getPreferenceScope()),
      );
    }
    const { data } = await apiClient.patch(API_ENDPOINTS.SETTINGS.NOTIFICATIONS, values);
    return data;
  },
};
