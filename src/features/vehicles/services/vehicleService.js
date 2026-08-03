/**
 * Navix Vehicles — VehicleService
 * --------------------------------------------------------------------------
 * Description : gestion complète de la flotte (véhicules), mock uniquement.
 * Responsabilité : fournir les données véhicules aux vues et aux stores.
 *                  Mode mock : données simulées en mémoire, aucune requête HTTP.
 *
 * Méthodes :
 *   getAll()                 → liste de tous les véhicules
 *   getById(id)              → détail d'un véhicule (404 si absent)
 *   create(payload)          → création (immatriculation unique, 409 si doublon)
 *   update(id, payload)      → mise à jour (immatriculation unique, 404/409)
 *   remove(id)               → suppression (404 si absent)
 *
 * Exemple d'utilisation :
 *   import { vehicleService } from '../services';
 *   const vehicles = await vehicleService.getAll();
 */
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '@/services/client';
import { apiConfig } from '@/services/config';
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { MOCK_VEHICLES } from '../mocks';

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

let vehiclesCache = null;

const getVehiclesCache = () => {
  if (!vehiclesCache) {
    vehiclesCache = MOCK_VEHICLES.map((vehicle) => ({ ...vehicle }));
  }
  return vehiclesCache;
};

const isDuplicateRegistration = (registrationNumber, excludedId) =>
  getVehiclesCache().some(
    (vehicle) =>
      vehicle.registrationNumber.trim().toLowerCase() === registrationNumber.trim().toLowerCase() &&
      vehicle.id !== excludedId,
  );

export const vehicleService = {
  /**
   * Liste de tous les véhicules (copie — les mutations ultérieures du
   * cache n'affectent pas les consommateurs).
   * @returns {Promise<Array<object>>}
   */
  async getAll() {
    if (apiConfig.mock) {
      return mockResponse([...getVehiclesCache()]);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.VEHICLES.LIST);
    return data;
  },

  /**
   * Détail d'un véhicule.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getById(id) {
    if (apiConfig.mock) {
      const vehicle = getVehiclesCache().find((item) => item.id === id);
      if (!vehicle) {
        return mockResponse(null, { error: ApiError.notFound('Véhicule introuvable.') });
      }
      return mockResponse(vehicle);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.VEHICLES.DETAIL(id));
    return data;
  },

  /**
   * Création d'un véhicule (l'immatriculation doit être unique).
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async create(payload) {
    if (apiConfig.mock) {
      if (isDuplicateRegistration(payload.registrationNumber)) {
        return mockResponse(null, {
          error: new ApiError({
            status: 409,
            code: 'VEHICLE_REGISTRATION_EXISTS',
            message: 'Cette immatriculation est déjà enregistrée.',
          }),
        });
      }

      const now = new Date().toISOString();
      const vehicle = {
        ...payload,
        id: generateUlid(),
        qrCode: payload.qrCode || `QRV-${payload.registrationNumber.replace(/[^A-Za-z0-9]/g, '').toUpperCase()}`,
        createdAt: now,
        updatedAt: now,
      };
      getVehiclesCache().unshift(vehicle);
      return mockResponse(vehicle);
    }

    const { data } = await apiClient.post(API_ENDPOINTS.VEHICLES.LIST, payload);
    return data;
  },

  /**
   * Mise à jour d'un véhicule.
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async update(id, payload) {
    if (apiConfig.mock) {
      const index = getVehiclesCache().findIndex((item) => item.id === id);
      if (index === -1) {
        return mockResponse(null, { error: ApiError.notFound('Véhicule introuvable.') });
      }
      if (isDuplicateRegistration(payload.registrationNumber, id)) {
        return mockResponse(null, {
          error: new ApiError({
            status: 409,
            code: 'VEHICLE_REGISTRATION_EXISTS',
            message: 'Cette immatriculation est déjà enregistrée.',
          }),
        });
      }

      const updated = {
        ...getVehiclesCache()[index],
        ...payload,
        id,
        qrCode: payload.qrCode || getVehiclesCache()[index].qrCode,
        updatedAt: new Date().toISOString(),
      };
      getVehiclesCache()[index] = updated;
      return mockResponse(updated);
    }

    const { data } = await apiClient.put(API_ENDPOINTS.VEHICLES.DETAIL(id), payload);
    return data;
  },

  /**
   * Suppression d'un véhicule.
   * @param {string} id
   * @returns {Promise<{ id: string }>}
   */
  async remove(id) {
    if (apiConfig.mock) {
      const exists = getVehiclesCache().some((item) => item.id === id);
      if (!exists) {
        return mockResponse(null, { error: ApiError.notFound('Véhicule introuvable.') });
      }
      vehiclesCache = getVehiclesCache().filter((item) => item.id !== id);
      return mockResponse({ id });
    }

    const { data } = await apiClient.delete(API_ENDPOINTS.VEHICLES.DETAIL(id));
    return data;
  },
};
