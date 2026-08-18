/**
 * Navix Partner Portal — PartnerDocumentDetailPage (PROMPT 066)
 * --------------------------------------------------------------------------
 * Détail d'un document partenaire (route /partner/documents/:id) :
 *   HEADER : nom + référence, badges statut / catégorie / entité liée,
 *   retour vers le centre documentaire, actions RBAC (Télécharger,
 *   Modifier, Renouveler si expiré, Supprimer).
 *   → HERO : icône type de fichier, statut d'expiration, jours restants.
 *   → PREVIEW : visuel du document + métadonnées fichier (taille, format).
 *   → Fiche : identification, validité (émission / expiration), entité liée.
 *   → Description.
 *
 * Multi-tenant : getDocumentById refuse tout document hors portée
 * (companyId = cmp_partner_navix + partnerId). RBAC : chaque action
 * d'écriture est conditionnée aux permissions PARTNER_DOCUMENTS_*.
 */
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui';
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
import {
  formatDocumentDate,
  formatDocumentSize,
  getDocumentType,
} from '@/features/documents/constants';
import { formatDate } from '@/utils/format';
import {
  getPartnerDocumentStatus,
  getPartnerDocumentCategory,
  getPartnerDocumentEntity,
} from '../constants/partner.constants';
import usePartnerDocument from '../hooks/usePartnerDocument';
import PartnerDocumentUploadModal from '../components/PartnerDocuments/PartnerDocumentUploadModal';
import '../components/PartnerDocuments/PartnerDocuments.css';

const InfoRow = ({ label, value, icon }) => (
  <div className="d-flex align-items-center gap-3 py-2 border-bottom border-secondary-subtle">
    <span className="text-muted d-flex align-items-center gap-2" style={{ width: '10rem', flexShrink: 0 }}>
      {icon && <i className={`bi ${icon}`} aria-hidden="true" />}
      <span className="small">{label}</span>
    </span>
    <span className="fw-medium">{value || '—'}</span>
  </div>
);

const PartnerDocumentDetailPage = () => {
  const navigate = useNavigate();
  const can = useCan();
  const { id } = useParams();

  const { document, daysLeft, isLoading, error, refetch, updateDocument, renewDocument, deleteDocument, downloadDocument } =
    usePartnerDocument(id);

  const [formOpen, setFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [renewOpen, setRenewOpen] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [renewError, setRenewError] = useState('');

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  if (isLoading && !document) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={4} label="Chargement du document…" />
      </PageContainer>
    );
  }

  if (error?.status === 404 && !document) {
    return (
      <PageContainer>
        <EmptyState
          icon="bi-file-earmark-x"
          title="Document introuvable"
          description="Ce document n’existe pas ou n’est pas rattaché à votre entreprise."
          action={
            <Button variant="outline" icon="bi-arrow-left" onClick={() => navigate(ROUTES.PARTNER_DOCUMENTS)}>
              Retour aux documents
            </Button>
          }
        />
      </PageContainer>
    );
  }

  if (error && !document) {
    return (
      <PageContainer>
        <ErrorState title="Détail indisponible" description="Impossible de charger ce document." retry={refetch} />
      </PageContainer>
    );
  }

  const status = getPartnerDocumentStatus(document.status);
  const category = getPartnerDocumentCategory(document.category);
  const entity = getPartnerDocumentEntity(document.entityType);
  const fileType = getDocumentType(document.fileType);
  const canUpdate = can(PERMISSIONS.PARTNER_DOCUMENTS_UPDATE);
  const canDelete = can(PERMISSIONS.PARTNER_DOCUMENTS_DELETE);

  const handleFormSubmit = async (payload) => {
    setIsSaving(true);
    setFormError('');
    try {
      await updateDocument(payload);
      toast.success('Document mis à jour.');
      setFormOpen(false);
      refetch();
    } catch (err) {
      setFormError(err?.message || 'Impossible d’enregistrer le document.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async () => {
    try {
      await downloadDocument();
      toast.success(`Téléchargement de « ${document.name} » simulé.`);
    } catch (err) {
      toast.error(err?.message || 'Téléchargement impossible.');
    }
  };

  const handleRenew = async () => {
    setIsRenewing(true);
    setRenewError('');
    try {
      await renewDocument();
      toast.success('Validité du document prolongée d’un an.');
      setRenewOpen(false);
      refetch();
    } catch (err) {
      setRenewError(err?.message || 'Renouvellement refusé.');
    } finally {
      setIsRenewing(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteDocument();
      toast.success('Document supprimé.');
      navigate(ROUTES.PARTNER_DOCUMENTS);
    } catch (err) {
      setDeleteError(err?.message || 'Suppression refusée.');
    } finally {
      setIsDeleting(false);
    }
  };

  const isExpired = document.status === 'expired';
  const expiryLabel =
    daysLeft === null
      ? null
      : daysLeft < 0
        ? `Expiré depuis ${Math.abs(daysLeft)} j`
        : daysLeft === 0
          ? 'Expire aujourd’hui'
          : `J−${daysLeft}`;

  return (
    <PageContainer>
      <Helmet>
        <title>{document.name} — Navix Partenaire</title>
      </Helmet>

      <PageHeader
        title={document.name}
        subtitle={`${document.reference || 'Sans référence'} — ${category.label}`}
        icon={fileType.icon}
        breadcrumbs={[
          { label: 'Espace Partenaire', to: ROUTES.PARTNER_DASHBOARD },
          { label: 'Documents', to: ROUTES.PARTNER_DOCUMENTS },
          { label: document.name },
        ]}
        actions={
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" icon="bi-arrow-left" onClick={() => navigate(ROUTES.PARTNER_DOCUMENTS)}>
              Retour
            </Button>
            <Button variant="outline" size="sm" icon="bi-download" onClick={handleDownload}>
              Télécharger
            </Button>
            {canUpdate && (
              <Button variant="outline" size="sm" icon="bi-pencil" onClick={() => setFormOpen(true)}>
                Modifier
              </Button>
            )}
            {canUpdate && isExpired && (
              <Button variant="outline" size="sm" icon="bi-arrow-counterclockwise" onClick={() => setRenewOpen(true)}>
                Renouveler
              </Button>
            )}
            {canDelete && (
              <Button variant="outline" size="sm" icon="bi-trash" className="text-danger" onClick={() => setDeleteOpen(true)}>
                Supprimer
              </Button>
            )}
          </div>
        }
      />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="navix-pdoc-hero mb-4">
        <span className="navix-pdoc-hero__icon" aria-hidden="true">
          <i className={`bi ${fileType.icon}`} />
        </span>
        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          <div className="h5 fw-bold mb-1 text-truncate">{document.name}</div>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <StatusBadge variant={status.variant} label={status.label} icon={status.icon} />
            <StatusBadge variant="secondary" label={category.label} icon={category.icon} dot={false} />
            <StatusBadge variant={entity.variant} label={entity.label} icon={entity.icon} dot={false} />
            {expiryLabel && (
              <span
                className={`small d-inline-flex align-items-center gap-1 ${isExpired ? 'text-danger fw-medium' : 'text-secondary'}`}
              >
                <i className={`bi ${isExpired ? 'bi-x-octagon' : 'bi-hourglass-split'}`} aria-hidden="true" />
                {expiryLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-5">
          <div className="navix-card p-4 h-100">
            <h2 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-file-earmark text-primary" aria-hidden="true" />
              Fichier
            </h2>
            <div className="navix-pdoc-preview mb-3">
              <span className="navix-pdoc-preview__icon" aria-hidden="true">
                <i className={`bi ${fileType.icon}`} />
              </span>
              <span className="navix-pdoc-preview__file" title={document.name}>
                {document.name}
              </span>
              <span className="navix-pdoc-preview__meta">
                {document.fileType?.toUpperCase() || 'FICHIER'} · {formatDocumentSize(document.size)}
              </span>
              <Button variant="primary" size="sm" icon="bi-download" onClick={handleDownload}>
                Télécharger
              </Button>
            </div>
            <InfoRow icon="bi-file-earmark" label="Nom" value={document.name} />
            <InfoRow icon="bi-hdd" label="Taille" value={formatDocumentSize(document.size)} />
            <InfoRow icon="bi-file-binary" label="Format" value={document.fileType?.toUpperCase() || '—'} />
            <InfoRow icon="bi-upc-scan" label="Référence" value={document.reference} />
          </div>
        </div>

        <div className="col-lg-7">
          <div className="navix-card p-4 mb-3">
            <h2 className="h6 fw-bold mb-2 d-flex align-items-center gap-2">
              <i className="bi bi-card-list text-primary" aria-hidden="true" />
              Informations
            </h2>
            <InfoRow icon={category.icon} label="Catégorie" value={category.label} />
            <InfoRow icon={entity.icon} label="Entité liée" value={document.entityLabel || entity.label} />
            <InfoRow icon={status.icon} label="Statut" value={status.label} />
            <InfoRow icon="bi-calendar2-plus" label="Date d’émission" value={formatDocumentDate(document.issuedAt)} />
            <InfoRow
              icon="bi-calendar2-x"
              label="Date d’expiration"
              value={
                document.expiresAt
                  ? `${formatDocumentDate(document.expiresAt)}${expiryLabel ? ` · ${expiryLabel}` : ''}`
                  : 'Aucune échéance'
              }
            />
            <InfoRow icon="bi-clock-history" label="Ajouté le" value={formatDate(document.addedAt)} />
            <InfoRow icon="bi-pencil-square" label="Modifié le" value={formatDate(document.updatedAt)} />
          </div>

          {document.description && (
            <div className="navix-card p-4">
              <h2 className="h6 fw-bold mb-2 d-flex align-items-center gap-2">
                <i className="bi bi-card-text text-primary" aria-hidden="true" />
                Description
              </h2>
              <p className="mb-0 text-secondary">{document.description}</p>
            </div>
          )}
        </div>
      </div>

      <PartnerDocumentUploadModal
        key={`${document.id}-${formOpen}`}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        document={document}
        onSubmit={handleFormSubmit}
        loading={isSaving}
        error={formError}
      />

      <ConfirmDialog
        open={renewOpen}
        onClose={() => setRenewOpen(false)}
        title="Renouveler ce document"
        icon="bi-arrow-counterclockwise"
        confirmLabel="Prolonger d’un an"
        confirmVariant="primary"
        loading={isRenewing}
        error={renewError}
        onConfirm={handleRenew}
        message={
          <>
            Prolonger la validité de{' '}
            <strong>
              {document.name} — {document.reference}
            </strong>{' '}
            d’une année supplémentaire à compter de la date d’expiration actuelle ?
          </>
        }
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Supprimer ce document"
        icon="bi-trash"
        confirmLabel="Supprimer le document"
        confirmVariant="danger"
        loading={isDeleting}
        error={deleteError}
        onConfirm={handleDelete}
        message={
          <>
            Supprimer définitivement{' '}
            <strong>
              {document.name} — {document.reference}
            </strong>{' '}
            du centre documentaire de votre entreprise ? Cette action est irréversible.
          </>
        }
      />
    </PageContainer>
  );
};

export default PartnerDocumentDetailPage;
