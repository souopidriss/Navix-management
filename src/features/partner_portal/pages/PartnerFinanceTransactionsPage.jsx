/**
 * Navix Partner Portal — PartnerFinanceTransactionsPage (PROMPT 061)
 * --------------------------------------------------------------------------
 * Historique des transactions financières (FCFA) du Partenaire : recherche
 * instantanée, filtres (Type / Statut / Sens / Période), tri et pagination.
 * Vue lecture seule — les opérations sont créées depuis le centre financier.
 */
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui';
import {
  PageContainer,
  PageHeader,
  LoadingState,
  ErrorState,
  MetricCard,
  ConfirmDialog,
} from '@/components/core';
import { useState } from 'react';
import { useCan } from '@/features/rbac/hooks';
import { PERMISSIONS } from '@/features/rbac/constants';
import { ROUTES } from '@/routes/route.constants';
import { formatNumber } from '@/utils/format';
import { partnerTransactionDetailPath } from '@/routes/route.constants';
import { usePartnerContext } from '../hooks/usePartnerContext';
import { usePartnerFinance } from '../hooks/usePartnerFinance';
import { getTransactionType, transactionDirectionOf, FCFA_LABEL } from '../constants/partner.constants';
import ClientFinanceTransactionsTable from '@/features/client/components/ClientFinance/ClientFinanceTransactionsTable';
import '@/features/client/components/ClientFinance/ClientFinance.css';

const PartnerFinanceTransactionsPage = () => {
  const { companyName } = usePartnerContext();
  const navigate = useNavigate();
  const can = useCan();
  const { transactions, statistics, isLoading, error, refetch, reverse } = usePartnerFinance();

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
      setReverseError(err?.message || 'Impossible d’annuler la transaction.');
    } finally {
      setIsReversing(false);
    }
  };

  if (isLoading && transactions.length === 0) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={4} label="Chargement de vos transactions…" />
      </PageContainer>
    );
  }

  if (error && transactions.length === 0) {
    return (
      <PageContainer>
        <ErrorState
          title="Impossible de charger vos transactions"
          description="Les données sont temporairement indisponibles."
          retry={refetch}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Helmet>
        <title>Transactions — Navix Partenaire</title>
      </Helmet>

      <PageHeader
        title="Transactions"
        subtitle={`Historique des opérations financières de ${companyName || 'votre entreprise partenaire'} (${FCFA_LABEL}).`}
        icon="bi-arrow-repeat"
        breadcrumbs={[{ label: 'Espace Partenaire', to: ROUTES.PARTNER_DASHBOARD }, { label: 'Finances', to: ROUTES.PARTNER_FINANCE }, { label: 'Transactions' }]}
        actions={
          <Button variant="ghost" size="sm" icon="bi-arrow-clockwise" onClick={refetch} aria-label="Actualiser">
            <span className="visually-hidden">Actualiser</span>
          </Button>
        }
      />

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <MetricCard
            label="Transactions"
            value={statistics?.transactionsCount ?? 0}
            icon="bi-arrow-repeat"
            variant="primary"
          />
        </div>
        <div className="col-6 col-lg-3">
          <MetricCard
            label="Transactions du mois"
            value={statistics?.transactionsMonth ?? 0}
            icon="bi-calendar2-check"
            variant="info"
          />
        </div>
        <div className="col-6 col-lg-3">
          <MetricCard
            label="Entrées du mois"
            value={`${formatNumber(statistics?.incomeMonth ?? 0)} ${FCFA_LABEL}`}
            icon="bi-arrow-down-circle"
            variant="success"
          />
        </div>
        <div className="col-6 col-lg-3">
          <MetricCard
            label="Sorties du mois"
            value={`${formatNumber(statistics?.expenseMonth ?? 0)} ${FCFA_LABEL}`}
            icon="bi-arrow-up-circle"
            variant="danger"
          />
        </div>
      </div>

      <ClientFinanceTransactionsTable
        transactions={transactions}
        loading={isLoading}
        canReverse={can(PERMISSIONS.PARTNER_FINANCE_CREATE)}
        onView={(item) => navigate(partnerTransactionDetailPath(item.id))}
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
                Vous êtes sur le point d’annuler la transaction{' '}
                <strong className="font-monospace">{reverseTarget.reference}</strong> (
                {getTransactionType(reverseTarget.type).label} — {formatNumber(reverseTarget.amount)} {FCFA_LABEL}).
              </p>
              <p className="mb-0 small text-secondary">
                Un remboursement compensatoire (
                {transactionDirectionOf(reverseTarget) === 'in' ? 'sortie' : 'entrée'} de{' '}
                {formatNumber(reverseTarget.amount)} {FCFA_LABEL}) sera créé. L’historique reste intact.
              </p>
            </>
          ) : null
        }
      />
    </PageContainer>
  );
};

export default PartnerFinanceTransactionsPage;
