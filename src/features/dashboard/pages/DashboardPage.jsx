/**
 * Navix Dashboard — DashboardPage (DASHBOARD MASTER)
 * --------------------------------------------------------------------------
 * Tableau de bord Master de la plateforme NAVIX MANAGEMENT.
 * Design SaaS haut de gamme, filtres globaux (période / entreprise),
 * indicateurs KPI avec tendance, graphique d'évolution mensuelle (Area SVG),
 * graphique de répartition des dépenses par catégorie (Donut SVG),
 * carte de consommation de carburant avec jauge d'efficience,
 * section d'alertes importantes hiérarchisées, tableau du parc automobile,
 * et fil d'activités récentes en temps réel.
 */
import { useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import useAuthStore from '@/features/auth/store/auth.store';
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
  CostAreaChart,
  CategoryCostDonutChart,
  FuelConsumptionCard,
  DashboardAlerts,
  DashboardAuditActivity,
  RecentActivityList,
  VehicleStatusTable,
} from '../components';
import { QUICK_ACTIONS } from '../constants';

const DashboardPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const userName = user?.name || user?.fullName || user?.email?.split('@')[0] || 'Administrateur';

  const setFilter = useDashboardStore((state) => state.setFilter);
  const resetFilters = useDashboardStore((state) => state.resetFilters);
  const clearError = useDashboardStore((state) => state.clearError);

  const fetchNotifications = useNotificationsStore((state) => state.fetchNotifications);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  useEffect(() => {
    fetchNotifications();
    fetchCompanies();
  }, [fetchNotifications, fetchCompanies]);

  /* Multi-tenant : hors super_admin, le filtre entreprise est verrouillé sur l'entreprise courante. */
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
    financialStatistics,
    alerts,
    recentActivities,
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

  const handleExport = () => {
    window.print();
  };

  return (
    <PageContainer>
      <Helmet>
        <title>Dashboard Master — Navix Management</title>
      </Helmet>

      {/* Header Principal */}
      <PageHeader
        title="Dashboard Master"
        subtitle={`Bienvenue, ${userName} ! Aperçu en temps réel de la performance de votre flotte automobile.`}
        icon="bi-speedometer2"
        breadcrumbs={[{ label: 'Dashboard' }]}
        actions={
          <div className="d-flex flex-wrap gap-2">
            <Button variant="outline" size="sm" icon="bi-download" onClick={handleExport}>
              Exporter
            </Button>

            <Button variant="primary" size="sm" icon="bi-arrow-clockwise" onClick={refetch}>
              Actualiser
            </Button>
          </div>
        }
      />

      {/* Barre de filtres globaux */}
      <div className="mb-3">
        <DashboardFilters
          filters={filters}
          onChange={(key, value) => setFilter(key, value)}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {/* Actions rapides */}
      <div className="d-flex flex-wrap gap-2 mb-4">{quickActions}</div>

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-4">
          {error}
        </Alert>
      )}

      {initialLoading ? (
        <LoadingState variant="cards" rows={4} label="Chargement du Dashboard Master…" />
      ) : overview ? (
        <>
          {/* Rangée de KPI Master */}
          <div className="mb-4">
            <StatsCards stats={metrics} loading={isLoading} />
          </div>

          {/* Section 1 : Analytics Financières & Graphiques Master */}
          <div className="row g-3 mb-4">
            <div className="col-xl-7 col-lg-6">
              <Card
                className="h-100"
                title={
                  <span className="d-flex align-items-center gap-2">
                    <i className="bi bi-graph-up-arrow text-primary" aria-hidden="true" />
                    <span>Évolution des dépenses (6 derniers mois)</span>
                  </span>
                }
              >
                <CostAreaChart data={financialStatistics?.monthlyEvolution ?? []} />
              </Card>
            </div>

            <div className="col-xl-5 col-lg-6">
              <Card
                className="h-100"
                title={
                  <span className="d-flex align-items-center gap-2">
                    <i className="bi bi-pie-chart text-accent" aria-hidden="true" />
                    <span>Dépenses par catégorie</span>
                  </span>
                }
              >
                <CategoryCostDonutChart financialData={financialStatistics} />
              </Card>
            </div>
          </div>

          {/* Section 2 : Consommation Carburant & Alertes Importantes */}
          <div className="row g-3 mb-4">
            <div className="col-xl-5 col-lg-6">
              <FuelConsumptionCard fuelData={fuelStatistics} />
            </div>

            <div className="col-xl-7 col-lg-6">
              <DashboardAlerts alerts={alerts} />
            </div>
          </div>

          {/* Section 3 : Structure du parc & Évolution */}
          <div className="row g-3 mb-4">
            <div className="col-lg-4">
              <FleetOverviewCard fleet={overview.fleet} />
            </div>
            <div className="col-lg-8">
              <GroupStatsCard byGroup={fleetStatistics?.byGroup ?? []} />
            </div>
          </div>

          {/* Section 4 : Évolution Flotte & Activité Récente */}
          <div className="row g-3 mb-4">
            <div className="col-lg-6">
              <Card
                title={
                  <span>
                    <i className="bi bi-truck me-2 text-primary" aria-hidden="true" />
                    Évolution de la taille du parc
                  </span>
                }
              >
                <FleetEvolutionChart data={fleetStatistics?.monthlyEvolution ?? []} />
              </Card>
            </div>
            <div className="col-lg-6">
              <RecentActivityList activities={recentActivities} />
            </div>
          </div>

          {/* Section 5 : Journal d'Audit & Centre de Notifications */}
          <div className="row g-3 mb-4">
            <div className="col-lg-5">
              <Card
                className="h-100"
                flush
                title={
                  <span>
                    <i className="bi bi-bell me-2 text-warning" aria-hidden="true" />
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

          {/* Section 6 : Tableau Véhicules Master */}
          {vehicles.length === 0 && !isLoading ? (
            <Card className="mt-3">
              <EmptyState
                icon="bi-truck"
                title="Aucun véhicule"
                description="La flotte est vide ou aucun véhicule ne correspond aux filtres sélectionnés."
              />
            </Card>
          ) : (
            <Card
              className="mt-3"
              title={
                <div className="d-flex align-items-center justify-content-between w-100">
                  <span className="d-flex align-items-center gap-2">
                    <i className="bi bi-shield-shaded text-primary" aria-hidden="true" />
                    <span>Véhicules les plus utilisés</span>
                  </span>
                  <Link to="/dashboard/vehicles" className="btn btn-sm btn-outline-primary">
                    Voir tous les véhicules
                    <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
                  </Link>
                </div>
              }
            >
              <VehicleStatusTable vehicles={vehicles} loading={isLoading} />
            </Card>
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
