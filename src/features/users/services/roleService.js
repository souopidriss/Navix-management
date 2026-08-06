/**
 * Navix Users — RoleService
 * --------------------------------------------------------------------------
 * Gestion des rôles (mock uniquement). Responsabilité : fournir les rôles aux
 * vues et aux stores, gérer l'attribution des permissions (RolePermission).
 *
 * Méthodes :
 *   getAll()                → rôles (système globaux + personnalisés de l'entreprise)
 *   getById(id)             → détail (404 si absent)
 *   create(payload)         → création (code unique, ULID)
 *   update(id, payload)     → mise à jour
 *   activate/deactivate(id) → bascule Actif / Inactif
 *   assignPermissions(id, codes) → attribution de permissions
 *   remove(id)              → suppression (interdite sur les rôles système)
 *
 * Règles métier simulées :
 *   - code unique (409 sinon)
 *   - les rôles système ne peuvent être ni supprimés ni désactivés
 *   - portée bornée à l'entreprise courante (simulation tenant) ; la sécurité
 *     réelle (RolePermission) sera appliquée par Express.js.
 *
 * Exemple :
 *   import { roleService } from '../services';
 *   const roles = await roleService.getAll({ companyScopeId });
 */
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '@/services/client';
import { apiConfig } from '@/services/config';
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { MOCK_ROLES } from '../mocks';

let rolesCache = null;

const getRolesCache = () => {
  if (!rolesCache) {
    rolesCache = MOCK_ROLES.map((role) => ({ ...role, permissions: [...role.permissions] }));
  }
  return rolesCache;
};

const clone = (role) => ({ ...role, permissions: [...role.permissions] });

/**
 * Filtre une liste de rôles (exporté pour le hook).
 * @param {Array<object>} roles
 * @param {object} filters — filtres normalisés (sanitizeRoleFilters)
 * @returns {Array<object>}
 */
export const applyRoleFilters = (roles, filters) => {
  const query = filters.search.trim().toLowerCase();

  return roles.filter((role) => {
    if (filters.companyId && role.companyId !== filters.companyId) return false;
    if (filters.type && role.isSystem !== (filters.type === 'system')) return false;
    if (filters.status && role.isActive !== (filters.status === 'active')) return false;

    if (query) {
      const haystack = [role.name, role.code, role.description].filter(Boolean).join(' ').toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });
};

/**
 * Trie une liste de rôles selon une colonne (exporté pour le hook).
 */
export const sortRoles = (roles, by, direction) => {
  const factor = direction === 'asc' ? 1 : -1;
  return [...roles].sort((a, b) => {
    if (by === 'usersCount') return ((a.usersCount ?? 0) - (b.usersCount ?? 0)) * factor;
    const left = String(a[by] ?? '').toLowerCase();
    const right = String(b[by] ?? '').toLowerCase();
    return left.localeCompare(right) * factor;
  });
};

export const roleService = {
  /**
   * Rôles (système globaux + personnalisés de l'entreprise courante).
   * @param {object} [query] — { companyScopeId, ...filtres }
   * @returns {Promise<{ items: Array<object>, total: number }>}
   */
  async getAll(query = {}) {
    if (apiConfig.mock) {
      const scope = query.companyScopeId ?? '';
      const items = getRolesCache()
        .filter((role) => !scope || !role.companyId || role.companyId === scope)
        .map(clone);
      return mockResponse({ items, total: items.length });
    }

    const { data } = await apiClient.get(API_ENDPOINTS.ROLES.LIST, { params: query });
    return data;
  },

  /**
   * Détail d'un rôle.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getById(id) {
    if (apiConfig.mock) {
      const role = getRolesCache().find((item) => item.id === id);
      if (!role) return mockResponse(null, { error: ApiError.notFound('Rôle introuvable.') });
      return mockResponse(clone(role));
    }

    const { data } = await apiClient.get(API_ENDPOINTS.ROLES.DETAIL(id));
    return data;
  },

  /**
   * Crée un rôle personnalisé (code unique).
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async create(payload) {
    if (apiConfig.mock) {
      const cache = getRolesCache();
      const code = payload.code.trim().toLowerCase();
      if (cache.some((role) => role.code === code)) {
        return mockResponse(null, { error: ApiError.conflict('Un rôle possède déjà ce code.') });
      }

      const now = new Date().toISOString();
      const role = {
        id: `role_${code}`,
        companyId: payload.companyId ?? '',
        name: payload.name,
        code,
        description: payload.description ?? '',
        isSystem: false,
        isActive: payload.isActive ?? true,
        permissions: payload.permissions ?? [],
        createdAt: now,
        updatedAt: now,
      };
      cache.push(role);
      return mockResponse(clone(role));
    }

    const { data } = await apiClient.post(API_ENDPOINTS.ROLES.CREATE, payload);
    return data;
  },

  /**
   * Met à jour un rôle.
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async update(id, payload) {
    if (apiConfig.mock) {
      const role = getRolesCache().find((item) => item.id === id);
      if (!role) return mockResponse(null, { error: ApiError.notFound('Rôle introuvable.') });

      const code = payload.code.trim().toLowerCase();
      const duplicate = getRolesCache().some((item) => item.id !== id && item.code === code);
      if (duplicate) {
        return mockResponse(null, { error: ApiError.conflict('Un rôle possède déjà ce code.') });
      }

      Object.assign(role, {
        name: payload.name,
        code,
        description: payload.description ?? '',
        companyId: payload.companyId ?? role.companyId,
        permissions: payload.permissions ?? role.permissions,
        isActive: payload.isActive ?? role.isActive,
        updatedAt: new Date().toISOString(),
      });
      return mockResponse(clone(role));
    }

    const { data } = await apiClient.put(API_ENDPOINTS.ROLES.UPDATE(id), payload);
    return data;
  },

  /** Active un rôle. */
  async activate(id) {
    if (apiConfig.mock) {
      const role = getRolesCache().find((item) => item.id === id);
      if (!role) return mockResponse(null, { error: ApiError.notFound('Rôle introuvable.') });
      role.isActive = true;
      role.updatedAt = new Date().toISOString();
      return mockResponse(clone(role));
    }
    const { data } = await apiClient.post(API_ENDPOINTS.ROLES.ACTIVATE(id));
    return data;
  },

  /** Désactive un rôle (rôles système protégés). */
  async deactivate(id) {
    if (apiConfig.mock) {
      const role = getRolesCache().find((item) => item.id === id);
      if (!role) return mockResponse(null, { error: ApiError.notFound('Rôle introuvable.') });
      if (role.isSystem) {
        return mockResponse(null, { error: ApiError.forbidden('Un rôle système ne peut pas être désactivé.') });
      }
      role.isActive = false;
      role.updatedAt = new Date().toISOString();
      return mockResponse(clone(role));
    }
    const { data } = await apiClient.post(API_ENDPOINTS.ROLES.DEACTIVATE(id));
    return data;
  },

  /**
   * Supprime un rôle (rôles système protégés).
   * @param {string} id
   * @returns {Promise<{ success: boolean }>}
   */
  async remove(id) {
    if (apiConfig.mock) {
      const cache = getRolesCache();
      const role = cache.find((item) => item.id === id);
      if (!role) return mockResponse(null, { error: ApiError.notFound('Rôle introuvable.') });
      if (role.isSystem) {
        return mockResponse(null, { error: ApiError.forbidden('Un rôle système ne peut pas être supprimé.') });
      }
      cache.splice(cache.indexOf(role), 1);
      return mockResponse({ success: true });
    }
    const { data } = await apiClient.delete(API_ENDPOINTS.ROLES.DELETE(id));
    return data;
  },

  /**
   * Attribue les permissions d'un rôle (RolePermission simulé).
   * @param {string} id
   * @param {string[]} permissionCodes
   * @returns {Promise<object>}
   */
  async assignPermissions(id, permissionCodes) {
    if (apiConfig.mock) {
      const role = getRolesCache().find((item) => item.id === id);
      if (!role) return mockResponse(null, { error: ApiError.notFound('Rôle introuvable.') });
      role.permissions = Array.from(new Set(permissionCodes));
      role.updatedAt = new Date().toISOString();
      return mockResponse(clone(role));
    }
    const { data } = await apiClient.put(API_ENDPOINTS.ROLES.ASSIGN_PERMISSIONS(id), {
      permissionCodes,
    });
    return data;
  },
};
