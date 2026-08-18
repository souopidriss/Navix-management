/**
 * Navix Partner Portal — PartnerContractDetailPage (PROMPT 073)
 * --------------------------------------------------------------------------
 * Page de détail d'un contrat partenaire :
 * Infos complètes + actions + missions liées + documents + factures.
 * Aucune donnée financière interne — tout pointe vers les modules existants.
 */
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState, ErrorState, StatusBadge } from '@/components/core';
import { formatDateTime, formatNumber } from '@/utils/format';
import { ROUTES } from '@/routes/route.constants';
import {
  FCFA_LABEL,
  PARTNER_CONTRACT_STATUSES,
  PARTNER_CONTRACT_TYPES,
  PARTNER_CONTRACT_CATEGORIES,
  PARTNER_BILLING_FREQUENCIES,
  PARTNER_CONTRACT_TERMINATION_REASONS,
  getPartnerContractExpiryStatus,
} from '../constants/partner.constants';
import { usePartnerContractDetail, useRenewContract, useTerminateContract, useToggleSuspendContract } from '../hooks/usePartnerContracts';
import { useState } from 'react';
import '../components/PartnerContracts/PartnerContracts.css';

const PartnerContractDetailPage = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const { data: contract, isLoading, error, refetch } = usePartnerContractDetail(contractId);
  const renewMutation = useRenewContract();
  const terminateMutation = useTerminateContract();
  const suspendMutation = useToggleSuspendContract();

  const [action, setAction] = useState(null);

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState variant="detail" label="Chargement du contrat..." />
      </PageContainer>
    );
  }

  if (error || !contract) {
    return (
      <PageContainer>
        <ErrorState
          title="Contrat introuvable"
          description="Ce contrat n'existe pas ou n'est plus accessible."
          retry={() => navigate(ROUTES.PARTNER_CONTRACTS)}
        />
      </PageContainer>
    );
  }

  const expiryStatus = getPartnerContractExpiryStatus(contract.startDate, contract.endDate);
  const category = PARTNER_CONTRACT_CATEGORIES[contract.category];

  const handleAction = async () => {
    try {
      if (action.type === 'renew') {
        await renewMutation.mutateAsync({ contractId: contract.id });
      } else if (action.type === 'terminate') {
        await terminateMutation.mutateAsync({ contractId: contract.id, reason: action.reason });
      } else if (action.type === 'suspend' || action.type === 'resume') {
        await suspendMutation.mutateAsync(contract.id);
      }
      setAction(null);
      refetch();
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <PageContainer>
      <Helmet>
        <title>{contract.reference} — Contrat — Navix Partenaire</title>
      </Helmet>

      <PageHeader
        title={contract.reference}
        subtitle={contract.title}
        icon="bi-file-earmark-text"
        breadcrumbs={[
          { label: 'Espace Partenaire', to: ROUTES.PARTNER_DASHBOARD },
          { label: 'Contrats', to: ROUTES.PARTNER_CONTRACTS },
          { label: contract.reference },
        ]}
        actions={
          <div className="d-flex gap-2">
            {contract.status === 'active' && (
              <Button variant="outline-warning" size="sm" icon="bi-pause-circle" onClick={() => setAction({ type: 'suspend' })}>
                Suspendre
              </Button>
            )}
            {contract.status === 'suspended' && (
              <Button variant="outline-success" size="sm" icon="bi-play-circle" onClick={() => setAction({ type: 'resume' })}>
                Réactiver
              </Button>
            )}
            {(contract.status === 'active' || contract.status === 'expiring') && (
              <Button variant="outline-info" size="sm" icon="bi-arrow-repeat" onClick={() => setAction({ type: 'renew' })}>
                Renouveler
              </Button>
            )}
            {['active', 'expiring', 'suspended'].includes(contract.status) && (
              <Button variant="outline-danger" size="sm" icon="bi-slash-circle" onClick={() => setAction({ type: 'terminate', reason: '' })}>
                Résilier
              </Button>
            )}
            <Button variant="ghost" size="sm" icon="bi-arrow-left" onClick={() => navigate(ROUTES.PARTNER_CONTRACTS)}>
              Retour
            </Button>
          </div>
        }
      />

      <div className="row g-4">
        {/* Colonne gauche — Infos */}
        <div className="col-lg-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header">
              <h6 className="card-title mb-0">
                <i className="bi bi-info-circle me-2" />
                Informations du contrat
              </h6>
            </div>
            <div className="card-body contract-detail-info">
              <div className="info-row">
                <span className="info-label">Statut</span>
                <StatusBadge variant={PARTNER_CONTRACT_STATUSES[contract.status]?.variant} label={PARTNER_CONTRACT_STATUSES[contract.status]?.label} icon={PARTNER_CONTRACT_STATUSES[contract.status]?.icon} />
              </div>
              <div className="info-row">
                <span className="info-label">Type</span>
                <span className="info-value">{PARTNER_CONTRACT_TYPES[contract.type]?.label || contract.type}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Catégorie</span>
                <span className="info-value">
                  <span className="badge" style={{ backgroundColor: category?.color || '#6c757d' }}>
                    {category?.label || contract.category}
                  </span>
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Client</span>
                <span className="info-value fw-semibold">{contract.clientName}</span>
              </div>
              {contract.vehicleName && (
                <div className="info-row">
                  <span className="info-label">Véhicule</span>
                  <span className="info-value">{contract.vehicleName}</span>
                </div>
              )}
              <div className="info-row">
                <span className="info-label">Date de début</span>
                <span className="info-value">{contract.startDate ? formatDateTime(contract.startDate, 'DD MMMM YYYY') : '—'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Date de fin</span>
                <span className="info-value">
                  {contract.endDate ? formatDateTime(contract.endDate, 'DD MMMM YYYY') : '—'}
                  <span className={`badge bg-${expiryStatus.variant === 'success' ? 'success' : expiryStatus.variant === 'warning' ? 'warning' : expiryStatus.variant === 'danger' ? 'danger' : 'secondary'} ms-2`} style={{ fontSize: '0.7rem' }}>
                    {expiryStatus.label}
                  </span>
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Valeur totale</span>
                <span className="info-value fw-bold text-primary">{formatNumber(contract.value)} {FCFA_LABEL}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Fréquence facturation</span>
                <span className="info-value">{PARTNER_BILLING_FREQUENCIES[contract.billingFrequency]?.label || contract.billingFrequency}</span>
              </div>
              {contract.monthlyAmount && (
                <div className="info-row">
                  <span className="info-label">Montant mensuel</span>
                  <span className="info-value">{formatNumber(contract.monthlyAmount)} {FCFA_LABEL}</span>
                </div>
              )}
              <div className="info-row">
                <span className="info-label">Renouvellement</span>
                <span className="info-value">
                  {contract.renewalType === 'automatic' ? 'Automatique' : 'Manuel'}
                  {contract.autoRenew && <i className="bi bi-check-circle-fill text-success ms-1" />}
                </span>
              </div>
              {contract.description && (
                <div className="info-row">
                  <span className="info-label">Description</span>
                  <span className="info-value">{contract.description}</span>
                </div>
              )}
              {contract.signedDate && (
                <div className="info-row">
                  <span className="info-label">Signé le</span>
                  <span className="info-value">{formatDateTime(contract.signedDate, 'DD MMMM YYYY')}</span>
                </div>
              )}
              <div className="info-row">
                <span className="info-label">Créé le</span>
                <span className="info-value">{formatDateTime(contract.createdAt, 'DD MMMM YYYY [à] HH:mm')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne droite — Données liées + Finance isolée */}
        <div className="col-lg-4">
          {/* Données liées */}
          <div className="card shadow-sm mb-4">
            <div className="card-header">
              <h6 className="card-title mb-0">
                <i className="bi bi-link-45deg me-2" />
                Données liées
              </h6>
            </div>
            <div className="card-body contract-linked-summary">
              <div className="summary-card mb-2">
                <div className="summary-icon bg-primary-subtle text-primary">
                  <i className="bi bi-signpost-split" />
                </div>
                <div>
                  <div className="fw-medium">{contract.missionsCount || 0} missions</div>
                  <small className="text-muted">Missions liées à ce contrat</small>
                </div>
              </div>
              <div className="summary-card mb-2">
                <div className="summary-icon bg-success-subtle text-success">
                  <i className="bi bi-receipt" />
                </div>
                <div>
                  <div className="fw-medium">{contract.invoicesCount || 0} factures</div>
                  <small className="text-muted">Factures émises</small>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon bg-info-subtle text-info">
                  <i className="bi bi-folder2-open" />
                </div>
                <div>
                  <div className="fw-medium">{contract.documentsCount || 0} documents</div>
                  <small className="text-muted">Documents associés</small>
                </div>
              </div>
            </div>
          </div>

          {/* Isolation finance */}
          <div className="card shadow-sm mb-4">
            <div className="card-body contract-finance-isolation">
              <i className="bi bi-shield-check fs-5" />
              <div>
                <div className="fw-medium">Finance isolée</div>
                <small>Aucune donnée financière interne. Consultez les modules Revenus, Factures et Transactions pour les données chiffrées.</small>
              </div>
            </div>
          </div>

          {/* Alerte expiration si pertinent */}
          {(contract.status === 'expiring' || contract.status === 'expired') && (
            <div className={`alert alert-${contract.status === 'expired' ? 'danger' : 'warning'} d-flex align-items-start`}>
              <i className={`bi ${contract.status === 'expired' ? 'bi-exclamation-octagon' : 'bi-exclamation-triangle'} fs-4 me-2 mt-1`} />
              <div>
                <strong>{contract.status === 'expired' ? 'Contrat expiré' : 'Expiration proche'}</strong>
                <p className="mb-0 mt-1 small">
                  {contract.status === 'expired'
                    ? `Ce contrat a expiré le ${formatDateTime(contract.endDate, 'DD MMMM YYYY')}.`
                    : `Ce contrat expire le ${formatDateTime(contract.endDate, 'DD MMMM YYYY')}. Envisagez un renouvellement.`
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'action */}
      {action && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {action.type === 'renew' && 'Renouveler le contrat'}
                  {action.type === 'terminate' && 'Résilier le contrat'}
                  {action.type === 'suspend' && 'Suspendre le contrat'}
                  {action.type === 'resume' && 'Réactiver le contrat'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setAction(null)} />
              </div>
              <div className="modal-body">
                {action.type === 'terminate' && (
                  <div className="mb-3">
                    <label className="form-label fw-medium">Raison de la résiliation</label>
                    <select
                      className="form-select"
                      value={action.reason}
                      onChange={(e) => setAction({ ...action, reason: e.target.value })}
                    >
                      <option value="">— Sélectionner —</option>
                      {PARTNER_CONTRACT_TERMINATION_REASONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                )}
                {action.type === 'renew' && (
                  <p>Renouveler le contrat <strong>{contract.reference}</strong> ? La date de fin sera prolongée d'un an.</p>
                )}
                {action.type === 'suspend' && (
                  <p>Suspendre le contrat <strong>{contract.reference}</strong> ? Les missions liées seront mises en pause.</p>
                )}
                {action.type === 'resume' && (
                  <p>Réactiver le contrat <strong>{contract.reference}</strong> ?</p>
                )}
                <span className="badge bg-secondary-subtle text-secondary">
                  <i className="bi bi-info-circle me-1" />
                  Donnée simulée — aucune opération réelle.
                </span>
              </div>
              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setAction(null)}>Annuler</Button>
                <Button
                  variant={action.type === 'terminate' ? 'danger' : 'primary'}
                  onClick={handleAction}
                  disabled={action.type === 'terminate' && !action.reason}
                >
                  Confirmer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default PartnerContractDetailPage;
