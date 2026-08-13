/**
 * Navix Dashboard — useDashboardData
 * --------------------------------------------------------------------------
 * Hook de données du tableau de bord : charge toutes les sections via le
 * store à chaque changement de filtre (entreprise / période) et expose les
 * cartes KPI prêtes pour `StatsCards` ainsi que les dérivés d'affichage.
 *
 * Retourne : état du store (overview, fleet, fuel, maintenance, financial,
 * alerts, activities, tops), `metrics` (descripteurs KPI), `hasActiveFilters`
 * et `refetch`.
 */
import { useEffect, useMemo } from 'react';
import { useDashboardStore } from '../store';
import { useVehiclesStore } from '@/features/vehicles';
import { getTenantScopeCompanyId } from '@/utils/tenantScope';
import { formatDashboardMoney, formatDashboardRate } from '../constants';

const useDashboardData = () => {
  const filters = useDashboardStore((state) => state.filters);
  const overview = useDashboardStore((state) => state.overview);
  const fleetStatistics = useDashboardStore((state) => state.fleetStatistics);
  const fuelStatistics = useDashboardStore((state) => state.fuelStatistics);
  const maintenanceStatistics = useDashboardStore((state) => state.maintenanceStatistics);
  const financialStatistics = useDashboardStore((state) => state.financialStatistics);
  const alerts = useDashboardStore((state) => state.alerts);
  const recentActivities = useDashboardStore((state) => state.recentActivities);
  const topVehicles = useDashboardStore((state) => state.topVehicles);
  const topDrivers = useDashboardStore((state) => state.topDrivers);
  const isLoading = useDashboardStore((state) => state.isLoading);
  const error = useDashboardStore((state) => state.error);
  const fetchAll = useDashboardStore((state) => state.fetchAll);

  const vehicles = useVehiclesStore((state) => state.vehicles);
  const fetchVehicles = useVehiclesStore((state) => state.fetchVehicles);

  useEffect(() => {
    fetchAll();
  }, [filters.companyId, filters.period, filters.dateFrom, filters.dateTo, fetchAll]);

  useEffect(() => {
    if (vehicles.length === 0) {
      fetchVehicles();
    }
  }, [vehicles.length, fetchVehicles]);

  const visibleVehicles = useMemo(() => {
    const scopeCompanyId = getTenantScopeCompanyId();
    const companyId = scopeCompanyId || filters.companyId;
    return companyId ? vehicles.filter((vehicle) => vehicle.companyId === companyId) : vehicles;
  }, [vehicles, filters.companyId]);

  const metrics = useMemo(() => {
    if (!overview || !financialStatistics) return [];

    const { fleet } = overview;

    return [
      {
        key: 'total',
        label: 'Véhicules',
        value: fleet.total,
        icon: 'bi-truck',
        variant: 'primary',
        variation: `${fleet.available} disponibles`,
        trend: 'neutral',
        trendLabel: 'flotte totale',
      },
      {
        key: 'inUse',
        label: 'En mission',
        value: fleet.inUse,
        icon: 'bi-play-circle',
        variant: 'info',
        variation: formatDashboardRate(fleet.utilizationRate),
        trend: 'up',
        trendLabel: 'taux d’utilisation',
      },
      {
        key: 'maintenance',
        label: 'En maintenance',
        value: fleet.maintenance,
        icon: 'bi-wrench-adjustable',
        variant: 'warning',
        variation: `${maintenanceStatistics?.inProgressCount ?? 0} en cours`,
        trend: 'neutral',
        trendLabel: 'entretiens en cours',
      },
      {
        key: 'outOfService',
        label: 'Hors service',
        value: fleet.outOfService,
        icon: 'bi-slash-circle',
        variant: 'danger',
        variation: formatDashboardRate(100 - fleet.availabilityRate),
        trend: 'down',
        trendLabel: 'part du parc indisponible',
      },
      {
        key: 'monthTotal',
        label: 'Coût du mois',
        value: formatDashboardMoney(financialStatistics.monthTotal),
        icon: 'bi-cash-stack',
        variant: 'success',
        variation: `${Math.round(
          (financialStatistics.monthFuel / Math.max(financialStatistics.monthTotal, 1)) * 100,
        )} % carburant`,
        trend: 'neutral',
        trendLabel: 'part du carburant dans le coût total',
      },
      {
        key: 'monthFuel',
        label: 'Carburant',
        value: formatDashboardMoney(financialStatistics.monthFuel),
        icon: 'bi-fuel-pump',
        variant: 'info',
        variation: formatDashboardMoney(fuelStatistics?.monthQuantity ?? 0, 'L'),
        trend: 'neutral',
        trendLabel: 'volume du mois',
      },
      {
        key: 'monthMaintenance',
        label: 'Entretiens',
        value: formatDashboardMoney(financialStatistics.monthMaintenance),
        icon: 'bi-wrench-adjustable',
        variant: 'warning',
        variation: `${maintenanceStatistics?.completedCount ?? 0} terminés`,
        trend: 'neutral',
        trendLabel: 'entretiens terminés',
      },
      {
        key: 'expiring',
        label: 'Documents expirant',
        value: overview.expiringDocuments,
        icon: 'bi-file-earmark-excel',
        variant: 'danger',
        variation: `${overview.pendingMaintenance} entretiens à suivre`,
        trend: 'neutral',
        trendLabel: 'documents à renouveler sous 30 jours',
      },
    ];
  }, [overview, financialStatistics, fuelStatistics, maintenanceStatistics]);

  const hasActiveFilters = Boolean(
    filters.companyId || filters.period !== 'month' || filters.dateFrom || filters.dateTo,
  );

  return {
    filters,
    overview,
    fleetStatistics,
    fuelStatistics,
    maintenanceStatistics,
    financialStatistics,
    alerts,
    recentActivities,
    topVehicles,
    topDrivers,
    vehicles: visibleVehicles,
    metrics,
    hasActiveFilters,
    isLoading,
    error,
    refetch: fetchAll,
  };
};

export default useDashboardData;
