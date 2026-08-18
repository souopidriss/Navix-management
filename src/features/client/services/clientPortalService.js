/**
 * Navix Client — Service Central du Portail Client (Mock Frontend)
 * --------------------------------------------------------------------------
 * Encapsule les données du portail Client (Entreprise et Particulier) :
 * contexte entreprise/tenant, dashboard, flotte (véhicules, chauffeurs,
 * trajets) et fondations financières (fonds & transactions FCFA).
 *
 * Conventions :
 *   - Isolation multi-tenant : la flotte est strictement filtrée par
 *     `companyId` du Client entreprise (source : mocks flotte).
 *   - Le contexte entreprise est fusionné avec la session authentifiée
 *     (useAuthStore via getTenantScope) : companyId / tenantId de session.
 *   - Monnaie : FCFA (XAF). Villes : Cameroun uniquement.
 *
 * Aucune requête backend réelle — 100% simulé. Les méthodes préparent le
 * contrat de données des prochains prompts (055 → 060) sans en implémenter
 * la logique fonctionnelle.
 */
import { mockResponse } from '@/services/utils';
import { getTenantScope } from '@/utils/tenantScope';
import { MOCK_VEHICLES } from '@/features/vehicles/mocks';
import { MOCK_DRIVERS } from '@/features/drivers/mocks';
import { MOCK_TRIPS } from '@/features/trips/mocks';
import {
  MOCK_CLIENT_ENTERPRISE,
  MOCK_CLIENT_INDIVIDUAL,
  MOCK_CLIENT_SERVICES,
  MOCK_CLIENT_REQUESTS,
  MOCK_CLIENT_INVOICES,
  MOCK_CLIENT_WALLET,
  MOCK_CLIENT_TRANSACTIONS,
} from '../mocks/client.mock';
import { CLIENT_TYPES } from '../constants/client.constants';

const getClientProfile = (clientType = CLIENT_TYPES.ENTERPRISE) =>
  clientType === CLIENT_TYPES.INDIVIDUAL ? MOCK_CLIENT_INDIVIDUAL : MOCK_CLIENT_ENTERPRISE;

/** Id d'entreprise utilisé pour la portée de données flotte (mock). */
const CLIENT_FLEET_COMPANY_ID = MOCK_CLIENT_ENTERPRISE.companyId;

export const clientPortalService = {
  /** Récupère le profil du client courant (Entreprise ou Particulier). */
  async getCurrentClient(clientType = CLIENT_TYPES.ENTERPRISE) {
    return mockResponse(getClientProfile(clientType));
  },

  /**
   * Contexte entreprise / multi-tenant du Client.
   * Fusionne la session authentifiée (company/tenant) avec le profil mock.
   * @returns {Promise<{
   *   companyId, tenantId, companyName, companyLogo, companyStatus,
   *   clientType, profile, fleetCompanyId
   * }>}
   */
  async getClientContext(clientType = CLIENT_TYPES.ENTERPRISE) {
    const { company, tenant, isSuperAdmin } = getTenantScope();
    const profile = getClientProfile(clientType);

    const companyName = isSuperAdmin ? profile.companyName : (company?.name ?? profile.companyName);

    return mockResponse(
      {
        companyId: isSuperAdmin ? profile.companyId : (company?.id ?? profile.companyId),
        tenantId: isSuperAdmin ? (tenant?.id ?? 'ten_demo') : (tenant?.id ?? 'ten_demo'),
        companyName,
        companyLogo: profile.companyLogo ?? null,
        companyStatus: profile.companyStatus ?? profile.status ?? 'active',
        clientType,
        profile,
        fleetCompanyId: CLIENT_FLEET_COMPANY_ID,
      },
      { latency: 250 },
    );
  },

  /** Synthèse pour le Dashboard Client. */
  async getClientDashboard(clientType = CLIENT_TYPES.ENTERPRISE) {
    const client = getClientProfile(clientType);

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

  /** Synthèse rapide du portail (alias du dashboard, contrat stable). */
  async getDashboardSummary(clientType = CLIENT_TYPES.ENTERPRISE) {
    return clientPortalService.getClientDashboard(clientType);
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

  /**
   * Véhicules du client — isolés par entreprise (multi-tenant).
   * Entreprise : flotte mockée liée à fleetCompanyId ; Particulier : aucun.
   */
  async getVehicles(clientType = CLIENT_TYPES.ENTERPRISE) {
    if (clientType === CLIENT_TYPES.INDIVIDUAL) {
      return mockResponse([]);
    }
    const vehicles = MOCK_VEHICLES.filter((vehicle) => vehicle.companyId === CLIENT_FLEET_COMPANY_ID);
    return mockResponse(vehicles);
  },

  /**
   * Chauffeurs du client — isolés par entreprise (multi-tenant).
   * Entreprise : équipe mockée ; Particulier : aucun.
   */
  async getDrivers(clientType = CLIENT_TYPES.ENTERPRISE) {
    if (clientType === CLIENT_TYPES.INDIVIDUAL) {
      return mockResponse([]);
    }
    const drivers = MOCK_DRIVERS.filter((driver) => driver.companyId === CLIENT_FLEET_COMPANY_ID);
    return mockResponse(drivers);
  },

  /**
   * Trajets du client — isolés par entreprise (multi-tenant).
   */
  async getTrips(clientType = CLIENT_TYPES.ENTERPRISE) {
    if (clientType === CLIENT_TYPES.INDIVIDUAL) {
      return mockResponse([]);
    }
    const trips = MOCK_TRIPS.filter((trip) => trip.companyId === CLIENT_FLEET_COMPANY_ID);
    return mockResponse(trips);
  },

  /**
   * Synthèse financière (fondation — PROMPT 059 pour le développement complet).
   * Entreprise : wallet + transactions en FCFA. Particulier : aucune (règle
   * « espaces financiers » : Super Admin, Client/Entreprise, Partenaire).
   */
  async getFinanceSummary(clientType = CLIENT_TYPES.ENTERPRISE) {
    if (clientType === CLIENT_TYPES.INDIVIDUAL) {
      return mockResponse(null);
    }
    return mockResponse({
      wallet: MOCK_CLIENT_WALLET,
      transactions: MOCK_CLIENT_TRANSACTIONS,
      currency: 'XAF',
      financialSpaces: ['super_admin', 'client_enterprise', 'partner'],
    });
  },
};
