/**
 * Navix Driver Dashboard — DriverDashboardPage
 * --------------------------------------------------------------------------
 * Dashboard principal pour l'Espace Chauffeur Premium.
 */
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { PageContainer, PageHeader, LoadingState, ErrorState } from '@/components/core';
import { Card } from '@/components/ui';
import { CostAreaChart, DashboardAlerts, FuelConsumptionCard } from '@/features/dashboard/components';
import { useDriverDashboard } from '../hooks/useDriverDashboard';

import DriverKpiCards from '../components/DriverDashboard/DriverKpiCards';
import DriverVehicleCard from '../components/DriverDashboard/DriverVehicleCard';
import NextTripCard from '../components/DriverDashboard/NextTripCard';
import DriverRecentTrips from '../components/DriverDashboard/DriverRecentTrips';

import '../components/DriverDashboard/DriverDashboard.css';

const DriverDashboardPage = () => {
  const {
    data,
    isLoading,
    error,
    refetch,
    driver,
    metrics,
    vehicle,
    nextTrip,
    recentTrips,
    activityEvolution,
    fuelData,
    alerts,
    quickActions,
    startTrip,
  } = useDriverDashboard();

  if (isLoading && !data) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={4} label="Chargement de votre espace chauffeur…" />
      </PageContainer>
    );
  }

  if (error && !data) {
    return (
      <PageContainer>
        <ErrorState
          title="Données indisponibles"
          description="Impossible de charger votre tableau de bord pour le moment."
          retry={refetch}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Helmet>
        <title>Dashboard Chauffeur — Navix Management</title>
      </Helmet>

      {/* ── PageHeader ─────────────────────────────────────────────────── */}
      <PageHeader
        title={`Bienvenue, ${driver?.firstName || 'Chauffeur'} ! 👋`}
        subtitle="Voici un aperçu de votre activité aujourd'hui."
        icon="bi-steering"
        breadcrumbs={[{ label: 'Espace Chauffeur' }, { label: 'Dashboard' }]}
        actions={
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={refetch}
            aria-label="Actualiser les données"
          >
            <i className="bi bi-arrow-clockwise me-2" aria-hidden="true" />
            Actualiser
          </button>
        }
      />

      {/* ── Actions rapides ────────────────────────────────────────────── */}
      <div className="navix-driver-quick-actions mb-4 navix-driver-animate">
        {quickActions.map((action) => (
          <Link
            key={action.key}
            to={action.to}
            className="navix-driver-quick-btn"
            aria-label={action.label}
          >
            <i className={`bi ${action.icon}`} aria-hidden="true" />
            <span className="d-none d-md-inline">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div className="mb-4 navix-driver-animate">
        <DriverKpiCards metrics={metrics} loading={isLoading && !data} />
      </div>

      {/* ── Section 1 : Véhicule & Prochain Trajet ──────────────────────── */}
      <div className="row g-3 mb-4 navix-driver-animate">
        <div className="col-xl-5 col-lg-6">
          <DriverVehicleCard vehicle={vehicle} />
        </div>
        <div className="col-xl-7 col-lg-6">
          <NextTripCard trip={nextTrip} onStartTrip={startTrip} />
        </div>
      </div>

      {/* ── Section 2 : Activité (Graph) & Alertes ─────────────────────── */}
      <div className="row g-3 mb-4 navix-driver-animate">
        <div className="col-xl-7 col-lg-6">
          <Card
            className="h-100"
            title={
              <span className="d-flex align-items-center gap-2">
                <i className="bi bi-graph-up-arrow text-primary" aria-hidden="true" />
                <span>Évolution de mes trajets (6 derniers mois)</span>
              </span>
            }
          >
            {/* On réutilise le CostAreaChart, le tooltip affichera la "value" */}
            <CostAreaChart data={activityEvolution} />
          </Card>
        </div>
        <div className="col-xl-5 col-lg-6">
          <DashboardAlerts alerts={alerts} />
        </div>
      </div>

      {/* ── Section 3 : Consommation & Trajets Récents ─────────────────── */}
      <div className="row g-3 mb-4 navix-driver-animate">
        <div className="col-xl-5 col-lg-6">
          <FuelConsumptionCard fuelData={fuelData} />
        </div>
        <div className="col-xl-7 col-lg-6">
          <DriverRecentTrips trips={recentTrips} />
        </div>
      </div>
    </PageContainer>
  );
};

export default DriverDashboardPage;
