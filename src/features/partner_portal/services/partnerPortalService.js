/**
 * Navix Partner Portal — Service Central du Portail Partenaire (Mock Frontend)
 * --------------------------------------------------------------------------
 * Encapsule les données de l'Espace Partenaire : contexte multi-tenant
 * (companyId / partnerId), synthèse dashboard, flotte partenaire, missions,
 * clients, documents, notifications, profil et fondations financières
 * (fonds & transactions FCFA).
 *
 * Conventions :
 *   - Isolation multi-tenant : toutes les données sont strictement bornées au
 *     `companyId` partenaire (`cmp_partner_navix`) — un chauffeur ne peut pas
 *     y accéder (le rôle partenaire seul est habilité sur /partner/*).
 *   - Monnaie : FCFA (XAF) uniquement. Aucune autre devise.
 *   - Le contexte est fusionné avec la session authentifiée (useAuthStore via
 *     getTenantScope) : companyId / tenantId de session.
 *
 * Aucune requête backend réelle — 100% simulé (mockResponse).
 */
import { mockResponse } from '@/services/utils';
import { getTenantScope } from '@/utils/tenantScope';
import {
  MOCK_PARTNER_ENTERPRISE,
  MOCK_PARTNER_WALLET,
  MOCK_PARTNER_TRANSACTIONS,
  MOCK_PARTNER_KPIS,
  MOCK_PARTNER_MISSIONS,
  MOCK_PARTNER_CLIENTS,
  MOCK_PARTNER_DOCUMENTS,
  MOCK_PARTNER_NOTIFICATIONS,
  MOCK_PARTNER_PROFILE,
} from '../mocks/partner.mock';
import { PARTNER_COMPANY_ID, PARTNER_PARTNER_ID } from '../constants/partner.constants';
import { partnerVehicleService, getPartnerVehiclesCache } from './partnerVehicleService';
import { partnerMissionService } from './partnerMissionService';
import { partnerClientService } from './partnerClientService';

export const partnerPortalService = {
  /** Récupère le profil de l'entreprise partenaire courante. */
  async getCurrentPartner() {
    return mockResponse(MOCK_PARTNER_ENTERPRISE, { latency: 250 });
  },

  /**
   * Contexte multi-tenant du Partenaire.
   * Fusionne la session authentifiée (company/tenant) avec le profil mock.
   */
  async getPartnerContext() {
    const { company, tenant, isSuperAdmin } = getTenantScope();
    const profile = MOCK_PARTNER_ENTERPRISE;

    const companyName = isSuperAdmin ? profile.companyName : (company?.name ?? profile.companyName);

    return mockResponse(
      {
        companyId: isSuperAdmin ? profile.companyId : (company?.id ?? profile.companyId),
        tenantId: tenant?.id ?? 'ten_demo',
        companyName,
        companyLogo: profile.companyLogo ?? null,
        companyStatus: profile.companyStatus ?? profile.status ?? 'active',
        partnerId: profile.partnerId,
        profile,
        fleetCompanyId: PARTNER_COMPANY_ID,
      },
      { latency: 250 },
    );
  },

  /** Synthèse pour le Dashboard Partenaire. */
  async getPartnerDashboard() {
    const partner = MOCK_PARTNER_ENTERPRISE;

    return mockResponse(
      {
        partner,
        kpis: MOCK_PARTNER_KPIS,
        metrics: [
          {
            key: 'missions',
            label: 'Missions actives',
            value: MOCK_PARTNER_KPIS.activeMissions,
            icon: 'bi-signpost-split',
            variant: 'primary',
          },
          {
            key: 'vehicles',
            label: 'Véhicules de la flotte',
            value: MOCK_PARTNER_KPIS.vehiclesActive,
            icon: 'bi-truck',
            variant: 'info',
          },
          {
            key: 'clients',
            label: 'Clients actifs',
            value: MOCK_PARTNER_KPIS.clientsActive,
            icon: 'bi-people',
            variant: 'success',
          },
          {
            key: 'revenue',
            label: 'Entrées du mois',
            value: MOCK_PARTNER_KPIS.revenueMonth,
            icon: 'bi-cash-stack',
            variant: 'warning',
            format: 'currency',
          },
        ],
        vehicles: getPartnerVehiclesCache().filter((v) => (!v.companyId || v.companyId === PARTNER_COMPANY_ID) && (!v.partnerId || v.partnerId === PARTNER_PARTNER_ID)),
        missions: MOCK_PARTNER_MISSIONS.filter((m) => (!m.companyId || m.companyId === PARTNER_COMPANY_ID) && (!m.partnerId || m.partnerId === PARTNER_PARTNER_ID)),
        clients: MOCK_PARTNER_CLIENTS.filter((c) => (!c.companyId || c.companyId === PARTNER_COMPANY_ID) && (!c.partnerId || c.partnerId === PARTNER_PARTNER_ID)),
        activities: [],
        alerts: [],
      },
      { latency: 400 },
    );
  },

  /** Véhicules de la flotte partenaire (source unique : cache du service flotte). */
  async getVehicles() {
    return partnerVehicleService.getVehicles();
  },

  /** Missions partenaire (source unique : cache du service missions). */
  async getMissions() {
    return partnerMissionService.getMissions();
  },

  /** Clients de l'entreprise partenaire (source unique : service clients PROMPT 065). */
  async getClients() {
    return partnerClientService.getClients();
  },

  /** Documents du partenaire. */
  async getDocuments() {
    const filtered = MOCK_PARTNER_DOCUMENTS.filter(
      (d) => (!d.companyId || d.companyId === PARTNER_COMPANY_ID) && (!d.partnerId || d.partnerId === PARTNER_PARTNER_ID)
    );
    return mockResponse(filtered, { latency: 300 });
  },

  /** Notifications du partenaire. */
  async getNotifications() {
    const filtered = MOCK_PARTNER_NOTIFICATIONS.filter(
      (n) => (!n.companyId || n.companyId === PARTNER_COMPANY_ID) && (!n.partnerId || n.partnerId === PARTNER_PARTNER_ID)
    );
    return mockResponse(filtered, { latency: 300 });
  },

  /** Profil utilisateur partenaire / préférences. */
  async getProfile() {
    return mockResponse(MOCK_PARTNER_PROFILE, { latency: 250 });
  },

  /** Synthèse financière (fondation — PROMPT 061 pour le développement complet). */
  async getFinanceSummary() {
    return mockResponse({
      wallet: MOCK_PARTNER_WALLET,
      transactions: MOCK_PARTNER_TRANSACTIONS,
      currency: 'XAF',
      financialSpaces: ['super_admin', 'client_enterprise', 'partner'],
    });
  },
};
