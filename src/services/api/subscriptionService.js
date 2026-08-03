/**
 * Navix SubscriptionService
 * --------------------------------------------------------------------------
 * Description : gestion des abonnements et des plans tarifaires.
 * Responsabilité : fournir le plan courant et la liste des offres aux vues.
 *                  Mode mock : données simulées, aucune requête HTTP.
 *
 * Exemple d'utilisation :
 *   import { subscriptionService } from '@/services/api';
 *   const plan = await subscriptionService.getCurrentPlan();
 */
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '../client';
import { apiConfig } from '../config';
import { mockResponse } from '../utils';

const MOCK_PLANS = [
  { id: 'pln_starter', name: 'Starter', price: 0, period: 'month', features: ['1 véhicule', 'Suivi de base'] },
  { id: 'pln_growth', name: 'Growth', price: 15000, period: 'month', features: ['10 véhicules', 'Rapports avancés'] },
  { id: 'pln_enterprise', name: 'Enterprise', price: 45000, period: 'month', features: ['Flotte illimitée', 'Support dédié'] },
];

const MOCK_CURRENT_PLAN = {
  id: 'pln_growth',
  name: 'Growth',
  price: 15000,
  period: 'month',
  status: 'active',
  renewalDate: '2026-08-21',
};

export const subscriptionService = {
  /**
   * Plans tarifaires disponibles.
   * @returns {Promise<Array<object>>}
   */
  async getPlans() {
    if (apiConfig.mock) {
      return mockResponse(MOCK_PLANS);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.SUBSCRIPTIONS.LIST);
    return data;
  },

  /**
   * Plan souscrit par l'entreprise courante.
   * @returns {Promise<object>}
   */
  async getCurrentPlan() {
    if (apiConfig.mock) {
      return mockResponse(MOCK_CURRENT_PLAN);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.SUBSCRIPTIONS.CURRENT);
    return data;
  },
};
