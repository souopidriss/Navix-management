/**
 * Navix Partner Portal — PartnerFinancePage (PROMPT 061)
 * --------------------------------------------------------------------------
 * Centre financier de l'Espace Partenaire : solde disponible (FCFA), KPIs,
 * évolution Entrées / Sorties / Solde (7/30/90 j), actions (ajouter des
 * fonds, effectuer une transaction, retirer, transférer) et historique des
 * transactions. Données simulées — aucune opération réelle.
 *
 * Règles : FCFA uniquement, ledger cohérent, aucune transaction pour le
 * rôle Chauffeur (gardé par ROUTE_META et par le service financier).
 */
import { useState } from 'react';
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
import { useCan } from '@/features/rbac/hooks';
import { PERMISSIONS } from '@/features/rbac/constants';
import { ROUTES } from '@/routes/route.constants';
import { formatNumber } from '@/utils/format';
import { partnerTransactionDetailPath } from '@/routes/route.constants';
import { usePartnerContext } from '../hooks/usePartnerContext';
import { usePartnerFinance } from '../hooks/usePartnerFinance';
import {
  getTransactionType,
  transactionDirectionOf,
  FCFA_LABEL,
} from '../constants/partner.constants';
import ClientFinanceBalanceCard from '@/features/client/components/ClientFinance/ClientFinanceBalanceCard';
import ClientFinanceEvolutionChart from '@/features/client/components/ClientFinance/ClientFinanceEvolutionChart';
import ClientFinanceTransactionsTable from '@/features/client/components/ClientFinance/ClientFinanceTransactionsTable';
import ClientFinanceOperationModal from '@/features/client/components/ClientFinance/ClientFinanceOperationModal';
import ClientFinanceConfirmModal from '@/features/client/components/ClientFinance/ClientFinanceConfirmModal';
import PartnerFinanceActions from '../components/PartnerFinance/PartnerFinanceActions';
import '@/features/client/components/ClientFinance/ClientFinance.css';

const SUCCESS_TOAST = {
  deposit: 'Fonds ajoutés à votre portefeuille.',
  withdrawal: 'Retrait enregistré.',
  transfer: 'Transfert enregistré.',
  payment: 'Transaction enregistrée.',
};

const PartnerFinancePage = () => {
  const { companyName } = usePartnerContext();
  const navigate = useNavigate();
  const can = useCan();
  const {
    wallet,
    transactions,
    statistics,
    isLoading,
    error,
    refetch,
    createDeposit,
    createWithdrawal,
    createTransfer,
    createPayment,
    reverse,
    previewReference,
  } = usePartnerFinance();

  const [operationMode, setOperationMode] = useState(null);
  const [operationOpen, setOperationOpen] = useState(false);
  const [operationError, setOperationError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [reference, setReference] = useState('');
  const [pendingPayload, setPendingPayload] = useState(null);
  const [summary, setSummary] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reverseTarget, setReverseTarget] = useState(null);
  const [isReversing, setIsReversing] = useState(false);
  const [reverseError, setReverseError] = useState('');

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
      refetch();
    } catch (err) {
      setOperationError(err?.message || 'Impossible d’enregistrer l’opération.');
    } finally {
      setIsSaving(false);
    }
  };

  const openReverse = (item) => {
    setReverseTarget(item);
    setReverseError('');
  };

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

  if (isLoading && !wallet) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={4} label="Chargement de vos données financières…" />
      </PageContainer>
    );
  }

  if (error && !wallet) {
    return (
      <PageContainer>
        <ErrorState
          title="Impossible de charger vos données financières"
          description="Les données sont temporairement indisponibles."
          retry={refetch}
        />
      </PageContainer>
    );
  }

  const canCreate = can(PERMISSIONS.PARTNER_FINANCE_CREATE);

  return (
    <PageContainer>
      <Helmet>
        <title>Finances — Navix Partenaire</title>
      </Helmet>

      <PageHeader
        title="Finances"
        subtitle={`Gérez vos fonds et suivez les opérations de ${companyName || 'votre entreprise partenaire'} (${FCFA_LABEL}).`}
        icon="bi-wallet2"
        breadcrumbs={[{ label: 'Espace Partenaire', to: ROUTES.PARTNER_DASHBOARD }, { label: 'Finances' }]}
        actions={
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <PartnerFinanceActions
              onDeposit={() => openOperation('deposit')}
              onWithdraw={() => openOperation('withdrawal')}
              onTransfer={() => openOperation('transfer')}
              onPayment={() => openOperation('payment')}
            />
            <Button variant="ghost" size="sm" icon="bi-arrow-clockwise" onClick={refetch} aria-label="Actualiser">
              <span className="visually-hidden">Actualiser</span>
            </Button>
          </div>
        }
      />

      <div className="row g-3 mb-4">
        <div className="col-12 col-xl-4">
          <ClientFinanceBalanceCard wallet={wallet} statistics={statistics} />
        </div>
        <div className="col-12 col-xl-8">
          <ClientFinanceEvolutionChart transactions={transactions} />
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <MetricCard
            label="Solde disponible"
            value={`${formatNumber(statistics?.balance ?? 0)} ${FCFA_LABEL}`}
            icon="bi-wallet2"
            variant="success"
          />
        </div>
        <div className="col-6 col-lg-3">
          <MetricCard
            label="Total entrées"
            value={`${formatNumber(statistics?.totalIncome ?? 0)} ${FCFA_LABEL}`}
            icon="bi-arrow-down-circle"
            variant="primary"
          />
        </div>
        <div className="col-6 col-lg-3">
          <MetricCard
            label="Total sorties"
            value={`${formatNumber(statistics?.totalExpense ?? 0)} ${FCFA_LABEL}`}
            icon="bi-arrow-up-circle"
            variant="danger"
          />
        </div>
        <div className="col-6 col-lg-3">
          <MetricCard
            label="Transactions du mois"
            value={statistics?.transactionsMonth ?? 0}
            icon="bi-arrow-repeat"
            variant="info"
          />
        </div>
      </div>

      <ClientFinanceTransactionsTable
        transactions={transactions}
        loading={isLoading}
        canReverse={canCreate}
        onView={(item) => navigate(partnerTransactionDetailPath(item.id))}
        onReverse={openReverse}
      />

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
                {getTransactionType(reverseTarget.type).label} —{' '}
                {formatNumber(reverseTarget.amount)} {FCFA_LABEL}).
              </p>
              <p className="mb-0 small text-secondary">
                Un remboursement compensatoire ({transactionDirectionOf(reverseTarget) === 'in' ? 'sortie' : 'entrée'}{' '}
                de {formatNumber(reverseTarget.amount)} {FCFA_LABEL}) sera créé. L’historique reste intact.
              </p>
            </>
          ) : null
        }
      />
    </PageContainer>
  );
};

export default PartnerFinancePage;
