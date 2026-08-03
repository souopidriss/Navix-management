/**
 * Navix Trips — TripService
 * --------------------------------------------------------------------------
 * Description : gestion complète des trajets, mock uniquement.
 * Responsabilité : fournir les données de trajets aux vues et aux stores.
 *                  Mode mock : données simulées en mémoire, aucune requête HTTP.
 *
 * Méthodes :
 *   getAll()             → liste de tous les trajets
 *   getById(id)          → détail d'un trajet (404 si absent)
 *   create(payload)      → création (n° auto, affectation active requise)
 *   update(id, payload)  → mise à jour (404/409, trajet terminé verrouillé)
 *   finish(id, payload)  → clôture (statut « Terminé » + indicateurs réels)
 *   remove(id)           → suppression (404 si absent)
 *   history()            → trajets passés (terminés ou annulés)
 *
 * Règles métier simulées :
 *   - un trajet est toujours lié à une affectation ACTIVE (409 sinon)
 *   - le véhicule / le chauffeur sont dérivés de l'affectation liée
 *   - un trajet TERMINÉ ne peut plus être modifié (409 sinon)
 *
 * Exemple d'utilisation :
 *   import { tripService } from '../services';
 *   const trips = await tripService.getAll();
 */
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '@/services/client';
import { apiConfig } from '@/services/config';
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { MOCK_TRIPS, nextTripNumber } from '../mocks';
import { MOCK_ASSIGNMENTS } from '@/features/assignments/mocks';
import { getTripDurationMinutes } from '../constants';

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

const getAssignment = (id) => MOCK_ASSIGNMENTS.find((assignment) => assignment.id === id) || null;

const isActive = (assignment) => assignment?.status === 'active';

let tripsCache = null;
let tripNumberCounter = Number(nextTripNumber);

const getTripsCache = () => {
  if (!tripsCache) {
    tripsCache = MOCK_TRIPS.map((trip) => ({ ...trip }));
  }
  return tripsCache;
};

/**
 * Vérifie que l'affectation liée est active (règle métier « affectation
 * active obligatoire »).
 */
const findAssignmentError = (assignmentId) => {
  const assignment = getAssignment(assignmentId);

  if (!assignment) {
    return new ApiError({
      status: 400,
      code: 'TRIP_ASSIGNMENT_NOT_FOUND',
      message: 'L’affectation sélectionnée est introuvable.',
    });
  }

  if (!isActive(assignment)) {
    return new ApiError({
      status: 409,
      code: 'TRIP_ASSIGNMENT_INACTIVE',
      message: 'L’affectation sélectionnée n’est pas active. Sélectionnez une affectation active.',
    });
  }

  return null;
};

/** Calcule la vitesse moyenne à partir de la distance et de la durée (minutes). */
const computeAverageSpeed = (distance, duration) => {
  if (!Number.isFinite(Number(distance)) || Number(distance) <= 0) return 0;
  if (!Number.isFinite(Number(duration)) || Number(duration) <= 0) return 0;
  return Math.round(Number(distance) / (Number(duration) / 60));
};

export const tripService = {
  /**
   * Liste de tous les trajets (copie — les mutations ultérieures du cache
   * n'affectent pas les consommateurs).
   * @returns {Promise<Array<object>>}
   */
  async getAll() {
    if (apiConfig.mock) {
      return mockResponse([...getTripsCache()]);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.TRIPS.LIST);
    return data;
  },

  /**
   * Trajets passés (terminés ou annulés), triés de la plus récente
   * à la plus ancienne.
   * @returns {Promise<Array<object>>}
   */
  async history() {
    if (apiConfig.mock) {
      const past = getTripsCache()
        .filter((trip) => trip.status === 'completed' || trip.status === 'cancelled')
        .sort((a, b) => String(b.arrivalDate || b.updatedAt).localeCompare(String(a.arrivalDate || a.updatedAt)));
      return mockResponse([...past]);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.TRIPS.HISTORY);
    return data;
  },

  /**
   * Détail d'un trajet.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getById(id) {
    if (apiConfig.mock) {
      const trip = getTripsCache().find((item) => item.id === id);
      if (!trip) {
        return mockResponse(null, { error: ApiError.notFound('Trajet introuvable.') });
      }
      return mockResponse(trip);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.TRIPS.DETAIL(id));
    return data;
  },

  /**
   * Création d'un trajet (l'affectation liée doit être active ; le véhicule
   * et le chauffeur sont dérivés de cette affectation).
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async create(payload) {
    if (apiConfig.mock) {
      const assignmentError = findAssignmentError(payload.assignmentId);
      if (assignmentError) {
        return mockResponse(null, { error: assignmentError });
      }

      const assignment = getAssignment(payload.assignmentId);
      const now = new Date().toISOString();
      tripNumberCounter += 1;
      const trip = {
        ...payload,
        id: generateUlid(),
        tripNumber: `TRP-${String(tripNumberCounter).padStart(4, '0')}`,
        companyId: assignment.companyId,
        vehicleId: assignment.vehicleId,
        driverId: assignment.driverId,
        status: 'planned',
        actualDistance: 0,
        arrivalMileage: 0,
        actualDuration: 0,
        averageSpeed: 0,
        createdBy: 'Utilisateur connecté',
        createdAt: now,
        updatedAt: now,
      };
      getTripsCache().unshift(trip);
      return mockResponse(trip);
    }

    const { data } = await apiClient.post(API_ENDPOINTS.TRIPS.LIST, payload);
    return data;
  },

  /**
   * Mise à jour d'un trajet (trajet terminé verrouillé ; affectation active
   * requise ; véhicule et chauffeur redérivés de l'affectation).
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async update(id, payload) {
    if (apiConfig.mock) {
      const index = getTripsCache().findIndex((item) => item.id === id);
      if (index === -1) {
        return mockResponse(null, { error: ApiError.notFound('Trajet introuvable.') });
      }

      const current = getTripsCache()[index];
      if (current.status === 'completed') {
        return mockResponse(null, {
          error: new ApiError({
            status: 409,
            code: 'TRIP_COMPLETED_LOCKED',
            message: 'Un trajet terminé ne peut plus être modifié.',
          }),
        });
      }

      const assignmentError = findAssignmentError(payload.assignmentId);
      if (assignmentError) {
        return mockResponse(null, { error: assignmentError });
      }

      const assignment = getAssignment(payload.assignmentId);
      const updated = {
        ...current,
        ...payload,
        id,
        companyId: assignment.companyId,
        vehicleId: assignment.vehicleId,
        driverId: assignment.driverId,
        updatedAt: new Date().toISOString(),
      };
      getTripsCache()[index] = updated;
      return mockResponse(updated);
    }

    const { data } = await apiClient.put(API_ENDPOINTS.TRIPS.DETAIL(id), payload);
    return data;
  },

  /**
   * Clôture d'un trajet (statut « Terminé » + indicateurs réels).
   * @param {string} id
   * @param {object} payload — { arrivalDate, arrivalTime, actualDistance, arrivalMileage, actualDuration, notes }
   * @returns {Promise<object>}
   */
  async finish(id, payload) {
    if (apiConfig.mock) {
      const index = getTripsCache().findIndex((item) => item.id === id);
      if (index === -1) {
        return mockResponse(null, { error: ApiError.notFound('Trajet introuvable.') });
      }

      const current = getTripsCache()[index];
      if (current.status === 'completed') {
        return mockResponse(null, {
          error: new ApiError({
            status: 409,
            code: 'TRIP_ALREADY_COMPLETED',
            message: 'Ce trajet est déjà terminé.',
          }),
        });
      }

      const duration = Number(payload.actualDuration) || getTripDurationMinutes(current) || 0;
      const distance = Number(payload.actualDistance) || 0;

      const updated = {
        ...current,
        ...payload,
        status: 'completed',
        actualDistance: distance,
        arrivalMileage: payload.arrivalMileage || current.arrivalMileage || 0,
        actualDuration: duration,
        averageSpeed: computeAverageSpeed(distance, duration),
        updatedAt: new Date().toISOString(),
      };
      getTripsCache()[index] = updated;
      return mockResponse(updated);
    }

    const { data } = await apiClient.post(API_ENDPOINTS.TRIPS.DETAIL(id), payload);
    return data;
  },

  /**
   * Suppression d'un trajet.
   * @param {string} id
   * @returns {Promise<{ id: string }>}
   */
  async remove(id) {
    if (apiConfig.mock) {
      const exists = getTripsCache().some((item) => item.id === id);
      if (!exists) {
        return mockResponse(null, { error: ApiError.notFound('Trajet introuvable.') });
      }
      tripsCache = getTripsCache().filter((item) => item.id !== id);
      return mockResponse({ id });
    }

    const { data } = await apiClient.delete(API_ENDPOINTS.TRIPS.DETAIL(id));
    return data;
  },
};
