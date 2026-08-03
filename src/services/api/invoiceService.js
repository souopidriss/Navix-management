/**
 * Navix InvoiceService
 * --------------------------------------------------------------------------
 * Description : consultation des factures de l'entreprise.
 * Responsabilité : fournir les factures (liste, filtres, pagination) aux vues.
 *                  Mode mock : données simulées, aucune requête HTTP.
 *
 * Exemple d'utilisation :
 *   import { invoiceService } from '@/services/api';
 *   const invoices = await invoiceService.getInvoices({ status: 'paid' });
 */
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '../client';
import { apiConfig } from '../config';
import { mockResponse } from '../utils';

const MOCK_INVOICES = [
  { id: 'inv_001', number: 'FAC-2026-0142', companyId: 'cmp_001', status: 'paid', amount: 150000, issuedDate: '2026-07-01', dueDate: '2026-07-15' },
  { id: 'inv_002', number: 'FAC-2026-0143', companyId: 'cmp_001', status: 'pending', amount: 75000, issuedDate: '2026-07-10', dueDate: '2026-07-24' },
  { id: 'inv_003', number: 'FAC-2026-0144', companyId: 'cmp_001', status: 'overdue', amount: 220000, issuedDate: '2026-06-20', dueDate: '2026-07-05' },
];

export const invoiceService = {
  /**
   * Liste des factures.
   * @param {{ page?: number, limit?: number, status?: string }} [params]
   * @returns {Promise<Array<object>>}
   */
  async getInvoices(params = {}) {
    if (apiConfig.mock) {
      return mockResponse(MOCK_INVOICES);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.INVOICES.LIST, { params });
    return data;
  },

  /**
   * Détail d'une facture.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getInvoice(id) {
    if (apiConfig.mock) {
      return mockResponse(MOCK_INVOICES.find((invoice) => invoice.id === id) ?? null);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.INVOICES.DETAIL(id));
    return data;
  },
};
