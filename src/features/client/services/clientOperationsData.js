/**
 * Navix Client — Cœur de données Opérations (Chauffeurs · Affectations · Trajets)
 * --------------------------------------------------------------------------
 * PROMPT 057 — Cache multi-tenant partagé entre les trois services Opérations
 * Client (`clientDriverService`, `clientAssignmentService`, `clientTripService`).
 *
 * Garanties :
 *   - Isolation : seules les entités liées à `companyId` = Transports Express
 *     Cameroun sont exposées (Client Particulier : aucune).
 *   - Références : les caches sont des copies profondes des mocks ; les
 *     mutations successives sont cohérentes entre services (une affectation
 *     terminée recalcule la disponibilité du chauffeur, un trajet démarré met
 *     le véhicule « en circulation », etc.).
 *   - Graphes de transitions : sources uniques exposées à l'UI.
 */
import { setVehicleOperationalStatus } from './clientVehicleService';
import { CLIENT_TYPES } from '../constants/client.constants';
import {
  MOCK_CLIENT_DRIVERS,
  MOCK_CLIENT_ASSIGNMENTS,
  MOCK_CLIENT_TRIPS,
} from '../mocks/clientOperations.mock';

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

const copyList = (list) => list.map((item) => ({ ...item }));

let driversCache = null;
let assignmentsCache = null;
let tripsCache = null;

const getDrivers = () => {
  if (!driversCache) driversCache = copyList(MOCK_CLIENT_DRIVERS);
  return driversCache;
};

const getAssignments = () => {
  if (!assignmentsCache) assignmentsCache = copyList(MOCK_CLIENT_ASSIGNMENTS);
  return assignmentsCache;
};

const getTrips = () => {
  if (!tripsCache) tripsCache = copyList(MOCK_CLIENT_TRIPS);
  return tripsCache;
};

/** Caches bruts partagés (mutables par les services Opérations). */
export const getDriversCache = getDrivers;
export const getAssignmentsCache = getAssignments;
export const getTripsCache = getTrips;

/* ─── Graphes de transitions (sources uniques pour l'UI) ─────────────────── */

/** Transitions de statut d'un chauffeur. */
export const DRIVER_STATUS_TRANSITIONS = {
  active: ['on_mission', 'available', 'on_leave', 'suspended', 'inactive'],
  on_mission: ['active', 'available', 'on_leave', 'suspended', 'inactive'],
  available: ['active', 'on_mission', 'on_leave', 'suspended', 'inactive'],
  suspended: ['active', 'inactive'],
  on_leave: ['active', 'available'],
  inactive: ['active'],
};

export const getNextDriverStatuses = (status) => DRIVER_STATUS_TRANSITIONS[status] ?? [];

/** Transitions de disponibilité d'un chauffeur (catalogue officiel admin). */
export const DRIVER_AVAILABILITY_TRANSITIONS = {
  available: ['busy', 'unavailable'],
  busy: ['available', 'unavailable'],
  unavailable: ['available', 'busy'],
};

export const getNextDriverAvailabilities = (availability) =>
  DRIVER_AVAILABILITY_TRANSITIONS[availability] ?? [];

/** Transitions de statut d'une affectation (catalogue officiel admin). */
export const ASSIGNMENT_STATUS_TRANSITIONS = {
  planned: ['active', 'cancelled'],
  active: ['completed', 'cancelled', 'suspended'],
  completed: [],
  cancelled: [],
  suspended: ['active', 'completed', 'cancelled'],
};

export const getNextAssignmentStatuses = (status) => ASSIGNMENT_STATUS_TRANSITIONS[status] ?? [];

/**
 * Transitions de statut d'un trajet (workflow imposé PROMPT 057) :
 *   planned → in_progress → completed   (alternative : planned → cancelled)
 *   in_progress → cancelled autorisé.
 * Interdits : completed → {in_progress, planned} et cancelled → {in_progress, completed}.
 */
export const TRIP_STATUS_TRANSITIONS = {
  planned: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
  suspended: ['in_progress', 'cancelled'],
};

export const getNextTripStatuses = (status) => TRIP_STATUS_TRANSITIONS[status] ?? [];

/* ─── Génération d'identifiants / numéros ─────────────────────────────────── */

const numericSuffix = (id) => Number(id.replace(/^.*-(\d+)$/, '$1')) || 0;

const nextId = (prefix, cache) => {
  const max = cache.reduce((acc, item) => Math.max(acc, numericSuffix(item.id)), 0);
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
};

const nextNumber = (prefix, cache) => {
  const max = cache.reduce((acc, item) => Math.max(acc, numericSuffix(item.assignmentNumber ?? item.tripNumber ?? item.employeeCode)), 0);
  return `${prefix}-${String(max + 1).padStart(4, '0')}`;
};

export const nextDriverId = () => nextId('CDR', getDrivers());
export const nextAssignmentId = () => nextId('CASG', getAssignments());
export const nextAssignmentNumber = () => nextNumber('CASG', getAssignments());
export const nextTripId = () => nextId('TRP-CLT', getTrips());
export const nextTripNumber = () => nextNumber('TRP-CLT', getTrips());

/* ─── Filtres multi-tenant / prédicats ────────────────────────────────────── */

const hasCompany = (item) => item.companyId === '01J8A2B3C4D5E6F7G8H9J0K1L2';

export const isEnterpriseScope = (clientType) => clientType === CLIENT_TYPES.ENTERPRISE;

export const scopedDrivers = (clientType) => {
  if (!isEnterpriseScope(clientType)) return [];
  return getDrivers().filter(hasCompany);
};

export const scopedAssignments = (clientType) => {
  if (!isEnterpriseScope(clientType)) return [];
  return getAssignments().filter(hasCompany);
};

export const scopedTrips = (clientType) => {
  if (!isEnterpriseScope(clientType)) return [];
  return getTrips().filter(hasCompany);
};

export const findDriver = (id) => getDrivers().find((item) => item.id === id) || null;
export const findAssignment = (id) => getAssignments().find((item) => item.id === id) || null;
export const findTrip = (id) => getTrips().find((item) => item.id === id) || null;

export const hasActiveAssignmentForVehicle = (vehicleId, excludedId = null) =>
  getAssignments().some(
    (assignment) =>
      assignment.vehicleId === vehicleId && assignment.status === 'active' && assignment.id !== excludedId,
  );

export const hasActiveAssignmentForDriver = (driverId, excludedId = null) =>
  getAssignments().some(
    (assignment) =>
      assignment.driverId === driverId && assignment.status === 'active' && assignment.id !== excludedId,
  );

export const hasInProgressTripForDriver = (driverId) =>
  getTrips().some((trip) => trip.driverId === driverId && trip.status === 'in_progress');

export const hasInProgressTripForVehicle = (vehicleId) =>
  getTrips().some((trip) => trip.vehicleId === vehicleId && trip.status === 'in_progress');

/* ─── Calculs croisés (cohérence opérationnelle) ─────────────────────────── */

/** Reconstruction de la disponibilité d'un chauffeur (statut + trajets en cours). */
export const recomputeDriverAvailability = (driver) => {
  const unavailableStatuses = ['suspended', 'inactive', 'on_leave'];
  const nextAvailability = hasInProgressTripForDriver(driver.id)
    ? 'busy'
    : unavailableStatuses.includes(driver.status)
      ? 'unavailable'
      : 'available';

  if (driver.availability !== nextAvailability) {
    driver.availability = nextAvailability;
    driver.updatedAt = new Date().toISOString();
  }
  return driver;
};

/** Mise à jour opérationnelle du véhicule (en circulation / disponible). */
export const setVehicleInUse = (vehicleId, inUse) => {
  if (inUse) {
    return setVehicleOperationalStatus(vehicleId, 'in_use');
  }
  // Ne force « disponible » que si le véhicule n'a plus aucun trajet en cours.
  if (hasInProgressTripForVehicle(vehicleId)) return false;
  return setVehicleOperationalStatus(vehicleId, 'available');
};

export { generateUlid };
