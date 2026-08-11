/**
 * Navix Trips — TripListPage
 * --------------------------------------------------------------------------
 * Liste des trajets : statistiques, recherche instantanée, filtres, tri,
 * pagination, états chargement / erreur / vide, clôture et suppression.
 * Responsive : tableau sur desktop, cartes sur tablette / mobile.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Alert, Button, Pagination, Spinner } from '@/components/ui';
import { PageContainer, PageHeader } from '@/components/layout';
import { ROUTES, tripDetailPath, tripEditPath } from '@/routes/route.constants';
import { useMediaQuery } from '@/hooks';
import { useCompaniesStore } from '@/features/companies';
import { useVehiclesStore } from '@/features/vehicles';
import { useDriversStore } from '@/features/drivers';
import { useTripsStore } from '../store';
import { useTripListData } from '../hooks';
import {
  TripStatsCards,
  TripSearchBar,
  TripFilters,
  TripTable,
  TripCard,
  TripEmptyState,
  DeleteTripModal,
  TripFinishModal,
} from '../components';

const TripListPage = () => {
  const navigate = useNavigate();

  const trips = useTripsStore((state) => state.trips);
  const search = useTripsStore((state) => state.search);
  const filters = useTripsStore((state) => state.filters);
  const sort = useTripsStore((state) => state.sort);
  const pageSize = useTripsStore((state) => state.pagination.pageSize);
  const isLoading = useTripsStore((state) => state.isLoading);
  const error = useTripsStore((state) => state.error);
  const fetchTrips = useTripsStore((state) => state.fetchTrips);
  const setSearch = useTripsStore((state) => state.setSearch);
  const setFilter = useTripsStore((state) => state.setFilter);
  const resetFilters = useTripsStore((state) => state.resetFilters);
  const setSort = useTripsStore((state) => state.setSort);
  const setPage = useTripsStore((state) => state.setPage);
  const setPageSize = useTripsStore((state) => state.setPageSize);
  const deleteTrip = useTripsStore((state) => state.deleteTrip);
  const finishTrip = useTripsStore((state) => state.finishTrip);
  const clearError = useTripsStore((state) => state.clearError);

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const vehicles = useVehiclesStore((state) => state.vehicles);
  const fetchVehicles = useVehiclesStore((state) => state.fetchVehicles);

  const drivers = useDriversStore((state) => state.drivers);
  const fetchDrivers = useDriversStore((state) => state.fetchDrivers);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [finishTarget, setFinishTarget] = useState(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishError, setFinishError] = useState('');

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

  const { items, totalItems, totalPages, page } = useTripListData(companyById, driverById, vehicleById);

  useEffect(() => {
    fetchTrips();
    fetchCompanies();
    fetchVehicles();
    fetchDrivers();
  }, [fetchTrips, fetchCompanies, fetchVehicles, fetchDrivers]);

  const hasActiveFilters = Boolean(
    search.trim() ||
      filters.companyId ||
      filters.status ||
      filters.tripType ||
      filters.period ||
      filters.driverId ||
      filters.vehicleId,
  );

  const handleFilterChange = (key, value) => {
    setFilter(key, value);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError('');

    const result = await deleteTrip(deleteTarget.id);
    setIsDeleting(false);

    if (result.success) {
      toast.success(`Le trajet « ${deleteTarget.tripNumber} » a été supprimé.`);
      setDeleteTarget(null);
    } else {
      setDeleteError(result.error || 'Impossible de supprimer le trajet.');
    }
  };

  const closeDelete = () => {
    setDeleteTarget(null);
    setDeleteError('');
  };

  const handleFinish = async (values) => {
    if (!finishTarget) return;
    setIsFinishing(true);
    setFinishError('');

    const result = await finishTrip(finishTarget.id, values);
    setIsFinishing(false);

    if (result.success) {
      toast.success(`Le trajet « ${finishTarget.tripNumber} » a été clôturé.`);
      setFinishTarget(null);
    } else {
      setFinishError(result.error || 'Impossible de clôturer le trajet.');
    }
  };

  const closeFinish = () => {
    setFinishTarget(null);
    setFinishError('');
  };

  const breadcrumbs = [{ label: 'Dashboard', to: ROUTES.DASHBOARD }, { label: 'Trajets' }];

  const headerActions = (
    <div className="d-flex gap-2 flex-wrap">
      <Button variant="outline" icon="bi-clock-history" onClick={() => navigate(ROUTES.TRIPS_HISTORY)}>
        Historique
      </Button>
      <Button variant="primary" icon="bi-plus-lg" onClick={() => navigate(ROUTES.TRIPS_CREATE)}>
        Nouveau trajet
      </Button>
    </div>
  );

  return (
    <PageContainer>
      <Helmet>
        <title>Trajets — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Trajets"
        subtitle="Planifiez et suivez les déplacements de vos véhicules."
        icon="bi-signpost-split"
        breadcrumbs={breadcrumbs}
        actions={headerActions}
      />

      <TripStatsCards trips={trips} />

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      <TripSearchBar value={search} onChange={setSearch} resultCount={totalItems} />

      <TripFilters
        filters={filters}
        companies={companies}
        drivers={drivers}
        vehicles={vehicles}
        onChange={handleFilterChange}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {isLoading && trips.length === 0 ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner size="lg" label="Chargement des trajets…" />
        </div>
      ) : items.length === 0 ? (
        <TripEmptyState
          hasQuery={hasActiveFilters}
          onReset={hasActiveFilters ? resetFilters : undefined}
        />
      ) : (
        <>
          {isCompact ? (
            <div className="row g-3">
              {items.map((trip) => (
                <div key={trip.id} className="col-12 col-sm-6 col-xl-4">
                  <TripCard
                    trip={trip}
                    companyName={companyById[trip.companyId]?.name}
                    driverName={driverById[trip.driverId]?.fullName}
                    vehicleLabel={
                      vehicleById[trip.vehicleId]?.registrationNumber ||
                      `${vehicleById[trip.vehicleId]?.brand ?? ''} ${vehicleById[trip.vehicleId]?.model ?? ''}`.trim()
                    }
                    onView={(id) => navigate(tripDetailPath(id))}
                    onEdit={(id) => navigate(tripEditPath(id))}
                    onFinish={setFinishTarget}
                    onDelete={setDeleteTarget}
                  />
                </div>
              ))}
            </div>
          ) : (
            <TripTable
              trips={items}
              companyById={companyById}
              driverById={driverById}
              vehicleById={vehicleById}
              sort={sort}
              onSortChange={(by, direction) => setSort(by, direction)}
              onView={(id) => navigate(tripDetailPath(id))}
              onEdit={(id) => navigate(tripEditPath(id))}
              onFinish={setFinishTarget}
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

      <DeleteTripModal
        trip={deleteTarget}
        open={Boolean(deleteTarget)}
        loading={isDeleting}
        error={deleteError}
        onConfirm={handleDelete}
        onClose={closeDelete}
      />

      <TripFinishModal
        trip={finishTarget}
        open={Boolean(finishTarget)}
        loading={isFinishing}
        error={finishError}
        onSubmit={handleFinish}
        onClose={closeFinish}
      />
    </PageContainer>
  );
};

export default TripListPage;
