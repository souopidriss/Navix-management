/**
 * Navix MaintenanceService
 * --------------------------------------------------------------------------
 * Description : suivi des entretiens et de la maintenance de la flotte.
 * Responsabilité : fournir les enregistrements d'entretien aux vues.
 *                  Mode mock : données simulées, aucune requête HTTP.
 *
 * Exemple d'utilisation :
 *   import { maintenanceService } from '@/services/api';
 *   const records = await maintenanceService.getMaintenanceRecords();
 */
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '../client';
import { apiConfig } from '../config';
import { mockResponse } from '../utils';

const MOCK_MAINTENANCE_RECORDS = [
  { id: 'mnt_001', vehicleId: 'veh_003', type: 'vidange', date: '2026-07-20', cost: 35000, status: 'completed', garage: 'Garage Central' },
  { id: 'mnt_002', vehicleId: 'veh_001', type: 'freinage', date: '2026-07-22', cost: 52000, status: 'in_progress', garage: 'Auto Mécano' },
  { id: 'mnt_003', vehicleId: 'veh_002', type: 'pneumatiques', date: '2026-07-25', cost: 120000, status: 'scheduled', garage: 'Pneus Plus' },
];

export const maintenanceService = {
  /**
   * Enregistrements d'entretien.
   * @param {{ page?: number, limit?: number, status?: string, vehicleId?: string }} [params]
   * @returns {Promise<Array<object>>}
   */
  async getMaintenanceRecords(params = {}) {
    if (apiConfig.mock) {
      return mockResponse(MOCK_MAINTENANCE_RECORDS);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.MAINTENANCE.LIST, { params });
    return data;
  },

  /**
   * Détail d'un enregistrement d'entretien.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getMaintenanceRecord(id) {
    if (apiConfig.mock) {
      return mockResponse(MOCK_MAINTENANCE_RECORDS.find((record) => record.id === id) ?? null);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.MAINTENANCE.DETAIL(id));
    return data;
  },
};
