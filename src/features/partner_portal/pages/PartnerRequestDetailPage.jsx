/**
 * Navix Partner Portal — PartnerRequestDetailPage
 * --------------------------------------------------------------------------
 * Détail d'une demande de prestation : référence, client, contact, type,
 * priorité, objet, itinéraire, montant estimé, suivi & traçabilité.
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Button, Card } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState, ErrorState, StatusBadge } from '@/components/core';
import { ROUTES, partnerMissionDetailPath } from '@/routes/route.constants';
import { formatNumber, formatDateTime } from '@/utils/format';
import { usePartnerContext } from '../hooks/usePartnerContext';
import { partnerRequestService } from '../services/partnerRequestService';
import {
  getPartnerRequestStatus,
  getPartnerRequestType,
  getPartnerRequestPriority,
  FCFA_LABEL,
} from '../constants/partner.constants';
import '../components/PartnerRequests/PartnerRequests.css';
import '@/features/client/components/ClientFinance/ClientFinance.css';

const DetailRow = ({ label, value, mono = false, secondary = false }) => (
  <div className="navix-client-finance__detail-row">
    <span className="navix-client-finance__detail-key">{label}</span>
    <span className={`navix-client-finance__detail-value ${mono ? 'font-monospace' : ''} ${secondary ? 'text-secondary' : ''}`}>
      {value}
    </span>
  </div>
);

const PartnerRequestDetailPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { companyName } = usePartnerContext();

  const [request, setRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequest = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await partnerRequestService.getRequestById(requestId);
      setRequest(result);
    } catch (err) {
      setError(err?.message || 'Impossible de charger la demande.');
    } finally {
      setIsLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  const handleAccept = useCallback(async () => {
    try {
      setActionLoading(true);
      const result = await partnerRequestService.acceptRequest(requestId);
      setRequest(result);
      toast.success('Demande acceptée avec succès.');
    } catch (err) {
      toast.error(err?.message || "Impossible d'accepter la demande.");
    } finally {
      setActionLoading(false);
    }
  }, [requestId]);

  const handleReject = useCallback(async () => {
    try {
      setActionLoading(true);
      const result = await partnerRequestService.rejectRequest(requestId);
      setRequest(result);
      toast.success('Demande refusée.');
    } catch (err) {
      toast.error(err?.message || 'Impossible de refuser la demande.');
    } finally {
      setActionLoading(false);
    }
  }, [requestId]);

  const handleConvert = useCallback(async () => {
    try {
      setActionLoading(true);
      const result = await partnerRequestService.convertToMission(requestId);
      setRequest(result);
      toast.success('Demande convertie en mission avec succès.');
    } catch (err) {
      toast.error(err?.message || 'Impossible de convertir la demande.');
    } finally {
      setActionLoading(false);
    }
  }, [requestId]);

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={3} label="Chargement de la demande..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorState title="Impossible de charger la demande" description={error} retry={fetchRequest} />
      </PageContainer>
    );
  }

  if (!request) return null;

  const status = getPartnerRequestStatus(request.status);
  const priority = getPartnerRequestPriority(request.priority);
  const requestType = getPartnerRequestType(request.type);

  return (
    <PageContainer>
      <Helmet>
        <title>{request.reference} — Navix Partenaire</title>
      </Helmet>

      <PageHeader
        title={request.reference}
        subtitle={`Demande de ${request.clientName} — ${companyName || 'votre entreprise partenaire'}.`}
        icon="bi-inbox"
        breadcrumbs={[
          { label: 'Espace Partenaire', to: ROUTES.PARTNER_DASHBOARD },
          { label: 'Exploitation', to: ROUTES.PARTNER_MISSIONS },
          { label: 'Demandes', to: ROUTES.PARTNER_REQUESTS },
          { label: request.reference },
        ]}
        actions={
          <Button variant="ghost" size="sm" icon="bi-arrow-left" onClick={() => navigate(ROUTES.PARTNER_REQUESTS)}>
            Retour
          </Button>
        }
      />

      <div className="row g-3">
        <div className="col-12 col-xl-7">
          <Card title="Informations sur la demande">
            <div className="mb-3">
              <StatusBadge variant={status.variant} label={status.label} icon={status.icon} />
            </div>
            <DetailRow label="Référence" value={request.reference} mono />
            <DetailRow label="Date de création" value={formatDateTime(request.createdAt)} />
            <DetailRow label="Client" value={request.clientName} />
            <DetailRow label="Contact" value={request.clientContact} />
            <DetailRow label="Email" value={request.clientEmail} />
            <DetailRow label="Téléphone" value={request.clientPhone} />
            <DetailRow label="Type de prestation" value={requestType.label} />
            <DetailRow
              label="Priorité"
              value={<StatusBadge variant={priority.variant} label={priority.label} icon={priority.icon} />}
            />
            <DetailRow label="Objet" value={request.subject} />
            <DetailRow label="Description" value={request.description || '—'} secondary />
            <DetailRow label="Origine" value={request.origin} />
            <DetailRow label="Destination" value={request.destination} />
            {request.estimatedWeight > 0 && (
              <DetailRow label="Poids estimé" value={`${formatNumber(request.estimatedWeight)} kg`} />
            )}
            {request.passengers > 0 && (
              <DetailRow label="Passagers" value={request.passengers} />
            )}
            {request.scheduledDate && (
              <DetailRow label="Date prévue" value={formatDateTime(request.scheduledDate)} />
            )}
            {request.estimatedAmount > 0 && (
              <DetailRow
                label="Montant estimé"
                value={
                  <span className="navix-client-finance__detail-amount">
                    {formatNumber(request.estimatedAmount)} {FCFA_LABEL}
                  </span>
                }
              />
            )}
          </Card>
        </div>

        <div className="col-12 col-xl-5">
          <Card title="Suivi & Traçabilité">
            <DetailRow label="Statut" value={<StatusBadge variant={status.variant} label={status.label} icon={status.icon} />} />
            {request.reviewedAt && (
              <DetailRow label="Examiné le" value={formatDateTime(request.reviewedAt)} />
            )}
            {request.acceptedAt && (
              <DetailRow label="Accepté le" value={formatDateTime(request.acceptedAt)} />
            )}
            {request.convertedAt && (
              <DetailRow label="Converti le" value={formatDateTime(request.convertedAt)} />
            )}
            {request.rejectionReason && (
              <DetailRow
                label="Motif du refus"
                value={<span className="text-danger fw-semibold">{request.rejectionReason}</span>}
              />
            )}
            {request.missionId && (
              <DetailRow
                label="Mission"
                value={
                  <Link to={partnerMissionDetailPath(request.missionId)} className="font-monospace fw-semibold text-decoration-none">
                    {request.missionReference}
                    <i className="bi bi-box-arrow-up-right ms-1" aria-hidden="true" />
                  </Link>
                }
              />
            )}
            {(request.status === 'pending' || request.status === 'reviewing') && (
              <div className="mt-3 d-flex flex-wrap gap-2">
                <button type="button" className="btn btn-sm btn-success" onClick={handleAccept} disabled={actionLoading}>
                  <i className="bi bi-check-lg me-1" />
                  Accepter
                </button>
                <button type="button" className="btn btn-sm btn-danger" onClick={handleReject} disabled={actionLoading}>
                  <i className="bi bi-x-lg me-1" />
                  Refuser
                </button>
              </div>
            )}
            {request.status === 'accepted' && (
              <div className="mt-3">
                <button type="button" className="btn btn-sm btn-primary" onClick={handleConvert} disabled={actionLoading}>
                  <i className="bi bi-arrow-right-circle me-1" />
                  Convertir en mission
                </button>
              </div>
            )}
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

export default PartnerRequestDetailPage;
