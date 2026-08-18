/**
 * Navix Client — Service Affectations (Opérations Client)
 * --------------------------------------------------------------------------
 * PROMPT 057 — Affectations véhicule ↔ chauffeur strictement isolées
 * multi-tenant (companyId Transports Express Cameroun).
 *
 * Règles métier (modèle Admin réutilisé) :
 *   - un véhicule déjà en affectation ACTIVE n'est pas réaffectable (409) ;
 *   - un chauffeur déjà en affectation ACTIVE n'est pas réaffectable (409) ;
 *   - un chauffeur occupé (disponibilité « busy » ou trajet en cours) n'est
 *     pas affectable simultanément (409) ;
 *   - clôture d'affectation → disponibilité du chauffeur et du véhicule
 *     recalculées (trajets en cours / statut chauffeur pris en compte).
 */
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { CLIENT_TYPES } from '../constants/client.constants';
import {
  nextAssignmentId,
  nextAssignmentNumber,
  getAssignmentsCache,
  getDriversCache,
  hasActiveAssignmentForVehicle,
  hasActiveAssignmentForDriver,
  hasInProgressTripForDriver,
  recomputeDriverAvailability,
  setVehicleInUse,
} from './clientOperationsData';

const TEC_COMPANY_ID = '01J8A2B3C4D5E6F7G8H9J0K1L2';

const isEnterprise = (clientType) => clientType === CLIENT_TYPES.ENTERPRISE;

const inScope = (assignment) => assignment.companyId === TEC_COMPANY_ID;

/** Véhicule ou chauffeur en affectation active → conflit métier explicite. */
const findConflictError = (payload, excludedId = null) => {
  if (hasActiveAssignmentForVehicle(payload.vehicleId, excludedId)) {
    return new ApiError({
      status: 409,
      code: 'ASSIGNMENT_VEHICLE_ACTIVE',
      message: 'Ce véhicule est déjà en affectation active. Mettez fin à l’affectation en cours avant d’en créer une nouvelle.',
    });
  }

  if (hasActiveAssignmentForDriver(payload.driverId, excludedId)) {
    return new ApiError({
      status: 409,
      code: 'ASSIGNMENT_DRIVER_ACTIVE',
      message: 'Ce chauffeur est déjà en affectation active.',
    });
  }

  return null;
};

/** Chauffeur occupé (busy ou en trajet) → non affectable simultanément. */
const findDriverBusyError = (driverId) => {
  const driver = getDriversCache().find((item) => item.id === driverId);
  if (!driver) return null;

  if (driver.availability === 'busy' || hasInProgressTripForDriver(driverId)) {
    return new ApiError({
      status: 409,
      code: 'ASSIGNMENT_DRIVER_BUSY',
      message: 'Ce chauffeur est actuellement occupé (en service ou en trajet). Il ne peut pas être affecté simultanément.',
    });
  }

  return null;
};

export const clientAssignmentService = {
  /**
   * Liste des affectations du Client (isolées par entreprise).
   * @param {string} [clientType]
   * @returns {Promise<Array<object>>}
   */
  async getAll(clientType = CLIENT_TYPES.ENTERPRISE) {
    if (!isEnterprise(clientType)) {
      return mockResponse([], { latency: 300 });
    }
    return mockResponse(
      getAssignmentsCache()
        .filter(inScope)
        .map((assignment) => ({ ...assignment })),
      { latency: 400 },
    );
  },

  /**
   * Détail d'une affectation (404 hors portée / introuvable).
   * @param {string} id
   * @param {string} [clientType]
   * @returns {Promise<object>}
   */
  async getById(id, clientType = CLIENT_TYPES.ENTERPRISE) {
    if (!isEnterprise(clientType)) {
      return mockResponse(null, { error: ApiError.notFound('Affectation introuvable.') });
    }
    const assignment = getAssignmentsCache().find((item) => item.id === id && inScope(item));
    if (!assignment) {
      return mockResponse(null, { error: ApiError.notFound('Affectation introuvable.') });
    }
    return mockResponse({ ...assignment }, { latency: 350 });
  },

  /**
   * Création d'une affectation (véhicule / chauffeur libres requis).
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async create(payload) {
    const conflict = findConflictError(payload) || findDriverBusyError(payload.driverId);
    if (conflict) {
      return mockResponse(null, { error: conflict });
    }

    const now = new Date().toISOString();
    const assignment = {
      ...payload,
      id: nextAssignmentId(),
      companyId: TEC_COMPANY_ID,
      assignmentNumber: nextAssignmentNumber(),
      status: 'active',
      endMileage: 0,
      fuelLevelEnd: 0,
      endDate: '',
      createdAt: now,
      updatedAt: now,
    };
    getAssignmentsCache().unshift(assignment);
    return mockResponse({ ...assignment }, { latency: 400 });
  },

  /**
   * Mise à jour d'une affectation (conflits excluant l'affectation elle-même).
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async update(id, payload) {
    const cache = getAssignmentsCache();
    const index = cache.findIndex((item) => item.id === id && inScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Affectation introuvable.') });
    }

    const current = cache[index];
    const conflict = current.status === 'active'
      ? findConflictError(payload, id) || findDriverBusyError(payload.driverId)
      : null;
    if (conflict) {
      return mockResponse(null, { error: conflict });
    }

    const updated = { ...current, ...payload, id, updatedAt: new Date().toISOString() };
    cache[index] = updated;
    return mockResponse({ ...updated }, { latency: 400 });
  },

  /**
   * Clôture d'une affectation active (statut « Terminée » + compteurs de fin).
   * Recalcule la disponibilité du chauffeur et le statut du véhicule.
   * @param {string} id
   * @param {object} payload — { endDate, endMileage, fuelLevelEnd, reason }
   * @returns {Promise<object>}
   */
  async finish(id, payload) {
    const cache = getAssignmentsCache();
    const index = cache.findIndex((item) => item.id === id && inScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Affectation introuvable.') });
    }

    const current = cache[index];
    if (current.status === 'completed') {
      return mockResponse(null, {
        error: new ApiError({
          status: 409,
          code: 'ASSIGNMENT_ALREADY_COMPLETED',
          message: 'Cette affectation est déjà terminée.',
        }),
      });
    }

    const updated = {
      ...current,
      ...payload,
      status: 'completed',
      endMileage: Number(payload.endMileage) || current.endMileage || 0,
      fuelLevelEnd: Number(payload.fuelLevelEnd) || current.fuelLevelEnd || 0,
      endDate: payload.endDate || current.endDate || '',
      updatedAt: new Date().toISOString(),
    };
    cache[index] = updated;

    // Recalcul de la disponibilité du chauffeur (trajets en cours pris en compte).
    const driverIndex = getDriversCache().findIndex((driver) => driver.id === current.driverId);
    if (driverIndex !== -1) {
      getDriversCache()[driverIndex] = recomputeDriverAvailability(getDriversCache()[driverIndex]);
    }

    // Le véhicule redevient disponible s'il n'est plus en trajet.
    setVehicleInUse(current.vehicleId, false);

    return mockResponse({ ...updated }, { latency: 400 });
  },

  /**
   * Suppression (logique dans le mock : retrait du cache). 404 si absent.
   * @param {string} id
   * @returns {Promise<{ id: string }>}
   */
  async remove(id) {
    const cache = getAssignmentsCache();
    const index = cache.findIndex((item) => item.id === id && inScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Affectation introuvable.') });
    }
    cache.splice(index, 1);
    return mockResponse({ id }, { latency: 350 });
  },
};
