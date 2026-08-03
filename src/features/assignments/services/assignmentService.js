/**
 * Navix Assignments — AssignmentService
 * --------------------------------------------------------------------------
 * Description : gestion complète des affectations (véhicule ↔ chauffeur),
 *               mock uniquement.
 * Responsabilité : fournir les données d'affectation aux vues et aux stores.
 *                  Mode mock : données simulées en mémoire, aucune requête HTTP.
 *
 * Méthodes :
 *   getAll()                → liste de toutes les affectations
 *   getById(id)             → détail d'une affectation (404 si absente)
 *   create(payload)         → création (n° auto, véhicule/chauffeur libres)
 *   update(id, payload)     → mise à jour (404/409)
 *   finish(id, payload)     → clôture (statut « Terminée »)
 *   remove(id)              → suppression (404 si absente)
 *   history()               → affectations passées (terminées ou annulées)
 *
 * Règles métier simulées :
 *   - un véhicule ne peut avoir qu'une seule affectation ACTIVE (409 sinon)
 *   - un chauffeur ne peut avoir qu'une seule affectation ACTIVE (409 sinon)
 *
 * Exemple d'utilisation :
 *   import { assignmentService } from '../services';
 *   const assignments = await assignmentService.getAll();
 */
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '@/services/client';
import { apiConfig } from '@/services/config';
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { MOCK_ASSIGNMENTS, nextAssignmentNumber } from '../mocks';

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

const isActive = (assignment) => assignment.status === 'active';

let assignmentsCache = null;
let assignmentNumberCounter = Number(nextAssignmentNumber);

const getAssignmentsCache = () => {
  if (!assignmentsCache) {
    assignmentsCache = MOCK_ASSIGNMENTS.map((assignment) => ({ ...assignment }));
  }
  return assignmentsCache;
};

const hasActiveForVehicle = (vehicleId, excludedId) =>
  getAssignmentsCache().some(
    (assignment) => assignment.vehicleId === vehicleId && isActive(assignment) && assignment.id !== excludedId,
  );

const hasActiveForDriver = (driverId, excludedId) =>
  getAssignmentsCache().some(
    (assignment) => assignment.driverId === driverId && isActive(assignment) && assignment.id !== excludedId,
  );

/** Vérifie les conflits métier (véhicule / chauffeur déjà en affectation active). */
const findConflictError = (payload, excludedId = null) => {
  if (hasActiveForVehicle(payload.vehicleId, excludedId)) {
    return new ApiError({
      status: 409,
      code: 'ASSIGNMENT_VEHICLE_ACTIVE',
      message: 'Ce véhicule est déjà en affectation active.',
    });
  }

  if (hasActiveForDriver(payload.driverId, excludedId)) {
    return new ApiError({
      status: 409,
      code: 'ASSIGNMENT_DRIVER_ACTIVE',
      message: 'Ce chauffeur est déjà en affectation active.',
    });
  }

  return null;
};

export const assignmentService = {
  /**
   * Liste de toutes les affectations (copie — les mutations ultérieures du
   * cache n'affectent pas les consommateurs).
   * @returns {Promise<Array<object>>}
   */
  async getAll() {
    if (apiConfig.mock) {
      return mockResponse([...getAssignmentsCache()]);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.ASSIGNMENTS.LIST);
    return data;
  },

  /**
   * Affectations passées (terminées ou annulées), triées de la plus récente
   * à la plus ancienne.
   * @returns {Promise<Array<object>>}
   */
  async history() {
    if (apiConfig.mock) {
      const past = getAssignmentsCache()
        .filter((assignment) => assignment.status === 'completed' || assignment.status === 'cancelled')
        .sort((a, b) => String(b.endDate || b.updatedAt).localeCompare(String(a.endDate || a.updatedAt)));
      return mockResponse([...past]);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.ASSIGNMENTS.HISTORY);
    return data;
  },

  /**
   * Détail d'une affectation.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getById(id) {
    if (apiConfig.mock) {
      const assignment = getAssignmentsCache().find((item) => item.id === id);
      if (!assignment) {
        return mockResponse(null, { error: ApiError.notFound('Affectation introuvable.') });
      }
      return mockResponse(assignment);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.ASSIGNMENTS.DETAIL(id));
    return data;
  },

  /**
   * Création d'une affectation (le véhicule et le chauffeur doivent être
   * libres — une seule affectation active chacun).
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async create(payload) {
    if (apiConfig.mock) {
      const conflict = findConflictError(payload);
      if (conflict) {
        return mockResponse(null, { error: conflict });
      }

      const now = new Date().toISOString();
      assignmentNumberCounter += 1;
      const assignment = {
        ...payload,
        id: generateUlid(),
        assignmentNumber: `ASG-${String(assignmentNumberCounter).padStart(4, '0')}`,
        status: 'active',
        endMileage: 0,
        fuelLevelEnd: 0,
        createdBy: 'Utilisateur connecté',
        validatedBy: '',
        createdAt: now,
        updatedAt: now,
      };
      getAssignmentsCache().unshift(assignment);
      return mockResponse(assignment);
    }

    const { data } = await apiClient.post(API_ENDPOINTS.ASSIGNMENTS.LIST, payload);
    return data;
  },

  /**
   * Mise à jour d'une affectation (les contrôles d'activité excluent
   * l'affectation elle-même).
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async update(id, payload) {
    if (apiConfig.mock) {
      const index = getAssignmentsCache().findIndex((item) => item.id === id);
      if (index === -1) {
        return mockResponse(null, { error: ApiError.notFound('Affectation introuvable.') });
      }

      const current = getAssignmentsCache()[index];
      const conflict = isActive(current) ? findConflictError(payload, id) : null;
      if (conflict) {
        return mockResponse(null, { error: conflict });
      }

      const updated = {
        ...current,
        ...payload,
        id,
        updatedAt: new Date().toISOString(),
      };
      getAssignmentsCache()[index] = updated;
      return mockResponse(updated);
    }

    const { data } = await apiClient.put(API_ENDPOINTS.ASSIGNMENTS.DETAIL(id), payload);
    return data;
  },

  /**
   * Clôture d'une affectation active (statut « Terminée » + compteurs de fin).
   * @param {string} id
   * @param {object} payload — { endDate, endMileage, fuelLevelEnd, reason }
   * @returns {Promise<object>}
   */
  async finish(id, payload) {
    if (apiConfig.mock) {
      const index = getAssignmentsCache().findIndex((item) => item.id === id);
      if (index === -1) {
        return mockResponse(null, { error: ApiError.notFound('Affectation introuvable.') });
      }

      const current = getAssignmentsCache()[index];
      const updated = {
        ...current,
        ...payload,
        status: 'completed',
        endMileage: payload.endMileage || current.endMileage || 0,
        fuelLevelEnd: payload.fuelLevelEnd || current.fuelLevelEnd || 0,
        endDate: payload.endDate || current.endDate || '',
        validatedBy: current.validatedBy || 'Utilisateur connecté',
        updatedAt: new Date().toISOString(),
      };
      getAssignmentsCache()[index] = updated;
      return mockResponse(updated);
    }

    const { data } = await apiClient.post(API_ENDPOINTS.ASSIGNMENTS.DETAIL(id), payload);
    return data;
  },

  /**
   * Suppression d'une affectation.
   * @param {string} id
   * @returns {Promise<{ id: string }>}
   */
  async remove(id) {
    if (apiConfig.mock) {
      const exists = getAssignmentsCache().some((item) => item.id === id);
      if (!exists) {
        return mockResponse(null, { error: ApiError.notFound('Affectation introuvable.') });
      }
      assignmentsCache = getAssignmentsCache().filter((item) => item.id !== id);
      return mockResponse({ id });
    }

    const { data } = await apiClient.delete(API_ENDPOINTS.ASSIGNMENTS.DETAIL(id));
    return data;
  },
};
