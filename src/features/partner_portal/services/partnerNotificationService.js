/**
 * Navix Partner Portal — Service Notifications (Espace Partenaire)
 * --------------------------------------------------------------------------
 * Notifications strictement isolées multi-tenant (companyId partenaire) et par
 * utilisateur partenaire (usr_partner_001). Réutilise le moteur existant
 * (NOTIFICATION_KINDS / getNotificationKind) — aucun nouveau moteur.
 *
 * Le cache expose `getPartnerNotificationRecordsCache` pour que le service
 * finance partenaire puisse pousser ses notifications (même pattern que
 * l'Espace Client). Actions : marquage lu / non-lu et tout marquer lu.
 *
 * PROMPT 067 : ajout des activités récentes et des statistiques enrichies
 * (total, non lues, importantes, aujourd'hui).
 */
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { NOTIFICATION_STATUSES } from '@/features/notifications/constants';
import { MOCK_PARTNER_NOTIFICATIONS, MOCK_PARTNER_ACTIVITIES } from '../mocks/partner.mock';
import { PARTNER_COMPANY_ID } from '../constants/partner.constants';

const PARTNER_USER_ID = 'usr_partner_001';

let notificationCache = null;
let activityCache = null;
let preferences = { email: true, push: true, inApp: true };

const getNotificationCache = () => {
  if (!notificationCache) {
    notificationCache = MOCK_PARTNER_NOTIFICATIONS.map((notification) => ({ ...notification }));
  }
  return notificationCache;
};

const getActivityCache = () => {
  if (!activityCache) {
    activityCache = MOCK_PARTNER_ACTIVITIES.map((activity) => ({ ...activity }));
  }
  return activityCache;
};

/** Export lecture pour la finance partenaire (notifications d'opérations). */
export const getPartnerNotificationRecordsCache = () =>
  getNotificationCache().map((notification) => ({ ...notification }));

/** Ajoute une notification (utilisée par le service finance partenaire). */
export const pushPartnerNotification = (record) => {
  getNotificationCache().unshift(record);
  return record;
};

const inScope = (notification) =>
  notification.companyId === PARTNER_COMPANY_ID && notification.userId === PARTNER_USER_ID;

const activityInScope = (activity) =>
  activity.companyId === PARTNER_COMPANY_ID && activity.userId === PARTNER_USER_ID;

const sortByCreatedAt = (items) =>
  [...items].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

const applyStatus = (notification, isRead, now) => ({
  ...notification,
  status: isRead ? NOTIFICATION_STATUSES.read : NOTIFICATION_STATUSES.unread,
  isRead,
  readAt: isRead ? (notification.readAt || now) : null,
  updatedAt: now,
});

const isToday = (dateStr) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

export const partnerNotificationService = {
  /** Liste des notifications du Partenaire (isolées multi-tenant). */
  async getAll() {
    return mockResponse(
      sortByCreatedAt(getNotificationCache().filter(inScope).map((item) => ({ ...item }))),
      { latency: 400 },
    );
  },

  /** Détail d'une notification (404 hors portée / introuvable). */
  async getById(id) {
    const record = getNotificationCache().find((item) => item.id === id && inScope(item));
    if (!record) {
      return mockResponse(null, { error: ApiError.notFound('Notification introuvable.'), latency: 350 });
    }
    return mockResponse({ ...record }, { latency: 350 });
  },

  /** Marque une notification comme lue. */
  async markAsRead(id) {
    const cache = getNotificationCache();
    const index = cache.findIndex((item) => item.id === id && inScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Notification introuvable.'), latency: 300 });
    }
    const now = new Date().toISOString();
    cache[index] = applyStatus(cache[index], true, now);
    return mockResponse({ ...cache[index] }, { latency: 300 });
  },

  /** Marque une notification comme non lue. */
  async markAsUnread(id) {
    const cache = getNotificationCache();
    const index = cache.findIndex((item) => item.id === id && inScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Notification introuvable.'), latency: 300 });
    }
    const now = new Date().toISOString();
    cache[index] = applyStatus(cache[index], false, now);
    return mockResponse({ ...cache[index] }, { latency: 300 });
  },

  /** Marque plusieurs notifications comme lues. */
  async markManyAsRead(ids = []) {
    const now = new Date().toISOString();
    const cache = getNotificationCache();
    const wanted = new Set(ids);
    let count = 0;
    cache.forEach((notification, index) => {
      if (inScope(notification) && wanted.has(notification.id) && !notification.isRead) {
        cache[index] = applyStatus(notification, true, now);
        count += 1;
      }
    });
    return mockResponse({ success: true, updated: count }, { latency: 300 });
  },

  /** Marque plusieurs notifications comme non lues. */
  async markManyAsUnread(ids = []) {
    const now = new Date().toISOString();
    const cache = getNotificationCache();
    const wanted = new Set(ids);
    let count = 0;
    cache.forEach((notification, index) => {
      if (inScope(notification) && wanted.has(notification.id) && notification.isRead) {
        cache[index] = applyStatus(notification, false, now);
        count += 1;
      }
    });
    return mockResponse({ success: true, updated: count }, { latency: 300 });
  },

  /** Archive une notification. */
  async archive(id) {
    const cache = getNotificationCache();
    const index = cache.findIndex((item) => item.id === id && inScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Notification introuvable.'), latency: 300 });
    }
    const now = new Date().toISOString();
    cache[index] = {
      ...cache[index],
      archived: true,
      updatedAt: now,
    };
    return mockResponse({ ...cache[index] }, { latency: 300 });
  },

  /** Archive plusieurs notifications. */
  async archiveMany(ids = []) {
    const now = new Date().toISOString();
    const cache = getNotificationCache();
    const wanted = new Set(ids);
    let count = 0;
    cache.forEach((notification, index) => {
      if (inScope(notification) && wanted.has(notification.id) && !notification.archived) {
        cache[index] = { ...notification, archived: true, updatedAt: now };
        count += 1;
      }
    });
    return mockResponse({ success: true, updated: count }, { latency: 300 });
  },

  /** Supprime une notification. */
  async deleteOne(id) {
    const cache = getNotificationCache();
    const index = cache.findIndex((item) => item.id === id && inScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Notification introuvable.'), latency: 300 });
    }
    const [removed] = cache.splice(index, 1);
    return mockResponse({ success: true, id: removed.id }, { latency: 300 });
  },

  /** Supprime plusieurs notifications. */
  async deleteMany(ids = []) {
    const cache = getNotificationCache();
    const wanted = new Set(ids);
    const remaining = cache.filter((item) => !(inScope(item) && wanted.has(item.id)));
    notificationCache = remaining;
    return mockResponse({ success: true, deleted: cache.length - remaining.length }, { latency: 300 });
  },

  /** Marque toutes les notifications comme lues. */
  async markAllAsRead() {
    const now = new Date().toISOString();
    const cache = getNotificationCache();
    cache.forEach((notification, index) => {
      if (inScope(notification) && !notification.isRead) {
        cache[index] = applyStatus(notification, true, now);
      }
    });
    return mockResponse({ success: true, updated: cache.filter((item) => item.isRead).length }, { latency: 300 });
  },

  /** Statistiques enrichies (total, non lues, lues, importantes, aujourd'hui). */
  async getStatistics() {
    const items = getNotificationCache().filter(inScope);
    return mockResponse(
      {
        total: items.length,
        unread: items.filter((item) => !item.isRead).length,
        read: items.filter((item) => item.isRead).length,
        important: items.filter((item) => (item.severity === 'important' || item.severity === 'urgent') && !item.isRead).length,
        today: items.filter((item) => isToday(item.createdAt)).length,
        archived: items.filter((item) => item.archived).length,
      },
      { latency: 250 },
    );
  },

  /** Liste des activités récentes du Partenaire (isolées multi-tenant). */
  async getActivities() {
    return mockResponse(
      sortByCreatedAt(getActivityCache().filter(activityInScope).map((item) => ({ ...item }))),
      { latency: 300 },
    );
  },

  /** Préférences de notification du partenaire. */
  async getPreferences() {
    return mockResponse({ ...preferences }, { latency: 250 });
  },

  /** Met à jour les préférences de notification. */
  async updatePreferences(patch = {}) {
    preferences = { ...preferences, ...patch };
    return mockResponse({ ...preferences }, { latency: 300 });
  },
};
