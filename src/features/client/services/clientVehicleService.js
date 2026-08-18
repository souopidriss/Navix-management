/**
 * Navix Client — Service Flotte Client (Gestion des Véhicules)
 * --------------------------------------------------------------------------
 * PROMPT 056 — Gestion de la Flotte Client (Phase 3 Espace Client).
 * CRUD véhicules strictement isolé multi-tenant : le Client Entreprise ne voit
 * que les véhicules liés à `companyId` = Transports Express Cameroun
 * (`MOCK_CLIENT_FLEET`). Client Particulier : aucune flotte.
 *
 * Transitions de statut autorisées (règle métier — graphe) :
 *   available      → in_use, maintenance
 *   in_use         → available
 *   maintenance    → available, out_of_service
 *   out_of_service → available
 *
 * Immatriculation normalisée (`normalizeRegistrationNumber`) + unicité simulée.
 * Aucune dépendance au module Admin Véhicules : données et logique propres à
 * l'Espace Client (ne duplique pas `vehicleService`, pas de commit partagé).
 */
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { normalizeRegistrationNumber } from '@/features/vehicles/constants';
import { MOCK_CLIENT_ENTERPRISE } from '../mocks/client.mock';
import { MOCK_CLIENT_FLEET } from '../mocks/clientDashboard.mock';
import { CLIENT_TYPES } from '../constants/client.constants';

/** Entreprise propriétaire de la flotte Client (contrat de démo multi-tenant). */
export const CLIENT_FLEET_COMPANY_ID = MOCK_CLIENT_ENTERPRISE.companyId;

/** Graphe des transitions de statut métier (source unique pour l'UI). */
export const VEHICLE_STATUS_TRANSITIONS = {
  available: ['in_use', 'maintenance'],
  in_use: ['available'],
  maintenance: ['available', 'out_of_service'],
  out_of_service: ['available'],
};

/** Statuts atteignables depuis un statut donné (vide si aucun). */
export const getNextVehicleStatuses = (status) => VEHICLE_STATUS_TRANSITIONS[status] ?? [];

/** Nombre maximal de caractères pour le VIN (normalisation). */
const VIN_LENGTH = 17;

let fleetCache = null;

const getFleetCache = () => {
  if (!fleetCache) {
    fleetCache = MOCK_CLIENT_FLEET.map((vehicle) => ({ ...vehicle }));
  }
  return fleetCache;
};

/** Getter public du cache flotte (lecture pour agrégats Dashboard Client). */
export const getVehiclesCache = () => getFleetCache().map((vehicle) => ({ ...vehicle }));

const isInScope = (vehicle) => vehicle.companyId === CLIENT_FLEET_COMPANY_ID;

const isDuplicateRegistration = (registrationNumber, excludedId) => {
  const normalized = normalizeRegistrationNumber(registrationNumber);
  return getFleetCache().some(
    (vehicle) =>
      normalizeRegistrationNumber(vehicle.registrationNumber) === normalized &&
      vehicle.id !== excludedId,
  );
};

const toQrCode = (registrationNumber) =>
  `QRV-${normalizeRegistrationNumber(registrationNumber).replace(/[^A-Z0-9]/g, '')}`;

export const clientVehicleService = {
  /**
   * Liste des véhicules du Client (isolés par entreprise).
   * @param {string} [clientType] — 'enterprise' | 'individual'
   * @returns {Promise<Array<object>>}
   */
  async getAll(clientType = CLIENT_TYPES.ENTERPRISE) {
    if (clientType === CLIENT_TYPES.INDIVIDUAL) {
      return mockResponse([], { latency: 300 });
    }
    return mockResponse(
      getFleetCache().filter(isInScope).map((vehicle) => ({ ...vehicle })),
      { latency: 400 },
    );
  },

  /**
   * Détail d'un véhicule du Client (404 hors portée / introuvable).
   * @param {string} id
   * @param {string} [clientType]
   * @returns {Promise<object>}
   */
  async getById(id, clientType = CLIENT_TYPES.ENTERPRISE) {
    if (clientType === CLIENT_TYPES.INDIVIDUAL) {
      return mockResponse(null, { error: ApiError.notFound('Véhicule introuvable.') });
    }
    const vehicle = getFleetCache().find((item) => item.id === id && isInScope(item));
    if (!vehicle) {
      return mockResponse(null, { error: ApiError.notFound('Véhicule introuvable.') });
    }
    return mockResponse({ ...vehicle }, { latency: 350 });
  },

  /**
   * Création d'un véhicule (immatriculation unique, 409 si doublon).
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async create(payload) {
    const registrationNumber = normalizeRegistrationNumber(payload.registrationNumber);

    if (isDuplicateRegistration(registrationNumber)) {
      return mockResponse(null, {
        error: new ApiError({
          status: 409,
          code: 'VEHICLE_REGISTRATION_EXISTS',
          message: 'Cette immatriculation est déjà enregistrée dans votre flotte.',
        }),
      });
    }

    const now = new Date().toISOString();
    const vehicle = {
      ...payload,
      registrationNumber,
      companyId: CLIENT_FLEET_COMPANY_ID,
      id: `V-CLT-${String(Date.now()).slice(-6)}`,
      qrCode: toQrCode(registrationNumber),
      createdAt: now,
      updatedAt: now,
    };
    getFleetCache().unshift(vehicle);
    return mockResponse({ ...vehicle }, { latency: 400 });
  },

  /**
   * Mise à jour d'un véhicule (404 introuvable / 409 immatriculation en doublon).
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async update(id, payload) {
    const index = getFleetCache().findIndex((item) => item.id === id && isInScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Véhicule introuvable.') });
    }

    const registrationNumber = normalizeRegistrationNumber(payload.registrationNumber);
    if (isDuplicateRegistration(registrationNumber, id)) {
      return mockResponse(null, {
        error: new ApiError({
          status: 409,
          code: 'VEHICLE_REGISTRATION_EXISTS',
          message: 'Cette immatriculation est déjà enregistrée dans votre flotte.',
        }),
      });
    }

    const updated = {
      ...getFleetCache()[index],
      ...payload,
      registrationNumber,
      id,
      qrCode: toQrCode(registrationNumber),
      updatedAt: new Date().toISOString(),
    };
    getFleetCache()[index] = updated;
    return mockResponse({ ...updated }, { latency: 400 });
  },

  /**
   * Changement de statut (transitions métier validées, 409 sinon).
   * @param {string} id
   * @param {string} nextStatus
   * @returns {Promise<object>}
   */
  async updateStatus(id, nextStatus) {
    const index = getFleetCache().findIndex((item) => item.id === id && isInScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Véhicule introuvable.') });
    }

    const current = getFleetCache()[index];
    if (!getNextVehicleStatuses(current.status).includes(nextStatus)) {
      return mockResponse(null, {
        error: new ApiError({
          status: 409,
          code: 'VEHICLE_STATUS_TRANSITION',
          message: 'Transition de statut non autorisée pour ce véhicule.',
        }),
      });
    }

    const updated = { ...current, status: nextStatus, updatedAt: new Date().toISOString() };
    getFleetCache()[index] = updated;
    return mockResponse({ ...updated }, { latency: 350 });
  },

  /**
   * Suppression (logique dans le mock : retrait du cache). 404 si absent.
   * @param {string} id
   * @returns {Promise<{ id: string }>}
   */
  async remove(id) {
    const exists = getFleetCache().some((item) => item.id === id && isInScope(item));
    if (!exists) {
      return mockResponse(null, { error: ApiError.notFound('Véhicule introuvable.') });
    }
    fleetCache = getFleetCache().filter((item) => item.id !== id);
    return mockResponse({ id }, { latency: 350 });
  },
};

/**
 * Mise à jour du statut opérationnel d'un véhicule (cascade depuis les
 * Opérations Client : départ / fin de trajet, clôture d'affectation).
 * Applique les transitions disponibles → in_use et in_use → available sans
 * passer par le graphe public (usage interne uniquement).
 * @param {string} id
 * @param {string} nextStatus
 * @returns {boolean} — true si le véhicule a été mis à jour
 */
export const setVehicleOperationalStatus = (id, nextStatus) => {
  const index = getFleetCache().findIndex((item) => item.id === id && isInScope(item));
  if (index === -1) return false;

  const current = getFleetCache()[index];
  if (current.status === nextStatus) return true;

  // Un véhicule en maintenance / hors service ne redevient pas « disponible »
  // via la cascade opérationnelle (statut géré par le module Maintenance).
  if (nextStatus === 'available' && !['in_use', 'available'].includes(current.status)) {
    return false;
  }

  getFleetCache()[index] = { ...current, status: nextStatus, updatedAt: new Date().toISOString() };
  return true;
};

export { VIN_LENGTH };
