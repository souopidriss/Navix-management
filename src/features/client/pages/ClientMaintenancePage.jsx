import { useState, useEffect, useMemo } from 'react';
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
  MAINTENANCE_TYPES,
  MAINTENANCE_TYPE_VALUES,
  MAINTENANCE_STATUSES,
  MAINTENANCE_STATUS_VALUES,
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_PRIORITY_VALUES,
  getMaintenanceType,
  getMaintenanceStatus,
  getMaintenancePriority,
  isMaintenanceFinished,
  formatMaintenanceDate,
  formatMaintenanceMoney,
} from '@/features/maintenance/constants';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/features/maintenance/constants';
import { ROUTES } from '@/routes/route.constants';
import { useClientData } from '../hooks/useClientData';
import { useClientVehicles } from '../hooks/useClientVehicles';
import { useClientMaintenance } from '../hooks/useClientMaintenance';
import ClientMaintenanceFormModal from '../components/ClientMaintenance/ClientMaintenanceFormModal';
import ClientMaintenanceFinishModal from '../components/ClientMaintenance/ClientMaintenanceFinishModal';
import ClientMaintenanceDetailModal from '../components/ClientMaintenance/ClientMaintenanceDetailModal';
import '../components/ClientMaintenance/ClientMaintenance.css';

const STATUS_FILTER_OPTIONS = MAINTENANCE_STATUS_VALUES.map((status) => ({
  value: status,
  label: MAINTENANCE_STATUSES[status].label,
}));

const TYPE_FILTER_OPTIONS = MAINTENANCE_TYPE_VALUES.map((type) => ({
  value: type,
  label: MAINTENANCE_TYPES[type].label,
}));

const PRIORITY_FILTER_OPTIONS = MAINTENANCE_PRIORITY_VALUES.map((priority) => ({
  value: priority,
  label: MAINTENANCE_PRIORITIES[priority].label,
}));

const SORTABLE_KEYS = {
  maintenanceNumber: (m) => m.maintenanceNumber?.toLowerCase() ?? '',
  scheduledDate: (m) => m.scheduledDate ?? '',
  priority: (m) => getMaintenancePriority(m.priority)?.order ?? 99,
  actualCost: (m) => Number(m.actualCost) || 0,
  mileage: (m) => Number(m.mileage) || 0,
};

const ClientMaintenancePage = () => {
  const { currentClient, isEnterprise } = useClientData();
  const { vehicles } = useClientVehicles();
  const {
    maintenance,
    isLoading,
    error,
    refetch,
    createMaintenance,
    updateMaintenance,
    completeMaintenance,
    cancelMaintenance,
    deleteMaintenance,
  } = useClientMaintenance();
  const can = useCan();

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', type: '', priority: '' });
  const [sort, setSort] = useState({ by: 'scheduledDate', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [formOpen, setFormOpen] = useState(false);
  const [formTarget, setFormTarget] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [detailTarget, setDetailTarget] = useState(null);

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

  const hasActiveFilters = Boolean(search.trim() || filters.status || filters.type || filters.priority);

  const vehicleById = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return maintenance.filter((item) => {
      if (filters.status && item.status !== filters.status) return false;
      if (filters.type && item.maintenanceType !== filters.type) return false;
      if (filters.priority && item.priority !== filters.priority) return false;
      if (!query) return true;
      const vehicle = vehicleById.get(item.vehicleId);
      const haystack = [
        item.maintenanceNumber,
        item.workshop,
        item.mechanic,
        item.supplier,
        vehicle?.registrationNumber,
        vehicle?.brand,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [maintenance, search, filters, vehicleById]);

  const sorted = useMemo(() => {
    const accessor = SORTABLE_KEYS[sort.by] || SORTABLE_KEYS.scheduledDate;
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
      maintenance.reduce(
        (acc, item) => {
          acc.total += 1;
          acc[item.status] = (acc[item.status] ?? 0) + 1;
          return acc;
        },
        { total: 0, planned: 0, pending: 0, in_progress: 0, completed: 0, cancelled: 0 },
      ),
    [maintenance],
  );

  const monthCost = useMemo(() => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return maintenance
      .filter((item) => item.status === 'completed' && String(item.completedAt || '').slice(0, 7) === monthKey)
      .reduce((sum, item) => sum + Number(item.actualCost || 0), 0);
  }, [maintenance]);

  const vehiclesInMaintenance = useMemo(
    () => vehicles.filter((v) => v.operationalStatus === 'maintenance').length,
    [vehicles],
  );

  const handleSortChange = (by, direction) => {
    setSort({ by, direction });
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilters({ status: '', type: '', priority: '' });
  };

  const openCreate = () => {
    setFormTarget(null);
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setFormTarget(item);
    setFormError('');
    setFormOpen(true);
  };

  const openDetail = (item) => {
    setDetailTarget(item);
  };

  const openFinish = (item) => {
    setFinishTarget(item);
    setFinishError('');
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
      if (formTarget) {
        await updateMaintenance(formTarget.id, payload);
        toast.success('Entretien mis à jour.');
      } else {
        await createMaintenance(payload);
        toast.success('Entretien planifié.');
      }
      setFormOpen(false);
      refetch();
    } catch (err) {
      setFormError(err?.message || 'Impossible d’enregistrer l’entretien.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinish = async (payload) => {
    if (!finishTarget) return;
    setIsFinishing(true);
    setFinishError('');
    try {
      await completeMaintenance(finishTarget.id, payload);
      toast.success('Entretien clôturé. Véhicule remis en service.');
      setFinishTarget(null);
      refetch();
    } catch (err) {
      setFinishError(err?.message || 'Impossible de clôturer l’entretien.');
    } finally {
      setIsFinishing(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    setCancelError('');
    try {
      await cancelMaintenance(cancelTarget.id, { reason: cancelReason });
      toast.success('Entretien annulé.');
      setCancelTarget(null);
      setCancelReason('');
      refetch();
    } catch (err) {
      setCancelError(err?.message || 'Impossible d’annuler l’entretien.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteMaintenance(deleteTarget.id);
      toast.success('Entretien supprimé.');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      setDeleteError(err?.message || 'Impossible de supprimer l’entretien.');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: 'maintenanceNumber',
      label: 'Entretien',
      sortable: true,
      render: (item) => (
        <button
          type="button"
          className="navix-fleet-vehbtn"
          onClick={() => openDetail(item)}
          title={`Voir ${item.maintenanceNumber}`}
        >
          <span className="text-start">
            <span className="fw-semibold font-monospace d-block">{item.maintenanceNumber}</span>
            <small className="text-secondary d-block">{getMaintenanceType(item.maintenanceType).label}</small>
          </span>
        </button>
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
      key: 'priority',
      label: 'Priorité',
      sortable: true,
      render: (item) => {
        const priority = getMaintenancePriority(item.priority);
        return <StatusBadge variant={priority.variant} label={priority.label} icon={priority.icon} />;
      },
    },
    {
      key: 'scheduledDate',
      label: 'Date prévue',
      sortable: true,
      render: (item) => formatMaintenanceDate(item.scheduledDate),
    },
    {
      key: 'actualCost',
      label: 'Coût',
      align: 'end',
      sortable: true,
      render: (item) => {
        const value = Number(item.actualCost) || Number(item.estimatedCost) || 0;
        return <span className="tabular-nums">{value > 0 ? formatMaintenanceMoney(value, item.currency) : '—'}</span>;
      },
    },
    {
      key: 'status',
      label: 'Statut',
      render: (item) => {
        const status = getMaintenanceStatus(item.status);
        return <StatusBadge variant={status.variant} label={status.label} icon={status.icon} />;
      },
    },
  ];

  if (isLoading && maintenance.length === 0) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={4} label="Chargement de vos entretiens…" />
      </PageContainer>
    );
  }

  if (error && maintenance.length === 0) {
    return (
      <PageContainer>
        <ErrorState
          title="Impossible de charger vos entretiens"
          description="Les données sont temporairement indisponibles."
          retry={refetch}
        />
      </PageContainer>
    );
  }

  const detailVehicle = detailTarget ? vehicleById.get(detailTarget.vehicleId) : null;

  return (
    <PageContainer>
      <Helmet>
        <title>Maintenance — Navix Client</title>
      </Helmet>

      <PageHeader
        title="Maintenance"
        subtitle={
          isEnterprise
            ? `Suivi des entretiens et révisions de la flotte de ${currentClient?.companyName || 'votre entreprise'} au Cameroun 🇨🇲.`
            : 'La maintenance n’est pas disponible pour un client particulier.'
        }
        icon="bi-wrench-adjustable"
        breadcrumbs={[{ label: 'Espace Client', to: ROUTES.CLIENT_DASHBOARD }, { label: 'Maintenance' }]}
        actions={
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Can permission={PERMISSIONS.CLIENT_MAINTENANCE_CREATE}>
              <Button variant="primary" size="sm" icon="bi-plus-circle" onClick={openCreate}>
                Planifier un entretien
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
          icon="bi-wrench-adjustable"
          title="Maintenance indisponible"
          description="En tant que client particulier, le suivi de la maintenance n’est pas disponible. Basculez en profil Entreprise pour accéder à vos entretiens."
        />
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-6 col-lg-2">
              <MetricCard label="Entretiens" value={counts.total} icon="bi-wrench-adjustable" variant="primary" />
            </div>
            <div className="col-6 col-lg-2">
              <MetricCard label="Prévus" value={counts.planned + counts.pending} icon="bi-calendar2-event" variant="info" />
            </div>
            <div className="col-6 col-lg-2">
              <MetricCard label="En cours" value={counts.in_progress} icon="bi-gear-wide-connected" variant="warning" />
            </div>
            <div className="col-6 col-lg-2">
              <MetricCard label="Terminés" value={counts.completed} icon="bi-check2-circle" variant="success" />
            </div>
            <div className="col-6 col-lg-2">
              <MetricCard label="Véhicules immobilisés" value={vehiclesInMaintenance} icon="bi-pause-circle" variant="danger" />
            </div>
            <div className="col-6 col-lg-2">
              <MetricCard
                label="Coût du mois"
                value={formatMaintenanceMoney(monthCost)}
                icon="bi-cash-stack"
                variant="dark"
              />
            </div>
          </div>

          <DataTable
            className="navix-client-maintenance-table"
            columns={columns}
            rows={pageItems}
            sort={sort}
            onSortChange={handleSortChange}
            ariaLabel="Liste de mes entretiens"
            empty={
              <EmptyState
                compact
                icon="bi-wrench-adjustable"
                title={hasActiveFilters ? 'Aucun entretien ne correspond' : 'Aucun entretien'}
                description={
                  hasActiveFilters
                    ? 'Modifiez vos critères de recherche ou réinitialisez les filtres.'
                    : 'Planifiez votre premier entretien pour suivre la maintenance de votre flotte.'
                }
              />
            }
            header={
              <div className="navix-ops-toolbar">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Rechercher (numéro, véhicule, atelier…)"
                  resultCount={totalItems}
                  aria-label="Rechercher parmi mes entretiens"
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
                      key: 'priority',
                      type: 'select',
                      label: 'Priorité',
                      options: PRIORITY_FILTER_OPTIONS,
                      allLabel: 'Toutes les priorités',
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
                label: (item) => `Voir ${item.maintenanceNumber}`,
                title: 'Voir le détail',
                icon: 'bi-eye',
                onClick: (item) => openDetail(item),
              },
              {
                key: 'finish',
                label: (item) => `Clôturer ${item.maintenanceNumber}`,
                title: 'Clôturer l’entretien',
                icon: 'bi-check2-circle',
                show: (item) => !isMaintenanceFinished(item) && can(PERMISSIONS.CLIENT_MAINTENANCE_UPDATE),
                onClick: (item) => openFinish(item),
              },
              {
                key: 'cancel',
                label: (item) => `Annuler ${item.maintenanceNumber}`,
                title: 'Annuler l’entretien',
                icon: 'bi-x-octagon',
                danger: true,
                show: (item) => !isMaintenanceFinished(item) && can(PERMISSIONS.CLIENT_MAINTENANCE_UPDATE),
                onClick: (item) => openCancel(item),
              },
              {
                key: 'edit',
                label: (item) => `Modifier ${item.maintenanceNumber}`,
                title: 'Modifier',
                icon: 'bi-pencil',
                show: (item) => !isMaintenanceFinished(item) && can(PERMISSIONS.CLIENT_MAINTENANCE_UPDATE),
                onClick: (item) => openEdit(item),
              },
              {
                key: 'delete',
                label: (item) => `Supprimer ${item.maintenanceNumber}`,
                title: 'Supprimer',
                icon: 'bi-trash3',
                danger: true,
                show: () => can(PERMISSIONS.CLIENT_MAINTENANCE_DELETE),
                onClick: (item) => openDelete(item),
              },
            ]}
          />

          <ClientMaintenanceFormModal
            key={`${formTarget?.id ?? 'create'}-${formOpen}`}
            open={formOpen}
            onClose={() => setFormOpen(false)}
            maintenance={formTarget}
            vehicles={vehicles}
            onSubmit={handleFormSubmit}
            loading={isSaving}
            error={formError}
          />

          <ClientMaintenanceDetailModal
            open={Boolean(detailTarget)}
            onClose={() => setDetailTarget(null)}
            maintenance={detailTarget}
            vehicle={detailVehicle}
          />

          <ClientMaintenanceFinishModal
            open={Boolean(finishTarget)}
            onClose={() => setFinishTarget(null)}
            maintenance={finishTarget}
            onSubmit={handleFinish}
            loading={isFinishing}
            error={finishError}
          />

          <ConfirmDialog
            open={Boolean(cancelTarget)}
            onClose={() => setCancelTarget(null)}
            title="Annuler cet entretien"
            icon="bi-x-octagon"
            confirmLabel="Annuler l’entretien"
            confirmVariant="danger"
            loading={isCancelling}
            error={cancelError}
            onConfirm={handleCancel}
            message={
              cancelTarget ? (
                <>
                  <p className="mb-3">
                    Vous êtes sur le point d’annuler l’entretien{' '}
                    <strong className="font-monospace">{cancelTarget.maintenanceNumber}</strong> (
                    {getMaintenanceType(cancelTarget.maintenanceType).label} —{' '}
                    {vehicleById.get(cancelTarget.vehicleId)?.registrationNumber || cancelTarget.vehicleId}).
                  </p>
                  <div>
                    <label className="form-label" htmlFor="client-maintenance-cancel-reason">
                      Motif d’annulation
                    </label>
                    <textarea
                      id="client-maintenance-cancel-reason"
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
            entityName={deleteTarget ? deleteTarget.maintenanceNumber : undefined}
            title="Supprimer cet entretien"
            loading={isDeleting}
            error={deleteError}
            onConfirm={handleDelete}
          />
        </>
      )}
    </PageContainer>
  );
};

export default ClientMaintenancePage;
