/**
 * Navix Client Dashboard — ClientDashboardPage (DASHBOARD CLIENT PREMIUM)
 * --------------------------------------------------------------------------
 * Tableau de bord principal de l'Espace Client.
 * Reprend fidèlement le langage visuel du Dashboard Master Navix :
 *   - Bannière d'identité client (Entreprise ou Particulier)
 *   - Filtre de période pill-tabs + bouton Exporter
 *   - Actions rapides contextuelles
 *   - KPI cards avec tendances FCFA
 *   - Graphique d'évolution des dépenses (Area SVG — réutilisé)
 *   - Graphique dépenses par catégorie (Donut SVG — réutilisé)
 *   - Alertes importantes (réutilisé DashboardAlerts)
 *   - Consommation de carburant avec jauge (réutilisé FuelConsumptionCard)
 *   - Tableau des véhicules les plus utilisés
 *   - Activités récentes (réutilisé RecentActivityList)
 *
 * Localisation : 🇨🇲 Cameroun — Monnaie : FCFA (XAF)
 * Multi-tenant : données strictement limitées au client connecté.
 */
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';
import { LoadingState, ErrorState, PageContainer, PageHeader } from '@/components/core';
import {
  CostAreaChart,
  CategoryCostDonutChart,
  FuelConsumptionCard,
  DashboardAlerts,
  RecentActivityList,
} from '@/features/dashboard/components';
import { useClientDashboard } from '../hooks/useClientDashboard';
import ClientKpiCards from '../components/ClientDashboard/ClientKpiCards';
import ClientPeriodFilter from '../components/ClientDashboard/ClientPeriodFilter';
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
    monthlyEvolution,
    financialData,
    vehicles,
    alerts,
    recentActivities,
    fuelData,
    quickActions,
    isEnterprise,
  } = useClientDashboard();

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

  const displayName = isEnterprise
    ? client?.companyName || 'Votre Entreprise'
    : client?.displayName || 'Client';

  return (
    <PageContainer>
      <Helmet>
        <title>Dashboard Client — Navix Management</title>
      </Helmet>

      {/* ── PageHeader ─────────────────────────────────────────────────── */}
      <PageHeader
        title={`Bienvenue, ${displayName} ! 👋`}
        subtitle={
          isEnterprise
            ? 'Aperçu en temps réel de votre flotte, vos services et vos dépenses.'
            : 'Aperçu de vos services Navix et trajets récents.'
        }
        icon="bi-person-workspace"
        breadcrumbs={[{ label: 'Espace Client' }, { label: 'Dashboard' }]}
        actions={
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={handleExport}
              aria-label="Exporter le dashboard"
            >
              <i className="bi bi-download me-2" aria-hidden="true" />
              Exporter
            </button>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={refetch}
              aria-label="Actualiser les données"
            >
              <i className="bi bi-arrow-clockwise me-2" aria-hidden="true" />
              Actualiser
            </button>
          </div>
        }
      />

      {/* ── Bannière Identité Client ────────────────────────────────────── */}
      <div className="navix-client-identity-banner navix-client-animate mb-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="navix-client-identity-avatar" aria-hidden="true">
              {isEnterprise ? '🏢' : '👤'}
            </div>
            <div>
              <h5 className="mb-0 fw-bold text-body-emphasis">{displayName}</h5>
              <span className="text-body-secondary small">
                {isEnterprise
                  ? `${client?.address}, ${client?.city} · N° RCCM : ${client?.registrationNumber}`
                  : `${client?.address}, ${client?.city}`}
              </span>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className={`badge ${isEnterprise ? 'bg-primary-subtle text-primary' : 'bg-info-subtle text-info'} px-3 py-2`}>
              <i className={`bi ${isEnterprise ? 'bi-buildings' : 'bi-person'} me-1`} />
              {isEnterprise ? 'Client Entreprise — Flotte Privilège' : 'Client Particulier Premium'}
            </span>
            <span className="badge bg-success-subtle text-success px-3 py-2">
              <i className="bi bi-shield-check me-1" />
              Compte vérifié
            </span>
            <span className="badge bg-body-secondary px-2 py-2" title="Espace Cameroun">
              🇨🇲 Cameroun
            </span>
          </div>
        </div>
      </div>

      {/* ── Filtre Période + Actions Rapides ───────────────────────────── */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3 navix-client-animate">
        <ClientPeriodFilter />
        <div className="navix-client-quick-actions">
          {quickActions.map((action) => (
            <Link
              key={action.key}
              to={action.to}
              className="navix-client-quick-btn"
              aria-label={action.label}
            >
              <i className={`bi ${action.icon}`} aria-hidden="true" />
              <span className="d-none d-md-inline">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div className="mb-4 navix-client-animate">
        <ClientKpiCards metrics={metrics} loading={isLoading && !data} />
      </div>

      {/* ── Section 1 : Graphiques (Évolution + Donut + Alertes) ──────── */}
      <div className="row g-3 mb-4 navix-client-animate">
        {/* Graphique Évolution Area SVG */}
        <div className="col-xl-7 col-lg-6">
          <Card
            className="h-100"
            title={
              <span className="d-flex align-items-center gap-2">
                <i className="bi bi-graph-up-arrow text-primary" aria-hidden="true" />
                <span>Évolution des dépenses — 6 derniers mois (FCFA)</span>
              </span>
            }
          >
            <CostAreaChart data={monthlyEvolution} />
          </Card>
        </div>

        {/* Graphique Donut par catégorie */}
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
            <CategoryCostDonutChart financialData={financialData} />
          </Card>
        </div>
      </div>

      {/* ── Section 2 : Carburant + Alertes ───────────────────────────── */}
      <div className="row g-3 mb-4 navix-client-animate">
        {/* Carburant (Entreprise uniquement) */}
        {isEnterprise && fuelData && (
          <div className="col-xl-5 col-lg-6">
            <FuelConsumptionCard fuelData={fuelData} />
          </div>
        )}

        {/* Alertes importantes */}
        <div className={isEnterprise && fuelData ? 'col-xl-7 col-lg-6' : 'col-12'}>
          <DashboardAlerts alerts={alerts} />
        </div>
      </div>

      {/* ── Section 3 : Tableau Véhicules (Entreprise uniquement) ──────── */}
      {isEnterprise && vehicles.length > 0 && (
        <div className="mb-4 navix-client-animate">
          <ClientVehicleTable vehicles={vehicles} loading={isLoading && !data} />
        </div>
      )}

      {/* ── Section 4 : Activités Récentes ─────────────────────────────── */}
      <div className="row g-3 mb-4 navix-client-animate">
        <div className="col-lg-12">
          <RecentActivityList activities={recentActivities} />
        </div>
      </div>

      {/* ── Section 5 : Mes Factures récentes (Particulier + Entreprise) ─ */}
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
