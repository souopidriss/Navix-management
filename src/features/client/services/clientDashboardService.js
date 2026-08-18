/**
 * Navix Client — Service Dashboard Premium
 * --------------------------------------------------------------------------
 * Fournit les données du Dashboard Client (Entreprise / Particulier).
 * Architecture DATA / LOGIC / UI strictement séparée.
 * Remplaçable par une vraie API sans toucher aux composants UI.
 *
 * PROMPT 055 — Dashboard Client Premium :
 *   flotte (état + répartition), activité trajets (7 jours, en cours,
 *   prochains), maintenance, carburant, alertes, résumé financier (FCFA)
 *   et activités récentes. Données strictement limitées à l'entreprise du
 *   client connecté (multi-tenant via companyId).
 */
import { mockResponse } from '@/services/utils';
import {
  MOCK_CLIENT_ENTERPRISE,
  MOCK_CLIENT_INDIVIDUAL,
} from '../mocks/client.mock';
import {
  MOCK_CLIENT_DASHBOARD_METRICS_INDIVIDUAL,
  MOCK_CLIENT_FLEET_CATEGORIES,
  MOCK_CLIENT_TRIPS_WEEKLY,
  MOCK_CLIENT_MAINTENANCE,
  MOCK_CLIENT_MONTHLY_EVOLUTION,
  MOCK_CLIENT_FINANCIAL_DATA,
  MOCK_CLIENT_FINANCE_SUMMARY,
  MOCK_CLIENT_ALERTS,
  MOCK_CLIENT_ACTIVITIES,
  MOCK_CLIENT_FUEL_DATA,
  CLIENT_QUICK_ACTIONS,
  CLIENT_QUICK_ACTIONS_INDIVIDUAL,
} from '../mocks/clientDashboard.mock';
import { CLIENT_TYPES } from '../constants/client.constants';
import { getVehiclesCache } from './clientVehicleService';
import { getDriversCache, getAssignmentsCache, getTripsCache } from './clientOperationsData';
import { getMaintenanceRecordsCache } from './clientMaintenanceService';
import { getFuelRecordsCache } from './clientFuelService';
import { getDocumentRecordsCache } from './clientDocumentService';
import { getNotificationRecordsCache } from './clientNotificationService';
import { getWalletRecordsCache, getTransactionRecordsCache } from './clientFinanceService';
import { transactionDirectionOf, isTransactionEffective } from '../constants/client.constants';
import { MAINTENANCE_TYPES, MAINTENANCE_FINISHED_STATUSES, MAINTENANCE_ALERT } from '@/features/maintenance/constants';

const TEC_COMPANY_ID = '01J8A2B3C4D5E6F7G8H9J0K1L2';

const roundTo = (value, digits = 1) => {
  const factor = 10 ** digits;
  return Math.round(Number(value) * factor) / factor;
};

const toDays = (value) => {
  if (!value) return null;
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return Math.floor((date.getTime() - Date.now()) / 86400000);
};

/** Catégorie d'alerte (dashboard) dérivée du type de ressource de la notification. */
const notificationAlertCategory = (type) => {
  if (type === 'maintenance' || type === 'vehicle') return 'maintenance';
  if (type === 'document' || type === 'driver') return 'documents';
  if (type === 'fuel') return 'fuel';
  if (type === 'trip' || type === 'assignment' || type === 'incident') return 'trips';
  return 'Général';
};

/**
 * Construit les alertes du dashboard depuis les notifications actives
 * (sévérité critical → URGENT, high/medium → ATTENTION, low → INFO).
 */
const buildLiveAlerts = (notifications) => {
  const items = notifications
    .filter((notification) => !notification.archived)
    .map((notification) => ({
      id: notification.id,
      type: notification.kind,
      category: notificationAlertCategory(notification.type),
      severity:
        notification.severity === 'critical'
          ? 'critical'
          : notification.severity === 'high' || notification.severity === 'medium'
            ? 'warning'
            : 'info',
      entityType: notification.resourceType || null,
      entityId: notification.resourceId || null,
      title: notification.title,
      description: notification.message,
      createdAt: notification.createdAt,
    }))
    .slice(0, 8);

  return {
    critical: items.filter((item) => item.severity === 'critical').length,
    warning: items.filter((item) => item.severity === 'warning').length,
    info: items.filter((item) => item.severity === 'info').length,
    items,
  };
};

/** Synthèse carburant (coûts FCFA, volumes et tendance du mois). */
const buildLiveFuel = (records, now = new Date()) => {
  const sum = (items, field) => items.reduce((total, item) => total + Number(item[field] || 0), 0);
  const validated = records.filter((record) => record.status === 'validated');
  const monthKey = (value) => (value ? String(value).slice(0, 7) : '');
  const currentKey = monthKey(now.toISOString());
  const previousDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousKey = monthKey(previousDate.toISOString());

  const current = validated.filter((record) => monthKey(record.createdAt) === currentKey);
  const previous = validated.filter((record) => monthKey(record.createdAt) === previousKey);
  const monthCost = sum(current, 'totalCost');
  const previousCost = sum(previous, 'totalCost');
  const trend = previousCost > 0 ? roundTo(((monthCost - previousCost) / previousCost) * 100, 1) : 0;

  return {
    totalQuantity: roundTo(sum(validated, 'quantity'), 0),
    averageConsumption: validated.length
      ? roundTo(validated.reduce((total, record) => total + Number(record.consumptionAverage || 0), 0) / validated.length, 1)
      : 0,
    totalCost: sum(validated, 'totalCost'),
    monthQuantity: roundTo(sum(current, 'quantity'), 0),
    monthCost,
    trend,
    trendVariant: trend <= 0 ? 'success' : 'danger',
  };
};

/** Synthèse maintenance (prochain entretien + compteurs de suivi). */
const buildLiveMaintenance = (records, vehiclesById, now = new Date()) => {
  const active = records.filter((record) => !MAINTENANCE_FINISHED_STATUSES.includes(record.status));
  const todayKey = now.toISOString().slice(0, 10);

  const overdue = active.filter(
    (record) => record.scheduledDate && String(record.scheduledDate).slice(0, 10) < todayKey,
  ).length;

  let statusCounts = { ok: 0, watch: 0, urgent: 0 };
  active.forEach((record) => {
    const days = toDays(record.nextMaintenanceDate);
    const isUrgent =
      record.status === 'in_progress' ||
      record.priority === 'urgent' ||
      (record.scheduledDate && String(record.scheduledDate).slice(0, 10) < todayKey);
    const isWatch =
      (days !== null && days <= MAINTENANCE_ALERT.nextMaintenanceWithinDays) || record.priority === 'high';
    if (isUrgent) statusCounts.urgent += 1;
    else if (isWatch) statusCounts.watch += 1;
    else statusCounts.ok += 1;
  });

  const nextRecord = [...active]
    .filter((record) => record.status !== 'in_progress')
    .sort((a, b) => String(a.scheduledDate).localeCompare(String(b.scheduledDate)))[0] || active[0] || null;

  let nextService = null;
  if (nextRecord) {
    const vehicle = vehiclesById.get(nextRecord.vehicleId);
    const currentMileage = Number(vehicle?.mileage) || Number(nextRecord.mileage) || 0;
    const nextMileage = Number(nextRecord.nextMileage) || 0;
    nextService = {
      vehicle: vehicle ? `${vehicle.brand} ${vehicle.model}` : nextRecord.vehicleId,
      registrationNumber: vehicle?.registrationNumber || '—',
      type: MAINTENANCE_TYPES[nextRecord.maintenanceType]?.label || nextRecord.maintenanceType || 'Entretien',
      remainingKm: Math.max(0, nextMileage - currentMileage),
      intervalKm: Math.max(1, nextMileage - (Number(nextRecord.mileage) || 0) || nextMileage),
    };
  }

  return {
    nextService,
    statusCounts,
    upcoming: active.length,
    overdue,
  };
};

/**
 * Synthèse financière en direct depuis les caches partagés du module Finance
 * (wallet + transactions FCFA) — reflète les dernières opérations créées.
 */
const buildLiveFinance = (now = new Date()) => {
  const wallet = getWalletRecordsCache();
  const transactions = getTransactionRecordsCache().filter((item) => item.companyId === TEC_COMPANY_ID);
  const effective = transactions.filter(isTransactionEffective);
  const currentKey = now.toISOString().slice(0, 7);
  const monthItems = effective.filter((item) => String(item.createdAt || '').slice(0, 7) === currentKey);

  const incomeMonth = monthItems
    .filter((item) => transactionDirectionOf(item) === 'in')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const expenseMonth = monthItems
    .filter((item) => transactionDirectionOf(item) === 'out')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return {
    balance: Number(wallet.balance) || 0,
    incomeMonth,
    expenseMonth,
    currency: 'XAF',
    transactionsCount: transactions.length,
    transactionsMonth: monthItems.length,
    variationMonth: incomeMonth - expenseMonth,
  };
};

/**
 * Agrège les métriques Opérations en direct depuis les caches partagés
 * (CRUD chauffeurs / affectations / trajets / véhicules) pour refléter
 * les dernières actions de l'utilisateur sur le Dashboard.
 */
const buildLiveMetrics = () => {  const vehicles = getVehiclesCache().filter((vehicle) => vehicle.companyId === TEC_COMPANY_ID);
  const drivers = getDriversCache().filter((driver) => driver.companyId === TEC_COMPANY_ID);
  const assignments = getAssignmentsCache().filter((assignment) => assignment.companyId === TEC_COMPANY_ID);
  const trips = getTripsCache().filter((trip) => trip.companyId === TEC_COMPANY_ID);
  const maintenance = getMaintenanceRecordsCache().filter((record) => record.companyId === TEC_COMPANY_ID);
  const fuel = getFuelRecordsCache().filter((record) => record.companyId === TEC_COMPANY_ID);
  const documents = getDocumentRecordsCache().filter((document) => document.companyId === TEC_COMPANY_ID);
  const notifications = getNotificationRecordsCache().filter((notification) => notification.companyId === TEC_COMPANY_ID);

  const counts = vehicles.reduce(
    (acc, vehicle) => {
      acc[vehicle.status] = (acc[vehicle.status] ?? 0) + 1;
      return acc;
    },
    { total: 0, in_use: 0, available: 0, maintenance: 0, out_of_service: 0 },
  );
  counts.total = vehicles.length;

  const activeDrivers = drivers.filter(
    (driver) => driver.status === 'active' || driver.status === 'on_mission' || driver.availability === 'busy',
  ).length;
  const onGoingTrips = trips.filter((trip) => trip.status === 'in_progress').length;
  const monthTrips = trips.length;

  const availabilityRate = counts.total
    ? Math.round(((counts.available + counts.in_use) / counts.total) * 100)
    : 0;
  const utilizationRate = counts.total ? Math.round((counts.in_use / counts.total) * 100) : 0;

  const vehiclesById = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));

  const maintenanceData = buildLiveMaintenance(maintenance, vehiclesById);
  const fuelData = buildLiveFuel(fuel);
  const alerts = buildLiveAlerts(notifications);

  const upcomingMaintenanceCount = maintenance.filter(
    (record) => !MAINTENANCE_FINISHED_STATUSES.includes(record.status),
  ).length;
  const monthFuelCost = fuelData.monthCost;
  const expiringDocuments = documents.filter(
    (document) => {
      const days = toDays(document.expiryDate);
      return days !== null && days >= 0 && days <= 30;
    },
  ).length;
  const unreadNotifications = notifications.filter((notification) => !notification.isRead).length;

  const recentActivities = notifications
    .slice(0, 6)
    .map((notification) => ({
      id: notification.id,
      type: notification.kind,
      title: notification.title,
      description: notification.message,
      createdAt: notification.createdAt,
    }));

  return {
    fleetStatus: {
      total: counts.total,
      in_use: counts.in_use,
      available: counts.available,
      maintenance: counts.maintenance,
      out_of_service: counts.out_of_service,
      availabilityRate,
      utilizationRate,
    },
    metrics: [
      {
        key: 'total_vehicles',
        label: 'Total véhicules',
        value: counts.total,
        trend: +8.5,
        trendLabel: '↑ 8.5% vs mois dernier',
        icon: 'bi-truck',
        variant: 'primary',
      },
      {
        key: 'vehicles_in_use',
        label: 'En circulation',
        value: counts.in_use,
        trend: +3,
        trendLabel: '↑ 3 vs mois dernier',
        icon: 'bi-play-circle',
        variant: 'info',
      },
      {
        key: 'vehicles_available',
        label: 'Disponibles',
        value: counts.available,
        trend: -2,
        trendLabel: '↓ 2 vs mois dernier',
        icon: 'bi-check-circle',
        variant: 'success',
      },
      {
        key: 'active_drivers',
        label: 'Chauffeurs actifs',
        value: activeDrivers,
        trend: +1,
        trendLabel: '↑ 1 ce mois-ci',
        icon: 'bi-person-badge',
        variant: 'warning',
      },
    ],
    metricsSecondary: [
      {
        key: 'trips_month',
        label: 'Trajets du mois',
        value: monthTrips,
        trend: +12.7,
        trendLabel: '↑ 12.7%',
        icon: 'bi-signpost-split',
        variant: 'info',
      },
      {
        key: 'trips_ongoing',
        label: 'Trajets en cours',
        value: onGoingTrips,
        trend: 0,
        trendLabel: 'En temps réel',
        icon: 'bi-play-circle',
        variant: 'primary',
      },
      {
        key: 'active_assignments',
        label: 'Affectations actives',
        value: assignments.filter((assignment) => assignment.status === 'active').length,
        trend: 0,
        trendLabel: 'En temps réel',
        icon: 'bi-shuffle',
        variant: 'success',
      },
      {
        key: 'fleet_availability',
        label: 'Disponibilité flotte',
        value: `${availabilityRate} %`,
        trend: 0,
        trendLabel: 'En temps réel',
        icon: 'bi-graph-up-arrow',
        variant: 'warning',
      },
    ],
    tripsOngoing: trips
      .filter((trip) => trip.status === 'in_progress')
      .slice(0, 6)
      .map((trip) => {
        const vehicle = getVehiclesCache().find((item) => item.id === trip.vehicleId);
        const driver = getDriversCache().find((item) => item.id === trip.driverId);
        return {
          id: trip.id,
          driver: driver?.fullName || '—',
          vehicle: vehicle ? `${vehicle.brand} ${vehicle.model}` : '—',
          registrationNumber: vehicle?.registrationNumber || '—',
          departure: trip.departureLocation || '—',
          destination: trip.arrivalLocation || '—',
          departureTime: trip.departureTime || '—',
          status: trip.status,
        };
      }),
    upcomingTrips: trips
      .filter((trip) => trip.status === 'planned')
      .slice(0, 6)
      .map((trip) => {
        const vehicle = getVehiclesCache().find((item) => item.id === trip.vehicleId);
        const driver = getDriversCache().find((item) => item.id === trip.driverId);
        return {
          id: trip.id,
          driver: driver?.fullName || '—',
          vehicle: vehicle ? `${vehicle.brand} ${vehicle.model}` : '—',
          registrationNumber: vehicle?.registrationNumber || '—',
          departure: trip.departureLocation || '—',
          destination: trip.arrivalLocation || '—',
          departureTime: trip.departureTime || '—',
          status: 'scheduled',
        };
      }),
    topVehicles: [...vehicles]
      .sort((a, b) => (Number(b.mileage) || 0) - (Number(a.mileage) || 0))
      .slice(0, 5)
      .map((vehicle) => ({
        id: vehicle.id,
        registrationNumber: vehicle.registrationNumber,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        mileage: Number(vehicle.mileage) || 0,
        group: vehicle.group,
        status: vehicle.status,
        location: vehicle.location || '—',
        trips: trips.filter((trip) => trip.vehicleId === vehicle.id).length,
        insuranceExpiry: vehicle.insuranceExpiry || '',
        inspectionExpiry: vehicle.inspectionExpiry || '',
        registrationExpiry: vehicle.registrationExpiry || '',
      })),
    maintenance: maintenanceData,
    fuelData,
    alerts,
    recentActivities,
    maintenanceCount: upcomingMaintenanceCount,
    monthFuelCost,
    expiringDocuments,
    unreadNotifications,
    financeSummary: buildLiveFinance(),
  };
};

export const clientDashboardService = {
  /**
   * Récupère toutes les données nécessaires au Dashboard Client.
   * Les métriques opérationnelles (flotte, équipe, trajets) sont calculées
   * en direct depuis les caches partagés pour refléter les actions CRUD.
   * @param {string} clientType - 'enterprise' | 'individual'
   * @returns {Promise<Object>}
   */
  async getDashboardData(clientType = CLIENT_TYPES.ENTERPRISE) {
    const isEnterprise = clientType === CLIENT_TYPES.ENTERPRISE;

    const client = isEnterprise ? MOCK_CLIENT_ENTERPRISE : MOCK_CLIENT_INDIVIDUAL;
    const quickActions = isEnterprise ? CLIENT_QUICK_ACTIONS : CLIENT_QUICK_ACTIONS_INDIVIDUAL;

    const live = isEnterprise ? buildLiveMetrics() : null;

    return mockResponse(
      {
        companyId: client.companyId || null,
        client,
        clientType,
        metrics: live ? live.metrics : MOCK_CLIENT_DASHBOARD_METRICS_INDIVIDUAL,
        metricsSecondary: live ? live.metricsSecondary : [],
        monthlyEvolution: MOCK_CLIENT_MONTHLY_EVOLUTION,
        financialData: MOCK_CLIENT_FINANCIAL_DATA,
        vehicles: live ? live.topVehicles : [],
        fleetStatus: live ? live.fleetStatus : null,
        fleetCategories: isEnterprise ? MOCK_CLIENT_FLEET_CATEGORIES : [],
        tripsWeekly: isEnterprise ? MOCK_CLIENT_TRIPS_WEEKLY : [],
        tripsOngoing: live ? live.tripsOngoing : [],
        upcomingTrips: live ? live.upcomingTrips : [],
        maintenance: live ? live.maintenance : (isEnterprise ? MOCK_CLIENT_MAINTENANCE : null),
        alerts: live ? live.alerts : (isEnterprise ? MOCK_CLIENT_ALERTS : { critical: 0, warning: 0, info: 0, items: [] }),
        recentActivities: live ? live.recentActivities : MOCK_CLIENT_ACTIVITIES,
        fuelData: live ? live.fuelData : (isEnterprise ? MOCK_CLIENT_FUEL_DATA : null),
        financeSummary: isEnterprise ? (live ? live.financeSummary : MOCK_CLIENT_FINANCE_SUMMARY) : null,
        quickActions,
      },
      { latency: 400 },
    );
  },
};
