/**
 * Navix Partner Portal — PartnerInvoiceDetailPage (PROMPT 071 §13-17)
 * --------------------------------------------------------------------------
 * Détail d'une facture : référence, mission, client, montants, paiement,
 * transaction. Lien vers la mission et la fiche client existantes.
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button, Card } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState, ErrorState, StatusBadge } from '@/components/core';
import { ROUTES, partnerTransactionDetailPath } from '@/routes/route.constants';
import { formatNumber, formatDateTime } from '@/utils/format';
import { usePartnerContext } from '../hooks/usePartnerContext';
import { partnerInvoiceService } from '../services/partnerInvoiceService';
import {
  getPartnerInvoiceStatus,
  getPartnerPaymentStatus,
  getPartnerPaymentMethod,
  getPartnerMissionType,
  getInvoiceDaysUntilDue,
  FCFA_LABEL,
} from '../constants/partner.constants';
import '../components/PartnerInvoices/PartnerInvoices.css';
import '@/features/client/components/ClientFinance/ClientFinance.css';

const DetailRow = ({ label, value, mono = false, secondary = false }) => (
  <div className="navix-client-finance__detail-row">
    <span className="navix-client-finance__detail-key">{label}</span>
    <span className={`navix-client-finance__detail-value ${mono ? 'font-monospace' : ''} ${secondary ? 'text-secondary' : ''}`}>
      {value}
    </span>
  </div>
);

const PartnerInvoiceDetailPage = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { companyName } = usePartnerContext();

  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvoice = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await partnerInvoiceService.getInvoiceById(invoiceId);
      setInvoice(result);
    } catch (err) {
      setError(err?.message || 'Impossible de charger la facture.');
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={3} label="Chargement de la facture..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorState title="Impossible de charger la facture" description={error} retry={fetchInvoice} />
      </PageContainer>
    );
  }

  if (!invoice) return null;

  const status = getPartnerInvoiceStatus(invoice.status);
  const paymentStatus = getPartnerPaymentStatus(invoice.paymentStatus);
  const paymentMethod = invoice.paymentMethod ? getPartnerPaymentMethod(invoice.paymentMethod) : null;
  const daysUntilDue = getInvoiceDaysUntilDue(invoice.dueDate);

  return (
    <PageContainer>
      <Helmet>
        <title>{invoice.reference} — Navix Partenaire</title>
      </Helmet>

      <PageHeader
        title={invoice.reference}
        subtitle={`Détail de la facture — ${companyName || 'votre entreprise partenaire'}.`}
        icon="bi-receipt"
        breadcrumbs={[
          { label: 'Espace Partenaire', to: ROUTES.PARTNER_DASHBOARD },
          { label: 'Finances', to: ROUTES.PARTNER_FINANCE },
          { label: 'Factures', to: ROUTES.PARTNER_FINANCE_INVOICES },
          { label: invoice.reference },
        ]}
        actions={
          <Button variant="ghost" size="sm" icon="bi-arrow-left" onClick={() => navigate(ROUTES.PARTNER_FINANCE_INVOICES)}>
            Retour
          </Button>
        }
      />

      <div className="row g-3">
        <div className="col-12 col-xl-7">
          <Card title="Informations">
            <div className="text-center mb-3">
              <span className="navix-client-finance__detail-amount navix-client-finance__detail-amount--in">
                {formatNumber(invoice.totalAmount)} {FCFA_LABEL}
              </span>
              <div className="mt-2 d-flex justify-content-center gap-2">
                <StatusBadge variant={status.variant} label={status.label} icon={status.icon} />
                <StatusBadge variant={paymentStatus.variant} label={paymentStatus.label} icon={paymentStatus.icon} />
              </div>
            </div>
            <DetailRow label="Référence" value={invoice.reference} mono />
            <DetailRow label="Date d'émission" value={formatDateTime(invoice.issueDate)} />
            <DetailRow label="Date d'échéance" value={formatDateTime(invoice.dueDate)} />
            {daysUntilDue !== null && invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
              <DetailRow
                label="Échéance"
                value={
                  daysUntilDue < 0
                    ? <span className="text-danger fw-semibold">Échue depuis {Math.abs(daysUntilDue)} jours</span>
                    : daysUntilDue <= 7
                      ? <span className="text-warning fw-semibold">Dans {daysUntilDue} jours</span>
                      : <span>Dans {daysUntilDue} jours</span>
                }
              />
            )}
            <DetailRow label="Type de prestation" value={getPartnerMissionType(invoice.serviceType).label} />
            <DetailRow label="Prestation" value={invoice.serviceLabel} secondary />
            <DetailRow label="Description" value={invoice.description || '—'} secondary />
            <DetailRow label="Montant brut" value={`${formatNumber(invoice.grossAmount)} ${FCFA_LABEL}`} mono />
            <DetailRow label={`Commission (${Math.round(invoice.commissionRate * 100)} %)`} value={`${formatNumber(invoice.commissionAmount)} ${FCFA_LABEL}`} mono />
            {invoice.taxAmount > 0 && (
              <DetailRow label={`TVA (${Math.round(invoice.taxRate * 100)} %)`} value={`${formatNumber(invoice.taxAmount)} ${FCFA_LABEL}`} mono />
            )}
            <DetailRow label="Montant net" value={`${formatNumber(invoice.netAmount)} ${FCFA_LABEL}`} mono />
            <DetailRow label="Total" value={`${formatNumber(invoice.totalAmount)} ${FCFA_LABEL}`} mono />
            {invoice.paidAt && (
              <DetailRow label="Date de paiement" value={formatDateTime(invoice.paidAt)} />
            )}
          </Card>
        </div>

        <div className="col-12 col-xl-5">
          <Card title="Paiement & Traçabilité">
            <DetailRow label="Statut facture" value={<StatusBadge variant={status.variant} label={status.label} icon={status.icon} />} />
            <DetailRow label="Statut paiement" value={<StatusBadge variant={paymentStatus.variant} label={paymentStatus.label} icon={paymentStatus.icon} />} />
            {paymentMethod && (
              <DetailRow label="Mode de paiement" value={paymentMethod.label} />
            )}
            {invoice.paymentReference && (
              <DetailRow label="Référence paiement" value={invoice.paymentReference} mono />
            )}
            {invoice.transactionId && (
              <DetailRow
                label="Transaction"
                value={
                  <button
                    type="button"
                    className="btn btn-link p-0 font-monospace fw-semibold text-decoration-none"
                    onClick={() => navigate(partnerTransactionDetailPath(invoice.transactionId))}
                  >
                    {invoice.transactionId}
                    <i className="bi bi-box-arrow-up-right ms-1" aria-hidden="true" />
                  </button>
                }
              />
            )}
            <hr />
            <DetailRow label="Mission" value={invoice.missionReference} mono />
            <DetailRow label="Client" value={invoice.clientName} secondary />
            {invoice.clientContact && (
              <DetailRow label="Contact" value={invoice.clientContact} secondary />
            )}
            <div className="mt-3 d-flex flex-wrap gap-2">
              <Link
                to={ROUTES.PARTNER_MISSIONS}
                className="btn btn-sm btn-outline-primary"
              >
                <i className="bi bi-signpost-split me-1" aria-hidden="true" />
                Voir la mission
              </Link>
              <Link
                to={ROUTES.PARTNER_CLIENTS}
                className="btn btn-sm btn-outline-secondary"
              >
                <i className="bi bi-people me-1" aria-hidden="true" />
                Voir le client
              </Link>
            </div>
            <div className="mt-3">
              <span className="badge bg-secondary-subtle text-secondary">
                <i className="bi bi-info-circle me-1" aria-hidden="true" />
                Donnée simulée — aucune opération réelle.
              </span>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default PartnerInvoiceDetailPage;
