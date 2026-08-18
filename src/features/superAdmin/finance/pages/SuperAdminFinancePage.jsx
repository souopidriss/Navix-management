import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Button, Card } from '@/components/ui';
import {
  PageContainer,
  PageHeader,
  LoadingState,
  ErrorState,
  MetricCard,
} from '@/components/core';
import { ROUTES } from '@/routes/route.constants';
import { formatNumber, formatDateTime, formatDate } from '@/utils/format';
import { useSuperAdminFinance } from '../hooks/useSuperAdminFinance';
import {
  FCFA_LABEL,
  getSaTransactionType,
  getTransactionStatus,
  transactionDirectionOf,
} from '../constants/superAdminFinance.constants';
import AreaChart from '@/features/reports/components/charts/AreaChart';
import DonutChart from '@/features/reports/components/charts/DonutChart';
import SuperAdminDepositModal from '../components/SuperAdminDepositModal';
import SuperAdminWithdrawalModal from '../components/SuperAdminWithdrawalModal';
import SuperAdminTransferModal from '../components/SuperAdminTransferModal';
import SuperAdminConfirmModal from '../components/SuperAdminConfirmModal';
import '../pages/SuperAdminFinancePage.css';

const ACTIVITY_LIMIT = 6;

const buildMonthlyChartData = (transactions) => {
  const monthly = {};
  transactions.forEach((tx) => {
    if (tx.status !== 'success') return;
    const key = String(tx.createdAt).slice(0, 7);
    if (!monthly[key]) monthly[key] = { income: 0, outcome: 0 };
    if (tx.direction === 'in') monthly[key].income += Number(tx.amount) || 0;
    else monthly[key].outcome += Number(tx.amount) || 0;
  });
  const sorted = Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b));
  const labels = sorted.map(([k]) => k);
  return {
    labels,
    datasets: [
      { key: 'income', label: 'Entrées', values: sorted.map(([, v]) => v.income), variant: 'success' },
      { key: 'outcome', label: 'Sorties', values: sorted.map(([, v]) => v.outcome), variant: 'danger' },
    ],
  };
};

const buildBreakdownData = (statistics) => {
  const items = [
    { label: 'Commissions', value: statistics?.totalCommission || 0, variant: 'success' },
    { label: 'Frais', value: statistics?.totalFees || 0, variant: 'danger' },
    { label: 'Remboursements', value: statistics?.totalRefunds || 0, variant: 'warning' },
  ].filter((item) => item.value > 0);
  if (items.length === 0) return null;
  return {
    labels: items.map((i) => i.label),
    values: items.map((i) => i.value),
    variants: items.map((i) => i.variant),
  };
};

const SuperAdminFinancePage = () => {
  const navigate = useNavigate();
  const {
    fund,
    statistics,
    transactions,
    isLoading,
    error,
    refetch,
    previewReference,
    createDeposit,
    createWithdrawal,
    createTransferOut,
  } = useSuperAdminFinance();

  const [modalType, setModalType] = useState(null);
  const [confirmSummary, setConfirmSummary] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [operationError, setOperationError] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  const openModal = useCallback((type) => {
    setModalType(type);
    setOperationError('');
  }, []);

  const closeModal = useCallback(() => {
    setModalType(null);
    setOperationError('');
  }, []);

  const handleFormSubmit = useCallback(async (payload) => {
    const balanceBefore = Number(statistics?.balance) || 0;
    const amount = Number(payload.amount) || 0;
    const isIn = modalType === 'deposit';
    const newBalance = isIn ? balanceBefore + amount : balanceBefore - amount;
    let ref = '';
    try { ref = await previewReference(); } catch { /* fallback */ }

    setConfirmSummary({
      type: modalType,
      direction: isIn ? 'in' : 'out',
      amount,
      balanceBefore,
      newBalance,
      source: payload.source || payload.destination || '',
      destination: payload.destination || '',
      description: payload.description,
      reference: ref,
    });
    setPendingAction(() => async () => {
      setIsSaving(true);
      setOperationError('');
      try {
        if (modalType === 'deposit') await createDeposit(payload);
        else if (modalType === 'withdrawal') await createWithdrawal(payload);
        else if (modalType === 'transfer') await createTransferOut(payload);
        toast.success('Opération enregistrée avec succès.');
        setConfirmSummary(null);
        setPendingAction(null);
        closeModal();
        refetch();
      } catch (err) {
        setOperationError(err?.message || 'Impossible d\'enregistrer l\'opération.');
        setConfirmSummary(null);
        setPendingAction(null);
      } finally {
        setIsSaving(false);
      }
    });
  }, [modalType, statistics, previewReference, createDeposit, createWithdrawal, createTransferOut, refetch, closeModal]);

  const handleConfirm = useCallback(async () => {
    if (pendingAction) await pendingAction();
  }, [pendingAction]);

  const handleConfirmClose = useCallback(() => {
    setConfirmSummary(null);
    setPendingAction(null);
    setOperationError('');
  }, []);

  const dismissAlert = useCallback((idx) => {
    setDismissedAlerts((prev) => [...prev, idx]);
  }, []);

  const chartData = useMemo(() => buildMonthlyChartData(transactions), [transactions]);
  const breakdownData = useMemo(() => buildBreakdownData(statistics), [statistics]);

  const alerts = useMemo(() => {
    const list = [];
    const pendingCount = statistics?.pendingCount || 0;
    const pendingBalance = statistics?.pendingBalance || 0;
    const balance = statistics?.balance || 0;
    if (pendingCount > 0) {
      list.push({ type: 'warning', icon: 'bi-hourglass-split', text: `${pendingCount} transaction(s) en attente — ${formatNumber(pendingBalance)} ${FCFA_LABEL}` });
    }
    const failedCount = statistics?.failedCount || 0;
    if (failedCount > 0) {
      list.push({ type: 'danger', icon: 'bi-x-circle', text: `${failedCount} transaction(s) en échec nécessitant une attention.` });
    }
    if (balance > 0 && balance < 10_000_000) {
      list.push({ type: 'info', icon: 'bi-info-circle', text: `Solde plateforme inférieur à 10 000 000 ${FCFA_LABEL}.` });
    }
    return list;
  }, [statistics]);

  const visibleAlerts = alerts.filter((_, i) => !dismissedAlerts.includes(i));

  if (isLoading && !fund) {
    return (
      <PageContainer>
        <Helmet><title>Finance Plateforme — Navix</title></Helmet>
        <LoadingState variant="cards" rows={4} label="Chargement de la finance plateforme…" />
      </PageContainer>
    );
  }

  if (error && !fund) {
    return (
      <PageContainer>
        <Helmet><title>Finance Plateforme — Navix</title></Helmet>
        <ErrorState
          title="Impossible de charger les données financières"
          description="Les données sont temporairement indisponibles."
          retry={refetch}
        />
      </PageContainer>
    );
  }

  const balance = Number(statistics?.balance) || 0;
  const available = Number(statistics?.availableBalance) || 0;
  const pending = Number(statistics?.pendingBalance) || 0;
  const totalIn = Number(statistics?.totalIn) || 0;
  const totalOut = Number(statistics?.totalOut) || 0;
  const txCount = statistics?.transactionCount || 0;
  const recentTx = transactions.slice(0, ACTIVITY_LIMIT);

  return (
    <PageContainer>
      <Helmet><title>Finance Plateforme — Navix</title></Helmet>

      <PageHeader
        title="Finance Plateforme"
        subtitle="Vue d'ensemble financière de Navix Management"
        icon="bi-wallet2"
        breadcrumbs={[{ label: 'Dashboard', to: ROUTES.DASHBOARD }, { label: 'Finance' }]}
        actions={
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Button variant="primary" size="sm" icon="bi-plus-lg" onClick={() => openModal('deposit')}>
              Alimenter
            </Button>
            <Button variant="ghost" size="sm" icon="bi-arrow-clockwise" onClick={refetch} aria-label="Actualiser">
              <span className="visually-hidden">Actualiser</span>
            </Button>
          </div>
        }
      />

      {visibleAlerts.length > 0 && (
        <div className="mb-4" role="alert" aria-label="Alertes financières">
          {visibleAlerts.map((alert, idx) => (
            <div key={idx} className={`navix-sa-alert navix-sa-alert--${alert.type} mb-2`}>
              <i className={`bi ${alert.icon} navix-sa-alert__icon`} aria-hidden="true" />
              <span className="navix-sa-alert__text">{alert.text}</span>
              <button className="navix-sa-alert__dismiss" onClick={() => dismissAlert(idx)} aria-label="Fermer l'alerte">
                <i className="bi bi-x" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-12 col-xl-5">
          <div className="navix-sa-balance" role="region" aria-label="Solde plateforme">
            <div className="navix-sa-balance__label">
              <i className="bi bi-shield-check" aria-hidden="true" />
              Solde plateforme
            </div>
            <div className="navix-sa-balance__amount">
              {formatNumber(balance)} {FCFA_LABEL}
            </div>
            <div className="navix-sa-balance__sub">
              <div className="navix-sa-balance__sub-item">
                <span className="navix-sa-balance__sub-label">Disponible</span>
                <span className="navix-sa-balance__sub-value">{formatNumber(available)} {FCFA_LABEL}</span>
              </div>
              <div className="navix-sa-balance__sub-item">
                <span className="navix-sa-balance__sub-label">En attente</span>
                <span className="navix-sa-balance__sub-value">{formatNumber(pending)} {FCFA_LABEL}</span>
              </div>
              {fund?.updatedAt && (
                <div className="navix-sa-balance__sub-item">
                  <span className="navix-sa-balance__sub-label">Mis à jour</span>
                  <span className="navix-sa-balance__sub-value">{formatDateTime(fund.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-12 col-xl-7">
          <div className="row g-3">
            <div className="col-6 col-lg-4">
              <MetricCard label="Disponible" value={`${formatNumber(available)} ${FCFA_LABEL}`} icon="bi-wallet2" variant="success" />
            </div>
            <div className="col-6 col-lg-4">
              <MetricCard label="En attente" value={`${formatNumber(pending)} ${FCFA_LABEL}`} icon="bi-hourglass-split" variant="warning" />
            </div>
            <div className="col-6 col-lg-4">
              <MetricCard label="Transactions" value={String(txCount)} icon="bi-receipt" variant="info" />
            </div>
            <div className="col-6 col-lg-4">
              <MetricCard label="Total entrées" value={`${formatNumber(totalIn)} ${FCFA_LABEL}`} icon="bi-arrow-down-circle" variant="primary" />
            </div>
            <div className="col-6 col-lg-4">
              <MetricCard label="Total sorties" value={`${formatNumber(totalOut)} ${FCFA_LABEL}`} icon="bi-arrow-up-circle" variant="danger" />
            </div>
            <div className="col-6 col-lg-4">
              <MetricCard label="Ce mois" value={`${formatNumber(statistics?.incomeMonth || 0)} ${FCFA_LABEL}`} icon="bi-calendar-check" variant="dark" />
            </div>
          </div>
        </div>
      </div>

      <h3 className="navix-sa-section-title">Actions rapides</h3>
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <button className="navix-sa-action-card w-100" onClick={() => openModal('deposit')} aria-label="Alimenter les fonds">
            <div className="navix-sa-action-card__icon navix-sa-action-card__icon--deposit">
              <i className="bi bi-arrow-down-circle" aria-hidden="true" />
            </div>
            <p className="navix-sa-action-card__title mb-0">Alimenter</p>
            <p className="navix-sa-action-card__desc mb-0">Ajouter des fonds</p>
          </button>
        </div>
        <div className="col-6 col-md-3">
          <button className="navix-sa-action-card w-100" onClick={() => openModal('withdrawal')} aria-label="Retirer des fonds">
            <div className="navix-sa-action-card__icon navix-sa-action-card__icon--withdrawal">
              <i className="bi bi-arrow-up-circle" aria-hidden="true" />
            </div>
            <p className="navix-sa-action-card__title mb-0">Retirer</p>
            <p className="navix-sa-action-card__desc mb-0">Retirer des fonds</p>
          </button>
        </div>
        <div className="col-6 col-md-3">
          <button className="navix-sa-action-card w-100" onClick={() => openModal('transfer')} aria-label="Transférer des fonds">
            <div className="navix-sa-action-card__icon navix-sa-action-card__icon--transfer">
              <i className="bi bi-arrow-left-right" aria-hidden="true" />
            </div>
            <p className="navix-sa-action-card__title mb-0">Transférer</p>
            <p className="navix-sa-action-card__desc mb-0">Envoyer vers destination</p>
          </button>
        </div>
        <div className="col-6 col-md-3">
          <button className="navix-sa-action-card w-100" onClick={() => navigate(ROUTES.SA_FINANCE_TRANSACTIONS)} aria-label="Voir l'historique">
            <div className="navix-sa-action-card__icon navix-sa-action-card__icon--history">
              <i className="bi bi-clock-history" aria-hidden="true" />
            </div>
            <p className="navix-sa-action-card__title mb-0">Historique</p>
            <p className="navix-sa-action-card__desc mb-0">Toutes les transactions</p>
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-8">
          <Card title={<span><i className="bi bi-graph-up me-2" aria-hidden="true" />Évolution financière</span>}>
            {chartData.labels.length > 0 ? (
              <AreaChart data={chartData} height={260} title="Évolution des flux financiers" showDots legend />
            ) : (
              <p className="text-secondary text-center py-4 mb-0">Aucune donnée pour la période.</p>
            )}
          </Card>
        </div>
        <div className="col-12 col-lg-4">
          <Card title={<span><i className="bi bi-pie-chart me-2" aria-hidden="true" />Répartition</span>}>
            {breakdownData ? (
              <DonutChart
                data={breakdownData}
                size={160}
                title="Répartition des flux financiers"
                totalLabel="Total"
                formatValue={(v) => `${formatNumber(v)} ${FCFA_LABEL}`}
              />
            ) : (
              <p className="text-secondary text-center py-4 mb-0">Aucune donnée de répartition.</p>
            )}
          </Card>
        </div>
      </div>

      <Card
        title={<span><i className="bi bi-clock-history me-2" aria-hidden="true" />Activité récente</span>}
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.SA_FINANCE_TRANSACTIONS)}>
            Voir toutes les transactions
          </Button>
        }
      >
        {recentTx.length === 0 ? (
          <p className="text-secondary text-center py-3 mb-0">Aucune transaction récente.</p>
        ) : (
          <div>
            {recentTx.map((tx) => {
              const typeConfig = getSaTransactionType(tx.type);
              const dir = transactionDirectionOf(tx);
              const status = getTransactionStatus(tx.status);
              return (
                <div key={tx.id} className="navix-sa-activity-row">
                  <div
                    className="navix-sa-activity-row__icon"
                    style={{
                      background: `color-mix(in srgb, var(--bs-${typeConfig.variant}) 15%, transparent)`,
                      color: `var(--bs-${typeConfig.variant})`,
                    }}
                    aria-hidden="true"
                  >
                    <i className={`bi ${typeConfig.icon}`} />
                  </div>
                  <div className="navix-sa-activity-row__info">
                    <p className="navix-sa-activity-row__title">
                      {typeConfig.label}
                      {tx.reference && <span className="ms-2 font-monospace text-secondary" style={{ fontSize: '0.7rem' }}>{tx.reference}</span>}
                    </p>
                    <p className="navix-sa-activity-row__meta">
                      {formatDate(tx.createdAt)}
                      {status && <span className={`ms-2 badge bg-${typeConfig.variant} bg-opacity-10 text-${typeConfig.variant}`} style={{ fontSize: '0.65rem' }}>{status.label}</span>}
                    </p>
                  </div>
                  <div className={`navix-sa-activity-row__amount navix-sa-activity-row__amount--${dir}`}>
                    {dir === 'in' ? '+' : '-'}{formatNumber(tx.amount)} {FCFA_LABEL}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <SuperAdminDepositModal
        open={modalType === 'deposit'}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
        loading={isSaving}
        error={operationError}
      />

      <SuperAdminWithdrawalModal
        open={modalType === 'withdrawal'}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
        loading={isSaving}
        error={operationError}
        availableBalance={available}
      />

      <SuperAdminTransferModal
        open={modalType === 'transfer'}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
        loading={isSaving}
        error={operationError}
        availableBalance={available}
      />

      <SuperAdminConfirmModal
        open={Boolean(confirmSummary)}
        onClose={handleConfirmClose}
        summary={confirmSummary}
        onConfirm={handleConfirm}
        loading={isSaving}
        error={operationError}
      />
    </PageContainer>
  );
};

export default SuperAdminFinancePage;
