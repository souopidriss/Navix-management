/**
 * Navix Partner Portal — Service Flotte Partenaire (PROMPT 063)
 * --------------------------------------------------------------------------
 * CRUD véhicules strictement isolé multi-tenant : le Partenaire ne voit que
 * les véhicules liés à `companyId` = `PARTNER_COMPANY_ID` (cmp_partner_navix)
 * et à son `partnerId` (ptr_partner_tec). Chaque véhicule porte
 * `partnerId` + `companyId` ; aucun `partnerId` arbitraire ne transite
 * depuis l'UI (le service l'applique toujours côté serveur simulé).
 *
 * Transitions de statut autorisées (règle métier — graphe) :
 *   available      → in_use, maintenance
 *   in_use         → available, maintenance
 *   maintenance    → available, out_of_service
 *   out_of_service → available
 *
 * Immatriculation normalisée (`normalizeRegistrationNumber`) + unicité
 * simulée (409 si doublon). Les mutations vivent dans un cache local (copie
 * du mock) : `getVehicles` des autres services passe par ce cache pour
 * garantir une source unique de vérité après CRUD. Monnaie : FCFA (XAF).
 */
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { normalizeRegistrationNumber } from '@/features/vehicles/constants';
import { MOCK_PARTNER_VEHICLES } from '../mocks/partner.mock';
import {
  PARTNER_COMPANY_ID,
  PARTNER_PARTNER_ID,
  getNextPartnerVehicleStatuses,
  PARTNER_VEHICLE_PAGE_SIZE_OPTIONS,
  DEFAULT_PARTNER_VEHICLE_PAGE_SIZE,
} from '../constants/partner.constants';

let fleetCache = null;

const getFleetCache = () => {
  if (!fleetCache) {
    fleetCache = MOCK_PARTNER_VEHICLES.map((vehicle) => ({ ...vehicle }));
  }
  return fleetCache;
};

/** Getter public du cache flotte (lecture pour agrégations, copie défensive). */
export const getPartnerVehiclesCache = () => getFleetCache().map((vehicle) => ({ ...vehicle }));

const isInScope = (vehicle) =>
  vehicle.companyId === PARTNER_COMPANY_ID && vehicle.partnerId === PARTNER_PARTNER_ID;

const isDuplicateRegistration = (registrationNumber, excludedId) => {
  const normalized = normalizeRegistrationNumber(registrationNumber);
  return getFleetCache().some(
    (vehicle) =>
      normalizeRegistrationNumber(vehicle.registrationNumber) === normalized &&
      vehicle.id !== excludedId,
  );
};

const toPublicVehicle = (vehicle) => ({ ...vehicle });

export const partnerVehicleService = {
  /**
   * Liste de la flotte partenaire (isolée multi-tenant), triée par date de
   * mise à jour décroissante.
   * @returns {Promise<Array<object>>}
   */
  async getVehicles() {
    const vehicles = getFleetCache()
      .filter(isInScope)
      .map(toPublicVehicle)
      .sort((a, b) => String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? '')));
    return mockResponse(vehicles, { latency: 350 });
  },

  /**
   * Détail d'un véhicule (404 hors portée / introuvable).
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getVehicleById(id) {
    const vehicle = getFleetCache().find((item) => item.id === id && isInScope(item));
    if (!vehicle) {
      return mockResponse(null, { error: ApiError.notFound('Véhicule introuvable.') });
    }
    return mockResponse(toPublicVehicle(vehicle), { latency: 300 });
  },

  /**
   * Création d'un véhicule (immatriculation unique, 409 si doublon).
   * Le `companyId` / `partnerId` du partenaire sont toujours appliqués
   * côté service — jamais depuis l'UI.
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async createVehicle(payload) {
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
      companyId: PARTNER_COMPANY_ID,
      partnerId: PARTNER_PARTNER_ID,
      id: `VEH-P-${String(Date.now()).slice(-5)}`,
      createdAt: now,
      updatedAt: now,
    };
    getFleetCache().unshift(vehicle);
    return mockResponse(toPublicVehicle(vehicle), { latency: 400 });
  },

  /**
   * Mise à jour d'un véhicule (404 introuvable / 409 immatriculation doublon).
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async updateVehicle(id, payload) {
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
      companyId: PARTNER_COMPANY_ID,
      partnerId: PARTNER_PARTNER_ID,
      updatedAt: new Date().toISOString(),
    };
    getFleetCache()[index] = updated;
    return mockResponse(toPublicVehicle(updated), { latency: 400 });
  },

  /**
   * Changement de statut (transitions métier validées, 409 sinon).
   * @param {string} id
   * @param {string} nextStatus
   * @returns {Promise<object>}
   */
  async updateVehicleStatus(id, nextStatus) {
    const index = getFleetCache().findIndex((item) => item.id === id && isInScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Véhicule introuvable.') });
    }

    const current = getFleetCache()[index];
    if (!getNextPartnerVehicleStatuses(current.status).includes(nextStatus)) {
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
    return mockResponse(toPublicVehicle(updated), { latency: 350 });
  },

  /**
   * Affectation d'un chauffeur au véhicule (action « Affecter »).
   * @param {string} id
   * @param {string} driver — nom du chauffeur affecté
   * @returns {Promise<object>}
   */
  async assignVehicle(id, driver) {
    const index = getFleetCache().findIndex((item) => item.id === id && isInScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Véhicule introuvable.') });
    }
    const name = String(driver ?? '').trim();
    const updated = { ...getFleetCache()[index], currentDriver: name, updatedAt: new Date().toISOString() };
    getFleetCache()[index] = updated;
    return mockResponse(toPublicVehicle(updated), { latency: 350 });
  },

  /**
   * Suppression (retrait du cache). 404 si introuvable.
   * @param {string} id
   * @returns {Promise<{ id: string }>}
   */
  async deleteVehicle(id) {
    const exists = getFleetCache().some((item) => item.id === id && isInScope(item));
    if (!exists) {
      return mockResponse(null, { error: ApiError.notFound('Véhicule introuvable.') });
    }
    fleetCache = getFleetCache().filter((item) => item.id !== id);
    return mockResponse({ id }, { latency: 350 });
  },
};
