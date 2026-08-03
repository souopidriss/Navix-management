/**
 * Navix FuelService
 * --------------------------------------------------------------------------
 * Description : suivi du carburant (relevés et statistiques).
 * Responsabilité : fournir les relevés de carburant et les indicateurs agrégés
 *                  aux vues. Mode mock : données simulées, aucune requête HTTP.
 *
 * Exemple d'utilisation :
 *   import { fuelService } from '@/services/api';
 *   const stats = await fuelService.getFuelStats();
 */
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '../client';
import { apiConfig } from '../config';
import { mockResponse } from '../utils';

const MOCK_FUEL_LOGS = [
  { id: 'fue_001', vehicleId: 'veh_001', driverId: 'drv_001', date: '2026-07-28', liters: 45, cost: 22500 },
  { id: 'fue_002', vehicleId: 'veh_002', driverId: 'drv_002', date: '2026-07-27', liters: 60, cost: 30000 },
  { id: 'fue_003', vehicleId: 'veh_004', driverId: 'drv_004', date: '2026-07-26', liters: 38, cost: 19000 },
];

const MOCK_FUEL_STATS = {
  totalLiters: 143,
  totalCost: 71500,
  averageCostPerLiter: 500,
  period: '2026-07',
};

export const fuelService = {
  /**
   * Relevés de carburant.
   * @param {{ page?: number, limit?: number, vehicleId?: string }} [params]
   * @returns {Promise<Array<object>>}
   */
  async getFuelLogs(params = {}) {
    if (apiConfig.mock) {
      return mockResponse(MOCK_FUEL_LOGS);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.FUEL.LIST, { params });
    return data;
  },

  /**
   * Statistiques agrégées de carburant.
   * @param {{ period?: string }} [params]
   * @returns {Promise<object>}
   */
  async getFuelStats(params = {}) {
    if (apiConfig.mock) {
      return mockResponse(MOCK_FUEL_STATS);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.FUEL.STATS, { params });
    return data;
  },
};
