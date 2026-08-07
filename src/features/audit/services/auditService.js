/**
 * Navix Audit — AuditService
 * --------------------------------------------------------------------------
 * Description : journal des actions — lecture seule (immuable). Consulte,
 * filtre, trie, pagine, calcule des indicateurs et prépare l'export.
 * Responsabilité : fournir les entrées d'audit aux vues et au store.
 *                  Mode mock : données simulées en mémoire, aucune requête
 *                  HTTP. Aucune méthode de modification n'est exposée.
 *
 * Multi-tenant simulé : la portée est bornée à l'entreprise de l'utilisateur
 * courant (simulation UX). La sécurité réelle (permissions, visibilité
 * inter-entreprises, immutabilité) sera appliquée côté Express.js.
 *
 * Méthodes :
 *   getAll(filters)     → entrées filtrées, triées et paginées
 *   getById(id)         → détail d'une entrée (404 si absente)
 *   getStatistics()     → indicateurs globaux (total, aujourd'hui, etc.)
 *   exportLogs(filters) → export simulé CSV/Excel/PDF (architecture uniquement)
 *
 * Exemple d'utilisation :
 *   import { auditService } from '../services';
 *   const { items, total } = await auditService.getAll({ search: 'volvo' });
 */
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '@/services/client';
import { apiConfig } from '@/services/config';
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { MOCK_AUDIT_LOGS } from '../mocks';
import { sanitizeAuditFilters } from '../schemas';
import {
  SEVERITY_ORDER,
  formatAuditDate,
  getUser,
  getAuditAction,
  getAuditActionType,
  getAuditResource,
  getAuditSeverity,
} from '../constants';

/**
 * Compare deux chaînes de date ISO (ordre chronologique).
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
const byCreatedAt = (a, b) => b.createdAt.localeCompare(a.createdAt);

/**
 * Borne temporelle d'une période.
 * @param {string} period — clé de période (today, last7, …)
 * @param {string} dateFrom — date personnalisée (YYYY-MM-DD)
 * @param {string} dateTo   — date personnalisée (YYYY-MM-DD)
 * @returns {{ from: string, to: string }}
 */
export const resolveAuditDateRange = (period, dateFrom = '', dateTo = '') => {
  const now = new Date();
  const iso = (d) => d.toISOString();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  switch (period) {
    case 'today': {
      const start = startOfDay(now);
      return { from: iso(start), to: iso(now) };
    }
    case 'yesterday': {
      const end = startOfDay(now);
      const start = new Date(end.getTime() - 86400000);
      return { from: iso(start), to: iso(new Date(end.getTime() - 1)) };
    }
    case 'last7': {
      const start = new Date(now.getTime() - 6 * 86400000);
      return { from: iso(startOfDay(start)), to: iso(now) };
    }
    case 'last30': {
      const start = new Date(now.getTime() - 29 * 86400000);
      return { from: iso(startOfDay(start)), to: iso(now) };
    }
    case 'thisMonth': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: iso(start), to: iso(now) };
    }
    case 'lastMonth': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { from: iso(start), to: iso(end) };
    }
    case 'custom':
      return {
        from: dateFrom ? new Date(`${dateFrom}T00:00:00.000`).toISOString() : '',
        to: dateTo ? new Date(`${dateTo}T23:59:59.999`).toISOString() : '',
      };
    default:
      return { from: '', to: '' };
  }
};

/**
 * Applique les filtres sur une liste d'entrées (exporté pour le hook).
 * @param {Array<object>} logs
 * @param {object} filters — filtres normalisés (sanitizeAuditFilters)
 * @param {string} companyId — entreprise du contexte courant (simulation tenant)
 * @returns {Array<object>}
 */
export const applyAuditFilters = (logs, filters, companyId) => {
  const query = filters.search.trim().toLowerCase();
  const range = resolveAuditDateRange(filters.period, filters.dateFrom, filters.dateTo);

  return logs.filter((log) => {
    if (companyId && log.companyId !== companyId) return false;
    if (filters.companyId && log.companyId !== filters.companyId) return false;
    if (filters.agencyId && log.agencyId !== filters.agencyId) return false;
    if (filters.userId && log.userId !== filters.userId) return false;
    if (filters.action && log.action !== filters.action) return false;
    if (filters.actionType && log.actionType !== filters.actionType) return false;
    if (filters.resourceType && log.resourceType !== filters.resourceType) return false;
    if (filters.status && log.status !== filters.status) return false;
    if (filters.severity && log.severity !== filters.severity) return false;

    if (range.from && log.createdAt < range.from) return false;
    if (range.to && log.createdAt > range.to) return false;

    if (query) {
      const haystack = [
        log.userName,
        log.companyName,
        log.agencyName,
        log.resourceName,
        log.description,
        log.ipAddress,
        log.resourceId,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });
};

/**
 * Compareur générique pour une colonne de tri.
 * @param {string} by      — clé de tri
 * @param {string} direction
 * @returns {Function}
 */
const comparator = (by, direction) => {
  const factor = direction === 'asc' ? 1 : -1;
  return (a, b) => {
    if (by === 'severity') {
      return (SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)) * factor;
    }
    if (by === 'createdAt') return a.createdAt.localeCompare(b.createdAt) * factor;
    const left = String(a[by] ?? '').toLowerCase();
    const right = String(b[by] ?? '').toLowerCase();
    return left.localeCompare(right) * factor;
  };
};

/**
 * Trie une liste d'entrées selon une colonne (exporté pour le hook).
 * @param {Array<object>} logs
 * @param {string} by      — clé de tri
 * @param {string} direction
 * @returns {Array<object>}
 */
export const sortAuditLogs = (logs, by, direction) =>
  [...logs].sort(comparator(by, direction));

const findLog = (id) => MOCK_AUDIT_LOGS.find((item) => item.id === id);

const entityNotFound = (message = 'Entrée du journal introuvable.') =>
  mockResponse(null, { error: ApiError.notFound(message) });

export const auditService = {
  /**
   * Entrées d'audit filtrées, triées et paginées.
   * @param {object} [query] — { search, companyId, agencyId, userId, action,
   *                           actionType, resourceType, status, severity,
   *                           period, dateFrom, dateTo, sortBy, sortDirection,
   *                           page, pageSize, companyScopeId }
   * @returns {Promise<{ items: Array<object>, total: number, page: number,
   *                     pageSize: number }>}
   */
  async getAll(query = {}) {
    if (apiConfig.mock) {
      const filters = sanitizeAuditFilters(query);
      const page = Number.isInteger(query.page) && query.page > 0 ? query.page : 1;
      const pageSize = [10, 25, 50, 100].includes(query.pageSize) ? query.pageSize : 10;
      const sortBy = query.sortBy ?? 'createdAt';
      const sortDirection = query.sortDirection ?? 'desc';

      const scoped = applyAuditFilters(MOCK_AUDIT_LOGS, filters, query.companyScopeId ?? '');
      const sorted = sortAuditLogs(scoped, sortBy, sortDirection);
      const total = sorted.length;
      const start = (page - 1) * pageSize;
      const items = sorted.slice(start, start + pageSize).map((item) => ({ ...item }));

      return mockResponse({ items, total, page, pageSize });
    }

    const { data } = await apiClient.get(API_ENDPOINTS.AUDIT.LIST, { params: query });
    return data;
  },

  /**
   * Détail d'une entrée d'audit.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getById(id) {
    if (apiConfig.mock) {
      const log = findLog(id);
      if (!log) return entityNotFound();
      return mockResponse({ ...log });
    }

    const { data } = await apiClient.get(API_ENDPOINTS.AUDIT.DETAIL(id));
    return data;
  },

  /**
   * Indicateurs globaux du journal (cartes de la page).
   * @param {string} [companyScopeId] — entreprise du contexte courant
   * @returns {Promise<object>}
   */
  async getStatistics(companyScopeId = '') {
    if (apiConfig.mock) {
      const logs = companyScopeId
        ? MOCK_AUDIT_LOGS.filter((log) => log.companyId === companyScopeId)
        : MOCK_AUDIT_LOGS;

      const today = new Date().toISOString().slice(0, 10);
      const stats = {
        total: logs.length,
        today: logs.filter((log) => log.createdAt.startsWith(today)).length,
        success: logs.filter((log) => log.status === 'success').length,
        failed: logs.filter((log) => log.status === 'failed').length,
        warning: logs.filter((log) => log.status === 'warning').length,
        info: logs.filter((log) => log.status === 'info').length,
        critical: logs.filter((log) => log.severity === 'critical').length,
        high: logs.filter((log) => log.severity === 'high').length,
        medium: logs.filter((log) => log.severity === 'medium').length,
        low: logs.filter((log) => log.severity === 'low').length,
        byAction: Object.fromEntries(
          logs.reduce((acc, log) => {
            acc[log.action] = (acc[log.action] ?? 0) + 1;
            return acc;
          }, {}),
        ),
        byResource: Object.fromEntries(
          logs.reduce((acc, log) => {
            acc[log.resourceType] = (acc[log.resourceType] ?? 0) + 1;
            return acc;
          }, {}),
        ),
      };
      return mockResponse(stats);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.AUDIT.STATISTICS);
    return data;
  },

  /**
   * Export simulé du journal filtré. Architecture uniquement : le générateur
   * réel (CSV/Excel/PDF serveur, horodatage, trace) sera implémenté côté
   * Express.js. Aucune bibliothèque d'export n'est installée.
   * @param {object} query — mêmes filtres que getAll
   * @returns {Promise<{ success: boolean, format: string, count: number,
   *                     exportedAt: string }>}
   */
  async exportLogs(query = {}, format = 'csv') {
    if (apiConfig.mock) {
      const filters = sanitizeAuditFilters(query);
      const scoped = applyAuditFilters(MOCK_AUDIT_LOGS, filters, query.companyScopeId ?? '');
      return mockResponse({
        success: true,
        format,
        count: scoped.length,
        exportedAt: new Date().toISOString(),
      });
    }

    const { data } = await apiClient.post(
      API_ENDPOINTS.AUDIT.EXPORT,
      { format, filters: query },
      { responseType: 'blob' },
    );
    return data;
  },

  /**
   * Activité d'un utilisateur (les plus récentes d'abord).
   * @param {string} userId
   * @param {string} [companyScopeId]
   * @returns {Promise<Array<object>>}
   */
  async getUserActivity(userId, companyScopeId = '') {
    if (apiConfig.mock) {
      return mockResponse(getUserAuditLogs(userId, companyScopeId));
    }
    const { data } = await apiClient.get(API_ENDPOINTS.AUDIT.LIST, { params: { userId } });
    return data;
  },

  /**
   * Activité liée à une ressource (type + identifiant).
   * @param {{ resourceType: string, resourceId: string }} resource
   * @param {string} [companyScopeId]
   * @returns {Promise<Array<object>>}
   */
  async getResourceActivity(resource, companyScopeId = '') {
    if (apiConfig.mock) {
      return mockResponse(getResourceAuditLogs(resource, companyScopeId));
    }
    const { data } = await apiClient.get(API_ENDPOINTS.AUDIT.LIST, {
      params: { resourceType: resource.resourceType, resourceId: resource.resourceId },
    });
    return data;
  },

  /**
   * Entrées critiques du journal.
   * @param {string} [companyScopeId]
   * @returns {Promise<Array<object>>}
   */
  async getCriticalLogs(companyScopeId = '') {
    if (apiConfig.mock) {
      return mockResponse(getCriticalAuditLogs(companyScopeId));
    }
    const { data } = await apiClient.get(API_ENDPOINTS.AUDIT.LIST, { params: { severity: 'critical' } });
    return data;
  },

  /**
   * Entrées échouées du journal.
   * @param {string} [companyScopeId]
   * @returns {Promise<Array<object>>}
   */
  async getFailedLogs(companyScopeId = '') {
    if (apiConfig.mock) {
      return mockResponse(getFailedAuditLogs(companyScopeId));
    }
    const { data } = await apiClient.get(API_ENDPOINTS.AUDIT.LIST, { params: { status: 'failed' } });
    return data;
  },
};

/**
 * Liste complète triée (utile pour les exports client et le dashboard).
 * @returns {Array<object>}
 */
export const getAllAuditLogsSorted = () =>
  [...MOCK_AUDIT_LOGS].sort(byCreatedAt).map((item) => ({ ...item }));

/* --------------------------------------------------------------------------
   Activité (utilisateur / ressource) et regroupement — helpers purs
   -------------------------------------------------------------------------- */

const scoped = (logs, companyScopeId) =>
  logs.filter((log) => !companyScopeId || log.companyId === companyScopeId);

/** Entrées d'un utilisateur (les plus récentes d'abord), portée tenant simulée. */
export const getUserAuditLogs = (userId, companyScopeId = '') =>
  scoped(
    MOCK_AUDIT_LOGS.filter((log) => log.userId === userId),
    companyScopeId,
  )
    .sort(byCreatedAt)
    .map((item) => ({ ...item }));

/** Entrées liées à une ressource (type + identifiant), portée tenant simulée. */
export const getResourceAuditLogs = ({ resourceType, resourceId }, companyScopeId = '') =>
  scoped(
    MOCK_AUDIT_LOGS.filter(
      (log) => log.resourceType === resourceType && log.resourceId === resourceId,
    ),
    companyScopeId,
  )
    .sort(byCreatedAt)
    .map((item) => ({ ...item }));

/** Entrées critiques, portée tenant simulée. */
export const getCriticalAuditLogs = (companyScopeId = '') =>
  scoped(MOCK_AUDIT_LOGS.filter((log) => log.severity === 'critical'), companyScopeId)
    .sort(byCreatedAt)
    .map((item) => ({ ...item }));

/** Entrées échouées, portée tenant simulée. */
export const getFailedAuditLogs = (companyScopeId = '') =>
  scoped(MOCK_AUDIT_LOGS.filter((log) => log.status === 'failed'), companyScopeId)
    .sort(byCreatedAt)
    .map((item) => ({ ...item }));

/** Libellé lisible d'une clé de groupe pour un critère donné. */
export const getAuditGroupLabel = (groupBy, key) => {
  switch (groupBy) {
    case 'date':
      return formatAuditDate(key);
    case 'user':
      return getUser(key).name;
    case 'module':
      return getAuditActionType(key).label;
    case 'action':
      return getAuditAction(key).label;
    case 'resource':
      return getAuditResource(key).label;
    case 'severity':
      return getAuditSeverity(key).label;
    default:
      return key;
  }
};

/**
 * Regroupe des entrées d'audit selon un critère.
 * @param {Array<object>} logs — entrées déjà filtrées/triées
 * @param {string} groupBy — 'date' | 'user' | 'module' | 'action' | 'resource' | 'severity'
 * @returns {Array<{ key, label, count, items }>} — groupes triés (plus récents / sévérité / alphabet)
 */
export const groupAuditLogs = (logs, groupBy) => {
  const groups = new Map();

  logs.forEach((log) => {
    let key;
    if (groupBy === 'date') key = log.createdAt.slice(0, 10);
    else if (groupBy === 'user') key = log.userId;
    else if (groupBy === 'module') key = log.actionType;
    else if (groupBy === 'action') key = log.action;
    else if (groupBy === 'resource') key = log.resourceType;
    else if (groupBy === 'severity') key = log.severity;
    else key = 'autre';

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(log);
  });

  const compareKeys = (aKey, bKey) => {
    if (groupBy === 'date') return bKey.localeCompare(aKey);
    if (groupBy === 'severity') return SEVERITY_ORDER.indexOf(aKey) - SEVERITY_ORDER.indexOf(bKey);
    return getAuditGroupLabel(groupBy, aKey)
      .toLowerCase()
      .localeCompare(getAuditGroupLabel(groupBy, bKey).toLowerCase());
  };

  return [...groups.entries()]
    .sort(([aKey], [bKey]) => compareKeys(aKey, bKey))
    .map(([key, items]) => ({
      key,
      label: getAuditGroupLabel(groupBy, key),
      count: items.length,
      items,
    }));
};
