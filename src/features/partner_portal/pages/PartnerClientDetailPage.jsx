/**
 * Navix Partner Portal — PartnerClientDetailPage (PROMPT 065 — CLIENTS PARTENAIRE · PREMIUM)
 * --------------------------------------------------------------------------
 * Détail d'un client partenaire (route /partner/clients/:id) :
 *   HEADER : nom + référence, badges statut / type, retour vers la liste,
 *   actions RBAC (Modifier, Archiver — désactivation douce).
 *   → Statistiques d'activité : missions, en cours, terminées, revenus FCFA
 *     (recomputées depuis le module Missions — source unique).
 *   → Fiche : Identification, Coordonnées, Contact, Notes.
 *   → Activité : missions réelles du client (lien vers le module Missions).
 *
 * Multi-tenant : getClientById refuse tout client hors portée
 * (companyId = cmp_partner_navix + partnerId). RBAC : chaque action
 * d'écriture est conditionnée aux permissions PARTNER_CLIENTS_*.
 * L'archivage ne supprime jamais les données.
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
  MetricCard,
} from '@/components/core';
import { Can } from '@/features/rbac/components';
import { useCan } from '@/features/rbac/hooks';
import { PERMISSIONS } from '@/features/rbac/constants';
import { ROUTES } from '@/routes/route.constants';
import { formatNumber, formatDate } from '@/utils/format';
import {
  FCFA_LABEL,
  getPartnerClientStatus,
  getPartnerClientType,
} from '../constants/partner.constants';
import usePartnerClient from '../hooks/usePartnerClient';
import PartnerClientFormModal from '../components/PartnerClients/PartnerClientFormModal';
import PartnerClientActivity from '../components/PartnerClients/PartnerClientActivity';
import '../components/PartnerClients/PartnerClients.css';

const InfoRow = ({ label, value, icon }) => (
  <div className="d-flex align-items-center gap-3 py-2 border-bottom border-secondary-subtle">
    <span className="text-muted d-flex align-items-center gap-2" style={{ width: '10rem', flexShrink: 0 }}>
      {icon && <i className={`bi ${icon}`} aria-hidden="true" />}
      <span className="small">{label}</span>
    </span>
    <span className="fw-medium">{value || '—'}</span>
  </div>
);

const PartnerClientDetailPage = () => {
  const navigate = useNavigate();
  const can = useCan();
  const { id } = useParams();

  const { client, stats, missions, isLoading, error, refetch, updateClient, archiveClient } = usePartnerClient(id);

  const [formOpen, setFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [archiveOpen, setArchiveOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState('');

  if (isLoading && !client) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={4} label="Chargement du client…" />
      </PageContainer>
    );
  }

  if (error?.status === 404 && !client) {
    return (
      <PageContainer>
        <EmptyState
          icon="bi-people"
          title="Client introuvable"
          description="Ce client n’existe pas ou n’est pas rattaché à votre entreprise."
          action={
            <Button variant="outline" icon="bi-arrow-left" onClick={() => navigate(ROUTES.PARTNER_CLIENTS)}>
              Retour
            </Button>
          }
        />
      </PageContainer>
    );
  }

  if (error && !client) {
    return (
      <PageContainer>
        <ErrorState
          title="Détail indisponible"
          description="Impossible de charger les informations de ce client."
          retry={refetch}
        />
      </PageContainer>
    );
  }

  const status = getPartnerClientStatus(client.status);
  const type = getPartnerClientType(client.type);
  const canUpdate = can(PERMISSIONS.PARTNER_CLIENTS_UPDATE);
  const canArchive = can(PERMISSIONS.PARTNER_CLIENTS_ARCHIVE) && client.status !== 'archived';

  const handleFormSubmit = async (payload) => {
    setIsSaving(true);
    setFormError('');
    try {
      await updateClient(payload);
      toast.success('Client mis à jour.');
      setFormOpen(false);
      refetch();
    } catch (err) {
      setFormError(err?.message || 'Impossible d’enregistrer le client.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    setIsArchiving(true);
    setArchiveError('');
    try {
      await archiveClient();
      toast.success('Client archivé.');
      setArchiveOpen(false);
      refetch();
    } catch (err) {
      setArchiveError(err?.message || 'Archivage refusé.');
    } finally {
      setIsArchiving(false);
    }
  };

  const contactName = client.contactName || client.contact;

  return (
    <PageContainer>
      <Helmet>
        <title>{client.name} — Navix Partenaire</title>
      </Helmet>

      <PageHeader
        title={client.name}
        subtitle={`${client.reference} — portefeuille de votre entreprise partenaire`}
        icon="bi-people"
        breadcrumbs={[
          { label: 'Espace Partenaire', to: ROUTES.PARTNER_DASHBOARD },
          { label: 'Clients', to: ROUTES.PARTNER_CLIENTS },
          { label: client.name },
        ]}
        actions={
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" icon="bi-arrow-left" onClick={() => navigate(ROUTES.PARTNER_CLIENTS)}>
              Retour
            </Button>
            {canUpdate && (
              <Button variant="outline" size="sm" icon="bi-pencil" onClick={() => setFormOpen(true)}>
                Modifier
              </Button>
            )}
            {canArchive && (
              <Button variant="outline" size="sm" icon="bi-archive" onClick={() => setArchiveOpen(true)}>
                Archiver
              </Button>
            )}
          </div>
        }
      />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="navix-pcli-detail-hero mb-4">
        <span className="navix-pcli-detail-hero__icon" aria-hidden="true">
          <i className={`bi ${type.icon}`} />
        </span>
        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          <div className="h5 fw-bold mb-1 text-truncate">{client.name}</div>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <StatusBadge variant={status.variant} label={status.label} icon={status.icon} />
            <StatusBadge variant="secondary" label={type.label} icon={type.icon} dot={false} />
            <span className="text-secondary small d-inline-flex align-items-center gap-1">
              <i className="bi bi-geo-alt text-danger" aria-hidden="true" />
              {client.city} · {client.country}
            </span>
          </div>
        </div>
      </div>

      {/* ── Statistiques d'activité (recomputées depuis le module Missions) ── */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-xl-3">
          <MetricCard label="Missions" value={stats?.missionsCount ?? client.missionsCount ?? 0} icon="bi-signpost-split" variant="primary" />
        </div>
        <div className="col-6 col-xl-3">
          <MetricCard label="En cours" value={stats?.inProgress ?? client.inProgressMissions ?? 0} icon="bi-play-circle" variant="info" />
        </div>
        <div className="col-6 col-xl-3">
          <MetricCard label="Terminées" value={stats?.completed ?? client.completedMissions ?? 0} icon="bi-check2-circle" variant="success" />
        </div>
        <div className="col-6 col-xl-3">
          <MetricCard
            label="Revenus"
            value={`${formatNumber(stats?.revenue ?? client.revenue ?? 0)} ${FCFA_LABEL}`}
            icon="bi-cash-stack"
            variant="warning"
          />
        </div>
      </div>

      {/* ── Fiche ───────────────────────────────────────────────────────── */}
      <div className="row g-3">
        <div className="col-lg-6">
          <div className="navix-card p-4 h-100">
            <h2 className="h6 fw-bold mb-2 d-flex align-items-center gap-2">
              <i className="bi bi-person-badge text-primary" aria-hidden="true" />
              Identification
            </h2>
            <InfoRow icon="bi-person" label="Nom" value={client.name} />
            <InfoRow icon="bi-upc-scan" label="Référence" value={client.reference} />
            <InfoRow icon={type.icon} label="Type" value={type.label} />
            <InfoRow icon={status.icon} label="Statut" value={status.label} />
            <InfoRow icon="bi-calendar2-plus" label="Créé le" value={formatDate(client.createdAt)} />
          </div>
        </div>

        <div className="col-lg-6">
          <div className="navix-card p-4 h-100">
            <h2 className="h6 fw-bold mb-2 d-flex align-items-center gap-2">
              <i className="bi bi-geo-alt text-primary" aria-hidden="true" />
              Coordonnées
            </h2>
            <InfoRow icon="bi-envelope" label="Email" value={client.email} />
            <InfoRow icon="bi-telephone" label="Téléphone" value={client.phone} />
            <InfoRow icon="bi-building" label="Adresse" value={client.address} />
            <InfoRow icon="bi-geo-alt" label="Ville" value={client.city} />
            <InfoRow icon="bi-globe2" label="Pays" value={client.country} />
            <InfoRow icon="bi-person" label="Contact principal" value={contactName} />
          </div>
        </div>

        {client.notes && (
          <div className="col-12">
            <div className="navix-card p-4">
              <h2 className="h6 fw-bold mb-2 d-flex align-items-center gap-2">
                <i className="bi bi-card-text text-primary" aria-hidden="true" />
                Notes
              </h2>
              <p className="mb-0 text-secondary">{client.notes}</p>
            </div>
          </div>
        )}

        <div className="col-12">
          <PartnerClientActivity missions={missions} loading={isLoading} />
        </div>
      </div>

      <PartnerClientFormModal
        key={`${client.id}-${formOpen}`}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        client={client}
        onSubmit={handleFormSubmit}
        loading={isSaving}
        error={formError}
      />

      <ConfirmDialog
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        title="Archiver ce client"
        icon="bi-archive"
        confirmLabel="Archiver le client"
        confirmVariant="danger"
        loading={isArchiving}
        error={archiveError}
        onConfirm={handleArchive}
        message={
          <>
            Archiver le client{' '}
            <strong>
              {client.name} — {client.reference}
            </strong>{' '}
            ? Il sera marqué « Archivé » et retiré du portefeuille actif. Ses données et missions sont conservées
            (désactivation douce, jamais de suppression définitive).
          </>
        }
      />
    </PageContainer>
  );
};

export default PartnerClientDetailPage;
