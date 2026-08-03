/**
 * Navix Fuel — FuelListPage
 * --------------------------------------------------------------------------
 * Liste des pleins de carburant : statistiques, recherche instantanée,
 * filtres, tri, pagination, états chargement / erreur / vide et suppression.
 * Responsive : tableau sur desktop, cartes sur tablette / mobile.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Button } from '@/components/ui';
import { PageContainer, PageHeader, Pagination, LoadingState } from '@/components/core';
import { ROUTES, fuelDetailPath, fuelEditPath } from '@/routes/route.constants';
import { useMediaQuery } from '@/hooks';
import { useCompaniesStore } from '@/features/companies';
import { useVehiclesStore } from '@/features/vehicles';
import { useDriversStore } from '@/features/drivers';
import { useFuelStore } from '../store';
import { useFuelListData } from '../hooks';
import {
  FuelStatsCards,
  FuelSearchBar,
  FuelFilters,
  FuelTable,
  FuelCard,
  FuelEmptyState,
  DeleteFuelModal,
} from '../components';

const FuelListPage = () => {
  const navigate = useNavigate();

  const fuelRecords = useFuelStore((state) => state.fuelRecords);
  const search = useFuelStore((state) => state.search);
  const filters = useFuelStore((state) => state.filters);
  const sort = useFuelStore((state) => state.sort);
  const pageSize = useFuelStore((state) => state.pagination.pageSize);
  const isLoading = useFuelStore((state) => state.isLoading);
  const error = useFuelStore((state) => state.error);
  const fetchFuelRecords = useFuelStore((state) => state.fetchFuelRecords);
  const setSearch = useFuelStore((state) => state.setSearch);
  const setFilter = useFuelStore((state) => state.setFilter);
  const resetFilters = useFuelStore((state) => state.resetFilters);
  const setSort = useFuelStore((state) => state.setSort);
  const setPage = useFuelStore((state) => state.setPage);
  const setPageSize = useFuelStore((state) => state.setPageSize);
  const deleteFuel = useFuelStore((state) => state.deleteFuel);
  const clearError = useFuelStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const vehicles = useVehiclesStore((state) => state.vehicles);
  const fetchVehicles = useVehiclesStore((state) => state.fetchVehicles);

  const drivers = useDriversStore((state) => state.drivers);
  const fetchDrivers = useDriversStore((state) => state.fetchDrivers);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const isCompact = useMediaQuery('(max-width: 991.98px)');

  const companyById = useMemo(
    () => Object.fromEntries(companies.map((company) => [company.id, company])),
    [companies],
  );

  const driverById = useMemo(
    () => Object.fromEntries(drivers.map((driver) => [driver.id, driver])),
    [drivers],
  );

  const vehicleById = useMemo(
    () => Object.fromEntries(vehicles.map((vehicle) => [vehicle.id, vehicle])),
    [vehicles],
  );

  const { items, totalItems, totalPages, page } = useFuelListData(companyById, driverById, vehicleById);

  useEffect(() => {
    fetchFuelRecords();
    fetchCompanies();
    fetchVehicles();
    fetchDrivers();
  }, [fetchFuelRecords, fetchCompanies, fetchVehicles, fetchDrivers]);

  const hasActiveFilters = Boolean(
    search.trim() ||
      filters.companyId ||
      filters.vehicleId ||
      filters.driverId ||
      filters.fuelType ||
      filters.stationName ||
      filters.period ||
      filters.status,
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError('');

    const result = await deleteFuel(deleteTarget.id);
    setIsDeleting(false);

    if (result.success) {
      toast.success(`Le plein « ${deleteTarget.fuelNumber} » a été supprimé.`);
      setDeleteTarget(null);
    } else {
      setDeleteError(result.error || 'Impossible de supprimer le plein.');
    }
  };

  const closeDelete = () => {
    setDeleteTarget(null);
    setDeleteError('');
  };

  const breadcrumbs = [{ label: 'Dashboard', to: ROUTES.DASHBOARD }, { label: 'Carburant' }];

  const headerActions = (
    <div className="d-flex gap-2 flex-wrap">
      <Button variant="outline" icon="bi-bar-chart-line" onClick={() => navigate(ROUTES.FUEL_STATISTICS)}>
        Statistiques
      </Button>
      <Button variant="primary" icon="bi-plus-lg" onClick={() => navigate(ROUTES.FUEL_CREATE)}>
        Nouveau plein
      </Button>
    </div>
  );

  return (
    <PageContainer>
      <Helmet>
        <title>Carburant — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Carburant"
        subtitle="Suivez et contrôlez la consommation de carburant de vos véhicules."
        icon="bi-fuel-pump"
        breadcrumbs={breadcrumbs}
        actions={headerActions}
      />

      <FuelStatsCards fuelRecords={fuelRecords} />

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      <FuelSearchBar value={search} onChange={setSearch} resultCount={totalItems} />

      <FuelFilters
        filters={filters}
        companies={companies}
        drivers={drivers}
        vehicles={vehicles}
        onChange={setFilter}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {isLoading && fuelRecords.length === 0 ? (
        <LoadingState variant="table" rows={6} cols={6} label="Chargement des pleins…" />
      ) : items.length === 0 ? (
        <FuelEmptyState hasQuery={hasActiveFilters} onReset={hasActiveFilters ? resetFilters : undefined} />
      ) : (
        <>
          {isCompact ? (
            <div className="row g-3">
              {items.map((fuel) => (
                <div key={fuel.id} className="col-12 col-sm-6 col-xl-4">
                  <FuelCard
                    fuel={fuel}
                    companyName={companyById[fuel.companyId]?.name}
                    driverName={driverById[fuel.driverId]?.fullName}
                    vehicleLabel={
                      vehicleById[fuel.vehicleId]?.registrationNumber ||
                      `${vehicleById[fuel.vehicleId]?.brand ?? ''} ${vehicleById[fuel.vehicleId]?.model ?? ''}`.trim()
                    }
                    onView={(id) => navigate(fuelDetailPath(id))}
                    onEdit={(id) => navigate(fuelEditPath(id))}
                    onDelete={setDeleteTarget}
                  />
                </div>
              ))}
            </div>
          ) : (
            <FuelTable
              fuelRecords={items}
              driverById={driverById}
              vehicleById={vehicleById}
              sort={sort}
              onSortChange={(by, direction) => setSort(by, direction)}
              onView={(id) => navigate(fuelDetailPath(id))}
              onEdit={(id) => navigate(fuelEditPath(id))}
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

      <DeleteFuelModal
        fuel={deleteTarget}
        open={Boolean(deleteTarget)}
        loading={isDeleting}
        error={deleteError}
        onConfirm={handleDelete}
        onClose={closeDelete}
      />
    </PageContainer>
  );
};

export default FuelListPage;
