/**
 * Navix Client — ClientTransactionDetailsPage (PROMPT 059)
 * --------------------------------------------------------------------------
 * Détail d'une transaction financière (FCFA) : référence, type, montant,
 * statut, date, source, destination, description, solde avant / après et
 * moyen de paiement. Une transaction réussie peut être annulée (remboursement
 * compensatoire) — l'historique reste intact.
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Button, Card } from '@/components/ui';
import {
  PageContainer,
  PageHeader,
  LoadingState,
  ErrorState,
  EmptyState,
  StatusBadge,
  ConfirmDialog,
} from '@/components/core';
import { useCan } from '@/features/rbac/hooks';
import { PERMISSIONS } from '@/features/rbac/constants';
import { ROUTES } from '@/routes/route.constants';
import { formatNumber, formatDateTime } from '@/utils/format';
import { useClientData } from '../hooks/useClientData';
import { useClientFinance } from '../hooks/useClientFinance';
import {
  getTransactionType,
  getTransactionStatus,
  transactionDirectionOf,
  FCFA_LABEL,
} from '../constants/client.constants';
import { PAYMENT_METHODS } from '@/features/billing/constants';
import '../components/ClientFinance/ClientFinance.css';

const DetailRow = ({ label, value, mono = false, secondary = false }) => (
  <div className="navix-client-finance__detail-row">
    <span className="navix-client-finance__detail-key">{label}</span>
    <span className={`navix-client-finance__detail-value ${mono ? 'font-monospace' : ''} ${secondary ? 'text-secondary' : ''}`}>
      {value}
    </span>
  </div>
);

const ClientTransactionDetailsPage = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const can = useCan();
  const { isEnterprise } = useClientData();
  const { getTransactionById, reverseTransaction } = useClientFinance();

  const [transaction, setTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reverseOpen, setReverseOpen] = useState(false);
  const [isReversing, setIsReversing] = useState(false);
  const [reverseError, setReverseError] = useState('');

  const fetchTransaction = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getTransactionById(transactionId);
      setTransaction(result);
    } catch (err) {
      setError(err?.message || 'Impossible de charger la transaction.');
    } finally {
      setIsLoading(false);
    }
  }, [getTransactionById, transactionId]);

  useEffect(() => {
    if (isEnterprise) fetchTransaction();
    else setIsLoading(false);
  }, [isEnterprise, fetchTransaction]);

  const handleReverse = async () => {
    setIsReversing(true);
    setReverseError('');
    try {
      await reverseTransaction(transaction.id);
      toast.success('Transaction annulée et remboursée.');
      setReverseOpen(false);
      fetchTransaction();
    } catch (err) {
      setReverseError(err?.message || 'Impossible d’annuler la transaction.');
    } finally {
      setIsReversing(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={3} label="Chargement de la transaction…" />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorState title="Impossible de charger la transaction" description={error} retry={fetchTransaction} />
      </PageContainer>
    );
  }

  if (!isEnterprise || !transaction) {
    return (
      <PageContainer>
        <EmptyState
          icon="bi-wallet2"
          title="Finance non disponible"
          description="La consultation des transactions n'est pas disponible pour ce profil."
        />
      </PageContainer>
    );
  }

  const type = getTransactionType(transaction.type);
  const status = getTransactionStatus(transaction.status);
  const isIn = transactionDirectionOf(transaction) === 'in';
  const canReverse = can(PERMISSIONS.CLIENT_FINANCE_CREATE) && transaction.status === 'success' && !transaction.reversedRef;

  return (
    <PageContainer>
      <Helmet>
        <title>{transaction.reference} — Navix Client</title>
      </Helmet>

      <PageHeader
        title={transaction.reference}
        subtitle="Détail de la transaction financière."
        icon={type.icon}
        breadcrumbs={[
          { label: 'Espace Client', to: ROUTES.CLIENT_DASHBOARD },
          { label: 'Finances', to: ROUTES.CLIENT_FINANCE },
          { label: 'Transactions', to: ROUTES.CLIENT_FINANCE_TRANSACTIONS },
          { label: transaction.reference },
        ]}
        actions={
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {canReverse && (
              <Button variant="danger" size="sm" icon="bi-arrow-counterclockwise" onClick={() => setReverseOpen(true)}>
                Annuler / rembourser
              </Button>
            )}
            <Button variant="ghost" size="sm" icon="bi-arrow-left" onClick={() => navigate(ROUTES.CLIENT_FINANCE_TRANSACTIONS)}>
              Retour
            </Button>
          </div>
        }
      />

      <div className="row g-3">
        <div className="col-12 col-xl-7">
          <Card title="Informations">
            <div className="text-center mb-3">
              <span className={`navix-client-finance__detail-amount ${isIn ? 'navix-client-finance__detail-amount--in' : 'navix-client-finance__detail-amount--out'}`}>
                {isIn ? '+' : '−'} {formatNumber(transaction.amount)} {FCFA_LABEL}
              </span>
              <div className="mt-2 d-flex justify-content-center gap-2">
                <StatusBadge variant={type.variant} label={type.label} icon={type.icon} />
                <StatusBadge variant={status.variant} label={status.label} icon={status.icon} />
              </div>
            </div>
            <DetailRow label="Référence" value={transaction.reference} mono />
            <DetailRow label="Date" value={formatDateTime(transaction.createdAt)} />
            <DetailRow label="Type" value={type.label} />
            <DetailRow label="Sens" value={isIn ? 'Entrée' : 'Sortie'} />
            <DetailRow label="Moyen de paiement" value={PAYMENT_METHODS[transaction.method]?.label || transaction.method || '—'} />
            <DetailRow label="Description" value={transaction.description} secondary />
            {transaction.reversalOf && (
              <DetailRow label="Annulation de" value={transaction.reversalOf} mono />
            )}
            {transaction.reversedRef && (
              <DetailRow label="Annulée par" value={transaction.reversedRef} mono />
            )}
          </Card>
        </div>
        <div className="col-12 col-xl-5">
          <Card title="Traçabilité du solde">
            <DetailRow label="Source" value={transaction.source || '—'} secondary />
            <DetailRow label="Destination" value={transaction.destination || '—'} secondary />
            <DetailRow label="Solde avant" value={`${formatNumber(transaction.balanceBefore)} ${FCFA_LABEL}`} mono />
            <DetailRow label="Solde après" value={`${formatNumber(transaction.balanceAfter)} ${FCFA_LABEL}`} mono />
            <DetailRow
              label="Impact"
              value={`${isIn ? '+' : '−'} ${formatNumber(transaction.amount)} ${FCFA_LABEL}`}
              mono
            />
            <div className="mt-3">
              <span className="badge bg-secondary-subtle text-secondary">
                <i className="bi bi-info-circle me-1" aria-hidden="true" />
                Donnée simulée — aucune opération réelle.
              </span>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={reverseOpen}
        onClose={() => setReverseOpen(false)}
        title="Annuler cette transaction"
        icon="bi-arrow-counterclockwise"
        confirmLabel="Annuler et rembourser"
        confirmVariant="danger"
        loading={isReversing}
        error={reverseError}
        onConfirm={handleReverse}
        message={
          <p className="mb-0">
            Annuler la transaction <strong className="font-monospace">{transaction.reference}</strong> (via un{' '}
            {isIn ? 'retrait' : 'remboursement'} compensatoire de {formatNumber(transaction.amount)} {FCFA_LABEL}) ?
            L’historique reste intact.
          </p>
        }
      />
    </PageContainer>
  );
};

export default ClientTransactionDetailsPage;
