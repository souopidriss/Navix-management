/**
 * Navix Partner Portal — PartnerVehiclesPage (PROMPT 063 — GESTION DES
 * VÉHICULES PARTENAIRE · PREMIUM)
 * --------------------------------------------------------------------------
 * Flotte de l'entreprise partenaire, en gestion complète :
 *   HEADER « Véhicules » + « + Ajouter un véhicule » + « Exporter »
 *   → 4 KPI premium (TOTAL 24 / DISPONIBLES 18 / EN MISSION 4 /
 *     EN MAINTENANCE 2, dynamiques depuis la flotte réelle)
 *   → Recherche instantanée + filtres Statut / Type / Agence + Réinitialiser
 *   → Tableau premium (Véhicule, Immatriculation, Type, Agence, Kilométrage,
 *     Statut, Dernière maintenance) + pagination 10/25/50
 *   → Actions par ligne (menu déroulant) : Voir détails, Modifier, Affecter,
 *     Mettre en maintenance, Supprimer — « Mettre en maintenance » masquée
 *     pour un véhicule déjà en maintenance.
 *   → Modales : création/édition (Zod), détail (4 sections dont Finance FCFA),
 *     confirmation maintenance, affectation chauffeur, suppression confirmée.
 *
 * Multi-tenant : le service filtre strictement par companyId / partnerId du
 * partenaire — jamais de partnerId arbitraire depuis l'UI. RBAC : les actions
 * d'écriture sont conditionnées aux permissions PARTNER_VEHICLES_*.
 */
import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
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
import { ROUTES } from '@/routes/route.constants';
import { getVehicleStatus, formatMileage, formatVehicleDate } from '@/features/vehicles/constants';
import {
  PARTNER_VEHICLE_TYPES,
  PARTNER_VEHICLE_TYPE_VALUES,
  PARTNER_AGENCIES,
  PARTNER_VEHICLE_PAGE_SIZE_OPTIONS,
  getPartnerVehicleType,
} from '../constants/partner.constants';
import usePartnerVehicles from '../hooks/usePartnerVehicles';
import PartnerVehicleStats from '../components/PartnerVehicles/PartnerVehicleStats';
import PartnerVehicleFormModal from '../components/PartnerVehicles/PartnerVehicleFormModal';
import PartnerVehicleDetailsModal from '../components/PartnerVehicles/PartnerVehicleDetailsModal';
import '../components/PartnerVehicles/PartnerVehicles.css';

const STATUS_FILTER_OPTIONS = ['available', 'in_use', 'maintenance', 'out_of_service'].map((status) => ({
  value: status,
  label: getVehicleStatus(status).label,
}));

const TYPE_FILTER_OPTIONS = PARTNER_VEHICLE_TYPE_VALUES.map((type) => ({
  value: type,
  label: PARTNER_VEHICLE_TYPES[type].label,
}));

const AGENCY_FILTER_OPTIONS = PARTNER_AGENCIES.map((agency) => ({ value: agency, label: agency }));

const EXPORT_COLUMNS = [
  { key: 'registrationNumber', label: 'Immatriculation' },
  { key: 'brand', label: 'Marque' },
  { key: 'model', label: 'Modèle' },
  { key: 'year', label: 'Année' },
  { key: 'type', label: 'Type' },
  { key: 'agency', label: 'Agence' },
  { key: 'mileage', label: 'Kilométrage (km)' },
  { key: 'status', label: 'Statut' },
  { key: 'currentDriver', label: 'Chauffeur' },
  { key: 'lastMaintenance', label: 'Dernière maintenance' },
];

const PartnerVehiclesPage = () => {
  const can = useCan();
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
    availabilityRate,
    createVehicle,
    updateVehicle,
    updateVehicleStatus,
    assignVehicle,
    deleteVehicle,
  } = usePartnerVehicles();

  /* ── États des modales ────────────────────────────────────────────────── */
  const [detailsTarget, setDetailsTarget] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formTarget, setFormTarget] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [statusTarget, setStatusTarget] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusError, setStatusError] = useState('');

  const [assignTarget, setAssignTarget] = useState(null);
  const [driverName, setDriverName] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');

  const exportRows = useMemo(
    () =>
      sorted.map((vehicle) => ({
        registrationNumber: vehicle.registrationNumber,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        type: getPartnerVehicleType(vehicle.type).label,
        agency: vehicle.agency,
        mileage: Number(vehicle.mileage) || 0,
        status: getVehicleStatus(vehicle.status).label,
        currentDriver: vehicle.currentDriver || '',
        lastMaintenance: vehicle.lastMaintenance || '',
      })),
    [sorted],
  );

  /* ── Ouvertures ───────────────────────────────────────────────────────── */
  const openCreate = () => {
    setFormTarget(null);
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (vehicle) => {
    setFormTarget(vehicle);
    setFormError('');
    setFormOpen(true);
  };

  const openDelete = (vehicle) => {
    setDeleteTarget(vehicle);
    setDeleteError('');
  };

  const openMaintenance = (vehicle) => {
    setStatusTarget(vehicle);
    setStatusError('');
  };

  const openAssign = (vehicle) => {
    setAssignTarget(vehicle);
    setDriverName(vehicle.currentDriver || '');
    setAssignError('');
  };

  /* ── Soumissions ──────────────────────────────────────────────────────── */
  const handleFormSubmit = async (payload) => {
    setIsSaving(true);
    setFormError('');
    try {
      if (formTarget) {
        await updateVehicle(formTarget.id, payload);
        toast.success('Véhicule mis à jour.');
      } else {
        await createVehicle(payload);
        toast.success('Véhicule ajouté à votre flotte.');
      }
      setFormOpen(false);
      refetch();
    } catch (err) {
      setFormError(err?.message || 'Impossible d’enregistrer le véhicule.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteVehicle(deleteTarget.id);
      toast.success('Véhicule supprimé de votre flotte.');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      setDeleteError(err?.message || 'Impossible de supprimer le véhicule.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMaintenance = async () => {
    if (!statusTarget) return;
    setIsUpdating(true);
    setStatusError('');
    try {
      await updateVehicleStatus(statusTarget.id, 'maintenance');
      toast.success('Véhicule mis en maintenance.');
      setStatusTarget(null);
      refetch();
    } catch (err) {
      setStatusError(err?.message || 'Changement de statut refusé.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssign = async () => {
    if (!assignTarget) return;
    if (!driverName.trim()) {
      setAssignError('Indiquez le nom du chauffeur à affecter.');
      return;
    }
    setIsAssigning(true);
    setAssignError('');
    try {
      await assignVehicle(assignTarget.id, driverName.trim());
      toast.success('Chauffeur affecté au véhicule.');
      setAssignTarget(null);
      setDriverName('');
      refetch();
    } catch (err) {
      setAssignError(err?.message || 'Impossible d’affecter le chauffeur.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleSortChange = (by, direction) => setSort({ by, direction });

  const columns = [
    {
      key: 'vehicle',
      label: 'Véhicule',
      render: (vehicle) => (
        <button
          type="button"
          className="navix-pveh-vehbtn"
          onClick={() => setDetailsTarget(vehicle)}
          title={`Voir ${vehicle.brand} ${vehicle.model}`}
        >
          <span className="navix-pveh-icon" aria-hidden="true">
            <i className="bi bi-truck" />
          </span>
          <span className="text-start">
            <span className="fw-semibold d-block">
              {vehicle.brand} {vehicle.model}
            </span>
            <small className="text-secondary">{vehicle.year || '—'}</small>
          </span>
        </button>
      ),
    },
    {
      key: 'registrationNumber',
      label: 'Immatriculation',
      sortable: true,
      render: (vehicle) => <span className="font-monospace fw-semibold">{vehicle.registrationNumber}</span>,
    },
    {
      key: 'type',
      label: 'Type',
      render: (vehicle) => {
        const meta = getPartnerVehicleType(vehicle.type);
        return (
          <span>
            <i className={`bi ${meta.icon} me-1 text-secondary`} aria-hidden="true" />
            {meta.label}
          </span>
        );
      },
    },
    {
      key: 'agency',
      label: 'Agence',
      sortable: true,
      render: (vehicle) => (
        <span>
          <i className="bi bi-geo-alt me-1 text-danger" aria-hidden="true" />
          {vehicle.agency || '—'}
        </span>
      ),
    },
    {
      key: 'mileage',
      label: 'Kilométrage',
      align: 'end',
      sortable: true,
      render: (vehicle) => <span className="tabular-nums">{formatMileage(vehicle.mileage)}</span>,
    },
    {
      key: 'status',
      label: 'Statut',
      render: (vehicle) => {
        const meta = getVehicleStatus(vehicle.status);
        return <StatusBadge variant={meta.variant} label={meta.label} icon={meta.icon} />;
      },
    },
    {
      key: 'lastMaintenance',
      label: 'Dernière maintenance',
      render: (vehicle) =>
        vehicle.lastMaintenance ? (
          formatVehicleDate(vehicle.lastMaintenance)
        ) : (
          <span className="text-secondary">—</span>
        ),
    },
    {
      key: 'actions',
      label: 'Actions',
      srOnly: true,
      align: 'end',
      render: (vehicle) => (
        <ActionDropdown
          ariaLabel={`Actions pour ${vehicle.brand} ${vehicle.model}`}
          items={[
            {
              key: 'view',
              label: 'Voir détails',
              icon: 'bi-eye',
              onClick: () => setDetailsTarget(vehicle),
            },
            {
              key: 'edit',
              label: 'Modifier',
              icon: 'bi-pencil',
              show: () => can(PERMISSIONS.PARTNER_VEHICLES_UPDATE),
              onClick: () => openEdit(vehicle),
            },
            {
              key: 'assign',
              label: 'Affecter',
              icon: 'bi-person-plus',
              show: () => can(PERMISSIONS.PARTNER_VEHICLES_ASSIGN),
              onClick: () => openAssign(vehicle),
            },
            {
              key: 'maintenance',
              label: 'Mettre en maintenance',
              icon: 'bi-wrench-adjustable',
              show: () => vehicle.status !== 'maintenance' && can(PERMISSIONS.PARTNER_VEHICLES_UPDATE),
              onClick: () => openMaintenance(vehicle),
            },
            { key: 'separator', separator: true },
            {
              key: 'delete',
              label: 'Supprimer',
              icon: 'bi-trash3',
              danger: true,
              show: () => can(PERMISSIONS.PARTNER_VEHICLES_DELETE),
              onClick: () => openDelete(vehicle),
            },
          ]}
        />
      ),
    },
  ];

  if (isLoading && pageItems.length === 0 && totalItems === 0) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={4} label="Chargement de votre flotte…" />
      </PageContainer>
    );
  }

  if (error && totalItems === 0) {
    return (
      <PageContainer>
        <ErrorState
          title="Impossible de charger votre flotte"
          description="Les données de votre flotte sont temporairement indisponibles."
          retry={refetch}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Helmet>
        <title>Véhicules — Navix Partenaire</title>
      </Helmet>

      <PageHeader
        title="Véhicules"
        subtitle="Gérez les véhicules de votre flotte et suivez leur disponibilité."
        icon="bi-truck"
        breadcrumbs={[{ label: 'Espace Partenaire', to: ROUTES.PARTNER_DASHBOARD }, { label: 'Véhicules' }]}
        actions={
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Can permission={PERMISSIONS.PARTNER_VEHICLES_CREATE}>
              <Button variant="primary" size="sm" icon="bi-plus-circle" onClick={openCreate}>
                Ajouter un véhicule
              </Button>
            </Can>
            <ExportButton
              format="csv"
              data={exportRows}
              columns={EXPORT_COLUMNS}
              filename="flotte-partenaire"
              label="Exporter"
              size="sm"
            />
            <Button variant="ghost" size="sm" icon="bi-arrow-clockwise" onClick={refetch} aria-label="Actualiser">
              <span className="visually-hidden">Actualiser</span>
            </Button>
          </div>
        }
      />

      <PartnerVehicleStats counts={counts} availabilityRate={availabilityRate} loading={isLoading} />

      <DataTable
        className="navix-pveh-table"
        columns={columns}
        rows={pageItems}
        sort={sort}
        onSortChange={handleSortChange}
        ariaLabel="Liste des véhicules partenaires"
        empty={
          <EmptyState
            compact
            icon="bi-truck"
            title={hasActiveFilters ? 'Aucun véhicule ne correspond' : 'Aucun véhicule'}
            description={
              hasActiveFilters
                ? 'Modifiez vos critères de recherche ou réinitialisez les filtres.'
                : 'Ajoutez votre premier véhicule pour commencer à gérer votre flotte.'
            }
          />
        }
        header={
          <div className="navix-pveh-toolbar">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Rechercher un véhicule, une immatriculation…"
              resultCount={totalItems}
              aria-label="Rechercher dans la flotte partenaire"
            />
            <FilterBar
              fields={[
                {
                  key: 'status',
                  type: 'select',
                  label: 'Statut',
                  options: STATUS_FILTER_OPTIONS,
                  allLabel: 'Tous les statuts',
                },
                {
                  key: 'type',
                  type: 'select',
                  label: 'Type',
                  options: TYPE_FILTER_OPTIONS,
                  allLabel: 'Tous les types',
                },
                {
                  key: 'agency',
                  type: 'select',
                  label: 'Agence',
                  options: AGENCY_FILTER_OPTIONS,
                  allLabel: 'Toutes les agences',
                },
              ]}
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
            pageSizeOptions={PARTNER_VEHICLE_PAGE_SIZE_OPTIONS}
          />
        }
      />

      <PartnerVehicleFormModal
        key={`${formTarget?.id ?? 'create'}-${formOpen}`}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        vehicle={formTarget}
        vehicles={sorted}
        onSubmit={handleFormSubmit}
        loading={isSaving}
        error={formError}
      />

      <PartnerVehicleDetailsModal
        open={Boolean(detailsTarget)}
        onClose={() => setDetailsTarget(null)}
        vehicle={detailsTarget}
      />

      <ConfirmDialog
        open={Boolean(statusTarget)}
        onClose={() => setStatusTarget(null)}
        title="Mettre en maintenance"
        icon="bi-wrench-adjustable"
        confirmLabel="Confirmer"
        confirmVariant="warning"
        loading={isUpdating}
        error={statusError}
        onConfirm={handleMaintenance}
        message={
          statusTarget ? (
            <>
              Mettre en maintenance{' '}
              <strong>
                {statusTarget.brand} {statusTarget.model} ({statusTarget.registrationNumber})
              </strong>{' '}
              ? Le véhicule ne sera plus disponible pour de nouvelles missions.
            </>
          ) : null
        }
      />

      <ConfirmDialog
        open={Boolean(assignTarget)}
        onClose={() => setAssignTarget(null)}
        title="Affecter un chauffeur"
        icon="bi-person-plus"
        confirmLabel="Affecter"
        confirmVariant="primary"
        loading={isAssigning}
        error={assignError}
        onConfirm={handleAssign}
        message={
          assignTarget ? (
            <>
              <p className="mb-3">
                Affecter{' '}
                <strong>
                  {assignTarget.brand} {assignTarget.model} ({assignTarget.registrationNumber})
                </strong>{' '}
                à un chauffeur :
              </p>
              <label className="form-label" htmlFor="partner-vehicle-assign-driver">
                Nom du chauffeur
              </label>
              <input
                id="partner-vehicle-assign-driver"
                className="form-control"
                value={driverName}
                onChange={(event) => {
                  setDriverName(event.target.value);
                  setAssignError('');
                }}
                placeholder="Ex. Serge Ntolo"
              />
            </>
          ) : null
        }
      />

      <DeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        entityName={
          deleteTarget ? `${deleteTarget.brand} ${deleteTarget.model} (${deleteTarget.registrationNumber})` : undefined
        }
        title="Supprimer ce véhicule"
        message={
          deleteTarget ? (
            <>
              Êtes-vous sûr de vouloir supprimer ce véhicule :{' '}
              <strong>
                {deleteTarget.brand} {deleteTarget.model} ({deleteTarget.registrationNumber})
              </strong>{' '}
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

export default PartnerVehiclesPage;
