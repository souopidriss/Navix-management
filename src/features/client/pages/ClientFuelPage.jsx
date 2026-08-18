import { useState, useEffect, useMemo, useCallback } from 'react';
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
  FUEL_TYPES,
  FUEL_TYPE_VALUES,
  FUEL_STATUSES,
  FUEL_STATUS_VALUES,
  getFuelType,
  getFuelStatus,
  formatFuelDate,
  formatFuelMoney,
  formatFuelQuantity,
} from '@/features/fuel/constants';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/features/fuel/constants';
import { ROUTES } from '@/routes/route.constants';
import { useClientData } from '../hooks/useClientData';
import { useClientVehicles } from '../hooks/useClientVehicles';
import { useClientDrivers } from '../hooks/useClientDrivers';
import { useClientFuel } from '../hooks/useClientFuel';
import { clientFuelService } from '../services/clientFuelService';
import ClientFuelFormModal from '../components/ClientFuel/ClientFuelFormModal';
import ClientFuelConsumptionChart from '../components/ClientFuel/ClientFuelConsumptionChart';
import '../components/ClientMaintenance/ClientMaintenance.css';

const STATUS_FILTER_OPTIONS = FUEL_STATUS_VALUES.map((status) => ({
  value: status,
  label: FUEL_STATUSES[status].label,
}));

const TYPE_FILTER_OPTIONS = FUEL_TYPE_VALUES.map((type) => ({
  value: type,
  label: FUEL_TYPES[type].label,
}));

const SORTABLE_KEYS = {
  fuelNumber: (f) => f.fuelNumber?.toLowerCase() ?? '',
  fuelDate: (f) => f.fuelDate ?? '',
  quantity: (f) => Number(f.quantity) || 0,
  totalCost: (f) => Number(f.totalCost) || 0,
  mileage: (f) => Number(f.mileage) || 0,
};

const ClientFuelPage = () => {
  const { currentClient, isEnterprise } = useClientData();
  const { vehicles } = useClientVehicles();
  const { drivers } = useClientDrivers();
  const {
    fuel,
    isLoading,
    error,
    refetch,
    createFuel,
    validateFuel,
    cancelFuel,
    deleteFuel,
  } = useClientFuel();
  const can = useCan();

  const [stats, setStats] = useState(null);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', type: '' });
  const [sort, setSort] = useState({ by: 'fuelDate', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [formOpen, setFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadStats = useCallback(async () => {
    try {
      const result = await clientFuelService.statistics();
      setStats(result);
    } catch {
      setStats(null);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const hasActiveFilters = Boolean(search.trim() || filters.status || filters.type);

  const vehicleById = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles]);
  const driverById = useMemo(() => new Map(drivers.map((d) => [d.id, d])), [drivers]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return fuel.filter((item) => {
      if (filters.status && item.status !== filters.status) return false;
      if (filters.type && item.fuelType !== filters.type) return false;
      if (!query) return true;
      const vehicle = vehicleById.get(item.vehicleId);
      const driver = driverById.get(item.driverId);
      const haystack = [
        item.fuelNumber,
        item.stationName,
        item.stationCity,
        vehicle?.registrationNumber,
        vehicle?.brand,
        driver?.fullName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [fuel, search, filters, vehicleById, driverById]);

  const sorted = useMemo(() => {
    const accessor = SORTABLE_KEYS[sort.by] || SORTABLE_KEYS.fuelDate;
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

  const totalQuantity = useMemo(
    () => fuel.filter((item) => item.status === 'validated').reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [fuel],
  );

  const totalCost = useMemo(
    () => fuel.filter((item) => item.status === 'validated').reduce((sum, item) => sum + Number(item.totalCost || 0), 0),
    [fuel],
  );

  const handleSortChange = (by, direction) => {
    setSort({ by, direction });
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilters({ status: '', type: '' });
  };

  const openCreate = () => {
    setFormError('');
    setFormOpen(true);
  };

  const handleValidate = async (item) => {
    try {
      await validateFuel(item.id);
      toast.success('Plein validé.');
      refetch();
      loadStats();
    } catch (err) {
      toast.error(err?.message || 'Impossible de valider le plein.');
    }
  };

  const openCancel = (item) => {
    setCancelTarget(item);
    setCancelReason('');
    setCancelError('');
  };

  const openDelete = (item) => {
    setDeleteTarget(item);
    setDeleteError('');
  };

  const handleFormSubmit = async (payload) => {
    setIsSaving(true);
    setFormError('');
    try {
      await createFuel(payload);
      toast.success('Plein enregistré.');
      setFormOpen(false);
      refetch();
      loadStats();
    } catch (err) {
      setFormError(err?.message || 'Impossible d’enregistrer le plein.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    setCancelError('');
    try {
      await cancelFuel(cancelTarget.id, { reason: cancelReason });
      toast.success('Plein annulé.');
      setCancelTarget(null);
      setCancelReason('');
      refetch();
      loadStats();
    } catch (err) {
      setCancelError(err?.message || 'Impossible d’annuler le plein.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteFuel(deleteTarget.id);
      toast.success('Plein supprimé.');
      setDeleteTarget(null);
      refetch();
      loadStats();
    } catch (err) {
      setDeleteError(err?.message || 'Impossible de supprimer le plein.');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: 'fuelNumber',
      label: 'Plein',
      sortable: true,
      render: (item) => (
        <span className="text-start">
          <span className="fw-semibold font-monospace d-block">{item.fuelNumber}</span>
          <small className="text-secondary d-block">{getFuelType(item.fuelType).label}</small>
        </span>
      ),
    },
    {
      key: 'vehicle',
      label: 'Véhicule',
      render: (item) => {
        const vehicle = vehicleById.get(item.vehicleId);
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
      render: (item) => {
        const driver = driverById.get(item.driverId);
        return driver ? <span className="small">{driver.fullName}</span> : <span className="text-secondary">—</span>;
      },
    },
    {
      key: 'station',
      label: 'Station',
      render: (item) => (
        <span className="small">
          <span className="d-block">{item.stationName || '—'}</span>
          <small className="text-secondary">{item.stationCity || ''}</small>
        </span>
      ),
    },
    {
      key: 'fuelDate',
      label: 'Date',
      sortable: true,
      render: (item) => formatFuelDate(item.fuelDate),
    },
    {
      key: 'quantity',
      label: 'Quantité',
      align: 'end',
      sortable: true,
      render: (item) => <span className="tabular-nums">{formatFuelQuantity(item.quantity)}</span>,
    },
    {
      key: 'totalCost',
      label: 'Coût',
      align: 'end',
      sortable: true,
      render: (item) => <span className="tabular-nums">{formatFuelMoney(item.totalCost)}</span>,
    },
    {
      key: 'status',
      label: 'Statut',
      render: (item) => {
        const status = getFuelStatus(item.status);
        return <StatusBadge variant={status.variant} label={status.label} icon={status.icon} />;
      },
    },
  ];

  if (isLoading && fuel.length === 0) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={4} label="Chargement de vos pleins…" />
      </PageContainer>
    );
  }

  if (error && fuel.length === 0) {
    return (
      <PageContainer>
        <ErrorState
          title="Impossible de charger vos pleins"
          description="Les données sont temporairement indisponibles."
          retry={refetch}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Helmet>
        <title>Carburant — Navix Client</title>
      </Helmet>

      <PageHeader
        title="Carburant"
        subtitle={
          isEnterprise
            ? `Suivi des pleins de carburant de la flotte de ${currentClient?.companyName || 'votre entreprise'} au Cameroun 🇨🇲.`
            : 'Le suivi du carburant n’est pas disponible pour un client particulier.'
        }
        icon="bi-fuel-pump"
        breadcrumbs={[{ label: 'Espace Client', to: ROUTES.CLIENT_DASHBOARD }, { label: 'Carburant' }]}
        actions={
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Can permission={PERMISSIONS.CLIENT_FUEL_CREATE}>
              <Button variant="primary" size="sm" icon="bi-plus-circle" onClick={openCreate}>
                Enregistrer un plein
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
          icon="bi-fuel-pump"
          title="Carburant indisponible"
          description="En tant que client particulier, le suivi du carburant n’est pas disponible. Basculez en profil Entreprise pour accéder à vos pleins."
        />
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-6 col-lg-2">
              <MetricCard label="Pleins" value={stats?.totalCount ?? fuel.length} icon="bi-fuel-pump" variant="primary" />
            </div>
            <div className="col-6 col-lg-2">
              <MetricCard label="Validés" value={stats?.validatedCount ?? 0} icon="bi-check2-circle" variant="success" />
            </div>
            <div className="col-6 col-lg-2">
              <MetricCard label="En attente" value={stats?.pendingCount ?? 0} icon="bi-hourglass-split" variant="warning" />
            </div>
            <div className="col-6 col-lg-2">
              <MetricCard
                label="Volume total"
                value={`${Math.round(totalQuantity).toLocaleString('fr-FR')} L`}
                icon="bi-droplet-half"
                variant="info"
              />
            </div>
            <div className="col-6 col-lg-2">
              <MetricCard
                label="Consommations anormales"
                value={stats?.abnormalCount ?? 0}
                icon="bi-graph-up-arrow"
                variant="danger"
              />
            </div>
            <div className="col-6 col-lg-2">
              <MetricCard label="Coût total" value={formatFuelMoney(totalCost)} icon="bi-cash-stack" variant="dark" />
            </div>
          </div>

          {stats?.monthlyEvolution?.length > 0 && (
            <div className="card mb-4">
              <div className="card-body">
                <h2 className="h6 fw-semibold mb-3">
                  <i className="bi bi-bar-chart-line me-2" aria-hidden="true" />
                  Évolution mensuelle du carburant
                </h2>
                <ClientFuelConsumptionChart
                  data={stats.monthlyEvolution}
                  metric="totalCost"
                  formatValue={(value) => formatFuelMoney(Number(value))}
                  title="Évolution mensuelle du coût de carburant sur 6 mois"
                />
              </div>
            </div>
          )}

          <DataTable
            className="navix-client-fuel-table"
            columns={columns}
            rows={pageItems}
            sort={sort}
            onSortChange={handleSortChange}
            ariaLabel="Liste de mes pleins de carburant"
            empty={
              <EmptyState
                compact
                icon="bi-fuel-pump"
                title={hasActiveFilters ? 'Aucun plein ne correspond' : 'Aucun plein'}
                description={
                  hasActiveFilters
                    ? 'Modifiez vos critères de recherche ou réinitialisez les filtres.'
                    : 'Enregistrez votre premier plein pour suivre votre consommation.'
                }
              />
            }
            header={
              <div className="navix-ops-toolbar">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Rechercher (numéro, véhicule, station…)"
                  resultCount={totalItems}
                  aria-label="Rechercher parmi mes pleins"
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
                key: 'validate',
                label: (item) => `Valider ${item.fuelNumber}`,
                title: 'Valider le plein',
                icon: 'bi-check2-circle',
                show: (item) => item.status === 'pending' && can(PERMISSIONS.CLIENT_FUEL_UPDATE),
                onClick: (item) => handleValidate(item),
              },
              {
                key: 'cancel',
                label: (item) => `Annuler ${item.fuelNumber}`,
                title: 'Annuler le plein',
                icon: 'bi-x-octagon',
                danger: true,
                show: (item) => item.status === 'pending' && can(PERMISSIONS.CLIENT_FUEL_UPDATE),
                onClick: (item) => openCancel(item),
              },
              {
                key: 'delete',
                label: (item) => `Supprimer ${item.fuelNumber}`,
                title: 'Supprimer',
                icon: 'bi-trash3',
                danger: true,
                show: () => can(PERMISSIONS.CLIENT_FUEL_DELETE),
                onClick: (item) => openDelete(item),
              },
            ]}
          />

          <ClientFuelFormModal
            key={`create-${formOpen}`}
            open={formOpen}
            onClose={() => setFormOpen(false)}
            vehicles={vehicles}
            drivers={drivers}
            onSubmit={handleFormSubmit}
            loading={isSaving}
            error={formError}
          />

          <ConfirmDialog
            open={Boolean(cancelTarget)}
            onClose={() => setCancelTarget(null)}
            title="Annuler ce plein"
            icon="bi-x-octagon"
            confirmLabel="Annuler le plein"
            confirmVariant="danger"
            loading={isCancelling}
            error={cancelError}
            onConfirm={handleCancel}
            message={
              cancelTarget ? (
                <>
                  <p className="mb-3">
                    Vous êtes sur le point d’annuler le plein{' '}
                    <strong className="font-monospace">{cancelTarget.fuelNumber}</strong> de{' '}
                    {vehicleById.get(cancelTarget.vehicleId)?.registrationNumber || cancelTarget.vehicleId}.
                  </p>
                  <div>
                    <label className="form-label" htmlFor="client-fuel-cancel-reason">
                      Motif d’annulation
                    </label>
                    <textarea
                      id="client-fuel-cancel-reason"
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
            entityName={deleteTarget ? deleteTarget.fuelNumber : undefined}
            title="Supprimer ce plein"
            loading={isDeleting}
            error={deleteError}
            onConfirm={handleDelete}
          />
        </>
      )}
    </PageContainer>
  );
};

export default ClientFuelPage;
