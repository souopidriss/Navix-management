/**
 * Navix Partner Portal — PartnerMissionsDetailPage (PROMPT 064 — MISSIONS &
 * PRESTATIONS PARTENAIRE · PREMIUM)
 * --------------------------------------------------------------------------
 * Détail d'une mission partenaire (route /partner/missions/:id) :
 *   HEADER : référence + titre, badges statut / prestation, retour vers la
 *   liste, actions RBAC selon le statut (Modifier, Démarrer, Terminer,
 *   Annuler, Supprimer).
 *   → Itinéraire (départ → destination, distance, dates)
 *   → Détails : Client, Véhicule & Chauffeur, Planification, Facturation FCFA
 *   → Notes.
 *
 * Multi-tenant : getMissionById refuse toute mission hors portée
 * (companyId = cmp_partner_navix). RBAC : chaque action d'écriture est
 * conditionnée aux permissions PARTNER_MISSIONS_* et aux transitions métier
 * (graphe des statuts).
 */
import { useState, useEffect, useCallback } from 'react';
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
  DeleteModal,
} from '@/components/core';
import { Can } from '@/features/rbac/components';
import { useCan } from '@/features/rbac/hooks';
import { PERMISSIONS } from '@/features/rbac/constants';
import { ROUTES } from '@/routes/route.constants';
import { formatDate, formatNumber } from '@/utils/format';
import {
  FCFA_LABEL,
  getPartnerMissionStatus,
  getPartnerMissionType,
} from '../constants/partner.constants';
import { partnerMissionService } from '../services/partnerMissionService';
import PartnerMissionFormModal from '../components/PartnerMissions/PartnerMissionFormModal';
import '../components/PartnerMissions/PartnerMissions.css';

const InfoRow = ({ label, value, icon }) => (
  <div className="d-flex align-items-center gap-3 py-2 border-bottom border-secondary-subtle">
    <span className="text-muted d-flex align-items-center gap-2" style={{ width: '10rem', flexShrink: 0 }}>
      {icon && <i className={`bi ${icon}`} aria-hidden="true" />}
      <span className="small">{label}</span>
    </span>
    <span className="fw-medium">{value || '—'}</span>
  </div>
);

const PartnerMissionsDetailPage = () => {
  const navigate = useNavigate();
  const can = useCan();
  const { id } = useParams();

  const [mission, setMission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [statusTarget, setStatusTarget] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusError, setStatusError] = useState('');

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const result = await partnerMissionService.getMissionById(id);
      if (!result) {
        setMission(null);
        setNotFound(true);
        return;
      }
      setMission(result);
    } catch (err) {
      if (err?.status === 404) {
        setMission(null);
        setNotFound(true);
        return;
      }
      setError(err?.message || 'Impossible de charger la mission.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleFormSubmit = async (payload) => {
    setIsSaving(true);
    setFormError('');
    try {
      await partnerMissionService.updateMission(mission.id, payload);
      toast.success('Mission mise à jour.');
      setFormOpen(false);
      refetch();
    } catch (err) {
      setFormError(err?.message || 'Impossible d’enregistrer la mission.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusAction = async () => {
    if (!statusTarget) return;
    setIsUpdating(true);
    setStatusError('');
    try {
      if (statusTarget.next === 'cancelled') {
        await partnerMissionService.cancelMission(mission.id);
        toast.success('Mission annulée.');
      } else {
        await partnerMissionService.updateMissionStatus(mission.id, statusTarget.next);
        toast.success('Statut de la mission mis à jour.');
      }
      setStatusTarget(null);
      refetch();
    } catch (err) {
      setStatusError(err?.message || 'Changement de statut refusé.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError('');
    try {
      await partnerMissionService.deleteMission(mission.id);
      toast.success('Mission supprimée.');
      navigate(ROUTES.PARTNER_MISSIONS);
    } catch (err) {
      setDeleteError(err?.message || 'Impossible de supprimer la mission.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading && !mission) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={4} label="Chargement de la mission…" />
      </PageContainer>
    );
  }

  if (notFound && !mission) {
    return (
      <PageContainer>
        <EmptyState
          icon="bi-signpost-split"
          title="Mission introuvable"
          description="Cette mission n’existe pas ou n’est pas rattachée à votre entreprise."
          action={
            <Button variant="outline" icon="bi-arrow-left" onClick={() => navigate(ROUTES.PARTNER_MISSIONS)}>
              Retour
            </Button>
          }
        />
      </PageContainer>
    );
  }

  if (error && !mission) {
    return (
      <PageContainer>
        <ErrorState
          title="Détail indisponible"
          description="Impossible de charger les informations de cette mission."
          retry={refetch}
        />
      </PageContainer>
    );
  }

  const status = getPartnerMissionStatus(mission.status);
  const type = getPartnerMissionType(mission.type);

  const canUpdate = can(PERMISSIONS.PARTNER_MISSIONS_UPDATE);
  const canDelete = can(PERMISSIONS.PARTNER_MISSIONS_DELETE);

  const statusActions = [];
  if (mission.status === 'scheduled') {
    statusActions.push({ next: 'in_progress', label: 'Démarrer', icon: 'bi-play-circle', variant: 'primary' });
  }
  if (mission.status === 'in_progress') {
    statusActions.push({ next: 'completed', label: 'Terminer', icon: 'bi-check2-circle', variant: 'success' });
  }
  if (mission.status === 'scheduled' || mission.status === 'in_progress') {
    statusActions.push({ next: 'cancelled', label: 'Annuler', icon: 'bi-x-circle', variant: 'danger' });
  }

  const statusActionMeta = statusTarget
    ? statusTarget.next === 'cancelled'
      ? { label: 'Annuler la mission', variant: 'danger' }
      : { label: statusTarget.next === 'in_progress' ? 'Démarrer la mission' : 'Terminer la mission', variant: 'primary' }
    : null;

  return (
    <PageContainer>
      <Helmet>
        <title>Mission {mission.reference} — Navix Partenaire</title>
      </Helmet>

      <PageHeader
        title={mission.reference}
        subtitle={mission.title}
        icon="bi-signpost-split"
        breadcrumbs={[
          { label: 'Espace Partenaire', to: ROUTES.PARTNER_DASHBOARD },
          { label: 'Missions', to: ROUTES.PARTNER_MISSIONS },
          { label: mission.reference },
        ]}
        actions={
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" icon="bi-arrow-left" onClick={() => navigate(ROUTES.PARTNER_MISSIONS)}>
              Retour
            </Button>
            {canUpdate && (
              <Button variant="outline" size="sm" icon="bi-pencil" onClick={() => setFormOpen(true)}>
                Modifier
              </Button>
            )}
            {canDelete && (
              <Button variant="outline" size="sm" icon="bi-trash3" onClick={() => setDeleteOpen(true)}>
                Supprimer
              </Button>
            )}
          </div>
        }
      />

      {/* ── Statut & itinéraire ──────────────────────────────────────────── */}
      <div className="navix-card p-4 mb-4">
        <div className="d-flex flex-wrap align-items-start gap-2 mb-3">
          <StatusBadge variant={status.variant} label={status.label} icon={status.icon} />
          <StatusBadge variant={type.variant ?? 'secondary'} label={type.label} icon={type.icon} dot={false} />
        </div>

        <div className="row align-items-center g-4">
          <div className="col-lg-5">
            <div className="d-flex align-items-center gap-3">
              <span className="navix-detail-marker bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center">
                <i className="bi bi-geo-alt" aria-hidden="true" />
              </span>
              <div>
                <div className="fw-bold fs-5">{mission.departure}</div>
                <div className="text-muted small">Départ</div>
              </div>
            </div>
          </div>

          <div className="col-lg-2 text-center">
            <div className="text-muted small text-uppercase fw-semibold">{formatNumber(mission.distanceKm)} km</div>
            <div className="d-flex align-items-center justify-content-center gap-1 my-1 text-primary">
              <i className="bi bi-circle-fill" style={{ fontSize: '0.4rem' }} aria-hidden="true" />
              <i className="bi bi-arrow-right" aria-hidden="true" />
              <i className="bi bi-circle" style={{ fontSize: '0.4rem' }} aria-hidden="true" />
            </div>
            <div className="text-muted small">
              {formatDate(mission.startDate)} → {formatDate(mission.endDate)}
            </div>
          </div>

          <div className="col-lg-5">
            <div className="d-flex align-items-center gap-3 justify-content-lg-end">
              <div className="text-lg-end">
                <div className="fw-bold fs-5">{mission.destination}</div>
                <div className="text-muted small">Destination</div>
              </div>
              <span className="navix-detail-marker bg-secondary text-white rounded-circle d-inline-flex align-items-center justify-content-center">
                <i className="bi bi-flag" aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Actions selon statut ─────────────────────────────────────────── */}
      {statusActions.length > 0 && (
        <div className="navix-card p-4 mb-4">
          <h2 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
            <i className="bi bi-lightning-charge text-primary" aria-hidden="true" />
            Actions
          </h2>
          <div className="d-flex flex-wrap gap-2">
            {statusActions.map(
              (action) =>
                canUpdate && (
                  <Button
                    key={action.next}
                    variant={action.variant}
                    icon={action.icon}
                    onClick={() => {
                      setStatusError('');
                      setStatusTarget({ next: action.next });
                    }}
                  >
                    {action.label}
                  </Button>
                ),
            )}
          </div>
        </div>
      )}

      {/* ── Détails ──────────────────────────────────────────────────────── */}
      <div className="row g-3">
        <div className="col-lg-6">
          <div className="navix-card p-4 h-100">
            <h2 className="h6 fw-bold mb-2 d-flex align-items-center gap-2">
              <i className="bi bi-buildings text-primary" aria-hidden="true" />
              Client
            </h2>
            <InfoRow icon="bi-person-badge" label="Client" value={mission.client} />
            <InfoRow icon="bi-person" label="Contact" value={mission.clientContact} />
            <InfoRow icon="bi-telephone" label="Téléphone" value={mission.clientPhone} />
          </div>
        </div>

        <div className="col-lg-6">
          <div className="navix-card p-4 h-100">
            <h2 className="h6 fw-bold mb-2 d-flex align-items-center gap-2">
              <i className="bi bi-truck text-primary" aria-hidden="true" />
              Véhicule &amp; Chauffeur
            </h2>
            <InfoRow icon="bi-car-front" label="Véhicule" value={mission.vehicle} />
            <InfoRow icon="bi-upc-scan" label="Immatriculation" value={mission.registrationNumber} />
            <InfoRow icon="bi-person-vcard" label="Chauffeur" value={mission.driver} />
          </div>
        </div>

        <div className="col-lg-6">
          <div className="navix-card p-4 h-100">
            <h2 className="h6 fw-bold mb-2 d-flex align-items-center gap-2">
              <i className="bi bi-calendar2-week text-primary" aria-hidden="true" />
              Planification
            </h2>
            <InfoRow icon="bi-calendar2" label="Date de début" value={formatDate(mission.startDate)} />
            <InfoRow icon="bi-calendar2-check" label="Date de fin" value={formatDate(mission.endDate)} />
            <InfoRow icon="bi-arrows-angle-expand" label="Distance" value={`${formatNumber(mission.distanceKm)} km`} />
          </div>
        </div>

        <div className="col-lg-6">
          <div className="navix-card p-4 h-100">
            <h2 className="h6 fw-bold mb-2 d-flex align-items-center gap-2">
              <i className="bi bi-cash-stack text-primary" aria-hidden="true" />
              Facturation
            </h2>
            <InfoRow
              icon="bi-cash"
              label="Montant"
              value={
                <span className="tabular-nums fw-semibold">
                  {formatNumber(mission.amount)} {FCFA_LABEL}
                </span>
              }
            />
            <InfoRow icon="bi-tag" label="Prestation" value={type.label} />
            <InfoRow icon="bi-check2-circle" label="Statut" value={status.label} />
          </div>
        </div>

        {mission.notes && (
          <div className="col-12">
            <div className="navix-card p-4">
              <h2 className="h6 fw-bold mb-2 d-flex align-items-center gap-2">
                <i className="bi bi-card-text text-primary" aria-hidden="true" />
                Notes
              </h2>
              <p className="mb-0 text-secondary">{mission.notes}</p>
            </div>
          </div>
        )}
      </div>

      <PartnerMissionFormModal
        key={`${mission.id}-${formOpen}`}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        mission={mission}
        onSubmit={handleFormSubmit}
        loading={isSaving}
        error={formError}
      />

      <ConfirmDialog
        open={Boolean(statusTarget)}
        onClose={() => setStatusTarget(null)}
        title={statusActionMeta?.label ?? 'Changer de statut'}
        icon={statusTarget?.next === 'cancelled' ? 'bi-x-circle' : 'bi-arrow-repeat'}
        confirmLabel={statusTarget?.next === 'cancelled' ? 'Annuler la mission' : 'Confirmer'}
        confirmVariant={statusActionMeta?.variant}
        loading={isUpdating}
        error={statusError}
        onConfirm={handleStatusAction}
        message={
          statusTarget ? (
            statusTarget.next === 'cancelled' ? (
              <>
                Annuler la mission{' '}
                <strong>
                  {mission.reference} — {mission.title}
                </strong>{' '}
                ? Cette action est irréversible.
              </>
            ) : statusTarget.next === 'in_progress' ? (
              <>
                Démarrer la mission{' '}
                <strong>
                  {mission.reference} — {mission.title}
                </strong>{' '}
                ? La prestation passera en cours.
              </>
            ) : (
              <>
                Marquer la mission{' '}
                <strong>
                  {mission.reference} — {mission.title}
                </strong>{' '}
                comme terminée ? Le revenu sera comptabilisé.
              </>
            )
          ) : null
        }
      />

      <DeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        entityName={`${mission.reference} — ${mission.title}`}
        title="Supprimer cette mission"
        message={
          <>
            Êtes-vous sûr de vouloir supprimer la mission{' '}
            <strong>
              {mission.reference} — {mission.title}
            </strong>{' '}
            ? Cette action est irréversible.
          </>
        }
        loading={isDeleting}
        error={deleteError}
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
};

export default PartnerMissionsDetailPage;
