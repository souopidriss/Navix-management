/**
 * Navix Partner Portal — PartnerDashboardPage (DASHBOARD PARTENAIRE PREMIUM)
 * --------------------------------------------------------------------------
 * Tableau de bord principal de l'Espace Partenaire (PROMPT 062, Phase 4),
 * repensé selon le MASTER DESIGN du Dashboard Super Admin :
 *
 *   HEADER (période + Exporter CSV fonctionnel + Actualiser)
 *   → BANNIÈRE IDENTITÉ PARTENAIRE
 *   → 5 KPI desktop (missions actives 24, véhicules dispo 18, clients
 *     actifs 37, revenus du mois 18 450 000 FCFA, solde dispo 42 850 000
 *     FCFA) avec mini-sparklines
 *   → 3 COLONNES : DonutChart « Revenus par activité » · AreaChart
 *     « Évolution des revenus (6 mois) » · Alertes de la flotte
 *   → 3 BLOCS INFÉRIEURS : Missions récentes · Performance des véhicules ·
 *     Activités récentes
 *   → SECTION « SITUATION FINANCIÈRE » : solde / entrées / sorties /
 *     transactions + actions finance réelles (dépôt, transaction, retrait,
 *     transfert) via modales du centre financier partagé.
 *
 * Contraintes PROMPT 062 :
 *   - Réutilisation des composants partagés (charts Reports CSS/SVG purs,
 *     Timeline, Card, modales finance) — AUCUN nouveau package.
 *   - Les 5 KPI imposés et le résumé financier corporate (42 850 000 /
 *     75 350 000 / 32 500 000 / 12) sont des agrégats de démonstration
 *     distincts du ledger opérationnel (wallet 18 750 000 FCFA) et des
 *     listes réelles — pas de modification de la finance PROMPT 061.
 *   - Données strictement bornées au companyId partenaire (multi-tenant).
 *   - RBAC : le rôle Chauffeur n'a aucune permission PARTNER_FINANCE_* et
 *     reste exclu par ROUTE_META.
 */
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button, Card } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState, ErrorState } from '@/components/core';
import { RecentActivityList } from '@/features/dashboard/components';
import DonutChart from '@/features/reports/components/charts/DonutChart';
import AreaChart from '@/features/reports/components/charts/AreaChart';
import ClientKpiCards from '@/features/client/components/ClientDashboard/ClientKpiCards';
import ClientFinanceOperationModal from '@/features/client/components/ClientFinance/ClientFinanceOperationModal';
import ClientFinanceConfirmModal from '@/features/client/components/ClientFinance/ClientFinanceConfirmModal';
import { ROUTES } from '@/routes/route.constants';
import { formatNumber } from '@/utils/format';
import { usePartnerDashboard } from '../hooks/usePartnerDashboard';
import { usePartnerContext } from '../hooks/usePartnerContext';
import { usePartnerFinance } from '../hooks/usePartnerFinance';
import { getTransactionType } from '../constants/partner.constants';
import PartnerMissionsCard from '../components/PartnerDashboard/PartnerMissionsCard';
import PartnerAlertsCard from '../components/PartnerDashboard/PartnerAlertsCard';
import PartnerVehiclePerformanceCard from '../components/PartnerDashboard/PartnerVehiclePerformanceCard';
import PartnerFinanceActions from '../components/PartnerFinance/PartnerFinanceActions';
import '@/features/client/components/ClientDashboard/ClientDashboard.css';

/** Périodes d'analyse du Dashboard Partenaire (vue corporate). */
const PARTNER_PERIOD_OPTIONS = [
  { value: 'month', label: 'Ce mois-ci' },
  { value: 'last_month', label: 'Mois dernier' },
  { value: 'quarter', label: 'Ce trimestre' },
  { value: 'semester', label: '6 derniers mois' },
];

const SUCCESS_TOAST = {
  deposit: 'Fonds ajoutés à votre portefeuille.',
  withdrawal: 'Retrait enregistré.',
  transfer: 'Transfert enregistré.',
  payment: 'Transaction enregistrée.',
};

const toCsvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const PartnerDashboardPage = () => {
  const {
    data,
    isLoading,
    error,
    refetch,
    partner,
    stats,
    missions,
    alerts,
    recentActivities,
    vehiclePerformance,
    revenueEvolution,
    activityDistribution,
    financeSummary,
  } = usePartnerDashboard();

  const { companyName } = usePartnerContext();
  const {
    wallet,
    refetch: refetchFinance,
    createDeposit,
    createWithdrawal,
    createTransfer,
    createPayment,
    previewReference,
  } = usePartnerFinance();

  const [period, setPeriod] = useState('month');

  /* ── États des modales financières (partagées avec le centre financier) ── */
  const [operationMode, setOperationMode] = useState(null);
  const [operationOpen, setOperationOpen] = useState(false);
  const [operationError, setOperationError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [reference, setReference] = useState('');
  const [pendingPayload, setPendingPayload] = useState(null);
  const [summary, setSummary] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const openOperation = (mode) => {
    setOperationMode(mode);
    setOperationError('');
    setOperationOpen(true);
    previewReference().then(setReference).catch(() => setReference(''));
  };

  const closeOperation = () => {
    setOperationOpen(false);
    setOperationMode(null);
    setPendingPayload(null);
  };

  const handleOperationSubmit = (payload) => {
    const isIn = operationMode === 'deposit';
    setPendingPayload(payload);
    setSummary({
      typeLabel: getTransactionType(operationMode).label,
      amount: Number(payload.amount),
      direction: isIn ? 'in' : 'out',
      source: isIn ? payload.source : 'Wallet — Cameroon Logistics Partners',
      destination: isIn ? null : payload.recipient,
      reference,
      description: payload.description,
    });
    setOperationOpen(false);
    setOperationError('');
    setConfirmOpen(true);
  };

  const handleConfirm = async (event) => {
    event?.preventDefault();
    if (!operationMode || !pendingPayload) return;
    setIsSaving(true);
    setOperationError('');
    try {
      const create = {
        deposit: createDeposit,
        withdrawal: createWithdrawal,
        transfer: createTransfer,
        payment: createPayment,
      }[operationMode];
      await create(pendingPayload);
      toast.success(SUCCESS_TOAST[operationMode]);
      setConfirmOpen(false);
      setSummary(null);
      setPendingPayload(null);
      setOperationMode(null);
      refetchFinance();
      refetch();
    } catch (err) {
      setOperationError(err?.message || 'Impossible d’enregistrer l’opération.');
    } finally {
      setIsSaving(false);
    }
  };

  /** Export CSV fonctionnel du dashboard (KPIs, finance, missions, flotte). */
  const handleExport = () => {
    const rows = [];
    rows.push(['Navix Management — Dashboard Partenaire', partner?.companyName || companyName || '']);
    rows.push(['Exporté le', new Date().toLocaleDateString('fr-FR')]);
    rows.push([]);
    rows.push(['Indicateur', 'Valeur', 'Tendance']);
    stats.forEach((stat) => rows.push([stat.label, stat.value, stat.trendLabel]));
    rows.push([]);
    rows.push(['Situation financière', 'FCFA']);
    if (financeSummary) {
      rows.push(['Solde disponible', formatNumber(financeSummary.balance)]);
      rows.push(['Entrées du mois', formatNumber(financeSummary.incomeMonth)]);
      rows.push(['Sorties du mois', formatNumber(financeSummary.expenseMonth)]);
      rows.push(['Transactions du mois', financeSummary.transactionsMonth]);
    }
    rows.push([]);
    rows.push(['Missions récentes', 'Client', 'Véhicule', 'Statut']);
    missions.forEach((mission) => rows.push([mission.title, mission.client, mission.vehicle || '', mission.status]));
    rows.push([]);
    rows.push(['Performance véhicules', 'Chauffeur', 'Missions', 'Km', 'Revenu (FCFA)', 'Utilisation']);
    vehiclePerformance.forEach((item) =>
      rows.push([
        `${item.registration} — ${item.brand} ${item.model}`,
        item.driver || '',
        item.missionsMonth,
        item.kmMonth,
        item.revenueMonth,
        `${item.utilizationRate} %`,
      ]),
    );

    const csv = rows.map((row) => row.map(toCsvCell).join(';')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-partenaire-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Export CSV du dashboard généré.');
  };

  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
    refetch();
  };

  if (isLoading && !data) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={5} label="Chargement de votre Dashboard Partenaire…" />
      </PageContainer>
    );
  }

  if (error && !data) {
    return (
      <PageContainer>
        <ErrorState
          title="Impossible de charger le Dashboard"
          description="Les données de votre espace partenaire sont temporairement indisponibles."
          retry={refetch}
        />
      </PageContainer>
    );
  }

  const displayName = partner?.companyName || companyName || 'Votre Entreprise Partenaire';
  const greetingName = partner?.contactName || displayName;
  const todayLabel = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formatDonutValue = (value) => `${formatNumber(value)} FCFA`;

  const financeStats = [
    {
      key: 'balance',
      label: 'Solde disponible',
      value: financeSummary ? `${formatNumber(financeSummary.balance)} FCFA` : '—',
      icon: 'bi-wallet2',
      variant: 'success',
    },
    {
      key: 'income',
      label: 'Entrées du mois',
      value: financeSummary ? `${formatNumber(financeSummary.incomeMonth)} FCFA` : '—',
      icon: 'bi-arrow-down-circle',
      variant: 'primary',
    },
    {
      key: 'expense',
      label: 'Sorties du mois',
      value: financeSummary ? `${formatNumber(financeSummary.expenseMonth)} FCFA` : '—',
      icon: 'bi-arrow-up-circle',
      variant: 'danger',
    },
    {
      key: 'transactions',
      label: 'Transactions du mois',
      value: financeSummary?.transactionsMonth ?? '—',
      icon: 'bi-arrow-repeat',
      variant: 'info',
    },
  ];

  return (
    <PageContainer>
      <Helmet>
        <title>Dashboard Partenaire — Navix Management</title>
      </Helmet>

      {/* ── Header Premium : période + Exporter + Actualiser ─────────────── */}
      <PageHeader
        title={`Bonjour, ${greetingName} 👋`}
        subtitle="Vue corporate de votre flotte partenaire : revenus, performance et finances en FCFA."
        icon="bi-diagram-3"
        breadcrumbs={[{ label: 'Espace Partenaire' }, { label: 'Dashboard' }]}
        actions={
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <label className="d-flex align-items-center gap-2 small text-muted" htmlFor="partner-dash-period">
              <i className="bi bi-calendar3" aria-hidden="true" />
              <select
                id="partner-dash-period"
                className="form-select form-select-sm"
                value={period}
                onChange={handlePeriodChange}
                aria-label="Période du dashboard"
              >
                {PARTNER_PERIOD_OPTIONS.map((option) => (
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
              aria-label="Exporter le dashboard (CSV)"
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

      {/* ── Bannière Identité Partenaire + date ────────────────────────── */}
      <div className="navix-client-identity-banner navix-client-animate mb-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="navix-client-identity-avatar" aria-hidden="true">
              🚚
            </div>
            <div>
              <h5 className="mb-0 fw-bold text-body-emphasis">Partenaire : {displayName}</h5>
              <span className="text-body-secondary small">
                {partner?.address ? `${partner.address}, ${partner.city}` : partner?.city || 'Yaoundé'}
                {partner?.registrationNumber ? ` · N° RCCM : ${partner.registrationNumber}` : ''}
              </span>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="badge bg-body-secondary px-2 py-2 text-body-emphasis" title="Date du jour">
              <i className="bi bi-calendar3 me-1" aria-hidden="true" />
              {todayLabel}
            </span>
            <span className="badge bg-primary-subtle text-primary px-3 py-2">
              <i className="bi bi-stars me-1" aria-hidden="true" />
              Partenaire Premium — Flotte Privilège
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

      {/* ── 5 KPI desktop (avec mini-sparklines) ────────────────────────── */}
      <ClientKpiCards metrics={stats} columns={5} loading={isLoading && !data} />

      {/* ── 3 colonnes graphiques : Donut · Area · Alertes ──────────────── */}
      <div className="row g-3 mb-4 navix-client-animate">
        <div className="col-xl-4 col-lg-6">
          <Card
            className="h-100"
            title={
              <span className="d-flex align-items-center gap-2">
                <i className="bi bi-pie-chart text-primary" aria-hidden="true" />
                <span>Revenus par activité</span>
                <span className="badge bg-primary-subtle text-primary ms-1">Mois</span>
              </span>
            }
          >
            <DonutChart
              data={activityDistribution}
              size={168}
              title="Répartition des revenus par activité"
              formatValue={formatDonutValue}
              totalLabel="Revenus du mois"
            />
          </Card>
        </div>
        <div className="col-xl-5 col-lg-6">
          <Card
            className="h-100"
            title={
              <span className="d-flex align-items-center gap-2">
                <i className="bi bi-graph-up-arrow text-success" aria-hidden="true" />
                <span>Évolution des revenus — 6 mois</span>
              </span>
            }
          >
            <AreaChart data={revenueEvolution} height={260} showDots title="Évolution des revenus et sorties — 6 mois" />
          </Card>
        </div>
        <div className="col-xl-3 col-lg-6">
          <PartnerAlertsCard alerts={alerts} />
        </div>
      </div>

      {/* ── 3 blocs inférieurs : Missions · Performance · Activité ──────── */}
      <div className="row g-3 mb-4 navix-client-animate">
        <div className="col-xl-4 col-lg-6">
          <PartnerMissionsCard missions={missions} loading={isLoading && !data} />
        </div>
        <div className="col-xl-4 col-lg-6">
          <PartnerVehiclePerformanceCard vehicles={vehiclePerformance} loading={isLoading && !data} />
        </div>
        <div className="col-xl-4 col-lg-6">
          <RecentActivityList activities={recentActivities} />
        </div>
      </div>

      {/* ── Situation Financière (actions finance réelles) ──────────────── */}
      <div className="navix-client-animate">
        <Card
          className="mb-4"
          title={
            <div className="d-flex align-items-center justify-content-between w-100 flex-wrap gap-2">
              <span className="d-flex align-items-center gap-2">
                <i className="bi bi-cash-stack text-success" aria-hidden="true" />
                <span>Situation financière</span>
                <span className="badge bg-success-subtle text-success ms-1">FCFA</span>
              </span>
              <span className="d-flex align-items-center gap-2 flex-wrap">
                <Link to={ROUTES.PARTNER_FINANCE} className="btn btn-sm btn-outline-success">
                  Voir mes finances
                  <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
                </Link>
                <Link to={ROUTES.PARTNER_FINANCE_TRANSACTIONS} className="btn btn-sm btn-outline-secondary">
                  Transactions
                  <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
                </Link>
              </span>
            </div>
          }
        >
          <div className="row g-3">
            <div className="col-xl-8">
              <div className="row g-3">
                {financeStats.map((stat) => (
                  <div key={stat.key} className="col-6 col-lg-3">
                    <div className="navix-client-finance__row">
                      <span className={`navix-client-finance__icon navix-client-finance__icon--${stat.variant}`}>
                        <i className={`bi ${stat.icon}`} aria-hidden="true" />
                      </span>
                      <div className="d-flex flex-column overflow-hidden">
                        <span className="navix-client-finance__label">{stat.label}</span>
                        <span className="navix-client-finance__value text-truncate">{stat.value}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {financeSummary?.recentTransactions?.length > 0 && (
                <p className="small text-muted mt-3 mb-0">
                  <i className="bi bi-clock-history me-1" aria-hidden="true" />
                  Dernières opérations :{' '}
                  {financeSummary.recentTransactions
                    .map((item) => `${item.reference} — ${formatNumber(item.amount)} FCFA`)
                    .join(' · ')}
                </p>
              )}
            </div>
            <div className="col-xl-4">
              <div className="p-3 rounded-3 border bg-body-tertiary h-100 d-flex flex-column gap-2">
                <span className="small text-muted fw-semibold text-uppercase">Actions financières</span>
                <PartnerFinanceActions
                  onDeposit={() => openOperation('deposit')}
                  onWithdraw={() => openOperation('withdrawal')}
                  onTransfer={() => openOperation('transfer')}
                  onPayment={() => openOperation('payment')}
                />
                <span className="small text-muted">
                  Opérations enregistrées dans votre portefeuille partenaire ({wallet?.currency || 'FCFA'}).
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Modales finance (partagées avec le centre financier) ────────── */}
      <ClientFinanceOperationModal
        open={operationOpen}
        onClose={closeOperation}
        mode={operationMode}
        availableBalance={wallet?.balance ?? 0}
        reference={reference}
        onSubmit={handleOperationSubmit}
        loading={false}
      />

      <ClientFinanceConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        summary={summary}
        onConfirm={handleConfirm}
        loading={isSaving}
        error={operationError}
      />
    </PageContainer>
  );
};

export default PartnerDashboardPage;
