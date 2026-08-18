/**
 * Navix Partner Portal — PartnerRevenueDetailPage (PROMPT 070 §11-13)
 * --------------------------------------------------------------------------
 * Détail d'un revenu : référence, mission liée, client, prestation,
 * montant brut, commission, net, statut, date de paiement, transaction.
 * Lien vers la mission existante et la fiche client.
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button, Card } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState, ErrorState, StatusBadge } from '@/components/core';
import { ROUTES } from '@/routes/route.constants';
import { formatNumber, formatDateTime } from '@/utils/format';
import { usePartnerContext } from '../hooks/usePartnerContext';
import { partnerRevenueService } from '../services/partnerRevenueService';
import {
  getPartnerRevenueStatus,
  getPartnerMissionType,
  FCFA_LABEL,
} from '../constants/partner.constants';
import { partnerTransactionDetailPath } from '@/routes/route.constants';
import '@/features/client/components/ClientFinance/ClientFinance.css';

const DetailRow = ({ label, value, mono = false, secondary = false }) => (
  <div className="navix-client-finance__detail-row">
    <span className="navix-client-finance__detail-key">{label}</span>
    <span className={`navix-client-finance__detail-value ${mono ? 'font-monospace' : ''} ${secondary ? 'text-secondary' : ''}`}>
      {value}
    </span>
  </div>
);

const PartnerRevenueDetailPage = () => {
  const { revenueId } = useParams();
  const navigate = useNavigate();
  const { companyName } = usePartnerContext();

  const [revenue, setRevenue] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRevenue = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await partnerRevenueService.getRevenueById(revenueId);
      setRevenue(result);
    } catch (err) {
      setError(err?.message || 'Impossible de charger le revenu.');
    } finally {
      setIsLoading(false);
    }
  }, [revenueId]);

  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={3} label="Chargement du revenu…" />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorState title="Impossible de charger le revenu" description={error} retry={fetchRevenue} />
      </PageContainer>
    );
  }

  if (!revenue) {
    return null;
  }

  const status = getPartnerRevenueStatus(revenue.status);

  return (
    <PageContainer>
      <Helmet>
        <title>{revenue.reference} — Navix Partenaire</title>
      </Helmet>

      <PageHeader
        title={revenue.reference}
        subtitle={`Détail du revenu — ${companyName || 'votre entreprise partenaire'}.`}
        icon="bi-cash-coin"
        breadcrumbs={[
          { label: 'Espace Partenaire', to: ROUTES.PARTNER_DASHBOARD },
          { label: 'Finances', to: ROUTES.PARTNER_FINANCE },
          { label: 'Revenus', to: ROUTES.PARTNER_FINANCE_REVENUE },
          { label: revenue.reference },
        ]}
        actions={
          <Button variant="ghost" size="sm" icon="bi-arrow-left" onClick={() => navigate(ROUTES.PARTNER_FINANCE_REVENUE)}>
            Retour
          </Button>
        }
      />

      <div className="row g-3">
        <div className="col-12 col-xl-7">
          <Card title="Informations">
            <div className="text-center mb-3">
              <span className="navix-client-finance__detail-amount navix-client-finance__detail-amount--in">
                + {formatNumber(revenue.netAmount)} {FCFA_LABEL}
              </span>
              <div className="mt-2 d-flex justify-content-center gap-2">
                <StatusBadge variant={status.variant} label={status.label} icon={status.icon} />
              </div>
            </div>
            <DetailRow label="Référence" value={revenue.reference} mono />
            <DetailRow label="Date" value={formatDateTime(revenue.createdAt)} />
            <DetailRow label="Type de prestation" value={getPartnerMissionType(revenue.serviceType).label} />
            <DetailRow label="Prestation" value={revenue.serviceLabel} secondary />
            <DetailRow label="Montant brut" value={`${formatNumber(revenue.grossAmount)} ${FCFA_LABEL}`} mono />
            <DetailRow label={`Commission (${Math.round(revenue.commissionRate * 100)} %)`} value={`${formatNumber(revenue.commissionAmount)} ${FCFA_LABEL}`} mono />
            <DetailRow label="Montant net" value={`${formatNumber(revenue.netAmount)} ${FCFA_LABEL}`} mono />
            {revenue.paidAt && (
              <DetailRow label="Date de paiement" value={formatDateTime(revenue.paidAt)} />
            )}
            {revenue.validatedAt && (
              <DetailRow label="Date de validation" value={formatDateTime(revenue.validatedAt)} />
            )}
          </Card>
        </div>

        <div className="col-12 col-xl-5">
          <Card title="Traçabilité">
            <DetailRow label="Mission" value={revenue.missionReference} mono />
            <DetailRow label="Client" value={revenue.clientName} secondary />
            {revenue.transactionId && (
              <DetailRow
                label="Transaction"
                value={
                  <button
                    type="button"
                    className="btn btn-link p-0 font-monospace fw-semibold text-decoration-none"
                    onClick={() => navigate(partnerTransactionDetailPath(revenue.transactionId))}
                  >
                    {revenue.transactionId}
                    <i className="bi bi-box-arrow-up-right ms-1" aria-hidden="true" />
                  </button>
                }
              />
            )}
            <div className="mt-3 d-flex flex-wrap gap-2">
              <Link
                to={`${ROUTES.PARTNER_MISSIONS}`}
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

export default PartnerRevenueDetailPage;
