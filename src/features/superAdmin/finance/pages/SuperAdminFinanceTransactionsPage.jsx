/**
 * Navix Super Admin — SuperAdminFinanceTransactionsPage (SA-FIN-03)
 * --------------------------------------------------------------------------
 * Historique complet des transactions financières plateforme : recherche,
 * filtres (Type / Direction / Statut / Période / Dates), KPI, tri,
 * pagination, détail et annulation. Vue globale du Super Admin.
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState, ErrorState, MetricCard, ConfirmDialog } from '@/components/core';
import { useSuperAdminFinance } from '../hooks/useSuperAdminFinance';
import {
  transactionDirectionOf,
  isTransactionEffective,
  FCFA_LABEL,
} from '../constants/superAdminFinance.constants';
import { formatNumber } from '@/utils/format';
import { ROUTES, saTransactionDetailPath } from '@/routes/route.constants';
import SuperAdminTransactionsTable from '../components/SuperAdminTransactionsTable';

const amountOf = (t) => Number(t.amount) || 0;

const SuperAdminFinanceTransactionsPage = () => {
  const navigate = useNavigate();
  const { transactions, statistics, isLoading, error, refetch, reverse } = useSuperAdminFinance();

  const [reverseTarget, setReverseTarget] = useState(null);
  const [isReversing, setIsReversing] = useState(false);
  const [reverseError, setReverseError] = useState('');

  const handleReverse = async () => {
    if (!reverseTarget) return;
    setIsReversing(true);
    setReverseError('');
    try {
      await reverse(reverseTarget.id);
      toast.success('Transaction annulée et remboursée.');
      setReverseTarget(null);
      refetch();
    } catch (err) {
      setReverseError(err?.message || 'Impossible d\u2019annuler la transaction.');
    } finally {
      setIsReversing(false);
    }
  };

  const kpis = useMemo(() => {
    const effective = transactions.filter(isTransactionEffective);
    const totalIn = effective
      .filter((t) => transactionDirectionOf(t) === 'in')
      .reduce((sum, t) => sum + amountOf(t), 0);
    const totalOut = effective
      .filter((t) => transactionDirectionOf(t) === 'out')
      .reduce((sum, t) => sum + amountOf(t), 0);
    return {
      total: transactions.length,
      completed: statistics?.completedCount ?? effective.length,
      pending: statistics?.pendingCount ?? transactions.filter((t) => t.status === 'pending').length,
      totalIn,
      totalOut,
    };
  }, [transactions, statistics]);

  if (isLoading && transactions.length === 0) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={4} label="Chargement des transactions…" />
      </PageContainer>
    );
  }

  if (error && transactions.length === 0) {
    return (
      <PageContainer>
        <ErrorState
          title="Impossible de charger les transactions"
          description="Les données sont temporairement indisponibles."
          retry={refetch}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Helmet>
        <title>Transactions — Navix Super Admin</title>
      </Helmet>

      <PageHeader
        title="Transactions financières"
        subtitle={`Historique des opérations financières de la plateforme (${FCFA_LABEL}).`}
        icon="bi-arrow-repeat"
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Finance', to: ROUTES.SA_FINANCE },
          { label: 'Transactions' },
        ]}
        actions={
          <Button variant="ghost" size="sm" icon="bi-arrow-clockwise" onClick={refetch} aria-label="Actualiser">
            <span className="visually-hidden">Actualiser</span>
          </Button>
        }
      />

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3 col-xl">
          <MetricCard
            label="Total transactions"
            value={kpis.total}
            icon="bi-arrow-repeat"
            variant="primary"
          />
        </div>
        <div className="col-6 col-lg-3 col-xl">
          <MetricCard
            label="Terminées"
            value={kpis.completed}
            icon="bi-check-circle"
            variant="success"
          />
        </div>
        <div className="col-6 col-lg-3 col-xl">
          <MetricCard
            label="En attente"
            value={kpis.pending}
            icon="bi-hourglass-split"
            variant="warning"
          />
        </div>
        <div className="col-6 col-lg-3 col-xl">
          <MetricCard
            label="Total entrées"
            value={`${formatNumber(kpis.totalIn)} ${FCFA_LABEL}`}
            icon="bi-arrow-down-circle"
            variant="info"
          />
        </div>
        <div className="col-6 col-lg-3 col-xl">
          <MetricCard
            label="Total sorties"
            value={`${formatNumber(kpis.totalOut)} ${FCFA_LABEL}`}
            icon="bi-arrow-up-circle"
            variant="danger"
          />
        </div>
      </div>

      <SuperAdminTransactionsTable
        transactions={transactions}
        loading={isLoading}
        canReverse={true}
        onView={(item) => navigate(saTransactionDetailPath(item.id))}
        onReverse={setReverseTarget}
      />

      <ConfirmDialog
        open={Boolean(reverseTarget)}
        onClose={() => setReverseTarget(null)}
        title="Annuler cette transaction"
        icon="bi-arrow-counterclockwise"
        confirmLabel="Annuler et rembourser"
        confirmVariant="danger"
        loading={isReversing}
        error={reverseError}
        onConfirm={handleReverse}
        message={
          reverseTarget ? (
            <>
              <p className="mb-2">
                Vous êtes sur le point d'annuler la transaction{' '}
                <strong className="font-monospace">{reverseTarget.reference}</strong> ({formatNumber(reverseTarget.amount)} {FCFA_LABEL}).
              </p>
              <p className="mb-0 small text-secondary">
                Un remboursement compensatoire sera créé. L'historique reste intact.
              </p>
            </>
          ) : null
        }
      />
    </PageContainer>
  );
};

export default SuperAdminFinanceTransactionsPage;
