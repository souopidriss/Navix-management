import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  MetricCard,
  Pagination,
  StatusBadge,
  DeleteModal,
  ConfirmDialog,
} from '@/components/core';
import { Can } from '@/features/rbac/components';
import { useCan } from '@/features/rbac/hooks';
import { PERMISSIONS } from '@/features/rbac/constants';
import {
  VEHICLE_GROUPS,
  VEHICLE_STATUSES,
  VEHICLE_STATUS_VALUES,
  getVehicleStatus,
  getVehicleGroup,
  getFuelType,
  formatMileage,
} from '@/features/vehicles/constants';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/features/vehicles/constants';
import { ROUTES, clientVehicleDetailPath } from '@/routes/route.constants';
import { useClientData } from '../hooks/useClientData';
import { useClientVehicles } from '../hooks/useClientVehicles';
import { getNextVehicleStatuses } from '../services/clientVehicleService';
import ClientVehicleFormModal from '../components/ClientFleet/ClientVehicleFormModal';
import FleetVehicleImage from '../components/ClientFleet/FleetVehicleImage';
import '../components/ClientFleet/ClientFleet.css';

const STATUS_FILTER_OPTIONS = VEHICLE_STATUS_VALUES.map((status) => ({
  value: status,
  label: VEHICLE_STATUSES[status].label,
}));

const GROUP_FILTER_OPTIONS = Object.keys(VEHICLE_GROUPS).map((group) => ({
  value: group,
  label: `Groupe ${group} · ${VEHICLE_GROUPS[group].label}`,
}));

const FUEL_FILTER_OPTIONS = ['diesel', 'essence', 'hybride', 'electrique'].map((fuel) => ({
  value: fuel,
  label: getFuelType(fuel).label,
}));

const SORTABLE_KEYS = {
  brand: (vehicle) => vehicle.brand?.toLowerCase() ?? '',
  registrationNumber: (vehicle) => vehicle.registrationNumber?.toLowerCase() ?? '',
  mileage: (vehicle) => Number(vehicle.mileage) || 0,
  year: (vehicle) => Number(vehicle.year) || 0,
};

const ClientVehiclesPage = () => {
  const navigate = useNavigate();
  const { currentClient, isEnterprise } = useClientData();
  const { vehicles, isLoading, error, refetch, createVehicle, updateVehicle, updateVehicleStatus, deleteVehicle } =
    useClientVehicles();
  const can = useCan();

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', group: '', fuel: '' });
  const [sort, setSort] = useState({ by: 'brand', direction: 'asc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [formOpen, setFormOpen] = useState(false);
  const [formTarget, setFormTarget] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [statusTarget, setStatusTarget] = useState(null);
  const [nextStatus, setNextStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusError, setStatusError] = useState('');

  const hasActiveFilters = Boolean(search.trim() || filters.status || filters.group || filters.fuel);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return vehicles.filter((vehicle) => {
      if (filters.status && vehicle.status !== filters.status) return false;
      if (filters.group && vehicle.group !== filters.group) return false;
      if (filters.fuel && vehicle.fuelType !== filters.fuel) return false;
      if (!query) return true;
      const haystack = [
        vehicle.registrationNumber,
        vehicle.brand,
        vehicle.model,
        vehicle.version,
        vehicle.agency,
        vehicle.location,
        vehicle.currentDriver,
        vehicle.vin,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [vehicles, search, filters]);

  const sorted = useMemo(() => {
    const accessor = SORTABLE_KEYS[sort.by] || SORTABLE_KEYS.brand;
    const direction = sort.direction === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const left = accessor(a);
      const right = accessor(b);
      if (left < right) return -1 * direction;
      if (left > right) return 1 * direction;
      return 0;
    });
  }, [filtered, sort]);

  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pageItems = sorted.slice((page - 1) * pageSize, page * pageSize);

  const counts = useMemo(
    () =>
      vehicles.reduce(
        (acc, vehicle) => {
          acc.total += 1;
          acc[vehicle.status] = (acc[vehicle.status] ?? 0) + 1;
          return acc;
        },
        { total: 0, in_use: 0, available: 0, maintenance: 0, out_of_service: 0 },
      ),
    [vehicles],
  );

  const availabilityRate = counts.total ? Math.round(((counts.available + counts.in_use) / counts.total) * 100) : 0;

  const handleSortChange = (by, direction) => {
    setSort({ by, direction });
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilters({ status: '', group: '', fuel: '' });
  };

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

  const openStatusChange = (vehicle) => {
    setStatusTarget(vehicle);
    setNextStatus('');
    setStatusError('');
  };

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

  const handleStatusChange = async () => {
    if (!statusTarget || !nextStatus) return;
    setIsUpdating(true);
    setStatusError('');
    try {
      await updateVehicleStatus(statusTarget.id, nextStatus);
      toast.success('Statut du véhicule mis à jour.');
      setStatusTarget(null);
      setNextStatus('');
      refetch();
    } catch (err) {
      setStatusError(err?.message || 'Changement de statut refusé.');
    } finally {
      setIsUpdating(false);
    }
  };

  const statusOptions = statusTarget ? getNextVehicleStatuses(statusTarget.status) : [];

  const columns = [
    {
      key: 'vehicle',
      label: 'Véhicule',
      render: (vehicle) => (
        <button
          type="button"
          className="navix-fleet-vehbtn"
          onClick={() => navigate(clientVehicleDetailPath(vehicle.id))}
          title={`Voir ${vehicle.brand} ${vehicle.model}`}
        >
          <FleetVehicleImage vehicle={vehicle} size="sm" />
          <span className="text-start">
            <span className="fw-semibold d-block">{vehicle.brand} {vehicle.model}</span>
            <small className="text-secondary">{vehicle.category}{vehicle.year ? ` · ${vehicle.year}` : ''}</small>
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
      key: 'group',
      label: 'Groupe',
      render: (vehicle) => {
        const group = getVehicleGroup(vehicle.group);
        return (
          <span className="badge bg-secondary-subtle text-body" title={group.label}>
            <i className={`bi ${group.icon} me-1`} aria-hidden="true" />
            Groupe {vehicle.group}
          </span>
        );
      },
    },
    {
      key: 'location',
      label: 'Localisation',
      render: (vehicle) => (
        <span>
          <i className="bi bi-geo-alt me-1 text-danger" aria-hidden="true" />
          {vehicle.location || '—'}
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
      key: 'nextServiceKm',
      label: 'Prochaine maintenance',
      render: (vehicle) => {
        const nextKm = Number(vehicle.nextServiceKm) || 0;
        if (nextKm <= 0) return <span className="text-secondary">—</span>;
        const soon = nextKm <= 1500;
        return (
          <span className={`tabular-nums ${soon ? 'text-warning fw-semibold' : ''}`}>
            {formatMileage(nextKm)}
            {soon && (
              <span className="badge bg-warning-subtle text-warning ms-1">bientôt</span>
            )}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Statut',
      render: (vehicle) => {
        const status = getVehicleStatus(vehicle.status);
        return <StatusBadge variant={status.variant} label={status.label} icon={status.icon} />;
      },
    },
  ];

  if (isLoading && vehicles.length === 0) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={4} label="Chargement de votre flotte…" />
      </PageContainer>
    );
  }

  if (error && vehicles.length === 0) {
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
        <title>Ma flotte — Navix Client</title>
      </Helmet>

      <PageHeader
        title="Ma flotte"
        subtitle={
          isEnterprise
            ? `Gérez les véhicules sous contrat de ${currentClient?.companyName || 'votre entreprise'}.`
            : 'Les véhicules sous contrat ne sont pas disponibles pour un client particulier.'
        }
        icon="bi-truck"
        breadcrumbs={[{ label: 'Espace Client', to: ROUTES.CLIENT_DASHBOARD }, { label: 'Ma flotte' }]}
        actions={
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Can permission={PERMISSIONS.CLIENT_VEHICLES_CREATE}>
              <Button variant="primary" size="sm" icon="bi-plus-circle" onClick={openCreate}>
                Ajouter un véhicule
              </Button>
            </Can>
            <Link to={ROUTES.CLIENT_REQUESTS} className="btn btn-sm btn-outline-secondary">
              <i className="bi bi-plus-square me-1" aria-hidden="true" />
              Demander un véhicule supplémentaire
            </Link>
            <Button variant="ghost" size="sm" icon="bi-arrow-clockwise" onClick={refetch} aria-label="Actualiser">
              <span className="visually-hidden">Actualiser</span>
            </Button>
          </div>
        }
      />

      {!isEnterprise ? (
        <EmptyState
          icon="bi-person"
          title="Aucun véhicule sous contrat"
          description="En tant que client particulier, la gestion de flotte n’est pas disponible. Basculez en profil Entreprise pour accéder à votre flotte."
        />
      ) : (
        <>
          <div className="navix-fleet-identity mb-4">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div className="navix-fleet-identity__logo" aria-hidden="true">
                <i className="bi bi-buildings" />
              </div>
              <div className="flex-grow-1 min-w-0">
                <h5 className="mb-0 fw-bold text-body-emphasis">{currentClient?.companyName || 'Transports Express Cameroun'}</h5>
                <span className="text-body-secondary small">
                  Flotte sous contrat · {currentClient?.contactName ? `Contact : ${currentClient.contactName}` : 'Espace Cameroun'}
                </span>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <span className="badge bg-body-secondary px-3 py-2" title="Espace Cameroun">
                  🇨🇲 Cameroun
                </span>
                <span className="badge bg-primary-subtle text-primary px-3 py-2">
                  <i className="bi bi-truck me-1" aria-hidden="true" />
                  {counts.total} véhicules
                </span>
                <span className="badge bg-success-subtle text-success px-3 py-2">
                  <i className="bi bi-shield-check me-1" aria-hidden="true" />
                  Flotte sous contrat
                </span>
              </div>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-6 col-lg-2">
              <MetricCard label="Véhicules" value={counts.total} icon="bi-truck" variant="primary" />
            </div>
            <div className="col-6 col-lg-2">
              <MetricCard label="En mission" value={counts.in_use} icon="bi-play-circle" variant="info" />
            </div>
            <div className="col-6 col-lg-2">
              <MetricCard label="Disponibles" value={counts.available} icon="bi-check-circle" variant="success" />
            </div>
            <div className="col-6 col-lg-2">
              <MetricCard label="En maintenance" value={counts.maintenance} icon="bi-wrench-adjustable" variant="warning" />
            </div>
            <div className="col-6 col-lg-2">
              <MetricCard label="Hors service" value={counts.out_of_service} icon="bi-slash-circle" variant="danger" />
            </div>
            <div className="col-6 col-lg-2">
              <MetricCard label="Taux de disponibilité" value={`${availabilityRate} %`} icon="bi-graph-up-arrow" variant="dark" />
            </div>
          </div>

          <DataTable
            className="navix-fleet-table"
            columns={columns}
            rows={pageItems}
            sort={sort}
            onSortChange={handleSortChange}
            ariaLabel="Liste de ma flotte"
            empty={
              <EmptyState
                compact
                icon="bi-truck"
                title={hasActiveFilters ? 'Aucun véhicule ne correspond' : 'Aucun véhicule dans la flotte'}
                description={
                  hasActiveFilters
                    ? 'Modifiez vos critères de recherche ou réinitialisez les filtres.'
                    : 'Ajoutez votre premier véhicule pour commencer à gérer votre flotte.'
                }
              />
            }
            header={
              <div className="navix-fleet-toolbar">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Rechercher (immatriculation, marque, chauffeur…)"
                  resultCount={totalItems}
                  aria-label="Rechercher dans ma flotte"
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
                      key: 'group',
                      type: 'select',
                      label: 'Groupe',
                      options: GROUP_FILTER_OPTIONS,
                      allLabel: 'Tous les groupes',
                    },
                    {
                      key: 'fuel',
                      type: 'select',
                      label: 'Carburant',
                      options: FUEL_FILTER_OPTIONS,
                      allLabel: 'Tous les carburants',
                    },
                  ]}
                  values={filters}
                  onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
                  onReset={handleResetFilters}
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
                pageSizeOptions={PAGE_SIZE_OPTIONS}
              />
            }
            actions={[
              {
                key: 'view',
                label: (vehicle) => `Voir ${vehicle.registrationNumber}`,
                title: 'Voir le détail',
                icon: 'bi-eye',
                onClick: (vehicle) => navigate(clientVehicleDetailPath(vehicle.id)),
              },
              {
                key: 'status',
                label: (vehicle) => `Changer le statut de ${vehicle.registrationNumber}`,
                title: 'Changer le statut',
                icon: 'bi-arrow-repeat',
                show: () => can(PERMISSIONS.CLIENT_VEHICLES_UPDATE),
                onClick: (vehicle) => openStatusChange(vehicle),
              },
              {
                key: 'edit',
                label: (vehicle) => `Modifier ${vehicle.registrationNumber}`,
                title: 'Modifier',
                icon: 'bi-pencil',
                show: () => can(PERMISSIONS.CLIENT_VEHICLES_UPDATE),
                onClick: (vehicle) => openEdit(vehicle),
              },
              {
                key: 'delete',
                label: (vehicle) => `Supprimer ${vehicle.registrationNumber}`,
                title: 'Supprimer',
                icon: 'bi-trash3',
                danger: true,
                show: () => can(PERMISSIONS.CLIENT_VEHICLES_DELETE),
                onClick: (vehicle) => openDelete(vehicle),
              },
            ]}
          />

          <ClientVehicleFormModal
            key={`${formTarget?.id ?? 'create'}-${formOpen}`}
            open={formOpen}
            onClose={() => setFormOpen(false)}
            vehicle={formTarget}
            vehicles={vehicles}
            onSubmit={handleFormSubmit}
            loading={isSaving}
            error={formError}
          />

          <DeleteModal
            open={Boolean(deleteTarget)}
            onClose={() => setDeleteTarget(null)}
            entityName={deleteTarget ? `${deleteTarget.brand} ${deleteTarget.model} (${deleteTarget.registrationNumber})` : undefined}
            title="Supprimer ce véhicule"
            loading={isDeleting}
            error={deleteError}
            onConfirm={handleDelete}
          />

          <ConfirmDialog
            open={Boolean(statusTarget)}
            onClose={() => setStatusTarget(null)}
            title="Changer le statut"
            icon="bi-arrow-repeat"
            confirmLabel="Appliquer"
            confirmVariant="primary"
            loading={isUpdating}
            error={statusError}
            onConfirm={handleStatusChange}
            message={
              statusTarget ? (
                <>
                  <p className="mb-3">
                    Statut actuel :{' '}
                    <StatusBadge
                      variant={getVehicleStatus(statusTarget.status).variant}
                      label={getVehicleStatus(statusTarget.status).label}
                    />
                  </p>
                  {statusOptions.length === 0 ? (
                    <p className="text-secondary small mb-0">Aucune transition de statut autorisée depuis cet état.</p>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {statusOptions.map((status) => {
                        const meta = getVehicleStatus(status);
                        return (
                          <label key={status} className="navix-fleet-status-option">
                            <input
                              type="radio"
                              name="next-status"
                              value={status}
                              checked={nextStatus === status}
                              onChange={() => setNextStatus(status)}
                            />
                            <StatusBadge variant={meta.variant} label={meta.label} icon={meta.icon} />
                          </label>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : null
            }
          />
        </>
      )}
    </PageContainer>
  );
};

export default ClientVehiclesPage;
