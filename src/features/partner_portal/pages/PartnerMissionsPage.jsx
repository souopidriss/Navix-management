/**
 * Navix Partner Portal — PartnerMissionsPage (PROMPT 064 — MISSIONS &
 * PRESTATIONS PARTENAIRE · PREMIUM)
 * --------------------------------------------------------------------------
 * Missions de l'entreprise partenaire, en gestion complète :
 *   HEADER « Missions » + « Nouvelle mission » (→ /partner/missions/new) +
 *   « Exporter »
 *   → 4 KPI premium (MISSIONS 24 / EN COURS 5 / TERMINÉES 17 /
 *     REVENUS 18 750 000 FCFA, dynamiques depuis la liste réelle)
 *   → Recherche instantanée + filtres Statut / Prestation / Période
 *     (dont « Personnalisée » avec plage de dates) + Réinitialiser
 *   → Tableau premium (Référence, Date, Client, Prestation, Véhicule,
 *     Chauffeur, Départ, Destination, Statut, Montant, Actions)
 *     + pagination 5/10/25
 *   → Actions par ligne (menu déroulant) : Voir détails, Modifier,
 *     Démarrer, Terminer, Annuler, Supprimer — selon statut et permissions.
 *
 * Multi-tenant : le service filtre strictement par companyId du partenaire —
 * jamais d'identité arbitraire depuis l'UI. RBAC : les actions d'écriture
 * sont conditionnées aux permissions PARTNER_MISSIONS_*.
 */
import { useState, useMemo, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui';
import {
  PageContainer,
  PageHeader,
  LoadingState,
  ErrorState,
  EmptyState,
  DataTable,
  SearchBar,
  FilterBar,
  Pagination,
  StatusBadge,
  ActionDropdown,
  ConfirmDialog,
  DeleteModal,
  ExportButton,
} from '@/components/core';
import { Can } from '@/features/rbac/components';
import { useCan } from '@/features/rbac/hooks';
import { PERMISSIONS } from '@/features/rbac/constants';
import { ROUTES, partnerMissionDetailPath } from '@/routes/route.constants';
import { formatNumber, formatDate } from '@/utils/format';
import {
  FCFA_LABEL,
  PARTNER_MISSION_PAGE_SIZE_OPTIONS,
  getPartnerMissionStatus,
  getPartnerMissionType,
} from '../constants/partner.constants';
import usePartnerMissions from '../hooks/usePartnerMissions';
import usePartnerMissionFilters from '../hooks/usePartnerMissionFilters';
import PartnerMissionStats from '../components/PartnerMissions/PartnerMissionStats';
import PartnerMissionFormModal from '../components/PartnerMissions/PartnerMissionFormModal';
import '../components/PartnerMissions/PartnerMissions.css';

const STATUS_ACTIONS = [
  { from: 'scheduled', next: 'in_progress', label: 'Démarrer', icon: 'bi-play-circle', variant: 'primary' },
  { from: 'in_progress', next: 'completed', label: 'Terminer', icon: 'bi-check2-circle', variant: 'success' },
];

const CANCELABLE = ['scheduled', 'in_progress'];

const EXPORT_COLUMNS = [
  { key: 'reference', label: 'Référence' },
  { key: 'title', label: 'Titre' },
  { key: 'type', label: 'Type de prestation' },
  { key: 'status', label: 'Statut' },
  { key: 'client', label: 'Client' },
  { key: 'clientContact', label: 'Contact client' },
  { key: 'clientPhone', label: 'Téléphone client' },
  { key: 'vehicle', label: 'Véhicule' },
  { key: 'registrationNumber', label: 'Immatriculation' },
  { key: 'driver', label: 'Chauffeur' },
  { key: 'departure', label: 'Départ' },
  { key: 'destination', label: 'Destination' },
  { key: 'distanceKm', label: 'Distance (km)' },
  { key: 'startDate', label: 'Date de début' },
  { key: 'endDate', label: 'Date de fin' },
  { key: 'amount', label: 'Montant (FCFA)' },
  { key: 'notes', label: 'Notes' },
];

const PartnerMissionsPage = () => {
  const can = useCan();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchPrefilled = useRef(false);

  const {
    isLoading,
    error,
    refetch,
    search,
    setSearch,
    filters,
    setFilters,
    hasActiveFilters,
    resetFilters,
    sort,
    setSort,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalItems,
    totalPages,
    pageItems,
    sorted,
    counts,
    updateMission,
    updateMissionStatus,
    cancelMission,
    deleteMission,
  } = usePartnerMissions();

  const { fields: filterFields } = usePartnerMissionFilters(filters);

  /* Pré-remplissage de la recherche depuis le module Clients Partenaire
     (action « Voir missions » → /partner/missions?q=<client>). */
  useEffect(() => {
    if (!searchPrefilled.current) {
      const query = searchParams.get('q');
      if (query) setSearch(query);
      searchPrefilled.current = true;
    }
  }, [searchParams, setSearch]);

  /* ── États des modales / confirmations ────────────────────────────────── */
  const [formTarget, setFormTarget] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [statusTarget, setStatusTarget] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusError, setStatusError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const exportRows = useMemo(
    () =>
      sorted.map((mission) => ({
        reference: mission.reference ?? '',
        title: mission.title ?? '',
        type: getPartnerMissionType(mission.type).label,
        status: getPartnerMissionStatus(mission.status).label,
        client: mission.client ?? '',
        clientContact: mission.clientContact ?? '',
        clientPhone: mission.clientPhone ?? '',
        vehicle: mission.vehicle ?? '',
        registrationNumber: mission.registrationNumber ?? '',
        driver: mission.driver ?? '',
        departure: mission.departure ?? '',
        destination: mission.destination ?? '',
        distanceKm: Number(mission.distanceKm) || 0,
        startDate: mission.startDate ?? '',
        endDate: mission.endDate ?? '',
        amount: Number(mission.amount) || 0,
        notes: mission.notes ?? '',
      })),
    [sorted],
  );

  const openEdit = (mission) => {
    setFormTarget(mission);
    setFormError('');
    setFormOpen(true);
  };

  const openStatusAction = (mission, nextStatus, label) => {
    setStatusTarget({ mission, nextStatus, label });
    setStatusError('');
  };

  const openDelete = (mission) => {
    setDeleteTarget(mission);
    setDeleteError('');
  };

  const handleFormSubmit = async (payload) => {
    if (!formTarget) return;
    setIsSaving(true);
    setFormError('');
    try {
      await updateMission(formTarget.id, payload);
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
      await updateMissionStatus(statusTarget.mission.id, statusTarget.nextStatus);
      toast.success('Statut de la mission mis à jour.');
      setStatusTarget(null);
      refetch();
    } catch (err) {
      setStatusError(err?.message || 'Changement de statut refusé.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!statusTarget || statusTarget.nextStatus !== 'cancelled') return;
    setIsUpdating(true);
    setStatusError('');
    try {
      await cancelMission(statusTarget.mission.id);
      toast.success('Mission annulée.');
      setStatusTarget(null);
      refetch();
    } catch (err) {
      setStatusError(err?.message || 'Annulation refusée.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteMission(deleteTarget.id);
      toast.success('Mission supprimée.');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      setDeleteError(err?.message || 'Impossible de supprimer la mission.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSortChange = (by, direction) => setSort({ by, direction });

  const buildStatusActionItems = (mission) =>
    STATUS_ACTIONS.filter((action) => action.from === mission.status).map((action) => ({
      key: action.next,
      label: action.label,
      icon: action.icon,
      show: () => can(PERMISSIONS.PARTNER_MISSIONS_UPDATE),
      onClick: () => openStatusAction(mission, action.next, action.label),
    }));

  const columns = [
    {
      key: 'reference',
      label: 'Référence',
      sortable: true,
      render: (mission) => (
        <button
          type="button"
          className="navix-pmis-refbtn"
          onClick={() => navigate(partnerMissionDetailPath(mission.id))}
          title={`Voir ${mission.reference}`}
        >
          <span className="navix-pmis-icon" aria-hidden="true">
            <i className="bi bi-signpost-split" />
          </span>
          <span className="text-start">
            <span className="fw-semibold font-monospace d-block">{mission.reference}</span>
            <small className="text-secondary d-block text-truncate" style={{ maxWidth: 260 }}>
              {mission.title}
            </small>
          </span>
        </button>
      ),
    },
    {
      key: 'startDate',
      label: 'Date',
      sortable: true,
      render: (mission) => (
        <span className="small">
          {formatDate(mission.startDate)}
          {mission.endDate ? ` → ${formatDate(mission.endDate)}` : ''}
        </span>
      ),
    },
    {
      key: 'client',
      label: 'Client',
      sortable: true,
      render: (mission) => mission.client || <span className="text-secondary">—</span>,
    },
    {
      key: 'type',
      label: 'Prestation',
      render: (mission) => {
        const meta = getPartnerMissionType(mission.type);
        return (
          <span>
            <i className={`bi ${meta.icon} me-1 text-secondary`} aria-hidden="true" />
            {meta.label}
          </span>
        );
      },
    },
    {
      key: 'vehicle',
      label: 'Véhicule',
      render: (mission) => (
        <span>
          <span className="d-block">{mission.vehicle || '—'}</span>
          {mission.registrationNumber && (
            <small className="text-secondary font-monospace d-block">{mission.registrationNumber}</small>
          )}
        </span>
      ),
    },
    {
      key: 'driver',
      label: 'Chauffeur',
      render: (mission) => (
        <span>
          <i className="bi bi-person me-1 text-secondary" aria-hidden="true" />
          {mission.driver || '—'}
        </span>
      ),
    },
    {
      key: 'departure',
      label: 'Départ',
      render: (mission) => (
        <span className="navix-pmis-route">
          <i className="bi bi-geo-alt text-danger" aria-hidden="true" />
          {mission.departure || '—'}
        </span>
      ),
    },
    {
      key: 'destination',
      label: 'Destination',
      render: (mission) => (
        <span className="navix-pmis-route">
          <i className="bi bi-flag text-success" aria-hidden="true" />
          {mission.destination || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (mission) => {
        const meta = getPartnerMissionStatus(mission.status);
        return <StatusBadge variant={meta.variant} label={meta.label} icon={meta.icon} />;
      },
    },
    {
      key: 'amount',
      label: 'Montant',
      align: 'end',
      sortable: true,
      render: (mission) => (
        <span className="tabular-nums fw-semibold">
          {formatNumber(mission.amount ?? 0)} {FCFA_LABEL}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      srOnly: true,
      align: 'end',
      render: (mission) => (
        <ActionDropdown
          ariaLabel={`Actions pour ${mission.reference}`}
          items={[
            {
              key: 'view',
              label: 'Voir détails',
              icon: 'bi-eye',
              onClick: () => navigate(partnerMissionDetailPath(mission.id)),
            },
            {
              key: 'edit',
              label: 'Modifier',
              icon: 'bi-pencil',
              show: () => can(PERMISSIONS.PARTNER_MISSIONS_UPDATE),
              onClick: () => openEdit(mission),
            },
            ...buildStatusActionItems(mission),
            ...(CANCELABLE.includes(mission.status)
              ? [
                  {
                    key: 'cancel',
                    label: 'Annuler',
                    icon: 'bi-x-circle',
                    danger: true,
                    show: () => can(PERMISSIONS.PARTNER_MISSIONS_UPDATE),
                    onClick: () => openStatusAction(mission, 'cancelled', 'Annuler la mission'),
                  },
                ]
              : []),
            { key: 'separator', separator: true },
            {
              key: 'delete',
              label: 'Supprimer',
              icon: 'bi-trash3',
              danger: true,
              show: () => can(PERMISSIONS.PARTNER_MISSIONS_DELETE),
              onClick: () => openDelete(mission),
            },
          ]}
        />
      ),
    },
  ];

  if (isLoading && pageItems.length === 0 && totalItems === 0) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={4} label="Chargement de vos missions…" />
      </PageContainer>
    );
  }

  if (error && totalItems === 0) {
    return (
      <PageContainer>
        <ErrorState
          title="Impossible de charger vos missions"
          description="Les données de vos missions sont temporairement indisponibles."
          retry={refetch}
        />
      </PageContainer>
    );
  }

  const statusActionMeta = statusTarget
    ? statusTarget.nextStatus === 'cancelled'
      ? { label: 'Annuler la mission', icon: 'bi-x-circle', variant: 'danger' }
      : { label: statusTarget.label ?? 'Changer de statut', icon: 'bi-arrow-repeat', variant: 'primary' }
    : null;

  return (
    <PageContainer>
      <Helmet>
        <title>Missions — Navix Partenaire</title>
      </Helmet>

      <PageHeader
        title="Missions"
        subtitle="Gérez vos missions et prestations partenaire et suivez leur exécution en temps réel."
        icon="bi-signpost-split"
        breadcrumbs={[{ label: 'Espace Partenaire', to: ROUTES.PARTNER_DASHBOARD }, { label: 'Missions' }]}
        actions={
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Can permission={PERMISSIONS.PARTNER_MISSIONS_CREATE}>
              <Button
                variant="primary"
                size="sm"
                icon="bi-plus-circle"
                onClick={() => navigate(ROUTES.PARTNER_MISSIONS_NEW)}
              >
                Nouvelle mission
              </Button>
            </Can>
            <ExportButton
              format="csv"
              data={exportRows}
              columns={EXPORT_COLUMNS}
              filename="missions-partenaire"
              label="Exporter"
              size="sm"
            />
            <Button variant="ghost" size="sm" icon="bi-arrow-clockwise" onClick={refetch} aria-label="Actualiser">
              <span className="visually-hidden">Actualiser</span>
            </Button>
          </div>
        }
      />

      <PartnerMissionStats counts={counts} loading={isLoading} />

      <DataTable
        className="navix-pmis-table"
        columns={columns}
        rows={pageItems}
        sort={sort}
        onSortChange={handleSortChange}
        ariaLabel="Liste des missions partenaires"
        empty={
          <EmptyState
            compact
            icon="bi-signpost-split"
            title={hasActiveFilters ? 'Aucune mission ne correspond' : 'Aucune mission'}
            description={
              hasActiveFilters
                ? 'Modifiez vos critères de recherche ou réinitialisez les filtres.'
                : 'Aucune mission n’est encore rattachée à votre entreprise.'
            }
          />
        }
        header={
          <div className="navix-pmis-toolbar">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Rechercher une mission, un client, un véhicule…"
              resultCount={totalItems}
              aria-label="Rechercher parmi les missions"
            />
            <FilterBar
              fields={filterFields}
              values={filters}
              onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
              onReset={resetFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        }
        footer={
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={PARTNER_MISSION_PAGE_SIZE_OPTIONS}
          />
        }
      />

      <PartnerMissionFormModal
        key={`${formTarget?.id ?? 'create'}-${formOpen}`}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        mission={formTarget}
        onSubmit={handleFormSubmit}
        loading={isSaving}
        error={formError}
      />

      <ConfirmDialog
        open={Boolean(statusTarget)}
        onClose={() => setStatusTarget(null)}
        title={statusActionMeta?.label ?? 'Changer de statut'}
        icon={statusActionMeta?.icon}
        confirmLabel={statusTarget?.nextStatus === 'cancelled' ? 'Annuler la mission' : 'Confirmer'}
        confirmVariant={statusActionMeta?.variant}
        loading={isUpdating}
        error={statusError}
        onConfirm={statusTarget?.nextStatus === 'cancelled' ? handleCancel : handleStatusAction}
        message={
          statusTarget ? (
            <>
              {statusTarget.nextStatus === 'cancelled' ? (
                <>Annuler la mission{' '}
                  <strong>{statusTarget.mission.reference} — {statusTarget.mission.title}</strong>{' '}
                  ? Cette action est irréversible.
                </>
              ) : statusTarget.nextStatus === 'in_progress' ? (
                <>Démarrer la mission{' '}
                  <strong>{statusTarget.mission.reference} — {statusTarget.mission.title}</strong>{' '}
                  ? La prestation passera en cours.
                </>
              ) : (
                <>Marquer la mission{' '}
                  <strong>{statusTarget.mission.reference} — {statusTarget.mission.title}</strong>{' '}
                  comme terminée ? Le revenu sera comptabilisé.
                </>
              )}
            </>
          ) : null
        }
      />

      <DeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        entityName={deleteTarget ? `${deleteTarget.reference} — ${deleteTarget.title}` : undefined}
        title="Supprimer cette mission"
        message={
          deleteTarget ? (
            <>
              Êtes-vous sûr de vouloir supprimer la mission{' '}
              <strong>{deleteTarget.reference} — {deleteTarget.title}</strong>{' '}
              ? Cette action est irréversible.
            </>
          ) : undefined
        }
        loading={isDeleting}
        error={deleteError}
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
};

export default PartnerMissionsPage;
