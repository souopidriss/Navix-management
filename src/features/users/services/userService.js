/**
 * Navix Users — UserService
 * --------------------------------------------------------------------------
 * Gestion des utilisateurs (multi-tenant simulé), mock uniquement.
 * Responsabilité : fournir les utilisateurs aux vues et aux stores.
 *                  Mode mock : données simulées en mémoire, aucune requête HTTP.
 *
 * Méthodes :
 *   getAll()                  → utilisateurs (bornés à l'entreprise courante)
 *   getById(id)               → détail (404 si absent)
 *   create(payload)           → création (email unique, ULID)
 *   update(id, payload)       → mise à jour (404 si absent)
 *   activate/deactivate/suspend/reactivate(id) → changement de statut
 *   invite(id)                → passe au statut « invité » (placeholder)
 *   resetPassword(id)         → placeholder d'interface (aucun envoi réel)
 *   remove(id)                → suppression (interdite sur le super admin)
 *
 * Règles métier simulées :
 *   - email unique (409 sinon)
 *   - identifiant ULID et horodatages automatiques à la création
 *   - la portée est bornée à l'entreprise de l'utilisateur courant
 *     (simulation tenant) ; la sécurité réelle sera appliquée par Express.js.
 *
 * Exemple :
 *   import { userService } from '../services';
 *   const { items, total } = await userService.getAll({ companyScopeId });
 */
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '@/services/client';
import { apiConfig } from '@/services/config';
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { MOCK_USERS, getUserById } from '../mocks';

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/** Génère un identifiant ULID plausible (horodatage + aléa Crockford). */
export const generateUserUlid = () => {
  const time = Date.now().toString(36).toUpperCase().padStart(10, '0').slice(0, 10);
  let random = '';
  for (let i = 0; i < 16; i += 1) {
    random += CROCKFORD[Math.floor(Math.random() * CROCKFORD.length)];
  }
  return `${time}${random}`;
};

let usersCache = null;

const getUsersCache = () => {
  if (!usersCache) {
    usersCache = MOCK_USERS.map((user) => ({ ...user }));
  }
  return usersCache;
};

const clone = (user) => ({ ...user });

/**
 * Filtre une liste d'utilisateurs (exporté pour le hook).
 * @param {Array<object>} users — utilisateurs enrichis (companyName, agencyName)
 * @param {object} filters — filtres normalisés (sanitizeUserFilters)
 * @returns {Array<object>}
 */
export const applyUserFilters = (users, filters) => {
  const query = filters.search.trim().toLowerCase();

  return users.filter((user) => {
    if (filters.companyId && user.companyId !== filters.companyId) return false;
    if (filters.agencyId && user.agencyId !== filters.agencyId) return false;
    if (filters.status && user.status !== filters.status) return false;
    if (filters.roleId && !(user.roleIds ?? []).includes(filters.roleId)) return false;

    if (filters.createdAtFrom && user.createdAt < filters.createdAtFrom) return false;
    if (filters.createdAtTo && user.createdAt > `${filters.createdAtTo}T23:59:59.999`) return false;
    if (filters.lastLoginFrom && user.lastLoginAt && user.lastLoginAt < filters.lastLoginFrom) return false;
    if (filters.lastLoginTo && user.lastLoginAt && user.lastLoginAt > `${filters.lastLoginTo}T23:59:59.999`) return false;

    if (query) {
      const haystack = [
        user.fullName,
        user.firstName,
        user.lastName,
        user.email,
        user.phone,
        user.jobTitle,
        user.companyName,
        user.agencyName,
        ...(user.roleNames ?? []),
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
 * Trie une liste d'utilisateurs selon une colonne (exporté pour le hook).
 * @param {Array<object>} users
 * @param {string} by      — clé de tri
 * @param {string} direction — 'asc' | 'desc'
 * @returns {Array<object>}
 */
export const sortUsers = (users, by, direction) => {
  const factor = direction === 'asc' ? 1 : -1;
  return [...users].sort((a, b) => {
    if (by === 'lastLoginAt') {
      if (!a.lastLoginAt && !b.lastLoginAt) return 0;
      if (!a.lastLoginAt) return 1;
      if (!b.lastLoginAt) return -1;
      return a.lastLoginAt.localeCompare(b.lastLoginAt) * factor;
    }
    if (by === 'createdAt') return a.createdAt.localeCompare(b.createdAt) * factor;
    const left = String(a[by] ?? '').toLowerCase();
    const right = String(b[by] ?? '').toLowerCase();
    return left.localeCompare(right) * factor;
  });
};

const withStatus = (id, status, cache = getUsersCache()) => {
  const user = cache.find((item) => item.id === id);
  if (!user) return null;
  user.status = status;
  user.updatedAt = new Date().toISOString();
  return clone(user);
};

export const userService = {
  /**
   * Utilisateurs (bornés à l'entreprise courante en mode mock).
   * @param {object} [query] — { page, pageSize, companyScopeId, ...filtres }
   * @returns {Promise<{ items: Array<object>, total: number, page: number, pageSize: number }>}
   */
  async getAll(query = {}) {
    if (apiConfig.mock) {
      const scope = query.companyScopeId ?? '';
      const items = getUsersCache()
        .filter((user) => !scope || user.companyId === scope)
        .map(clone);
      return mockResponse({ items, total: items.length, page: 1, pageSize: items.length });
    }

    const { data } = await apiClient.get(API_ENDPOINTS.USERS.LIST, { params: query });
    return data;
  },

  /**
   * Détail d'un utilisateur.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getById(id) {
    if (apiConfig.mock) {
      const user = getUsersCache().find((item) => item.id === id);
      if (!user) return mockResponse(null, { error: ApiError.notFound('Utilisateur introuvable.') });
      return mockResponse(clone(user));
    }

    const { data } = await apiClient.get(API_ENDPOINTS.USERS.DETAIL(id));
    return data;
  },

  /**
   * Crée un utilisateur (email unique).
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async create(payload) {
    if (apiConfig.mock) {
      const cache = getUsersCache();
      const email = payload.email.trim().toLowerCase();
      if (cache.some((user) => user.email.toLowerCase() === email)) {
        return mockResponse(null, { error: ApiError.conflict('Un utilisateur possède déjà cet email.') });
      }

      const now = new Date().toISOString();
      const user = {
        id: `usr_${generateUserUlid()}`,
        companyId: payload.companyId,
        agencyId: payload.agencyId ?? null,
        firstName: payload.firstName,
        lastName: payload.lastName,
        fullName: `${payload.firstName} ${payload.lastName}`,
        email,
        phone: payload.phone ?? '',
        avatar: `${payload.firstName[0] ?? ''}${payload.lastName[0] ?? ''}`.toUpperCase(),
        jobTitle: payload.jobTitle ?? '',
        status: payload.status ?? 'active',
        roleIds: payload.roleIds ?? [],
        lastLoginAt: null,
        createdAt: now,
        updatedAt: now,
      };
      cache.push(user);
      return mockResponse(clone(user));
    }

    const { data } = await apiClient.post(API_ENDPOINTS.USERS.CREATE, payload);
    return data;
  },

  /**
   * Met à jour un utilisateur.
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async update(id, payload) {
    if (apiConfig.mock) {
      const user = getUsersCache().find((item) => item.id === id);
      if (!user) return mockResponse(null, { error: ApiError.notFound('Utilisateur introuvable.') });

      const email = payload.email.trim().toLowerCase();
      const duplicate = getUsersCache().some(
        (item) => item.id !== id && item.email.toLowerCase() === email,
      );
      if (duplicate) {
        return mockResponse(null, { error: ApiError.conflict('Un utilisateur possède déjà cet email.') });
      }

      Object.assign(user, {
        firstName: payload.firstName,
        lastName: payload.lastName,
        fullName: `${payload.firstName} ${payload.lastName}`,
        email,
        phone: payload.phone ?? '',
        jobTitle: payload.jobTitle ?? '',
        companyId: payload.companyId,
        agencyId: payload.agencyId ?? null,
        roleIds: payload.roleIds ?? [],
        status: payload.status,
        updatedAt: new Date().toISOString(),
      });
      return mockResponse(clone(user));
    }

    const { data } = await apiClient.put(API_ENDPOINTS.USERS.UPDATE(id), payload);
    return data;
  },

  /** Active un utilisateur. */
  async activate(id) {
    if (apiConfig.mock) {
      const user = withStatus(id, 'active');
      if (!user) return mockResponse(null, { error: ApiError.notFound('Utilisateur introuvable.') });
      return mockResponse(user);
    }
    const { data } = await apiClient.post(API_ENDPOINTS.USERS.ACTIVATE(id));
    return data;
  },

  /** Désactive un utilisateur. */
  async deactivate(id) {
    if (apiConfig.mock) {
      const user = withStatus(id, 'inactive');
      if (!user) return mockResponse(null, { error: ApiError.notFound('Utilisateur introuvable.') });
      return mockResponse(user);
    }
    const { data } = await apiClient.post(API_ENDPOINTS.USERS.DEACTIVATE(id));
    return data;
  },

  /** Suspend un utilisateur (statut « suspendu »). */
  async suspend(id) {
    if (apiConfig.mock) {
      const user = withStatus(id, 'suspended');
      if (!user) return mockResponse(null, { error: ApiError.notFound('Utilisateur introuvable.') });
      return mockResponse(user);
    }
    const { data } = await apiClient.post(API_ENDPOINTS.USERS.SUSPEND(id));
    return data;
  },

  /** Réactive un utilisateur suspendu ou inactif. */
  async reactivate(id) {
    if (apiConfig.mock) {
      const user = withStatus(id, 'active');
      if (!user) return mockResponse(null, { error: ApiError.notFound('Utilisateur introuvable.') });
      return mockResponse(user);
    }
    const { data } = await apiClient.post(API_ENDPOINTS.USERS.REACTIVATE(id));
    return data;
  },

  /** Invite un utilisateur (placeholder : passe au statut « invité »). */
  async invite(id) {
    if (apiConfig.mock) {
      const user = withStatus(id, 'invited');
      if (!user) return mockResponse(null, { error: ApiError.notFound('Utilisateur introuvable.') });
      return mockResponse(user);
    }
    const { data } = await apiClient.post(API_ENDPOINTS.USERS.INVITE(id));
    return data;
  },

  /**
   * Réinitialisation du mot de passe — PLACEHOLDER d'interface uniquement.
   * Aucune vraie réinitialisation n'est implémentée (sprint Auth dédié).
   */
  async resetPassword(id) {
    if (apiConfig.mock) {
      if (!getUserById(id)) {
        return mockResponse(null, { error: ApiError.notFound('Utilisateur introuvable.') });
      }
      return mockResponse({ success: true, placeholder: true });
    }
    const { data } = await apiClient.post(API_ENDPOINTS.USERS.RESET_PASSWORD(id));
    return data;
  },

  /**
   * Supprime un utilisateur (super admin protégé).
   * @param {string} id
   * @returns {Promise<{ success: boolean }>}
   */
  async remove(id) {
    if (apiConfig.mock) {
      if (id === 'usr_001') {
        return mockResponse(null, { error: ApiError.forbidden('Le super administrateur ne peut pas être supprimé.') });
      }
      const cache = getUsersCache();
      const index = cache.findIndex((item) => item.id === id);
      if (index === -1) {
        return mockResponse(null, { error: ApiError.notFound('Utilisateur introuvable.') });
      }
      cache.splice(index, 1);
      return mockResponse({ success: true });
    }
    const { data } = await apiClient.delete(API_ENDPOINTS.USERS.DELETE(id));
    return data;
  },

  /** Statistiques simples (compteurs par statut). */
  async statistics(companyScopeId = '') {
    if (apiConfig.mock) {
      const users = getUsersCache().filter((user) => !companyScopeId || user.companyId === companyScopeId);
      const byStatus = users.reduce((acc, user) => {
        acc[user.status] = (acc[user.status] ?? 0) + 1;
        return acc;
      }, {});
      return mockResponse({
        total: users.length,
        active: users.filter((user) => user.status === 'active').length,
        byStatus,
      });
    }
    const { data } = await apiClient.get(API_ENDPOINTS.USERS.STATISTICS);
    return data;
  },
};
