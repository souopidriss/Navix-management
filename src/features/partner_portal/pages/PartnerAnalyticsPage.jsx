/**
 * Navix Partner Portal — PartnerAnalyticsPage (PERFORMANCE & ANALYTICS)
 * --------------------------------------------------------------------------
 * Centre d'analyse permettant au Partenaire de mesurer sa performance
 * opérationnelle et financière. READ-ONLY : aucune donnée n'est modifiée.
 *
 * Architecture :
 *   - Réutilise les services/hooks existants via partnerAnalyticsService
 *   - Charts : AreaChart, BarChart, DonutChart (CSS/SVG purs, aucune dépendance)
 *   - KPI : ClientKpiCards existant ou composant dédié
 *   - Multi-tenant : filtré par PARTNER_COMPANY_ID
 */
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { PageContainer, PageHeader, LoadingState, ErrorState } from '@/components/core';
import DonutChart from '@/features/reports/components/charts/DonutChart';
import { formatNumber } from '@/utils/format';
import { usePartnerAnalytics } from '../hooks/usePartnerAnalytics';
import PartnerPerformanceStats from '../components/PartnerAnalytics/PartnerPerformanceStats';
import PartnerRevenuePerformanceChart from '../components/PartnerAnalytics/PartnerRevenuePerformanceChart';
import PartnerMissionPerformanceChart from '../components/PartnerAnalytics/PartnerMissionPerformanceChart';
import PartnerRequestPerformanceCard from '../components/PartnerAnalytics/PartnerRequestPerformanceCard';
import PartnerClientPerformance from '../components/PartnerAnalytics/PartnerClientPerformance';
import PartnerContractPerformance from '../components/PartnerAnalytics/PartnerContractPerformance';
import PartnerOperationalPerformance from '../components/PartnerAnalytics/PartnerOperationalPerformance';
import PartnerPerformanceInsights from '../components/PartnerAnalytics/PartnerPerformanceInsights';
import '../components/PartnerAnalytics/PartnerAnalytics.css';

const ANALYTICS_PERIOD_OPTIONS = [
  { value: 'all', label: 'Toutes les données' },
  { value: 'today', label: "Aujourd'hui" },
  { value: 'last7', label: '7 derniers jours' },
  { value: 'month', label: 'Ce mois' },
  { value: 'lastMonth', label: 'Mois précédent' },
  { value: 'last3', label: '3 derniers mois' },
  { value: 'last6', label: '6 derniers mois' },
  { value: 'year', label: '12 derniers mois' },
];

const PartnerAnalyticsPage = () => {
  const {
    isLoading,
    error,
    refetch,
    filters,
    setFilters,
    kpis,
    revenuePerformance,
    missionPerformance,
    requestPerformance,
    clientPerformance,
    vehiclePerformance,
    contractPerformance,
    invoicePerformance,
    financialPerformance,
    operationalPerformance,
    prestations,
    activityDistribution,
    insights,
  } = usePartnerAnalytics({ period: 'all' });

  const handlePeriodChange = (event) => {
    setFilters({ period: event.target.value });
  };

  const handleExport = () => {
    const rows = [];
    rows.push(['Navix Management — Performance Partenaire']);
    rows.push(['Exporté le', new Date().toLocaleDateString('fr-FR')]);
    rows.push(['Période', ANALYTICS_PERIOD_OPTIONS.find((o) => o.value === filters.period)?.label || filters.period]);
    rows.push([]);

    if (kpis) {
      rows.push(['Indicateur', 'Valeur']);
      rows.push(['Chiffre d\'affaires', `${formatNumber(kpis.grossTotal)} FCFA`]);
      rows.push(['Revenu net', `${formatNumber(kpis.netTotal)} FCFA`]);
      rows.push(['Commissions', `${formatNumber(kpis.commissionTotal)} FCFA`]);
      rows.push(['Missions', kpis.totalMissions]);
      rows.push(['Taux d\'acceptation', `${kpis.acceptanceRate} %`]);
      rows.push(['Clients actifs', kpis.activeClients]);
      rows.push(['Véhicules actifs', kpis.activeVehicles]);
      rows.push([]);
    }

    if (operationalPerformance) {
      rows.push(['Performance opérationnelle']);
      rows.push(['Demandes reçues', operationalPerformance.requests]);
      rows.push(['Missions terminées', operationalPerformance.missionsCompleted]);
      rows.push(['Taux de réussite', `${operationalPerformance.successRate} %`]);
      rows.push([]);
    }

    if (prestations?.length > 0) {
      rows.push(['Prestation', 'Missions', 'CA brut (FCFA)', 'Revenu net (FCFA)']);
      prestations.forEach((p) => rows.push([p.type, p.count, formatNumber(p.revenue), formatNumber(p.netRevenue)]));
    }

    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `performance-partenaire-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Export CSV de la performance généré.');
  };

  if (isLoading && !kpis) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={5} label="Chargement des données de performance…" />
      </PageContainer>
    );
  }

  if (error && !kpis) {
    return (
      <PageContainer>
        <ErrorState
          title="Impossible de charger les données de performance"
          description="Les données de performance sont temporairement indisponibles."
          retry={refetch}
          retryLabel="Réessayer"
        />
      </PageContainer>
    );
  }

  const formatDonutValue = (value) => `${formatNumber(value)} FCFA`;

  return (
    <PageContainer>
      <Helmet>
        <title>Performance — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Performance"
        subtitle="Analysez l'activité et la performance de votre entreprise."
        icon="bi-graph-up"
        breadcrumbs={[{ label: 'Espace Partenaire' }, { label: 'Performance' }]}
        actions={
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <label className="d-flex align-items-center gap-2 small text-muted" htmlFor="partner-analytics-period">
              <i className="bi bi-calendar3" aria-hidden="true" />
              <select
                id="partner-analytics-period"
                className="form-select form-select-sm"
                value={filters.period}
                onChange={handlePeriodChange}
                aria-label="Période d'analyse"
              >
                {ANALYTICS_PERIOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={handleExport}
              aria-label="Exporter la performance (CSV)"
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

      {/* ── KPI Principaux ─────────────────────────────────────────── */}
      <PartnerPerformanceStats kpis={kpis} loading={isLoading && !kpis} />

      {/* ── Charts : CA + Missions ──────────────────────────────────── */}
      <div className="row g-3 mb-4">
        <div className="col-xl-8 col-lg-7">
          <PartnerRevenuePerformanceChart data={revenuePerformance} loading={isLoading && !revenuePerformance} />
        </div>
        <div className="col-xl-4 col-lg-5">
          <PartnerMissionPerformanceChart data={missionPerformance} loading={isLoading && !missionPerformance} />
        </div>
      </div>

      {/* ── Donut : Activité + Demandes + Clients ───────────────────── */}
      <div className="row g-3 mb-4">
        <div className="col-xl-4 col-lg-6">
          {isLoading && !activityDistribution ? (
            <div className="h-100">
              <div className="placeholder-glow p-3"><div className="placeholder rounded" style={{ height: 240 }} /></div>
            </div>
          ) : activityDistribution ? (
            <div className="card h-100">
              <div className="card-header d-flex align-items-center gap-2">
                <i className="bi bi-pie-chart text-primary" aria-hidden="true" />
                <span className="fw-semibold">Répartition par activité</span>
              </div>
              <div className="card-body">
                <DonutChart
                  data={activityDistribution}
                  size={168}
                  title="Répartition des revenus par activité"
                  formatValue={formatDonutValue}
                  totalLabel="Revenus"
                />
              </div>
            </div>
          ) : null}
        </div>
        <div className="col-xl-4 col-lg-6">
          <PartnerRequestPerformanceCard data={requestPerformance} loading={isLoading && !requestPerformance} />
        </div>
        <div className="col-xl-4 col-lg-6">
          <PartnerClientPerformance data={clientPerformance} loading={isLoading && !clientPerformance} />
        </div>
      </div>

      {/* ── Véhicules + Contrats + Facturation ──────────────────────── */}
      <div className="row g-3 mb-4">
        <div className="col-xl-4 col-lg-6">
          <div className="card h-100">
            <div className="card-header d-flex align-items-center justify-content-between">
              <span className="d-flex align-items-center gap-2">
                <i className="bi bi-truck text-info" aria-hidden="true" />
                <span className="fw-semibold">Véhicules</span>
              </span>
              {vehiclePerformance && (
                <span className="badge bg-info-subtle text-info">{vehiclePerformance.total} total</span>
              )}
            </div>
            <div className="card-body">
              {isLoading && !vehiclePerformance ? (
                <div className="placeholder-glow"><div className="placeholder rounded" style={{ height: 120 }} /></div>
              ) : vehiclePerformance ? (
                <div className="row g-2">
                  {[
                    { label: 'Actifs', value: vehiclePerformance.inUse + vehiclePerformance.available, icon: 'bi-truck', variant: 'success' },
                    { label: 'Disponibles', value: vehiclePerformance.available, icon: 'bi-check-circle', variant: 'primary' },
                    { label: 'En service', value: vehiclePerformance.inUse, icon: 'bi-play-circle', variant: 'info' },
                    { label: 'Maintenance', value: vehiclePerformance.maintenance, icon: 'bi-tools', variant: 'warning' },
                  ].map((item) => (
                    <div key={item.label} className="col-6">
                      <div className="text-center p-2 rounded-3 border bg-body-tertiary">
                        <i className={`bi ${item.icon} text-${item.variant} mb-1`} aria-hidden="true" />
                        <div className="fw-bold text-body-emphasis">{item.value}</div>
                        <div className="small text-muted">{item.label}</div>
                      </div>
                    </div>
                  ))}
                  <div className="col-12 mt-2">
                    <div className="d-flex align-items-center justify-content-between small">
                      <span className="text-muted">Taux d'utilisation</span>
                      <span className={`fw-semibold ${vehiclePerformance.utilizationRate >= 50 ? 'text-success' : 'text-warning'}`}>
                        {vehiclePerformance.utilizationRate} %
                      </span>
                    </div>
                    <div className="progress mt-1" style={{ height: 6 }}>
                      <div
                        className={`progress-bar ${vehiclePerformance.utilizationRate >= 50 ? 'bg-success' : 'bg-warning'}`}
                        style={{ width: `${vehiclePerformance.utilizationRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="col-xl-8 col-lg-12">
          <PartnerContractPerformance
            contracts={contractPerformance}
            invoices={invoicePerformance}
            loading={isLoading && !contractPerformance}
          />
        </div>
      </div>

      {/* ── Performance opérationnelle + financière + prestations ────── */}
      <PartnerOperationalPerformance
        operational={operationalPerformance}
        financial={financialPerformance}
        prestations={prestations}
        loading={isLoading && !operationalPerformance}
      />

      {/* ── Insights ────────────────────────────────────────────────── */}
      <PartnerPerformanceInsights insights={insights} loading={isLoading && !insights} />
    </PageContainer>
  );
};

export default PartnerAnalyticsPage;
