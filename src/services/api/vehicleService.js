/**
 * Navix VehicleService
 * --------------------------------------------------------------------------
 * Description : consultation des véhicules de la flotte.
 * Responsabilité : fournir les données véhicules (liste, filtres, pagination)
 *                  aux vues. Mode mock : données simulées, aucune requête HTTP.
 *
 * Exemple d'utilisation :
 *   import { vehicleService } from '@/services/api';
 *   const vehicles = await vehicleService.getVehicles({ status: 'available' });
 */
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '../client';
import { apiConfig } from '../config';
import { mockResponse } from '../utils';

const MOCK_VEHICLES = [
  { id: 'veh_001', registration: 'AB-123-CD', brand: 'Toyota', model: 'Hilux', year: 2022, status: 'available' },
  { id: 'veh_002', registration: 'EF-456-GH', brand: 'Mercedes-Benz', model: 'Sprinter', year: 2021, status: 'in_use' },
  { id: 'veh_003', registration: 'IJ-789-KL', brand: 'Renault', model: 'Master', year: 2023, status: 'maintenance' },
  { id: 'veh_004', registration: 'MN-012-OP', brand: 'Isuzu', model: 'D-Max', year: 2020, status: 'available' },
];

export const vehicleService = {
  /**
   * Liste des véhicules.
   * @param {{ page?: number, limit?: number, status?: string, companyId?: string }} [params]
   * @returns {Promise<Array<object>>}
   */
  async getVehicles(params = {}) {
    if (apiConfig.mock) {
      return mockResponse(MOCK_VEHICLES);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.VEHICLES.LIST, { params });
    return data;
  },

  /**
   * Détail d'un véhicule.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getVehicle(id) {
    if (apiConfig.mock) {
      return mockResponse(MOCK_VEHICLES.find((vehicle) => vehicle.id === id) ?? null);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.VEHICLES.DETAIL(id));
    return data;
  },
};
