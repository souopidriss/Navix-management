/**
 * Navix Client — Service Trajets (Opérations Client)
 * --------------------------------------------------------------------------
 * PROMPT 057 — Trajets strictement isolés multi-tenant (companyId Transports
 * Express Cameroun). Le véhicule et le chauffeur sont dérivés de
 * l'affectation liée (doit être active).
 *
 * Workflow imposé :
 *   planned → in_progress → completed   (alternative : planned → cancelled)
 *   in_progress → cancelled autorisé.
 * Interdits : completed → {in_progress, planned} et cancelled → {in_progress, completed}.
 *
 * Règles :
 *   - clôture : `arrivalMileage >= departureMileage` sinon erreur ;
 *   - un chauffeur déjà en trajet ne peut pas démarrer un autre trajet (409) ;
 *   - chaque transition alimente l'historique `events` (timeline) ;
 *   - départ / clôture / annulation → disponibilité du chauffeur et statut du
 *     véhicule recalculés (cascade).
 */
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { CLIENT_TYPES } from '../constants/client.constants';
import {
  nextTripId,
  nextTripNumber,
  getTripsCache,
  getAssignmentsCache,
  getDriversCache,
  findAssignment,
  recomputeDriverAvailability,
  setVehicleInUse,
  getNextTripStatuses,
} from './clientOperationsData';
import { getTripDurationMinutes } from '@/features/trips/constants';

const TEC_COMPANY_ID = '01J8A2B3C4D5E6F7G8H9J0K1L2';

const isEnterprise = (clientType) => clientType === CLIENT_TYPES.ENTERPRISE;

const inScope = (trip) => trip.companyId === TEC_COMPANY_ID;

const isActive = (assignment) => assignment?.status === 'active';

/** L'affectation liée doit exister et être active (règle métier). */
const findAssignmentError = (assignmentId) => {
  const assignment = findAssignment(assignmentId);
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

/** Ajoute un évènement à l'historique du trajet (timeline). */
const pushEvent = (trip, type, label, at = new Date().toISOString()) => ({
  ...trip,
  events: [
    ...(trip.events || []),
    { id: `EVT-${trip.id.split('-').pop()}-${(trip.events?.length || 0) + 1}-${Date.now()}`, type, label, at },
  ],
});

export const clientTripService = {
  /**
   * Liste des trajets du Client (isolés par entreprise).
   * @param {string} [clientType]
   * @returns {Promise<Array<object>>}
   */
  async getAll(clientType = CLIENT_TYPES.ENTERPRISE) {
    if (!isEnterprise(clientType)) {
      return mockResponse([], { latency: 300 });
    }
    return mockResponse(
      getTripsCache()
        .filter(inScope)
        .map((trip) => ({ ...trip })),
      { latency: 400 },
    );
  },

  /**
   * Détail d'un trajet (404 hors portée / introuvable).
   * @param {string} id
   * @param {string} [clientType]
   * @returns {Promise<object>}
   */
  async getById(id, clientType = CLIENT_TYPES.ENTERPRISE) {
    if (!isEnterprise(clientType)) {
      return mockResponse(null, { error: ApiError.notFound('Trajet introuvable.') });
    }
    const trip = getTripsCache().find((item) => item.id === id && inScope(item));
    if (!trip) {
      return mockResponse(null, { error: ApiError.notFound('Trajet introuvable.') });
    }
    return mockResponse({ ...trip }, { latency: 350 });
  },

  /**
   * Création d'un trajet (affectation active requise ; véhicule / chauffeur
   * dérivés de l'affectation). Statut initial : `planned`.
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async create(payload) {
    const assignmentError = findAssignmentError(payload.assignmentId);
    if (assignmentError) {
      return mockResponse(null, { error: assignmentError });
    }

    const assignment = findAssignment(payload.assignmentId);
    const now = new Date().toISOString();
    const trip = {
      ...payload,
      id: nextTripId(),
      companyId: TEC_COMPANY_ID,
      assignmentId: assignment.id,
      vehicleId: assignment.vehicleId,
      driverId: assignment.driverId,
      tripNumber: nextTripNumber(),
      status: 'planned',
      actualDistance: 0,
      arrivalMileage: 0,
      actualDuration: 0,
      averageSpeed: 0,
      arrivalDate: '',
      arrivalTime: '',
      notes: payload.notes || '',
      events: [
        { id: `EVT-${Date.now()}-created`, type: 'created', label: 'Trajet planifié', at: now },
      ],
      createdAt: now,
      updatedAt: now,
    };
    getTripsCache().unshift(trip);
    return mockResponse({ ...trip }, { latency: 400 });
  },

  /**
   * Mise à jour d'un trajet planifié / en cours (terminé verrouillé).
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async update(id, payload) {
    const cache = getTripsCache();
    const index = cache.findIndex((item) => item.id === id && inScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Trajet introuvable.') });
    }

    const current = cache[index];
    if (current.status === 'completed' || current.status === 'cancelled') {
      return mockResponse(null, {
        error: new ApiError({
          status: 409,
          code: 'TRIP_LOCKED',
          message: 'Un trajet terminé ou annulé ne peut plus être modifié.',
        }),
      });
    }

    if (payload.assignmentId && payload.assignmentId !== current.assignmentId) {
      const assignmentError = findAssignmentError(payload.assignmentId);
      if (assignmentError) {
        return mockResponse(null, { error: assignmentError });
      }
      const assignment = findAssignment(payload.assignmentId);
      const updated = {
        ...current,
        ...payload,
        id,
        vehicleId: assignment.vehicleId,
        driverId: assignment.driverId,
        updatedAt: new Date().toISOString(),
      };
      cache[index] = updated;
      return mockResponse({ ...updated }, { latency: 400 });
    }

    const updated = { ...current, ...payload, id, updatedAt: new Date().toISOString() };
    cache[index] = updated;
    return mockResponse({ ...updated }, { latency: 400 });
  },

  /**
   * Démarrage d'un trajet (planned → in_progress). Le chauffeur passe « en
   * service » et le véhicule « en circulation ».
   * @param {string} id
   * @param {object} [payload] — { departureMileage }
   * @returns {Promise<object>}
   */
  async start(id, payload = {}) {
    const cache = getTripsCache();
    const index = cache.findIndex((item) => item.id === id && inScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Trajet introuvable.') });
    }

    const current = cache[index];
    if (!getNextTripStatuses(current.status).includes('in_progress')) {
      return mockResponse(null, {
        error: new ApiError({
          status: 409,
          code: 'TRIP_STATUS_TRANSITION',
          message: 'Ce trajet ne peut pas être démarré depuis son statut actuel.',
        }),
      });
    }

    const driver = getDriversCache().find((item) => item.id === current.driverId);
    const driverBusy = driver?.availability === 'busy' || current.status === 'in_progress';
    if (driverBusy) {
      // Le trajet lui-même en cours est exclu ; un second trajet du même
      // chauffeur en in_progress bloque le démarrage.
      const otherInProgress = cache.some(
        (trip) => trip.driverId === current.driverId && trip.status === 'in_progress' && trip.id !== id,
      );
      if (otherInProgress) {
        return mockResponse(null, {
          error: new ApiError({
            status: 409,
            code: 'TRIP_DRIVER_BUSY',
            message: 'Ce chauffeur est déjà en trajet. Terminez le trajet en cours avant d’en démarrer un autre.',
          }),
        });
      }
    }

    const now = new Date().toISOString();
    const updated = pushEvent(
      {
        ...current,
        departureMileage:
          payload.departureMileage !== undefined
            ? Number(payload.departureMileage) || current.departureMileage || 0
            : current.departureMileage || 0,
        status: 'in_progress',
        updatedAt: now,
      },
      'started',
      `Départ de ${current.departureLocation || 'la ville de départ'}`,
    );
    cache[index] = updated;

    // Cascade : chauffeur en service + véhicule en circulation.
    if (driver) {
      driver.availability = 'busy';
      driver.updatedAt = now;
    }
    setVehicleInUse(current.vehicleId, true);

    return mockResponse({ ...updated }, { latency: 400 });
  },

  /**
   * Clôture d'un trajet (in_progress → completed). Exige
   * `arrivalMileage >= departureMileage` (sinon erreur).
   * @param {string} id
   * @param {object} payload — { arrivalDate, arrivalTime, actualDistance, arrivalMileage, actualDuration, notes }
   * @returns {Promise<object>}
   */
  async finish(id, payload) {
    const cache = getTripsCache();
    const index = cache.findIndex((item) => item.id === id && inScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Trajet introuvable.') });
    }

    const current = cache[index];
    if (!getNextTripStatuses(current.status).includes('completed')) {
      return mockResponse(null, {
        error: new ApiError({
          status: 409,
          code: 'TRIP_STATUS_TRANSITION',
          message: 'Ce trajet ne peut pas être terminé depuis son statut actuel.',
        }),
      });
    }

    const arrivalMileage = Number(payload.arrivalMileage) || current.arrivalMileage || 0;
    if (arrivalMileage < Number(current.departureMileage) || 0) {
      return mockResponse(null, {
        error: new ApiError({
          status: 400,
          code: 'TRIP_MILEAGE_INVALID',
          message: 'Le kilométrage d’arrivée doit être supérieur ou égal au kilométrage de départ.',
        }),
      });
    }

    const distance = Number(payload.actualDistance) || 0;
    const duration =
      Number(payload.actualDuration) ||
      getTripDurationMinutes({
        departureDate: current.departureDate,
        departureTime: current.departureTime,
        arrivalDate: payload.arrivalDate || current.arrivalDate,
        arrivalTime: payload.arrivalTime || current.arrivalTime,
      }) ||
      0;

    const now = new Date().toISOString();
    const eventAt =
      payload.arrivalDate && payload.arrivalTime
        ? `${payload.arrivalDate}T${payload.arrivalTime}:00`
        : payload.arrivalDate
          ? `${payload.arrivalDate}T00:00:00`
          : now;
    const updated = pushEvent(
      {
        ...current,
        ...payload,
        status: 'completed',
        actualDistance: distance,
        arrivalMileage,
        actualDuration: duration,
        averageSpeed: computeAverageSpeed(distance, duration),
        updatedAt: now,
      },
      'completed',
      `Arrivée à ${current.arrivalLocation || 'la destination'}`,
      eventAt,
    );
    cache[index] = updated;

    // Cascade : disponibilité du chauffeur + statut du véhicule recalculés.
    const driverIndex = getDriversCache().findIndex((driver) => driver.id === current.driverId);
    if (driverIndex !== -1) {
      getDriversCache()[driverIndex] = recomputeDriverAvailability(getDriversCache()[driverIndex]);
    }
    setVehicleInUse(current.vehicleId, false);

    return mockResponse({ ...updated }, { latency: 400 });
  },

  /**
   * Annulation d'un trajet (planned ou in_progress → cancelled).
   * @param {string} id
   * @param {object} [payload] — { reason }
   * @returns {Promise<object>}
   */
  async cancel(id, payload = {}) {
    const cache = getTripsCache();
    const index = cache.findIndex((item) => item.id === id && inScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Trajet introuvable.') });
    }

    const current = cache[index];
    if (!getNextTripStatuses(current.status).includes('cancelled')) {
      return mockResponse(null, {
        error: new ApiError({
          status: 409,
          code: 'TRIP_STATUS_TRANSITION',
          message: 'Ce trajet ne peut pas être annulé depuis son statut actuel.',
        }),
      });
    }

    const now = new Date().toISOString();
    const updated = pushEvent(
      {
        ...current,
        status: 'cancelled',
        notes: payload.reason || current.notes || '',
        updatedAt: now,
      },
      'cancelled',
      'Trajet annulé',
    );
    cache[index] = updated;

    // Si le trajet était en cours, libère chauffeur et véhicule.
    if (current.status === 'in_progress') {
      const driverIndex = getDriversCache().findIndex((driver) => driver.id === current.driverId);
      if (driverIndex !== -1) {
        getDriversCache()[driverIndex] = recomputeDriverAvailability(getDriversCache()[driverIndex]);
      }
      setVehicleInUse(current.vehicleId, false);
    }

    return mockResponse({ ...updated }, { latency: 400 });
  },

  /**
   * Suppression (logique dans le mock : retrait du cache). 404 si absent.
   * @param {string} id
   * @returns {Promise<{ id: string }>}
   */
  async remove(id) {
    const cache = getTripsCache();
    const index = cache.findIndex((item) => item.id === id && inScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Trajet introuvable.') });
    }
    cache.splice(index, 1);
    return mockResponse({ id }, { latency: 350 });
  },
};

export { getAssignmentsCache };
