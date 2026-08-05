/**
 * Navix Billing — InvoiceDetailsPage
 * --------------------------------------------------------------------------
 * Détail d'une facture : en-tête (numéro, entreprise, statut, montants),
 * émetteur / client, lignes de facture et totaux (sous-total, remise, taxe),
 * récapitulatif des paiements et informations. Actions : simuler un paiement,
 * émettre un brouillon, annuler et télécharger le PDF (placeholder).
 */
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Button, Card } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState, ConfirmDialog } from '@/components/core';
import { ROUTES } from '@/routes/route.constants';
import { useCompaniesStore } from '@/features/companies';
import { useBillingStore } from '../store';
import {
  InvoiceStatusBadge,
  BillingAmount,
  BillingPeriod,
  InvoicePdfButton,
  PaymentStatusBadge,
  PaymentMethodBadge,
  PaymentSimulationModal,
} from '../components';
import {
  getItemKind,
  getTaxRateLabel,
  formatBillingDate,
  formatBillingDateTime,
  BILLING_ICON,
} from '../constants';
import './InvoiceDetailsPage.css';

const InfoRow = ({ icon, label, children }) => (
  <div className="d-flex align-items-start gap-3 py-2">
    <span className="navix-invoice-detail__icon" aria-hidden="true">
      <i className={`bi ${icon}`} />
    </span>
    <div className="min-w-0">
      <dt className="navix-invoice-detail__label">{label}</dt>
      <dd className="navix-invoice-detail__value mb-0">{children}</dd>
    </div>
  </div>
);

const InvoiceDetailsPage = () => {
  const { id } = useParams();

  const selectedInvoice = useBillingStore((state) => state.selectedInvoice);
  const invoiceItems = useBillingStore((state) => state.invoiceItems);
  const payments = useBillingStore((state) => state.payments);
  const isLoading = useBillingStore((state) => state.isLoading);
  const error = useBillingStore((state) => state.error);
  const fetchInvoice = useBillingStore((state) => state.fetchInvoice);
  const fetchPayments = useBillingStore((state) => state.fetchPayments);
  const issueInvoice = useBillingStore((state) => state.issueInvoice);
  const cancelInvoice = useBillingStore((state) => state.cancelInvoice);
  const simulatePayment = useBillingStore((state) => state.simulatePayment);
  const clearError = useBillingStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const [payOpen, setPayOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [modalError, setModalError] = useState('');
  const [isActing, setIsActing] = useState(false);

  useEffect(() => {
    if (id) fetchInvoice(id);
    fetchPayments();
    fetchCompanies();
  }, [id, fetchInvoice, fetchPayments, fetchCompanies]);

  const invoice = selectedInvoice?.id === id ? selectedInvoice : null;
  const company = useMemo(
    () => (invoice ? companies.find((item) => item.id === invoice.companyId) : null),
    [companies, invoice],
  );

  const invoicePayments = useMemo(
    () => payments.filter((payment) => payment.invoiceId === id),
    [payments, id],
  );

  const closeModals = () => {
    setPayOpen(false);
    setCancelOpen(false);
    setModalError('');
  };

  const runAction = async (action, successMessage) => {
    if (!id) return;
    setIsActing(true);
    setModalError('');
    const result = await action();
    setIsActing(false);
    if (result.success) {
      toast.success(successMessage);
      closeModals();
      fetchInvoice(id);
    } else {
      setModalError(result.error || 'L’opération a échoué.');
    }
  };

  const handleIssue = () =>
    runAction(() => issueInvoice(id), `La facture ${invoice.number} a été émise.`);

  const handleCancel = () =>
    runAction(() => cancelInvoice(id), `La facture ${invoice.number} a été annulée.`);

  const handlePay = (payload) =>
    runAction(
      () => simulatePayment(payload),
      `Paiement simulé enregistré pour ${invoice.number}.`,
    );

  if (!invoice) {
    return (
      <PageContainer>
        {isLoading ? (
          <LoadingState variant="text" lines={6} label="Chargement de la facture…" />
        ) : (
          <Alert variant="danger" closable onClose={clearError} className="mb-3">
            {error || 'Facture introuvable.'}
          </Alert>
        )}
      </PageContainer>
    );
  }

  const canPay = ['issued', 'partially_paid', 'overdue'].includes(invoice.status);
  const canCancel = !['paid', 'cancelled', 'refunded'].includes(invoice.status);

  const breadcrumbs = [
    { label: 'Dashboard', to: ROUTES.DASHBOARD },
    { label: 'Facturation', to: ROUTES.BILLING },
    { label: 'Factures', to: ROUTES.BILLING_INVOICES },
    { label: invoice.number },
  ];

  const actions = (
    <div className="d-flex gap-2 flex-wrap">
      {invoice.status === 'draft' && (
        <Button variant="outline" icon="bi-send" loading={isActing} onClick={handleIssue}>
          Émettre
        </Button>
      )}
      {canPay && (
        <Button variant="primary" icon="bi-cash-coin" onClick={() => setPayOpen(true)}>
          Simuler un paiement
        </Button>
      )}
      {canCancel && (
        <Button variant="outline" icon="bi-x-circle" loading={isActing} onClick={() => setCancelOpen(true)}>
          Annuler
        </Button>
      )}
      <InvoicePdfButton invoiceId={invoice.id} />
    </div>
  );

  return (
    <PageContainer>
      <Helmet>
        <title>{`Facture ${invoice.number} — Navix Management`}</title>
      </Helmet>

      <PageHeader
        title={company ? company.name : 'Facture'}
        subtitle={invoice.number}
        icon={BILLING_ICON}
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
              <InvoiceStatusBadge status={invoice.status} />
              <BillingPeriod start={invoice.periodStart} end={invoice.periodEnd} />
            </div>
            <p className="text-secondary mb-0 mt-2">
              <code>{invoice.id}</code>
              {invoice.subscriptionId ? ` · Abonnement ${invoice.subscriptionId}` : ''}
            </p>
          </div>
          <div className="navix-invoice-detail__stats d-flex gap-2 flex-wrap">
            <div className="navix-invoice-detail__stat">
              <span className="navix-invoice-detail__stat-value">
                <BillingAmount value={invoice.total} currency={invoice.currency} />
              </span>
              <span className="navix-invoice-detail__stat-label">Total</span>
            </div>
            <div className="navix-invoice-detail__stat">
              <span className="navix-invoice-detail__stat-value">
                <BillingAmount value={invoice.amountPaid} currency={invoice.currency} />
              </span>
              <span className="navix-invoice-detail__stat-label">Payé</span>
            </div>
            <div className="navix-invoice-detail__stat">
              <span className="navix-invoice-detail__stat-value">
                <BillingAmount value={invoice.amountDue} currency={invoice.currency} />
              </span>
              <span className="navix-invoice-detail__stat-label">Reste dû</span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-8">
          <Card title={`Lignes de facture (${invoiceItems.length})`} flush>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th scope="col">Désignation</th>
                    <th scope="col" className="text-center">
                      Qté
                    </th>
                    <th scope="col" className="text-end">
                      Prix unitaire
                    </th>
                    <th scope="col" className="text-end">
                      Montant
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceItems.map((item) => {
                    const kind = getItemKind(item.kind);
                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="d-flex align-items-start gap-2">
                            <i className={`bi ${kind.icon} text-secondary`} aria-hidden="true" />
                            <div>
                              <span className="d-block">{item.label}</span>
                              {item.description && (
                                <span className="text-secondary small d-block">{item.description}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-end tabular-nums">
                          <BillingAmount value={item.unitPrice} currency={invoice.currency} />
                        </td>
                        <td className="text-end tabular-nums">
                          <BillingAmount value={item.amount} currency={invoice.currency} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="navix-invoice-detail__totals">
              <dl className="navix-invoice-detail__total-row">
                <dt>Sous-total</dt>
                <dd>
                  <BillingAmount value={invoice.subtotal} currency={invoice.currency} />
                </dd>
              </dl>
              {Number(invoice.discountAmount) > 0 && (
                <dl className="navix-invoice-detail__total-row">
                  <dt>Remise</dt>
                  <dd className="text-success">
                    − <BillingAmount value={invoice.discountAmount} currency={invoice.currency} />
                  </dd>
                </dl>
              )}
              <dl className="navix-invoice-detail__total-row">
                <dt>{getTaxRateLabel(invoice.taxRate)}</dt>
                <dd>
                  <BillingAmount value={invoice.taxAmount} currency={invoice.currency} />
                </dd>
              </dl>
              {Number(invoice.creditApplied) > 0 && (
                <dl className="navix-invoice-detail__total-row">
                  <dt>Avoir appliqué</dt>
                  <dd className="text-success">
                    − <BillingAmount value={invoice.creditApplied} currency={invoice.currency} />
                  </dd>
                </dl>
              )}
              <dl className="navix-invoice-detail__total-row navix-invoice-detail__total-row--grand">
                <dt>Total</dt>
                <dd>
                  <BillingAmount value={invoice.total} currency={invoice.currency} />
                </dd>
              </dl>
            </div>
          </Card>

          <Card title={`Paiements (${invoicePayments.length})`} className="mt-3">
            {invoicePayments.length === 0 ? (
              <p className="text-secondary mb-0">Aucun paiement enregistré sur cette facture.</p>
            ) : (
              <ul className="navix-invoice-detail__payments mb-0">
                {invoicePayments.map((payment) => (
                  <li key={payment.id} className="navix-invoice-detail__payment">
                    <div className="min-w-0">
                      <code>{payment.number}</code>
                      <div className="d-flex align-items-center gap-2 flex-wrap mt-1">
                        <PaymentStatusBadge status={payment.status} size="sm" />
                        <PaymentMethodBadge method={payment.method} size="sm" />
                      </div>
                    </div>
                    <div className="text-end">
                      <span className="tabular-nums d-block">
                        <BillingAmount value={payment.amount} currency={payment.currency} />
                      </span>
                      <span className="text-secondary small">{formatBillingDate(payment.paymentDate)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="col-lg-4">
          <Card title="Informations">
            <dl className="mb-0">
              <InfoRow icon="bi-receipt" label="Numéro">
                <code>{invoice.number}</code>
              </InfoRow>
              <InfoRow icon="bi-buildings" label="Entreprise">
                {company ? company.name : '—'}
              </InfoRow>
              <InfoRow icon="bi-credit-card" label="Statut">
                <InvoiceStatusBadge status={invoice.status} />
              </InfoRow>
              <InfoRow icon="bi-calendar-check" label="Émise le">
                {invoice.issuedDate ? formatBillingDate(invoice.issuedDate) : '—'}
              </InfoRow>
              <InfoRow icon="bi-alarm" label="Échéance">
                {invoice.dueDate ? formatBillingDate(invoice.dueDate) : '—'}
              </InfoRow>
              <InfoRow icon="bi-check-circle" label="Payée le">
                {invoice.paidDate ? formatBillingDate(invoice.paidDate) : '—'}
              </InfoRow>
              <InfoRow icon="bi-calendar-range" label="Période">
                <BillingPeriod start={invoice.periodStart} end={invoice.periodEnd} />
              </InfoRow>
              <InfoRow icon="bi-clock" label="Créée le">
                {formatBillingDateTime(invoice.createdAt)}
              </InfoRow>
              <InfoRow icon="bi-arrow-repeat" label="Mise à jour le">
                {formatBillingDateTime(invoice.updatedAt)}
              </InfoRow>
              {invoice.note && (
                <InfoRow icon="bi-chat-left-text" label="Note">
                  {invoice.note}
                </InfoRow>
              )}
            </dl>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onClose={closeModals}
        title="Annuler la facture"
        message={`La facture ${invoice.number} sera annulée et son solde dû passera à zéro. Cette action est simulée.`}
        confirmLabel="Annuler"
        confirmVariant="danger"
        icon="bi-x-circle"
        loading={isActing}
        error={modalError}
        onConfirm={handleCancel}
      />

      <PaymentSimulationModal
        open={payOpen}
        onClose={closeModals}
        invoice={invoice}
        loading={isActing}
        error={modalError}
        onConfirm={handlePay}
      />
    </PageContainer>
  );
};

export default InvoiceDetailsPage;
