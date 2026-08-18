/**
 * Navix Client Dashboard — ClientDashboardPage (DASHBOARD CLIENT PREMIUM)
 * --------------------------------------------------------------------------
 * Tableau de bord principal de l'Espace Client (PROMPT 055).
 *
 * Structure verticale (respirante) :
 *   HEADER → KPI (2 rangées) → ÉTAT DE LA FLOTTE → ACTIVITÉ / TRAJETS
 *   → MAINTENANCE / CARBURANT → ALERTES → RÉSUMÉ FINANCIER → ACTIVITÉ RÉCENTE
 *   → (sections support) Véhicules les plus utilisés + Factures récentes.
 *
 * Contraintes :
 *   - Actions rapides et boutons filtrés par RBAC (`can` / `Can`).
 *   - Données strictement limitées au client connecté (multi-tenant).
 *   - Monnaie : FCFA (XAF) — Localisation : Cameroun 🇨🇲.
 */
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';
import { LoadingState, ErrorState, PageContainer, PageHeader } from '@/components/core';
import { Can } from '@/features/rbac/components';
import { useCan } from '@/features/rbac/hooks';
import { PERMISSIONS } from '@/features/rbac/constants';
import {
  FleetOverviewCard,
  FleetEvolutionChart,
  FuelConsumptionCard,
  RecentActivityList,
} from '@/features/dashboard/components';
import { useClientDashboard } from '../hooks/useClientDashboard';
import ClientKpiCards from '../components/ClientDashboard/ClientKpiCards';
import ClientTripsList from '../components/ClientDashboard/ClientTripsList';
import ClientMaintenanceCard from '../components/ClientDashboard/ClientMaintenanceCard';
import ClientAlertsCard from '../components/ClientDashboard/ClientAlertsCard';
import ClientFleetCategoriesCard from '../components/ClientDashboard/ClientFleetCategoriesCard';
import ClientFinanceSummaryCard from '../components/ClientDashboard/ClientFinanceSummaryCard';
import ClientVehicleTable from '../components/ClientDashboard/ClientVehicleTable';
import { ROUTES } from '@/routes/route.constants';
import '../components/ClientDashboard/ClientDashboard.css';

const ClientDashboardPage = () => {
  const {
    data,
    isLoading,
    error,
    refetch,
    client,
    metrics,
    metricsSecondary,
    vehicles,
    fleetStatus,
    fleetCategories,
    tripsWeekly,
    tripsOngoing,
    upcomingTrips,
    maintenance,
    alerts,
    recentActivities,
    fuelData,
    financeSummary,
    quickActions,
    isEnterprise,
  } = useClientDashboard();

  const can = useCan();

  const handleExport = () => {
    window.print();
  };

  /* ─── Loading ──── */
  if (isLoading && !data) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={5} label="Chargement de votre Dashboard Client…" />
      </PageContainer>
    );
  }

  /* ─── Error ──── */
  if (error && !data) {
    return (
      <PageContainer>
        <ErrorState
          title="Impossible de charger le Dashboard"
          description="Les données de votre espace client sont temporairement indisponibles."
          retry={refetch}
        />
      </PageContainer>
    );
  }

  const greetingName = isEnterprise
    ? client?.contactName || client?.companyName || 'Votre Entreprise'
    : client?.displayName || 'Client';
  const displayName = isEnterprise
    ? client?.companyName || 'Votre Entreprise'
    : client?.displayName || 'Client';
  const todayLabel = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const kpiGroups = [
    { title: 'Aperçu de la flotte', metrics },
    { title: 'Exploitation du mois', metrics: metricsSecondary },
  ];

  const visibleQuickActions = quickActions.filter((action) => can(action.permission));

  return (
    <PageContainer>
      <Helmet>
        <title>Dashboard Client — Navix Management</title>
      </Helmet>

      {/* ── Header Premium ─────────────────────────────────────────────── */}
      <PageHeader
        title={`Bonjour, ${greetingName} 👋`}
        subtitle={
          isEnterprise
            ? 'Voici un aperçu de votre flotte aujourd’hui.'
            : 'Voici un aperçu de vos services Navix et trajets récents.'
        }
        icon="bi-person-workspace"
        breadcrumbs={[{ label: 'Espace Client' }, { label: 'Dashboard' }]}
        actions={
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Can permission={PERMISSIONS.CLIENT_VEHICLES_CREATE}>
              <Link to={ROUTES.CLIENT_VEHICLES} className="btn btn-sm btn-primary">
                <i className="bi bi-plus-lg me-1" aria-hidden="true" />
                Ajouter un véhicule
              </Link>
            </Can>
            {isEnterprise && (
              <Link to={ROUTES.CLIENT_VEHICLES} className="btn btn-sm btn-outline-secondary">
                <i className="bi bi-truck me-1" aria-hidden="true" />
                Voir la flotte
              </Link>
            )}
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={handleExport}
              aria-label="Exporter le dashboard"
            >
              <i className="bi bi-download me-1" aria-hidden="true" />
              Exporter
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={refetch}
              aria-label="Actualiser les données"
            >
              <i className="bi bi-arrow-clockwise me-1" aria-hidden="true" />
              Actualiser
            </button>
          </div>
        }
      />

      {/* ── Bannière Identité Client + date ─────────────────────────────── */}
      <div className="navix-client-identity-banner navix-client-animate mb-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="navix-client-identity-avatar" aria-hidden="true">
              {isEnterprise ? '🏢' : '👤'}
            </div>
            <div>
              <h5 className="mb-0 fw-bold text-body-emphasis">
                {isEnterprise ? 'Entreprise : ' : ''}{displayName}
              </h5>
              <span className="text-body-secondary small">
                {isEnterprise
                  ? `${client?.address}, ${client?.city} · N° RCCM : ${client?.registrationNumber}`
                  : `${client?.address}, ${client?.city}`}
              </span>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="badge bg-body-secondary px-2 py-2 text-body-emphasis" title="Date du jour">
              <i className="bi bi-calendar3 me-1" aria-hidden="true" />
              {todayLabel}
            </span>
            <span className={`badge ${isEnterprise ? 'bg-primary-subtle text-primary' : 'bg-info-subtle text-info'} px-3 py-2`}>
              <i className={`bi ${isEnterprise ? 'bi-buildings' : 'bi-person'} me-1`} aria-hidden="true" />
              {isEnterprise ? 'Client Entreprise — Flotte Privilège' : 'Client Particulier Premium'}
            </span>
            <span className="badge bg-success-subtle text-success px-3 py-2">
              <i className="bi bi-shield-check me-1" aria-hidden="true" />
              Compte vérifié
            </span>
            <span className="badge bg-body-secondary px-2 py-2" title="Espace Cameroun">
              🇨🇲 Cameroun
            </span>
          </div>
        </div>
      </div>

      {/* ── Actions rapides (filtrées RBAC) ─────────────────────────────── */}
      {visibleQuickActions.length > 0 && (
        <div className="d-flex align-items-center gap-3 flex-wrap mb-3 navix-client-animate">
          <span className="text-muted small fw-semibold text-uppercase">Actions rapides</span>
          <div className="navix-client-quick-actions">
            {visibleQuickActions.map((action) => (
              <Link key={action.key} to={action.to} className="navix-client-quick-btn" aria-label={action.label}>
                <i className={`bi ${action.icon}`} aria-hidden="true" />
                <span className="d-none d-md-inline">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── KPI (2 rangées) ─────────────────────────────────────────────── */}
      <ClientKpiCards groups={kpiGroups} loading={isLoading && !data} />

      {/* ── État de la flotte + Répartition ─────────────────────────────── */}
      {isEnterprise && fleetStatus && (
        <div className="row g-3 mb-4 navix-client-animate">
          <div className="col-xl-7 col-lg-6">
            <FleetOverviewCard fleet={fleetStatus} />
          </div>
          <div className="col-xl-5 col-lg-6">
            <ClientFleetCategoriesCard categories={fleetCategories} total={fleetStatus.total} />
          </div>
        </div>
      )}

      {/* ── Activité des trajets + Trajets en cours ─────────────────────── */}
      {isEnterprise && (
        <div className="row g-3 mb-4 navix-client-animate">
          <div className="col-xl-6 col-lg-6">
            <Card
              className="h-100"
              title={
                <span className="d-flex align-items-center gap-2">
                  <i className="bi bi-graph-up-arrow text-primary" aria-hidden="true" />
                  <span>Activité des trajets — 7 derniers jours</span>
                </span>
              }
            >
              <FleetEvolutionChart
                data={tripsWeekly}
                title="Activité des trajets — 7 derniers jours"
              />
            </Card>
          </div>
          <div className="col-xl-6 col-lg-6">
            <ClientTripsList title="Trajets en cours" icon="bi-signpost-fill" items={tripsOngoing} />
          </div>
        </div>
      )}

      {/* ── Prochains trajets + Maintenance ─────────────────────────────── */}
      {isEnterprise && (
        <div className="row g-3 mb-4 navix-client-animate">
          <div className="col-xl-6 col-lg-6">
            <ClientTripsList title="Prochains trajets" icon="bi-calendar2-week" items={upcomingTrips} showAll />
          </div>
          <div className="col-xl-6 col-lg-6">
            <ClientMaintenanceCard maintenance={maintenance} />
          </div>
        </div>
      )}

      {/* ── Carburant + Alertes ─────────────────────────────────────────── */}
      <div className="row g-3 mb-4 navix-client-animate">
        {isEnterprise && fuelData && (
          <div className="col-xl-5 col-lg-6">
            <FuelConsumptionCard fuelData={fuelData} />
          </div>
        )}
        <div className={isEnterprise && fuelData ? 'col-xl-7 col-lg-6' : 'col-12'}>
          <ClientAlertsCard alerts={alerts} />
        </div>
      </div>

      {/* ── Résumé financier + Activité récente ─────────────────────────── */}
      <div className="row g-3 mb-4 navix-client-animate">
        {isEnterprise && financeSummary && (
          <div className="col-xl-4 col-lg-5">
            <ClientFinanceSummaryCard summary={financeSummary} />
          </div>
        )}
        <div className={isEnterprise && financeSummary ? 'col-xl-8 col-lg-7' : 'col-12'}>
          <RecentActivityList activities={recentActivities} />
        </div>
      </div>

      {/* ── Véhicules les plus utilisés (Entreprise) ────────────────────── */}
      {isEnterprise && vehicles.length > 0 && (
        <div className="mb-4 navix-client-animate">
          <ClientVehicleTable vehicles={vehicles} loading={isLoading && !data} />
        </div>
      )}

      {/* ── Mes Factures récentes ───────────────────────────────────────── */}
      <div className="navix-client-animate">
        <Card
          flush
          title={
            <div className="d-flex align-items-center justify-content-between w-100">
              <span className="d-flex align-items-center gap-2">
                <i className="bi bi-receipt text-success" aria-hidden="true" />
                <span>Mes Factures récentes (FCFA)</span>
              </span>
              <Link to={ROUTES.CLIENT_INVOICES} className="btn btn-sm btn-outline-success">
                Voir toutes mes factures
                <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
              </Link>
            </div>
          }
        >
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" aria-label="Factures récentes">
              <thead>
                <tr>
                  <th>N° Facture</th>
                  <th>Période</th>
                  <th>Échéance</th>
                  <th className="text-end">Montant TTC</th>
                  <th>Statut</th>
                  <th className="text-end">PDF</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 'FAC-2026-0814', period: 'Août 2026', due: '31/08/2026', amount: '14 500 000 FCFA', status: 'pending' },
                  { id: 'FAC-2026-0701', period: 'Juillet 2026', due: '31/07/2026', amount: '14 500 000 FCFA', status: 'paid' },
                  { id: 'FAC-2026-0601', period: 'Juin 2026', due: '30/06/2026', amount: '12 800 000 FCFA', status: 'paid' },
                ].map((inv) => (
                  <tr key={inv.id}>
                    <td className="fw-semibold">{inv.id}</td>
                    <td>{inv.period}</td>
                    <td className="text-muted">{inv.due}</td>
                    <td className="text-end fw-bold text-body-emphasis">{inv.amount}</td>
                    <td>
                      {inv.status === 'paid' ? (
                        <span className="badge bg-success-subtle text-success">
                          <i className="bi bi-check-circle me-1" aria-hidden="true" />
                          Payée
                        </span>
                      ) : (
                        <span className="badge bg-warning-subtle text-warning">
                          <i className="bi bi-hourglass me-1" aria-hidden="true" />
                          En attente
                        </span>
                      )}
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        aria-label={`Télécharger la facture ${inv.id}`}
                      >
                        <i className="bi bi-file-pdf me-1" aria-hidden="true" />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default ClientDashboardPage;
