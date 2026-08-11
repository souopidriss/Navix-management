/**
 * Navix Vehicles — VehicleListPage
 * --------------------------------------------------------------------------
 * Liste des véhicules : statistiques, recherche instantanée, filtres, tri,
 * pagination, états chargement / erreur / vide et suppression.
 * Responsive : tableau sur desktop, cartes sur tablette / mobile.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Button, Pagination, Spinner } from '@/components/ui';
import { PageContainer, PageHeader } from '@/components/layout';
import { ROUTES, vehicleDetailPath, vehicleEditPath } from '@/routes/route.constants';
import { useMediaQuery } from '@/hooks';
import { useCompaniesStore } from '@/features/companies';
import { useVehiclesStore } from '../store';
import { useVehicleListData } from '../hooks';
import {
  VehicleStatsCards,
  VehicleSearchBar,
  VehicleFilters,
  VehicleTable,
  VehicleCard,
  VehicleEmptyState,
  DeleteVehicleModal,
} from '../components';

const VehicleListPage = () => {
  const navigate = useNavigate();

  const vehicles = useVehiclesStore((state) => state.vehicles);
  const search = useVehiclesStore((state) => state.search);
  const filters = useVehiclesStore((state) => state.filters);
  const sort = useVehiclesStore((state) => state.sort);
  const pageSize = useVehiclesStore((state) => state.pagination.pageSize);
  const isLoading = useVehiclesStore((state) => state.isLoading);
  const error = useVehiclesStore((state) => state.error);
  const fetchVehicles = useVehiclesStore((state) => state.fetchVehicles);
  const setSearch = useVehiclesStore((state) => state.setSearch);
  const setFilter = useVehiclesStore((state) => state.setFilter);
  const resetFilters = useVehiclesStore((state) => state.resetFilters);
  const setSort = useVehiclesStore((state) => state.setSort);
  const setPage = useVehiclesStore((state) => state.setPage);
  const setPageSize = useVehiclesStore((state) => state.setPageSize);
  const deleteVehicle = useVehiclesStore((state) => state.deleteVehicle);
  const clearError = useVehiclesStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const isCompact = useMediaQuery('(max-width: 991.98px)');

  const companyById = useMemo(
    () => Object.fromEntries(companies.map((company) => [company.id, company])),
    [companies],
  );

  const { items, totalItems, totalPages, page } = useVehicleListData(companyById);

  useEffect(() => {
    fetchVehicles();
    fetchCompanies();
  }, [fetchVehicles, fetchCompanies]);

  const brands = useMemo(
    () => [...new Set(vehicles.map((vehicle) => vehicle.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr')),
    [vehicles],
  );

  const years = useMemo(
    () =>
      [...new Set(vehicles.map((vehicle) => vehicle.year).filter(Boolean))].sort((a, b) => b - a),
    [vehicles],
  );

  const hasActiveFilters = Boolean(
    search.trim() ||
      filters.companyId ||
      filters.group ||
      filters.brand ||
      filters.status ||
      filters.fuelType ||
      filters.transmission ||
      filters.year,
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError('');

    const result = await deleteVehicle(deleteTarget.id);
    setIsDeleting(false);

    if (result.success) {
      toast.success(`Le véhicule « ${deleteTarget.registrationNumber} » a été supprimé.`);
      setDeleteTarget(null);
    } else {
      setDeleteError(result.error || 'Impossible de supprimer le véhicule.');
    }
  };

  const closeDelete = () => {
    setDeleteTarget(null);
    setDeleteError('');
  };

  const breadcrumbs = [{ label: 'Dashboard', to: ROUTES.DASHBOARD }, { label: 'Véhicules' }];

  const headerActions = (
    <Button variant="primary" icon="bi-plus-lg" onClick={() => navigate(ROUTES.VEHICLES_CREATE)}>
      Nouveau véhicule
    </Button>
  );

  return (
    <PageContainer>
      <Helmet>
        <title>Véhicules — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Véhicules"
        subtitle="Gérez la flotte : véhicules légers, utilitaires, camions, bus et engins."
        icon="bi-truck"
        breadcrumbs={breadcrumbs}
        actions={headerActions}
      />

      <VehicleStatsCards vehicles={vehicles} />

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      <VehicleSearchBar value={search} onChange={setSearch} resultCount={totalItems} />

      <VehicleFilters
        filters={filters}
        companies={companies}
        brands={brands}
        years={years}
        onChange={setFilter}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {isLoading && vehicles.length === 0 ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner size="lg" label="Chargement des véhicules…" />
        </div>
      ) : items.length === 0 ? (
        <VehicleEmptyState
          onReset={hasActiveFilters ? resetFilters : undefined}
          onCreate={() => navigate(ROUTES.VEHICLES_CREATE)}
        />
      ) : (
        <>
          {isCompact ? (
            <div className="row g-3">
              {items.map((vehicle) => (
                <div key={vehicle.id} className="col-12 col-sm-6 col-xl-4">
                  <VehicleCard
                    vehicle={vehicle}
                    companyName={companyById[vehicle.companyId]?.name}
                    onView={(id) => navigate(vehicleDetailPath(id))}
                    onEdit={(id) => navigate(vehicleEditPath(id))}
                    onDelete={setDeleteTarget}
                  />
                </div>
              ))}
            </div>
          ) : (
            <VehicleTable
              vehicles={items}
              companyById={companyById}
              sort={sort}
              onSortChange={(by, direction) => setSort(by, direction)}
              onView={(id) => navigate(vehicleDetailPath(id))}
              onEdit={(id) => navigate(vehicleEditPath(id))}
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

      <DeleteVehicleModal
        vehicle={deleteTarget}
        open={Boolean(deleteTarget)}
        loading={isDeleting}
        error={deleteError}
        onConfirm={handleDelete}
        onClose={closeDelete}
      />
    </PageContainer>
  );
};

export default VehicleListPage;
