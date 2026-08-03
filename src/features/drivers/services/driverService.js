/**
 * Navix Drivers — DriverService
 * --------------------------------------------------------------------------
 * Description : gestion complète des chauffeurs, mock uniquement.
 * Responsabilité : fournir les données chauffeurs aux vues et aux stores.
 *                  Mode mock : données simulées en mémoire, aucune requête HTTP.
 *
 * Méthodes :
 *   getAll()                 → liste de tous les chauffeurs
 *   getById(id)              → détail d'un chauffeur (404 si absent)
 *   create(payload)          → création (code employé unique, 409 si doublon)
 *   update(id, payload)      → mise à jour (code employé unique, 404/409)
 *   remove(id)               → suppression (404 si absent)
 *   getAgencies()            → liste des agences (mock, pour les filtres)
 *
 * Exemple d'utilisation :
 *   import { driverService } from '../services';
 *   const drivers = await driverService.getAll();
 */
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '@/services/client';
import { apiConfig } from '@/services/config';
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { MOCK_DRIVERS, MOCK_DRIVER_AGENCIES } from '../mocks';

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/** Génère un identifiant ULID plausible (horodatage + aléa Crockford). */
const generateUlid = () => {
  const time = Date.now().toString(36).toUpperCase().padStart(10, '0').slice(0, 10);
  let random = '';
  for (let i = 0; i < 16; i += 1) {
    random += CROCKFORD[Math.floor(Math.random() * CROCKFORD.length)];
  }
  return `${time}${random}`;
};

const buildFullName = (payload) => `${payload.firstName} ${payload.lastName}`.trim();

let driversCache = null;

const getDriversCache = () => {
  if (!driversCache) {
    driversCache = MOCK_DRIVERS.map((driver) => ({ ...driver }));
  }
  return driversCache;
};

const isDuplicateEmployeeCode = (employeeCode, excludedId) =>
  getDriversCache().some(
    (driver) =>
      driver.employeeCode.trim().toLowerCase() === employeeCode.trim().toLowerCase() &&
      driver.id !== excludedId,
  );

export const driverService = {
  /**
   * Liste de tous les chauffeurs (copie — les mutations ultérieures du
   * cache n'affectent pas les consommateurs).
   * @returns {Promise<Array<object>>}
   */
  async getAll() {
    if (apiConfig.mock) {
      return mockResponse([...getDriversCache()]);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.DRIVERS.LIST);
    return data;
  },

  /**
   * Liste des agences de référence (mock uniquement — le module Agences
   * apportera son propre service dans un sprint dédié).
   * @returns {Promise<Array<object>>}
   */
  async getAgencies() {
    return mockResponse(MOCK_DRIVER_AGENCIES.map((agency) => ({ ...agency })));
  },

  /**
   * Détail d'un chauffeur.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getById(id) {
    if (apiConfig.mock) {
      const driver = getDriversCache().find((item) => item.id === id);
      if (!driver) {
        return mockResponse(null, { error: ApiError.notFound('Chauffeur introuvable.') });
      }
      return mockResponse(driver);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.DRIVERS.DETAIL(id));
    return data;
  },

  /**
   * Création d'un chauffeur (le code employé doit être unique).
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async create(payload) {
    if (apiConfig.mock) {
      if (isDuplicateEmployeeCode(payload.employeeCode)) {
        return mockResponse(null, {
          error: new ApiError({
            status: 409,
            code: 'DRIVER_EMPLOYEE_CODE_EXISTS',
            message: 'Ce code employé est déjà enregistré.',
          }),
        });
      }

      const now = new Date().toISOString();
      const driver = {
        ...payload,
        id: generateUlid(),
        fullName: buildFullName(payload),
        createdAt: now,
        updatedAt: now,
      };
      getDriversCache().unshift(driver);
      return mockResponse(driver);
    }

    const { data } = await apiClient.post(API_ENDPOINTS.DRIVERS.LIST, payload);
    return data;
  },

  /**
   * Mise à jour d'un chauffeur.
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async update(id, payload) {
    if (apiConfig.mock) {
      const index = getDriversCache().findIndex((item) => item.id === id);
      if (index === -1) {
        return mockResponse(null, { error: ApiError.notFound('Chauffeur introuvable.') });
      }
      if (isDuplicateEmployeeCode(payload.employeeCode, id)) {
        return mockResponse(null, {
          error: new ApiError({
            status: 409,
            code: 'DRIVER_EMPLOYEE_CODE_EXISTS',
            message: 'Ce code employé est déjà enregistré.',
          }),
        });
      }

      const updated = {
        ...getDriversCache()[index],
        ...payload,
        id,
        fullName: buildFullName(payload),
        updatedAt: new Date().toISOString(),
      };
      getDriversCache()[index] = updated;
      return mockResponse(updated);
    }

    const { data } = await apiClient.put(API_ENDPOINTS.DRIVERS.DETAIL(id), payload);
    return data;
  },

  /**
   * Suppression d'un chauffeur.
   * @param {string} id
   * @returns {Promise<{ id: string }>}
   */
  async remove(id) {
    if (apiConfig.mock) {
      const exists = getDriversCache().some((item) => item.id === id);
      if (!exists) {
        return mockResponse(null, { error: ApiError.notFound('Chauffeur introuvable.') });
      }
      driversCache = getDriversCache().filter((item) => item.id !== id);
      return mockResponse({ id });
    }

    const { data } = await apiClient.delete(API_ENDPOINTS.DRIVERS.DETAIL(id));
    return data;
  },
};
