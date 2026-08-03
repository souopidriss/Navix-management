/**
 * Navix CompanyService
 * --------------------------------------------------------------------------
 * Description : consultation des entreprises clientes de la plateforme.
 * Responsabilité : fournir les données entreprises aux vues (multi-tenant).
 *                  Mode mock : données simulées, aucune requête HTTP.
 *
 * Exemple d'utilisation :
 *   import { companyService } from '@/services/api';
 *   const companies = await companyService.getCompanies();
 */
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '../client';
import { apiConfig } from '../config';
import { mockResponse } from '../utils';

const MOCK_COMPANIES = [
  { id: 'cmp_001', name: 'Navix Trans', slug: 'navix-trans', city: 'Abidjan', vehiclesCount: 12, driversCount: 8 },
  { id: 'cmp_002', name: 'Trans Express CI', slug: 'trans-express', city: 'Yamoussoukro', vehiclesCount: 6, driversCount: 4 },
  { id: 'cmp_003', name: 'LogiSud', slug: 'logisud', city: 'Bouaké', vehiclesCount: 9, driversCount: 5 },
];

export const companyService = {
  /**
   * Liste des entreprises.
   * @param {{ page?: number, limit?: number, search?: string }} [params]
   * @returns {Promise<Array<object>>}
   */
  async getCompanies(params = {}) {
    if (apiConfig.mock) {
      return mockResponse(MOCK_COMPANIES);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.COMPANIES.LIST, { params });
    return data;
  },

  /**
   * Détail d'une entreprise.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getCompany(id) {
    if (apiConfig.mock) {
      return mockResponse(MOCK_COMPANIES.find((company) => company.id === id) ?? null);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.COMPANIES.DETAIL(id));
    return data;
  },
};
