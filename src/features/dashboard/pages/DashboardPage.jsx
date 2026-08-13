/**
 * Navix Dashboard — DashboardPage
 * --------------------------------------------------------------------------
 * Tableau de bord de gestion de flotte : filtres globaux (période /
 * entreprise), indicateurs clés (StatsCards), état de la flotte, répartition
 * par groupe, graphiques CSS (flotte, carburant, entretiens, coûts),
 * finances, alertes, activité récente, classements et tableau du parc.
 */
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Alert, Button, Card } from '@/components/ui';
import {
  PageContainer,
  PageHeader,
  StatsCards,
  LoadingState,
  ErrorState,
  EmptyState,
} from '@/components/core';
import { useDashboardStore } from '../store';
import { useDashboardData } from '../hooks';
import { NotificationCenter } from '@/features/notifications/components';
import { useNotificationsStore } from '@/features/notifications';
import { useCompaniesStore } from '@/features/companies';
import { getTenantScope } from '@/utils/tenantScope';
import {
  DashboardFilters,
  FleetOverviewCard,
  GroupStatsCard,
  FleetEvolutionChart,
  FuelTrendChart,
  MaintenanceTrendChart,
  CostBreakdownChart,
  FinancialOverview,
  DashboardAlerts,
  DashboardAuditActivity,
  RecentActivityList,
  TopVehicles,
  TopDrivers,
  VehicleStatusTable,
} from '../components';
import { QUICK_ACTIONS, formatDashboardMoney } from '../constants';

const DashboardPage = () => {
  const navigate = useNavigate();

  const setFilter = useDashboardStore((state) => state.setFilter);
  const resetFilters = useDashboardStore((state) => state.resetFilters);
  const clearError = useDashboardStore((state) => state.clearError);

  const fetchNotifications = useNotificationsStore((state) => state.fetchNotifications);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  useEffect(() => {
    fetchNotifications();
    fetchCompanies();
  }, [fetchNotifications, fetchCompanies]);

  /* Multi-tenant : hors super_admin, le filtre entreprise est verrouillé sur
     l'entreprise courante (les données sont de toute façon bornées au store). */
  useEffect(() => {
    const { isSuperAdmin, companyId } = getTenantScope();
    if (!isSuperAdmin && companyId) {
      setFilter('companyId', companyId);
    }
  }, [setFilter]);

  const {
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
    vehicles,
    metrics,
    hasActiveFilters,
    isLoading,
    error,
    refetch,
  } = useDashboardData();

  const initialLoading = isLoading && !overview;

  const quickActions = useMemo(
    () =>
      QUICK_ACTIONS.map((action) => (
        <Button
          key={action.key}
          variant="outline"
          size="sm"
          icon={action.icon}
          onClick={() => navigate(action.to)}
        >
          {action.label}
        </Button>
      )),
    [navigate],
  );

  return (
    <PageContainer>
      <Helmet>
        <title>Tableau de bord — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Tableau de bord"
        subtitle="Vue d’ensemble de votre flotte : véhicules, carburant, entretiens et coûts."
        icon="bi-speedometer2"
        breadcrumbs={[{ label: 'Dashboard' }]}
        actions={
          <div className="d-flex flex-wrap gap-2">
            <Button variant="outline" size="sm" icon="bi-arrow-clockwise" onClick={refetch}>
              Actualiser
            </Button>
          </div>
        }
      />

      <div className="mb-3">
        <DashboardFilters
          filters={filters}
          onChange={(key, value) => setFilter(key, value)}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">{quickActions}</div>

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      {initialLoading ? (
        <LoadingState variant="cards" rows={4} label="Chargement du tableau de bord…" />
      ) : overview ? (
        <>
          <StatsCards stats={metrics} loading={isLoading} />

          <div className="row g-3 mt-1">
            <div className="col-lg-4">
              <FleetOverviewCard fleet={overview.fleet} />
            </div>
            <div className="col-lg-8">
              <GroupStatsCard byGroup={fleetStatistics?.byGroup ?? []} />
            </div>
          </div>

          <div className="row g-3">
            <div className="col-lg-6">
              <Card title={<span><i className="bi bi-truck me-2" aria-hidden="true" />Évolution du parc</span>}>
                <FleetEvolutionChart data={fleetStatistics?.monthlyEvolution ?? []} />
              </Card>
            </div>
            <div className="col-lg-6">
              <Card title={<span><i className="bi bi-fuel-pump me-2" aria-hidden="true" />Coût carburant mensuel</span>}>
                <FuelTrendChart
                  data={fuelStatistics?.monthlyEvolution ?? []}
                  formatValue={(value) => formatDashboardMoney(value)}
                />
              </Card>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-lg-6">
              <Card title={<span><i className="bi bi-wrench-adjustable me-2" aria-hidden="true" />Coût entretiens mensuel</span>}>
                <MaintenanceTrendChart
                  data={maintenanceStatistics?.monthlyEvolution ?? []}
                  formatValue={(value) => formatDashboardMoney(value)}
                />
              </Card>
            </div>
            <div className="col-lg-6">
              <Card title={<span><i className="bi bi-bar-chart-line me-2" aria-hidden="true" />Coûts mensuels (carburant + entretiens)</span>}>
                <CostBreakdownChart
                  data={financialStatistics?.monthlyEvolution ?? []}
                  formatValue={(value) => formatDashboardMoney(value)}
                />
              </Card>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-xl-4">
              <FinancialOverview financial={financialStatistics} />
            </div>
            <div className="col-xl-8">
              <DashboardAlerts alerts={alerts} />
            </div>
          </div>

          <div className="row g-3">
            <div className="col-lg-5">
              <Card
                className="h-100"
                flush
                title={
                  <span>
                    <i className="bi bi-bell me-2" aria-hidden="true" />
                    Centre de notifications
                  </span>
                }
              >
                <NotificationCenter limit={6} />
              </Card>
            </div>
            <div className="col-lg-7">
              <DashboardAuditActivity />
            </div>
          </div>

          <div className="row g-3">
            <div className="col-xl-4">
              <TopVehicles vehicles={topVehicles} />
            </div>
            <div className="col-xl-4">
              <TopDrivers drivers={topDrivers} />
            </div>
            <div className="col-xl-4">
              <RecentActivityList activities={recentActivities} />
            </div>
          </div>

          {vehicles.length === 0 && !isLoading ? (
            <Card className="mt-3">
              <EmptyState
                icon="bi-truck"
                title="Aucun véhicule"
                description="La flotte est vide ou aucun véhicule ne correspond aux filtres sélectionnés."
              />
            </Card>
          ) : (
            <div className="mt-3">
              <VehicleStatusTable vehicles={vehicles} loading={isLoading} />
            </div>
          )}
        </>
      ) : (
        <ErrorState
          title="Impossible de charger le tableau de bord"
          description="Les données sont temporairement indisponibles. Réessayez dans quelques instants."
          retry={refetch}
        />
      )}
    </PageContainer>
  );
};

export default DashboardPage;
