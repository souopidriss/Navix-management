/**
 * Navix Dashboard — DashboardService
 * --------------------------------------------------------------------------
 * Description : agrégation des données multi-modules pour le tableau de bord.
 * Responsabilité : fournir la vue d'ensemble (flotte, carburant, entretiens,
 *                  financier, alertes, activité, classements) aux vues et au
 *                  store. Mode mock : données dérivées des mocks des modules
 *                  existants, aucune requête HTTP.
 *
 * Méthodes (toutes acceptent un paramètre de filtrage commun) :
 *   getOverview()                → synthèse flotte + indicateurs clés
 *   getFleetStatistics()         → répartition par groupe A→G + évolution
 *   getFuelStatistics()          → coûts/volumes carburant + évolution
 *   getMaintenanceStatistics()   → entretiens (coûts, statuts, retard, à venir)
 *   getFinancialStatistics()     → coûts mensuels par poste + coût par km
 *   getAlerts()                  → alertes consolidées
 *   getRecentActivities()        → activité récente
 *   getTopVehicles()             → classement véhicules
 *   getTopDrivers()              → classement chauffeurs
 *
 * Filtrage : `params = { companyId, period, dateFrom, dateTo }`.
 * Le multi-tenant est garanti : `companyId` restreint les données à une seule
 * entreprise, jamais mélangées.
 *
 * Exemple d'utilisation :
 *   import { dashboardService } from '../services';
 *   const overview = await dashboardService.getOverview({ period: 'month' });
 */
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '@/services/client';
import { apiConfig } from '@/services/config';
import { mockResponse } from '@/services/utils';
import { VEHICLE_GROUPS } from '@/features/vehicles/constants';
import { MOCK_VEHICLES } from '@/features/vehicles/mocks';
import { MOCK_DRIVERS } from '@/features/drivers/mocks';
import { MOCK_FUEL_RECORDS } from '@/features/fuel/mocks';
import { MOCK_MAINTENANCE_RECORDS } from '@/features/maintenance/mocks';
import { MOCK_TRIPS } from '@/features/trips/mocks';
import { MAINTENANCE_STATUSES } from '@/features/maintenance/constants';
import {
  MOCK_DASHBOARD_ALERTS,
  MOCK_DASHBOARD_ACTIVITIES,
  MOCK_DASHBOARD_TOP_VEHICLES,
  MOCK_DASHBOARD_TOP_DRIVERS,
} from '../mocks';
import { DEFAULT_PERIOD, TREND_MONTHS, TOP_LIMIT, ACTIVITY_LIMIT, ALERT_LIMIT } from '../constants';

const DAY_MS = 24 * 60 * 60 * 1000;

const roundTo = (value, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round(Number(value || 0) * factor) / factor;
};

const toNumber = (value) => Number(value || 0);

const sum = (items, field) => items.reduce((total, item) => total + toNumber(item[field]), 0);

const monthKey = (value) => (value ? String(value).slice(0, 7) : '');

const monthLabel = (key) => {
  const [year, month] = String(key).split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('fr-FR', { month: 'short' });
};

/** Les N derniers mois (clé 'YYYY-MM') à partir d'une date donnée. */
const lastMonths = (from = new Date(), count = TREND_MONTHS) => {
  const months = [];
  const cursor = new Date(from.getFullYear(), from.getMonth() + 1, 1);
  for (let index = 0; index < count; index += 1) {
    cursor.setMonth(cursor.getMonth() - 1);
    months.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`);
  }
  return months.reverse();
};

/** Restreint une liste à une entreprise (filtre multi-tenant). */
const byCompany = (items, companyId) =>
  companyId ? items.filter((item) => item.companyId === companyId) : items;

/**
 * Intervalle de temps [start, end] (timestamps) correspondant à la période
 * demandée. Retourne null lorsque aucune période n'est active.
 */
const buildPeriodRange = (period = '', dateFrom = '', dateTo = '') => {
  const now = new Date();

  switch (period) {
    case 'today': {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { start: start.getTime(), end: now.getTime() };
    }
    case 'week':
      return { start: now.getTime() - 7 * DAY_MS, end: now.getTime() };
    case 'month':
      return { start: new Date(now.getFullYear(), now.getMonth(), 1).getTime(), end: now.getTime() };
    case 'quarter': {
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      return { start: new Date(now.getFullYear(), quarterStartMonth, 1).getTime(), end: now.getTime() };
    }
    case 'year':
      return { start: new Date(now.getFullYear(), 0, 1).getTime(), end: now.getTime() };
    case 'custom': {
      if (!dateFrom && !dateTo) return null;
      return {
        start: dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : 0,
        end: dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : now.getTime(),
      };
    }
    default:
      return null;
  }
};

/** Indique si une valeur date (ISO) tombe dans l'intervalle de période. */
const inPeriod = (value, range) => {
  if (!range || !value) return true;
  const time = new Date(value).getTime();
  return Number.isFinite(time) && time >= range.start && time <= range.end;
};

/** Date à jour (YYYY-MM-DD) du jour courant — comparables au format dates. */
const todayKey = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

/** Date simple (YYYY-MM-DD) ou ISO → timestamp valide (0 sinon). */
const toTimestamp = (value) => {
  if (!value) return null;
  const candidate = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  const time = new Date(candidate).getTime();
  return Number.isFinite(time) ? time : null;
};

/** Entretien non clôturé dont la date prévue est dépassée. */
const isMaintenanceOverdue = (maintenance) => {
  if (maintenance.status === 'completed' || maintenance.status === 'cancelled') return false;
  return Boolean(maintenance.scheduledDate && maintenance.scheduledDate < todayKey());
};

/** Entretien non clôturé dont la prochaine échéance tombe sous 30 jours. */
const isMaintenanceUpcoming = (maintenance) => {
  if (maintenance.status === 'completed' || maintenance.status === 'cancelled') return false;
  const next = toTimestamp(maintenance.nextMaintenanceDate);
  if (!next) return false;
  const diffDays = Math.round((next - Date.now()) / DAY_MS);
  return diffDays >= 0 && diffDays <= 30;
};

const buildFleetAggregates = (vehicles) => {
  const counts = vehicles.reduce(
    (acc, vehicle) => {
      acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
      return acc;
    },
    { available: 0, in_use: 0, maintenance: 0, out_of_service: 0 },
  );

  const total = vehicles.length || 1;
  const availabilityRate = Math.round(((counts.available + counts.in_use) / total) * 100);
  const utilizationRate = Math.round((counts.in_use / total) * 100);

  return {
    total: vehicles.length,
    available: counts.available || 0,
    inUse: counts.in_use || 0,
    maintenance: counts.maintenance || 0,
    outOfService: counts.out_of_service || 0,
    availabilityRate,
    utilizationRate,
  };
};

const buildGroupStats = (vehicles) =>
  Object.entries(VEHICLE_GROUPS).map(([group, meta]) => {
    const groupVehicles = vehicles.filter((vehicle) => vehicle.group === group);
    const aggregates = buildFleetAggregates(groupVehicles);
    return {
      group,
      label: meta.label,
      variant: meta.variant,
      icon: meta.icon,
      ...aggregates,
    };
  });

export const dashboardService = {
  /**
   * Vue d'ensemble : parc (compteurs + taux), trajets en cours, chauffeurs en
   * mission, entretiens à suivre, documents expirant et coûts du mois.
   * @param {{ companyId?: string, period?: string, dateFrom?: string, dateTo?: string }} [params]
   * @returns {Promise<object>}
   */
  async getOverview(params = {}) {
    const { companyId = '', period = DEFAULT_PERIOD, dateFrom = '', dateTo = '' } = params;
    const range = buildPeriodRange(period, dateFrom, dateTo);

    if (apiConfig.mock) {
      const vehicles = byCompany(MOCK_VEHICLES, companyId);
      const drivers = byCompany(MOCK_DRIVERS, companyId);
      const trips = byCompany(MOCK_TRIPS, companyId);
      const fuelRecords = byCompany(MOCK_FUEL_RECORDS, companyId);
      const maintenanceRecords = byCompany(MOCK_MAINTENANCE_RECORDS, companyId);

      const fleet = buildFleetAggregates(vehicles);

      const activeTrips = trips.filter((trip) => trip.status === 'in_progress').length;
      const driversOnMission = drivers.filter((driver) => driver.status === 'on_mission').length;
      const pendingMaintenance = maintenanceRecords.filter(
        (maintenance) => maintenance.status === 'in_progress' || maintenance.status === 'pending',
      ).length;

      const expiringDocuments = vehicles.filter((vehicle) => {
        const expiring = [vehicle.insuranceExpiry, vehicle.inspectionExpiry, vehicle.registrationExpiry]
          .map(toTimestamp)
          .filter(Boolean)
          .filter((time) => {
            const diffDays = Math.round((time - Date.now()) / DAY_MS);
            return diffDays >= 0 && diffDays <= 30;
          });
        return expiring.length > 0;
      }).length;

      const inRangeFuel = fuelRecords.filter((record) => inPeriod(record.createdAt, range));
      const inRangeMaintenance = maintenanceRecords.filter((maintenance) =>
        inPeriod(maintenance.createdAt, range),
      );

      const monthFuelCost = roundTo(sum(inRangeFuel, 'totalCost'));
      const monthMaintenanceCost = roundTo(sum(inRangeMaintenance, 'actualCost'));

      return mockResponse({
        fleet,
        activeTrips,
        driversOnMission,
        pendingMaintenance,
        expiringDocuments,
        monthFuelCost,
        monthMaintenanceCost,
        totalMonthlyCost: monthFuelCost + monthMaintenanceCost,
      });
    }

    const { data } = await apiClient.get(API_ENDPOINTS.DASHBOARD.OVERVIEW, { params });
    return data;
  },

  /**
   * Statistiques de la flotte : répartition par groupe A→G et évolution
   * mensuelle de la taille du parc.
   * @param {{ companyId?: string, period?: string, dateFrom?: string, dateTo?: string }} [params]
   * @returns {Promise<object>}
   */
  async getFleetStatistics(params = {}) {
    const { companyId = '' } = params;

    if (apiConfig.mock) {
      const vehicles = byCompany(MOCK_VEHICLES, companyId);
      const byGroup = buildGroupStats(vehicles);

      const monthlyEvolution = lastMonths().map((month) => {
        const added = vehicles.filter((vehicle) => monthKey(vehicle.createdAt) === month).length;
        const total = vehicles.filter((vehicle) => monthKey(vehicle.createdAt) <= month).length;
        return { month, label: monthLabel(month), added, total };
      });

      return mockResponse({ byGroup, monthlyEvolution, total: vehicles.length });
    }

    const { data } = await apiClient.get(API_ENDPOINTS.DASHBOARD.FLEET, { params });
    return data;
  },

  /**
   * Statistiques carburant : coûts/volumes (mois + cumul), consommation
   * moyenne, coût moyen par véhicule et évolution mensuelle.
   * @param {{ companyId?: string, period?: string, dateFrom?: string, dateTo?: string }} [params]
   * @returns {Promise<object>}
   */
  async getFuelStatistics(params = {}) {
    const { companyId = '', period = DEFAULT_PERIOD, dateFrom = '', dateTo = '' } = params;
    const range = buildPeriodRange(period, dateFrom, dateTo);

    if (apiConfig.mock) {
      const records = byCompany(MOCK_FUEL_RECORDS, companyId);
      const inRange = records.filter((record) => inPeriod(record.createdAt, range));
      const validated = records.filter((record) => record.status === 'validated');

      const consumptions = validated
        .map((record) => toNumber(record.consumptionAverage))
        .filter((value) => value > 0);
      const averageConsumption = consumptions.length
        ? roundTo(consumptions.reduce((acc, value) => acc + value, 0) / consumptions.length, 1)
        : 0;

      const vehicleIds = [...new Set(records.map((record) => record.vehicleId))];
      const averageCostPerVehicle = vehicleIds.length
        ? roundTo(sum(records, 'totalCost') / vehicleIds.length)
        : 0;

      const monthlyEvolution = lastMonths().map((month) => {
        const items = records.filter((record) => monthKey(record.createdAt) === month);
        return {
          month,
          label: monthLabel(month),
          totalCost: roundTo(sum(items, 'totalCost')),
          quantity: roundTo(sum(items, 'quantity'), 1),
        };
      });

      return mockResponse({
        totalCost: roundTo(sum(records, 'totalCost')),
        totalQuantity: roundTo(sum(records, 'quantity'), 1),
        monthCost: roundTo(sum(inRange, 'totalCost')),
        monthQuantity: roundTo(sum(inRange, 'quantity'), 1),
        averageConsumption,
        averageCostPerVehicle,
        fuelCount: records.length,
        monthlyEvolution,
      });
    }

    const { data } = await apiClient.get(API_ENDPOINTS.DASHBOARD.FUEL, { params });
    return data;
  },

  /**
   * Statistiques entretiens : coûts (mois + cumul), compteurs par statut,
   * entretiens en retard / à venir et évolution mensuelle des coûts.
   * @param {{ companyId?: string, period?: string, dateFrom?: string, dateTo?: string }} [params]
   * @returns {Promise<object>}
   */
  async getMaintenanceStatistics(params = {}) {
    const { companyId = '', period = DEFAULT_PERIOD, dateFrom = '', dateTo = '' } = params;
    const range = buildPeriodRange(period, dateFrom, dateTo);

    if (apiConfig.mock) {
      const records = byCompany(MOCK_MAINTENANCE_RECORDS, companyId);
      const inRange = records.filter((maintenance) => inPeriod(maintenance.createdAt, range));

      const byStatus = Object.entries(MAINTENANCE_STATUSES)
        .map(([status, meta]) => ({
          status,
          label: meta.label,
          variant: meta.variant,
          count: records.filter((maintenance) => maintenance.status === status).length,
        }))
        .filter((item) => item.count > 0);

      const overdueCount = records.filter(isMaintenanceOverdue).length;
      const upcomingCount = records.filter(isMaintenanceUpcoming).length;

      const monthlyEvolution = lastMonths().map((month) => {
        const items = records.filter((maintenance) => monthKey(maintenance.createdAt) === month);
        return {
          month,
          label: monthLabel(month),
          totalCost: roundTo(sum(items, 'actualCost')),
          count: items.length,
        };
      });

      return mockResponse({
        totalCost: roundTo(sum(records, 'actualCost')),
        monthCost: roundTo(sum(inRange, 'actualCost')),
        maintenanceCount: records.length,
        completedCount: records.filter((maintenance) => maintenance.status === 'completed').length,
        pendingCount: records.filter((maintenance) => maintenance.status === 'pending').length,
        inProgressCount: records.filter((maintenance) => maintenance.status === 'in_progress').length,
        overdueCount,
        upcomingCount,
        byStatus,
        monthlyEvolution,
      });
    }

    const { data } = await apiClient.get(API_ENDPOINTS.DASHBOARD.MAINTENANCE, { params });
    return data;
  },

  /**
   * Statistiques financières : coûts mensuels par poste (carburant,
   * entretiens, autres), coût moyen par véhicule, coût par kilomètre et
   * évolution mensuelle.
   * @param {{ companyId?: string, period?: string, dateFrom?: string, dateTo?: string }} [params]
   * @returns {Promise<object>}
   */
  async getFinancialStatistics(params = {}) {
    const { companyId = '', period = DEFAULT_PERIOD, dateFrom = '', dateTo = '' } = params;
    const range = buildPeriodRange(period, dateFrom, dateTo);

    if (apiConfig.mock) {
      const vehicles = byCompany(MOCK_VEHICLES, companyId);
      const fuelRecords = byCompany(MOCK_FUEL_RECORDS, companyId);
      const maintenanceRecords = byCompany(MOCK_MAINTENANCE_RECORDS, companyId);
      const trips = byCompany(MOCK_TRIPS, companyId);

      const inRangeFuel = fuelRecords.filter((record) => inPeriod(record.createdAt, range));
      const inRangeMaintenance = maintenanceRecords.filter((maintenance) =>
        inPeriod(maintenance.createdAt, range),
      );
      const inRangeTrips = trips.filter((trip) => inPeriod(trip.arrivalDate, range));

      const monthFuel = roundTo(sum(inRangeFuel, 'totalCost'));
      const monthMaintenance = roundTo(sum(inRangeMaintenance, 'actualCost'));
      const monthOther = roundTo((monthFuel + monthMaintenance) * 0.12);
      const monthTotal = monthFuel + monthMaintenance + monthOther;

      const monthDistance = sum(inRangeTrips, 'actualDistance');
      const costPerKm = monthDistance > 0 ? roundTo(monthTotal / monthDistance, 1) : 0;

      const averageCostPerVehicle = vehicles.length
        ? roundTo(monthTotal / vehicles.length)
        : 0;

      const monthlyEvolution = lastMonths().map((month) => {
        const fuel = roundTo(
          sum(fuelRecords.filter((record) => monthKey(record.createdAt) === month), 'totalCost'),
        );
        const maintenance = roundTo(
          sum(
            maintenanceRecords.filter((item) => monthKey(item.createdAt) === month),
            'actualCost',
          ),
        );
        return {
          month,
          label: monthLabel(month),
          fuel,
          maintenance,
          total: fuel + maintenance + roundTo((fuel + maintenance) * 0.12),
        };
      });

      return mockResponse({
        monthTotal,
        monthFuel,
        monthMaintenance,
        monthOther,
        averageCostPerVehicle,
        costPerKm,
        byType: [
          { key: 'fuel', label: 'Carburant', icon: 'bi-fuel-pump', variant: 'info', amount: monthFuel },
          { key: 'maintenance', label: 'Entretiens', icon: 'bi-wrench-adjustable', variant: 'warning', amount: monthMaintenance },
          { key: 'other', label: 'Autres coûts', icon: 'bi-cash-coin', variant: 'secondary', amount: monthOther },
        ],
        monthlyEvolution,
      });
    }

    const { data } = await apiClient.get(API_ENDPOINTS.DASHBOARD.FINANCIAL, { params });
    return data;
  },

  /**
   * Alertes consolidées (entretiens, documents, véhicules, carburant),
   * triées par gravité puis par date.
   * @param {{ companyId?: string, period?: string, dateFrom?: string, dateTo?: string }} [params]
   * @returns {Promise<object>}
   */
  async getAlerts(params = {}) {
    const { companyId = '', period = DEFAULT_PERIOD, dateFrom = '', dateTo = '' } = params;
    const range = buildPeriodRange(period, dateFrom, dateTo);

    if (apiConfig.mock) {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      const items = byCompany(MOCK_DASHBOARD_ALERTS, companyId)
        .filter((alert) => inPeriod(alert.createdAt, range))
        .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity] || b.createdAt.localeCompare(a.createdAt))
        .slice(0, ALERT_LIMIT);

      return mockResponse({
        items,
        critical: items.filter((alert) => alert.severity === 'critical').length,
        warning: items.filter((alert) => alert.severity === 'warning').length,
        info: items.filter((alert) => alert.severity === 'info').length,
      });
    }

    const { data } = await apiClient.get(API_ENDPOINTS.DASHBOARD.ALERTS, { params });
    return data;
  },

  /**
   * Activité récente (trajets, carburant, entretiens, documents, véhicules),
   * triée par date décroissante.
   * @param {{ companyId?: string, period?: string, dateFrom?: string, dateTo?: string }} [params]
   * @returns {Promise<Array<object>>}
   */
  async getRecentActivities(params = {}) {
    const { companyId = '', period = DEFAULT_PERIOD, dateFrom = '', dateTo = '' } = params;
    const range = buildPeriodRange(period, dateFrom, dateTo);

    if (apiConfig.mock) {
      const items = byCompany(MOCK_DASHBOARD_ACTIVITIES, companyId)
        .filter((activity) => inPeriod(activity.createdAt, range))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, ACTIVITY_LIMIT);

      return mockResponse(items);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.DASHBOARD.ACTIVITIES, { params });
    return data;
  },

  /**
   * Top véhicules (distance parcourue) pour la période.
   * @param {{ companyId?: string, period?: string, dateFrom?: string, dateTo?: string }} [params]
   * @returns {Promise<Array<object>>}
   */
  async getTopVehicles(params = {}) {
    const { companyId = '' } = params;

    if (apiConfig.mock) {
      const items = byCompany(MOCK_DASHBOARD_TOP_VEHICLES, companyId)
        .slice()
        .sort((a, b) => b.distanceKm - a.distanceKm)
        .slice(0, TOP_LIMIT);

      return mockResponse(items);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.DASHBOARD.TOP_VEHICLES, { params });
    return data;
  },

  /**
   * Top chauffeurs (distance parcourue) pour la période.
   * @param {{ companyId?: string, period?: string, dateFrom?: string, dateTo?: string }} [params]
   * @returns {Promise<Array<object>>}
   */
  async getTopDrivers(params = {}) {
    const { companyId = '' } = params;

    if (apiConfig.mock) {
      const items = byCompany(MOCK_DASHBOARD_TOP_DRIVERS, companyId)
        .slice()
        .sort((a, b) => b.distanceKm - a.distanceKm)
        .slice(0, TOP_LIMIT);

      return mockResponse(items);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.DASHBOARD.TOP_DRIVERS, { params });
    return data;
  },
};
