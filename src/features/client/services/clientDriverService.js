/**
 * Navix Client — Service Chauffeurs (Opérations Client)
 * --------------------------------------------------------------------------
 * PROMPT 057 — CRUD chauffeurs strictement isolé multi-tenant (companyId
 * Transports Express Cameroun). Client Particulier : aucune donnée.
 *
 * Réutilise le modèle métier des Chauffeurs Admin (statuts / disponibilités /
 * schéma) sans dupliquer `driverService` : cache et identifiants propres à
 * l'Espace Client. Une mise à jour de statut ou de disponibilité recalcule
 * automatiquement la disponibilité (trajets en cours pris en compte).
 */
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { CLIENT_TYPES } from '../constants/client.constants';
import { MOCK_CLIENT_ENTERPRISE } from '../mocks/client.mock';
import {
  nextDriverId,
  getDriversCache,
  recomputeDriverAvailability,
  getNextDriverStatuses,
  getNextDriverAvailabilities,
} from './clientOperationsData';

const CLIENT_COMPANY_ID = MOCK_CLIENT_ENTERPRISE.companyId;

const buildFullName = (payload) => `${payload.firstName} ${payload.lastName}`.trim();

const isEnterprise = (clientType) => clientType === CLIENT_TYPES.ENTERPRISE;

export const clientDriverService = {
  /**
   * Liste des chauffeurs du Client (isolés par entreprise).
   * @param {string} [clientType]
   * @returns {Promise<Array<object>>}
   */
  async getAll(clientType = CLIENT_TYPES.ENTERPRISE) {
    if (!isEnterprise(clientType)) {
      return mockResponse([], { latency: 300 });
    }
    return mockResponse(
      getDriversCache()
        .filter((driver) => driver.companyId === CLIENT_COMPANY_ID)
        .map((driver) => ({ ...driver })),
      { latency: 400 },
    );
  },

  /**
   * Détail d'un chauffeur (404 hors portée / introuvable).
   * @param {string} id
   * @param {string} [clientType]
   * @returns {Promise<object>}
   */
  async getById(id, clientType = CLIENT_TYPES.ENTERPRISE) {
    if (!isEnterprise(clientType)) {
      return mockResponse(null, { error: ApiError.notFound('Chauffeur introuvable.') });
    }
    const driver = getDriversCache().find(
      (item) => item.id === id && item.companyId === CLIENT_COMPANY_ID,
    );
    if (!driver) {
      return mockResponse(null, { error: ApiError.notFound('Chauffeur introuvable.') });
    }
    return mockResponse({ ...driver }, { latency: 350 });
  },

  /**
   * Création d'un chauffeur (code employé unique, 409 si doublon).
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async create(payload) {
    const cache = getDriversCache();
    const isDuplicate = cache.some(
      (driver) =>
        driver.employeeCode.trim().toLowerCase() === String(payload.employeeCode).trim().toLowerCase(),
    );
    if (isDuplicate) {
      return mockResponse(null, {
        error: new ApiError({
          status: 409,
          code: 'DRIVER_EMPLOYEE_CODE_EXISTS',
          message: 'Ce code employé est déjà enregistré dans votre flotte.',
        }),
      });
    }

    const now = new Date().toISOString();
    const driver = {
      ...payload,
      id: nextDriverId(),
      companyId: CLIENT_COMPANY_ID,
      fullName: buildFullName(payload),
      photo: payload.photo || '',
      createdAt: now,
      updatedAt: now,
    };
    cache.unshift(driver);
    return mockResponse({ ...driver }, { latency: 400 });
  },

  /**
   * Mise à jour d'un chauffeur (404 introuvable / 409 code employé doublon).
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async update(id, payload) {
    const cache = getDriversCache();
    const index = cache.findIndex(
      (item) => item.id === id && item.companyId === CLIENT_COMPANY_ID,
    );
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Chauffeur introuvable.') });
    }

    const isDuplicate = cache.some(
      (driver) =>
        driver.employeeCode.trim().toLowerCase() === String(payload.employeeCode).trim().toLowerCase() &&
        driver.id !== id,
    );
    if (isDuplicate) {
      return mockResponse(null, {
        error: new ApiError({
          status: 409,
          code: 'DRIVER_EMPLOYEE_CODE_EXISTS',
          message: 'Ce code employé est déjà enregistré dans votre flotte.',
        }),
      });
    }

    const updated = recomputeDriverAvailability({
      ...cache[index],
      ...payload,
      id,
      fullName: buildFullName(payload),
      updatedAt: new Date().toISOString(),
    });
    cache[index] = updated;
    return mockResponse({ ...updated }, { latency: 400 });
  },

  /**
   * Changement de statut (transitions métier validées, 409 sinon).
   * @param {string} id
   * @param {string} nextStatus
   * @returns {Promise<object>}
   */
  async updateStatus(id, nextStatus) {
    const cache = getDriversCache();
    const index = cache.findIndex(
      (item) => item.id === id && item.companyId === CLIENT_COMPANY_ID,
    );
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Chauffeur introuvable.') });
    }

    const current = cache[index];
    if (!getNextDriverStatuses(current.status).includes(nextStatus)) {
      return mockResponse(null, {
        error: new ApiError({
          status: 409,
          code: 'DRIVER_STATUS_TRANSITION',
          message: 'Transition de statut non autorisée pour ce chauffeur.',
        }),
      });
    }

    const updated = recomputeDriverAvailability({ ...current, status: nextStatus });
    cache[index] = updated;
    return mockResponse({ ...updated }, { latency: 350 });
  },

  /**
   * Changement de disponibilité (transitions validées, 409 sinon).
   * @param {string} id
   * @param {string} nextAvailability
   * @returns {Promise<object>}
   */
  async updateAvailability(id, nextAvailability) {
    const cache = getDriversCache();
    const index = cache.findIndex(
      (item) => item.id === id && item.companyId === CLIENT_COMPANY_ID,
    );
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Chauffeur introuvable.') });
    }

    const current = cache[index];
    if (!getNextDriverAvailabilities(current.availability).includes(nextAvailability)) {
      return mockResponse(null, {
        error: new ApiError({
          status: 409,
          code: 'DRIVER_AVAILABILITY_TRANSITION',
          message: 'Changement de disponibilité non autorisé pour ce chauffeur.',
        }),
      });
    }

    const updated = { ...current, availability: nextAvailability, updatedAt: new Date().toISOString() };
    cache[index] = updated;
    return mockResponse({ ...updated }, { latency: 350 });
  },

  /**
   * Suppression (logique dans le mock : retrait du cache). 404 si absent.
   * @param {string} id
   * @returns {Promise<{ id: string }>}
   */
  async remove(id) {
    const cache = getDriversCache();
    const index = cache.findIndex(
      (item) => item.id === id && item.companyId === CLIENT_COMPANY_ID,
    );
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Chauffeur introuvable.') });
    }
    cache.splice(index, 1);
    return mockResponse({ id }, { latency: 350 });
  },
};
