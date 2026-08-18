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
} from '@/components/core';
import { Can } from '@/features/rbac/components';
import { useCan } from '@/features/rbac/hooks';
import { PERMISSIONS } from '@/features/rbac/constants';
import {
  ASSIGNMENT_TYPES,
  ASSIGNMENT_TYPE_VALUES,
  ASSIGNMENT_STATUSES,
  ASSIGNMENT_STATUS_VALUES,
  getAssignmentType,
  getAssignmentStatus,
  formatAssignmentDate,
} from '@/features/assignments/constants';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/features/assignments/constants';
import { ROUTES } from '@/routes/route.constants';
import { useClientData } from '../hooks/useClientData';
import { useClientVehicles } from '../hooks/useClientVehicles';
import { useClientDrivers } from '../hooks/useClientDrivers';
import { useClientAssignments } from '../hooks/useClientAssignments';
import ClientAssignmentFormModal from '../components/ClientOperations/ClientAssignmentFormModal';
import ClientAssignmentFinishModal from '../components/ClientOperations/ClientAssignmentFinishModal';
import '../components/ClientOperations/ClientOperations.css';

const STATUS_FILTER_OPTIONS = ASSIGNMENT_STATUS_VALUES.map((status) => ({
  value: status,
  label: ASSIGNMENT_STATUSES[status].label,
}));

const TYPE_FILTER_OPTIONS = ASSIGNMENT_TYPE_VALUES.map((type) => ({
  value: type,
  label: ASSIGNMENT_TYPES[type].label,
}));

const SORTABLE_KEYS = {
  assignmentNumber: (a) => a.assignmentNumber?.toLowerCase() ?? '',
  startDate: (a) => a.startDate ?? '',
  endDate: (a) => a.endDate ?? '',
  startMileage: (a) => Number(a.startMileage) || 0,
};

const ClientAssignmentsPage = () => {
  const { currentClient, isEnterprise } = useClientData();
  const { vehicles } = useClientVehicles();
  const { drivers } = useClientDrivers();
  const {
    assignments,
    isLoading,
    error,
    refetch,
    createAssignment,
    updateAssignment,
    finishAssignment,
    deleteAssignment,
  } = useClientAssignments();
  const can = useCan();

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', type: '' });
  const [sort, setSort] = useState({ by: 'startDate', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [formOpen, setFormOpen] = useState(false);
  const [formTarget, setFormTarget] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [finishTarget, setFinishTarget] = useState(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishError, setFinishError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const hasActiveFilters = Boolean(search.trim() || filters.status || filters.type);

  const vehicleById = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles]);
  const driverById = useMemo(() => new Map(drivers.map((d) => [d.id, d])), [drivers]);

  const activeVehicleIds = useMemo(
    () => assignments.filter((a) => a.status === 'active').map((a) => a.vehicleId),
    [assignments],
  );
  const activeDriverIds = useMemo(
    () => assignments.filter((a) => a.status === 'active').map((a) => a.driverId),
    [assignments],
  );
  const busyDriverIds = useMemo(
    () => new Set(drivers.filter((d) => d.availability === 'busy').map((d) => d.id)),
    [drivers],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return assignments.filter((assignment) => {
      if (filters.status && assignment.status !== filters.status) return false;
      if (filters.type && assignment.assignmentType !== filters.type) return false;
      if (!query) return true;
      const vehicle = vehicleById.get(assignment.vehicleId);
      const driver = driverById.get(assignment.driverId);
      const haystack = [
        assignment.assignmentNumber,
        vehicle?.registrationNumber,
        vehicle?.brand,
        vehicle?.model,
        driver?.fullName,
        assignment.reason,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [assignments, search, filters, vehicleById, driverById]);

  const sorted = useMemo(() => {
    const accessor = SORTABLE_KEYS[sort.by] || SORTABLE_KEYS.startDate;
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
      assignments.reduce(
        (acc, assignment) => {
          acc.total += 1;
          acc[assignment.status] = (acc[assignment.status] ?? 0) + 1;
          return acc;
        },
        { total: 0, active: 0, completed: 0 },
      ),
    [assignments],
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

  const openEdit = (assignment) => {
    setFormTarget(assignment);
    setFormError('');
    setFormOpen(true);
  };

  const openFinish = (assignment) => {
    setFinishTarget(assignment);
    setFinishError('');
  };

  const openDelete = (assignment) => {
    setDeleteTarget(assignment);
    setDeleteError('');
  };

  const handleFormSubmit = async (payload) => {
    setIsSaving(true);
    setFormError('');
    try {
      if (formTarget) {
        await updateAssignment(formTarget.id, payload);
        toast.success('Affectation mise à jour.');
      } else {
        await createAssignment(payload);
        toast.success('Affectation créée.');
      }
      setFormOpen(false);
      refetch();
    } catch (err) {
      setFormError(err?.message || 'Impossible d’enregistrer l’affectation.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinish = async (payload) => {
    if (!finishTarget) return;
    setIsFinishing(true);
    setFinishError('');
    try {
      await finishAssignment(finishTarget.id, payload);
      toast.success('Affectation clôturée. Véhicule et chauffeur libérés.');
      setFinishTarget(null);
      refetch();
    } catch (err) {
      setFinishError(err?.message || 'Impossible de clôturer l’affectation.');
    } finally {
      setIsFinishing(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteAssignment(deleteTarget.id);
      toast.success('Affectation supprimée.');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      setDeleteError(err?.message || 'Impossible de supprimer l’affectation.');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: 'assignment',
      label: 'Affectation',
      sortable: true,
      sortAccessor: (a) => a.assignmentNumber?.toLowerCase() ?? '',
      render: (assignment) => {
        const vehicle = vehicleById.get(assignment.vehicleId);
        const driver = driverById.get(assignment.driverId);
        return (
          <div>
            <span className="fw-semibold font-monospace d-block">{assignment.assignmentNumber}</span>
            <small className="text-secondary d-block">
              {vehicle ? `${vehicle.brand} ${vehicle.model} · ${vehicle.registrationNumber}` : assignment.vehicleId}
            </small>
            <small className="text-secondary d-block">{driver ? driver.fullName : assignment.driverId}</small>
          </div>
        );
      },
    },
    {
      key: 'type',
      label: 'Type',
      render: (assignment) => {
        const type = getAssignmentType(assignment.assignmentType);
        return (
          <span className="badge bg-secondary-subtle text-body">
            <i className={`bi ${type.icon || 'bi-link-45deg'} me-1`} aria-hidden="true" />
            {type.label}
          </span>
        );
      },
    },
    {
      key: 'startDate',
      label: 'Début',
      sortable: true,
      render: (assignment) => formatAssignmentDate(assignment.startDate),
    },
    {
      key: 'endDate',
      label: 'Fin',
      sortable: true,
      render: (assignment) => formatAssignmentDate(assignment.endDate),
    },
    {
      key: 'startMileage',
      label: 'Km départ',
      align: 'end',
      sortable: true,
      render: (assignment) => <span className="tabular-nums">{Number(assignment.startMileage) || 0} km</span>,
    },
    {
      key: 'status',
      label: 'Statut',
      render: (assignment) => {
        const status = getAssignmentStatus(assignment.status);
        return <StatusBadge variant={status.variant} label={status.label} icon={status.icon} />;
      },
    },
  ];

  if (isLoading && assignments.length === 0) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={4} label="Chargement de vos affectations…" />
      </PageContainer>
    );
  }

  if (error && assignments.length === 0) {
    return (
      <PageContainer>
        <ErrorState
          title="Impossible de charger vos affectations"
          description="Les données sont temporairement indisponibles."
          retry={refetch}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Helmet>
        <title>Mes affectations — Navix Client</title>
      </Helmet>

      <PageHeader
        title="Mes affectations"
        subtitle={
          isEnterprise
            ? `Affectations véhicule ↔ chauffeur de ${currentClient?.companyName || 'votre entreprise'}.`
            : 'Les affectations ne sont pas disponibles pour un client particulier.'
        }
        icon="bi-shuffle"
        breadcrumbs={[{ label: 'Espace Client', to: ROUTES.CLIENT_DASHBOARD }, { label: 'Mes affectations' }]}
        actions={
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Can permission={PERMISSIONS.CLIENT_ASSIGNMENTS_CREATE}>
              <Button variant="primary" size="sm" icon="bi-plus-circle" onClick={openCreate}>
                Créer une affectation
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
          icon="bi-shuffle"
          title="Aucune affectation"
          description="En tant que client particulier, les affectations véhicule–chauffeur ne sont pas disponibles. Basculez en profil Entreprise pour accéder à vos affectations."
        />
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-6 col-lg-3">
              <MetricCard label="Affectations" value={counts.total} icon="bi-shuffle" variant="primary" />
            </div>
            <div className="col-6 col-lg-3">
              <MetricCard label="Actives" value={counts.active} icon="bi-play-circle" variant="success" />
            </div>
            <div className="col-6 col-lg-3">
              <MetricCard label="Terminées" value={counts.completed} icon="bi-flag" variant="info" />
            </div>
            <div className="col-6 col-lg-3">
              <MetricCard label="Véhicules affectés" value={activeVehicleIds.length} icon="bi-truck" variant="dark" />
            </div>
          </div>

          <DataTable
            className="navix-ops-table"
            columns={columns}
            rows={pageItems}
            sort={sort}
            onSortChange={handleSortChange}
            ariaLabel="Liste de mes affectations"
            empty={
              <EmptyState
                compact
                icon="bi-shuffle"
                title={hasActiveFilters ? 'Aucune affectation ne correspond' : 'Aucune affectation'}
                description={
                  hasActiveFilters
                    ? 'Modifiez vos critères de recherche ou réinitialisez les filtres.'
                    : 'Créez une affectation pour lier un véhicule à un chauffeur.'
                }
              />
            }
            header={
              <div className="navix-ops-toolbar">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Rechercher (numéro, véhicule, chauffeur…)"
                  resultCount={totalItems}
                  aria-label="Rechercher parmi mes affectations"
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
                key: 'finish',
                label: (assignment) => `Clôturer ${assignment.assignmentNumber}`,
                title: 'Clôturer l’affectation',
                icon: 'bi-flag-fill',
                show: (assignment) =>
                  assignment.status === 'active' && can(PERMISSIONS.CLIENT_ASSIGNMENTS_UPDATE),
                onClick: (assignment) => openFinish(assignment),
              },
              {
                key: 'edit',
                label: (assignment) => `Modifier ${assignment.assignmentNumber}`,
                title: 'Modifier',
                icon: 'bi-pencil',
                show: () => can(PERMISSIONS.CLIENT_ASSIGNMENTS_UPDATE),
                onClick: (assignment) => openEdit(assignment),
              },
              {
                key: 'delete',
                label: (assignment) => `Supprimer ${assignment.assignmentNumber}`,
                title: 'Supprimer',
                icon: 'bi-trash3',
                danger: true,
                show: () => can(PERMISSIONS.CLIENT_ASSIGNMENTS_DELETE),
                onClick: (assignment) => openDelete(assignment),
              },
            ]}
          />

          <ClientAssignmentFormModal
            key={`${formTarget?.id ?? 'create'}-${formOpen}`}
            open={formOpen}
            onClose={() => setFormOpen(false)}
            assignment={formTarget}
            vehicles={vehicles}
            drivers={drivers}
            activeVehicleIds={activeVehicleIds}
            activeDriverIds={activeDriverIds}
            busyDriverIds={[...busyDriverIds]}
            onSubmit={handleFormSubmit}
            loading={isSaving}
            error={formError}
          />

          <ClientAssignmentFinishModal
            open={Boolean(finishTarget)}
            onClose={() => setFinishTarget(null)}
            assignment={finishTarget}
            onSubmit={handleFinish}
            loading={isFinishing}
            error={finishError}
          />

          <DeleteModal
            open={Boolean(deleteTarget)}
            onClose={() => setDeleteTarget(null)}
            entityName={deleteTarget ? deleteTarget.assignmentNumber : undefined}
            title="Supprimer cette affectation"
            loading={isDeleting}
            error={deleteError}
            onConfirm={handleDelete}
          />
        </>
      )}
    </PageContainer>
  );
};

export default ClientAssignmentsPage;
