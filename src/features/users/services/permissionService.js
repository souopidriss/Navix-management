/**
 * Navix Users — PermissionService
 * --------------------------------------------------------------------------
 * Catalogue des permissions (lecture seule, mock uniquement). Responsabilité :
 * fournir le référentiel de permissions aux vues (matrice, éditeur de rôle) et
 * aux stores. Aucune permission ne peut être créée, modifiée ou supprimée via
 * l'interface : le catalogue est défini par l'application (Express.js).
 *
 * Méthodes :
 *   getAll()       → permissions (groupées en mémoire)
 *   getById(id)    → détail (404 si absent)
 *   getByModule()  → groupes de permissions par module
 *   getModules()   → métadonnées des modules (libellé, icône, compteur)
 *   getSensitive() → permissions sensibles (financier, admin, export, audit)
 *   statistics()   → totaux utiles à la page Permissions
 *
 * Exemple :
 *   import { permissionService } from '../services';
 *   const groups = await permissionService.getByModule();
 */
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '@/services/client';
import { apiConfig } from '@/services/config';
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { MOCK_PERMISSIONS, getPermissionsByModule } from '../mocks';
import { PERMISSION_MODULES } from '../constants';

const clone = (permission) => ({ ...permission });

export const permissionService = {
  /**
   * Toutes les permissions.
   * @param {object} [query] — { module?, isSensitive? }
   * @returns {Promise<Array<object>>}
   */
  async getAll(query = {}) {
    if (apiConfig.mock) {
      let items = MOCK_PERMISSIONS;
      if (query.module) items = items.filter((permission) => permission.module === query.module);
      if (typeof query.isSensitive === 'boolean') {
        items = items.filter((permission) => permission.isSensitive === query.isSensitive);
      }
      return mockResponse(items.map(clone));
    }

    const { data } = await apiClient.get(API_ENDPOINTS.PERMISSIONS.LIST, { params: query });
    return data;
  },

  /**
   * Détail d'une permission.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getById(id) {
    if (apiConfig.mock) {
      const permission = MOCK_PERMISSIONS.find((item) => item.id === id);
      if (!permission) return mockResponse(null, { error: ApiError.notFound('Permission introuvable.') });
      return mockResponse(clone(permission));
    }

    const { data } = await apiClient.get(API_ENDPOINTS.PERMISSIONS.DETAIL(id));
    return data;
  },

  /**
   * Permissions groupées par module (pour la matrice).
   * @returns {Promise<Record<string, Array<object>>>}
   */
  async getByModule() {
    if (apiConfig.mock) {
      return mockResponse(getPermissionsByModule());
    }

    const { data } = await apiClient.get(API_ENDPOINTS.PERMISSIONS.MODULES);
    return data;
  },

  /**
   * Métadonnées des modules présents dans le catalogue.
   * @returns {Promise<Array<{ module, label, icon, count }>>}
   */
  async getModules() {
    if (apiConfig.mock) {
      const modules = Object.keys(getPermissionsByModule()).map((module) => ({
        module,
        label: PERMISSION_MODULES[module]?.label ?? module,
        icon: PERMISSION_MODULES[module]?.icon ?? 'cil-puzzle',
        count: getPermissionsByModule()[module].length,
      }));
      return mockResponse(modules);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.PERMISSIONS.MODULES);
    return data;
  },

  /**
   * Permissions sensibles.
   * @returns {Promise<Array<object>>}
   */
  async getSensitive() {
    if (apiConfig.mock) {
      return mockResponse(MOCK_PERMISSIONS.filter((permission) => permission.isSensitive).map(clone));
    }

    const { data } = await apiClient.get(API_ENDPOINTS.PERMISSIONS.LIST, { params: { isSensitive: true } });
    return data;
  },

  /**
   * Statistiques du catalogue.
   * @returns {Promise<{ total, sensitive, modules, byModule }>}
   */
  async statistics() {
    if (apiConfig.mock) {
      const groups = getPermissionsByModule();
      const byModule = Object.entries(groups).map(([module, permissions]) => ({
        module,
        label: PERMISSION_MODULES[module]?.label ?? module,
        icon: PERMISSION_MODULES[module]?.icon ?? 'cil-puzzle',
        count: permissions.length,
      }));
      return mockResponse({
        total: MOCK_PERMISSIONS.length,
        sensitive: MOCK_PERMISSIONS.filter((permission) => permission.isSensitive).length,
        modules: Object.keys(groups).length,
        byModule,
      });
    }

    const { data } = await apiClient.get(API_ENDPOINTS.PERMISSIONS.STATISTICS);
    return data;
  },
};
