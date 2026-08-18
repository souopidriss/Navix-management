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
  DRIVER_STATUSES,
  DRIVER_STATUS_VALUES,
  DRIVER_AVAILABILITY,
  DRIVER_AVAILABILITY_VALUES,
  getDriverStatus,
  getDriverAvailability,
  getLicenseCategory,
  formatDriverDate,
  getExpiryStatus,
} from '@/features/drivers/constants';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/features/drivers/constants';
import { ROUTES, clientDriverDetailPath } from '@/routes/route.constants';
import { useClientData } from '../hooks/useClientData';
import { useClientDrivers } from '../hooks/useClientDrivers';
import { useClientAssignments } from '../hooks/useClientAssignments';
import { getNextDriverStatuses, getNextDriverAvailabilities } from '../services/clientOperationsData';
import ClientDriverFormModal from '../components/ClientOperations/ClientDriverFormModal';
import '../components/ClientOperations/ClientOperations.css';

const STATUS_FILTER_OPTIONS = DRIVER_STATUS_VALUES.map((status) => ({
  value: status,
  label: DRIVER_STATUSES[status].label,
}));

const AVAILABILITY_FILTER_OPTIONS = DRIVER_AVAILABILITY_VALUES.map((availability) => ({
  value: availability,
  label: DRIVER_AVAILABILITY[availability].label,
}));

const SORTABLE_KEYS = {
  fullName: (driver) => driver.fullName?.toLowerCase() ?? '',
  employeeCode: (driver) => driver.employeeCode?.toLowerCase() ?? '',
  city: (driver) => driver.city?.toLowerCase() ?? '',
  yearsExperience: (driver) => Number(driver.yearsExperience) || 0,
  licenseExpiryDate: (driver) => driver.licenseExpiryDate ?? '',
};

const ClientDriversPage = () => {
  const navigate = useNavigate();
  const { currentClient, isEnterprise } = useClientData();
  const { drivers, isLoading, error, refetch, createDriver, updateDriver, updateDriverStatus, updateDriverAvailability, deleteDriver } =
    useClientDrivers();
  const { assignments } = useClientAssignments();
  const can = useCan();

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', availability: '', city: '' });
  const [sort, setSort] = useState({ by: 'fullName', direction: 'asc' });
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
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');

  const [availabilityTarget, setAvailabilityTarget] = useState(null);
  const [nextAvailability, setNextAvailability] = useState('');
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');

  const hasActiveFilters = Boolean(search.trim() || filters.status || filters.availability || filters.city);

  const activeAssignmentDriverIds = useMemo(
    () => new Set(assignments.filter((a) => a.status === 'active').map((a) => a.driverId)),
    [assignments],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return drivers.filter((driver) => {
      if (filters.status && driver.status !== filters.status) return false;
      if (filters.availability && driver.availability !== filters.availability) return false;
      if (filters.city && driver.city !== filters.city) return false;
      if (!query) return true;
      const haystack = [
        driver.fullName,
        driver.firstName,
        driver.lastName,
        driver.employeeCode,
        driver.licenseNumber,
        driver.city,
        driver.agencyId,
        driver.phone,
        driver.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [drivers, search, filters]);

  const sorted = useMemo(() => {
    const accessor = SORTABLE_KEYS[sort.by] || SORTABLE_KEYS.fullName;
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
      drivers.reduce(
        (acc, driver) => {
          acc.total += 1;
          acc[driver.status] = (acc[driver.status] ?? 0) + 1;
          return acc;
        },
        { total: 0, active: 0, on_mission: 0, available: 0, suspended: 0, on_leave: 0, inactive: 0 },
      ),
    [drivers],
  );

  const availabilityRate = counts.total
    ? Math.round(((counts.available + counts.active) / counts.total) * 100)
    : 0;

  const handleSortChange = (by, direction) => {
    setSort({ by, direction });
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilters({ status: '', availability: '', city: '' });
  };

  const openCreate = () => {
    setFormTarget(null);
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (driver) => {
    setFormTarget(driver);
    setFormError('');
    setFormOpen(true);
  };

  const openDelete = (driver) => {
    setDeleteTarget(driver);
    setDeleteError('');
  };

  const openStatusChange = (driver) => {
    setStatusTarget(driver);
    setNextStatus('');
    setStatusError('');
  };

  const openAvailabilityChange = (driver) => {
    setAvailabilityTarget(driver);
    setNextAvailability('');
    setAvailabilityError('');
  };

  const handleFormSubmit = async (payload) => {
    setIsSaving(true);
    setFormError('');
    try {
      if (formTarget) {
        await updateDriver(formTarget.id, payload);
        toast.success('Chauffeur mis à jour.');
      } else {
        await createDriver(payload);
        toast.success('Chauffeur ajouté à votre flotte.');
      }
      setFormOpen(false);
      refetch();
    } catch (err) {
      setFormError(err?.message || 'Impossible d’enregistrer le chauffeur.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteDriver(deleteTarget.id);
      toast.success('Chauffeur supprimé.');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      setDeleteError(err?.message || 'Impossible de supprimer le chauffeur.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async () => {
    if (!statusTarget || !nextStatus) return;
    setIsUpdatingStatus(true);
    setStatusError('');
    try {
      await updateDriverStatus(statusTarget.id, nextStatus);
      toast.success('Statut du chauffeur mis à jour.');
      setStatusTarget(null);
      setNextStatus('');
      refetch();
    } catch (err) {
      setStatusError(err?.message || 'Changement de statut refusé.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAvailabilityChange = async () => {
    if (!availabilityTarget || !nextAvailability) return;
    setIsUpdatingAvailability(true);
    setAvailabilityError('');
    try {
      await updateDriverAvailability(availabilityTarget.id, nextAvailability);
      toast.success('Disponibilité mise à jour.');
      setAvailabilityTarget(null);
      setNextAvailability('');
      refetch();
    } catch (err) {
      setAvailabilityError(err?.message || 'Changement de disponibilité refusé.');
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  const statusOptions = statusTarget ? getNextDriverStatuses(statusTarget.status) : [];
  const availabilityOptions = availabilityTarget ? getNextDriverAvailabilities(availabilityTarget.availability) : [];

  const columns = [
    {
      key: 'driver',
      label: 'Chauffeur',
      sortable: true,
      sortAccessor: (driver) => driver.fullName?.toLowerCase() ?? '',
      render: (driver) => (
        <button
          type="button"
          className="navix-fleet-vehbtn"
          onClick={() => navigate(clientDriverDetailPath(driver.id))}
          title={`Voir ${driver.fullName}`}
        >
          <span className="navix-driver-avatar" aria-hidden="true">
            <i className="bi bi-person-badge" />
          </span>
          <span className="text-start">
            <span className="fw-semibold d-block">{driver.fullName}</span>
            <small className="text-secondary">
              {driver.employeeCode}
              {driver.city ? ` · ${driver.city}` : ''}
            </small>
          </span>
        </button>
      ),
    },
    {
      key: 'licenseCategory',
      label: 'Permis',
      render: (driver) => {
        const category = getLicenseCategory(driver.licenseCategory);
        return (
          <span className="badge bg-secondary-subtle text-body">
            <i className="bi bi-card-checklist me-1" aria-hidden="true" />
            {driver.licenseCategory || '—'}
            {category.label && category.label !== driver.licenseCategory ? ` · ${category.label}` : ''}
          </span>
        );
      },
    },
    {
      key: 'licenseExpiryDate',
      label: 'Permis expire le',
      render: (driver) => (
        <span>
          <span className="tabular-nums d-block">{formatDriverDate(driver.licenseExpiryDate)}</span>
          <span className="small">
            <StatusBadge
              size="sm"
              variant={getExpiryStatus(driver.licenseExpiryDate).variant}
              label={getExpiryStatus(driver.licenseExpiryDate).label}
            />
          </span>
        </span>
      ),
    },
    {
      key: 'assignment',
      label: 'Affectation',
      render: (driver) =>
        activeAssignmentDriverIds.has(driver.id) ? (
          <span className="badge bg-success-subtle text-success">
            <i className="bi bi-link-45deg me-1" aria-hidden="true" />
            Affecté
          </span>
        ) : (
          <span className="text-secondary">—</span>
        ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (driver) => {
        const status = getDriverStatus(driver.status);
        return <StatusBadge variant={status.variant} label={status.label} icon={status.icon} />;
      },
    },
    {
      key: 'availability',
      label: 'Disponibilité',
      render: (driver) => {
        const availability = getDriverAvailability(driver.availability);
        return <StatusBadge variant={availability.variant} label={availability.label} icon={availability.icon} />;
      },
    },
  ];

  if (isLoading && drivers.length === 0) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={4} label="Chargement de vos chauffeurs…" />
      </PageContainer>
    );
  }

  if (error && drivers.length === 0) {
    return (
      <PageContainer>
        <ErrorState
          title="Impossible de charger vos chauffeurs"
          description="Les données de votre équipe sont temporairement indisponibles."
          retry={refetch}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Helmet>
        <title>Mes chauffeurs — Navix Client</title>
      </Helmet>

      <PageHeader
        title="Mes chauffeurs"
        subtitle={
          isEnterprise
            ? `Gérez les chauffeurs de ${currentClient?.companyName || 'votre entreprise'}.`
            : 'Les chauffeurs sous contrat ne sont pas disponibles pour un client particulier.'
        }
        icon="bi-person-vcard"
        breadcrumbs={[{ label: 'Espace Client', to: ROUTES.CLIENT_DASHBOARD }, { label: 'Mes chauffeurs' }]}
        actions={
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Can permission={PERMISSIONS.CLIENT_DRIVERS_CREATE}>
              <Button variant="primary" size="sm" icon="bi-plus-circle" onClick={openCreate}>
                Ajouter un chauffeur
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
          icon="bi-person"
          title="Aucun chauffeur sous contrat"
          description="En tant que client particulier, la gestion des chauffeurs n’est pas disponible. Basculez en profil Entreprise pour accéder à vos chauffeurs."
        />
      ) : (
        <>
          <div className="navix-ops-identity mb-4">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div className="navix-ops-identity__logo" aria-hidden="true">
                <i className="bi bi-people" />
              </div>
              <div className="flex-grow-1 min-w-0">
                <h5 className="mb-0 fw-bold text-body-emphasis">{currentClient?.companyName || 'Transports Express Cameroun'}</h5>
                <span className="text-body-secondary small">
                  Équipe sous contrat · {currentClient?.contactName ? `Contact : ${currentClient.contactName}` : 'Espace Cameroun'}
                </span>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <span className="badge bg-body-secondary px-3 py-2" title="Espace Cameroun">
                  🇨🇲 Cameroun
                </span>
                <span className="badge bg-primary-subtle text-primary px-3 py-2">
                  <i className="bi bi-people me-1" aria-hidden="true" />
                  {counts.total} chauffeurs
                </span>
              </div>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-6 col-lg-2">
              <MetricCard label="Chauffeurs" value={counts.total} icon="bi-people" variant="primary" />
            </div>
            <div className="col-6 col-lg-2">
              <MetricCard label="Actifs" value={counts.active} icon="bi-check-circle" variant="success" />
            </div>
            <div className="col-6 col-lg-2">
              <MetricCard label="En mission" value={counts.on_mission} icon="bi-play-circle" variant="info" />
            </div>
            <div className="col-6 col-lg-2">
              <MetricCard label="Suspendus" value={counts.suspended} icon="bi-pause-circle" variant="warning" />
            </div>
            <div className="col-6 col-lg-2">
              <MetricCard label="Inactifs" value={counts.inactive} icon="bi-slash-circle" variant="danger" />
            </div>
            <div className="col-6 col-lg-2">
              <MetricCard label="Disponibilité" value={`${availabilityRate} %`} icon="bi-graph-up-arrow" variant="dark" />
            </div>
          </div>

          <DataTable
            className="navix-ops-table"
            columns={columns}
            rows={pageItems}
            sort={sort}
            onSortChange={handleSortChange}
            ariaLabel="Liste de mes chauffeurs"
            empty={
              <EmptyState
                compact
                icon="bi-person-vcard"
                title={hasActiveFilters ? 'Aucun chauffeur ne correspond' : 'Aucun chauffeur'}
                description={
                  hasActiveFilters
                    ? 'Modifiez vos critères de recherche ou réinitialisez les filtres.'
                    : 'Ajoutez votre premier chauffeur pour gérer votre équipe.'
                }
              />
            }
            header={
              <div className="navix-ops-toolbar">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Rechercher (nom, code employé, ville…)"
                  resultCount={totalItems}
                  aria-label="Rechercher parmi mes chauffeurs"
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
                      key: 'availability',
                      type: 'select',
                      label: 'Disponibilité',
                      options: AVAILABILITY_FILTER_OPTIONS,
                      allLabel: 'Toutes les disponibilités',
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
                label: (driver) => `Voir ${driver.fullName}`,
                title: 'Voir la fiche',
                icon: 'bi-eye',
                onClick: (driver) => navigate(clientDriverDetailPath(driver.id)),
              },
              {
                key: 'status',
                label: (driver) => `Changer le statut de ${driver.fullName}`,
                title: 'Changer le statut',
                icon: 'bi-arrow-repeat',
                show: () => can(PERMISSIONS.CLIENT_DRIVERS_UPDATE),
                onClick: (driver) => openStatusChange(driver),
              },
              {
                key: 'availability',
                label: (driver) => `Changer la disponibilité de ${driver.fullName}`,
                title: 'Changer la disponibilité',
                icon: 'bi-toggle-on',
                show: () => can(PERMISSIONS.CLIENT_DRIVERS_UPDATE),
                onClick: (driver) => openAvailabilityChange(driver),
              },
              {
                key: 'edit',
                label: (driver) => `Modifier ${driver.fullName}`,
                title: 'Modifier',
                icon: 'bi-pencil',
                show: () => can(PERMISSIONS.CLIENT_DRIVERS_UPDATE),
                onClick: (driver) => openEdit(driver),
              },
              {
                key: 'delete',
                label: (driver) => `Supprimer ${driver.fullName}`,
                title: 'Supprimer',
                icon: 'bi-trash3',
                danger: true,
                show: () => can(PERMISSIONS.CLIENT_DRIVERS_DELETE),
                onClick: (driver) => openDelete(driver),
              },
            ]}
          />

          <ClientDriverFormModal
            key={`${formTarget?.id ?? 'create'}-${formOpen}`}
            open={formOpen}
            onClose={() => setFormOpen(false)}
            driver={formTarget}
            drivers={drivers}
            onSubmit={handleFormSubmit}
            loading={isSaving}
            error={formError}
          />

          <DeleteModal
            open={Boolean(deleteTarget)}
            onClose={() => setDeleteTarget(null)}
            entityName={deleteTarget ? deleteTarget.fullName : undefined}
            title="Supprimer ce chauffeur"
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
            loading={isUpdatingStatus}
            error={statusError}
            onConfirm={handleStatusChange}
            message={
              statusTarget ? (
                <>
                  <p className="mb-3">
                    Statut actuel :{' '}
                    <StatusBadge
                      variant={getDriverStatus(statusTarget.status).variant}
                      label={getDriverStatus(statusTarget.status).label}
                    />
                  </p>
                  {statusOptions.length === 0 ? (
                    <p className="text-secondary small mb-0">Aucune transition de statut autorisée depuis cet état.</p>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {statusOptions.map((status) => {
                        const meta = getDriverStatus(status);
                        return (
                          <label key={status} className="navix-ops-status-option">
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

          <ConfirmDialog
            open={Boolean(availabilityTarget)}
            onClose={() => setAvailabilityTarget(null)}
            title="Changer la disponibilité"
            icon="bi-toggle-on"
            confirmLabel="Appliquer"
            confirmVariant="primary"
            loading={isUpdatingAvailability}
            error={availabilityError}
            onConfirm={handleAvailabilityChange}
            message={
              availabilityTarget ? (
                <>
                  <p className="mb-3">
                    Disponibilité actuelle :{' '}
                    <StatusBadge
                      variant={getDriverAvailability(availabilityTarget.availability).variant}
                      label={getDriverAvailability(availabilityTarget.availability).label}
                    />
                  </p>
                  {availabilityOptions.length === 0 ? (
                    <p className="text-secondary small mb-0">Aucune transition de disponibilité autorisée depuis cet état.</p>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {availabilityOptions.map((availability) => {
                        const meta = getDriverAvailability(availability);
                        return (
                          <label key={availability} className="navix-ops-status-option">
                            <input
                              type="radio"
                              name="next-availability"
                              value={availability}
                              checked={nextAvailability === availability}
                              onChange={() => setNextAvailability(availability)}
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

export default ClientDriversPage;
