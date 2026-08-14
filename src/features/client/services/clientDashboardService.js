/**
 * Navix Client — Service Dashboard Premium
 * --------------------------------------------------------------------------
 * Fournit les données du Dashboard Client (Entreprise / Particulier).
 * Architecture DATA / LOGIC / UI strictement séparée.
 * Remplaçable par une vraie API sans toucher aux composants UI.
 */
import { mockResponse } from '@/services/utils';
import {
  MOCK_CLIENT_ENTERPRISE,
  MOCK_CLIENT_INDIVIDUAL,
} from '../mocks/client.mock';
import {
  MOCK_CLIENT_DASHBOARD_METRICS_ENTERPRISE,
  MOCK_CLIENT_DASHBOARD_METRICS_INDIVIDUAL,
  MOCK_CLIENT_MONTHLY_EVOLUTION,
  MOCK_CLIENT_FINANCIAL_DATA,
  MOCK_CLIENT_TOP_VEHICLES,
  MOCK_CLIENT_ALERTS,
  MOCK_CLIENT_ACTIVITIES,
  MOCK_CLIENT_FUEL_DATA,
  CLIENT_QUICK_ACTIONS,
  CLIENT_QUICK_ACTIONS_INDIVIDUAL,
} from '../mocks/clientDashboard.mock';
import { CLIENT_TYPES } from '../constants/client.constants';

export const clientDashboardService = {
  /**
   * Récupère toutes les données nécessaires au Dashboard Client.
   * @param {string} clientType - 'enterprise' | 'individual'
   * @returns {Promise<Object>}
   */
  async getDashboardData(clientType = CLIENT_TYPES.ENTERPRISE) {
    const isEnterprise = clientType === CLIENT_TYPES.ENTERPRISE;

    const client = isEnterprise ? MOCK_CLIENT_ENTERPRISE : MOCK_CLIENT_INDIVIDUAL;
    const metrics = isEnterprise
      ? MOCK_CLIENT_DASHBOARD_METRICS_ENTERPRISE
      : MOCK_CLIENT_DASHBOARD_METRICS_INDIVIDUAL;
    const quickActions = isEnterprise ? CLIENT_QUICK_ACTIONS : CLIENT_QUICK_ACTIONS_INDIVIDUAL;

    return mockResponse(
      {
        client,
        clientType,
        metrics,
        monthlyEvolution: MOCK_CLIENT_MONTHLY_EVOLUTION,
        financialData: MOCK_CLIENT_FINANCIAL_DATA,
        vehicles: isEnterprise ? MOCK_CLIENT_TOP_VEHICLES : [],
        alerts: isEnterprise ? MOCK_CLIENT_ALERTS : { critical: 0, warning: 0, info: 0, items: [] },
        recentActivities: MOCK_CLIENT_ACTIVITIES,
        fuelData: isEnterprise ? MOCK_CLIENT_FUEL_DATA : null,
        quickActions,
      },
      { latency: 400 },
    );
  },
};
