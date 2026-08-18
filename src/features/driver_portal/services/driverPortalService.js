/**
 * Navix Management — Driver Portal Service
 * --------------------------------------------------------------------------
 * Service encapsulant la logique d'accès aux données de l'Espace Chauffeur
 * Premium (trajets, véhicule, carburant, entretiens, incidents, documents,
 * notifications, profil). Simule des appels API avec les mocks locaux.
 *
 * Règles appliquées avant toute mutation :
 *  - RBAC : la permission métier est vérifiée dans l'état RBAC courant ;
 *  - Appartenance : les entités sont vérifiées côté `driverId` / `vehicleId`
 *    du chauffeur connecté (cloisonnement multi-tenant) ;
 *  - Cohérence kilométrage : valeurs entières, positives, ≥ dernier compteur
 *    connu, et arrivée ≥ départ ;
 *  - Workflow : transitions autorisées uniquement (DRIVER_TRIP_WORKFLOW).
 */
import {
  DRIVER_PROFILE_MOCK,
  DRIVER_VEHICLE_MOCK,
  DRIVER_TRIPS_MOCK,
  DRIVER_FUEL_MOCK,
  DRIVER_MAINTENANCE_MOCK,
  DRIVER_INCIDENTS_MOCK,
  DRIVER_DOCUMENTS_MOCK,
  DRIVER_NOTIFICATIONS_MOCK,
  findDriverTrip,
  updateDriverTrip,
  updateDriverNotification,
  pushDriverNotification,
  getDriverLastKnownMileage,
} from '../mocks/driverPortal.mock';
import {
  getDriverTripStatus,
  getIncidentType,
  isDriverTripActive,
  computeDriverDocumentStatus,
} from '../constants/driver.constants';
import { formatNumber, formatTime } from '@/utils/format';
import { can, PERMISSIONS, useRbacStore } from '@/features/rbac';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Date ISO locale (YYYY-MM-DD) à partir d'un objet Date. */
const toISODate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/** Contrôle d'accès courant (lecture synchrone du store RBAC). */
const canUse = (permission) => can(useRbacStore.getState().permissions, permission);

/**
 * L'entité appartient-elle au chauffeur connecté ?
 * Sans identifiant propriétaire → considérée comme affectée au chauffeur.
 */
const isOwnedByDriver = (item) => {
  if (!item) return false;
  if (item.driverId && item.driverId !== DRIVER_PROFILE_MOCK.id) return false;
  if (item.vehicleId && item.vehicleId !== DRIVER_VEHICLE_MOCK.id) return false;
  return true;
};

const denied = (message = 'Vous n\u2019avez pas l\u2019autorisation d\u2019effectuer cette action.') => ({
  success: false,
  error: message,
});

export const driverPortalService = {
  /** Profil du chauffeur connecté. */
  async getProfile() {
    await delay(500);
    return DRIVER_PROFILE_MOCK;
  },

  /** Véhicule assigné au chauffeur connecté. */
  async getVehicle() {
    await delay(500);
    return DRIVER_VEHICLE_MOCK;
  },

  /** Liste des trajets du chauffeur connecté (filtre d'appartenance). */
  async getTrips() {
    await delay(600);
    return DRIVER_TRIPS_MOCK.filter(isOwnedByDriver);
  },

  /** Détail d'un trajet. @returns {Promise<object|null>} */
  async getTripById(id) {
    await delay(500);
    const trip = DRIVER_TRIPS_MOCK.find((item) => item.id === id) ?? null;
    return isOwnedByDriver(trip) ? trip : null;
  },

  /** Alias de `getTrips` (contrat du workflow). */
  async getDriverTrips() {
    return this.getTrips();
  },

  /** Alias de `getTripById` (contrat du workflow). */
  async getDriverTripById(id) {
    return this.getTripById(id);
  },

  /** Trajet actuellement actif (en cours ou en pause par le chauffeur). */
  async getActiveTrip() {
    await delay(300);
    return DRIVER_TRIPS_MOCK.find((trip) => isOwnedByDriver(trip) && isDriverTripActive(trip)) ?? null;
  },

  /** Prochain trajet planifié. */
  async getNextTrip() {
    await delay(300);
    return DRIVER_TRIPS_MOCK.find((trip) => isOwnedByDriver(trip) && trip.status === 'planned') ?? null;
  },

  /** Dernier trajet terminé. */
  async getLastCompletedTrip() {
    await delay(300);
    return DRIVER_TRIPS_MOCK.find((trip) => isOwnedByDriver(trip) && trip.status === 'completed') ?? null;
  },

  /** Pleins de carburant du véhicule assigné. */
  async getFuelRecords() {
    await delay(600);
    return DRIVER_FUEL_MOCK.filter(isOwnedByDriver);
  },

  /** Entretiens liés au véhicule assigné. */
  async getMaintenanceRecords() {
    await delay(600);
    return DRIVER_MAINTENANCE_MOCK.filter(isOwnedByDriver);
  },

  /** Incidents signalés par le chauffeur connecté. */
  async getIncidents() {
    await delay(600);
    return DRIVER_INCIDENTS_MOCK.filter(isOwnedByDriver);
  },

  /**
   * Démarre un trajet planifié (PLANIFIÉ → EN COURS).
   * @param {{ tripId: string, departureMileage: number }} payload
   */
  async startTrip({ tripId, departureMileage } = {}) {
    await delay(700);
    if (!canUse(PERMISSIONS.TRIPS_UPDATE)) return denied();

    const trip = findDriverTrip(tripId);
    if (!trip) return { success: false, error: 'Trajet introuvable.' };
    if (!isOwnedByDriver(trip)) return denied('Ce trajet ne vous est pas assigné.');

    if (trip.status !== 'planned') {
      return {
        success: false,
        error: `Impossible de démarrer un trajet au statut « ${getDriverTripStatus(trip.status).label} ».`,
      };
    }

    const active = DRIVER_TRIPS_MOCK.find((item) => isOwnedByDriver(item) && isDriverTripActive(item));
    if (active && active.id !== tripId) {
      return { success: false, error: 'Un trajet est déjà en cours. Terminez-le avant d\u2019en démarrer un autre.' };
    }

    const mileage = Number(departureMileage);
    if (!Number.isInteger(mileage) || mileage <= 0) {
      return { success: false, error: 'Le kilométrage de départ doit être un nombre entier supérieur à 0.' };
    }

    const lastKnown = getDriverLastKnownMileage();
    if (mileage < lastKnown) {
      return {
        success: false,
        error: `Le kilométrage de départ doit être ≥ ${formatNumber(lastKnown)} km (dernier kilométrage connu).`,
      };
    }

    const startedAt = new Date().toISOString();
    updateDriverTrip(tripId, { status: 'in_progress', departureMileage: mileage, actualDistance: 0, startedAt });
    DRIVER_VEHICLE_MOCK.mileage = mileage;
    pushDriverNotification({
      kind: 'trip_started',
      type: 'trip',
      title: `Trajet ${trip.tripNumber} démarré`,
      message: `Le trajet ${trip.departure} → ${trip.arrival} est en cours. Bonne route !`,
      createdAt: startedAt,
    });

    return { success: true, message: 'Trajet démarré avec succès.', trip: { ...findDriverTrip(tripId) } };
  },

  /**
   * Met en pause un trajet en cours (EN COURS → SUSPENDU).
   */
  async pauseTrip(tripId) {
    await delay(500);
    if (!canUse(PERMISSIONS.TRIPS_UPDATE)) return denied();

    const trip = findDriverTrip(tripId);
    if (!trip) return { success: false, error: 'Trajet introuvable.' };
    if (!isOwnedByDriver(trip)) return denied('Ce trajet ne vous est pas assigné.');
    if (trip.status !== 'in_progress') {
      return { success: false, error: 'Seul un trajet en cours peut être mis en pause.' };
    }

    const pausedAt = new Date().toISOString();
    updateDriverTrip(tripId, { status: 'suspended', pausedByDriver: true, pausedAt });
    pushDriverNotification({
      kind: 'trip_paused',
      type: 'trip',
      title: `Trajet ${trip.tripNumber} en pause`,
      message: `Le trajet ${trip.departure} → ${trip.arrival} est momentanément en pause.`,
      createdAt: pausedAt,
    });

    return { success: true, message: 'Trajet mis en pause.', trip: { ...findDriverTrip(tripId) } };
  },

  /**
   * Reprend un trajet mis en pause par le chauffeur (SUSPENDU → EN COURS).
   */
  async resumeTrip(tripId) {
    await delay(500);
    if (!canUse(PERMISSIONS.TRIPS_UPDATE)) return denied();

    const trip = findDriverTrip(tripId);
    if (!trip) return { success: false, error: 'Trajet introuvable.' };
    if (!isOwnedByDriver(trip)) return denied('Ce trajet ne vous est pas assigné.');
    if (trip.status !== 'suspended') {
      return { success: false, error: 'Seul un trajet en pause peut être repris.' };
    }

    const resumedAt = new Date().toISOString();
    updateDriverTrip(tripId, { status: 'in_progress', pausedByDriver: false, resumedAt });
    pushDriverNotification({
      kind: 'trip_resumed',
      type: 'trip',
      title: `Trajet ${trip.tripNumber} repris`,
      message: `Le trajet ${trip.departure} → ${trip.arrival} a repris sa route.`,
      createdAt: resumedAt,
    });

    return { success: true, message: 'Trajet repris avec succès.', trip: { ...findDriverTrip(tripId) } };
  },

  /**
   * Termine un trajet en cours (EN COURS/SUSPENDU → TERMINÉ) et calcule le bilan.
   * @param {{ tripId: string, arrivalMileage: number }} payload
   */
  async completeTrip({ tripId, arrivalMileage } = {}) {
    await delay(700);
    if (!canUse(PERMISSIONS.TRIPS_UPDATE)) return denied();

    const trip = findDriverTrip(tripId);
    if (!trip) return { success: false, error: 'Trajet introuvable.' };
    if (!isOwnedByDriver(trip)) return denied('Ce trajet ne vous est pas assigné.');
    if (trip.status !== 'in_progress' && trip.status !== 'suspended') {
      return {
        success: false,
        error: `Impossible de terminer un trajet au statut « ${getDriverTripStatus(trip.status).label} ».`,
      };
    }

    const mileage = Number(arrivalMileage);
    const departureMileage = Number(trip.departureMileage) || 0;
    if (!Number.isInteger(mileage) || mileage <= 0) {
      return { success: false, error: 'Le kilométrage d\u2019arrivée doit être un nombre entier supérieur à 0.' };
    }
    if (departureMileage > 0 && mileage < departureMileage) {
      return {
        success: false,
        error: `Le kilométrage d\u2019arrivée doit être ≥ ${formatNumber(departureMileage)} km (kilométrage de départ).`,
      };
    }

    const now = new Date();
    const actualDistance = departureMileage > 0 ? mileage - departureMileage : Number(trip.plannedDistance) || 0;
    const startedMs = trip.startedAt ? new Date(trip.startedAt).getTime() : null;
    const actualDuration = startedMs ? Math.max(1, Math.round((now.getTime() - startedMs) / 60000)) : (trip.actualDuration || 0);
    const averageSpeed = actualDuration > 0 ? Math.round(actualDistance / (actualDuration / 60)) : 0;

    updateDriverTrip(tripId, {
      status: 'completed',
      arrivalMileage: mileage,
      actualDistance,
      actualDuration,
      averageSpeed,
      arrivalDate: toISODate(now),
      arrivalTime: formatTime(now),
      completedAt: now.toISOString(),
      pausedByDriver: false,
    });
    DRIVER_VEHICLE_MOCK.mileage = mileage;

    pushDriverNotification({
      kind: 'trip_completed',
      type: 'trip',
      title: `Trajet ${trip.tripNumber} terminé`,
      message: `Votre trajet ${trip.departure} → ${trip.arrival} est clôturé (${formatNumber(actualDistance)} km parcourus).`,
      createdAt: now.toISOString(),
    });

    return {
      success: true,
      message: 'Trajet terminé avec succès.',
      trip: { ...findDriverTrip(tripId) },
      summary: {
        tripNumber: trip.tripNumber,
        departure: trip.departure,
        arrival: trip.arrival,
        departureMileage,
        arrivalMileage: mileage,
        actualDistance,
        actualDuration,
        averageSpeed,
      },
    };
  },

  /**
   * Signale un incident (rapide, lié à un trajet en cours si fourni).
   * @param {{ tripId?: string, type: string, severity: string, date?: string, time?: string, location: string, description: string }} payload
   */
  async reportIncident(payload = {}) {
    await delay(800);
    if (!canUse(PERMISSIONS.INCIDENTS_CREATE)) return denied();

    const { tripId, type, severity, date, time, location, description } = payload;
    const trip = tripId ? findDriverTrip(tripId) : null;
    if (tripId && !trip) return { success: false, error: 'Trajet introuvable.' };
    if (trip && !isOwnedByDriver(trip)) return denied('Ce trajet ne vous est pas assigné.');

    if (!type || !severity || !date || !location?.trim() || !description?.trim()) {
      return { success: false, error: 'Tous les champs de l\u2019incident sont requis.' };
    }

    const newIncident = {
      id: `INC-${String(Date.now()).slice(-6)}`,
      incidentNumber: `INC-2026-${String(DRIVER_INCIDENTS_MOCK.length + 1).padStart(3, '0')}`,
      driverId: DRIVER_PROFILE_MOCK.id,
      vehicleId: DRIVER_VEHICLE_MOCK.id,
      tripId: tripId || null,
      type,
      severity,
      status: 'reported',
      date,
      time,
      location: location.trim(),
      description: description.trim(),
      reportedBy: DRIVER_PROFILE_MOCK.displayName,
      createdAt: new Date().toISOString(),
    };
    DRIVER_INCIDENTS_MOCK.unshift(newIncident);

    if (trip) {
      pushDriverNotification({
        kind: 'incident_reported',
        type: 'incident',
        title: `Incident signalé — ${trip.tripNumber}`,
        message: `Un incident « ${getIncidentType(type).label} » a été signalé sur le trajet ${trip.tripNumber}.`,
        createdAt: newIncident.createdAt,
      });
    }

    return { success: true, message: 'Incident enregistré avec succès.', incident: newIncident };
  },

  /** Alias de `reportIncident` (conservé pour la page Incidents). */
  async createIncident(data) {
    return this.reportIncident(data);
  },

  /** Documents du chauffeur et de son véhicule (statut dérivé de l\u2019échéance). */
  async getDocuments() {
    await delay(600);
    return DRIVER_DOCUMENTS_MOCK.filter(isOwnedByDriver).map((document) => ({
      ...document,
      status: computeDriverDocumentStatus(document),
    }));
  },

  /** Notifications du chauffeur connecté. */
  async getNotifications() {
    await delay(500);
    return DRIVER_NOTIFICATIONS_MOCK.filter(isOwnedByDriver);
  },

  /** Marque une notification comme lue (mock). */
  async markNotificationAsRead(id) {
    await delay(300);
    const notification = updateDriverNotification(id, { status: 'read' });
    return notification ? { success: true, id } : { success: false, error: 'Notification introuvable.' };
  },

  /** Archive une notification (mock). */
  async archiveNotification(id) {
    await delay(300);
    const notification = updateDriverNotification(id, { status: 'archived' });
    return notification ? { success: true, id } : { success: false, error: 'Notification introuvable.' };
  },
};
