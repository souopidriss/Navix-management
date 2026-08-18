/**
 * Navix Partner — Service Dashboard Partenaire Premium
 * --------------------------------------------------------------------------
 * Fournit les données du Dashboard Partenaire. Architecture DATA / LOGIC /
 * UI strictement séparée. Remplaçable par une vraie API sans toucher aux
 * composants UI.
 *
 * PROMPT 061 — Dashboard Partenaire Premium :
 *   flotte partenaire (état + répartition), missions en cours / récentes,
 *   clients partenaires, alertes de la flotte, activités récentes et résumé
 *   financier (FCFA).
 *
 * PROMPT 062 — Vue Corporate Premium (Phase 4) :
 *   API dédiée segmentée en 8 méthodes : getDashboardStats, getRevenueEvolution,
 *   getActivityDistribution, getAlerts, getRecentMissions, getVehiclePerformance,
 *   getRecentActivities, getFinancialSummary — plus getDashboardData (agrégat).
 *   Les 5 KPI imposés (24/18/37/18 450 000/42 850 000) et le résumé financier
 *   corporate (42 850 000 / 75 350 000 / 32 500 000 / 12) sont des agrégats
 *   de démonstration distincts du ledger opérationnel (wallet 18 750 000 FCFA,
 *   conservé pour la page Finance) et des listes réelles (5 missions,
 *   6 véhicules, 4 clients).
 *
 * Données strictement bornées au `companyId` partenaire (multi-tenant).
 */
import { mockResponse } from '@/services/utils';
import { formatCurrency } from '@/utils/format';
import {
  MOCK_PARTNER_ENTERPRISE,
  MOCK_PARTNER_KPIS,
  MOCK_PARTNER_VEHICLES,
  MOCK_PARTNER_MISSIONS,
  MOCK_PARTNER_CLIENTS,
  MOCK_PARTNER_ACTIVITIES,
  MOCK_PARTNER_ALERTS,
  MOCK_PARTNER_REVENUE_EVOLUTION,
  MOCK_PARTNER_ACTIVITY_DISTRIBUTION,
  MOCK_PARTNER_VEHICLE_PERFORMANCE,
  MOCK_PARTNER_FINANCIAL_SUMMARY,
} from '../mocks/partner.mock';
import { getPartnerTransactionRecordsCache } from './partnerFinanceService';
import { PARTNER_COMPANY_ID, PARTNER_PARTNER_ID } from '../constants/partner.constants';

const buildFleetStatus = (vehicles) => {
  const counts = { total: 0, in_use: 0, available: 0, maintenance: 0, out_of_service: 0 };
  vehicles.forEach((vehicle) => {
    counts.total += 1;
    if (vehicle.status === 'maintenance') counts.maintenance += 1;
    else if (vehicle.status === 'in_use') counts.in_use += 1;
    else if (vehicle.status === 'available') counts.available += 1;
    else counts.out_of_service += 1;
  });
  counts.available = Math.max(0, counts.total - counts.in_use - counts.maintenance - counts.out_of_service);
  const availabilityRate = counts.total ? Math.round(((counts.available + counts.in_use) / counts.total) * 100) : 0;
  const utilizationRate = counts.total ? Math.round((counts.in_use / counts.total) * 100) : 0;
  return { ...counts, availabilityRate, utilizationRate };
};

const buildAlerts = () => {
  const items = MOCK_PARTNER_ALERTS.filter(
    (a) => (!a.companyId || a.companyId === PARTNER_COMPANY_ID) && (!a.partnerId || a.partnerId === PARTNER_PARTNER_ID)
  ).map((alert) => ({
    id: alert.id,
    type: alert.type,
    category: alert.type.includes('maintenance') || alert.type.includes('vehicle') ? 'maintenance' : alert.type.includes('document') || alert.type.includes('insurance') ? 'documents' : alert.type.includes('fuel') ? 'fuel' : 'Général',
    severity: alert.severity,
    title: alert.title,
    description: alert.message,
    createdAt: alert.createdAt,
  }));
  return {
    critical: items.filter((item) => item.severity === 'critical').length,
    warning: items.filter((item) => item.severity === 'warning').length,
    info: items.filter((item) => item.severity === 'info').length,
    items,
  };
};

/** Dernières transactions réelles du ledger (détail de la section finance). */
const buildRecentTransactions = (limit = 4) =>
  getPartnerTransactionRecordsCache()
    .filter((item) => item.companyId === PARTNER_COMPANY_ID)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, limit);

export const partnerDashboardService = {
  /**
   * Les 5 KPI imposés du Dashboard Partenaire (PROMPT 062), prêts pour les
   * cartes KPI (avec mini-sparklines) : 24 missions actives, 18 véhicules
   * disponibles, 37 clients actifs, 18 450 000 FCFA de revenus, 42 850 000
   * FCFA de solde disponible.
   */
  async getDashboardStats() {
    const k = MOCK_PARTNER_KPIS;
    const stats = [
      {
        key: 'active_missions',
        label: 'Missions actives',
        value: k.activeMissions,
        trend: k.activeMissionsTrend,
        trendLabel: `${String(k.activeMissionsTrend).replace('.', ',')} % vs mois dernier`,
        icon: 'bi-signpost-split',
        variant: 'primary',
        sparkline: k.activeMissionsSparkline,
      },
      {
        key: 'vehicles_available',
        label: 'Véhicules disponibles',
        value: k.vehiclesAvailable,
        trend: k.vehiclesAvailableTrend,
        trendLabel: `${String(k.vehiclesAvailableTrend).replace('.', ',')} % vs mois dernier`,
        icon: 'bi-truck',
        variant: 'info',
        sparkline: k.vehiclesAvailableSparkline,
      },
      {
        key: 'clients_active',
        label: 'Clients actifs',
        value: k.clientsActive,
        trend: k.clientsActiveTrend,
        trendLabel: `${String(k.clientsActiveTrend).replace('.', ',')} % vs mois dernier`,
        icon: 'bi-people',
        variant: 'success',
        sparkline: k.clientsActiveSparkline,
      },
      {
        key: 'revenue_month',
        label: 'Revenus du mois',
        value: formatCurrency(k.revenueMonth, 'XAF'),
        trend: k.revenueTrend,
        trendLabel: `${String(k.revenueTrend).replace('.', ',')} % vs mois dernier`,
        icon: 'bi-cash-stack',
        variant: 'warning',
        sparkline: k.revenueSparkline,
      },
      {
        key: 'balance_available',
        label: 'Solde disponible',
        value: formatCurrency(k.balanceMonth, 'XAF'),
        trend: k.balanceTrend,
        trendLabel: `${String(Math.abs(k.balanceTrend)).replace('.', ',')} % vs mois dernier`,
        icon: 'bi-wallet2',
        variant: 'danger',
        sparkline: k.balanceSparkline,
      },
    ];
    return mockResponse(stats, { latency: 350 });
  },

  /** Évolution des revenus & sorties sur 6 mois (AreaChart). */
  async getRevenueEvolution() {
    return mockResponse(MOCK_PARTNER_REVENUE_EVOLUTION, { latency: 350 });
  },

  /** Répartition des revenus par activité du mois (DonutChart). */
  async getActivityDistribution() {
    return mockResponse(MOCK_PARTNER_ACTIVITY_DISTRIBUTION, { latency: 350 });
  },

  /** Alertes de la flotte partenaire (gravité + liste). */
  async getAlerts() {
    return mockResponse(buildAlerts(), { latency: 350 });
  },

  /** Missions récentes / en cours du partenaire. */
  async getRecentMissions() {
    const missions = MOCK_PARTNER_MISSIONS.filter((mission) => mission.companyId === PARTNER_COMPANY_ID && (!mission.partnerId || mission.partnerId === PARTNER_PARTNER_ID));
    return mockResponse(missions, { latency: 350 });
  },

  /** Performance des véhicules de la flotte partenaire (mois courant). */
  async getVehiclePerformance() {
    const performance = MOCK_PARTNER_VEHICLE_PERFORMANCE.filter(
      (item) => !item.companyId || item.companyId === PARTNER_COMPANY_ID,
    );
    return mockResponse(performance, { latency: 350 });
  },

  /** Activités récentes (frise chronologique du dashboard). */
  async getRecentActivities() {
    return mockResponse(MOCK_PARTNER_ACTIVITIES, { latency: 350 });
  },

  /**
   * Résumé financier corporate du Dashboard (PROMPT 062) :
   * solde 42 850 000 / entrées 75 350 000 / sorties 32 500 000 / 12
   * transactions. Les dernières transactions réelles du ledger sont jointes
   * en détail.
   */
  async getFinancialSummary() {
    const summary = {
      ...MOCK_PARTNER_FINANCIAL_SUMMARY,
      recentTransactions: buildRecentTransactions(4),
    };
    return mockResponse(summary, { latency: 350 });
  },

  /** Toutes les données du Dashboard Partenaire (agrégat PROMPT 062). */
  async getDashboardData() {
    const [
      stats,
      revenueEvolution,
      activityDistribution,
      alerts,
      missions,
      vehiclePerformance,
      recentActivities,
      financialSummary,
    ] = await Promise.all([
      this.getDashboardStats(),
      this.getRevenueEvolution(),
      this.getActivityDistribution(),
      this.getAlerts(),
      this.getRecentMissions(),
      this.getVehiclePerformance(),
      this.getRecentActivities(),
      this.getFinancialSummary(),
    ]);

    const partner = MOCK_PARTNER_ENTERPRISE;
    const vehicles = MOCK_PARTNER_VEHICLES.filter((vehicle) => vehicle.companyId === PARTNER_COMPANY_ID && (!vehicle.partnerId || vehicle.partnerId === PARTNER_PARTNER_ID));
    const fleetStatus = buildFleetStatus(vehicles);

    return mockResponse(
      {
        companyId: PARTNER_COMPANY_ID,
        partner,
        kpis: MOCK_PARTNER_KPIS,
        stats,
        metrics: stats,
        metricsSecondary: [],
        fleetStatus,
        vehicles: vehicles.map((vehicle) => ({
          ...vehicle,
          registration: vehicle.registration || vehicle.registrationNumber,
        })),
        missions,
        clients: MOCK_PARTNER_CLIENTS.filter((client) => client.companyId === PARTNER_COMPANY_ID && (!client.partnerId || client.partnerId === PARTNER_PARTNER_ID)),
        alerts,
        recentActivities,
        vehiclePerformance,
        revenueEvolution,
        activityDistribution,
        financeSummary: financialSummary,
        quickActions: [],
      },
      { latency: 400 },
    );
  },
};
