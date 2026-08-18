/**
 * Navix Client — Service Notifications (Espace Client / Entreprise)
 * --------------------------------------------------------------------------
 * PROMPT 058 — Notifications strictement isolées multi-tenant (companyId
 * Transports Express Cameroun) et par utilisateur (userId du démo usr_001).
 * Les champs dérivés (type, catégorie, sévérité, isRead) proviennent du mock
 * déjà normalisé via `getNotificationKind`.
 *
 * Actions : marquage lu / non-lu, tout marquer lu, archivage et suppression
 * (individuels ou en lot), statistiques et préférences.
 */
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { CLIENT_TYPES } from '../constants/client.constants';
import { NOTIFICATION_STATUSES } from '@/features/notifications/constants';
import { MOCK_CLIENT_NOTIFICATIONS } from '../mocks/clientNotifications.mock';

const TEC_COMPANY_ID = '01J8A2B3C4D5E6F7G8H9J0K1L2';
const DEMO_USER_ID = 'usr_001';

const isEnterprise = (clientType) => clientType === CLIENT_TYPES.ENTERPRISE;

const inScope = (notification) =>
  notification.companyId === TEC_COMPANY_ID && notification.userId === DEMO_USER_ID;

let notificationCache = null;
let preferences = { email: true, push: true, inApp: true };

const getNotificationCache = () => {
  if (!notificationCache) {
    notificationCache = MOCK_CLIENT_NOTIFICATIONS.map((notification) => ({ ...notification }));
  }
  return notificationCache;
};

export const getNotificationRecordsCache = () => getNotificationCache().map((notification) => ({ ...notification }));

const sortByCreatedAt = (items) =>
  [...items].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

const toIdList = (ids) => (Array.isArray(ids) ? ids.filter(Boolean) : [ids].filter(Boolean));

const applyStatus = (notification, isRead, now) => ({
  ...notification,
  status: isRead ? NOTIFICATION_STATUSES.read : NOTIFICATION_STATUSES.unread,
  isRead,
  readAt: isRead ? (notification.readAt || now) : null,
  updatedAt: now,
});

export const clientNotificationService = {
  /**
   * Liste des notifications du Client (isolées par entreprise + utilisateur).
   * @param {string} [clientType]
   * @returns {Promise<Array<object>>}
   */
  async getAll(clientType = CLIENT_TYPES.ENTERPRISE) {
    if (!isEnterprise(clientType)) {
      return mockResponse([], { latency: 300 });
    }
    return mockResponse(
      sortByCreatedAt(getNotificationCache().filter(inScope).map((item) => ({ ...item }))),
      { latency: 400 },
    );
  },

  /**
   * Détail d'une notification (404 hors portée / introuvable).
   * @param {string} id
   * @param {string} [clientType]
   * @returns {Promise<object>}
   */
  async getById(id, clientType = CLIENT_TYPES.ENTERPRISE) {
    if (!isEnterprise(clientType)) {
      return mockResponse(null, { error: ApiError.notFound('Notification introuvable.') });
    }
    const record = getNotificationCache().find((item) => item.id === id && inScope(item));
    if (!record) {
      return mockResponse(null, { error: ApiError.notFound('Notification introuvable.') });
    }
    return mockResponse({ ...record }, { latency: 350 });
  },

  /**
   * Notifications non lues du Client (par ordre antichronologique).
   * @param {string} [clientType]
   * @returns {Promise<Array<object>>}
   */
  async getUnread(clientType = CLIENT_TYPES.ENTERPRISE) {
    const records = isEnterprise(clientType)
      ? getNotificationCache().filter((item) => inScope(item) && !item.isRead)
      : [];
    return mockResponse(sortByCreatedAt(records.map((item) => ({ ...item }))), { latency: 300 });
  },

  /**
   * Nombre de notifications non lues du Client.
   * @param {string} [clientType]
   * @returns {Promise<number>}
   */
  async getUnreadCount(clientType = CLIENT_TYPES.ENTERPRISE) {
    const count = isEnterprise(clientType)
      ? getNotificationCache().filter((item) => inScope(item) && !item.isRead).length
      : 0;
    return mockResponse(count, { latency: 250 });
  },

  /**
   * Marquage lu / non-lu d'une notification.
   * @param {string} id
   * @param {boolean} isRead
   * @returns {Promise<object>}
   */
  async markAsRead(id, isRead = true) {
    const cache = getNotificationCache();
    const index = cache.findIndex((item) => item.id === id && inScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Notification introuvable.') });
    }
    cache[index] = applyStatus(cache[index], isRead, new Date().toISOString());
    return mockResponse({ ...cache[index] }, { latency: 250 });
  },

  async markAsUnread(id) {
    return this.markAsRead(id, false);
  },

  /**
   * Marquage lu / non-lu en lot.
   * @param {string[]} ids
   * @param {boolean} isRead
   * @returns {Promise<{ ids: string[] }>}
   */
  async markMany(ids, isRead = true) {
    const cache = getNotificationCache();
    const list = toIdList(ids);
    const now = new Date().toISOString();
    list.forEach((id) => {
      const index = cache.findIndex((item) => item.id === id && inScope(item));
      if (index !== -1) {
        cache[index] = applyStatus(cache[index], isRead, now);
      }
    });
    return mockResponse({ ids: list }, { latency: 300 });
  },

  async markManyAsRead(ids) {
    return this.markMany(ids, true);
  },

  async markManyAsUnread(ids) {
    return this.markMany(ids, false);
  },

  /**
   * Tout marquer lu (reste borné au scope entreprise + utilisateur).
   * @returns {Promise<{ count: number }>}
   */
  async markAllAsRead() {
    const cache = getNotificationCache();
    const now = new Date().toISOString();
    let count = 0;
    cache.forEach((item, index) => {
      if (inScope(item) && !item.isRead) {
        cache[index] = applyStatus(item, true, now);
        count += 1;
      }
    });
    return mockResponse({ count }, { latency: 350 });
  },

  /**
   * Archivage d'une notification (sortie de la liste active).
   * @param {string} id
   * @returns {Promise<{ id: string }>}
   */
  async archive(id) {
    const cache = getNotificationCache();
    const index = cache.findIndex((item) => item.id === id && inScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Notification introuvable.') });
    }
    cache[index] = { ...cache[index], archived: true, updatedAt: new Date().toISOString() };
    return mockResponse({ id }, { latency: 250 });
  },

  /**
   * Archivage en lot (les identifiants hors portée sont ignorés).
   * @param {string[]} ids
   * @returns {Promise<{ ids: string[] }>}
   */
  async archiveMany(ids) {
    const cache = getNotificationCache();
    const list = toIdList(ids);
    const now = new Date().toISOString();
    list.forEach((id) => {
      const index = cache.findIndex((item) => item.id === id && inScope(item));
      if (index !== -1) {
        cache[index] = { ...cache[index], archived: true, updatedAt: now };
      }
    });
    return mockResponse({ ids: list }, { latency: 300 });
  },

  /**
   * Suppression d'une notification (retrait du cache).
   * @param {string} id
   * @returns {Promise<{ id: string }>}
   */
  async remove(id) {
    const cache = getNotificationCache();
    const index = cache.findIndex((item) => item.id === id && inScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Notification introuvable.') });
    }
    cache.splice(index, 1);
    return mockResponse({ id }, { latency: 250 });
  },

  /**
   * Suppression en lot (les identifiants hors portée sont ignorés).
   * @param {string[]} ids
   * @returns {Promise<{ ids: string[] }>}
   */
  async removeMany(ids) {
    const cache = getNotificationCache();
    const list = toIdList(ids);
    const removed = cache.filter((item) => !list.includes(item.id));
    notificationCache = removed;
    return mockResponse({ ids: list }, { latency: 300 });
  },

  /**
   * Statistiques des notifications (totaux, répartition par sévérité).
   * @param {string} [clientType]
   * @returns {Promise<object>}
   */
  async statistics(clientType = CLIENT_TYPES.ENTERPRISE) {
    const records = isEnterprise(clientType)
      ? getNotificationCache().filter((item) => inScope(item) && !item.archived)
      : [];

    const unread = records.filter((item) => !item.isRead);
    const severityCounts = ['critical', 'high', 'medium', 'low'].map((severity) => ({
      severity,
      count: records.filter((item) => item.severity === severity).length,
    }));
    const categoryCounts = records.reduce((groups, item) => {
      groups[item.category] = (groups[item.category] || 0) + 1;
      return groups;
    }, {});

    return mockResponse(
      {
        totalCount: records.length,
        unreadCount: unread.length,
        readCount: records.length - unread.length,
        criticalCount: records.filter((item) => item.severity === 'critical').length,
        severityCounts,
        categoryCounts,
      },
      { latency: 350 },
    );
  },

  /**
   * Préférences de notification du Client (canaux de réception).
   * @returns {Promise<object>}
   */
  async getPreferences() {
    return mockResponse({ ...preferences }, { latency: 200 });
  },

  async updatePreferences(payload = {}) {
    preferences = { ...preferences, ...payload };
    return mockResponse({ ...preferences }, { latency: 250 });
  },
};

export { getNotificationCache };
