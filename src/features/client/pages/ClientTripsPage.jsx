import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  TRIP_TYPES,
  TRIP_TYPE_VALUES,
  TRIP_STATUSES,
  TRIP_STATUS_VALUES,
  getTripStatus,
  formatTripDate,
  formatTripDistance,
} from '@/features/trips/constants';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/features/trips/constants';
import { ROUTES, clientTripDetailPath } from '@/routes/route.constants';
import { useClientData } from '../hooks/useClientData';
import { useClientVehicles } from '../hooks/useClientVehicles';
import { useClientDrivers } from '../hooks/useClientDrivers';
import { useClientAssignments } from '../hooks/useClientAssignments';
import { useClientTrips } from '../hooks/useClientTrips';
import { getNextTripStatuses } from '../services/clientOperationsData';
import ClientTripFormModal from '../components/ClientOperations/ClientTripFormModal';
import ClientTripFinishModal from '../components/ClientOperations/ClientTripFinishModal';
import '../components/ClientOperations/ClientOperations.css';

const STATUS_FILTER_OPTIONS = TRIP_STATUS_VALUES.map((status) => ({
  value: status,
  label: TRIP_STATUSES[status].label,
}));

const TYPE_FILTER_OPTIONS = TRIP_TYPE_VALUES.map((type) => ({
  value: type,
  label: TRIP_TYPES[type].label,
}));

const SORTABLE_KEYS = {
  tripNumber: (t) => t.tripNumber?.toLowerCase() ?? '',
  departureDate: (t) => t.departureDate ?? '',
  departureLocation: (t) => t.departureLocation?.toLowerCase() ?? '',
  arrivalLocation: (t) => t.arrivalLocation?.toLowerCase() ?? '',
  plannedDistance: (t) => Number(t.plannedDistance) || 0,
};

const ClientTripsPage = () => {
  const navigate = useNavigate();
  const { currentClient, isEnterprise } = useClientData();
  const { vehicles } = useClientVehicles();
  const { drivers } = useClientDrivers();
  const { assignments } = useClientAssignments();
  const {
    trips,
    isLoading,
    error,
    refetch,
    createTrip,
    updateTrip,
    startTrip,
    finishTrip,
    cancelTrip,
    deleteTrip,
  } = useClientTrips();
  const can = useCan();

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', type: '' });
  const [sort, setSort] = useState({ by: 'departureDate', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [formOpen, setFormOpen] = useState(false);
  const [formTarget, setFormTarget] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [finishTarget, setFinishTarget] = useState(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishError, setFinishError] = useState('');

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const hasActiveFilters = Boolean(search.trim() || filters.status || filters.type);

  const vehicleById = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles]);
  const driverById = useMemo(() => new Map(drivers.map((d) => [d.id, d])), [drivers]);

  const activeAssignments = useMemo(() => assignments.filter((a) => a.status === 'active'), [assignments]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return trips.filter((trip) => {
      if (filters.status && trip.status !== filters.status) return false;
      if (filters.type && trip.tripType !== filters.type) return false;
      if (!query) return true;
      const vehicle = vehicleById.get(trip.vehicleId);
      const driver = driverById.get(trip.driverId);
      const haystack = [
        trip.tripNumber,
        trip.departureLocation,
        trip.arrivalLocation,
        trip.purpose,
        vehicle?.registrationNumber,
        driver?.fullName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [trips, search, filters, vehicleById, driverById]);

  const sorted = useMemo(() => {
    const accessor = SORTABLE_KEYS[sort.by] || SORTABLE_KEYS.departureDate;
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
      trips.reduce(
        (acc, trip) => {
          acc.total += 1;
          acc[trip.status] = (acc[trip.status] ?? 0) + 1;
          return acc;
        },
        { total: 0, planned: 0, in_progress: 0, completed: 0, cancelled: 0, suspended: 0 },
      ),
    [trips],
  );

  const totalDistance = useMemo(
    () => trips.reduce((sum, trip) => sum + (Number(trip.actualDistance) || Number(trip.plannedDistance) || 0), 0),
    [trips],
  );

  const handleSortChange = (by, direction) => {
    setSort({ by, direction });
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilters({ status: '', type: '' });
  };

  const openCreate = () => {
    setFormTarget(null);
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (trip) => {
    setFormTarget(trip);
    setFormError('');
    setFormOpen(true);
  };

  const openFinish = (trip) => {
    setFinishTarget(trip);
    setFinishError('');
  };

  const openCancel = (trip) => {
    setCancelTarget(trip);
    setCancelReason('');
    setCancelError('');
  };

  const openDelete = (trip) => {
    setDeleteTarget(trip);
    setDeleteError('');
  };

  const handleFormSubmit = async (payload) => {
    setIsSaving(true);
    setFormError('');
    try {
      if (formTarget) {
        await updateTrip(formTarget.id, payload);
        toast.success('Trajet mis à jour.');
      } else {
        await createTrip(payload);
        toast.success('Trajet planifié.');
      }
      setFormOpen(false);
      refetch();
    } catch (err) {
      setFormError(err?.message || 'Impossible d’enregistrer le trajet.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStart = async (trip) => {
    try {
      await startTrip(trip.id, { departureMileage: trip.departureMileage });
      toast.success('Trajet démarré. Chauffeur et véhicule en service.');
      refetch();
    } catch (err) {
      toast.error(err?.message || 'Impossible de démarrer le trajet.');
    }
  };

  const handleFinish = async (payload) => {
    if (!finishTarget) return;
    setIsFinishing(true);
    setFinishError('');
    try {
      await finishTrip(finishTarget.id, payload);
      toast.success('Trajet terminé. Véhicule et chauffeur libérés.');
      setFinishTarget(null);
      refetch();
    } catch (err) {
      setFinishError(err?.message || 'Impossible de terminer le trajet.');
    } finally {
      setIsFinishing(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    setCancelError('');
    try {
      await cancelTrip(cancelTarget.id, { reason: cancelReason });
      toast.success('Trajet annulé.');
      setCancelTarget(null);
      setCancelReason('');
      refetch();
    } catch (err) {
      setCancelError(err?.message || 'Impossible d’annuler le trajet.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteTrip(deleteTarget.id);
      toast.success('Trajet supprimé.');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      setDeleteError(err?.message || 'Impossible de supprimer le trajet.');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: 'trip',
      label: 'Trajet',
      sortable: true,
      sortAccessor: (t) => t.tripNumber?.toLowerCase() ?? '',
      render: (trip) => (
        <button
          type="button"
          className="navix-fleet-vehbtn"
          onClick={() => navigate(clientTripDetailPath(trip.id))}
          title={`Voir ${trip.tripNumber}`}
        >
          <span className="text-start">
            <span className="fw-semibold font-monospace d-block">{trip.tripNumber}</span>
            <small className="text-secondary d-block">{trip.purpose || '—'}</small>
          </span>
        </button>
      ),
    },
    {
      key: 'route',
      label: 'Itinéraire',
      render: (trip) => (
        <span className="navix-ops-route">
          <span className="navix-ops-route__stop">{trip.departureLocation || '—'}</span>
          <i className="bi bi-arrow-right navix-ops-route__arrow" aria-hidden="true" />
          <span className="navix-ops-route__stop">{trip.arrivalLocation || '—'}</span>
        </span>
      ),
    },
    {
      key: 'vehicle',
      label: 'Véhicule',
      render: (trip) => {
        const vehicle = vehicleById.get(trip.vehicleId);
        return vehicle ? (
          <span className="small">
            <span className="d-block">{vehicle.brand} {vehicle.model}</span>
            <small className="text-secondary font-monospace">{vehicle.registrationNumber}</small>
          </span>
        ) : (
          <span className="text-secondary">—</span>
        );
      },
    },
    {
      key: 'driver',
      label: 'Chauffeur',
      render: (trip) => {
        const driver = driverById.get(trip.driverId);
        return driver ? (
          <span className="small d-block">{driver.fullName}</span>
        ) : (
          <span className="text-secondary">—</span>
        );
      },
    },
    {
      key: 'departureDate',
      label: 'Départ',
      sortable: true,
      render: (trip) => formatTripDate(trip.departureDate),
    },
    {
      key: 'distance',
      label: 'Distance',
      align: 'end',
      sortable: true,
      sortAccessor: (t) => Number(t.plannedDistance) || 0,
      render: (trip) => (
        <span className="tabular-nums">
          {formatTripDistance(Number(trip.actualDistance) || Number(trip.plannedDistance) || 0)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (trip) => {
        const status = getTripStatus(trip.status);
        return <StatusBadge variant={status.variant} label={status.label} icon={status.icon} />;
      },
    },
  ];

  if (isLoading && trips.length === 0) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={4} label="Chargement de vos trajets…" />
      </PageContainer>
    );
  }

  if (error && trips.length === 0) {
    return (
      <PageContainer>
        <ErrorState
          title="Impossible de charger vos trajets"
          description="Les données sont temporairement indisponibles."
          retry={refetch}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Helmet>
        <title>Mes trajets — Navix Client</title>
      </Helmet>

      <PageHeader
        title="Mes trajets"
        subtitle={
          isEnterprise
            ? `Suivi des déplacements de ${currentClient?.companyName || 'votre entreprise'} au Cameroun 🇨🇲.`
            : 'Les trajets sous contrat ne sont pas disponibles pour un client particulier.'
        }
        icon="bi-signpost-split"
        breadcrumbs={[{ label: 'Espace Client', to: ROUTES.CLIENT_DASHBOARD }, { label: 'Mes trajets' }]}
        actions={
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Can permission={PERMISSIONS.CLIENT_TRIPS_CREATE}>
              <Button variant="primary" size="sm" icon="bi-plus-circle" onClick={openCreate}>
                Planifier un trajet
              </Button>
            </Can>
            <Button variant="ghost" size="sm" icon="bi-arrow-clockwise" onClick={refetch} aria-label="Actualiser">
              <span className="visually-hidden">Actualiser</span>
            </Button>
          </div>
        }
      />

      {!isEnterprise ? (
        <EmptyState
          icon="bi-signpost-split"
          title="Aucun trajet sous contrat"
          description="En tant que client particulier, le suivi des trajets n’est pas disponible. Basculez en profil Entreprise pour accéder à vos trajets."
        />
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-6 col-lg-2">
              <MetricCard label="Trajets" value={counts.total} icon="bi-signpost-split" variant="primary" />
            </div>
            <div className="col-6 col-lg-2">
              <MetricCard label="Planifiés" value={counts.planned} icon="bi-calendar-check" variant="info" />
            </div>
            <div className="col-6 col-lg-2">
              <MetricCard label="En cours" value={counts.in_progress} icon="bi-play-circle" variant="success" />
            </div>
            <div className="col-6 col-lg-2">
              <MetricCard label="Terminés" value={counts.completed} icon="bi-flag" variant="dark" />
            </div>
            <div className="col-6 col-lg-2">
              <MetricCard label="Annulés" value={counts.cancelled} icon="bi-x-circle" variant="danger" />
            </div>
            <div className="col-6 col-lg-2">
              <MetricCard label="Km cumulés" value={`${Math.round(totalDistance).toLocaleString('fr-FR')} km`} icon="bi-speedometer" variant="warning" />
            </div>
          </div>

          <DataTable
            className="navix-ops-table"
            columns={columns}
            rows={pageItems}
            sort={sort}
            onSortChange={handleSortChange}
            ariaLabel="Liste de mes trajets"
            empty={
              <EmptyState
                compact
                icon="bi-signpost-split"
                title={hasActiveFilters ? 'Aucun trajet ne correspond' : 'Aucun trajet'}
                description={
                  hasActiveFilters
                    ? 'Modifiez vos critères de recherche ou réinitialisez les filtres.'
                    : 'Planifiez votre premier trajet pour suivre vos déplacements.'
                }
              />
            }
            header={
              <div className="navix-ops-toolbar">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Rechercher (numéro, itinéraire, chauffeur…)"
                  resultCount={totalItems}
                  aria-label="Rechercher parmi mes trajets"
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
                label: (trip) => `Voir ${trip.tripNumber}`,
                title: 'Voir le détail',
                icon: 'bi-eye',
                onClick: (trip) => navigate(clientTripDetailPath(trip.id)),
              },
              {
                key: 'start',
                label: (trip) => `Démarrer ${trip.tripNumber}`,
                title: 'Démarrer le trajet',
                icon: 'bi-play-fill',
                show: (trip) => getNextTripStatuses(trip.status).includes('in_progress') && can(PERMISSIONS.CLIENT_TRIPS_UPDATE),
                onClick: (trip) => handleStart(trip),
              },
              {
                key: 'finish',
                label: (trip) => `Terminer ${trip.tripNumber}`,
                title: 'Terminer le trajet',
                icon: 'bi-flag-fill',
                show: (trip) => getNextTripStatuses(trip.status).includes('completed') && can(PERMISSIONS.CLIENT_TRIPS_UPDATE),
                onClick: (trip) => openFinish(trip),
              },
              {
                key: 'cancel',
                label: (trip) => `Annuler ${trip.tripNumber}`,
                title: 'Annuler le trajet',
                icon: 'bi-x-octagon',
                danger: true,
                show: (trip) => getNextTripStatuses(trip.status).includes('cancelled') && can(PERMISSIONS.CLIENT_TRIPS_UPDATE),
                onClick: (trip) => openCancel(trip),
              },
              {
                key: 'edit',
                label: (trip) => `Modifier ${trip.tripNumber}`,
                title: 'Modifier',
                icon: 'bi-pencil',
                show: (trip) => trip.status !== 'completed' && trip.status !== 'cancelled' && can(PERMISSIONS.CLIENT_TRIPS_UPDATE),
                onClick: (trip) => openEdit(trip),
              },
              {
                key: 'delete',
                label: (trip) => `Supprimer ${trip.tripNumber}`,
                title: 'Supprimer',
                icon: 'bi-trash3',
                danger: true,
                show: () => can(PERMISSIONS.CLIENT_TRIPS_DELETE),
                onClick: (trip) => openDelete(trip),
              },
            ]}
          />

          <ClientTripFormModal
            key={`${formTarget?.id ?? 'create'}-${formOpen}`}
            open={formOpen}
            onClose={() => setFormOpen(false)}
            trip={formTarget}
            assignments={activeAssignments}
            onSubmit={handleFormSubmit}
            loading={isSaving}
            error={formError}
          />

          <ClientTripFinishModal
            open={Boolean(finishTarget)}
            onClose={() => setFinishTarget(null)}
            trip={finishTarget}
            onSubmit={handleFinish}
            loading={isFinishing}
            error={finishError}
          />

          <ConfirmDialog
            open={Boolean(cancelTarget)}
            onClose={() => setCancelTarget(null)}
            title="Annuler ce trajet"
            icon="bi-x-octagon"
            confirmLabel="Annuler le trajet"
            confirmVariant="danger"
            loading={isCancelling}
            error={cancelError}
            onConfirm={handleCancel}
            message={
              cancelTarget ? (
                <>
                  <p className="mb-3">
                    Vous êtes sur le point d’annuler le trajet{' '}
                    <strong className="font-monospace">{cancelTarget.tripNumber}</strong> ({cancelTarget.departureLocation || '—'} →{' '}
                    {cancelTarget.arrivalLocation || '—'}).
                  </p>
                  <div>
                    <label className="form-label" htmlFor="client-trip-cancel-reason">
                      Motif d’annulation
                    </label>
                    <textarea
                      id="client-trip-cancel-reason"
                      className="form-control"
                      rows={3}
                      value={cancelReason}
                      onChange={(event) => setCancelReason(event.target.value)}
                      placeholder="Raison de l’annulation…"
                    />
                  </div>
                </>
              ) : null
            }
          />

          <DeleteModal
            open={Boolean(deleteTarget)}
            onClose={() => setDeleteTarget(null)}
            entityName={deleteTarget ? deleteTarget.tripNumber : undefined}
            title="Supprimer ce trajet"
            loading={isDeleting}
            error={deleteError}
            onConfirm={handleDelete}
          />
        </>
      )}
    </PageContainer>
  );
};

export default ClientTripsPage;
