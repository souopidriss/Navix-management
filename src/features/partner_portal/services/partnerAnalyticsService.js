/**
 * Navix Partner Portal — Service Analytics Partenaire
 * --------------------------------------------------------------------------
 * Agrège les données de tous les modules métier existants pour produire
 * les métriques de Performance & Analytics. READ-ONLY : aucune mutation.
 *
 * Multi-tenant : toutes les données sont filtrées par PARTNER_COMPANY_ID.
 * Aucune donnée globale n'est exposée au Partenaire.
 */
import { mockResponse } from '@/services/utils';
import {
  MOCK_PARTNER_REVENUES,
  MOCK_PARTNER_MISSIONS,
  MOCK_PARTNER_REQUESTS,
  MOCK_PARTNER_VEHICLES,
  MOCK_PARTNER_CLIENTS,
  MOCK_PARTNER_REVENUE_EVOLUTION,
  MOCK_PARTNER_ACTIVITY_DISTRIBUTION,
  MOCK_PARTNER_VEHICLE_PERFORMANCE,
  MOCK_PARTNER_FINANCIAL_SUMMARY,
} from '../mocks/partner.mock';
import { MOCK_PARTNER_CONTRACTS } from '../mocks/partnerContract.mock';
import { MOCK_PARTNER_INVOICES } from '../mocks/partner.mock';
import {
  PARTNER_COMPANY_ID,
  PARTNER_PARTNER_ID,
} from '../constants/partner.constants';

const isOwn = (record) => record.companyId === PARTNER_COMPANY_ID && (!record.partnerId || record.partnerId === PARTNER_PARTNER_ID);

const sumBy = (arr, fn) => arr.reduce((acc, item) => acc + (fn(item) || 0), 0);

const countBy = (arr, predicate) => arr.filter(predicate).length;

const safeRate = (numerator, denominator) =>
  denominator > 0 ? Math.round((numerator / denominator) * 100) : 0;

const filterByPeriod = (items, period) => {
  if (!period || period === 'all') return items;
  const now = new Date();
  let startDate;
  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'last7':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'lastMonth':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      break;
    case 'last3':
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case 'last6':
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 6);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'custom':
      return items;
    default:
      return items;
  }
  return items.filter((item) => {
    const d = new Date(item.createdAt || item.startDate || item.issueDate || 0);
    return d >= startDate;
  });
};

const previousPeriodItems = (items) => {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return items.filter((item) => {
    const d = new Date(item.createdAt || item.startDate || item.issueDate || 0);
    return d >= lastMonthStart && d < thisMonthStart;
  });
};

export const partnerAnalyticsService = {
  async getAnalyticsData({ period = 'all' } = {}) {
    const allRevenues = MOCK_PARTNER_REVENUES.filter(isOwn);
    const allMissions = MOCK_PARTNER_MISSIONS.filter(isOwn);
    const allRequests = MOCK_PARTNER_REQUESTS.filter(isOwn);
    const allVehicles = MOCK_PARTNER_VEHICLES.filter(isOwn);
    const allClients = MOCK_PARTNER_CLIENTS.filter(isOwn);
    const allContracts = MOCK_PARTNER_CONTRACTS.filter(
      (c) => c.companyId === PARTNER_COMPANY_ID || !c.companyId,
    );
    const allInvoices = MOCK_PARTNER_INVOICES.filter(isOwn);

    const revenues = filterByPeriod(allRevenues, period);
    const missions = filterByPeriod(allMissions, period);
    const requests = filterByPeriod(allRequests, period);

    const prevRevenues = previousPeriodItems(allRevenues);
    const prevMissions = previousPeriodItems(allMissions);

    const grossTotal = sumBy(revenues, (r) => r.grossAmount);
    const commissionTotal = sumBy(revenues, (r) => r.commissionAmount);
    const netTotal = sumBy(revenues, (r) => r.netAmount);
    const prevGross = sumBy(prevRevenues, (r) => r.grossAmount);
    const prevNet = sumBy(prevRevenues, (r) => r.netAmount);

    const grossVariation = prevGross > 0 ? Math.round(((grossTotal - prevGross) / prevGross) * 1000) / 10 : 0;
    const netVariation = prevNet > 0 ? Math.round(((netTotal - prevNet) / prevNet) * 1000) / 10 : 0;

    const missionCompleted = countBy(missions, (m) => m.status === 'completed');
    const missionInProgress = countBy(missions, (m) => m.status === 'in_progress');
    const missionCancelled = countBy(missions, (m) => m.status === 'cancelled');
    const missionScheduled = countBy(missions, (m) => m.status === 'scheduled');
    const missionSuccessRate = safeRate(missionCompleted, missions.length);
    const prevMissionTotal = prevMissions.length;
    const missionsVariation =
      prevMissionTotal > 0
        ? Math.round(((missions.length - prevMissionTotal) / prevMissionTotal) * 1000) / 10
        : 0;

    const requestAccepted = countBy(requests, (r) => r.status === 'accepted' || r.status === 'converted');
    const requestRejected = countBy(requests, (r) => r.status === 'rejected');
    const requestPending = countBy(requests, (r) => r.status === 'pending' || r.status === 'reviewing');
    const requestConverted = countBy(requests, (r) => r.status === 'converted');
    const acceptanceRate = safeRate(requestAccepted, requests.length);

    const activeClients = countBy(allClients, (c) => c.status === 'active');
    const totalClientRevenue = sumBy(allClients, (c) => c.revenue || 0);
    const clientsWithMissions = allClients.filter((c) => c.missionsCount > 0);
    const topClients = [...clientsWithMissions]
      .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
      .slice(0, 5);

    const availableVehicles = countBy(allVehicles, (v) => v.status === 'available');
    const inUseVehicles = countBy(allVehicles, (v) => v.status === 'in_use');
    const maintenanceVehicles = countBy(allVehicles, (v) => v.status === 'maintenance');
    const vehicleUtilizationRate = safeRate(inUseVehicles, allVehicles.length);

    const activeContracts = countBy(allContracts, (c) => c.status === 'active');
    const expiringContracts = countBy(allContracts, (c) => c.status === 'expiring');
    const contractValue = sumBy(allContracts.filter((c) => c.status === 'active'), (c) => c.value);

    const totalInvoiced = sumBy(allInvoices, (i) => i.totalAmount);
    const paidInvoices = allInvoices.filter((i) => i.status === 'paid');
    const totalPaid = sumBy(paidInvoices, (i) => i.totalAmount);
    const pendingInvoices = allInvoices.filter((i) => i.status === 'pending' || i.status === 'issued');
    const totalPending = sumBy(pendingInvoices, (i) => i.totalAmount);
    const overdueInvoices = allInvoices.filter((i) => i.status === 'overdue');
    const totalOverdue = sumBy(overdueInvoices, (i) => i.totalAmount);

    const wallet = MOCK_PARTNER_FINANCIAL_SUMMARY;

    const serviceTypes = {};
    missions.forEach((m) => {
      const type = m.type || 'autre';
      if (!serviceTypes[type]) {
        serviceTypes[type] = { count: 0, revenue: 0, netRevenue: 0 };
      }
      serviceTypes[type].count += 1;
      const revenue = revenues.find((r) => r.missionId === m.id);
      if (revenue) {
        serviceTypes[type].revenue += revenue.grossAmount;
        serviceTypes[type].netRevenue += revenue.netAmount;
      }
    });

    const insights = [];
    if (grossVariation > 0) {
      insights.push({
        type: 'positive',
        icon: 'bi-graph-up-arrow',
        text: `Votre chiffre d'affaires a augmenté de ${Math.abs(grossVariation)} % par rapport à la période précédente.`,
      });
    } else if (grossVariation < 0) {
      insights.push({
        type: 'warning',
        icon: 'bi-graph-down-arrow',
        text: `Votre chiffre d'affaires a diminué de ${Math.abs(grossVariation)} % par rapport à la période précédente.`,
      });
    }

    const topServiceType = Object.entries(serviceTypes).sort((a, b) => b[1].revenue - a[1].revenue)[0];
    if (topServiceType) {
      const serviceLabels = {
        transport: 'transport',
        livraison: 'livraison',
        disponibilite: 'mise à disposition',
        transfert: 'transfert',
        location: 'location',
        autre: 'prestations diverses',
      };
      insights.push({
        type: 'info',
        icon: 'bi-info-circle',
        text: `Les missions de ${serviceLabels[topServiceType[0]] || topServiceType[0]} représentent votre principale source de revenus.`,
      });
    }

    if (expiringContracts > 0) {
      insights.push({
        type: 'warning',
        icon: 'bi-exclamation-triangle',
        text: `${expiringContracts} contrat${expiringContracts > 1 ? 's' : ''} arrivent à expiration dans les 30 prochains jours.`,
      });
    }

    if (overdueInvoices.length > 0) {
      insights.push({
        type: 'danger',
        icon: 'bi-exclamation-circle',
        text: `${overdueInvoices.length} facture${overdueInvoices.length > 1 ? 's' : ''} en retard de paiement.`,
      });
    }

    if (missionSuccessRate >= 80) {
      insights.push({
        type: 'positive',
        icon: 'bi-check-circle',
        text: `Votre taux de réussite des missions est de ${missionSuccessRate} %, ce qui est excellent.`,
      });
    }

    if (acceptanceRate >= 70) {
      insights.push({
        type: 'positive',
        icon: 'bi-hand-thumbs-up',
        text: `Votre taux d'acceptation des demandes est de ${acceptanceRate} %.`,
      });
    }

    const data = {
      period,
      kpis: {
        grossTotal,
        commissionTotal,
        netTotal,
        totalMissions: missions.length,
        acceptanceRate,
        activeClients,
        activeVehicles: inUseVehicles + availableVehicles,
        grossVariation,
        netVariation,
        missionsVariation,
      },
      revenuePerformance: {
        grossTotal,
        commissionTotal,
        netTotal,
        grossVariation,
        netVariation,
        evolution: MOCK_PARTNER_REVENUE_EVOLUTION,
      },
      missionPerformance: {
        total: missions.length,
        completed: missionCompleted,
        inProgress: missionInProgress,
        cancelled: missionCancelled,
        scheduled: missionScheduled,
        successRate: missionSuccessRate,
        missionsVariation,
      },
      requestPerformance: {
        total: requests.length,
        accepted: requestAccepted,
        rejected: requestRejected,
        pending: requestPending,
        converted: requestConverted,
        acceptanceRate,
      },
      clientPerformance: {
        active: activeClients,
        total: allClients.length,
        totalRevenue: totalClientRevenue,
        topClients: topClients.map((c) => ({
          id: c.id,
          name: c.name,
          missions: c.missionsCount,
          revenue: c.revenue || 0,
        })),
      },
      vehiclePerformance: {
        total: allVehicles.length,
        available: availableVehicles,
        inUse: inUseVehicles,
        maintenance: maintenanceVehicles,
        utilizationRate: vehicleUtilizationRate,
        topVehicles: MOCK_PARTNER_VEHICLE_PERFORMANCE.map((v) => ({
          registration: v.registration,
          brand: v.brand,
          model: v.model,
          missions: v.missionsMonth,
          revenue: v.revenueMonth,
          utilizationRate: v.utilizationRate,
        })),
      },
      contractPerformance: {
        total: allContracts.length,
        active: activeContracts,
        expiring: expiringContracts,
        contractValue,
      },
      invoicePerformance: {
        total: allInvoices.length,
        totalInvoiced,
        totalPaid,
        totalPending,
        totalOverdue,
        paidCount: paidInvoices.length,
        overdueCount: overdueInvoices.length,
      },
      financialPerformance: {
        grossTotal,
        commissionTotal,
        netTotal,
        totalInvoiced,
        totalPaid,
        totalPending,
        totalOverdue,
        balance: wallet?.balance || 0,
        incomeMonth: wallet?.incomeMonth || 0,
        expenseMonth: wallet?.expenseMonth || 0,
      },
      operationalPerformance: {
        requests: requests.length,
        missions: missions.length,
        missionsCompleted: missionCompleted,
        missionsCancelled: missionCancelled,
        successRate: missionSuccessRate,
      },
      prestations: Object.entries(serviceTypes)
        .map(([type, data]) => ({
          type,
          count: data.count,
          revenue: data.revenue,
          netRevenue: data.netRevenue,
        }))
        .sort((a, b) => b.revenue - a.revenue),
      activityDistribution: MOCK_PARTNER_ACTIVITY_DISTRIBUTION,
      insights,
    };

    return mockResponse(data, { latency: 400 });
  },
};

export default partnerAnalyticsService;
