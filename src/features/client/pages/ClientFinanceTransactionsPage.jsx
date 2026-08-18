/**
 * Navix Client — ClientFinanceTransactionsPage (PROMPT 059)
 * --------------------------------------------------------------------------
 * Historique des transactions financières (FCFA) du Client Entreprise :
 * recherche instantanée, filtres (Type / Statut / Sens / Période), tri et
 * pagination. Vue lecture seule — les opérations sont créées depuis le
 * centre financier (Fonds).
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
  EmptyState,
  MetricCard,
  ConfirmDialog,
} from '@/components/core';
import { useState } from 'react';
import { useCan } from '@/features/rbac/hooks';
import { PERMISSIONS } from '@/features/rbac/constants';
import { ROUTES } from '@/routes/route.constants';
import { formatNumber } from '@/utils/format';
import { useClientData } from '../hooks/useClientData';
import { useClientFinance } from '../hooks/useClientFinance';
import { getTransactionType, transactionDirectionOf, FCFA_LABEL } from '../constants/client.constants';
import ClientFinanceTransactionsTable from '../components/ClientFinance/ClientFinanceTransactionsTable';
import '../components/ClientFinance/ClientFinance.css';

const ClientFinanceTransactionsPage = () => {
  const { currentClient, isEnterprise } = useClientData();
  const navigate = useNavigate();
  const can = useCan();
  const { transactions, statistics, isLoading, error, refetch, reverseTransaction } = useClientFinance();

  const [reverseTarget, setReverseTarget] = useState(null);
  const [isReversing, setIsReversing] = useState(false);
  const [reverseError, setReverseError] = useState('');

  const handleReverse = async () => {
    if (!reverseTarget) return;
    setIsReversing(true);
    setReverseError('');
    try {
      await reverseTransaction(reverseTarget.id);
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
        <title>Transactions — Navix Client</title>
      </Helmet>

      <PageHeader
        title="Transactions"
        subtitle={
          isEnterprise
            ? `Historique des opérations financières de ${currentClient?.companyName || 'votre entreprise'} (${FCFA_LABEL}).`
            : 'Les transactions financières ne sont pas disponibles pour un client particulier.'
        }
        icon="bi-arrow-repeat"
        breadcrumbs={[{ label: 'Espace Client', to: ROUTES.CLIENT_DASHBOARD }, { label: 'Finances', to: ROUTES.CLIENT_FINANCE }, { label: 'Transactions' }]}
        actions={
          <Button variant="ghost" size="sm" icon="bi-arrow-clockwise" onClick={refetch} aria-label="Actualiser">
            <span className="visually-hidden">Actualiser</span>
          </Button>
        }
      />

      {!isEnterprise ? (
        <EmptyState
          icon="bi-arrow-repeat"
          title="Transactions indisponibles"
          description="En tant que client particulier, l’historique des transactions n’est pas disponible. Basculez en profil Entreprise pour y accéder."
        />
      ) : (
        <>
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
            canReverse={can(PERMISSIONS.CLIENT_FINANCE_CREATE)}
            onView={(item) => navigate(`/client/finance/transactions/${item.id}`)}
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
        </>
      )}
    </PageContainer>
  );
};

export default ClientFinanceTransactionsPage;
