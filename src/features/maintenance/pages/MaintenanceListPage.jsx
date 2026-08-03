/**
 * Navix Maintenance — MaintenanceListPage
 * --------------------------------------------------------------------------
 * Liste des entretiens : statistiques, recherche instantanée, filtres, tri,
 * pagination, états chargement / erreur / vide et suppression.
 * Responsive : tableau sur desktop, cartes sur tablette / mobile.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Button } from '@/components/ui';
import { PageContainer, PageHeader, Pagination, LoadingState } from '@/components/core';
import {
  ROUTES,
  maintenanceDetailPath,
  maintenanceEditPath,
} from '@/routes/route.constants';
import { useMediaQuery } from '@/hooks';
import { useCompaniesStore } from '@/features/companies';
import { useVehiclesStore } from '@/features/vehicles';
import { useMaintenanceStore } from '../store';
import { useMaintenanceListData } from '../hooks';
import {
  MaintenanceStatsCards,
  MaintenanceSearchBar,
  MaintenanceFilters,
  MaintenanceTable,
  MaintenanceCard,
  MaintenanceEmptyState,
  DeleteMaintenanceModal,
} from '../components';

const MaintenanceListPage = () => {
  const navigate = useNavigate();

  const maintenanceRecords = useMaintenanceStore((state) => state.maintenanceRecords);
  const search = useMaintenanceStore((state) => state.search);
  const filters = useMaintenanceStore((state) => state.filters);
  const sort = useMaintenanceStore((state) => state.sort);
  const pageSize = useMaintenanceStore((state) => state.pagination.pageSize);
  const isLoading = useMaintenanceStore((state) => state.isLoading);
  const error = useMaintenanceStore((state) => state.error);
  const fetchMaintenanceRecords = useMaintenanceStore((state) => state.fetchMaintenanceRecords);
  const setSearch = useMaintenanceStore((state) => state.setSearch);
  const setFilter = useMaintenanceStore((state) => state.setFilter);
  const resetFilters = useMaintenanceStore((state) => state.resetFilters);
  const setSort = useMaintenanceStore((state) => state.setSort);
  const setPage = useMaintenanceStore((state) => state.setPage);
  const setPageSize = useMaintenanceStore((state) => state.setPageSize);
  const deleteMaintenance = useMaintenanceStore((state) => state.deleteMaintenance);
  const clearError = useMaintenanceStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const vehicles = useVehiclesStore((state) => state.vehicles);
  const fetchVehicles = useVehiclesStore((state) => state.fetchVehicles);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const isCompact = useMediaQuery('(max-width: 991.98px)');

  const companyById = useMemo(
    () => Object.fromEntries(companies.map((company) => [company.id, company])),
    [companies],
  );

  const vehicleById = useMemo(
    () => Object.fromEntries(vehicles.map((vehicle) => [vehicle.id, vehicle])),
    [vehicles],
  );

  const { items, totalItems, totalPages, page } = useMaintenanceListData(companyById, vehicleById);

  useEffect(() => {
    fetchMaintenanceRecords();
    fetchCompanies();
    fetchVehicles();
  }, [fetchMaintenanceRecords, fetchCompanies, fetchVehicles]);

  const hasActiveFilters = Boolean(
    search.trim() ||
      filters.companyId ||
      filters.vehicleId ||
      filters.maintenanceType ||
      filters.priority ||
      filters.status ||
      filters.period,
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError('');

    const result = await deleteMaintenance(deleteTarget.id);
    setIsDeleting(false);

    if (result.success) {
      toast.success(`L'entretien « ${deleteTarget.maintenanceNumber} » a été supprimé.`);
      setDeleteTarget(null);
    } else {
      setDeleteError(result.error || 'Impossible de supprimer l’entretien.');
    }
  };

  const closeDelete = () => {
    setDeleteTarget(null);
    setDeleteError('');
  };

  const breadcrumbs = [{ label: 'Dashboard', to: ROUTES.DASHBOARD }, { label: 'Entretiens' }];

  const headerActions = (
    <div className="d-flex gap-2 flex-wrap">
      <Button variant="outline" icon="bi-calendar3" onClick={() => navigate(ROUTES.MAINTENANCE_CALENDAR)}>
        Calendrier
      </Button>
      <Button variant="outline" icon="bi-bar-chart-line" onClick={() => navigate(ROUTES.MAINTENANCE_STATISTICS)}>
        Statistiques
      </Button>
      <Button variant="primary" icon="bi-plus-lg" onClick={() => navigate(ROUTES.MAINTENANCE_CREATE)}>
        Nouvel entretien
      </Button>
    </div>
  );

  return (
    <PageContainer>
      <Helmet>
        <title>Entretiens — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Entretiens"
        subtitle="Planifiez et suivez la maintenance de vos véhicules."
        icon="bi-wrench-adjustable"
        breadcrumbs={breadcrumbs}
        actions={headerActions}
      />

      <MaintenanceStatsCards maintenanceRecords={maintenanceRecords} vehicleById={vehicleById} />

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      <MaintenanceSearchBar value={search} onChange={setSearch} resultCount={totalItems} />

      <MaintenanceFilters
        filters={filters}
        companies={companies}
        vehicles={vehicles}
        onChange={setFilter}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {isLoading && maintenanceRecords.length === 0 ? (
        <LoadingState variant="table" rows={6} cols={6} label="Chargement des entretiens…" />
      ) : items.length === 0 ? (
        <MaintenanceEmptyState hasQuery={hasActiveFilters} onReset={hasActiveFilters ? resetFilters : undefined} />
      ) : (
        <>
          {isCompact ? (
            <div className="row g-3">
              {items.map((maintenance) => (
                <div key={maintenance.id} className="col-12 col-sm-6 col-xl-4">
                  <MaintenanceCard
                    maintenance={maintenance}
                    companyName={companyById[maintenance.companyId]?.name}
                    vehicle={vehicleById[maintenance.vehicleId]}
                    vehicleLabel={
                      vehicleById[maintenance.vehicleId]?.registrationNumber ||
                      `${vehicleById[maintenance.vehicleId]?.brand ?? ''} ${vehicleById[maintenance.vehicleId]?.model ?? ''}`.trim()
                    }
                    onView={(id) => navigate(maintenanceDetailPath(id))}
                    onEdit={(id) => navigate(maintenanceEditPath(id))}
                    onDelete={setDeleteTarget}
                  />
                </div>
              ))}
            </div>
          ) : (
            <MaintenanceTable
              maintenanceRecords={items}
              vehicleById={vehicleById}
              sort={sort}
              onSortChange={(by, direction) => setSort(by, direction)}
              onView={(id) => navigate(maintenanceDetailPath(id))}
              onEdit={(id) => navigate(maintenanceEditPath(id))}
              onDelete={setDeleteTarget}
            />
          )}

          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}

      <DeleteMaintenanceModal
        maintenance={deleteTarget}
        open={Boolean(deleteTarget)}
        loading={isDeleting}
        error={deleteError}
        onConfirm={handleDelete}
        onClose={closeDelete}
      />
    </PageContainer>
  );
};

export default MaintenanceListPage;
