/**
 * Navix Client — Service Client (Mock Frontend)
 * --------------------------------------------------------------------------
 * Fournit les données simulées pour l'espace Client (Entreprise et Particulier).
 * Aucune requête backend réelle — 100% sécurisé et isolé.
 */
import { mockResponse } from '@/services/utils';
import {
  MOCK_CLIENT_ENTERPRISE,
  MOCK_CLIENT_INDIVIDUAL,
  MOCK_CLIENT_SERVICES,
  MOCK_CLIENT_REQUESTS,
  MOCK_CLIENT_INVOICES,
} from '../mocks/client.mock';
import { CLIENT_TYPES } from '../constants/client.constants';

export const clientService = {
  /** Récupère le profil du client courant (Entreprise ou Particulier). */
  async getCurrentClient(clientType = CLIENT_TYPES.ENTERPRISE) {
    const profile = clientType === CLIENT_TYPES.INDIVIDUAL ? MOCK_CLIENT_INDIVIDUAL : MOCK_CLIENT_ENTERPRISE;
    return mockResponse(profile);
  },

  /** Synthèse pour le Dashboard Client. */
  async getClientDashboard(clientType = CLIENT_TYPES.ENTERPRISE) {
    const client = clientType === CLIENT_TYPES.INDIVIDUAL ? MOCK_CLIENT_INDIVIDUAL : MOCK_CLIENT_ENTERPRISE;

    return mockResponse({
      client,
      metrics: [
        {
          key: 'services',
          label: 'Services actifs',
          value: client.activeServicesCount,
          icon: 'bi-grid-fill',
          variant: 'primary',
        },
        {
          key: 'vehicles',
          label: 'Véhicules sous contrat',
          value: client.assignedVehiclesCount,
          icon: 'bi-truck',
          variant: 'info',
        },
        {
          key: 'requests',
          label: 'Demandes en attente',
          value: client.pendingRequestsCount,
          icon: 'bi-hourglass-split',
          variant: 'warning',
        },
        {
          key: 'invoiced',
          label: 'Facturation annuelle',
          value: `${(client.totalInvoicedAmount / 1000000).toFixed(1)} M FCFA`,
          icon: 'bi-cash-stack',
          variant: 'success',
        },
      ],
      recentRequests: MOCK_CLIENT_REQUESTS,
      recentInvoices: MOCK_CLIENT_INVOICES,
      activeServices: MOCK_CLIENT_SERVICES,
    });
  },

  /** Récupère les services du client. */
  async getClientServices() {
    return mockResponse(MOCK_CLIENT_SERVICES);
  },

  /** Récupère les demandes du client. */
  async getClientRequests() {
    return mockResponse(MOCK_CLIENT_REQUESTS);
  },

  /** Récupère les factures du client. */
  async getClientInvoices() {
    return mockResponse(MOCK_CLIENT_INVOICES);
  },
};
