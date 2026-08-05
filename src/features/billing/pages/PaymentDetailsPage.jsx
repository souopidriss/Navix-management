/**
 * Navix Billing — PaymentDetailsPage
 * --------------------------------------------------------------------------
 * Détail d'un paiement simulé : en-tête (numéro, entreprise, statut), moyen
 * de paiement, référence de transaction, montant et informations. Actions :
 * remboursement (paiement réussi) et lien vers la facture associée.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Button, Card } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState, ConfirmDialog } from '@/components/core';
import { ROUTES, invoiceDetailPath } from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useBillingStore } from '../store';
import {
  PaymentStatusBadge,
  PaymentMethodBadge,
  BillingAmount,
  InvoiceStatusBadge,
} from '../components';
import { formatBillingDate, formatBillingDateTime } from '../constants';
import './PaymentDetailsPage.css';

const InfoRow = ({ icon, label, children }) => (
  <div className="d-flex align-items-start gap-3 py-2">
    <span className="navix-payment-detail__icon" aria-hidden="true">
      <i className={`bi ${icon}`} />
    </span>
    <div className="min-w-0">
      <dt className="navix-payment-detail__label">{label}</dt>
      <dd className="navix-payment-detail__value mb-0">{children}</dd>
    </div>
  </div>
);

const PaymentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedPayment = useBillingStore((state) => state.selectedPayment);
  const invoices = useBillingStore((state) => state.invoices);
  const isLoading = useBillingStore((state) => state.isLoading);
  const isSaving = useBillingStore((state) => state.isSaving);
  const error = useBillingStore((state) => state.error);
  const fetchPayment = useBillingStore((state) => state.fetchPayment);
  const fetchInvoices = useBillingStore((state) => state.fetchInvoices);
  const refundPayment = useBillingStore((state) => state.refundPayment);
  const clearError = useBillingStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const [refundOpen, setRefundOpen] = useState(false);
  const [modalError, setModalError] = useState('');
  const [isActing, setIsActing] = useState(false);

  useEffect(() => {
    if (id) fetchPayment(id);
    fetchInvoices();
    fetchCompanies();
  }, [id, fetchPayment, fetchInvoices, fetchCompanies]);

  const payment = selectedPayment?.id === id ? selectedPayment : null;
  const company = useMemo(
    () => (payment ? companies.find((item) => item.id === payment.companyId) : null),
    [companies, payment],
  );
  const invoice = useMemo(
    () => (payment ? invoices.find((item) => item.id === payment.invoiceId) : null),
    [invoices, payment],
  );

  if (!payment) {
    return (
      <PageContainer>
        {isLoading ? (
          <LoadingState variant="text" lines={6} label="Chargement du paiement…" />
        ) : (
          <Alert variant="danger" closable onClose={clearError} className="mb-3">
            {error || 'Paiement introuvable.'}
          </Alert>
        )}
      </PageContainer>
    );
  }

  const handleRefund = async () => {
    setIsActing(true);
    setModalError('');
    const result = await refundPayment(id);
    setIsActing(false);
    if (result.success) {
      toast.success(`Le paiement ${payment.number} a été remboursé (simulation).`);
      setRefundOpen(false);
      fetchPayment(id);
      fetchInvoices();
    } else {
      setModalError(result.error || 'L’opération a échoué.');
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', to: ROUTES.DASHBOARD },
    { label: 'Facturation', to: ROUTES.BILLING },
    { label: 'Paiements', to: ROUTES.BILLING_PAYMENTS },
    { label: payment.number },
  ];

  const actions =
    payment.status === 'successful' ? (
      <Button variant="outline" icon="bi-arrow-counterclockwise" loading={isActing} onClick={() => setRefundOpen(true)}>
        Rembourser
      </Button>
    ) : undefined;

  return (
    <PageContainer>
      <Helmet>
        <title>{`Paiement ${payment.number} — Navix Management`}</title>
      </Helmet>

      <PageHeader
        title={company ? company.name : 'Paiement'}
        subtitle={payment.number}
        icon="bi-cash-coin"
        breadcrumbs={breadcrumbs}
        actions={actions}
      />

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      <div className="card mb-3">
        <div className="card-body d-flex flex-wrap align-items-center gap-3">
          <div className="flex-grow-1 min-w-0">
            <div className="d-flex flex-wrap gap-2">
              <PaymentStatusBadge status={payment.status} />
              <PaymentMethodBadge method={payment.method} />
            </div>
            {payment.failureReason && (
              <p className="text-danger mb-0 mt-2">
                <i className="bi bi-exclamation-circle me-1" aria-hidden="true" />
                {payment.failureReason}
              </p>
            )}
            {payment.refundReason && (
              <p className="text-secondary mb-0 mt-2">
                <i className="bi bi-info-circle me-1" aria-hidden="true" />
                {payment.refundReason}
              </p>
            )}
          </div>
          <div className="navix-payment-detail__amount">
            <span className="navix-payment-detail__amount-label">Montant</span>
            <span className="navix-payment-detail__amount-value">
              <BillingAmount value={payment.amount} currency={payment.currency} />
            </span>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <Card title="Informations">
            <dl className="mb-0">
              <InfoRow icon="bi-cash-coin" label="Numéro">
                <code>{payment.number}</code>
              </InfoRow>
              <InfoRow icon="bi-buildings" label="Entreprise">
                {company ? company.name : '—'}
              </InfoRow>
              <InfoRow icon="bi-phone" label="Moyen de paiement">
                <PaymentMethodBadge method={payment.method} />
              </InfoRow>
              <InfoRow icon="bi-hash" label="Référence de transaction">
                <code>{payment.transactionReference}</code>
              </InfoRow>
              <InfoRow icon="bi-calendar-check" label="Date de paiement">
                {formatBillingDate(payment.paymentDate)}
              </InfoRow>
              <InfoRow icon="bi-check-circle" label="Reçu le">
                {payment.receivedDate ? formatBillingDateTime(payment.receivedDate) : '—'}
              </InfoRow>
              <InfoRow icon="bi-credit-card" label="Statut">
                <PaymentStatusBadge status={payment.status} />
              </InfoRow>
              <InfoRow icon="bi-clock" label="Créé le">
                {formatBillingDateTime(payment.createdAt)}
              </InfoRow>
            </dl>
          </Card>
        </div>

        <div className="col-lg-5">
          <Card title="Facture associée">
            {invoice ? (
              <div className="navix-payment-detail__invoice">
                <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                  <code>{invoice.number}</code>
                  <InvoiceStatusBadge status={invoice.status} size="sm" />
                </div>
                <p className="text-secondary mb-0 mt-2">
                  <BillingAmount value={invoice.total} currency={invoice.currency} /> · échéance le{' '}
                  {formatBillingDate(invoice.dueDate)}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  icon="bi-receipt"
                  className="mt-3"
                  onClick={() => navigate(invoiceDetailPath(invoice.id))}
                >
                  Voir la facture
                </Button>
              </div>
            ) : (
              <p className="text-secondary mb-0">Facture introuvable.</p>
            )}
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={refundOpen}
        onClose={() => {
          setRefundOpen(false);
          setModalError('');
        }}
        title="Rembourser le paiement"
        message={`Le paiement ${payment.number} sera marqué comme remboursé et la facture ${invoice?.number ?? 'associée'} sera mise à jour. Simulation uniquement.`}
        confirmLabel="Rembourser"
        confirmVariant="danger"
        icon="bi-arrow-counterclockwise"
        loading={isSaving || isActing}
        error={modalError}
        onConfirm={handleRefund}
      />
    </PageContainer>
  );
};

export default PaymentDetailsPage;
