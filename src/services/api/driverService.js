/**
 * Navix DriverService
 * --------------------------------------------------------------------------
 * Description : consultation des chauffeurs.
 * Responsabilité : fournir les données chauffeurs (liste, filtres, pagination)
 *                  aux vues. Mode mock : données simulées, aucune requête HTTP.
 *
 * Exemple d'utilisation :
 *   import { driverService } from '@/services/api';
 *   const drivers = await driverService.getDrivers({ status: 'active' });
 */
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '../client';
import { apiConfig } from '../config';
import { mockResponse } from '../utils';

const MOCK_DRIVERS = [
  { id: 'drv_001', name: 'Jean Kouassi', email: 'jean.kouassi@navix.app', phone: '+237 07 00 00 00 01', license: 'B', status: 'active' },
  { id: 'drv_002', name: 'Moussa Diabaté', email: 'moussa.diabate@navix.app', phone: '+237 07 00 00 00 02', license: 'C', status: 'active' },
  { id: 'drv_003', name: 'Fatou Traoré', email: 'fatou.traore@navix.app', phone: '+237 07 00 00 00 03', license: 'B', status: 'inactive' },
  { id: 'drv_004', name: 'Aïcha Diallo', email: 'aicha.diallo@navix.app', phone: '+237 07 00 00 00 04', license: 'C', status: 'active' },
];

export const driverService = {
  /**
   * Liste des chauffeurs.
   * @param {{ page?: number, limit?: number, status?: string, companyId?: string }} [params]
   * @returns {Promise<Array<object>>}
   */
  async getDrivers(params = {}) {
    if (apiConfig.mock) {
      return mockResponse(MOCK_DRIVERS);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.DRIVERS.LIST, { params });
    return data;
  },

  /**
   * Détail d'un chauffeur.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getDriver(id) {
    if (apiConfig.mock) {
      return mockResponse(MOCK_DRIVERS.find((driver) => driver.id === id) ?? null);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.DRIVERS.DETAIL(id));
    return data;
  },
};
